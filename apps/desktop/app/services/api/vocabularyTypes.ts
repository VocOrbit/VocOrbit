import type { IconTypes } from "@/components/Icon"

export type VocabularyEntry = {
  id: string
  word: string
  pronunciation: string
  partOfSpeech: string
  definition: string
  example: string
  examples?: string[]
}

export type PracticeTileData = {
  id: string
  label: string
  icon: IconTypes
  accent: string
  accentSoft: string
}

export type PracticeAnswer = {
  id: string
  label: string
}

export type PracticeQuestion = {
  id: string
  prompt: string
  answers: PracticeAnswer[]
  correctId: string
  example: string
}

export type MatchSynonymsAnswer = {
  id: string
  label: string
}

export type MatchSynonymsQuestion = {
  id: string
  prompt: string
  answers: MatchSynonymsAnswer[]
  correctId: string
  definition: string
}

export type FillInGapAnswer = {
  id: string
  label: string
}

export type FillInGapQuestion = {
  id: string
  prefix: string
  placeholder: string
  suffix: string
  answers: FillInGapAnswer[]
  correctId: string
  definition: string
}

export type SprintRule = {
  id: string
  icon: IconTypes
  label: string
}

export type SprintAnswer = {
  id: string
  label: string
}

export type SprintQuestion = {
  id: string
  prompt: string
  answers: SprintAnswer[]
  correctId: string
}

export type RushRule = {
  id: string
  icon: IconTypes
  label: string
}

export type RushAnswer = {
  id: string
  label: string
}

export type RushQuestion = {
  id: string
  prompt: string
  answers: RushAnswer[]
  correctId: string
}

export type PerfectionRule = {
  id: string
  icon: IconTypes
  label: string
}

export type PerfectionAnswer = {
  id: string
  label: string
}

export type PerfectionQuestion = {
  id: string
  prompt: string
  answers: PerfectionAnswer[]
  correctId: string
}
