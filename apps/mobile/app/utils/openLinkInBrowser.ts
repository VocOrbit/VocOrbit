import { Linking } from "react-native"

/**
 * Helper for opening an external URL or app handler.
 */
const URL_SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i
const WEB_URL_PATTERN = /^https?:\/\//i
const LIKELY_WEB_URL_PATTERN = /^(?:www\.|[a-z0-9-]+(?:\.[a-z0-9-]+)+)(?:[/:?#].*)?$/i

export function normalizeOpenableUrl(url: string): string | undefined {
  const trimmed = url.trim()
  if (!trimmed) return undefined

  if (trimmed.startsWith("//")) return `https:${trimmed}`
  if (URL_SCHEME_PATTERN.test(trimmed)) return trimmed
  if (LIKELY_WEB_URL_PATTERN.test(trimmed)) return `https://${trimmed}`

  return trimmed
}

export async function openLinkInBrowser(url: string): Promise<boolean> {
  const normalizedUrl = normalizeOpenableUrl(url)
  if (!normalizedUrl) return false

  try {
    if (WEB_URL_PATTERN.test(normalizedUrl)) {
      await Linking.openURL(normalizedUrl)
      return true
    }

    const canOpen = await Linking.canOpenURL(normalizedUrl)
    if (!canOpen) return false

    await Linking.openURL(normalizedUrl)
    return true
  } catch {
    return false
  }
}
