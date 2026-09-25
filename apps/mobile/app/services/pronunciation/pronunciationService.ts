import { Platform } from "react-native"
import { setAudioModeAsync } from "expo-audio"
import * as Speech from "expo-speech"

type SpeakWordInput = {
  word: string
  sourceLang?: string
  fallbackLang?: string
  rate?: number
  pitch?: number
  allowLanguageFallback?: boolean
}

export type SpeakWordResult = "started" | "failed" | "cancelled"

const DEFAULT_RATE = 0.95
const DEFAULT_PITCH = 1
const DEFAULT_ALLOW_LANGUAGE_FALLBACK = false
const VOICE_CACHE_TTL_MS = 5 * 60 * 1000
const VOICE_FETCH_RETRY_DELAYS_MS = [0, 160]
const SPEAK_CONFIRMATION_TIMEOUT_MS = 1800
const ANDROID_SPEAK_ACCEPTED_TIMEOUT_MS = 650
const MIN_SPEAK_GAP_MS = 120

type VoiceCacheEntry = {
  voices: Speech.Voice[]
  fetchedAt: number
}

let voiceCache: VoiceCacheEntry | undefined
let voiceCachePromise: Promise<Speech.Voice[]> | undefined
let activeSpeakRequestId = 0
let lastSpeakStartedAt = 0

