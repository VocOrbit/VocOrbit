package com.vocorbit

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.text.Spannable
import android.text.SpannableStringBuilder
import android.text.style.BackgroundColorSpan
import android.text.style.ForegroundColorSpan
import android.text.style.StyleSpan
import android.text.style.UnderlineSpan
import android.util.AttributeSet
import android.view.MotionEvent
import androidx.appcompat.widget.AppCompatTextView

class QuickLookupWordPickerView @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null,
) : AppCompatTextView(context, attrs) {
  var onWordSelected: ((QuickLookupWordMatch) -> Unit)? = null
  var selectionFillColor: Int = Color.parseColor("#DDEBDD")
  var selectionTextColor: Int = Color.parseColor("#42624B")

  private var contentText = ""
  private var wordMatches = emptyList<QuickLookupWordMatch>()
  private var selectedWord: String? = null
  private var selectedRangeStart: Int? = null

  init {
    isClickable = true
    isFocusable = true
    highlightColor = Color.TRANSPARENT
  }

  fun setContent(text: String, selectedWord: String?) {
    contentText = QuickLookupTextSupport.normalizeText(text)
    wordMatches = QuickLookupTextSupport.extractWordMatches(contentText)
    updateSelection(selectedWord, preserveRange = false)
  }

  fun setSelectedWord(selectedWord: String?) {
    updateSelection(selectedWord, preserveRange = true)
  }

  override fun onTouchEvent(event: MotionEvent): Boolean {
    when (event.actionMasked) {
      MotionEvent.ACTION_UP -> {
        val resolvedMatch = resolveMatchForOffset(getOffsetForPosition(event.x, event.y)) ?: return performClick()
        selectedWord = resolvedMatch.normalized
        selectedRangeStart = resolvedMatch.start
        renderText()
        onWordSelected?.invoke(resolvedMatch)
        performClick()
        return true
      }

      MotionEvent.ACTION_DOWN -> return true
    }

    return super.onTouchEvent(event)
  }

  override fun performClick(): Boolean {
    super.performClick()
    return true
  }

  private fun updateSelection(nextSelectedWord: String?, preserveRange: Boolean) {
    selectedWord = QuickLookupTextSupport.normalizeSelectedWord(nextSelectedWord)
    selectedRangeStart =
      if (preserveRange) {
        wordMatches.firstOrNull { match ->
          match.start == selectedRangeStart && match.normalized == selectedWord
        }?.start ?: wordMatches.firstOrNull { it.normalized == selectedWord }?.start
      } else {
        wordMatches.firstOrNull { it.normalized == selectedWord }?.start
      }

    renderText()
  }

  private fun renderText() {
    if (contentText.isEmpty()) {
      text = ""
      return
    }

    val builder = SpannableStringBuilder(contentText)
    wordMatches.forEach { match ->
      builder.setSpan(
        UnderlineSpan(),
        match.start,
        match.end,
        Spannable.SPAN_EXCLUSIVE_EXCLUSIVE,
      )
    }

    val highlightedMatch =
      wordMatches.firstOrNull { it.start == selectedRangeStart }
        ?: wordMatches.firstOrNull { it.normalized == selectedWord }

    if (highlightedMatch != null) {
      builder.setSpan(
        BackgroundColorSpan(selectionFillColor),
        highlightedMatch.start,
        highlightedMatch.end,
        Spannable.SPAN_EXCLUSIVE_EXCLUSIVE,
      )
      builder.setSpan(
        ForegroundColorSpan(selectionTextColor),
        highlightedMatch.start,
        highlightedMatch.end,
        Spannable.SPAN_EXCLUSIVE_EXCLUSIVE,
      )
      builder.setSpan(
        StyleSpan(Typeface.BOLD),
        highlightedMatch.start,
        highlightedMatch.end,
        Spannable.SPAN_EXCLUSIVE_EXCLUSIVE,
      )
    }

    text = builder
  }

  private fun resolveMatchForOffset(offset: Int, maxDistance: Int = 6): QuickLookupWordMatch? {
    if (wordMatches.isEmpty()) return null

    wordMatches.firstOrNull { match ->
      offset in match.start until match.end
    }?.let { return it }

    var bestMatch: QuickLookupWordMatch? = null
    var bestDistance = Int.MAX_VALUE

    for (match in wordMatches) {
      val distance =
        when {
          offset < match.start -> match.start - offset
          offset >= match.end -> offset - (match.end - 1)
          else -> 0
        }

      if (distance < bestDistance) {
        bestDistance = distance
        bestMatch = match
      }
    }

    return bestMatch?.takeIf { bestDistance <= maxDistance }
  }
}
