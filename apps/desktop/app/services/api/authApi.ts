import { GeneralApiProblem } from "./apiProblem"
import { backendApiClient, clearStoredAuthSession, saveStoredAuthSession } from "./backendClient"

type ApiResult<T> = { kind: "ok"; data: T } | GeneralApiProblem

type SignInResponsePayload = {
  user?: {
    id?: string
    email?: string
  }
  tokens?: {
    tokenType?: string
    accessToken?: string
    refreshToken?: string
    accessTokenExpiresInSec?: number
    refreshTokenExpiresInSec?: number
  }
}

export type AuthSessionPayload = {
  userId: string
  email?: string
  tokenType: string
  accessToken: string
  refreshToken: string
  accessTokenExpiresInSec?: number
  refreshTokenExpiresInSec?: number
}

export type AuthUserPayload = {
  id: string
  email: string
  name: string
  role: "user" | "admin"
}

export type AuthMePayload = {
  sessionId: string
  user: AuthUserPayload
  identity: {
    provider: string
    subject: string
    signInProvider?: string
    emailVerified?: boolean
  }
}

function mapAuthPayload(payload: SignInResponsePayload): AuthSessionPayload | undefined {
  const userId = payload.user?.id
  const accessToken = payload.tokens?.accessToken
  const refreshToken = payload.tokens?.refreshToken
  const tokenType = payload.tokens?.tokenType

  if (!userId || !accessToken || !refreshToken || !tokenType) {
    return undefined
  }

  return {
    userId,
    email: payload.user?.email,
    tokenType,
    accessToken,
    refreshToken,
    accessTokenExpiresInSec: payload.tokens?.accessTokenExpiresInSec,
    refreshTokenExpiresInSec: payload.tokens?.refreshTokenExpiresInSec,
  }
}

class AuthApi {
  async getReviewSignInStatus(): Promise<ApiResult<{ enabled: boolean }>> {
    return backendApiClient.get<{ enabled: boolean }>("/v1/auth/review/status")
  }

  async signInWithReview(
    email: string,
    password: string,
  ): Promise<ApiResult<AuthSessionPayload>> {
    const result = await backendApiClient.post<SignInResponsePayload>(
      "/v1/auth/review/sign-in",
      { email, password },
      { allowAuthRefresh: false },
    )
    if (result.kind !== "ok") return result

    const session = mapAuthPayload(result.data)
    if (!session) return { kind: "bad-data" }

    saveStoredAuthSession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      userId: session.userId,
    })

    return {
      kind: "ok",
      data: session,
    }
  }

  async signInWithFirebase(
    idToken: string,
    referralCode?: string,
  ): Promise<ApiResult<AuthSessionPayload>> {
    const result = await backendApiClient.post<SignInResponsePayload>(
      "/v1/auth/firebase/sign-in",
      { idToken, referralCode },
      { allowAuthRefresh: false },
    )
    if (result.kind !== "ok") return result

    const session = mapAuthPayload(result.data)
    if (!session) return { kind: "bad-data" }

    saveStoredAuthSession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      userId: session.userId,
    })

    return {
      kind: "ok",
      data: session,
    }
  }

  async logout(): Promise<void> {
    await backendApiClient.post("/v1/auth/logout", undefined, { allowAuthRefresh: false })
    clearStoredAuthSession("manual-logout")
  }

  async getMe(): Promise<ApiResult<AuthMePayload>> {
    return backendApiClient.get<AuthMePayload>("/v1/auth/me")
  }
}

export const authApi = new AuthApi()
