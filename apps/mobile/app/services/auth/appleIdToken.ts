import { Platform } from "react-native"
import * as AppleAuthentication from "expo-apple-authentication"
import * as Crypto from "expo-crypto"

import Config from "@/config"

export class AppleSignInUnavailableError extends Error {}
export class AppleSignInCancelledError extends Error {}
class FirebaseTokenExchangeError extends Error {}

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

function createRandomNonce(length = 32): string {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  const randomBytes = Crypto.getRandomBytes(length)
  let nonce = ""
  for (let index = 0; index < randomBytes.length; index += 1) {
    nonce += alphabet[randomBytes[index] % alphabet.length]
  }
  return nonce
}

function isAppleCancelError(error: unknown): boolean {
  if (!isRecord(error)) return false
  const code = error.code
  return code === "ERR_REQUEST_CANCELED"
}

async function exchangeAppleIdentityTokenForFirebaseIdToken(
  identityToken: string,
  rawNonce: string,
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
        postBody: `id_token=${encodeURIComponent(identityToken)}&providerId=apple.com&nonce=${encodeURIComponent(rawNonce)}`,
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

export async function isAppleSignInSupported(): Promise<boolean> {
  if (Platform.OS !== "ios") return false
  try {
    return await AppleAuthentication.isAvailableAsync()
  } catch {
    return false
  }
}

export async function resolveAppleFirebaseIdToken(): Promise<string> {
  const configuredTestToken = Config.BACKEND_AUTH_TEST_ID_TOKEN?.trim()
  if (configuredTestToken) {
    return configuredTestToken
  }

  if (!(await isAppleSignInSupported())) {
    throw new AppleSignInUnavailableError("Apple sign in is unavailable on this device.")
  }

  const rawNonce = createRandomNonce()
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce)

  let credential: AppleAuthentication.AppleAuthenticationCredential
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    })
  } catch (error) {
    if (isAppleCancelError(error)) {
      throw new AppleSignInCancelledError("Apple sign in cancelled.")
    }
    if (error instanceof Error) {
      throw new AppleSignInUnavailableError(error.message)
    }
    throw new AppleSignInUnavailableError("Apple sign in failed.")
  }

  const identityToken = credential.identityToken?.trim()
  if (!identityToken) {
    throw new AppleSignInUnavailableError("Apple sign in returned no identity token.")
  }

  try {
    return await exchangeAppleIdentityTokenForFirebaseIdToken(identityToken, rawNonce)
  } catch (error) {
    if (error instanceof FirebaseTokenExchangeError) {
      throw new AppleSignInUnavailableError(error.message)
    }
    throw error
  }
}
