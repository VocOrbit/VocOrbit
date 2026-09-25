import { useCallback, useEffect, useMemo, useState } from "react"

import { useLanguagePreferences } from "@/context/LanguagePreferencesContext"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import {
  type ExerciseMode,
  type ExerciseQuestionType,
  type ExerciseSessionProgress,
  type ExerciseSessionQuestion,
  exercisesApi,
} from "@/services/api/exercisesApi"

export type SessionAnswerState = "idle" | "correct" | "incorrect"

type SessionAnswerOption = {
  id: string
  label: string
}

export type BaseSessionQuestion = {
  id: string
  answers: SessionAnswerOption[]
  correctId: string
}

type SessionQuestionState<TQuestion extends BaseSessionQuestion> = TQuestion & {
  backendQuestionId: string
}

type UseExercisePracticeSessionOptions<TQuestion extends BaseSessionQuestion> = {
  practiceId: string
  mode: ExerciseMode
  questionType: ExerciseQuestionType
  emptyQuestion: TQuestion
  mapBackendQuestion: (question: ExerciseSessionQuestion) => TQuestion
}

export type ExercisePracticeSessionState<TQuestion extends BaseSessionQuestion> = {
  practiceId: string
  question: TQuestion
  questionIndex: number
  totalQuestions: number
  progress: number
  isLastQuestion: boolean
  isSessionCompleted: boolean
  correctAnswers: number
  scorePercent: number
  selectedId: string | null
  answerState: SessionAnswerState
  showLeavePrompt: boolean
  correctAnswer: SessionAnswerOption | undefined
  isLoadingQuestions: boolean
  hasQuestions: boolean
  loadProblem?: GeneralApiProblem
  onSelectAnswer: (answerId: string) => void
  onNextWord: () => void
  onOpenLeavePrompt: () => void
  onCloseLeavePrompt: () => void
  onCompleteSession: () => Promise<void>
  onRetryLoad: () => void
}

const normalizeForCompare = (value: string) => value.trim().toLocaleLowerCase("en-US")

