package com.vocorbit

import android.content.Context
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.SocketTimeoutException
import java.net.URL
import java.net.URLEncoder

data class QuickLookupInsight(
  val word: String,
  val meaning: String,
  val partOfSpeech: String?,
  val sourceLang: String?,
  val targetLang: String?,
  val definitionL2: String?,
  val translationL1: String?,
  val whyThisSense: String?,
)

class QuickLookupApiException(
  val code: Code,
  override val message: String,
) : Exception(message) {
  enum class Code {
    MISSING_AUTH,
    INVALID_BASE_URL,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    INVALID_RESPONSE,
    REQUEST_FAILED,
    JOB_FAILED,
    TIMEOUT,
  }
}

private data class JsonResponse(
  val statusCode: Int,
  val json: JSONObject?,
  val rawBody: String,
)

private data class SessionHandle(
  var session: QuickLookupSession,
)

object QuickLookupApiClient {
  private const val CONNECT_TIMEOUT_MS = 12_000
  private const val READ_TIMEOUT_MS = 45_000
  private const val POLL_INTERVAL_MS = 250L
  private const val POLL_TIMEOUT_MS = 60_000L

  fun fetchBasicInsight(
    context: Context,
    sentence: String,
    selectedWord: String,
  ): QuickLookupInsight {
    val trimmedSentence = sentence.trim()
    val trimmedSelectedWord = selectedWord.trim()

    if (trimmedSentence.isEmpty() || trimmedSelectedWord.isEmpty()) {
      throw QuickLookupApiException(
        QuickLookupApiException.Code.INVALID_RESPONSE,
        "Quick lookup needs both a sentence and a selected word.",
      )
    }

    val session = QuickLookupSessionStore.read(context)
      ?: throw QuickLookupApiException(
        QuickLookupApiException.Code.MISSING_AUTH,
        "Sign in is required before using quick lookup.",
      )

    val handle = SessionHandle(session = session)
    val requestBody = JSONObject().apply {
      put("mode", "basic")
      put("sentence", trimmedSentence)
      put("selectedWord", trimmedSelectedWord)
      handle.session.l2Language?.let { put("sourceLang", it) }
      handle.session.l1Language?.let { put("targetLang", it) }
    }

    val directInsight = tryExplainDirect(context, handle, requestBody, trimmedSelectedWord)
    if (directInsight != null) {
      return directInsight
    }

    return enqueueAndPoll(context, handle, requestBody, trimmedSelectedWord)
  }

  private fun tryExplainDirect(
    context: Context,
    handle: SessionHandle,
    requestBody: JSONObject,
    fallbackWord: String,
  ): QuickLookupInsight? {
    return try {
      val response = authorizedJsonRequest(
        context = context,
        handle = handle,
        method = "POST",
        path = "/v1/word-insight/explain/direct",
        body = requestBody,
      )

      if (response.statusCode !in 200..299) {
        maybeThrowForStatus(response)
      }

      val data = unwrapEnvelopeObject(response)
      val status = readNonEmptyString(data, "status")
      if (status != "completed") {
        throw QuickLookupApiException(
          QuickLookupApiException.Code.INVALID_RESPONSE,
          "Quick lookup returned an unexpected direct response.",
        )
      }

      val result = data.optJSONObject("result")
        ?: throw QuickLookupApiException(
          QuickLookupApiException.Code.INVALID_RESPONSE,
          "Quick lookup returned an empty result.",
        )

      val insight = result.optJSONObject("insight")
        ?: throw QuickLookupApiException(
          QuickLookupApiException.Code.INVALID_RESPONSE,
          "Quick lookup returned an empty insight payload.",
        )

      parseInsight(insight, fallbackWord)
    } catch (error: QuickLookupApiException) {
      if (shouldFallbackToQueued(error)) {
        null
      } else {
        throw error
      }
    } catch (_: SocketTimeoutException) {
      null
    } catch (_: IOException) {
      null
    }
  }

