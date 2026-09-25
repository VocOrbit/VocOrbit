import Foundation

enum ShareInsightState: Equatable {
  case idle
  case loading
  case success
  case failure
}

@MainActor
final class ShareViewModel: ObservableObject {
  private let maxSentenceCharsForRequest = 280

  @Published var paragraph = ""
  @Published var selectedWord = "" {
    didSet {
      if selectedWord != oldValue {
        resetResultsForSelectionChange()
      }
    }
  }
  @Published var status = "Reading selection..."
  @Published var isLoading = false
  @Published var insightState: ShareInsightState = .idle
  @Published var errorMessage: String?
  @Published private(set) var requiresSignIn = false
  @Published private(set) var hasInsufficientCredits = false
  @Published var languagePairLabel = "L2 -> L1"
  @Published private(set) var insight: WordInsightPayload?
  @Published private(set) var shouldShowRequestDebug = false
  @Published var requestDebugText = "-"

  private var requestVersion = 0

  init() {
    shouldShowRequestDebug = Self.resolveRequestDebugFlag()
    refreshLanguagePairFromKeychain()
    refreshRequestDebugText()
  }

  var hasSelection: Bool {
    normalizedSelectedWord() != nil
  }

  var canFetchInsight: Bool {
    normalizedSelectedWord() != nil && normalizedParagraph() != nil && !isLoading
  }

  private static func isInsufficientCreditMessage(_ errorMessage: String) -> Bool {
    let normalized = errorMessage.folding(options: [.caseInsensitive, .diacriticInsensitive], locale: .current)
    let hasCreditKeyword = normalized.contains("credit") || normalized.contains("kredi")
    let hasInsufficientKeyword =
      normalized.contains("insufficient") ||
      normalized.contains("required") ||
      normalized.contains("out of") ||
      normalized.contains("yetersiz") ||
      normalized.contains("gerekli")
    return hasCreditKeyword && hasInsufficientKeyword
  }

  var quickPickWords: [String] {
    extractQuickPickWords(from: paragraph, limit: 36)
  }

  func updateParagraph(_ text: String?) {
    let trimmed = text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    paragraph = trimmed
    selectedWord = ""
    insight = nil
    errorMessage = nil
    requiresSignIn = false
    hasInsufficientCredits = false
    insightState = .idle
    status = trimmed.isEmpty ? "No text found." : "Select a word."
    refreshLanguagePairFromKeychain()
    refreshRequestDebugText()
  }

  func clearSelection() {
    selectedWord = ""
  }

  func selectWord(_ word: String) {
    selectedWord = word
  }

  func retry() {
    fetchBasicInsight()
  }

  func fetchBasicInsight() {
    guard let word = normalizedSelectedWord() else {
      status = "Select a word."
      return
    }
    guard let sentence = buildSentenceForRequest(selectedWord: word, maxLength: maxSentenceCharsForRequest) else {
      status = "No text found."
      return
    }

    let token = nextRequestToken()
    isLoading = true
    insight = nil
    errorMessage = nil
    requiresSignIn = false
    hasInsufficientCredits = false
    insightState = .loading
    status = "Fetching basic insight..."
    refreshRequestDebugText()

    Task {
      do {
        let result = try await DictionaryAPIClient.fetchBasicInsight(
          sentence: sentence,
          selectedWord: word,
        )

        await MainActor.run {
          guard self.requestVersion == token else { return }
          self.insight = result
          self.requiresSignIn = false
          self.languagePairLabel = "\(self.displayLanguageTag(result.sourceLang)) -> \(self.displayLanguageTag(result.targetLang))"
          self.status = "Insight ready"
          self.isLoading = false
          self.insightState = .success
          self.refreshRequestDebugText()
        }
      } catch {
        await MainActor.run {
          guard self.requestVersion == token else { return }
          self.insight = nil
          if let dictionaryError = error as? DictionaryAPIError {
            self.errorMessage = dictionaryError.localizedDescription
            switch dictionaryError {
            case .missingAuthToken, .unauthorized:
              self.requiresSignIn = true
              self.hasInsufficientCredits = false
            case .forbidden(_):
              self.requiresSignIn = false
              self.hasInsufficientCredits = true
            default:
              self.requiresSignIn = false
              self.hasInsufficientCredits = Self.isInsufficientCreditMessage(dictionaryError.localizedDescription)
            }
          } else {
            self.errorMessage = "Request failed."
            self.requiresSignIn = false
            self.hasInsufficientCredits = false
          }
          self.status = self.errorMessage ?? "Request failed."
          self.isLoading = false
          self.insightState = .failure
          self.refreshRequestDebugText()
        }
      }
    }
  }