export function useExercisePracticeSession<TQuestion extends BaseSessionQuestion>(
  options: UseExercisePracticeSessionOptions<TQuestion>,
): ExercisePracticeSessionState<TQuestion> {
  const { practiceId, questionType, emptyQuestion, mapBackendQuestion } = options
  const { mode } = options
  const { preferences } = useLanguagePreferences()
  const preferredPromptLanguage = preferences?.l1Language

  const [questionIndex, setQuestionIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [questions, setQuestions] = useState<Array<SessionQuestionState<TQuestion>>>([])
  const [answerResults, setAnswerResults] = useState<Record<string, boolean>>({})
  const [sessionProgress, setSessionProgress] = useState<ExerciseSessionProgress | undefined>(
    undefined,
  )
  const [isSessionCompleted, setIsSessionCompleted] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<SessionAnswerState>("idle")
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false)
  const [showLeavePrompt, setShowLeavePrompt] = useState(false)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [loadProblem, setLoadProblem] = useState<GeneralApiProblem | undefined>(undefined)

  const loadQuestions = useCallback(async () => {
    setIsLoadingQuestions(true)
    setLoadProblem(undefined)
    setQuestionIndex(0)
    setSessionId(undefined)
    setQuestions([])
    setAnswerResults({})
    setSessionProgress(undefined)
    setIsSessionCompleted(false)
    setSelectedId(null)
    setAnswerState("idle")
    setIsSubmittingAnswer(false)
    setShowLeavePrompt(false)

    const sessionResponse = await exercisesApi.createSession({
      mode,
      totalQuestions: 10,
      todayMinimum: 3,
      timezoneOffsetMinutes: -new Date().getTimezoneOffset(),
      promptLanguage: preferredPromptLanguage,
      questionTypes: [questionType],
    })

    if (sessionResponse.kind === "ok" && sessionResponse.data.questions.length > 0) {
      setSessionId(sessionResponse.data.session.id)
      setQuestions(
        sessionResponse.data.questions.map((question) => ({
          ...mapBackendQuestion(question),
          backendQuestionId: question.id,
        })),
      )
      setSessionProgress(sessionResponse.data.progress)
      setIsLoadingQuestions(false)
      return
    }

    if (sessionResponse.kind !== "ok") {
      setLoadProblem(sessionResponse)
      if (__DEV__) {
        console.warn("Exercise session request failed.", sessionResponse)
      }
    } else {
      setLoadProblem({ kind: "rejected" })
      if (__DEV__) {
        console.warn("Exercise session has no question payload.")
      }
    }
    setIsLoadingQuestions(false)
  }, [mapBackendQuestion, mode, preferredPromptLanguage, questionType])

  useEffect(() => {
    void loadQuestions()
  }, [loadQuestions])

  const totalQuestions = questions.length
  const safeIndex = Math.min(questionIndex, Math.max(totalQuestions - 1, 0))
  const question = (questions[safeIndex] ?? emptyQuestion) as TQuestion
  const hasQuestions = totalQuestions > 0
  const correctAnswer = useMemo(
    () => question.answers.find((answer) => answer.id === question.correctId),
    [question],
  )
  const progress = totalQuestions ? (safeIndex + 1) / totalQuestions : 0
  const isLastQuestion = totalQuestions > 0 && safeIndex >= totalQuestions - 1
  const localCorrectAnswers = useMemo(
    () => Object.values(answerResults).filter(Boolean).length,
    [answerResults],
  )
  const correctAnswers = sessionProgress?.correctAnswers ?? localCorrectAnswers
  const scorePercent =
    sessionProgress?.scorePercent ??
    (totalQuestions > 0 ? Math.round((localCorrectAnswers / totalQuestions) * 100) : 0)

  const handleSelectAnswer = useCallback(
    (answerId: string) => {
      void (async () => {
        if (!hasQuestions || answerState !== "idle" || isSubmittingAnswer || !sessionId) return

        setIsSubmittingAnswer(true)
        try {
          const sessionQuestion = questions[safeIndex]
          if (!sessionQuestion) return

          const selectedAnswer = sessionQuestion.answers.find((answer) => answer.id === answerId)
          if (!selectedAnswer) return

          const submitResponse = await exercisesApi.submitAnswer({
            sessionId,
            questionId: sessionQuestion.backendQuestionId,
            answer: selectedAnswer.label,
          })

          if (submitResponse.kind === "ok") {
            const matchedCorrectId = sessionQuestion.answers.find(
              (answer) =>
                normalizeForCompare(answer.label) ===
                normalizeForCompare(submitResponse.data.correctAnswer),
            )?.id
            const fallbackCorrectId = submitResponse.data.isCorrect
              ? answerId
              : sessionQuestion.correctId
            const correctId = matchedCorrectId ?? fallbackCorrectId

            setQuestions((prev) =>
              prev.map((item, index) => (index === safeIndex ? { ...item, correctId } : item)),
            )
            setAnswerResults((prev) => ({
              ...prev,
              [sessionQuestion.id]: submitResponse.data.isCorrect,
            }))
            setSessionProgress(submitResponse.data.progress)
            if (submitResponse.data.sessionStatus === "completed") {
              setIsSessionCompleted(true)
            }
            setSelectedId(answerId)
            setAnswerState(submitResponse.data.isCorrect ? "correct" : "incorrect")
            return
          }

          if (__DEV__) {
            console.warn("Submit answer request failed.", submitResponse)
          }
        } finally {
          setIsSubmittingAnswer(false)
        }
      })()
    },
    [answerState, hasQuestions, isSubmittingAnswer, questions, safeIndex, sessionId],
  )

  const handleOpenLeavePrompt = useCallback(() => {
    setShowLeavePrompt(true)
  }, [])

  const handleCloseLeavePrompt = useCallback(() => {
    setShowLeavePrompt(false)
  }, [])

  const handleCompleteSession = useCallback(async () => {
    if (sessionId) {
      const response = await exercisesApi.completeSession(sessionId)
      if (response.kind === "ok") {
        setSessionProgress(response.data.progress)
      } else if (__DEV__) {
        console.warn("Complete exercise session request failed.", response)
      }
    }
    setIsSessionCompleted(true)
  }, [sessionId])

  const handleNextWord = useCallback(() => {
    if (isSessionCompleted) return
    if (isLastQuestion) {
      void handleCompleteSession()
      return
    }

    setSelectedId(null)
    setAnswerState("idle")
    setQuestionIndex((prev) => Math.min(prev + 1, Math.max(totalQuestions - 1, 0)))
  }, [handleCompleteSession, isLastQuestion, isSessionCompleted, totalQuestions])

  return {
    practiceId,
    question,
    questionIndex: safeIndex,
    totalQuestions,
    progress,
    isLastQuestion,
    isSessionCompleted,
    correctAnswers,
    scorePercent,
    selectedId,
    answerState,
    showLeavePrompt,
    correctAnswer,
    isLoadingQuestions,
    hasQuestions,
    loadProblem,
    onSelectAnswer: handleSelectAnswer,
    onNextWord: handleNextWord,
    onOpenLeavePrompt: handleOpenLeavePrompt,
    onCloseLeavePrompt: handleCloseLeavePrompt,
    onCompleteSession: handleCompleteSession,
    onRetryLoad: () => {
      void loadQuestions()
    },
  }
}
