import { getApp, getApps, initializeApp } from "firebase/app"
import {
  browserSessionPersistence,
  getAuth,
  OAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  type Auth,
} from "firebase/auth"

import Config from "@/config"
import { addCrashBreadcrumb, ErrorType, reportCrash } from "@/utils/crashReporting"

export class AppleSignInUnavailableError extends Error {}
export class AppleSignInCancelledError extends Error {}

let authPromise: Promise<Auth> | null = null

function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

function resolveFirebaseProjectId(): string {
  const projectId = Config.FIREBASE_PROJECT_ID?.trim()
  if (!projectId) {
    throw new AppleSignInUnavailableError(
      "Missing FIREBASE_PROJECT_ID. Firebase Apple sign-in is not configured for desktop.",
    )
  }
  return projectId
}

function resolveFirebaseAuthDomain(projectId: string): string {
  const configuredAuthDomain = Config.FIREBASE_AUTH_DOMAIN?.trim()
  if (configuredAuthDomain) return configuredAuthDomain
  return `${projectId}.firebaseapp.com`
}

async function getFirebaseWebAuth(): Promise<Auth> {
  if (!isBrowserEnvironment()) {
    throw new AppleSignInUnavailableError("Apple sign-in requires a browser environment.")
  }

  if (authPromise) {
    return authPromise
  }

  authPromise = (async () => {
    const apiKey = Config.FIREBASE_WEB_API_KEY?.trim()
    if (!apiKey) {
      throw new AppleSignInUnavailableError(
        "Missing FIREBASE_WEB_API_KEY. Firebase Apple sign-in is not configured for desktop.",
      )
    }

    const projectId = resolveFirebaseProjectId()
    const authDomain = resolveFirebaseAuthDomain(projectId)
    const app =
      getApps().length > 0
        ? getApp()
        : initializeApp({
            apiKey,
            authDomain,
            projectId,
          })

    const auth = getAuth(app)
    auth.languageCode = navigator.language || "en"
    await setPersistence(auth, browserSessionPersistence)
    return auth
  })()

  try {
    return await authPromise
  } catch (error) {
    authPromise = null
    throw error
  }
}

function resolveFirebaseAuthErrorMessage(error: unknown): string | undefined {
  if (!(error instanceof Error)) return undefined

  switch ((error as Error & { code?: string }).code) {
    case "auth/unauthorized-domain":
      return `Firebase Auth does not allow ${window.location.hostname}. Add this domain in Firebase Console > Authentication > Settings > Authorized domains.`
    case "auth/operation-not-allowed":
      return "Apple sign-in is not enabled in Firebase Authentication."
    case "auth/invalid-api-key":
      return "Firebase API key is invalid."
    case "auth/configuration-not-found":
      return "Apple sign-in provider is not configured in Firebase Authentication."
    default:
      return error.message?.trim() || undefined
  }
}

function isAppleCancelError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const code = (error as Error & { code?: string }).code
  return code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request"
}

function recordAppleSignInFailure(stage: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  addCrashBreadcrumb(`[auth] Apple sign-in failure stage=${stage} | message=${message}`)
  reportCrash(new Error(message), ErrorType.HANDLED)
}

export async function isAppleSignInSupported(): Promise<boolean> {
  if (!isBrowserEnvironment()) return false
  return (
    (Config.FIREBASE_WEB_API_KEY?.trim() ?? "").length > 0 &&
    (Config.FIREBASE_PROJECT_ID?.trim() ?? "").length > 0
  )
}

export async function resolveAppleFirebaseIdToken(): Promise<string> {
  const configuredTestToken = Config.BACKEND_AUTH_TEST_ID_TOKEN?.trim()
  if (configuredTestToken) {
    return configuredTestToken
  }

  try {
    const auth = await getFirebaseWebAuth()
    await signOut(auth).catch(() => undefined)

    const provider = new OAuthProvider("apple.com")
    provider.addScope("email")
    provider.addScope("name")

    const result = await signInWithPopup(auth, provider)
    const idToken = await result.user.getIdToken(true)
    await signOut(auth).catch(() => undefined)

    if (!idToken.trim()) {
      throw new AppleSignInUnavailableError("Firebase returned no ID token for Apple sign-in.")
    }

    return idToken
  } catch (error) {
    if (isAppleCancelError(error)) {
      addCrashBreadcrumb("[auth] Apple sign-in cancelled")
      throw new AppleSignInCancelledError("Apple sign-in cancelled.")
    }

    recordAppleSignInFailure("firebase_popup", error)
    const message = resolveFirebaseAuthErrorMessage(error) || "Apple sign-in failed."
    throw new AppleSignInUnavailableError(message)
  }
}
