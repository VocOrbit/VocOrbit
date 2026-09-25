import Foundation
import Security

struct SharedAuthSession: Codable {
  let accessToken: String
  let refreshToken: String?
  let userId: String?
  let l1Language: String?
  let l2Language: String?
  let homeRegion: String?
  let backendBaseUrl: String?
}

enum KeychainHelper {
  private static let service = "vocorbit.auth"
  private static let account = "auth"
  private static let sharedAccessGroupSuffix = "com.vocorbit.shared"

  static func readSession() -> SharedAuthSession? {
    for accessGroup in candidateAccessGroups() {
      guard let data = readSessionData(accessGroup: accessGroup) else { continue }
      if let session = try? JSONDecoder().decode(SharedAuthSession.self, from: data) {
        return session
      }
    }

    return nil
  }

  static func persistSession(_ session: SharedAuthSession) {
    guard let data = try? JSONEncoder().encode(session) else { return }

    for accessGroup in candidateAccessGroups() {
      if upsertSessionData(data, accessGroup: accessGroup) {
        return
      }
    }

    _ = upsertSessionData(data, accessGroup: nil)
  }

  static func readAccessToken() -> String? {
    readSession()?.accessToken
  }

  static func readLanguagePreferences() -> (l1Language: String, l2Language: String)? {
    guard let session = readSession() else { return nil }

    let l1Language = session.l1Language?.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    let l2Language = session.l2Language?.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

    guard let normalizedL1 = l1Language, !normalizedL1.isEmpty else { return nil }
    guard let normalizedL2 = l2Language, !normalizedL2.isEmpty else { return nil }

    return (l1Language: normalizedL1, l2Language: normalizedL2)
  }

  static func readBackendBaseURL() -> String? {
    guard let rawValue = readSession()?.backendBaseUrl else { return nil }
    let normalized = rawValue.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !normalized.isEmpty else { return nil }
    return normalized
  }

  static func readHomeRegionCode() -> String? {
    guard let rawValue = readSession()?.homeRegion else { return nil }
    let normalized = rawValue.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    guard !normalized.isEmpty else { return nil }
    return normalized
  }

  private static func readSessionData(accessGroup: String?) -> Data? {
    var scopedQuery = baseQuery(returnData: true)
    if let accessGroup {
      scopedQuery[kSecAttrAccessGroup as String] = accessGroup
    }

    var item: CFTypeRef?
    let status = SecItemCopyMatching(scopedQuery as CFDictionary, &item)
    guard status == errSecSuccess else { return nil }
    return item as? Data
  }

  private static func upsertSessionData(_ data: Data, accessGroup: String?) -> Bool {
    var query = baseQuery(returnData: false)
    if let accessGroup {
      query[kSecAttrAccessGroup as String] = accessGroup
    }

    SecItemDelete(query as CFDictionary)

    var attributes = query
    attributes[kSecValueData as String] = data
    attributes[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock

    let status = SecItemAdd(attributes as CFDictionary, nil)
    return status == errSecSuccess
  }

  private static func baseQuery(returnData: Bool) -> [String: Any] {
    var query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
      kSecMatchLimit as String: kSecMatchLimitOne,
    ]
    if returnData {
      query[kSecReturnData as String] = true
    }
    return query
  }

  private static func candidateAccessGroups() -> [String?] {
    var rawCandidates = [String?]()
    rawCandidates.append(contentsOf: sharedAccessGroupCandidates().map { Optional($0) })
    rawCandidates.append(nil)

    var deduplicated = [String?]()
    var seen = Set<String>()
    var hasNil = false

    for candidate in rawCandidates {
      if let candidate {
        let trimmed = candidate.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { continue }
        guard !seen.contains(trimmed) else { continue }
        seen.insert(trimmed)
        deduplicated.append(trimmed)
      } else if !hasNil {
        hasNil = true
        deduplicated.append(nil)
      }
    }

    return deduplicated
  }

  private static func sharedAccessGroupCandidates() -> [String] {
    var groups = [String]()

    if let explicitGroup = Bundle.main.object(forInfoDictionaryKey: "VOCORBIT_SHARED_KEYCHAIN_ACCESS_GROUP") as? String {
      if let resolved = resolveAccessGroupTemplate(explicitGroup) {
        groups.append(resolved)
      }
    }

    if let prefix = resolveAppIdentifierPrefix() {
      groups.append("\(prefix)\(sharedAccessGroupSuffix)")
    }

    return groups
  }

  private static func resolveAccessGroupTemplate(_ template: String) -> String? {
    let trimmedTemplate = template.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmedTemplate.isEmpty else { return nil }

    if trimmedTemplate.contains("$(AppIdentifierPrefix)") {
      guard let prefix = resolveAppIdentifierPrefix() else { return nil }
      return trimmedTemplate.replacingOccurrences(of: "$(AppIdentifierPrefix)", with: prefix)
    }

    return trimmedTemplate
  }

  private static func resolveAppIdentifierPrefix() -> String? {
    if let explicitGroup = Bundle.main.object(forInfoDictionaryKey: "VOCORBIT_SHARED_KEYCHAIN_ACCESS_GROUP") as? String {
      let trimmedGroup = explicitGroup.trimmingCharacters(in: .whitespacesAndNewlines)
      if !trimmedGroup.isEmpty, !trimmedGroup.contains("$(AppIdentifierPrefix)") {
        return extractPrefix(fromAccessGroup: trimmedGroup)
      }
    }

    if let prefix = Bundle.main.object(forInfoDictionaryKey: "AppIdentifierPrefix") as? String {
      let normalizedPrefix = normalizePrefix(prefix)
      if !normalizedPrefix.isEmpty { return normalizedPrefix }
    }

    if let prefixList = Bundle.main.object(forInfoDictionaryKey: "AppIdentifierPrefix") as? [String],
       let prefix = prefixList.first
    {
      let normalizedPrefix = normalizePrefix(prefix)
      if !normalizedPrefix.isEmpty { return normalizedPrefix }
    }

    return nil
  }

  private static func normalizePrefix(_ rawPrefix: String) -> String {
    let trimmedPrefix = rawPrefix.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmedPrefix.isEmpty else { return "" }
    if trimmedPrefix.hasSuffix(".") {
      return trimmedPrefix
    }
    return "\(trimmedPrefix)."
  }

  private static func extractPrefix(fromAccessGroup accessGroup: String) -> String? {
    let trimmedGroup = accessGroup.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmedGroup.isEmpty else { return nil }
    guard let dotIndex = trimmedGroup.firstIndex(of: ".") else { return nil }
    let prefix = String(trimmedGroup[..<dotIndex])
    guard !prefix.isEmpty else { return nil }
    return "\(prefix)."
  }

}
