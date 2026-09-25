import { FC } from "react"

import { AppStackScreenProps } from "@/navigators/navigationTypes"

import { VocabularyPerfectionChallengeView } from "./VocabularyPerfectionChallengeView"
import { useVocabularyPerfectionChallengeViewModel } from "./useVocabularyPerfectionChallengeViewModel"

type VocabularyPerfectionChallengeScreenProps = AppStackScreenProps<"VocabularyPerfectionChallenge">

export const VocabularyPerfectionChallengeScreen: FC<VocabularyPerfectionChallengeScreenProps> = ({
  navigation,
}) => {
  const viewModel = useVocabularyPerfectionChallengeViewModel()

  return (
    <VocabularyPerfectionChallengeView
      {...viewModel}
      onRequestExit={() => navigation.goBack()}
      onRequestShare={() => console.info("Perfection: share")}
    />
  )
}