  func contextPreview(maxLength: Int = 220) -> String {
    guard let paragraph = normalizedParagraph() else { return "" }
    guard let selectedWord = normalizedSelectedWord() else {
      return truncate(text: paragraph, maxLength: maxLength)
    }

    guard let range = paragraph.range(of: selectedWord, options: [.caseInsensitive, .diacriticInsensitive]) else {
      return truncate(text: paragraph, maxLength: maxLength)
    }

    let start = paragraph.index(range.lowerBound, offsetBy: -Int(Double(maxLength) * 0.45), limitedBy: paragraph.startIndex) ?? paragraph.startIndex
    let end = paragraph.index(range.upperBound, offsetBy: Int(Double(maxLength) * 0.45), limitedBy: paragraph.endIndex) ?? paragraph.endIndex

    var snippet = String(paragraph[start..<end]).trimmingCharacters(in: .whitespacesAndNewlines)
    if start > paragraph.startIndex { snippet = "...\(snippet)" }
    if end < paragraph.endIndex { snippet = "\(snippet)..." }
    return snippet
  }

  func basicMeaningText() -> String {
    guard let insight else { return "-" }
    let translation = insight.translationL1?.trimmingCharacters(in: .whitespacesAndNewlines)
    if let translation, !translation.isEmpty {
      return translation
    }

    let definition = insight.definitionL2?.trimmingCharacters(in: .whitespacesAndNewlines)
    if let definition, !definition.isEmpty {
      return definition
    }

    return insight.meaning
  }

  func contextMeaningText() -> String? {
    guard let insight else { return nil }

    let definition = insight.definitionL2?.trimmingCharacters(in: .whitespacesAndNewlines)
    if let definition, !definition.isEmpty {
      return definition
    }
    return nil
  }

  func whyUsedText() -> String? {
    guard let insight else { return nil }

    let whyThisSense = insight.whyThisSense?.trimmingCharacters(in: .whitespacesAndNewlines)
    if let whyThisSense, !whyThisSense.isEmpty {
      return whyThisSense
    }

    let shortExplanation = insight.shortExplanation.trimmingCharacters(in: .whitespacesAndNewlines)
    if !shortExplanation.isEmpty {
      return shortExplanation
    }

    return nil
  }

  func primaryActionTitle() -> String {
    if hasSelection {
      return "Get basic meaning"
    }
    return "Select a word first"
  }

  private func normalizedSelectedWord() -> String? {
    let trimmed = selectedWord.trimmingCharacters(in: .whitespacesAndNewlines)
    return trimmed.isEmpty ? nil : trimmed.lowercased()
  }

