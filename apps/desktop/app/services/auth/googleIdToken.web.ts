import Config from "@/config"
import { addCrashBreadcrumb, ErrorType, reportCrash } from "@/utils/crashReporting"

export class GoogleSignInUnavailableError extends Error {}
export class GoogleSignInCancelledError extends Error {}
export class FirebaseTokenExchangeError extends Error {}

type ExchangeTokenType = "id_token" | "access_token"

let googleScriptPromise: Promise<void> | null = null

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

function readFirebaseErrorMessage(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined
  const errorNode = payload.error
  if (!isRecord(errorNode)) return undefined
  const message = errorNode.message
  return typeof message === "string" ? message : undefined
}

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
        requestUri: window.location.origin,
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

function loadGoogleIdentityScript(): Promise<void> {
  if (!isBrowserEnvironment()) {
    throw new GoogleSignInUnavailableError("Google sign-in requires a browser environment.")
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve()
  }

  if (googleScriptPromise) {
    return googleScriptPromise
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-vocorbit-google-gsi="true"]',
    )

    const handleLoad = () => resolve()
    const handleError = () => {
      googleScriptPromise = null
      reject(new GoogleSignInUnavailableError("Failed to load Google sign-in library."))
    }

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true })
      existingScript.addEventListener("error", handleError, { once: true })
      return
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.dataset.vocorbitGoogleGsi = "true"
    script.addEventListener("load", handleLoad, { once: true })
    script.addEventListener("error", handleError, { once: true })
    document.head.appendChild(script)
  })

  return googleScriptPromise
}

function requestGoogleAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const googleClient = window.google?.accounts?.oauth2
    if (!googleClient) {
      reject(new GoogleSignInUnavailableError("Google sign-in is not ready yet."))
      return
    }

    const tokenClient = googleClient.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response) => {
        if (response.error) {
          if (
            response.error === "access_denied" ||
            response.error === "popup_closed" ||
            response.error === "popup_closed_by_user"
          ) {
            reject(new GoogleSignInCancelledError("Google sign-in cancelled."))
            return
          }

          reject(
            new GoogleSignInUnavailableError(
              response.error_description || `Google sign-in failed: ${response.error}`,
            ),
          )
          return
        }

        const accessToken = response.access_token?.trim()
        if (!accessToken) {
          reject(new GoogleSignInUnavailableError("Google sign-in returned no access token."))
          return
        }

        resolve(accessToken)
      },
      error_callback: (error) => {
        if (error.type === "popup_closed") {
          reject(new GoogleSignInCancelledError("Google sign-in cancelled."))
          return
        }

        reject(
          new GoogleSignInUnavailableError(
            error.message?.trim() || `Google sign-in failed: ${error.type}`,
          ),
        )
      },
    })

    try {
      tokenClient.requestAccessToken({ prompt: "consent" })
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error("Google sign-in popup could not be opened.")
      reject(new GoogleSignInUnavailableError(normalizedError.message))
    }
  })
}

function recordGoogleSignInFailure(stage: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  addCrashBreadcrumb(`[auth] Google sign-in failure stage=${stage} | message=${message}`)
  reportCrash(new Error(message), ErrorType.HANDLED)
}

export async function resolveGoogleFirebaseIdToken(): Promise<string> {
  const configuredTestToken = Config.BACKEND_AUTH_TEST_ID_TOKEN?.trim()
  if (configuredTestToken) {
    return configuredTestToken
  }

  const webClientId = Config.GOOGLE_WEB_CLIENT_ID?.trim()
  if (!webClientId) {
    throw new GoogleSignInUnavailableError(
      "Missing GOOGLE_WEB_CLIENT_ID. Google sign-in is not configured for desktop.",
    )
  }

  try {
    await loadGoogleIdentityScript()
    const accessToken = await requestGoogleAccessToken(webClientId)
    return await exchangeGoogleProviderTokenForFirebaseIdToken("access_token", accessToken)
  } catch (error) {
    if (error instanceof GoogleSignInCancelledError) {
      addCrashBreadcrumb("[auth] Google sign-in cancelled")
      throw error
    }

    if (error instanceof FirebaseTokenExchangeError) {
      recordGoogleSignInFailure("firebase_exchange", error)
      throw new GoogleSignInUnavailableError(error.message)
    }

    recordGoogleSignInFailure("browser_google_signin", error)
    if (error instanceof GoogleSignInUnavailableError) {
      throw error
    }
    if (error instanceof Error) {
      throw new GoogleSignInUnavailableError(error.message)
    }
    throw new GoogleSignInUnavailableError("Google sign-in failed.")
  }
}
