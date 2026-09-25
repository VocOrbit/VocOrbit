import { FC } from "react"

import { AppStackScreenProps } from "@/navigators/navigationTypes"

import { VocabularyRushChallengeView } from "./VocabularyRushChallengeView"
import { useVocabularyRushChallengeViewModel } from "./useVocabularyRushChallengeViewModel"

type VocabularyRushChallengeScreenProps = AppStackScreenProps<"VocabularyRushChallenge">

export const VocabularyRushChallengeScreen: FC<VocabularyRushChallengeScreenProps> = ({
  navigation,
}) => {
  const viewModel = useVocabularyRushChallengeViewModel()

  return (
    <VocabularyRushChallengeView
      {...viewModel}
      onRequestExit={() => navigation.goBack()}
      onRequestShare={() => console.info("Rush: share")}
    />
  )
}
