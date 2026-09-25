import Foundation

enum DictionaryAPIError: LocalizedError {
  case missingAuthToken
  case invalidBackendBaseURL
  case unauthorized
  case forbidden
  case notFound
  case invalidResponse
  case requestFailed(String)
  case jobFailed(String)
  case timeout

  var errorDescription: String? {
    switch self {
    case .missingAuthToken:
      return "Session not found. Please sign in again from the app."
    case .invalidBackendBaseURL:
      return "Backend URL configuration is invalid."
    case .unauthorized:
      return "Authorization failed. Please sign in again."
    case .forbidden:
      return "You do not have permission for this action."
    case .notFound:
      return "Request not found."
    case .invalidResponse:
      return "Received an invalid response from the server."
    case let .requestFailed(message):
      return message
    case let .jobFailed(message):
      return "Word analysis failed: \(message)"
    case .timeout:
      return "Word analysis timed out."
    }
  }
}

struct WordInsightPayload: Decodable {
  let word: String
  let surface: String?
  let lemma: String
  let phonetic: String?
  let sourceLang: String
  let targetLang: String
  let partOfSpeech: String
  let sourceMeaning: String?
  let definitionL2: String?
  let translationL1: String?
  let whyThisSense: String?
  let meaning: String
  let shortExplanation: String
  let exampleSentence: String
  let translatedExample: String
  let synonyms: [String]
  let confidence: Double
}

private struct APIEnvelope<T: Decodable>: Decodable {
  let data: T
}

private struct APIErrorEnvelope: Decodable {
  struct APIErrorNode: Decodable {
    let code: String?
    let message: String?
  }

  let error: APIErrorNode?
}

private struct ExplainEnqueueInput: Encodable {
  let mode: String
  let sentence: String
  let selectedWord: String
  let sourceLang: String?
  let targetLang: String?
}

private struct ExplainEnqueueResponse: Decodable {
  let jobId: String
}

private struct ExplainDirectResult: Decodable {
  let insight: WordInsightPayload
}

private struct ExplainDirectResponse: Decodable {
  let status: String
  let result: ExplainDirectResult?
}

private struct ExplainJobResult: Decodable {
  let insight: WordInsightPayload
}

private struct ExplainJobResponse: Decodable {
  let status: String
  let result: ExplainJobResult?
  let errorCode: String?
  let errorMessage: String?
}

private struct ExplainJobSnapshot: Decodable {
  let id: String
  let status: String
  let errorCode: String?
  let errorMessage: String?
}

private struct RefreshTokenInput: Encodable {
  let refreshToken: String
}

private struct RefreshSessionPayload: Decodable {
  struct Tokens: Decodable {
    let accessToken: String?
    let refreshToken: String?
  }

  struct User: Decodable {
    let id: String?
  }

  let user: User?
  let tokens: Tokens
}

private struct WebSocketEnvelope: Decodable {
  let type: String
  let code: String?
  let data: ExplainJobSnapshot?
}

private enum WebSocketWaitOutcome {
  case completed(WordInsightPayload)
  case failed(DictionaryAPIError)
  case fallback
}

enum DictionaryAPIClient {
  private static let defaultBaseURL = "https://eu.vocorbit.com"
  private static let backendBaseURLKey = "VOCORBIT_BACKEND_BASE_URL"
  private static let webSocketWaitTimeoutNanos: UInt64 = 2_000_000_000
  private static let jobPollMaxAttempt = 60
  private static let jobPollDelayNanos: UInt64 = 300_000_000
  private static var lastRequestURLForDebug = "-"

  static func debugRequestDestination() -> String {
    let keychainBase = KeychainHelper.readBackendBaseURL()?.trimmingCharacters(in: .whitespacesAndNewlines)
    let keychainRegionBase = resolveRegionBaseURL(for: KeychainHelper.readHomeRegionCode())
    let infoPlistBase =
      (Bundle.main.object(forInfoDictionaryKey: backendBaseURLKey) as? String)?
      .trimmingCharacters(in: .whitespacesAndNewlines)

    let effectiveBase =
      (keychainBase?.isEmpty == false ? keychainBase : nil) ??
      keychainRegionBase ??
      (infoPlistBase?.isEmpty == false ? infoPlistBase : nil) ??
      defaultBaseURL

    return "Base: \(effectiveBase)\nLast request: \(lastRequestURLForDebug)"
  }

