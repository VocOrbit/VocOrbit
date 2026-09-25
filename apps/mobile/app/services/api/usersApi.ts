import { GeneralApiProblem } from "./apiProblem"
import { backendApiClient } from "./backendClient"

type ApiResult<T> = { kind: "ok"; data: T } | GeneralApiProblem

class UsersApi {
  async deleteUser(id: string): Promise<ApiResult<{ id: string }>> {
    return backendApiClient.delete<{ id: string }>(`/v1/users/${encodeURIComponent(id)}`)
  }
}

export const usersApi = new UsersApi()
