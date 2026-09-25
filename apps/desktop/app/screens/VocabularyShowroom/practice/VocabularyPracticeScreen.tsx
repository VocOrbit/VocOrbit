import { FC, useCallback } from "react"

import { useAuth } from "@/context/AuthContext"
import { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { ExerciseQuestionType } from "@/services/api/exercisesApi"

import { VocabularyPracticeView } from "./VocabularyPracticeView"
import { useVocabularyPracticeViewModel } from "./useVocabularyPracticeViewModel"

type VocabularyPracticeScreenProps = AppStackScreenProps<"VocabularyPractice">

export const VocabularyPracticeScreen: FC<VocabularyPracticeScreenProps> = ({ navigation }) => {
  const { setSession } = useAuth()
  const viewModel = useVocabularyPracticeViewModel()
  const handleOpenPracticeDetail = useCallback(
    (questionType: ExerciseQuestionType) => {
      const mode = viewModel.selectedMode
      if (questionType === "fill_in_gap") {
        navigation.navigate("VocabularyFillInGapPractice", { mode })
        return
      }
      if (questionType === "match_synonym") {
        navigation.navigate("VocabularyMatchSynonymsPractice", { mode })
        return
      }
      if (questionType === "guess_word") {
        navigation.navigate("VocabularyPracticeDetail", { practiceId: "guess", mode })
        return
      }
      navigation.navigate("VocabularyPracticeDetail", { practiceId: "meaning", mode })
    },
    [navigation, viewModel.selectedMode],
  )

  return (
    <VocabularyPracticeView
      {...viewModel}
      onRequestBack={() => navigation.goBack()}
      onRequestPracticeDetail={handleOpenPracticeDetail}
      onRequestLogin={() => setSession(undefined)}
      onRequestOpenIap={() => navigation.navigate("ProfileIap")}
      onRequestOpenShowroom={() => navigation.navigate("VocabularyShowroomScreen")}
    />
  )
}