  static func fetchBasicInsight(
    sentence: String,
    selectedWord: String,
  ) async throws -> WordInsightPayload {
    guard let session = KeychainHelper.readSession() else {
      throw DictionaryAPIError.missingAuthToken
    }
    guard let accessToken = normalizeToken(session.accessToken) else {
      throw DictionaryAPIError.missingAuthToken
    }

    let resolvedLanguagePreferences = languagePreferences(from: session) ?? KeychainHelper.readLanguagePreferences()

    do {
      return try await fetchBasicInsightWithAccessToken(
        accessToken: accessToken,
        sentence: sentence,
        selectedWord: selectedWord,
        languagePreferences: resolvedLanguagePreferences,
      )
    } catch let error as DictionaryAPIError {
      guard case .unauthorized = error else { throw error }
    } catch {
      throw error
    }

    guard let refreshToken = normalizeToken(session.refreshToken) else {
      throw DictionaryAPIError.unauthorized
    }

    let refreshedSession = try await refreshSession(
      refreshToken: refreshToken,
      currentSession: session,
    )
    KeychainHelper.persistSession(refreshedSession)

    return try await fetchBasicInsightWithAccessToken(
      accessToken: refreshedSession.accessToken,
      sentence: sentence,
      selectedWord: selectedWord,
      languagePreferences: languagePreferences(from: refreshedSession) ?? resolvedLanguagePreferences,
    )
  }

  private static func fetchBasicInsightWithAccessToken(
    accessToken: String,
    sentence: String,
    selectedWord: String,
    languagePreferences: (l1Language: String, l2Language: String)?,
  ) async throws -> WordInsightPayload {
    do {
      return try await explainDirect(
        accessToken: accessToken,
        sentence: sentence,
        selectedWord: selectedWord,
        sourceLang: languagePreferences?.l2Language,
        targetLang: languagePreferences?.l1Language,
      )
    } catch let error as DictionaryAPIError {
      guard shouldFallbackToQueuedAfterDirect(error) else {
        throw error
      }
    }

    let enqueue = try await enqueueExplainJob(
      accessToken: accessToken,
      sentence: sentence,
      selectedWord: selectedWord,
      sourceLang: languagePreferences?.l2Language,
      targetLang: languagePreferences?.l1Language,
    )

    let wsOutcome = await waitForJobViaWebSocket(
      accessToken: accessToken,
      jobId: enqueue.jobId,
    )
    switch wsOutcome {
    case let .completed(insight):
      return insight
    case let .failed(error):
      throw error
    case .fallback:
      break
    }

    return try await pollJobUntilFinished(
      accessToken: accessToken,
      jobId: enqueue.jobId,
    )
  }

  private static func shouldFallbackToQueuedAfterDirect(_ error: DictionaryAPIError) -> Bool {
    switch error {
    case .notFound:
      return true
    case .timeout, .invalidResponse:
      return true
    case let .requestFailed(message):
      let lowered = message.lowercased()
      if lowered.contains("http 5") {
        return true
      }
      if lowered.contains("model_output_") || lowered.contains("word_insight_") {
        return true
      }
      return false
    default:
      return false
    }
  }

  private static func refreshSession(
    refreshToken: String,
    currentSession: SharedAuthSession,
  ) async throws -> SharedAuthSession {
    let requestBody = RefreshTokenInput(refreshToken: refreshToken)
    let bodyData = try JSONEncoder().encode(requestBody)
    let request = try buildRequest(
      path: "/v1/auth/refresh",
      method: "POST",
      accessToken: nil,
      targetLang: currentSession.l1Language,
      body: bodyData,
    )
    let data = try await execute(request)
    let payload = try decodeEnvelope(RefreshSessionPayload.self, from: data)

    guard let refreshedAccessToken = normalizeToken(payload.tokens.accessToken) else {
      throw DictionaryAPIError.invalidResponse
    }

    let refreshedRefreshToken = normalizeToken(payload.tokens.refreshToken) ?? refreshToken
    let refreshedUserId = normalizeOptional(payload.user?.id) ?? normalizeOptional(currentSession.userId)

    return SharedAuthSession(
      accessToken: refreshedAccessToken,
      refreshToken: refreshedRefreshToken,
      userId: refreshedUserId,
      l1Language: normalizeLanguageTag(currentSession.l1Language),
      l2Language: normalizeLanguageTag(currentSession.l2Language),
      homeRegion: normalizeOptional(currentSession.homeRegion),
      backendBaseUrl: normalizeBackendBaseUrl(currentSession.backendBaseUrl),
    )
  }

  private static func languagePreferences(
    from session: SharedAuthSession,
  ) -> (l1Language: String, l2Language: String)? {
    guard let l1 = normalizeLanguageTag(session.l1Language) else { return nil }
    guard let l2 = normalizeLanguageTag(session.l2Language) else { return nil }
    return (l1Language: l1, l2Language: l2)
  }

