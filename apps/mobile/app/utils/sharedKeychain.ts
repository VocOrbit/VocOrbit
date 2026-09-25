import { NativeModules, Platform } from "react-native"
import * as Keychain from "react-native-keychain"

const KEYCHAIN_SERVICE = "vocorbit.auth"
const KEYCHAIN_ACCOUNT = "auth"

const keychainOptions = {}

type QuickLookupNativeModule = {
  syncQuickLookupSession?: (sessionJson: string | null) => void
}

const quickLookupNativeModule: QuickLookupNativeModule | undefined =
  Platform.OS === "android"
    ? (NativeModules.ShareIntentModule as QuickLookupNativeModule | undefined)
    : undefined

export type SharedAuthSession = {
  accessToken: string
  refreshToken?: string
  userId?: string
  l1Language?: string
  l2Language?: string
  homeRegion?: string
  backendBaseUrl?: string
}

async function syncQuickLookupSessionToNative(session?: SharedAuthSession): Promise<void> {
  if (Platform.OS !== "android") return
  if (!quickLookupNativeModule?.syncQuickLookupSession) return

  try {
    quickLookupNativeModule.syncQuickLookupSession(session ? JSON.stringify(session) : null)
  } catch (error) {
    if (__DEV__) {
      console.warn("Failed to sync quick lookup session to Android native store", error)
    }
  }
}

async function withKeychainOptions<T>(
  operation: (options: Record<string, unknown>) => Promise<T>,
): Promise<T> {
  return operation(keychainOptions)
}

function safeParseSession(value: string): SharedAuthSession | undefined {
  try {
    const parsed = JSON.parse(value) as SharedAuthSession
    if (!parsed || typeof parsed.accessToken !== "string" || parsed.accessToken.length === 0) {
      return undefined
    }
    return parsed
  } catch {
    return undefined
  }
}

async function readRawSessionFromKeychain(): Promise<SharedAuthSession | undefined> {
  const existing = await withKeychainOptions((options) =>
    Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
      ...options,
    }),
  )
  if (!existing) return undefined
  return safeParseSession(existing.password)
}

function normalizeLanguageTag(value: string | undefined): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  return normalized.length > 0 ? normalized : undefined
}

function normalizeRegionCode(value: string | undefined): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  return normalized.length > 0 ? normalized : undefined
}

function normalizeBackendBaseUrl(value: string | undefined): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().replace(/\/+$/, "")
  return normalized.length > 0 ? normalized : undefined
}

export async function syncAuthSessionToKeychain(session?: SharedAuthSession) {
  if (!session?.accessToken) {
    await withKeychainOptions((options) =>
      Keychain.resetGenericPassword({
        service: KEYCHAIN_SERVICE,
        ...options,
      }),
    )
    await syncQuickLookupSessionToNative(undefined)
    return
  }

  const existingSession = await readRawSessionFromKeychain().catch(() => undefined)
  const mergedSession: SharedAuthSession = {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    userId: session.userId,
    l1Language: normalizeLanguageTag(session.l1Language) ?? existingSession?.l1Language,
    l2Language: normalizeLanguageTag(session.l2Language) ?? existingSession?.l2Language,
    homeRegion: normalizeRegionCode(session.homeRegion) ?? existingSession?.homeRegion,
    backendBaseUrl:
      normalizeBackendBaseUrl(session.backendBaseUrl) ?? existingSession?.backendBaseUrl,
  }

  await withKeychainOptions((options) =>
    Keychain.setGenericPassword(KEYCHAIN_ACCOUNT, JSON.stringify(mergedSession), {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      ...options,
    }),
  )
  await syncQuickLookupSessionToNative(mergedSession)
}

export async function syncLanguagePreferencesToKeychain(preferences?: {
  l1Language?: string
  l2Language?: string
}): Promise<void> {
  try {
    const existingSession = await readRawSessionFromKeychain()
    if (!existingSession?.accessToken) return

    const nextL1 = normalizeLanguageTag(preferences?.l1Language)
    const nextL2 = normalizeLanguageTag(preferences?.l2Language)

    const mergedSession: SharedAuthSession = {
      ...existingSession,
      l1Language: nextL1 ?? existingSession.l1Language,
      l2Language: nextL2 ?? existingSession.l2Language,
    }

    await withKeychainOptions((options) =>
      Keychain.setGenericPassword(KEYCHAIN_ACCOUNT, JSON.stringify(mergedSession), {
        service: KEYCHAIN_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        ...options,
      }),
    )
    await syncQuickLookupSessionToNative(mergedSession)
  } catch (error) {
    if (__DEV__) {
      console.warn("Failed to sync language preferences to keychain", error)
    }
  }
}

export async function syncRegionConfigToKeychain(config?: {
  homeRegion?: string
  backendBaseUrl?: string
}): Promise<void> {
  try {
    const existingSession = await readRawSessionFromKeychain()
    if (!existingSession?.accessToken) return

    const nextHomeRegion = normalizeRegionCode(config?.homeRegion)
    const nextBackendBaseUrl = normalizeBackendBaseUrl(config?.backendBaseUrl)

    if (!nextHomeRegion && !nextBackendBaseUrl) return

    const mergedSession: SharedAuthSession = {
      ...existingSession,
      homeRegion: nextHomeRegion ?? existingSession.homeRegion,
      backendBaseUrl: nextBackendBaseUrl ?? existingSession.backendBaseUrl,
    }

    await withKeychainOptions((options) =>
      Keychain.setGenericPassword(KEYCHAIN_ACCOUNT, JSON.stringify(mergedSession), {
        service: KEYCHAIN_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        ...options,
      }),
    )
    await syncQuickLookupSessionToNative(mergedSession)
  } catch (error) {
    if (__DEV__) {
      console.warn("Failed to sync region config to keychain", error)
    }
  }
}

export async function readAuthSessionFromKeychain(): Promise<SharedAuthSession | undefined> {
  try {
    return await readRawSessionFromKeychain()
  } catch (error) {
    if (__DEV__) {
      console.warn("Failed to read auth session from keychain", error)
    }
    return undefined
  }
}
