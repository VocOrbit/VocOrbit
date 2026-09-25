import { FC } from "react"

import { useAuth } from "@/context/AuthContext"
import { AppStackScreenProps } from "@/navigators/navigationTypes"

import { VocabularyMatchSynonymsPracticeView } from "./VocabularyMatchSynonymsPracticeView"
import { useVocabularyMatchSynonymsPracticeViewModel } from "./useVocabularyMatchSynonymsPracticeViewModel"

type VocabularyMatchSynonymsPracticeScreenProps =
  AppStackScreenProps<"VocabularyMatchSynonymsPractice">

export const VocabularyMatchSynonymsPracticeScreen: FC<
  VocabularyMatchSynonymsPracticeScreenProps
> = ({ navigation, route }) => {
  const { setSession } = useAuth()
  const viewModel = useVocabularyMatchSynonymsPracticeViewModel(route.params.mode)

  return (
    <VocabularyMatchSynonymsPracticeView
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
