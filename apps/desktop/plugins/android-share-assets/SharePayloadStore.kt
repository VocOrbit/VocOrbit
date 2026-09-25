package com.vocorbit

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences

data class SharePayload(
  val text: String,
  val source: String,
  val receivedAt: Long,
  val selectedWord: String? = null,
  val needsOverlayPermission: Boolean = false,
)

object SharePayloadStore {
  private const val PREFS_NAME = "vocorbit_share_intent"
  private const val KEY_TEXT = "text"
  private const val KEY_SOURCE = "source"
  private const val KEY_RECEIVED_AT = "received_at"
  private const val KEY_SELECTED_WORD = "selected_word"
  private const val KEY_NEEDS_OVERLAY_PERMISSION = "needs_overlay_permission"

  fun extractPayload(intent: Intent?): SharePayload? {
    if (intent == null) return null

    val source = when (intent.action) {
      Intent.ACTION_SEND -> "send"
      Intent.ACTION_PROCESS_TEXT -> "process_text"
      else -> return null
    }

    val rawText = when (intent.action) {
      Intent.ACTION_SEND -> intent.getStringExtra(Intent.EXTRA_TEXT)
      Intent.ACTION_PROCESS_TEXT -> intent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT)?.toString()
      else -> null
    }

    val normalizedText = normalizeText(rawText)
    if (normalizedText.isEmpty()) return null

    return SharePayload(
      text = normalizedText,
      source = source,
      receivedAt = System.currentTimeMillis(),
      selectedWord = null,
      needsOverlayPermission = false,
    )
  }

  fun persist(context: Context, payload: SharePayload) {
    prefs(context)
      .edit()
      .putString(KEY_TEXT, payload.text)
      .putString(KEY_SOURCE, payload.source)
      .putLong(KEY_RECEIVED_AT, payload.receivedAt)
      .putString(KEY_SELECTED_WORD, normalizeSelectedWord(payload.selectedWord))
      .putBoolean(KEY_NEEDS_OVERLAY_PERMISSION, payload.needsOverlayPermission)
      .apply()
  }

  fun consume(context: Context): SharePayload? {
    val preferences = prefs(context)
    val payload = read(preferences) ?: return null
    preferences.edit().clear().apply()
    return payload
  }

  private fun read(preferences: SharedPreferences): SharePayload? {
    val text = normalizeText(preferences.getString(KEY_TEXT, null))
    if (text.isEmpty()) return null

    val source = preferences.getString(KEY_SOURCE, null)?.trim().orEmpty()
    if (source.isEmpty()) return null

    val receivedAt = preferences.getLong(KEY_RECEIVED_AT, 0L)
    if (receivedAt <= 0L) return null

    return SharePayload(
      text = text,
      source = source,
      receivedAt = receivedAt,
      selectedWord = normalizeSelectedWord(preferences.getString(KEY_SELECTED_WORD, null)),
      needsOverlayPermission = preferences.getBoolean(KEY_NEEDS_OVERLAY_PERMISSION, false),
    )
  }

  private fun prefs(context: Context): SharedPreferences {
    return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
  }

  private fun normalizeText(value: String?): String {
    return value
      ?.replace("\\s+".toRegex(), " ")
      ?.trim()
      .orEmpty()
  }

  private fun normalizeSelectedWord(value: String?): String? {
    return value
      ?.trim()
      ?.lowercase()
      ?.takeIf { normalized -> normalized.isNotEmpty() }
  }
}
