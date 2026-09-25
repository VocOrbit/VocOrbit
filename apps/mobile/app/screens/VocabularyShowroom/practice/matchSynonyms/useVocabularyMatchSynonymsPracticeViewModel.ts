import type { ExerciseMode, ExerciseSessionQuestion } from "@/services/api/exercisesApi"
import type { MatchSynonymsQuestion } from "@/services/api/vocabularyTypes"
import { useExercisePracticeSession, type ExercisePracticeSessionState } from "../shared/useExercisePracticeSession"

export type { MatchSynonymsAnswer, MatchSynonymsQuestion } from "@/services/api/vocabularyTypes"
export type MatchSynonymsAnswerState = "idle" | "correct" | "incorrect"

export type VocabularyMatchSynonymsPracticeViewModel =
  ExercisePracticeSessionState<MatchSynonymsQuestion>

const emptyQuestion: MatchSynonymsQuestion = {
  id: "empty",
  prompt: "",
  answers: [],
  correctId: "",
  definition: "",
}

const mapBackendQuestion = (question: ExerciseSessionQuestion): MatchSynonymsQuestion => ({
  id: question.id,
  prompt: question.prompt,
  answers: question.options.map((label, index) => ({
    id: `option-${index + 1}`,
    label,
  })),
  correctId: "",
  definition: question.explanation ?? "",
})

export function useVocabularyMatchSynonymsPracticeViewModel(
  mode: ExerciseMode,
  groupIds?: string[],
): VocabularyMatchSynonymsPracticeViewModel {
  return useExercisePracticeSession<MatchSynonymsQuestion>({
    practiceId: "synonyms",
    mode,
    groupIds,
    questionType: "match_synonym",
    emptyQuestion,
    mapBackendQuestion,
  })
}
