import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { vocabularyApi } from "@/services/api/vocabularyApi"
import type { RushQuestion, RushRule } from "@/services/api/vocabularyTypes"

type RushPhase = "intro" | "play" | "summary"

export type AnswerState = "idle" | "correct" | "incorrect" | "timeout"

type SummaryView = "overview" | "results"

type RushStats = {
  correct: number
  incorrect: number
  lives: number
  totalAnswered: number
  score: number
}

export type RushHistoryItem = {
  id: string
  prompt: string
  selectedLabel: string | null
  correctLabel: string | null
  status: "correct" | "incorrect" | "timeout"
}

export type VocabularyRushChallengeViewModel = {
  phase: RushPhase
  summaryView: SummaryView
  title: string
  rules: RushRule[]
  question: RushQuestion
  selectedAnswerId: string | null
  answerState: AnswerState
  timeProgress: number
  stats: RushStats
  history: RushHistoryItem[]
  onStart: () => void
  onSelectAnswer: (answerId: string) => void
  onShowResults: () => void
  onShowSummary: () => void
}

const TIME_LIMIT_MS = 5000
const FEEDBACK_DELAY_MS = 700

const fallbackQuestion: RushQuestion = {
  id: "fallback",
  prompt: "",
  answers: [],
  correctId: "",
}

const initialStats: RushStats = {
  correct: 0,
  incorrect: 0,
  lives: 3,
  totalAnswered: 0,
  score: 0,
}

export function useVocabularyRushChallengeViewModel(): VocabularyRushChallengeViewModel {
  const [phase, setPhase] = useState<RushPhase>("intro")
  const [summaryView, setSummaryView] = useState<SummaryView>("overview")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [rules, setRules] = useState<RushRule[]>([])
  const [questions, setQuestions] = useState<RushQuestion[]>([])
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<AnswerState>("idle")
  const [timeLeftMs, setTimeLeftMs] = useState(TIME_LIMIT_MS)
  const [stats, setStats] = useState<RushStats>(initialStats)
  const [history, setHistory] = useState<RushHistoryItem[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const question = questions[questionIndex] ?? fallbackQuestion
  const timeProgress = useMemo(
    () => (TIME_LIMIT_MS ? timeLeftMs / TIME_LIMIT_MS : 0),
    [timeLeftMs],
  )

  const clearAdvanceTimeout = useCallback(() => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }
  }, [])

  const resetQuestionState = useCallback(() => {
    setSelectedAnswerId(null)
    setAnswerState("idle")
    setTimeLeftMs(TIME_LIMIT_MS)
  }, [])

  const advanceToNextQuestion = useCallback(
    (nextLives: number) => {
      clearAdvanceTimeout()
      advanceTimeoutRef.current = setTimeout(() => {
        if (nextLives <= 0) {
          setSummaryView("overview")
          setPhase("summary")
          return
        }
        setQuestionIndex((prev) => (prev + 1) % Math.max(questions.length, 1))
        resetQuestionState()
      }, FEEDBACK_DELAY_MS)
    },
    [clearAdvanceTimeout, questions.length, resetQuestionState],
  )

  const handleTimeout = useCallback(() => {
    if (phase !== "play" || answerState !== "idle") return
    const nextLives = Math.max(stats.lives - 1, 0)
    const correctAnswer = question.answers.find((answer) => answer.id === question.correctId)
    setSelectedAnswerId(null)
    setAnswerState("timeout")
    setHistory((prev) => [
      ...prev,
      {
        id: question.id,
        prompt: question.prompt,
        selectedLabel: null,
        correctLabel: correctAnswer?.label ?? null,
        status: "timeout",
      },
    ])
    setStats((prev) => ({
      ...prev,
      incorrect: prev.incorrect + 1,
      totalAnswered: prev.totalAnswered + 1,
      lives: nextLives,
    }))
    advanceToNextQuestion(nextLives)
  }, [advanceToNextQuestion, answerState, phase, question.answers, question.correctId, question.id, question.prompt, stats.lives])

  const handleStart = useCallback(() => {
    clearAdvanceTimeout()
    setStats(initialStats)
    setHistory([])
    setQuestionIndex(0)
    setSummaryView("overview")
    setPhase("play")
    resetQuestionState()
  }, [clearAdvanceTimeout, resetQuestionState])

  const handleSelectAnswer = useCallback(
    (answerId: string) => {
      if (phase !== "play" || answerState !== "idle") return
      const isCorrect = answerId === question.correctId
      const nextLives = isCorrect ? stats.lives : Math.max(stats.lives - 1, 0)
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
        lives: nextLives,
        score: prev.score + (isCorrect ? 1 : 0),
      }))
      advanceToNextQuestion(nextLives)
    },
    [
      advanceToNextQuestion,
      answerState,
      phase,
      question.answers,
      question.correctId,
      question.id,
      question.prompt,
      stats.lives,
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
      const response = await vocabularyApi.getRushChallenge()
      if (!isMounted) return
      if (response.kind === "ok") {
        setRules(response.data.rules)
        setQuestions(response.data.questions)
      } else if (__DEV__) {
        console.warn("Rush challenge request failed.", response)
      }
    }
    loadChallenge()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (phase !== "play" || answerState !== "idle") return
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
  }, [answerState, phase, questionIndex])

  useEffect(() => {
    if (phase !== "play" || answerState !== "idle") return
    if (timeLeftMs === 0) handleTimeout()
  }, [answerState, handleTimeout, phase, timeLeftMs])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      clearAdvanceTimeout()
    }
  }, [clearAdvanceTimeout])

  return {
    phase,
    summaryView,
    title: "Rush",
    rules,
    question,
    selectedAnswerId,
    answerState,
    timeProgress,
    stats,
    history,
    onStart: handleStart,
    onSelectAnswer: handleSelectAnswer,
    onShowResults: handleShowResults,
    onShowSummary: handleShowSummary,
  }
}
