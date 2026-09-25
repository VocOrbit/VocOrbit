import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { vocabularyApi } from "@/services/api/vocabularyApi"
import type { SprintQuestion, SprintRule } from "@/services/api/vocabularyTypes"

type SprintPhase = "intro" | "play" | "summary"

export type SprintAnswerState = "idle" | "correct" | "incorrect"

type SummaryView = "overview" | "results"

type SprintStats = {
  correct: number
  incorrect: number
  totalAnswered: number
  score: number
}

export type SprintHistoryItem = {
  id: string
  prompt: string
  selectedLabel: string | null
  correctLabel: string | null
  status: "correct" | "incorrect"
}

export type VocabularySprintChallengeViewModel = {
  phase: SprintPhase
  summaryView: SummaryView
  title: string
  rules: SprintRule[]
  question: SprintQuestion
  selectedAnswerId: string | null
  answerState: SprintAnswerState
  timeProgress: number
  timeRemainingSeconds: number
  isTimeLow: boolean
  stats: SprintStats
  history: SprintHistoryItem[]
  onStart: () => void
  onSelectAnswer: (answerId: string) => void
  onShowResults: () => void
  onShowSummary: () => void
}

const TIME_LIMIT_MS = 60000
const LOW_TIME_THRESHOLD_MS = 5000
const FEEDBACK_DELAY_MS = 700

const fallbackQuestion: SprintQuestion = {
  id: "fallback",
  prompt: "",
  answers: [],
  correctId: "",
}

const initialStats: SprintStats = {
  correct: 0,
  incorrect: 0,
  totalAnswered: 0,
  score: 0,
}

export function useVocabularySprintChallengeViewModel(): VocabularySprintChallengeViewModel {
  const [phase, setPhase] = useState<SprintPhase>("intro")
  const [summaryView, setSummaryView] = useState<SummaryView>("overview")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [rules, setRules] = useState<SprintRule[]>([])
  const [questions, setQuestions] = useState<SprintQuestion[]>([])
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<SprintAnswerState>("idle")
  const [timeLeftMs, setTimeLeftMs] = useState(TIME_LIMIT_MS)
  const [stats, setStats] = useState<SprintStats>(initialStats)
  const [history, setHistory] = useState<SprintHistoryItem[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timeLeftRef = useRef(TIME_LIMIT_MS)

  const question = questions[questionIndex] ?? fallbackQuestion
  const timeProgress = useMemo(
    () => (TIME_LIMIT_MS ? timeLeftMs / TIME_LIMIT_MS : 0),
    [timeLeftMs],
  )
  const timeRemainingSeconds = useMemo(() => Math.ceil(timeLeftMs / 1000), [timeLeftMs])
  const isTimeLow = timeLeftMs <= LOW_TIME_THRESHOLD_MS

  const clearAdvanceTimeout = useCallback(() => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }
  }, [])

  const resetQuestionState = useCallback(() => {
    setSelectedAnswerId(null)
    setAnswerState("idle")
  }, [])

  const advanceToNextQuestion = useCallback(() => {
    clearAdvanceTimeout()
    advanceTimeoutRef.current = setTimeout(() => {
      if (timeLeftRef.current <= 0) {
        setSummaryView("overview")
        setPhase("summary")
        return
      }
      setQuestionIndex((prev) => (prev + 1) % Math.max(questions.length, 1))
      resetQuestionState()
    }, FEEDBACK_DELAY_MS)
  }, [clearAdvanceTimeout, questions.length, resetQuestionState])

  const handleStart = useCallback(() => {
    clearAdvanceTimeout()
    setStats(initialStats)
    setHistory([])
    setQuestionIndex(0)
    setSummaryView("overview")
    setPhase("play")
    setTimeLeftMs(TIME_LIMIT_MS)
    resetQuestionState()
  }, [clearAdvanceTimeout, resetQuestionState])

  const handleSelectAnswer = useCallback(
    (answerId: string) => {
      if (phase !== "play" || answerState !== "idle") return
      const isCorrect = answerId === question.correctId
      const selectedAnswer = question.answers.find((answer) => answer.id === answerId)
      const correctAnswer = question.answers.find((answer) => answer.id === question.correctId)
      setSelectedAnswerId(answerId)
      setAnswerState(isCorrect ? "correct" : "incorrect")
      setHistory((prev) => [
        ...prev,
        {
          id: question.id,
          prompt: question.prompt,
          selectedLabel: selectedAnswer?.label ?? null,
          correctLabel: correctAnswer?.label ?? null,
          status: isCorrect ? "correct" : "incorrect",
        },
      ])
      setStats((prev) => ({
        ...prev,
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        totalAnswered: prev.totalAnswered + 1,
        score: prev.score + (isCorrect ? 1 : 0),
      }))
      advanceToNextQuestion()
    },
    [
      advanceToNextQuestion,
      answerState,
      phase,
      question.answers,
      question.correctId,
      question.id,
      question.prompt,
    ],
  )

  const handleShowResults = useCallback(() => {
    setSummaryView("results")
  }, [])

  const handleShowSummary = useCallback(() => {
    setSummaryView("overview")
  }, [])

  useEffect(() => {
    let isMounted = true
    const loadChallenge = async () => {
      const response = await vocabularyApi.getSprintChallenge()
      if (!isMounted) return
      if (response.kind === "ok") {
        setRules(response.data.rules)
        setQuestions(response.data.questions)
      } else if (__DEV__) {
        console.warn("Sprint challenge request failed.", response)
      }
    }
    loadChallenge()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    timeLeftRef.current = timeLeftMs
  }, [timeLeftMs])

  useEffect(() => {
    if (phase !== "play") return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeftMs((prev) => Math.max(prev - 100, 0))
    }, 100)
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [phase])

  useEffect(() => {
    if (phase !== "play") return
    if (timeLeftMs === 0) {
      clearAdvanceTimeout()
      setSummaryView("overview")
      setPhase("summary")
    }
  }, [clearAdvanceTimeout, phase, timeLeftMs])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      clearAdvanceTimeout()
    }
  }, [clearAdvanceTimeout])

  return {
    phase,
    summaryView,
    title: "Sprint",
    rules,
    question,
    selectedAnswerId,
    answerState,
    timeProgress,
    timeRemainingSeconds,
    isTimeLow,
    stats,
    history,
    onStart: handleStart,
    onSelectAnswer: handleSelectAnswer,
    onShowResults: handleShowResults,
    onShowSummary: handleShowSummary,
  }
}