  private func normalizedParagraph() -> String? {
    let trimmed = paragraph.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return nil }
    return normalizeWhitespace(trimmed)
  }

  private func resetResultsForSelectionChange() {
    requestVersion += 1
    insight = nil
    errorMessage = nil
    requiresSignIn = false
    hasInsufficientCredits = false
    isLoading = false
    insightState = .idle
    if !paragraph.isEmpty {
      status = selectedWord.isEmpty ? "Select a word." : "Ready to analyze."
    }
  }

  private func nextRequestToken() -> Int {
    requestVersion += 1
    return requestVersion
  }

  private func truncate(text: String, maxLength: Int) -> String {
    guard text.count > maxLength else { return text }
    let end = text.index(text.startIndex, offsetBy: maxLength)
    return String(text[text.startIndex..<end]).trimmingCharacters(in: .whitespacesAndNewlines) + "..."
  }

  private func buildSentenceForRequest(selectedWord: String, maxLength: Int) -> String? {
    guard let fullText = normalizedParagraph() else { return nil }
    guard fullText.count > maxLength else { return fullText }

    guard let wordRange = fullText.range(
      of: selectedWord,
      options: [.caseInsensitive, .diacriticInsensitive]
    ) else {
      return truncate(text: fullText, maxLength: maxLength)
    }

    let textLength = fullText.count
    let wordStart = fullText.distance(from: fullText.startIndex, to: wordRange.lowerBound)
    let wordEnd = fullText.distance(from: fullText.startIndex, to: wordRange.upperBound)
    let wordCenter = (wordStart + wordEnd) / 2

    var startOffset = max(0, wordCenter - (maxLength / 2))
    if startOffset + maxLength > textLength {
      startOffset = max(0, textLength - maxLength)
    }

    let endOffset = min(textLength, startOffset + maxLength)
    let startIndex = fullText.index(fullText.startIndex, offsetBy: startOffset)
    let endIndex = fullText.index(fullText.startIndex, offsetBy: endOffset)
    let snippet = String(fullText[startIndex..<endIndex]).trimmingCharacters(in: .whitespacesAndNewlines)

    return snippet.isEmpty ? truncate(text: fullText, maxLength: maxLength) : snippet
  }

  private func normalizeWhitespace(_ text: String) -> String {
    text
      .components(separatedBy: .whitespacesAndNewlines)
      .filter { !$0.isEmpty }
      .joined(separator: " ")
  }

  private func extractQuickPickWords(from text: String, limit: Int) -> [String] {
    let trimmedText = text.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmedText.isEmpty else { return [] }

    let components = trimmedText.components(separatedBy: CharacterSet.alphanumerics.inverted)
    var uniqueWords = [String]()
    var seen = Set<String>()

    for rawWord in components {
      let word = rawWord.trimmingCharacters(in: .whitespacesAndNewlines)
      guard word.count >= 2 else { continue }
      guard word.rangeOfCharacter(from: CharacterSet.letters) != nil else { continue }

      let normalized = word.lowercased()
      guard !seen.contains(normalized) else { continue }
      seen.insert(normalized)
      uniqueWords.append(word)

      if uniqueWords.count >= limit {
        break
      }
    }

    return uniqueWords
  }

  private func refreshLanguagePairFromKeychain() {
    if let languagePreferences = KeychainHelper.readLanguagePreferences() {
      languagePairLabel = "\(displayLanguageTag(languagePreferences.l2Language)) -> \(displayLanguageTag(languagePreferences.l1Language))"
      return
    }

    let localeTag = Locale.preferredLanguages.first ?? "en"
    languagePairLabel = "\(displayLanguageTag(localeTag)) -> EN"
  }

  private func displayLanguageTag(_ tag: String) -> String {
    let normalized = tag.trimmingCharacters(in: .whitespacesAndNewlines).replacingOccurrences(of: "_", with: "-")
    guard !normalized.isEmpty else { return "--" }
    return normalized.uppercased()
  }

  private static func resolveRequestDebugFlag() -> Bool {
    if let value = Bundle.main.object(forInfoDictionaryKey: "VOCORBIT_SHARE_SHOW_REQUEST_DESTINATION_DEBUG") as? Bool {
      return value
    }

    if let value = Bundle.main.object(forInfoDictionaryKey: "VOCORBIT_SHARE_SHOW_REQUEST_DESTINATION_DEBUG") as? String {
      let normalized = value.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
      return normalized == "1" || normalized == "true" || normalized == "yes"
    }

    return false
  }

  private func refreshRequestDebugText() {
    guard shouldShowRequestDebug else {
      requestDebugText = "-"
      return
    }
    requestDebugText = DictionaryAPIClient.debugRequestDestination()
  }
}
