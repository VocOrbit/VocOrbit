import Config from "@/config"
import { Platform } from "react-native"
import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin"
import { addCrashBreadcrumb, ErrorType, reportCrash } from "@/utils/crashReporting"

export class GoogleSignInUnavailableError extends Error {}
export class GoogleSignInCancelledError extends Error {}
export class FirebaseTokenExchangeError extends Error {}

let isGoogleConfigured = false
const ANDROID_DEVELOPER_ERROR_CODE = "10"

function readGoogleErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim()
  }
  return undefined
}

function isAndroidDeveloperError(error: unknown): boolean {
  const message = readGoogleErrorMessage(error)

  if (isErrorWithCode(error)) {
    const code = typeof error.code === "string" ? error.code : String(error.code)
    if (code === ANDROID_DEVELOPER_ERROR_CODE) return true
  }

  return Platform.OS === "android" && Boolean(message?.includes("DEVELOPER_ERROR"))
}

function recordGoogleSignInFailure(stage: string, error: unknown) {
  const parts = [`stage=${stage}`]

  if (isErrorWithCode(error)) {
    const code = typeof error.code === "string" ? error.code : String(error.code)
    if (code.trim().length > 0) {
      parts.push(`code=${code}`)
    }
  }

  const message = readGoogleErrorMessage(error)
  if (message) {
    parts.push(`message=${message}`)
  }

  addCrashBreadcrumb(`[auth] Google sign-in failure ${parts.join(" | ")}`)

  if (isAndroidDeveloperError(error)) {
    reportCrash(
      new Error(
        "Google sign-in is misconfigured for this Android build. Check the registered SHA fingerprints for com.vocorbit in Firebase/Google Cloud.",
      ),
      ErrorType.HANDLED,
    )
  }
}

function ensureGoogleConfigured() {
  if (isGoogleConfigured) return

  const webClientId = Config.GOOGLE_WEB_CLIENT_ID?.trim()
  const iosClientId = Config.GOOGLE_IOS_CLIENT_ID?.trim()

  if (!webClientId && !iosClientId) {
    throw new GoogleSignInUnavailableError(
      "Missing Google client IDs. Set GOOGLE_WEB_CLIENT_ID or GOOGLE_IOS_CLIENT_ID.",
    )
  }

  GoogleSignin.configure({
    webClientId: webClientId || undefined,
    iosClientId: iosClientId || undefined,
    scopes: ["openid", "email", "profile"],
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  })

  isGoogleConfigured = true
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readFirebaseErrorMessage(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined
  const errorNode = payload.error
  if (!isRecord(errorNode)) return undefined
  const message = errorNode.message
  return typeof message === "string" ? message : undefined
}

type ExchangeTokenType = "id_token" | "access_token"

async function exchangeGoogleProviderTokenForFirebaseIdToken(
  tokenType: ExchangeTokenType,
  tokenValue: string,
): Promise<string> {
  const apiKey = Config.FIREBASE_WEB_API_KEY?.trim()
  if (!apiKey) {
    throw new FirebaseTokenExchangeError(
      "Missing FIREBASE_WEB_API_KEY. Add API_KEY from Firebase project to config.",
    )
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postBody: `${tokenType}=${encodeURIComponent(tokenValue)}&providerId=google.com`,
        requestUri: "http://localhost",
        returnSecureToken: true,
        returnIdpCredential: true,
      }),
    },
  )

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    payload = undefined
  }

  if (!response.ok) {
    const message = readFirebaseErrorMessage(payload) ?? `HTTP_${response.status}`
    throw new FirebaseTokenExchangeError(`Firebase token exchange failed: ${message}`)
  }

  if (!isRecord(payload)) {
    throw new FirebaseTokenExchangeError("Firebase token exchange returned invalid payload.")
  }

  const firebaseIdToken = payload.idToken
  if (typeof firebaseIdToken !== "string" || firebaseIdToken.trim().length === 0) {
    throw new FirebaseTokenExchangeError("Firebase ID token not found in exchange response.")
  }

  return firebaseIdToken
}

async function resolveFirebaseIdTokenFromGoogleTokens(input: {
  idToken?: string
  accessToken?: string
}): Promise<string> {
  const idToken = input.idToken?.trim()
  const accessToken = input.accessToken?.trim()
  const errors: string[] = []

  if (idToken) {
    try {
      return await exchangeGoogleProviderTokenForFirebaseIdToken("id_token", idToken)
    } catch (error) {
      if (error instanceof Error) {
        errors.push(`id_token: ${error.message}`)
      } else {
        errors.push("id_token: unknown error")
      }
    }
  }

  if (accessToken) {
    try {
      return await exchangeGoogleProviderTokenForFirebaseIdToken("access_token", accessToken)
    } catch (error) {
      if (error instanceof Error) {
        errors.push(`access_token: ${error.message}`)
      } else {
        errors.push("access_token: unknown error")
      }
    }
  }

  if (errors.length > 0) {
    throw new FirebaseTokenExchangeError(errors.join(" | "))
  }

  throw new FirebaseTokenExchangeError("Google sign-in returned no token for Firebase exchange.")
}

export async function resolveGoogleFirebaseIdToken(): Promise<string> {
  const configuredTestToken = Config.BACKEND_AUTH_TEST_ID_TOKEN?.trim()
  if (configuredTestToken) {
    return configuredTestToken
  }

  ensureGoogleConfigured()

  try {
    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
    }

    const signInResponse = await GoogleSignin.signIn()
    if (isCancelledResponse(signInResponse)) {
      throw new GoogleSignInCancelledError("Google sign-in cancelled.")
    }

    const signedInIdToken = signInResponse.data.idToken?.trim()
    const tokens = await GoogleSignin.getTokens()
    return resolveFirebaseIdTokenFromGoogleTokens({
      idToken: signedInIdToken || tokens.idToken?.trim(),
      accessToken: tokens.accessToken?.trim(),
    })
  } catch (error) {
    if (error instanceof GoogleSignInCancelledError) {
      addCrashBreadcrumb("[auth] Google sign-in cancelled")
      throw error
    }
    if (error instanceof FirebaseTokenExchangeError) {
      recordGoogleSignInFailure("firebase_exchange", error)
      throw new GoogleSignInUnavailableError(error.message)
    }

    if (isErrorWithCode(error)) {
      recordGoogleSignInFailure("native_google_signin", error)

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new GoogleSignInCancelledError("Google sign-in cancelled.")
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new GoogleSignInUnavailableError(
          "Google Play Services not available on this device/emulator.",
        )
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new GoogleSignInUnavailableError("Google sign-in is already in progress.")
      }
      if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        throw new GoogleSignInUnavailableError("Google sign-in required.")
      }
      if (isAndroidDeveloperError(error)) {
        throw new GoogleSignInUnavailableError(
          "Google sign-in is misconfigured for this Android build. Check SHA fingerprints in Firebase/Google Cloud.",
        )
      }

      throw new GoogleSignInUnavailableError(error.message)
    }

    recordGoogleSignInFailure("unknown", error)
    throw error
  }

  throw new GoogleSignInUnavailableError("Google sign-in returned no Google ID token.")
}
