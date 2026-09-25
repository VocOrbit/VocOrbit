import type { GeneralApiProblem } from "./apiProblem"
import { createMockHttpClient } from "./mockHttpClient"
import {
  challengeTiles,
  fillInGapQuestions,
  matchSynonymsQuestions,
  meaningMatchQuestions,
  perfectionQuestions,
  perfectionRules,
  practiceTiles,
  rushQuestions,
  rushRules,
  sprintQuestions,
  sprintRules,
  vocabularyShowroomEntries,
} from "./vocabularyMockData"
import type {
  FillInGapQuestion,
  MatchSynonymsQuestion,
  PerfectionQuestion,
  PerfectionRule,
  PracticeQuestion,
  PracticeTileData,
  RushQuestion,
  RushRule,
  SprintQuestion,
  SprintRule,
  VocabularyEntry,
} from "./vocabularyTypes"

type ApiResult<T> = { kind: "ok"; data: T } | GeneralApiProblem

const mockClient = createMockHttpClient({
  minDelayMs: 250,
  maxDelayMs: 900,
  routes: [
    { method: "GET", path: "/v1/vocabulary/showroom", handler: () => vocabularyShowroomEntries },
    { method: "GET", path: "/v1/vocabulary/practice/tiles", handler: () => practiceTiles },
    { method: "GET", path: "/v1/vocabulary/challenge/tiles", handler: () => challengeTiles },
    { method: "GET", path: "/v1/vocabulary/practice/meaning-match", handler: () => meaningMatchQuestions },
    { method: "GET", path: "/v1/vocabulary/practice/fill-in-gap", handler: () => fillInGapQuestions },
    { method: "GET", path: "/v1/vocabulary/practice/match-synonyms", handler: () => matchSynonymsQuestions },
    {
      method: "GET",
      path: "/v1/vocabulary/challenges/sprint",
      handler: () => ({ rules: sprintRules, questions: sprintQuestions }),
    },
    {
      method: "GET",
      path: "/v1/vocabulary/challenges/rush",
      handler: () => ({ rules: rushRules, questions: rushQuestions }),
    },
    {
      method: "GET",
      path: "/v1/vocabulary/challenges/perfection",
      handler: () => ({ rules: perfectionRules, questions: perfectionQuestions }),
    },
  ],
})

const mapStatusToProblem = (status: number): GeneralApiProblem => {
  if (status === 404) return { kind: "not-found" }
  if (status >= 500) return { kind: "server" }
  return { kind: "unknown", temporary: true }
}

const toApiResult = <T>(response: { ok: boolean; status: number; data: T }): ApiResult<T> => {
  if (response.ok) return { kind: "ok", data: response.data }
  return mapStatusToProblem(response.status)
}

type ChallengePayload<TRule, TQuestion> = {
  rules: TRule[]
  questions: TQuestion[]
}

export class VocabularyApi {
  async getShowroomEntries(): Promise<ApiResult<VocabularyEntry[]>> {
    const response = await mockClient.get<VocabularyEntry[]>("/v1/vocabulary/showroom")
    return toApiResult(response)
  }

  async getPracticeTiles(): Promise<ApiResult<PracticeTileData[]>> {
    const response = await mockClient.get<PracticeTileData[]>("/v1/vocabulary/practice/tiles")
    return toApiResult(response)
  }

  async getChallengeTiles(): Promise<ApiResult<PracticeTileData[]>> {
    const response = await mockClient.get<PracticeTileData[]>("/v1/vocabulary/challenge/tiles")
    return toApiResult(response)
  }

  async getMeaningMatchQuestions(): Promise<ApiResult<PracticeQuestion[]>> {
    const response = await mockClient.get<PracticeQuestion[]>(
      "/v1/vocabulary/practice/meaning-match",
    )
    return toApiResult(response)
  }

  async getFillInGapQuestions(): Promise<ApiResult<FillInGapQuestion[]>> {
    const response = await mockClient.get<FillInGapQuestion[]>(
      "/v1/vocabulary/practice/fill-in-gap",
    )
    return toApiResult(response)
  }

  async getMatchSynonymsQuestions(): Promise<ApiResult<MatchSynonymsQuestion[]>> {
    const response = await mockClient.get<MatchSynonymsQuestion[]>(
      "/v1/vocabulary/practice/match-synonyms",
    )
    return toApiResult(response)
  }

  async getSprintChallenge(): Promise<ApiResult<ChallengePayload<SprintRule, SprintQuestion>>> {
    const response = await mockClient.get<ChallengePayload<SprintRule, SprintQuestion>>(
      "/v1/vocabulary/challenges/sprint",
    )
    return toApiResult(response)
  }

  async getRushChallenge(): Promise<ApiResult<ChallengePayload<RushRule, RushQuestion>>> {
    const response = await mockClient.get<ChallengePayload<RushRule, RushQuestion>>(
      "/v1/vocabulary/challenges/rush",
    )
    return toApiResult(response)
  }

  async getPerfectionChallenge(): Promise<
    ApiResult<ChallengePayload<PerfectionRule, PerfectionQuestion>>
  > {
    const response = await mockClient.get<ChallengePayload<PerfectionRule, PerfectionQuestion>>(
      "/v1/vocabulary/challenges/perfection",
    )
    return toApiResult(response)
  }
}

export const vocabularyApi = new VocabularyApi()
