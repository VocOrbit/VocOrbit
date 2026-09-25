import { NativeModules, Platform } from "react-native"

import { load, remove, save, storageKeys } from "@/utils/storage"

export type SharePayloadSource = "send" | "process_text"

export type ShareCapturePayload = {
  text: string
  source: SharePayloadSource
  receivedAt: number
  selectedWord?: string
  needsOverlayPermission?: boolean
}

type ShareIntentNativeModule = {
  consumePendingSharePayload(): Promise<ShareCapturePayload | null>
  isOverlayPermissionGranted?(): Promise<boolean>
  openOverlaySettings?(): Promise<boolean>
}

type SharePayloadWord = {
  key: string
  normalized: string
  label: string
}

export type ShareTextSegment = {
  key: string
  text: string
  normalizedWord?: string
}

const shareIntentModule: ShareIntentNativeModule | undefined =
  Platform.OS === "android"
    ? (NativeModules.ShareIntentModule as ShareIntentNativeModule | undefined)
    : undefined

function normalizePayload(value: unknown): ShareCapturePayload | undefined {
  if (!value || typeof value !== "object") return undefined

  const candidate = value as {
    text?: unknown
    source?: unknown
    receivedAt?: unknown
    selectedWord?: unknown
    needsOverlayPermission?: unknown
  }

  const text =
    typeof candidate.text === "string" ? candidate.text.replace(/\s+/g, " ").trim() : ""
  if (!text) return undefined

  const source = candidate.source === "process_text" ? "process_text" : "send"

  const receivedAt =
    typeof candidate.receivedAt === "number" && Number.isFinite(candidate.receivedAt)
      ? candidate.receivedAt
      : Date.now()

  const selectedWord =
    typeof candidate.selectedWord === "string"
      ? normalizeSelectedWord(candidate.selectedWord)
      : undefined

  const needsOverlayPermission =
    typeof candidate.needsOverlayPermission === "boolean"
      ? candidate.needsOverlayPermission
      : undefined

  return {
    text,
    source,
    receivedAt: Math.max(1, Math.floor(receivedAt)),
    selectedWord,
    needsOverlayPermission,
  }
}

function normalizeSelectedWord(value: string): string {
  return value.trim().toLocaleLowerCase("en-US")
}

export async function consumeNativeSharePayload(): Promise<ShareCapturePayload | undefined> {
  if (!shareIntentModule?.consumePendingSharePayload) return undefined

  try {
    const payload = await shareIntentModule.consumePendingSharePayload()
    return normalizePayload(payload)
  } catch (error) {
    if (__DEV__) {
      console.warn("Failed to consume pending Android share payload", error)
    }
    return undefined
  }
}

export function readPendingSharePayload(): ShareCapturePayload | undefined {
  return normalizePayload(load<ShareCapturePayload>(storageKeys.pendingSharePayload))
}

export function persistPendingSharePayload(payload: ShareCapturePayload): void {
  save(storageKeys.pendingSharePayload, payload)
}

export function clearPendingSharePayload(): void {
  remove(storageKeys.pendingSharePayload)
}

export function extractShareWords(text: string, limit = 36): SharePayloadWord[] {
  const normalizedText = text.replace(/\s+/g, " ").trim()
  if (!normalizedText) return []

  const components = normalizedText.split(/[^\p{L}\p{N}'’-]+/u)
  const words: SharePayloadWord[] = []
  const seen = new Set<string>()

  for (const rawComponent of components) {
    const label = rawComponent.trim()
    if (label.length === 0) continue
    if (!/\p{L}/u.test(label)) continue

    const normalized = normalizeSelectedWord(label)
    if (!normalized || seen.has(normalized)) continue

    seen.add(normalized)
    words.push({
      key: `${normalized}-${words.length}`,
      normalized,
      label,
    })

    if (words.length >= limit) {
      break
    }
  }

  return words
}

export function tokenizeShareText(text: string): ShareTextSegment[] {
  const normalizedText = text.replace(/\s+/g, " ").trim()
  if (!normalizedText) return []

  const segments: ShareTextSegment[] = []
  const regex = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu
  let lastIndex = 0

  for (const match of normalizedText.matchAll(regex)) {
    const start = match.index ?? 0
    const value = match[0]
    const end = start + value.length

    if (start > lastIndex) {
      segments.push({
        key: `text-${lastIndex}`,
        text: normalizedText.slice(lastIndex, start),
      })
    }

    segments.push({
      key: `word-${start}`,
      text: value,
      normalizedWord: normalizeSelectedWord(value),
    })
    lastIndex = end
  }

  if (lastIndex < normalizedText.length) {
    segments.push({
      key: `text-${lastIndex}`,
      text: normalizedText.slice(lastIndex),
    })
  }

  return segments
}

export function buildShareContextSnippet(
  text: string,
  selectedWord: string,
  maxLength = 280,
): string {
  const normalizedText = text.replace(/\s+/g, " ").trim()
  if (!normalizedText) return ""
  if (normalizedText.length <= maxLength) return normalizedText

  const normalizedSelectedWord = normalizeSelectedWord(selectedWord)
  if (!normalizedSelectedWord) {
    return `${normalizedText.slice(0, maxLength).trim()}...`
  }

  const escapedSelectedWord = normalizedSelectedWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = normalizedText.match(new RegExp(escapedSelectedWord, "iu"))
  if (!match || match.index === undefined) {
    return `${normalizedText.slice(0, maxLength).trim()}...`
  }

  const wordStart = match.index
  const wordEnd = match.index + match[0].length
  const wordCenter = Math.floor((wordStart + wordEnd) / 2)
  let start = Math.max(0, wordCenter - Math.floor(maxLength / 2))

  if (start + maxLength > normalizedText.length) {
    start = Math.max(0, normalizedText.length - maxLength)
  }

  const end = Math.min(normalizedText.length, start + maxLength)
  const snippet = normalizedText.slice(start, end).trim()
  if (!snippet) return normalizedText.slice(0, maxLength).trim()

  const prefix = start > 0 ? "..." : ""
  const suffix = end < normalizedText.length ? "..." : ""
  return `${prefix}${snippet}${suffix}`
}

export function normalizeShareSelection(value: string): string {
  return normalizeSelectedWord(value)
}

export async function isAndroidOverlayPermissionGranted(): Promise<boolean> {
  if (!shareIntentModule?.isOverlayPermissionGranted) return false

  try {
    return await shareIntentModule.isOverlayPermissionGranted()
  } catch (error) {
    if (__DEV__) {
      console.warn("Failed to read Android overlay permission status", error)
    }
    return false
  }
}

export async function openAndroidOverlaySettings(): Promise<boolean> {
  if (!shareIntentModule?.openOverlaySettings) return false

  try {
    return await shareIntentModule.openOverlaySettings()
  } catch (error) {
    if (__DEV__) {
      console.warn("Failed to open Android overlay settings", error)
    }
    return false
  }
}