  private fun enqueueAndPoll(
    context: Context,
    handle: SessionHandle,
    requestBody: JSONObject,
    fallbackWord: String,
  ): QuickLookupInsight {
    val enqueueResponse = authorizedJsonRequest(
      context = context,
      handle = handle,
      method = "POST",
      path = "/v1/word-insight/explain",
      body = requestBody,
    )

    if (enqueueResponse.statusCode !in 200..299) {
      maybeThrowForStatus(enqueueResponse)
    }

    val enqueueData = unwrapEnvelopeObject(enqueueResponse)
    val jobId = readNonEmptyString(enqueueData, "jobId")
      ?: throw QuickLookupApiException(
        QuickLookupApiException.Code.INVALID_RESPONSE,
        "Quick lookup did not receive a job id.",
      )

    val encodedJobId = URLEncoder.encode(jobId, "UTF-8")
    val deadline = System.currentTimeMillis() + POLL_TIMEOUT_MS

    while (System.currentTimeMillis() < deadline) {
      Thread.sleep(POLL_INTERVAL_MS)

      val pollResponse = authorizedJsonRequest(
        context = context,
        handle = handle,
        method = "GET",
        path = "/v1/word-insight/jobs/$encodedJobId?includeInsight=true",
        body = null,
      )

      if (pollResponse.statusCode !in 200..299) {
        maybeThrowForStatus(pollResponse)
      }

      val pollData = unwrapEnvelopeObject(pollResponse)
      when (readNonEmptyString(pollData, "status")) {
        "queued", "processing" -> continue
        "completed" -> {
          val result = pollData.optJSONObject("result")
            ?: throw QuickLookupApiException(
              QuickLookupApiException.Code.INVALID_RESPONSE,
              "Quick lookup job completed without a result.",
            )
          val insight = result.optJSONObject("insight")
            ?: throw QuickLookupApiException(
              QuickLookupApiException.Code.INVALID_RESPONSE,
              "Quick lookup job completed without insight data.",
            )
          return parseInsight(insight, fallbackWord)
        }
        "failed" -> {
          val errorMessage =
            readNonEmptyString(pollData, "errorMessage")
              ?: "VocOrbit could not finish this quick lookup."
          throw QuickLookupApiException(
            QuickLookupApiException.Code.JOB_FAILED,
            errorMessage,
          )
        }
        else -> {
          throw QuickLookupApiException(
            QuickLookupApiException.Code.INVALID_RESPONSE,
            "Quick lookup returned an unknown job status.",
          )
        }
      }
    }

    throw QuickLookupApiException(
      QuickLookupApiException.Code.TIMEOUT,
      "Quick lookup timed out while waiting for a result.",
    )
  }

  private fun parseInsight(payload: JSONObject, fallbackWord: String): QuickLookupInsight {
    val translationL1 = readNonEmptyString(payload, "translationL1")
    val definitionL2 = readNonEmptyString(payload, "definitionL2")
    val meaning = translationL1 ?: definitionL2 ?: readNonEmptyString(payload, "meaning")
      ?: throw QuickLookupApiException(
        QuickLookupApiException.Code.INVALID_RESPONSE,
        "Quick lookup did not return a usable meaning.",
      )

    return QuickLookupInsight(
      word = readNonEmptyString(payload, "word") ?: fallbackWord,
      meaning = meaning,
      partOfSpeech = readNonEmptyString(payload, "partOfSpeech"),
      sourceLang = readNonEmptyString(payload, "sourceLang"),
      targetLang = readNonEmptyString(payload, "targetLang"),
      definitionL2 = definitionL2,
      translationL1 = translationL1,
      whyThisSense =
        readNonEmptyString(payload, "whyThisSense")
          ?: readNonEmptyString(payload, "shortExplanation"),
    )
  }

  private fun authorizedJsonRequest(
    context: Context,
    handle: SessionHandle,
    method: String,
    path: String,
    body: JSONObject?,
  ): JsonResponse {
    val response = performJsonRequest(
      baseUrl = resolveBaseUrl(handle.session),
      method = method,
      path = path,
      accessToken = handle.session.accessToken,
      body = body,
    )

    if (response.statusCode != 401) {
      return response
    }

    if (!refreshSession(context, handle)) {
      return response
    }

    return performJsonRequest(
      baseUrl = resolveBaseUrl(handle.session),
      method = method,
      path = path,
      accessToken = handle.session.accessToken,
      body = body,
    )
  }

  private fun refreshSession(context: Context, handle: SessionHandle): Boolean {
    val refreshToken = handle.session.refreshToken?.trim().takeIf { value -> !value.isNullOrEmpty() }
      ?: return false

    val refreshBody = JSONObject().apply {
      put("refreshToken", refreshToken)
    }

    val response = try {
      performJsonRequest(
        baseUrl = resolveBaseUrl(handle.session),
        method = "POST",
        path = "/v1/auth/refresh",
        accessToken = null,
        body = refreshBody,
      )
    } catch (_: Throwable) {
      return false
    }

    if (response.statusCode !in 200..299) {
      return false
    }

    val data = try {
      unwrapEnvelopeObject(response)
    } catch (_: Throwable) {
      return false
    }

    val tokens = data.optJSONObject("tokens") ?: return false
    val accessToken = readNonEmptyString(tokens, "accessToken") ?: return false
    val nextRefreshToken = readNonEmptyString(tokens, "refreshToken") ?: refreshToken
    val user = data.optJSONObject("user")
    val nextUserId = readNonEmptyString(user, "id") ?: handle.session.userId

    val nextSession = handle.session.copy(
      accessToken = accessToken,
      refreshToken = nextRefreshToken,
      userId = nextUserId,
    )
    QuickLookupSessionStore.sync(context, nextSession.toJsonString())
    handle.session = nextSession
    return true
  }

