import type { GeneralApiProblem } from "./apiProblem"
import { backendApiClient } from "./backendClient"

type ApiResult<T> = { kind: "ok"; data: T } | GeneralApiProblem

export type ExerciseMode = "basic" | "advanced"
export type ExerciseAnalyticsMode = ExerciseMode | "all"
export type ExerciseQuestionType =
  | "meaning_match"
  | "fill_in_gap"
  | "guess_word"
  | "match_synonym"
export type ExerciseSessionStatus = "active" | "completed"
export type ExerciseCatalogAvailabilityReason =
  | "not_enough_learning_items"
  | "missing_synonyms"

export type ExerciseSession = {
  id: string
  mode: ExerciseMode
  status: ExerciseSessionStatus
  totalQuestions: number
  requiredTodayQuestions: number
  questionTypes: ExerciseQuestionType[]
  timezoneOffsetMinutes: number
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export type ExerciseSessionProgress = {
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  scorePercent: number
}

export type ExerciseSessionQuestion = {
  id: string
  orderNo: number
  type: ExerciseQuestionType
  itemId: string
  prompt: string
  options: string[]
  explanation?: string
  answered: boolean
  answer?: string
  isCorrect?: boolean
}

export type ExerciseSessionDetail = {
  session: ExerciseSession
  progress: ExerciseSessionProgress
  questions: ExerciseSessionQuestion[]
}

export type ExerciseTodayPlan = {
  mode: ExerciseMode
  timezoneOffsetMinutes: number
  activeItemCount: number
  modeItemCount: number
  todayItemCount: number
  recommendedTodayMinimum: number
}

export type ExerciseCatalogItem = {
  type: ExerciseQuestionType
  available: boolean
  availableItemCount: number
  reason?: ExerciseCatalogAvailabilityReason
}

export type ExercisePracticeCatalog = {
  mode: ExerciseMode
  timezoneOffsetMinutes: number
  activeItemCount: number
  items: ExerciseCatalogItem[]
}

export type ExerciseWeeklyAnalyticsSummary = {
  sessionsCreated: number
  sessionsCompleted: number
  answeredQuestions: number
  correctAnswers: number
  accuracyPercent: number
  activeDays: number
  streakDays: number
}

export type ExerciseWeeklyAnalyticsDay = {
  date: string
  answeredQuestions: number
  correctAnswers: number
  accuracyPercent: number
}

export type ExerciseWeeklyAnalyticsByType = {
  type: ExerciseQuestionType
  answeredQuestions: number
  correctAnswers: number
  accuracyPercent: number
}

export type ExerciseWeeklyAnalyticsByMode = {
  mode: ExerciseMode
  answeredQuestions: number
  correctAnswers: number
  accuracyPercent: number
}

export type ExerciseWeeklyWeakItem = {
  itemId: string
  type: ExerciseQuestionType
  prompt: string
  wrongAnswers: number
  totalAnswers: number
  accuracyPercent: number
  lastAnsweredAt: string
}

export type ExerciseWeeklyAnalytics = {
  mode: ExerciseAnalyticsMode
  timezoneOffsetMinutes: number
  windowStartDate: string
  windowEndDate: string
  summary: ExerciseWeeklyAnalyticsSummary
  daily: ExerciseWeeklyAnalyticsDay[]
  byType: ExerciseWeeklyAnalyticsByType[]
  byMode: ExerciseWeeklyAnalyticsByMode[]
  weakItems: ExerciseWeeklyWeakItem[]
}

export type CreateExerciseSessionInput = {
  mode?: ExerciseMode
  totalQuestions?: number
  todayMinimum?: number
  timezoneOffsetMinutes?: number
  promptLanguage?: string
  questionTypes?: ExerciseQuestionType[]
}

export type SubmitExerciseAnswerInput = {
  sessionId: string
  questionId: string
  answer: string
}

export type SubmitExerciseAnswerResult = {
  questionId: string
  answer: string
  isCorrect: boolean
  correctAnswer: string
  alreadyAnswered: boolean
  progress: ExerciseSessionProgress
  sessionStatus: ExerciseSessionStatus
}

class ExercisesApi {
  async getTodayPlan(input?: {
    mode?: ExerciseMode
    timezoneOffsetMinutes?: number
  }): Promise<ApiResult<ExerciseTodayPlan>> {
    return backendApiClient.get<ExerciseTodayPlan>("/v1/exercises/today-plan", {
      mode: input?.mode,
      timezoneOffsetMinutes: input?.timezoneOffsetMinutes,
    })
  }

  async getCatalog(input?: {
    mode?: ExerciseMode
    timezoneOffsetMinutes?: number
  }): Promise<ApiResult<ExercisePracticeCatalog>> {
    return backendApiClient.get<ExercisePracticeCatalog>("/v1/exercises/catalog", {
      mode: input?.mode,
      timezoneOffsetMinutes: input?.timezoneOffsetMinutes,
    })
  }

  async getWeeklyAnalytics(input?: {
    mode?: ExerciseMode
    timezoneOffsetMinutes?: number
  }): Promise<ApiResult<ExerciseWeeklyAnalytics>> {
    return backendApiClient.get<ExerciseWeeklyAnalytics>("/v1/exercises/analytics/weekly", {
      mode: input?.mode,
      timezoneOffsetMinutes: input?.timezoneOffsetMinutes,
    })
  }

  async createSession(input: CreateExerciseSessionInput): Promise<ApiResult<ExerciseSessionDetail>> {
    return backendApiClient.post<ExerciseSessionDetail>("/v1/exercises/sessions", input)
  }

  async getSession(sessionId: string): Promise<ApiResult<ExerciseSessionDetail>> {
    return backendApiClient.get<ExerciseSessionDetail>(`/v1/exercises/sessions/${sessionId}`)
  }

  async submitAnswer(
    input: SubmitExerciseAnswerInput,
  ): Promise<ApiResult<SubmitExerciseAnswerResult>> {
    return backendApiClient.post<SubmitExerciseAnswerResult>(
      `/v1/exercises/sessions/${input.sessionId}/answers`,
      {
        questionId: input.questionId,
        answer: input.answer,
      },
    )
  }

  async completeSession(sessionId: string): Promise<ApiResult<ExerciseSessionDetail>> {
    return backendApiClient.post<ExerciseSessionDetail>(
      `/v1/exercises/sessions/${sessionId}/complete`,
    )
  }
}

export const exercisesApi = new ExercisesApi()