function normalizeLocale(input?: string): string | undefined {
  if (typeof input !== "string") return undefined
  const trimmed = input.trim()
  if (!trimmed) return undefined
  return trimmed.replace(/_/g, "-").toLocaleLowerCase("en-US")
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function uniqueLocales(locales: Array<string | undefined>): string[] {
  const set = new Set<string>()
  for (const locale of locales) {
    if (!locale) continue
    set.add(locale)
    const base = locale.split("-")[0]
    if (base) set.add(base)
  }
  return Array.from(set)
}

function getDeviceLocale(): string | undefined {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale
  return normalizeLocale(locale)
}

function hasFreshVoiceCache(cache: VoiceCacheEntry | undefined): cache is VoiceCacheEntry {
  if (!cache) return false
  return Date.now() - cache.fetchedAt < VOICE_CACHE_TTL_MS
}

function isEnhancedVoice(voice: Speech.Voice): boolean {
  return voice.quality === Speech.VoiceQuality.Enhanced
}

function getVoiceLocaleScore(voice: Speech.Voice, locale: string): number {
  const normalizedVoiceLocale = normalizeLocale(voice.language)
  if (!normalizedVoiceLocale) return -1
  if (normalizedVoiceLocale === locale) return 300

  const localeBase = locale.split("-")[0]
  if (!localeBase) return -1
  if (normalizedVoiceLocale === localeBase) return 240
  if (normalizedVoiceLocale.startsWith(`${localeBase}-`)) return 200

  const voiceBase = normalizedVoiceLocale.split("-")[0]
  if (voiceBase === localeBase) return 160
  return -1
}

function compareVoiceCandidates(a: Speech.Voice, b: Speech.Voice, locale: string): number {
  const scoreA = getVoiceLocaleScore(a, locale)
  const scoreB = getVoiceLocaleScore(b, locale)
  if (scoreA !== scoreB) return scoreB - scoreA

  const qualityA = isEnhancedVoice(a) ? 1 : 0
  const qualityB = isEnhancedVoice(b) ? 1 : 0
  if (qualityA !== qualityB) return qualityB - qualityA

  const nameCompare = a.name.localeCompare(b.name)
  if (nameCompare !== 0) return nameCompare
  return a.identifier.localeCompare(b.identifier)
}

async function fetchVoicesWithRetry(): Promise<Speech.Voice[]> {
  let lastError: unknown
  for (const retryDelay of VOICE_FETCH_RETRY_DELAYS_MS) {
    if (retryDelay > 0) {
      await delay(retryDelay)
    }
    try {
      const voices = await Speech.getAvailableVoicesAsync()
      return Array.isArray(voices) ? voices : []
    } catch (error) {
      lastError = error
    }
  }

  throw lastError ?? new Error("Failed to fetch available voices.")
}

async function getAvailableVoices(): Promise<Speech.Voice[]> {
  if (hasFreshVoiceCache(voiceCache)) return voiceCache.voices
  if (voiceCachePromise) return voiceCachePromise

  voiceCachePromise = fetchVoicesWithRetry()
    .then((voices) => {
      voiceCache = {
        voices,
        fetchedAt: Date.now(),
      }
      return voices
    })
    .catch(() => {
      return []
    })
    .finally(() => {
      voiceCachePromise = undefined
    })

  return voiceCachePromise
}

function findVoiceForLocale(voices: Speech.Voice[], locale: string): Speech.Voice | undefined {
  const normalizedLocale = normalizeLocale(locale)
  if (!normalizedLocale) return undefined

  const matches = voices
    .filter((voice) => getVoiceLocaleScore(voice, normalizedLocale) >= 0)
    .sort((first, second) => compareVoiceCandidates(first, second, normalizedLocale))
  return matches[0]
}

function buildSpeakOptions(input: {
  locale?: string
  voice?: Speech.Voice
  rate?: number
  pitch?: number
}): Speech.SpeechOptions {
  const locale = normalizeLocale(input.voice?.language) ?? normalizeLocale(input.locale)
  const language = Platform.OS === "android" ? locale?.split("-")[0] : locale

  return {
    language,
    voice: input.voice?.identifier,
    rate: input.rate ?? DEFAULT_RATE,
    pitch: input.pitch ?? DEFAULT_PITCH,
  }
}

async function prepareAndroidSpeechAudio(): Promise<void> {
  if (Platform.OS !== "android") return

  try {
    await setAudioModeAsync({
      interruptionMode: "mixWithOthers",
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    })
  } catch {
    // Speech can still work if expo-audio mode setup is unavailable on a device.
  }
}

async function speakWithConfirmation(
  word: string,
  options: Speech.SpeechOptions,
  requestId: number,
): Promise<SpeakWordResult> {
  return new Promise((resolve) => {
    let isSettled = false
    const settle = (result: SpeakWordResult) => {
      if (isSettled) return
      isSettled = true
      clearTimeout(timer)
      resolve(result)
    }
    const settleIfCurrent = (result: SpeakWordResult) => {
      if (requestId !== activeSpeakRequestId) {
        settle("cancelled")
        return
      }
      settle(result)
    }

    const timer = setTimeout(
      () => {
        settleIfCurrent(Platform.OS === "android" ? "started" : "failed")
      },
      Platform.OS === "android" ? ANDROID_SPEAK_ACCEPTED_TIMEOUT_MS : SPEAK_CONFIRMATION_TIMEOUT_MS,
    )

    try {
      Speech.speak(word, {
        ...options,
        onStart: () => {
          settleIfCurrent("started")
        },
        onDone: () => {
          settleIfCurrent("started")
        },
        onStopped: () => {
          settleIfCurrent("cancelled")
        },
        onError: () => {
          settleIfCurrent("failed")
        },
      })
    } catch {
      settle("failed")
    }
  })
}

async function waitForSpeakTurn(requestId: number): Promise<boolean> {
  const elapsedSinceLastStart = Date.now() - lastSpeakStartedAt
  if (elapsedSinceLastStart < MIN_SPEAK_GAP_MS) {
    await delay(MIN_SPEAK_GAP_MS - elapsedSinceLastStart)
  }
  if (requestId !== activeSpeakRequestId) return false
  lastSpeakStartedAt = Date.now()
  return true
}

export async function speakWord(input: SpeakWordInput): Promise<SpeakWordResult> {
  const word = input.word.trim()
  if (!word) return "failed"
  if (word.length > Speech.maxSpeechInputLength) return "failed"

  const requestId = ++activeSpeakRequestId
  const isCurrentRequest = await waitForSpeakTurn(requestId)
  if (!isCurrentRequest) return "cancelled"
  await prepareAndroidSpeechAudio()
  if (requestId !== activeSpeakRequestId) return "cancelled"

  const sourceLocale = normalizeLocale(input.sourceLang)
  const fallbackLocale = normalizeLocale(input.fallbackLang)
  const deviceLocale = getDeviceLocale()
  const shouldAllowLanguageFallback = input.allowLanguageFallback ?? DEFAULT_ALLOW_LANGUAGE_FALLBACK

  const locales = uniqueLocales([
    sourceLocale ?? deviceLocale,
    shouldAllowLanguageFallback ? fallbackLocale : undefined,
    shouldAllowLanguageFallback ? deviceLocale : undefined,
  ])

  const voices = await getAvailableVoices()
  if (requestId !== activeSpeakRequestId) return "cancelled"

  try {
    await Speech.stop()
  } catch {
    // no-op
  }
  if (requestId !== activeSpeakRequestId) return "cancelled"

  for (const locale of locales) {
    const voice = findVoiceForLocale(voices, locale)
    const result = await speakWithConfirmation(
      word,
      buildSpeakOptions({ locale, voice, rate: input.rate, pitch: input.pitch }),
      requestId,
    )
    if (result === "started" || result === "cancelled") return result
  }

  if (!shouldAllowLanguageFallback) return "failed"
  return speakWithConfirmation(
    word,
    buildSpeakOptions({ rate: input.rate, pitch: input.pitch }),
    requestId,
  )
}

export function clearPronunciationVoiceCache() {
  voiceCache = undefined
  voiceCachePromise = undefined
}
