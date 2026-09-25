package com.vocorbit

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.ScrollView
import android.widget.TextView
import java.util.Locale
import java.util.concurrent.Executors
import kotlin.math.roundToInt

class QuickLookupOverlayService : Service() {
  private val executor = Executors.newSingleThreadExecutor()
  private val mainHandler = Handler(Looper.getMainLooper())
  private val windowManager by lazy { getSystemService(WINDOW_SERVICE) as WindowManager }

  private var overlayRoot: FrameLayout? = null
  private var selectedWord: String? = null
  private var isLookupRunning = false
  private var hasSelectableWords = false
  private lateinit var payload: SharePayload

  private lateinit var selectionValueView: TextView
  private lateinit var wordPickerView: QuickLookupWordPickerView
  private lateinit var lookupButton: Button
  private lateinit var loadingRow: LinearLayout
  private lateinit var statusCard: LinearLayout
  private lateinit var statusTitleView: TextView
  private lateinit var statusBodyView: TextView
  private lateinit var resultCard: LinearLayout
  private lateinit var resultWordView: TextView
  private lateinit var resultMeaningView: TextView
  private lateinit var resultMetaView: TextView
  private lateinit var resultDefinitionView: TextView
  private lateinit var resultWhyView: TextView

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val resolvedPayload = readPayloadFromIntent(intent)
    if (resolvedPayload == null) {
      stopSelf()
      return START_NOT_STICKY
    }

