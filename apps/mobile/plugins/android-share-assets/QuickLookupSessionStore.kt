package com.vocorbit

import android.content.Context
import org.json.JSONObject

data class QuickLookupSession(
  val accessToken: String,
  val refreshToken: String?,
  val userId: String?,
  val l1Language: String?,
  val l2Language: String?,
  val homeRegion: String?,
  val backendBaseUrl: String?,
) {
  fun resolvedBaseUrl(): String? {
    backendBaseUrl
      ?.trim()
      ?.removeSuffix("/")
      ?.takeIf { value -> value.isNotEmpty() }
      ?.let { return it }

    return when (homeRegion?.trim()?.lowercase()) {
      "na" -> "https://us.vocorbit.com"
      "eu" -> "https://eu.vocorbit.com"
      "apac" -> "https://apac.vocorbit.com"
      else -> null
    }
  }

  fun toJsonString(): String {
    return JSONObject().apply {
      put("accessToken", accessToken)
      refreshToken?.let { put("refreshToken", it) }
      userId?.let { put("userId", it) }
      l1Language?.let { put("l1Language", it) }
      l2Language?.let { put("l2Language", it) }
      homeRegion?.let { put("homeRegion", it) }
      backendBaseUrl?.let { put("backendBaseUrl", it) }
    }.toString()
  }
}

object QuickLookupSessionStore {
  private const val PREFS_NAME = "vocorbit_quick_lookup"
  private const val KEY_SESSION_JSON = "session_json"

  fun sync(context: Context, sessionJson: String?) {
    val preferences = prefs(context)

    if (sessionJson.isNullOrBlank()) {
      preferences.edit().remove(KEY_SESSION_JSON).apply()
      return
    }

    val parsedSession = parseSession(sessionJson)
    if (parsedSession == null) {
      preferences.edit().remove(KEY_SESSION_JSON).apply()
      return
    }

    preferences.edit().putString(KEY_SESSION_JSON, parsedSession.toJsonString()).apply()
  }

  fun read(context: Context): QuickLookupSession? {
    val storedValue = prefs(context).getString(KEY_SESSION_JSON, null) ?: return null
    return parseSession(storedValue)
  }

  private fun parseSession(rawValue: String): QuickLookupSession? {
    return try {
      val json = JSONObject(rawValue)
      val accessToken = readNonEmptyString(json, "accessToken") ?: return null

      QuickLookupSession(
        accessToken = accessToken,
        refreshToken = readNonEmptyString(json, "refreshToken"),
        userId = readNonEmptyString(json, "userId"),
        l1Language = readNonEmptyString(json, "l1Language"),
        l2Language = readNonEmptyString(json, "l2Language"),
        homeRegion = readNonEmptyString(json, "homeRegion"),
        backendBaseUrl = readNonEmptyString(json, "backendBaseUrl"),
      )
    } catch (_: Throwable) {
      null
    }
  }

  private fun prefs(context: Context) =
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  private fun readNonEmptyString(json: JSONObject, key: String): String? {
    return json.optString(key, "").trim().takeIf { value -> value.isNotEmpty() }
  }
}
