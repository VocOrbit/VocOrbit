import { useCallback, useEffect, useRef, useState } from "react"

import { vocabularyApi } from "@/services/api/vocabularyApi"
import type { PerfectionQuestion, PerfectionRule } from "@/services/api/vocabularyTypes"

type PerfectionPhase = "intro" | "play" | "summary"

export type PerfectionAnswerState = "idle" | "correct" | "incorrect"

type SummaryView = "overview" | "results"

type PerfectionStats = {
  correct: number
  incorrect: number
  lives: number
  totalAnswered: number
  score: number
}

export type PerfectionHistoryItem = {
  id: string
  prompt: string
  selectedLabel: string | null
  correctLabel: string | null
  status: "correct" | "incorrect"
}

export type VocabularyPerfectionChallengeViewModel = {
  phase: PerfectionPhase
  summaryView: SummaryView
  title: string
  rules: PerfectionRule[]
  question: PerfectionQuestion
  selectedAnswerId: string | null
  answerState: PerfectionAnswerState
  stats: PerfectionStats
  history: PerfectionHistoryItem[]
  onStart: () => void
  onSelectAnswer: (answerId: string) => void
  onShowResults: () => void
  onShowSummary: () => void
}

const FEEDBACK_DELAY_MS = 700

const fallbackQuestion: PerfectionQuestion = {
  id: "fallback",
  prompt: "",
  answers: [],
  correctId: "",
}

const initialStats: PerfectionStats = {
  correct: 0,
  incorrect: 0,
  lives: 3,
  totalAnswered: 0,
  score: 0,
}

export function useVocabularyPerfectionChallengeViewModel(): VocabularyPerfectionChallengeViewModel {
  const [phase, setPhase] = useState<PerfectionPhase>("intro")
  const [summaryView, setSummaryView] = useState<SummaryView>("overview")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [rules, setRules] = useState<PerfectionRule[]>([])
  const [questions, setQuestions] = useState<PerfectionQuestion[]>([])
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<PerfectionAnswerState>("idle")
  const [stats, setStats] = useState<PerfectionStats>(initialStats)
  const [history, setHistory] = useState<PerfectionHistoryItem[]>([])
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const question = questions[questionIndex] ?? fallbackQuestion

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
      const response = await vocabularyApi.getPerfectionChallenge()
      if (!isMounted) return
      if (response.kind === "ok") {
        setRules(response.data.rules)
        setQuestions(response.data.questions)
      } else if (__DEV__) {
        console.warn("Perfection challenge request failed.", response)
      }
    }
    loadChallenge()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    return () => {
      clearAdvanceTimeout()
    }
  }, [clearAdvanceTimeout])

  return {
    phase,
    summaryView,
    title: "Perfection",
    rules,
    question,
    selectedAnswerId,
    answerState,
    stats,
    history,
    onStart: handleStart,
    onSelectAnswer: handleSelectAnswer,
    onShowResults: handleShowResults,
    onShowSummary: handleShowSummary,
  }
}