    payload = resolvedPayload
    removeOverlay()
    showOverlay()
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    removeOverlay()
    executor.shutdownNow()
    super.onDestroy()
  }

  private fun showOverlay() {
    val root = FrameLayout(this).apply {
      setBackgroundColor(Color.parseColor("#55000000"))
      setOnClickListener { dismissOverlay() }
      setPadding(dp(16), dp(24), dp(16), dp(24))
    }

    val card = buildCardView().apply {
      setOnClickListener { /* Consume clicks inside the sheet. */ }
    }

    root.addView(
      card,
      FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
        Gravity.BOTTOM,
      ),
    )

    windowManager.addView(root, buildLayoutParams())
    overlayRoot = root

    renderInitialState()
    if (!selectedWord.isNullOrBlank()) {
      runLookup()
    }
  }

  private fun removeOverlay() {
    overlayRoot?.let { root ->
      try {
        windowManager.removeView(root)
      } catch (_: Throwable) {
        // Ignore stale window state during rapid service teardown.
      }
    }
    overlayRoot = null
  }

  private fun dismissOverlay() {
    stopSelf()
  }

  private fun buildLayoutParams(): WindowManager.LayoutParams {
    val type =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
      } else {
        @Suppress("DEPRECATION")
        WindowManager.LayoutParams.TYPE_PHONE
      }

    return WindowManager.LayoutParams(
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.MATCH_PARENT,
      type,
      WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
      PixelFormat.TRANSLUCENT,
    ).apply {
      gravity = Gravity.TOP or Gravity.START
    }
  }

  private fun buildCardView(): View {
    return ScrollView(this).apply {
      isFillViewport = true
      background = roundedDrawable(
        backgroundColor = Color.parseColor("#F4F1E8"),
        cornerRadiusDp = 28f,
      )
      clipToOutline = true

      addView(
        LinearLayout(this@QuickLookupOverlayService).apply {
          orientation = LinearLayout.VERTICAL
          setPadding(dp(18), dp(16), dp(18), dp(18))

          addView(buildHeader())
          addSpace(this, 12)
          addView(buildWordCard())
          addView(buildLoadingRow())
          addView(buildStatusCard())
          addView(buildResultCard())
        },
        ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.WRAP_CONTENT,
        ),
      )
    }
  }

  private fun buildHeader(): View {
    return LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL

      addView(buildBrandView())

      addView(
        View(this@QuickLookupOverlayService),
        LinearLayout.LayoutParams(0, 1, 1f),
      )

      addView(
        TextView(this@QuickLookupOverlayService).apply {
          text = "X Close"
          setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
          setTypeface(typeface, Typeface.BOLD)
          setTextColor(Color.parseColor("#4B5651"))
          setPadding(dp(10), dp(8), dp(10), dp(8))
          contentDescription = "Close quick lookup"
          setOnClickListener { dismissOverlay() }
        },
      )
    }
  }

  private fun buildBrandView(): View {
    return LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL

      addView(
        ImageView(this@QuickLookupOverlayService).apply {
          setImageDrawable(applicationInfo.loadIcon(packageManager))
        },
        LinearLayout.LayoutParams(dp(28), dp(28)),
      )

      addSpaceHorizontal(this, 10)

      addView(
        TextView(this@QuickLookupOverlayService).apply {
          text = "VocOrbit"
          setTextSize(TypedValue.COMPLEX_UNIT_SP, 20f)
          setTypeface(typeface, Typeface.BOLD)
          setTextColor(Color.parseColor("#1E2623"))
        },
      )
    }
  }

  private fun buildWordCard(): View {
    val card = sectionCard("Tap a word")

    selectionValueView = bodyTextView("Tap one word in the sentence below.").apply {
      setTextColor(Color.parseColor("#42624B"))
      setTypeface(typeface, Typeface.BOLD)
    }
    card.addView(selectionValueView)
    addSpace(card, 12)

    wordPickerView = QuickLookupWordPickerView(this).apply {
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
      setTextColor(Color.parseColor("#1E2623"))
      setLineSpacing(dpFloat(4f), 1f)
      setPadding(dp(14), dp(14), dp(14), dp(14))
      background = roundedDrawable(
        backgroundColor = Color.parseColor("#F8F7F2"),
        strokeColor = Color.parseColor("#DDD9CF"),
        cornerRadiusDp = 18f,
      )
      selectionFillColor = Color.parseColor("#DDEBDD")
      selectionTextColor = Color.parseColor("#42624B")
      onWordSelected = { match ->
        if (!isLookupRunning) {
          selectedWord = match.normalized
          renderSelectedWord()
          hideStatus()
          hideResult()
          updateLookupEnabled()
        }
      }
    }
    card.addView(
      wordPickerView,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
      ),
    )
    addSpace(card, 14)

    lookupButton = Button(this).apply {
      text = "Get basic meaning"
      isAllCaps = false
      setTextColor(Color.parseColor("#F8F7F2"))
      setTypeface(typeface, Typeface.BOLD)
      background = roundedDrawable(
        backgroundColor = Color.parseColor("#42624B"),
        cornerRadiusDp = 18f,
      )
      setPadding(dp(14), dp(14), dp(14), dp(14))
      setOnClickListener { runLookup() }
    }
    card.addView(
      lookupButton,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
      ),
    )

    return card
  }

  private fun buildLoadingRow(): View {
    loadingRow = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL
      visibility = View.GONE
      val params = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
      )
      params.topMargin = dp(14)
      layoutParams = params

      addView(ProgressBar(this@QuickLookupOverlayService).apply { isIndeterminate = true })
      addSpaceHorizontal(this, 10)
      addView(bodyTextView("Checking the basic meaning..."))
    }
    return loadingRow
  }

  private fun buildStatusCard(): View {
    statusCard = sectionCard("Status").apply {
      visibility = View.GONE
    }
    statusTitleView = TextView(this).apply {
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f)
      setTypeface(typeface, Typeface.BOLD)
      setTextColor(Color.parseColor("#7A5332"))
    }
    statusBodyView = bodyTextView("").apply {
      setTextColor(Color.parseColor("#6A5A4D"))
    }
    statusCard.addView(statusTitleView)
    addSpace(statusCard, 6)
    statusCard.addView(statusBodyView)
    return statusCard
  }

  private fun buildResultCard(): View {
    resultCard = sectionCard("Basic meaning").apply {
      visibility = View.GONE
    }
    resultWordView = TextView(this).apply {
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 22f)
      setTypeface(typeface, Typeface.BOLD)
      setTextColor(Color.parseColor("#1E2623"))
    }
    resultMeaningView = TextView(this).apply {
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f)
      setTypeface(typeface, Typeface.BOLD)
      setTextColor(Color.parseColor("#42624B"))
    }
    resultMetaView = bodyTextView("").apply {
      visibility = View.GONE
    }
    resultDefinitionView = bodyTextView("").apply {
      visibility = View.GONE
      setTextColor(Color.parseColor("#2F3432"))
    }
    resultWhyView = bodyTextView("").apply {
      visibility = View.GONE
    }

    resultCard.addView(resultWordView)
    addSpace(resultCard, 6)
    resultCard.addView(resultMeaningView)
    addSpace(resultCard, 8)
    resultCard.addView(resultMetaView)
    addSpace(resultCard, 10)
    resultCard.addView(resultDefinitionView)
    addSpace(resultCard, 10)
    resultCard.addView(resultWhyView)
    return resultCard
  }

  private fun renderInitialState() {
    val words = QuickLookupTextSupport.extractUniqueWords(payload.text, limit = 18)
    hasSelectableWords = words.isNotEmpty()
    selectedWord = QuickLookupTextSupport.normalizeSelectedWord(payload.selectedWord)
      ?.takeIf { value -> words.any { word -> word.normalized == value } }
      ?: if (words.size == 1) words.first().normalized else null

    wordPickerView.setContent(payload.text, selectedWord)
    renderSelectedWord()
    updateLookupEnabled()
  }

  private fun renderSelectedWord() {
    val selected = selectedWord
    selectionValueView.text =
      when {
        !hasSelectableWords -> "No selectable words were found in this text."
        selected.isNullOrBlank() -> "Tap one word in the sentence below."
        else -> "Selected word: $selected"
      }

    wordPickerView.setSelectedWord(selected)
  }

  private fun updateLookupEnabled() {
    val enabled = hasSelectableWords && !selectedWord.isNullOrBlank() && !isLookupRunning
    lookupButton.isEnabled = enabled
    lookupButton.alpha = if (enabled) 1f else 0.45f
  }

  private fun runLookup() {
    val selected = selectedWord ?: return
    if (isLookupRunning) return

    isLookupRunning = true
    updateLookupEnabled()
    setLoadingVisible(true)
    hideStatus()
    hideResult()

    val sentence = QuickLookupTextSupport.buildContextSnippet(payload.text, selected, maxLength = 220)
    executor.execute {
      try {
        val insight = QuickLookupApiClient.fetchBasicInsight(
          context = applicationContext,
          sentence = sentence,
          selectedWord = selected,
        )
        mainHandler.post {
          isLookupRunning = false
          setLoadingVisible(false)
          updateLookupEnabled()
          showInsight(insight)
        }
      } catch (error: Throwable) {
        val uiError = resolveUiError(error)
        mainHandler.post {
          isLookupRunning = false
          setLoadingVisible(false)
          updateLookupEnabled()
          showStatus(uiError.title, uiError.body)
        }
      }
    }
  }

  private fun resolveUiError(error: Throwable): UiError {
    if (error is QuickLookupApiException) {
      return when (error.code) {
        QuickLookupApiException.Code.MISSING_AUTH,
        QuickLookupApiException.Code.UNAUTHORIZED,
        -> UiError(
          title = "Sign in required",
          body = "Open VocOrbit and sign in again, then retry quick lookup.",
        )

        QuickLookupApiException.Code.FORBIDDEN -> UiError(
          title = "Basic credits required",
          body = error.message.ifBlank {
            "Your account cannot run basic insight right now."
          },
        )

        QuickLookupApiException.Code.TIMEOUT -> UiError(
          title = "Lookup timed out",
          body = "This quick lookup took too long. Try again or continue in VocOrbit.",
        )

        QuickLookupApiException.Code.NOT_FOUND,
        QuickLookupApiException.Code.REQUEST_FAILED,
        QuickLookupApiException.Code.INVALID_RESPONSE,
        QuickLookupApiException.Code.INVALID_BASE_URL,
        QuickLookupApiException.Code.JOB_FAILED,
        -> UiError(
          title = "Lookup failed",
          body = error.message.ifBlank { "VocOrbit could not finish this quick lookup." },
        )
      }
    }

    return UiError(
      title = "Lookup failed",
      body = error.message?.ifBlank { "VocOrbit could not finish this quick lookup." }
        ?: "VocOrbit could not finish this quick lookup.",
    )
  }

  private fun showInsight(insight: QuickLookupInsight) {
    resultCard.visibility = View.VISIBLE
    resultWordView.text = insight.word.uppercase(Locale.US)
    resultMeaningView.text = insight.translationL1 ?: insight.meaning

    val metaParts = mutableListOf<String>()
    insight.partOfSpeech?.takeIf { it.isNotBlank() }?.let { metaParts.add(it) }
    resultMetaView.visibility = if (metaParts.isEmpty()) View.GONE else View.VISIBLE
    resultMetaView.text = metaParts.joinToString("  •  ")

    resultDefinitionView.visibility = if (insight.definitionL2.isNullOrBlank()) View.GONE else View.VISIBLE
    resultDefinitionView.text = insight.definitionL2

    resultWhyView.visibility = if (insight.whyThisSense.isNullOrBlank()) View.GONE else View.VISIBLE
    resultWhyView.text = insight.whyThisSense
  }

  private fun hideResult() {
    resultCard.visibility = View.GONE
  }

  private fun showStatus(title: String, body: String) {
    statusCard.visibility = View.VISIBLE
    statusTitleView.text = title
    statusBodyView.text = body
  }

  private fun hideStatus() {
    statusCard.visibility = View.GONE
  }

  private fun setLoadingVisible(visible: Boolean) {
    loadingRow.visibility = if (visible) View.VISIBLE else View.GONE
  }

  private fun sectionCard(title: String): LinearLayout {
    return LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      background = roundedDrawable(
        backgroundColor = Color.WHITE,
        strokeColor = Color.parseColor("#DDD9CF"),
        cornerRadiusDp = 24f,
      )
      setPadding(dp(16), dp(16), dp(16), dp(16))
      val params = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
      )
      params.topMargin = dp(14)
      layoutParams = params

      addView(
        TextView(this@QuickLookupOverlayService).apply {
          text = title
          setTextSize(TypedValue.COMPLEX_UNIT_SP, 17f)
          setTypeface(typeface, Typeface.BOLD)
          setTextColor(Color.parseColor("#1E2623"))
        },
      )
      addSpace(this, 8)
    }
  }

  private fun bodyTextView(text: String): TextView {
    return TextView(this).apply {
      this.text = text
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
      setTextColor(Color.parseColor("#59625D"))
    }
  }

  private fun addSpace(parent: LinearLayout, dpValue: Int) {
    parent.addView(
      View(this),
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        dp(dpValue),
      ),
    )
  }

  private fun addSpaceHorizontal(parent: LinearLayout, dpValue: Int) {
    parent.addView(
      View(this),
      LinearLayout.LayoutParams(dp(dpValue), 1),
    )
  }

  private fun roundedDrawable(
    backgroundColor: Int,
    strokeColor: Int? = null,
    cornerRadiusDp: Float,
  ): GradientDrawable {
    return GradientDrawable().apply {
      shape = GradientDrawable.RECTANGLE
      setColor(backgroundColor)
      cornerRadius = dpFloat(cornerRadiusDp)
      if (strokeColor != null) {
        setStroke(dp(1), strokeColor)
      }
    }
  }

  private fun dp(value: Int): Int {
    return (value * resources.displayMetrics.density).roundToInt()
  }

  private fun dpFloat(value: Float): Float {
    return value * resources.displayMetrics.density
  }

  private data class UiError(
    val title: String,
    val body: String,
  )

  companion object {
    private const val EXTRA_TEXT = "vocorbit.overlay.text"
    private const val EXTRA_SOURCE = "vocorbit.overlay.source"
    private const val EXTRA_RECEIVED_AT = "vocorbit.overlay.received_at"
    private const val EXTRA_SELECTED_WORD = "vocorbit.overlay.selected_word"
    private const val EXTRA_NEEDS_OVERLAY_PERMISSION = "vocorbit.overlay.needs_overlay_permission"

    fun createIntent(context: Context, payload: SharePayload): Intent {
      return Intent(context, QuickLookupOverlayService::class.java).apply {
        putExtra(EXTRA_TEXT, payload.text)
        putExtra(EXTRA_SOURCE, payload.source)
        putExtra(EXTRA_RECEIVED_AT, payload.receivedAt)
        putExtra(EXTRA_SELECTED_WORD, payload.selectedWord)
        putExtra(EXTRA_NEEDS_OVERLAY_PERMISSION, payload.needsOverlayPermission)
      }
    }

    private fun readPayloadFromIntent(intent: Intent?): SharePayload? {
      if (intent == null) return null

      val text = QuickLookupTextSupport.normalizeText(intent.getStringExtra(EXTRA_TEXT))
      val source = intent.getStringExtra(EXTRA_SOURCE)?.trim().orEmpty()
      val receivedAt = intent.getLongExtra(EXTRA_RECEIVED_AT, 0L)
      val selectedWord = QuickLookupTextSupport.normalizeSelectedWord(
        intent.getStringExtra(EXTRA_SELECTED_WORD),
      )

      if (text.isEmpty() || source.isEmpty() || receivedAt <= 0L) return null
      return SharePayload(
        text = text,
        source = source,
        receivedAt = receivedAt,
        selectedWord = selectedWord,
        needsOverlayPermission = intent.getBooleanExtra(EXTRA_NEEDS_OVERLAY_PERMISSION, false),
      )
    }
  }
}
