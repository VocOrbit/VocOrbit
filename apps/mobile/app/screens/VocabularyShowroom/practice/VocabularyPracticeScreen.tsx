import { FC, useCallback } from "react"

import { useAuth } from "@/context/AuthContext"
import { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { ExerciseQuestionType } from "@/services/api/exercisesApi"

import {
  type PracticeTileId,
  useVocabularyPracticeViewModel,
} from "./useVocabularyPracticeViewModel"
import { VocabularyPracticeView } from "./VocabularyPracticeView"

type VocabularyPracticeScreenProps = AppStackScreenProps<"VocabularyPractice">

export const VocabularyPracticeScreen: FC<VocabularyPracticeScreenProps> = ({ navigation }) => {
  const { setSession } = useAuth()
  const viewModel = useVocabularyPracticeViewModel()
  const handleOpenPracticeDetail = useCallback(
    (practiceId: PracticeTileId) => {
      const mode = viewModel.selectedMode
      const groupIds = viewModel.activeGroupId ? [viewModel.activeGroupId] : undefined
      if (practiceId === "listen_say") {
        navigation.navigate("VocabularyListenSayPractice", { mode, groupIds })
        return
      }
      const questionType: ExerciseQuestionType = practiceId
      if (questionType === "fill_in_gap") {
        navigation.navigate("VocabularyFillInGapPractice", { mode, groupIds })
        return
      }
      if (questionType === "match_synonym") {
        navigation.navigate("VocabularyMatchSynonymsPractice", { mode, groupIds })
        return
      }
      if (questionType === "guess_word") {
        navigation.navigate("VocabularyPracticeDetail", { practiceId: "guess", mode, groupIds })
        return
      }
      navigation.navigate("VocabularyPracticeDetail", { practiceId: "meaning", mode, groupIds })
    },
    [navigation, viewModel.activeGroupId, viewModel.selectedMode],
  )

  return (
    <VocabularyPracticeView
      {...viewModel}
      onRequestBack={() => navigation.goBack()}
      onRequestPracticeDetail={handleOpenPracticeDetail}
      onRequestLogin={() => setSession(undefined)}
      onRequestOpenIap={() => navigation.navigate("ProfileIap")}
      onRequestOpenShowroom={() => navigation.navigate("VocabularyShowroomScreen")}
      onRequestOpenGroups={() => navigation.navigate("VocabularyGroups")}
    />
  )
}
