import { FC } from "react"

import { useAuth } from "@/context/AuthContext"
import { AppStackScreenProps } from "@/navigators/navigationTypes"

import { VocabularyFillInGapPracticeView } from "./VocabularyFillInGapPracticeView"
import { useVocabularyFillInGapPracticeViewModel } from "./useVocabularyFillInGapPracticeViewModel"

type VocabularyFillInGapPracticeScreenProps = AppStackScreenProps<"VocabularyFillInGapPractice">

export const VocabularyFillInGapPracticeScreen: FC<VocabularyFillInGapPracticeScreenProps> = ({
  navigation,
  route,
}) => {
  const { setSession } = useAuth()
  const viewModel = useVocabularyFillInGapPracticeViewModel(route.params.mode, route.params.groupIds)

  return (
    <VocabularyFillInGapPracticeView
      {...viewModel}
      onRequestLeave={() => {
        void viewModel.onCompleteSession().finally(() => {
          navigation.goBack()
        })
      }}
      onRequestLogin={() => setSession(undefined)}
      onRequestOpenIap={() => navigation.navigate("ProfileIap")}
      onRequestOpenShowroom={() => navigation.navigate("VocabularyShowroomScreen")}
    />
  )
}
