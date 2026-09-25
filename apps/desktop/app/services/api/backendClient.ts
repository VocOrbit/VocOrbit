import { ApiResponse, ApisauceInstance, create } from "apisauce"

import { resolveBackendBaseUrl } from "@/services/region/homeRegion"
import { readAuthSessionFromKeychain } from "@/utils/sharedKeychain"
import { storage } from "@/utils/storage"

import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"

type ApiResult<T> = { kind: "ok"; data: T } | GeneralApiProblem

type BackendSuccessEnvelope<T> = {
  data: T
  meta?: Record<string, unknown>
}

type BackendErrorEnvelope = {
  error?: {
    code?: string
    message?: string
    requestId?: string
    details?: unknown
  }
}

type HttpMethod = "get" | "post" | "put" | "delete"

const ACCESS_TOKEN_KEY = "AuthProvider.authToken"
const REFRESH_TOKEN_KEY = "AuthProvider.refreshToken"
const USER_ID_KEY = "AuthProvider.userId"

type StoredAuthSession = {
  accessToken: string
  refreshToken?: string
  userId?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function normalizeToken(value: string | undefined): string | undefined {
  if (!value) return undefined
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function readAuthPayload(
  payload: unknown,
): { accessToken: string; refreshToken: string; userId?: string } | undefined {
  if (!isRecord(payload)) return undefined

  const tokens = payload.tokens
  if (!isRecord(tokens)) return undefined

  const accessToken = tokens.accessToken
  const refreshToken = tokens.refreshToken
  if (typeof accessToken !== "string" || accessToken.length === 0) return undefined
  if (typeof refreshToken !== "string" || refreshToken.length === 0) return undefined

  const user = payload.user
  const userId =
    isRecord(user) && typeof user.id === "string" && user.id.length > 0 ? user.id : undefined

  return {
    accessToken,
    refreshToken,
    userId,
  }
}

export function loadStoredAuthSession(): StoredAuthSession | undefined {
  const accessToken = storage.getString(ACCESS_TOKEN_KEY)
  if (!accessToken) return undefined

  const refreshToken = storage.getString(REFRESH_TOKEN_KEY) ?? undefined
  const userId = storage.getString(USER_ID_KEY) ?? undefined

  return {
    accessToken,
    refreshToken,
    userId,
  }
}

export function saveStoredAuthSession(session?: StoredAuthSession): void {
  if (!session?.accessToken) {
    storage.delete(ACCESS_TOKEN_KEY)
    storage.delete(REFRESH_TOKEN_KEY)
    storage.delete(USER_ID_KEY)
    return
  }

  storage.set(ACCESS_TOKEN_KEY, session.accessToken)

  if (session.refreshToken) {
    storage.set(REFRESH_TOKEN_KEY, session.refreshToken)
  } else {
    storage.delete(REFRESH_TOKEN_KEY)
  }

  if (session.userId) {
    storage.set(USER_ID_KEY, session.userId)
  } else {
    storage.delete(USER_ID_KEY)
  }
}

export function clearStoredAuthSession(reason?: string): void {
  if (__DEV__) {
    console.warn("[auth] clearStoredAuthSession", reason ?? "unspecified")
  }
  saveStoredAuthSession(undefined)
}

export class BackendApiClient {
  private apisauce: ApisauceInstance
  private currentBaseUrl: string
  private refreshInFlight: Promise<boolean> | null = null

  constructor() {
    const initialBaseUrl = resolveBackendBaseUrl()
    this.currentBaseUrl = initialBaseUrl
    this.apisauce = create({
      baseURL: initialBaseUrl,
      timeout: 15000,
      headers: {
        Accept: "application/json",
      },
    })
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<ApiResult<T>> {
    const response = await this.request<T>(
      "get",
      path,
      {
        params,
      },
      false,
    )
    return this.toResult(response)
  }

  async post<T>(
    path: string,
    body?: unknown,
    options?: { allowAuthRefresh?: boolean },
  ): Promise<ApiResult<T>> {
    const response = await this.request<T>(
      "post",
      path,
      {
        body,
      },
      options?.allowAuthRefresh === false,
    )
    return this.toResult(response)
  }

  async put<T>(
    path: string,
    body?: unknown,
    options?: { allowAuthRefresh?: boolean },
  ): Promise<ApiResult<T>> {
    const response = await this.request<T>(
      "put",
      path,
      {
        body,
      },
      options?.allowAuthRefresh === false,
    )
    return this.toResult(response)
  }

  async delete<T>(
    path: string,
    options?: { allowAuthRefresh?: boolean },
  ): Promise<ApiResult<T>> {
    const response = await this.request<T>(
      "delete",
      path,
      {},
      options?.allowAuthRefresh === false,
    )
    return this.toResult(response)
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    options: {
      params?: Record<string, unknown>
      body?: unknown
    },
    disableAuthRefresh = false,
    hasRetried = false,
  ): Promise<ApiResponse<BackendSuccessEnvelope<T> | BackendErrorEnvelope>> {
    this.syncBaseUrlFromRegionSelection()

    const session = loadStoredAuthSession()
    const headers = session?.accessToken
      ? {
          Authorization: `Bearer ${session.accessToken}`,
        }
      : undefined

    const requestOptions = headers ? { headers } : undefined

    const response =
      method === "get"
        ? await this.apisauce.get<BackendSuccessEnvelope<T> | BackendErrorEnvelope>(
            path,
            options.params,
            requestOptions,
          )
        : method === "post"
          ? await this.apisauce.post<BackendSuccessEnvelope<T> | BackendErrorEnvelope>(
              path,
              options.body,
              requestOptions,
            )
          : method === "put"
            ? await this.apisauce.put<BackendSuccessEnvelope<T> | BackendErrorEnvelope>(
                path,
                options.body,
                requestOptions,
              )
            : await this.apisauce.delete<BackendSuccessEnvelope<T> | BackendErrorEnvelope>(
                path,
                undefined,
                requestOptions,
              )

    if (__DEV__ && response.status === 401) {
      const dataType = Array.isArray(response.data) ? "array" : typeof response.data
      const responseHeaders = response.headers as Record<string, string | undefined> | undefined
      const requestIdHeader =
        responseHeaders?.["x-request-id"] ??
        responseHeaders?.["X-Request-Id"] ??
        responseHeaders?.["x-request-id".toLowerCase()]
      console.warn("[api] 401 received", {
        baseUrl: this.currentBaseUrl,
        path,
        method,
        status: response.status,
        responseProblem: response.problem,
        dataType,
        hasData: response.data !== null && response.data !== undefined,
        requestId: requestIdHeader,
      })
    }

    if (
      response.status === 401 &&
      !disableAuthRefresh &&
      !hasRetried &&
      path !== "/v1/auth/firebase/sign-in" &&
      path !== "/v1/auth/refresh"
    ) {
      const refreshed = await this.tryRefreshWithStoredToken()
      if (refreshed) {
        return this.request<T>(method, path, options, disableAuthRefresh, true)
      }
      return response
    }

    if (
      response.status === 401 &&
      (path === "/v1/auth/refresh" || path === "/v1/auth/logout" || path === "/v1/auth/me")
    ) {
      clearStoredAuthSession(`request:${path}:status401`)
    }

    return response
  }

  private async tryRefreshWithStoredToken(): Promise<boolean> {
    this.syncBaseUrlFromRegionSelection()
    if (this.refreshInFlight) {
      return this.refreshInFlight
    }

    this.refreshInFlight = (async () => {
      let session = loadStoredAuthSession()
      let refreshToken = normalizeToken(session?.refreshToken)
      if (!refreshToken) {
        const restored = await this.restoreStoredAuthSessionFromKeychain()
        if (restored) {
          session = loadStoredAuthSession()
          refreshToken = normalizeToken(session?.refreshToken)
        }
      }

      if (!refreshToken) {
        clearStoredAuthSession("refresh:missing-token")
        return false
      }

      const refreshResponse = await this.apisauce.post<
        BackendSuccessEnvelope<unknown> | BackendErrorEnvelope
      >("/v1/auth/refresh", {
        refreshToken,
      })

      if (!refreshResponse.ok) {
        if (refreshResponse.status === 401 || refreshResponse.status === 403) {
          const restored = await this.restoreStoredAuthSessionFromKeychain(refreshToken)
          if (restored) {
            return true
          }
          this.clearStoredAuthSessionIfRefreshTokenUnchanged(refreshToken, "refresh-unauthorized")
        }
        return false
      }

      const envelope = refreshResponse.data
      if (!isRecord(envelope) || !("data" in envelope)) {
        const restored = await this.restoreStoredAuthSessionFromKeychain(refreshToken)
        if (restored) {
          return true
        }
        this.clearStoredAuthSessionIfRefreshTokenUnchanged(refreshToken, "invalid-envelope")
        return false
      }

      const payload = envelope.data
      const parsed = readAuthPayload(payload)
      if (!parsed) {
        const restored = await this.restoreStoredAuthSessionFromKeychain(refreshToken)
        if (restored) {
          return true
        }
        this.clearStoredAuthSessionIfRefreshTokenUnchanged(refreshToken, "invalid-payload")
        return false
      }

      saveStoredAuthSession({
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        userId: parsed.userId ?? session?.userId,
      })

      return true
    })()

    try {
      return await this.refreshInFlight
    } finally {
      this.refreshInFlight = null
    }
  }

  private async restoreStoredAuthSessionFromKeychain(
    attemptedRefreshToken?: string,
  ): Promise<boolean> {
    const keychainSession = await readAuthSessionFromKeychain().catch(() => undefined)
    const keychainAccessToken = normalizeToken(keychainSession?.accessToken)
    const keychainRefreshToken = normalizeToken(keychainSession?.refreshToken)
    if (!keychainAccessToken || !keychainRefreshToken) {
      return false
    }

    const currentSession = loadStoredAuthSession()
    const currentAccessToken = normalizeToken(currentSession?.accessToken)
    const currentRefreshToken = normalizeToken(currentSession?.refreshToken)
    const normalizedAttemptedRefreshToken = normalizeToken(attemptedRefreshToken)

    if (normalizedAttemptedRefreshToken && keychainRefreshToken === normalizedAttemptedRefreshToken) {
      return false
    }

    const currentUserId = currentSession?.userId
    const keychainUserId = keychainSession?.userId
    if (
      keychainAccessToken === currentAccessToken &&
      keychainRefreshToken === currentRefreshToken &&
      keychainUserId === currentUserId
    ) {
      return false
    }

    saveStoredAuthSession({
      accessToken: keychainAccessToken,
      refreshToken: keychainRefreshToken,
      userId: keychainUserId ?? currentUserId,
    })
    return true
  }

  private clearStoredAuthSessionIfRefreshTokenUnchanged(
    attemptedRefreshToken: string,
    reason: string,
  ): void {
    const currentRefreshToken = normalizeToken(loadStoredAuthSession()?.refreshToken)
    const normalizedAttemptedRefreshToken = normalizeToken(attemptedRefreshToken)
    if (!currentRefreshToken || currentRefreshToken === normalizedAttemptedRefreshToken) {
      clearStoredAuthSession(`refresh:${reason}`)
    }
  }

  private toResult<T>(
    response: ApiResponse<BackendSuccessEnvelope<T> | BackendErrorEnvelope>,
  ): ApiResult<T> {
    if (!response.ok) {
      return getGeneralApiProblem(response) ?? { kind: "unknown", temporary: true }
    }

    const envelope = response.data
    if (!isRecord(envelope) || !("data" in envelope)) {
      return { kind: "bad-data" }
    }

    return {
      kind: "ok",
      data: envelope.data as T,
    }
  }

  private syncBaseUrlFromRegionSelection() {
    const nextBaseUrl = resolveBackendBaseUrl()
    if (!nextBaseUrl || nextBaseUrl === this.currentBaseUrl) return
    this.apisauce.setBaseURL(nextBaseUrl)
    this.currentBaseUrl = nextBaseUrl
  }
}

export const backendApiClient = new BackendApiClient()
