import type { ExerciseMode, ExerciseSessionQuestion } from "@/services/api/exercisesApi"
import type { FillInGapQuestion } from "@/services/api/vocabularyTypes"
import { useExercisePracticeSession, type ExercisePracticeSessionState } from "../shared/useExercisePracticeSession"

export type { FillInGapAnswer, FillInGapQuestion } from "@/services/api/vocabularyTypes"
export type FillInGapAnswerState = "idle" | "correct" | "incorrect"

export type VocabularyFillInGapPracticeViewModel = ExercisePracticeSessionState<FillInGapQuestion>

const emptyQuestion: FillInGapQuestion = {
  id: "empty",
  prefix: "",
  placeholder: "____",
  suffix: "",
  answers: [],
  correctId: "",
  definition: "",
}

function splitGapPrompt(prompt: string): { prefix: string; placeholder: string; suffix: string } {
  const gapToken = "____"
  const gapIndex = prompt.indexOf(gapToken)
  if (gapIndex < 0) {
    return {
      prefix: prompt,
      placeholder: "____",
      suffix: "",
    }
  }

  return {
    prefix: prompt.slice(0, gapIndex),
    placeholder: "____",
    suffix: prompt.slice(gapIndex + gapToken.length),
  }
}

const mapBackendQuestion = (question: ExerciseSessionQuestion): FillInGapQuestion => {
  const gapParts = splitGapPrompt(question.prompt)

  return {
    id: question.id,
    prefix: gapParts.prefix,
    placeholder: gapParts.placeholder,
    suffix: gapParts.suffix,
    answers: question.options.map((label, index) => ({
      id: `option-${index + 1}`,
      label,
    })),
    correctId: "",
    definition: question.explanation ?? "",
  }
}

export function useVocabularyFillInGapPracticeViewModel(
  mode: ExerciseMode,
): VocabularyFillInGapPracticeViewModel {
  return useExercisePracticeSession<FillInGapQuestion>({
    practiceId: "fill",
    mode,
    questionType: "fill_in_gap",
    emptyQuestion,
    mapBackendQuestion,
  })
}