  private static func normalizeLanguageTag(_ value: String?) -> String? {
    guard let value else { return nil }
    let normalized = value.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    return normalized.isEmpty ? nil : normalized
  }

  private static func normalizeToken(_ value: String?) -> String? {
    guard let value else { return nil }
    let normalized = value.trimmingCharacters(in: .whitespacesAndNewlines)
    return normalized.isEmpty ? nil : normalized
  }

  private static func normalizeOptional(_ value: String?) -> String? {
    guard let value else { return nil }
    let normalized = value.trimmingCharacters(in: .whitespacesAndNewlines)
    return normalized.isEmpty ? nil : normalized
  }

  private static func normalizeBackendBaseUrl(_ value: String?) -> String? {
    guard let value else { return nil }
    let normalized = value.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !normalized.isEmpty else { return nil }
    return normalized.hasSuffix("/") ? String(normalized.dropLast()) : normalized
  }

  private static func enqueueExplainJob(
    accessToken: String,
    sentence: String,
    selectedWord: String,
    sourceLang: String?,
    targetLang: String?,
  ) async throws -> ExplainEnqueueResponse {
    let requestBody = ExplainEnqueueInput(
      mode: "basic",
      sentence: sentence,
      selectedWord: selectedWord,
      sourceLang: sourceLang,
      targetLang: targetLang,
    )
    let bodyData = try JSONEncoder().encode(requestBody)
    let request = try buildRequest(
      path: "/v1/word-insight/explain",
      method: "POST",
      accessToken: accessToken,
      targetLang: targetLang,
      body: bodyData,
    )
    let data = try await execute(request)
    return try decodeEnvelope(ExplainEnqueueResponse.self, from: data)
  }

  private static func explainDirect(
    accessToken: String,
    sentence: String,
    selectedWord: String,
    sourceLang: String?,
    targetLang: String?,
  ) async throws -> WordInsightPayload {
    let requestBody = ExplainEnqueueInput(
      mode: "basic",
      sentence: sentence,
      selectedWord: selectedWord,
      sourceLang: sourceLang,
      targetLang: targetLang,
    )
    let bodyData = try JSONEncoder().encode(requestBody)
    let request = try buildRequest(
      path: "/v1/word-insight/explain/direct",
      method: "POST",
      accessToken: accessToken,
      targetLang: targetLang,
      body: bodyData,
    )
    let data = try await execute(request)
    let payload = try decodeEnvelope(ExplainDirectResponse.self, from: data)

    guard payload.status == "completed", let insight = payload.result?.insight else {
      throw DictionaryAPIError.invalidResponse
    }
    return insight
  }

  private static func pollJobUntilFinished(
    accessToken: String,
    jobId: String,
  ) async throws -> WordInsightPayload {
    for attempt in 0..<jobPollMaxAttempt {
      let job = try await fetchExplainJob(
        accessToken: accessToken,
        jobId: jobId,
        includeInsight: true,
      )

      switch job.status {
      case "completed":
        guard let insight = job.result?.insight else {
          throw DictionaryAPIError.invalidResponse
        }
        return insight
      case "failed":
        let message = job.errorMessage ?? job.errorCode ?? "unknown_error"
        throw DictionaryAPIError.jobFailed(message)
      default:
        if attempt == jobPollMaxAttempt - 1 {
          throw DictionaryAPIError.timeout
        }
        try await Task.sleep(nanoseconds: jobPollDelayNanos)
      }
    }

    throw DictionaryAPIError.timeout
  }

