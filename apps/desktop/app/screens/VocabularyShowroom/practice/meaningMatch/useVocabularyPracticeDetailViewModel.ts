import type {
  ExerciseMode,
  ExerciseQuestionType,
  ExerciseSessionQuestion,
} from "@/services/api/exercisesApi"
import type { PracticeQuestion } from "@/services/api/vocabularyTypes"
import { useExercisePracticeSession, type ExercisePracticeSessionState } from "../shared/useExercisePracticeSession"

export type { PracticeAnswer, PracticeQuestion } from "@/services/api/vocabularyTypes"
export type AnswerState = "idle" | "correct" | "incorrect"

export type VocabularyPracticeDetailViewModel = ExercisePracticeSessionState<PracticeQuestion>

const emptyQuestion: PracticeQuestion = {
  id: "empty",
  prompt: "",
  answers: [],
  correctId: "",
  example: "",
}

const mapBackendQuestion = (question: ExerciseSessionQuestion): PracticeQuestion => ({
  id: question.id,
  prompt: question.prompt,
  answers: question.options.map((label, index) => ({
    id: `option-${index + 1}`,
    label,
  })),
  correctId: "",
  example: question.explanation ?? "",
})

const resolveQuestionType = (practiceId: string): ExerciseQuestionType =>
  practiceId === "guess" ? "guess_word" : "meaning_match"

export function useVocabularyPracticeDetailViewModel(
  practiceId: string,
  mode: ExerciseMode,
): VocabularyPracticeDetailViewModel {
  return useExercisePracticeSession<PracticeQuestion>({
    practiceId,
    mode,
    questionType: resolveQuestionType(practiceId),
    emptyQuestion,
    mapBackendQuestion,
  })
}
