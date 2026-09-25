import { GeneralApiProblem } from "./apiProblem"
import { backendApiClient, loadStoredAuthSession } from "./backendClient"

import { resolveBackendBaseUrl } from "@/services/region/homeRegion"
import { delay } from "@/utils/delay"

type ApiResult<T> = { kind: "ok"; data: T } | GeneralApiProblem

export type LookupMode = "basic" | "advanced"
export type LearningItemStatus = "active" | "learned" | "deleted"
export type LearningItemListStatus = LearningItemStatus | "all"

export type WordInsightLearningItem = {
  id: string
  userId: string
  lemma: string
  vocab: string
  sourceLang: string
  targetLang: string
  status: LearningItemStatus
  encounterCount: number
  lastSeenMode: LookupMode
  lastMeaning: string
  targetMeaning: string
  phonetic?: string
  definitionL2: string
  translationL1?: string
  whyThisSense?: string
  contextSentence?: string
  isFavorite: boolean
  favoritedAt?: string
  latestLookupId?: string
  lastLookupAt: string
  learnedAt?: string
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

export type WordInsightLookupSummary = {
  meaning: string
  shortExplanation: string
  confidence: number
}

export type WordInsightLookupDetail = {
  id: string
  requestId: string
  mode: LookupMode
  vocab: string
  sentence: string
  sourceLang: string
  targetLang: string
  responseSummary?: WordInsightLookupSummary
  responsePayload?: Record<string, unknown>
  createdAt: string
}

export type WordInsightLearningItemDetail = {
  item: WordInsightLearningItem
  latestLookup?: WordInsightLookupDetail
}

export type WordInsightLearningItemGroup = {
  id: string
  userId: string
  name: string
  itemCount: number
  createdAt: string
  updatedAt: string
}

export type WordInsightLearningItemMasteryGroup = {
  id: string
  name: string
  itemCount: number
  activeItemCount: number
  learnedItemCount: number
}

export type WordInsightLearningItemMasterySummary = {
  activeItemCount: number
  learnedItemCount: number
  totalItemCount: number
  weeklyStudiedItemCount: number
  weeklyLearnedItemCount: number
  topGroups: WordInsightLearningItemMasteryGroup[]
}

export type WordInsightLearningItemIssueReport = {
  id: string
  userId: string
  itemId: string
  lookupId?: string
  message: string
  status: "open" | "resolved" | "dismissed"
  createdAt: string
  updatedAt: string
}

export type WordInsightExplainJobStatus = "queued" | "processing" | "completed" | "failed"

export type WordInsightExplainInput = {
  mode?: LookupMode
  sentence: string
  selectedWord: string
  sourceLang?: string
  targetLang?: string
}

export type WordInsightExplainJobAccepted = {
  jobId: string
  status: WordInsightExplainJobStatus
}

export type WordInsightWaitTransport = "direct" | "ws" | "polling"

type WordInsightExplainDirectResponse = {
  status: "completed"
  result: {
    mode: LookupMode
    lookupId: string
    insight: Record<string, unknown>
  }
}

export type WordInsightExplainJob = {
  id: string
  status: WordInsightExplainJobStatus
  input: WordInsightExplainInput
  transport?: WordInsightWaitTransport
  transportDetail?: string
  errorCode?: string
  errorMessage?: string
  result?: {
    mode: LookupMode
    lookupId: string
    insight?: Record<string, unknown>
  }
}

type WaitForExplainJobOptions = {
  timeoutMs?: number
  pollIntervalMs?: number
  maxPollAttempts?: number
}

type WaitStrategy = "polling-first" | "ws-first"
type WsWaitOutcome = {
  response: ApiResult<WordInsightExplainJob>
  failureDetail?: string
}

type WordInsightJobSnapshot = {
  id: string
  status: WordInsightExplainJobStatus
  errorCode?: string
  errorMessage?: string
}

type WordInsightWsError = {
  code?: string
}

type ListLearningItemsInput = {
  status?: LearningItemListStatus
  limit?: number
  offset?: number
  favorite?: boolean
  q?: string
}

export type WordInsightCreditBalances = {
  freeBasic: number
  freeAdvanced: number
  paidBasic: number
  paidAdvanced: number
}

const DEFAULT_WAIT_TIMEOUT_MS = 90_000
const DEFAULT_WS_CONNECT_TIMEOUT_MS = 4_000
const DEFAULT_WS_WAIT_BEFORE_POLL_MS = 800
const DEFAULT_POLL_INTERVAL_MS = 150
const DEFAULT_MAX_POLL_ATTEMPTS = 300

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isTerminalStatus(status: WordInsightExplainJobStatus): boolean {
  return status === "completed" || status === "failed"
}

function mapWsErrorToProblem(error: WordInsightWsError): GeneralApiProblem {
  switch (error.code) {
    case "UNAUTHORIZED":
      return { kind: "unauthorized", code: "UNAUTHORIZED" }
    case "TOO_MANY_CONNECTIONS":
      return { kind: "forbidden" }
    case "VALIDATION_ERROR":
      return { kind: "rejected" }
    default:
      return { kind: "unknown", temporary: true }
  }
}

function readWsMessage(raw: unknown): Record<string, unknown> | undefined {
  if (typeof raw !== "string") return undefined
  try {
    const parsed = JSON.parse(raw)
    return isRecord(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

function readWsError(message: Record<string, unknown>): WordInsightWsError | undefined {
  if (message.type !== "error") return undefined
  const code = typeof message.code === "string" ? message.code : undefined
  return { code }
}

function readWsJobSnapshot(message: Record<string, unknown>): WordInsightJobSnapshot | undefined {
  if (message.type !== "word_insight_job") return undefined
  const data = message.data
  if (!isRecord(data)) return undefined

  const id = typeof data.id === "string" ? data.id : undefined
  const status = data.status
  if (!id) return undefined
  if (status !== "queued" && status !== "processing" && status !== "completed" && status !== "failed") {
    return undefined
  }

  return {
    id,
    status,
    errorCode: typeof data.errorCode === "string" ? data.errorCode : undefined,
    errorMessage: typeof data.errorMessage === "string" ? data.errorMessage : undefined,
  }
}

function buildWordInsightJobsWsUrl(accessToken: string): string | undefined {
  const baseUrl = resolveBackendBaseUrl()
  if (!baseUrl) return undefined

  let url: URL
  try {
    url = new URL(baseUrl)
  } catch {
    return undefined
  }

  if (url.protocol === "https:") {
    url.protocol = "wss:"
  } else if (url.protocol === "http:") {
    url.protocol = "ws:"
  } else {
    return undefined
  }

  const normalizedPath = url.pathname.replace(/\/+$/, "")
  const basePath = normalizedPath.length > 0 ? normalizedPath : ""
  const wsPath = basePath.endsWith("/v1")
    ? `${basePath}/word-insight/ws/jobs`
    : `${basePath}/v1/word-insight/ws/jobs`
  url.pathname = wsPath.replace(/\/{2,}/g, "/")
  url.searchParams.set("token", accessToken)

  return url.toString()
}

function buildFallbackTerminalJob(jobId: string, snapshot: WordInsightJobSnapshot): WordInsightExplainJob {
  return {
    id: jobId,
    status: snapshot.status,
    input: {
      sentence: "",
      selectedWord: "",
    },
    errorCode: snapshot.errorCode,
    errorMessage: snapshot.errorMessage,
  }
}

function withExplainTransport(
  input: ApiResult<WordInsightExplainJob>,
  transport: WordInsightWaitTransport,
  transportDetail?: string,
): ApiResult<WordInsightExplainJob> {
  if (input.kind !== "ok") return input
  return {
    kind: "ok",
    data: {
      ...input.data,
      transport,
      transportDetail,
    },
  }
}

function describeProblem(problem: GeneralApiProblem): string {
  switch (problem.kind) {
    case "timeout":
      return "timeout"
    case "cannot-connect":
      return "cannot-connect"
    case "unauthorized":
      return `unauthorized${problem.code ? `:${problem.code}` : ""}`
    case "forbidden":
      return `forbidden${problem.code ? `:${problem.code}` : ""}`
    case "rejected":
      return `rejected${problem.code ? `:${problem.code}` : ""}`
    case "server":
      return `server${problem.code ? `:${problem.code}` : ""}`
    case "unknown":
      return "unknown"
    case "bad-data":
      return "bad-data"
    case "not-found":
      return `not-found${problem.code ? `:${problem.code}` : ""}`
  }
}

function shouldLogWsFallback(problem: GeneralApiProblem): boolean {
  if (
    problem.kind === "cannot-connect" ||
    problem.kind === "timeout" ||
    problem.kind === "unauthorized" ||
    problem.kind === "forbidden"
  ) {
    return false
  }
  return true
}

function shouldFallbackToQueuedAfterDirect(problem: GeneralApiProblem): boolean {
  switch (problem.kind) {
    case "not-found":
    case "server":
    case "timeout":
    case "cannot-connect":
    case "unknown":
      return true
    case "rejected": {
      const code = problem.code?.toLowerCase() ?? ""
      const message = problem.message?.toLowerCase() ?? ""
      return (
        code.includes("model_output_") ||
        code.includes("word_insight_") ||
        message.includes("model_output_") ||
        message.includes("word_insight_")
      )
    }
    default:
      return false
  }
}

function shouldPreferQueuedFlow(input: WordInsightExplainInput): boolean {
  return input.mode === "advanced"
}

class WordInsightApi {
  async enqueueExplain(input: WordInsightExplainInput): Promise<ApiResult<WordInsightExplainJobAccepted>> {
    return backendApiClient.post<WordInsightExplainJobAccepted>("/v1/word-insight/explain", input)
  }

  async explainDirect(
    input: WordInsightExplainInput,
  ): Promise<ApiResult<WordInsightExplainDirectResponse>> {
    return backendApiClient.post<WordInsightExplainDirectResponse>(
      "/v1/word-insight/explain/direct",
      input,
    )
  }

  async runExplainAndWait(
    input: WordInsightExplainInput,
    options: WaitForExplainJobOptions = {},
  ): Promise<ApiResult<WordInsightExplainJob>> {
    const normalizedInput: WordInsightExplainInput = {
      ...input,
      mode: input.mode ?? "basic",
    }

    if (shouldPreferQueuedFlow(normalizedInput)) {
      const enqueueResponse = await this.enqueueExplain(normalizedInput)
      if (enqueueResponse.kind !== "ok") {
        return enqueueResponse
      }
      return this.waitForExplainJobUntilTerminal(enqueueResponse.data.jobId, options, "ws-first")
    }

    const directResponse = await this.explainDirect(normalizedInput)
    if (directResponse.kind === "ok") {
      return {
        kind: "ok",
        data: {
          id: `direct-${directResponse.data.result.lookupId}`,
          status: directResponse.data.status,
          input: normalizedInput,
          transport: "direct",
          result: directResponse.data.result,
        },
      }
    }

    if (!shouldFallbackToQueuedAfterDirect(directResponse)) {
      return directResponse
    }

    if (__DEV__) {
      console.warn(
        "Word insight direct explain endpoint is unavailable. Falling back to queued flow.",
        directResponse,
      )
    }

    const enqueueResponse = await this.enqueueExplain(normalizedInput)
    if (enqueueResponse.kind !== "ok") {
      return enqueueResponse
    }

    return this.waitForExplainJobUntilTerminal(enqueueResponse.data.jobId, options, "polling-first")
  }

  async getExplainJob(
    jobId: string,
    options: { includeInsight?: boolean } = {},
  ): Promise<ApiResult<WordInsightExplainJob>> {
    const includeInsight = options.includeInsight === true ? "true" : "false"
    return backendApiClient.get<WordInsightExplainJob>(
      `/v1/word-insight/jobs/${jobId}?includeInsight=${includeInsight}`,
    )
  }

  private async waitForExplainJobUntilTerminal(
    jobId: string,
    options: WaitForExplainJobOptions,
    strategy: WaitStrategy = "polling-first",
  ): Promise<ApiResult<WordInsightExplainJob>> {
    if (strategy === "ws-first") {
      const wsOutcome = await this.waitForExplainJobViaWs(jobId, options, { primary: true })
      const wsResponse = wsOutcome.response
      if (wsResponse.kind === "ok") {
        return withExplainTransport(wsResponse, "ws")
      }

      if (__DEV__ && shouldLogWsFallback(wsResponse)) {
        console.warn("Word insight WS wait failed, falling back to polling.", wsResponse)
      }

      const pollingResponse = await this.waitForExplainJobViaPolling(jobId, options)
      if (pollingResponse.kind === "ok") {
        const wsFailureSuffix = wsOutcome.failureDetail ? `:${wsOutcome.failureDetail}` : ""
        return withExplainTransport(
          pollingResponse,
          "polling",
          `fallback_after_ws:${describeProblem(wsResponse)}${wsFailureSuffix}`,
        )
      }

      return pollingResponse
    }

    const pollingResponse = await this.waitForExplainJobViaPolling(jobId, options)
    if (pollingResponse.kind === "ok") {
      return withExplainTransport(pollingResponse, "polling")
    }

    if (__DEV__) {
      console.warn("Word insight polling wait failed, falling back to WS.", pollingResponse)
    }

    const wsOutcome = await this.waitForExplainJobViaWs(jobId, options)
    const wsResponse = wsOutcome.response
    if (wsResponse.kind === "ok") {
      return withExplainTransport(wsResponse, "ws")
    }

    if (__DEV__ && shouldLogWsFallback(wsResponse)) {
      console.warn("Word insight WS wait failed after polling fallback.", wsResponse)
    }

    return pollingResponse
  }

  private async waitForExplainJobViaWs(
    jobId: string,
    options: WaitForExplainJobOptions,
    wsOptions: { primary?: boolean } = {},
  ): Promise<WsWaitOutcome> {
    const accessToken = loadStoredAuthSession()?.accessToken
    if (!accessToken) {
      return {
        response: { kind: "unauthorized" },
        failureDetail: "missing_access_token",
      }
    }

    const wsUrl = buildWordInsightJobsWsUrl(accessToken)
    if (!wsUrl) {
      return {
        response: { kind: "unknown", temporary: true },
        failureDetail: "invalid_ws_url",
      }
    }

    const timeoutMs = Math.max(1_000, Math.floor(options.timeoutMs ?? DEFAULT_WAIT_TIMEOUT_MS))
    const wsWaitTimeoutMs = wsOptions.primary
      ? timeoutMs
      : Math.min(timeoutMs, DEFAULT_WS_WAIT_BEFORE_POLL_MS)
    const connectTimeoutMs = Math.min(wsWaitTimeoutMs, DEFAULT_WS_CONNECT_TIMEOUT_MS)

    return new Promise((resolve) => {
      let settled = false
      let socket: WebSocket | undefined
      let waitTimer: ReturnType<typeof setTimeout> | undefined
      let connectTimer: ReturnType<typeof setTimeout> | undefined
      let didReceiveReady = false
      let didSendSubscribe = false
      let closeDebugDetail: string | undefined

      const cleanup = () => {
        if (waitTimer) clearTimeout(waitTimer)
        if (connectTimer) clearTimeout(connectTimer)
        if (!socket) return
        socket.onopen = null
        socket.onmessage = null
        socket.onerror = null
        socket.onclose = null
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          try {
            socket.close()
          } catch {
            // no-op
          }
        }
      }

      const finish = (result: ApiResult<WordInsightExplainJob>, failureDetail?: string) => {
        if (settled) return
        settled = true
        cleanup()
        resolve({
          response: result,
          failureDetail,
        })
      }

      const tryFinishWithHttpSnapshot = () => {
        void this.getExplainJob(jobId, { includeInsight: true })
          .then((jobResponse) => {
            if (settled) return
            if (jobResponse.kind === "ok" && isTerminalStatus(jobResponse.data.status)) {
              finish(jobResponse)
              return
            }
            finish(
              { kind: "cannot-connect", temporary: true },
              closeDebugDetail ?? "close_after_subscribe_non_terminal",
            )
          })
          .catch(() => {
            if (settled) return
            finish(
              { kind: "cannot-connect", temporary: true },
              closeDebugDetail ?? "close_after_subscribe_snapshot_error",
            )
          })
      }

      try {
        socket = new WebSocket(wsUrl)
      } catch {
        finish({ kind: "cannot-connect", temporary: true }, "constructor_error")
        return
      }

      waitTimer = setTimeout(() => {
        finish(
          { kind: "timeout", temporary: true },
          wsOptions.primary ? "ws_primary_wait_timeout" : "ws_fallback_wait_timeout",
        )
      }, wsWaitTimeoutMs)

      connectTimer = setTimeout(() => {
        finish({ kind: "timeout", temporary: true }, "ws_connect_timeout")
      }, connectTimeoutMs)

      socket.onopen = () => {
        if (connectTimer) clearTimeout(connectTimer)
      }

      socket.onmessage = (event) => {
        const message = readWsMessage(event.data)
        if (!message) return

        if (message.type === "ready") {
          didReceiveReady = true
          if (!didSendSubscribe) {
            socket?.send(
              JSON.stringify({
                type: "subscribe",
                jobId,
              }),
            )
            didSendSubscribe = true
          }
          return
        }

        if (message.type === "subscribed") {
          didSendSubscribe = true
          return
        }

        const wsError = readWsError(message)
        if (wsError) {
          finish(mapWsErrorToProblem(wsError), `ws_error:${wsError.code ?? "unknown"}`)
          return
        }

        if (!didSendSubscribe) {
          // Wait until server confirms authenticated/ready before consuming events.
          if (!didReceiveReady) return
          socket?.send(
            JSON.stringify({
              type: "subscribe",
              jobId,
            }),
          )
          didSendSubscribe = true
          return
        }

        const snapshot = readWsJobSnapshot(message)
        if (!snapshot || snapshot.id !== jobId || !isTerminalStatus(snapshot.status)) {
          return
        }

        void this.getExplainJob(jobId, { includeInsight: true }).then((jobResponse) => {
          if (jobResponse.kind === "ok") {
            finish(jobResponse)
            return
          }

          finish({
            kind: "ok",
            data: buildFallbackTerminalJob(jobId, snapshot),
          })
        })
      }

      socket.onerror = () => {
        finish({ kind: "cannot-connect", temporary: true }, "socket_error")
      }

      socket.onclose = (event) => {
        const closeCode = typeof event?.code === "number" ? event.code : undefined
        const closeReason =
          typeof event?.reason === "string" && event.reason.trim().length > 0
            ? event.reason.trim()
            : "no_reason"
        closeDebugDetail =
          closeCode !== undefined
            ? `close:${closeCode}:${closeReason}`
            : `close:unknown:${closeReason}`
        if (didSendSubscribe) {
          tryFinishWithHttpSnapshot()
          return
        }
        finish(
          { kind: "cannot-connect", temporary: true },
          closeCode !== undefined
            ? `close_before_subscribe:${closeCode}:${closeReason}`
            : `close_before_subscribe:unknown:${closeReason}`,
        )
      }
    })
  }

  private async waitForExplainJobViaPolling(
    jobId: string,
    options: WaitForExplainJobOptions,
  ): Promise<ApiResult<WordInsightExplainJob>> {
    const pollIntervalMs = Math.max(100, Math.floor(options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS))
    const maxPollAttempts = Math.max(1, Math.floor(options.maxPollAttempts ?? DEFAULT_MAX_POLL_ATTEMPTS))

    for (let attempt = 0; attempt < maxPollAttempts; attempt += 1) {
      const jobResponse = await this.getExplainJob(jobId, { includeInsight: false })
      if (jobResponse.kind !== "ok") {
        return jobResponse
      }

      if (isTerminalStatus(jobResponse.data.status)) {
        if (jobResponse.data.status === "completed" && !jobResponse.data.result?.insight) {
          const completedResponse = await this.getExplainJob(jobId, { includeInsight: true })
          return completedResponse.kind === "ok" ? completedResponse : jobResponse
        }
        return jobResponse
      }

      await delay(pollIntervalMs)
    }

    return { kind: "timeout", temporary: true }
  }

  async listLearningItems(
    input: ListLearningItemsInput = {},
  ): Promise<ApiResult<WordInsightLearningItem[]>> {
    const normalizedQuery = typeof input.q === "string" ? input.q.trim() : undefined
    return backendApiClient.get<WordInsightLearningItem[]>("/v1/word-insight/items", {
      status: input.status,
      limit: input.limit,
      offset: input.offset,
      favorite: input.favorite,
      q: normalizedQuery && normalizedQuery.length > 0 ? normalizedQuery : undefined,
    })
  }

  async countLearningItems(
    input: Omit<ListLearningItemsInput, "limit" | "offset"> = {},
  ): Promise<ApiResult<number>> {
    const pageLimit = 100
    let offset = 0
    let total = 0

    while (true) {
      const response = await this.listLearningItems({
        ...input,
        limit: pageLimit,
        offset,
      })
      if (response.kind !== "ok") {
        return response
      }

      total += response.data.length
      if (response.data.length < pageLimit) {
        return { kind: "ok", data: total }
      }

      offset += response.data.length
    }
  }

  async getLearningItemMasterySummary(): Promise<ApiResult<WordInsightLearningItemMasterySummary>> {
    const response = await backendApiClient.get<WordInsightLearningItemMasterySummary>(
      "/v1/word-insight/mastery-summary",
    )
    if (response.kind !== "not-found") {
      return response
    }

    return backendApiClient.get<WordInsightLearningItemMasterySummary>(
      "/v1/word-insight/items/mastery-summary",
    )
  }

  async getLearningItemDetail(itemId: string): Promise<ApiResult<WordInsightLearningItemDetail>> {
    return backendApiClient.get<WordInsightLearningItemDetail>(`/v1/word-insight/items/${itemId}`)
  }

  async listLearningItemGroups(): Promise<ApiResult<WordInsightLearningItemGroup[]>> {
    return backendApiClient.get<WordInsightLearningItemGroup[]>("/v1/word-insight/groups")
  }

  async createLearningItemGroup(
    name: string,
  ): Promise<ApiResult<WordInsightLearningItemGroup>> {
    return backendApiClient.post<WordInsightLearningItemGroup>("/v1/word-insight/groups", {
      name: name.trim(),
    })
  }

  async updateLearningItemGroup(
    groupId: string,
    name: string,
  ): Promise<ApiResult<WordInsightLearningItemGroup>> {
    return backendApiClient.patch<WordInsightLearningItemGroup>(
      `/v1/word-insight/groups/${groupId}`,
      {
        name: name.trim(),
      },
    )
  }

  async deleteLearningItemGroup(groupId: string): Promise<ApiResult<{ deleted: true }>> {
    return backendApiClient.delete<{ deleted: true }>(`/v1/word-insight/groups/${groupId}`)
  }

  async listLearningItemGroupsForItem(
    itemId: string,
  ): Promise<ApiResult<WordInsightLearningItemGroup[]>> {
    return backendApiClient.get<WordInsightLearningItemGroup[]>(
      `/v1/word-insight/items/${itemId}/groups`,
    )
  }

  async listLearningItemsByGroup(
    groupId: string,
    input: { limit?: number; offset?: number } = {},
  ): Promise<ApiResult<WordInsightLearningItem[]>> {
    return backendApiClient.get<WordInsightLearningItem[]>(
      `/v1/word-insight/groups/${groupId}/items`,
      {
        limit: input.limit,
        offset: input.offset,
      },
    )
  }

  async addLearningItemToGroup(
    groupId: string,
    itemId: string,
  ): Promise<ApiResult<WordInsightLearningItemGroup>> {
    return backendApiClient.post<WordInsightLearningItemGroup>(
      `/v1/word-insight/groups/${groupId}/items/${itemId}`,
    )
  }

  async addLearningItemsToGroup(
    groupId: string,
    itemIds: string[],
  ): Promise<ApiResult<WordInsightLearningItemGroup>> {
    return backendApiClient.put<WordInsightLearningItemGroup>(
      `/v1/word-insight/groups/${groupId}/items`,
      {
        itemIds,
      },
    )
  }

  async removeLearningItemFromGroup(
    groupId: string,
    itemId: string,
  ): Promise<ApiResult<WordInsightLearningItemGroup>> {
    return backendApiClient.delete<WordInsightLearningItemGroup>(
      `/v1/word-insight/groups/${groupId}/items/${itemId}`,
    )
  }

  async getCreditBalances(): Promise<ApiResult<WordInsightCreditBalances>> {
    return backendApiClient.get<WordInsightCreditBalances>("/v1/word-insight/credits")
  }

  async markLearningItemLearned(itemId: string): Promise<ApiResult<WordInsightLearningItem>> {
    return backendApiClient.post<WordInsightLearningItem>(`/v1/word-insight/items/${itemId}/learned`)
  }

  async reopenLearningItem(itemId: string): Promise<ApiResult<WordInsightLearningItem>> {
    return backendApiClient.post<WordInsightLearningItem>(`/v1/word-insight/items/${itemId}/reopen`)
  }

  async softDeleteLearningItem(itemId: string): Promise<ApiResult<WordInsightLearningItem>> {
    return backendApiClient.post<WordInsightLearningItem>(`/v1/word-insight/items/${itemId}/delete`)
  }

  async markLearningItemFavorite(itemId: string): Promise<ApiResult<WordInsightLearningItem>> {
    return backendApiClient.post<WordInsightLearningItem>(`/v1/word-insight/items/${itemId}/favorite`)
  }

  async unmarkLearningItemFavorite(itemId: string): Promise<ApiResult<WordInsightLearningItem>> {
    return backendApiClient.post<WordInsightLearningItem>(`/v1/word-insight/items/${itemId}/unfavorite`)
  }

  async reportLearningItemIssue(
    itemId: string,
    message: string,
  ): Promise<ApiResult<WordInsightLearningItemIssueReport>> {
    return backendApiClient.post<WordInsightLearningItemIssueReport>(
      `/v1/word-insight/items/${itemId}/report`,
      { message: message.trim() },
    )
  }
}

export const wordInsightApi = new WordInsightApi()
