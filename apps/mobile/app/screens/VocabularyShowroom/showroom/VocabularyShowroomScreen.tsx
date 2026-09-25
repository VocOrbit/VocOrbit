import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack"

import { useAppMeta } from "@/context/AppMetaContext"
import { useAuth } from "@/context/AuthContext"
import type { AppStackParamList } from "@/navigators/navigationTypes"
import type { ProfileAchievementSnapshot } from "@/screens/ProfileScreen/profileAchievementsModel"
import { openLinkInBrowser } from "@/utils/openLinkInBrowser"
import { loadString, saveString } from "@/utils/storage"

import { useVocabularyShowroomViewModel } from "./useVocabularyShowroomViewModel"
import { VocabularyHomeTabsView } from "./VocabularyHomeTabsView"

export const VocabularyShowroomScreen: FC = function VocabularyShowroomScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const route =
    useRoute<NativeStackScreenProps<AppStackParamList, "VocabularyShowroomScreen">["route"]>()
  const viewModel = useVocabularyShowroomViewModel()
  const { bootstrap, unreadAnnouncementCount } = useAppMeta()
  const { userId } = useAuth()
  const [isRecommendedUpdateDismissed, setIsRecommendedUpdateDismissed] = useState(false)
  const [repeatListOpenRequestKey, setRepeatListOpenRequestKey] = useState(0)
  const [vocabularyAllOpenRequestKey, setVocabularyAllOpenRequestKey] = useState(0)
  const update = bootstrap?.update
  const recommendedUpdateDismissKey = useMemo(() => {
    if (!update || update.status !== "recommended") return null
    const safeUserId = userId?.trim() || "anonymous"
    const safeVersion = update.latestVersion?.trim() || "latest"
    return `vocabulary.showroom.dismissedUpdate.${safeUserId}.${update.platform}.${safeVersion}`
  }, [update, userId])

  useEffect(() => {
    if (!recommendedUpdateDismissKey) {
      setIsRecommendedUpdateDismissed(false)
      return
    }
    setIsRecommendedUpdateDismissed(loadString(recommendedUpdateDismissKey) === "1")
  }, [recommendedUpdateDismissKey])

  useEffect(() => {
    if (!route.params?.openRepeatList) return

    setRepeatListOpenRequestKey((current) => current + 1)
    navigation.setParams({ openRepeatList: undefined })
  }, [navigation, route.params?.openRepeatList])

  useEffect(() => {
    if (!route.params?.openVocabularyAll) return

    setVocabularyAllOpenRequestKey((current) => current + 1)
    navigation.setParams({ openVocabularyAll: undefined })
  }, [navigation, route.params?.openVocabularyAll])

  const hasRecommendedUpdate = update?.status === "recommended" && !isRecommendedUpdateDismissed
  const recommendedUpdateMessage = update?.message
  const handleOpenDetails = useCallback(
    (entryId: string) => {
      navigation.navigate("VocabularyDetail", { entryId })
    },
    [navigation],
  )
  const handleOpenPractice = useCallback(() => {
    navigation.navigate("VocabularyPractice")
  }, [navigation])
  const handleOpenProfile = useCallback(() => {
    navigation.navigate("Profile")
  }, [navigation])
  const handleOpenAccountDetails = useCallback(() => {
    navigation.navigate("ProfileAccountDetails")
  }, [navigation])
  const handleOpenBilling = useCallback(() => {
    navigation.navigate("ProfileIap")
  }, [navigation])
  const handleOpenSettings = useCallback(() => {
    navigation.navigate("ProfileSettings")
  }, [navigation])
  const handleOpenAchievements = useCallback(
    (snapshot: ProfileAchievementSnapshot) => {
      navigation.navigate("ProfileAchievements", { snapshot })
    },
    [navigation],
  )
  const handleOpenMasteryCenter = useCallback(() => {
    navigation.navigate("ProfileWeeklyAnalytics")
  }, [navigation])
  const handleOpenSearch = useCallback(() => {
    navigation.navigate("VocabularySearch")
  }, [navigation])
  const handleOpenGroups = useCallback(() => {
    navigation.navigate("VocabularyGroups")
  }, [navigation])
  const handleOpenHowToUse = useCallback(() => {
    navigation.navigate("VocabularyHowToUse")
  }, [navigation])
  const handleOpenLearnedWords = useCallback(() => {
    navigation.navigate("ProfileWordList", { mode: "learned" })
  }, [navigation])
  const handleOpenRepeatSession = useCallback(() => {
    navigation.navigate("VocabularyRepeatSession")
  }, [navigation])
  const handleOpenAnnouncements = useCallback(() => {
    navigation.navigate("AppAnnouncements")
  }, [navigation])
  const handleOpenUpdate = useCallback(() => {
    if (!update?.storeUrl) return
    void openLinkInBrowser(update.storeUrl)
  }, [update?.storeUrl])
  const handleDismissRecommendedUpdate = useCallback(() => {
    if (!recommendedUpdateDismissKey) return
    saveString(recommendedUpdateDismissKey, "1")
    setIsRecommendedUpdateDismissed(true)
  }, [recommendedUpdateDismissKey])

  return (
    <VocabularyHomeTabsView
      {...viewModel}
      announcementUnreadCount={unreadAnnouncementCount}
      hasRecommendedUpdate={hasRecommendedUpdate}
      recommendedUpdateMessage={recommendedUpdateMessage}
      repeatListOpenRequestKey={repeatListOpenRequestKey}
      vocabularyAllOpenRequestKey={vocabularyAllOpenRequestKey}
      onRequestDetails={handleOpenDetails}
      onRequestPractice={handleOpenPractice}
      onRequestProfile={handleOpenProfile}
      onRequestAccountDetails={handleOpenAccountDetails}
      onRequestBilling={handleOpenBilling}
      onRequestSettings={handleOpenSettings}
      onRequestAchievements={handleOpenAchievements}
      onRequestMasteryCenter={handleOpenMasteryCenter}
      onRequestSearch={handleOpenSearch}
      onRequestGroups={handleOpenGroups}
      onRequestHowToUse={handleOpenHowToUse}
      onRequestLearnedWords={handleOpenLearnedWords}
      onRequestRepeatSession={handleOpenRepeatSession}
      onRequestAnnouncements={handleOpenAnnouncements}
      onRequestUpdate={handleOpenUpdate}
      onDismissRecommendedUpdate={handleDismissRecommendedUpdate}
    />
  )
}