  private static func waitForJobViaWebSocket(
    accessToken: String,
    jobId: String,
  ) async -> WebSocketWaitOutcome {
    do {
      let wsURL = try buildWordInsightJobsWebSocketURL(accessToken: accessToken)
      let socket = URLSession.shared.webSocketTask(with: wsURL)
      socket.resume()
      defer {
        socket.cancel(with: .normalClosure, reason: nil)
      }

      let deadline = DispatchTime.now().uptimeNanoseconds + webSocketWaitTimeoutNanos
      var didReceiveReady = false
      var didSendSubscribe = false

      while DispatchTime.now().uptimeNanoseconds < deadline {
        let now = DispatchTime.now().uptimeNanoseconds
        let remaining = max(1, deadline - now)
        let message = try await receiveWebSocketMessage(socket, timeoutNanos: remaining)
        guard let envelope = decodeWebSocketEnvelope(from: message) else {
          continue
        }

        if envelope.type == "error" {
          // WS auth can race with immediate subscribe in share extension process.
          // Fall back to polling and let HTTP status decide final auth state.
          return .fallback
        }

        if envelope.type == "ready" {
          didReceiveReady = true
          if !didSendSubscribe {
            try await sendWebSocketSubscribe(socket, jobId: jobId)
            didSendSubscribe = true
          }
          continue
        }

        if envelope.type == "subscribed" {
          didSendSubscribe = true
          continue
        }

        if !didSendSubscribe {
          if !didReceiveReady {
            continue
          }
          try await sendWebSocketSubscribe(socket, jobId: jobId)
          didSendSubscribe = true
          continue
        }

        guard envelope.type == "word_insight_job" else {
          continue
        }
        guard let snapshot = envelope.data, snapshot.id == jobId else {
          continue
        }
        guard snapshot.status == "completed" || snapshot.status == "failed" else {
          continue
        }

        do {
          let job = try await fetchExplainJob(
            accessToken: accessToken,
            jobId: jobId,
            includeInsight: true,
          )
          if job.status == "completed" {
            guard let insight = job.result?.insight else {
              return .failed(.invalidResponse)
            }
            return .completed(insight)
          }
          let message = job.errorMessage ?? job.errorCode ?? "unknown_error"
          return .failed(.jobFailed(message))
        } catch is DictionaryAPIError {
          if snapshot.status == "failed" {
            let message = snapshot.errorMessage ?? snapshot.errorCode ?? "unknown_error"
            return .failed(.jobFailed(message))
          }
          return .fallback
        } catch {
          if snapshot.status == "failed" {
            let message = snapshot.errorMessage ?? snapshot.errorCode ?? "unknown_error"
            return .failed(.jobFailed(message))
          }
          return .fallback
        }
      }

      return .fallback
    } catch is DictionaryAPIError {
      return .fallback
    } catch {
      return .fallback
    }
  }

  private static func sendWebSocketSubscribe(
    _ socket: URLSessionWebSocketTask,
    jobId: String,
  ) async throws {
    let payload: [String: String] = [
      "type": "subscribe",
      "jobId": jobId,
    ]
    let data = try JSONSerialization.data(withJSONObject: payload, options: [])
    guard let text = String(data: data, encoding: .utf8) else {
      throw DictionaryAPIError.invalidResponse
    }
    try await socket.send(.string(text))
  }

  private static func receiveWebSocketMessage(
    _ socket: URLSessionWebSocketTask,
    timeoutNanos: UInt64,
  ) async throws -> URLSessionWebSocketTask.Message {
    try await withThrowingTaskGroup(of: URLSessionWebSocketTask.Message.self) { group in
      group.addTask {
        try await socket.receive()
      }
      group.addTask {
        try await Task.sleep(nanoseconds: timeoutNanos)
        throw DictionaryAPIError.timeout
      }

      guard let message = try await group.next() else {
        throw DictionaryAPIError.timeout
      }
      group.cancelAll()
      return message
    }
  }

  private static func decodeWebSocketEnvelope(
    from message: URLSessionWebSocketTask.Message,
  ) -> WebSocketEnvelope? {
    switch message {
    case let .string(text):
      guard let data = text.data(using: .utf8) else { return nil }
      return try? JSONDecoder().decode(WebSocketEnvelope.self, from: data)
    case let .data(data):
      return try? JSONDecoder().decode(WebSocketEnvelope.self, from: data)
    @unknown default:
      return nil
    }
  }

  private static func execute(_ request: URLRequest) async throws -> Data {
    let (data, response) = try await URLSession.shared.data(for: request)
    guard let http = response as? HTTPURLResponse else {
      throw DictionaryAPIError.invalidResponse
    }
    guard (200...299).contains(http.statusCode) else {
      throw mapHTTPError(statusCode: http.statusCode, data: data)
    }
    return data
  }

  private static func buildRequest(
    path: String,
    method: String,
    accessToken: String?,
    targetLang: String?,
    body: Data? = nil,
  ) throws -> URLRequest {
    let url = try buildURL(path: path)
    lastRequestURLForDebug = url.absoluteString
    var request = URLRequest(url: url)
    request.httpMethod = method
    request.httpBody = body
    request.setValue("application/json", forHTTPHeaderField: "Accept")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    if let accessToken, !accessToken.isEmpty {
      request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
    }
    request.setValue(targetLang ?? (Locale.preferredLanguages.first ?? "en"), forHTTPHeaderField: "Accept-Language")
    request.timeoutInterval = 20

    return request
  }

  private static func decodeEnvelope<T: Decodable>(_ type: T.Type, from data: Data) throws -> T {
    let envelope = try JSONDecoder().decode(APIEnvelope<T>.self, from: data)
    return envelope.data
  }

