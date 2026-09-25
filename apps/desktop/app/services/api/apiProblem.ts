import { ApiResponse } from "apisauce"

export type GeneralApiProblem =
  /**
   * Times up.
   */
  | { kind: "timeout"; temporary: true }
  /**
   * Cannot connect to the server for some reason.
   */
  | { kind: "cannot-connect"; temporary: true }
  /**
   * The server experienced a problem. Any 5xx error.
   */
  | { kind: "server"; message?: string; code?: string; requestId?: string }
  /**
   * We're not allowed because we haven't identified ourself. This is 401.
   */
  | { kind: "unauthorized"; message?: string; code?: string; requestId?: string }
  /**
   * We don't have access to perform that request. This is 403.
   */
  | { kind: "forbidden"; message?: string; code?: string; requestId?: string }
  /**
   * Unable to find that resource.  This is a 404.
   */
  | { kind: "not-found"; message?: string; code?: string; requestId?: string }
  /**
   * All other 4xx series errors.
   */
  | { kind: "rejected"; message?: string; code?: string; requestId?: string }
  /**
   * Something truly unexpected happened. Most likely can try again. This is a catch all.
   */
  | { kind: "unknown"; temporary: true }
  /**
   * The data we received is not in the expected format.
   */
  | { kind: "bad-data" }

/**
 * Attempts to get a common cause of problems from an api response.
 *
 * @param response The api response.
 */
export function getGeneralApiProblem(response: ApiResponse<any>): GeneralApiProblem | null {
  const parseErrorMeta = (): { message?: string; code?: string; requestId?: string } => {
    const data = response.data
    const headers = response.headers as Record<string, string | undefined> | undefined
    const headerRequestId =
      headers?.["x-request-id"] ??
      headers?.["X-Request-Id"] ??
      headers?.["x-request-id".toLowerCase()]

    if (typeof data === "string") {
      return {
        message: data.trim().slice(0, 280) || undefined,
        requestId: headerRequestId,
      }
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { requestId: headerRequestId }
    }

    const maybeError = (data as { error?: unknown }).error
    if (!maybeError || typeof maybeError !== "object" || Array.isArray(maybeError)) {
      return { requestId: headerRequestId }
    }

    const error = maybeError as {
      message?: unknown
      code?: unknown
      requestId?: unknown
    }

    return {
      message: typeof error.message === "string" ? error.message : undefined,
      code: typeof error.code === "string" ? error.code : undefined,
      requestId:
        typeof error.requestId === "string"
          ? error.requestId
          : headerRequestId,
    }
  }

  const errorMeta = parseErrorMeta()

  switch (response.problem) {
    case "CONNECTION_ERROR":
      return { kind: "cannot-connect", temporary: true }
    case "NETWORK_ERROR":
      return { kind: "cannot-connect", temporary: true }
    case "TIMEOUT_ERROR":
      return { kind: "timeout", temporary: true }
    case "SERVER_ERROR":
      return { kind: "server", ...errorMeta }
    case "UNKNOWN_ERROR":
      return { kind: "unknown", temporary: true }
    case "CLIENT_ERROR":
      switch (response.status) {
        case 401:
          return { kind: "unauthorized", ...errorMeta }
        case 403:
          return { kind: "forbidden", ...errorMeta }
        case 404:
          return { kind: "not-found", ...errorMeta }
        default:
          return { kind: "rejected", ...errorMeta }
      }
    case "CANCEL_ERROR":
      return null
  }

  return null
}