  private fun performJsonRequest(
    baseUrl: String,
    method: String,
    path: String,
    accessToken: String?,
    body: JSONObject?,
  ): JsonResponse {
    val normalizedBaseUrl = baseUrl.removeSuffix("/")
    val url = URL("$normalizedBaseUrl$path")
    val connection = (url.openConnection() as HttpURLConnection).apply {
      requestMethod = method
      connectTimeout = CONNECT_TIMEOUT_MS
      readTimeout = READ_TIMEOUT_MS
      doInput = true
      instanceFollowRedirects = false
      setRequestProperty("Accept", "application/json")
      if (!accessToken.isNullOrBlank()) {
        setRequestProperty("Authorization", "Bearer $accessToken")
      }

      if (body != null) {
        doOutput = true
        setRequestProperty("Content-Type", "application/json; charset=utf-8")
      }
    }

    return try {
      if (body != null) {
        connection.outputStream.use { output ->
          output.write(body.toString().toByteArray(Charsets.UTF_8))
        }
      }

      val statusCode = connection.responseCode
      val responseStream =
        if (statusCode in 200..299) connection.inputStream else connection.errorStream
      val rawBody = responseStream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
      val json = rawBody.takeIf { value -> value.isNotBlank() }?.let { raw ->
        try {
          JSONObject(raw)
        } catch (_: Throwable) {
          null
        }
      }

      JsonResponse(
        statusCode = statusCode,
        json = json,
        rawBody = rawBody,
      )
    } finally {
      connection.disconnect()
    }
  }

  private fun resolveBaseUrl(session: QuickLookupSession): String {
    return session.resolvedBaseUrl()
      ?: throw QuickLookupApiException(
        QuickLookupApiException.Code.INVALID_BASE_URL,
        "VocOrbit quick lookup could not resolve a backend region.",
      )
  }

  private fun unwrapEnvelopeObject(response: JsonResponse): JSONObject {
    val json = response.json
      ?: throw QuickLookupApiException(
        QuickLookupApiException.Code.INVALID_RESPONSE,
        "VocOrbit returned an empty response.",
      )

    val data = json.opt("data")
    return when (data) {
      is JSONObject -> data
      null -> json
      else -> throw QuickLookupApiException(
        QuickLookupApiException.Code.INVALID_RESPONSE,
        "VocOrbit returned a malformed response envelope.",
      )
    }
  }

  private fun maybeThrowForStatus(response: JsonResponse) {
    val message = readErrorMessage(response)
    when (response.statusCode) {
      401 -> throw QuickLookupApiException(
        QuickLookupApiException.Code.UNAUTHORIZED,
        message.ifBlank { "Sign in is required before using quick lookup." },
      )
      403 -> throw QuickLookupApiException(
        QuickLookupApiException.Code.FORBIDDEN,
        message.ifBlank { "Your account cannot use basic insight right now." },
      )
      404 -> throw QuickLookupApiException(
        QuickLookupApiException.Code.NOT_FOUND,
        message.ifBlank { "VocOrbit quick lookup endpoint was not found." },
      )
      else -> throw QuickLookupApiException(
        QuickLookupApiException.Code.REQUEST_FAILED,
        message.ifBlank { "VocOrbit quick lookup request failed." },
      )
    }
  }

  private fun shouldFallbackToQueued(error: QuickLookupApiException): Boolean {
    return when (error.code) {
      QuickLookupApiException.Code.NOT_FOUND,
      QuickLookupApiException.Code.REQUEST_FAILED,
      QuickLookupApiException.Code.INVALID_RESPONSE,
      QuickLookupApiException.Code.TIMEOUT,
      -> true
      else -> false
    }
  }

  private fun readErrorMessage(response: JsonResponse): String {
    val errorObject = response.json?.optJSONObject("error")
    val structuredMessage = readNonEmptyString(errorObject, "message")
    if (!structuredMessage.isNullOrEmpty()) {
      return structuredMessage
    }

    return response.rawBody.trim().take(280)
  }

  private fun readNonEmptyString(json: JSONObject?, key: String): String? {
    if (json == null) return null
    return json.optString(key, "").trim().takeIf { value -> value.isNotEmpty() }
  }
}