  private static func fetchExplainJob(
    accessToken: String,
    jobId: String,
    includeInsight: Bool,
  ) async throws -> ExplainJobResponse {
    let includeInsightFlag = includeInsight ? "true" : "false"
    let request = try buildRequest(
      path: "/v1/word-insight/jobs/\(jobId)?includeInsight=\(includeInsightFlag)",
      method: "GET",
      accessToken: accessToken,
      targetLang: KeychainHelper.readLanguagePreferences()?.l1Language,
    )
    let data = try await execute(request)
    return try decodeEnvelope(ExplainJobResponse.self, from: data)
  }

  private static func buildWordInsightJobsWebSocketURL(accessToken: String) throws -> URL {
    let baseURL = try resolveBackendBaseURL()
    guard var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false) else {
      throw DictionaryAPIError.invalidBackendBaseURL
    }

    switch components.scheme?.lowercased() {
    case "https":
      components.scheme = "wss"
    case "http":
      components.scheme = "ws"
    default:
      throw DictionaryAPIError.invalidBackendBaseURL
    }

    let basePath = normalizePath(components.path)
    let wsPath = basePath.hasSuffix("/v1")
      ? "\(basePath)/word-insight/ws/jobs"
      : "\(basePath)/v1/word-insight/ws/jobs"
    components.path = normalizePath(wsPath)
    components.queryItems = [URLQueryItem(name: "token", value: accessToken)]

    guard let url = components.url else {
      throw DictionaryAPIError.invalidBackendBaseURL
    }
    return url
  }

  private static func buildURL(path: String) throws -> URL {
    let baseURL = try resolveBackendBaseURL()

    let normalizedPath = path.hasPrefix("/") ? String(path.dropFirst()) : path
    let segments = normalizedPath.split(separator: "?", maxSplits: 1, omittingEmptySubsequences: false)
    let cleanPath = String(segments.first ?? "")
    let query = segments.count > 1 ? String(segments[1]) : nil

    var components = URLComponents(url: baseURL.appendingPathComponent(cleanPath), resolvingAgainstBaseURL: false)
    if let query, !query.isEmpty {
      components?.percentEncodedQuery = query
    }
    guard let url = components?.url else {
      throw DictionaryAPIError.invalidBackendBaseURL
    }
    return url
  }

  private static func resolveBackendBaseURL() throws -> URL {
    let keychainBase = KeychainHelper.readBackendBaseURL()?.trimmingCharacters(in: .whitespacesAndNewlines)
    let keychainRegionBase = resolveRegionBaseURL(for: KeychainHelper.readHomeRegionCode())
    let infoPlistBase =
      (Bundle.main.object(forInfoDictionaryKey: backendBaseURLKey) as? String)?
      .trimmingCharacters(in: .whitespacesAndNewlines)

    let effectiveBase: String
    if let keychainBase, !keychainBase.isEmpty {
      effectiveBase = keychainBase
    } else if let keychainRegionBase {
      effectiveBase = keychainRegionBase
    } else if let infoPlistBase, !infoPlistBase.isEmpty {
      effectiveBase = infoPlistBase
    } else {
      effectiveBase = defaultBaseURL
    }

    guard let baseURL = URL(string: effectiveBase) else {
      throw DictionaryAPIError.invalidBackendBaseURL
    }
    return baseURL
  }

  private static func resolveRegionBaseURL(for regionCode: String?) -> String? {
    guard let normalizedCode = normalizeOptional(regionCode)?.lowercased() else { return nil }
    switch normalizedCode {
    case "na":
      return "https://us.vocorbit.com"
    case "eu":
      return "https://eu.vocorbit.com"
    case "apac":
      return "https://apac.vocorbit.com"
    default:
      return nil
    }
  }

  private static func normalizePath(_ rawPath: String) -> String {
    let segments = rawPath.split(separator: "/").map(String.init)
    guard !segments.isEmpty else { return "" }
    return "/" + segments.joined(separator: "/")
  }

  private static func mapHTTPError(statusCode: Int, data: Data) -> DictionaryAPIError {
    let message = extractBackendErrorMessage(data)
    switch statusCode {
    case 401:
      return .unauthorized
    case 403:
      return .forbidden
    case 404:
      return .notFound
    default:
      return .requestFailed(message ?? "Server error (HTTP \(statusCode)).")
    }
  }

  private static func extractBackendErrorMessage(_ data: Data) -> String? {
    guard let payload = try? JSONDecoder().decode(APIErrorEnvelope.self, from: data) else {
      return nil
    }
    return payload.error?.message
  }
}
