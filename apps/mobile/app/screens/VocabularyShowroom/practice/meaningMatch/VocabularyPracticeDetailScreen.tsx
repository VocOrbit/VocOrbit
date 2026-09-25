import { FC } from "react"

import { useAuth } from "@/context/AuthContext"
import { AppStackScreenProps } from "@/navigators/navigationTypes"

import { VocabularyPracticeDetailView } from "./VocabularyPracticeDetailView"
import { useVocabularyPracticeDetailViewModel } from "./useVocabularyPracticeDetailViewModel"

type VocabularyPracticeDetailScreenProps = AppStackScreenProps<"VocabularyPracticeDetail">

export const VocabularyPracticeDetailScreen: FC<VocabularyPracticeDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { setSession } = useAuth()
  const viewModel = useVocabularyPracticeDetailViewModel(
    route.params.practiceId,
    route.params.mode,
    route.params.groupIds,
  )

  return (
    <VocabularyPracticeDetailView
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
