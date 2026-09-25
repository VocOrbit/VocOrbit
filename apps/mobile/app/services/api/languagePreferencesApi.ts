import type { GeneralApiProblem } from "./apiProblem"
import { backendApiClient } from "./backendClient"

type ApiResult<T> = { kind: "ok"; data: T } | GeneralApiProblem

export type UserLanguagePreferencesPayload = {
  userId: string
  l1Language: string
  l2Language: string
  updatedAt: string
}

class LanguagePreferencesApi {
  async getLanguagePreferences(userId: string): Promise<ApiResult<UserLanguagePreferencesPayload>> {
    return backendApiClient.get<UserLanguagePreferencesPayload>(`/v1/users/${userId}/preferences/language`)
  }

  async setLanguagePreferences(
    userId: string,
    input: { l1Language: string; l2Language: string },
  ): Promise<ApiResult<UserLanguagePreferencesPayload>> {
    return backendApiClient.put<UserLanguagePreferencesPayload>(
      `/v1/users/${userId}/preferences/language`,
      input,
    )
  }
}

export const languagePreferencesApi = new LanguagePreferencesApi()
