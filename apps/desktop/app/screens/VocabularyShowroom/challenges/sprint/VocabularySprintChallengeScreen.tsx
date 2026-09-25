import { FC } from "react"

import { AppStackScreenProps } from "@/navigators/navigationTypes"

import { VocabularySprintChallengeView } from "./VocabularySprintChallengeView"
import { useVocabularySprintChallengeViewModel } from "./useVocabularySprintChallengeViewModel"

type VocabularySprintChallengeScreenProps = AppStackScreenProps<"VocabularySprintChallenge">

export const VocabularySprintChallengeScreen: FC<VocabularySprintChallengeScreenProps> = ({
  navigation,
}) => {
  const viewModel = useVocabularySprintChallengeViewModel()

  return (
    <VocabularySprintChallengeView
      {...viewModel}
      onRequestExit={() => navigation.goBack()}
      onRequestShare={() => console.info("Sprint: share")}
    />
  )
}
