import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { Linking } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

import { useAppMeta } from "@/context/AppMetaContext"
import { useAuth } from "@/context/AuthContext"
import { VocabularyShowroomView } from "./VocabularyShowroomView"
import { useVocabularyShowroomViewModel } from "./useVocabularyShowroomViewModel"
import type { AppStackParamList } from "@/navigators/navigationTypes"
import { loadString, saveString } from "@/utils/storage"

export const VocabularyShowroomScreen: FC = function VocabularyShowroomScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const viewModel = useVocabularyShowroomViewModel()
  const { bootstrap, unreadAnnouncementCount } = useAppMeta()
  const { userId } = useAuth()
  const [isRecommendedUpdateDismissed, setIsRecommendedUpdateDismissed] = useState(false)
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

  const hasRecommendedUpdate =
    update?.status === "recommended" && !isRecommendedUpdateDismissed
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
  const handleOpenSearch = useCallback(() => {
    navigation.navigate("VocabularySearch")
  }, [navigation])
  const handleOpenCapture = useCallback(() => {
    navigation.navigate("VocabularyCapture")
  }, [navigation])
  const handleOpenAnnouncements = useCallback(() => {
    navigation.navigate("AppAnnouncements")
  }, [navigation])
  const handleOpenUpdate = useCallback(() => {
    if (!update?.storeUrl) return
    void Linking.openURL(update.storeUrl)
  }, [update?.storeUrl])
  const handleDismissRecommendedUpdate = useCallback(() => {
    if (!recommendedUpdateDismissKey) return
    saveString(recommendedUpdateDismissKey, "1")
    setIsRecommendedUpdateDismissed(true)
  }, [recommendedUpdateDismissKey])

  return (
    <VocabularyShowroomView
      {...viewModel}
      announcementUnreadCount={unreadAnnouncementCount}
      hasRecommendedUpdate={hasRecommendedUpdate}
      recommendedUpdateMessage={recommendedUpdateMessage}
      onRequestDetails={handleOpenDetails}
      onRequestPractice={handleOpenPractice}
      onRequestProfile={handleOpenProfile}
      onRequestSearch={handleOpenSearch}
      onRequestAddWord={handleOpenCapture}
      onRequestAnnouncements={handleOpenAnnouncements}
      onRequestUpdate={handleOpenUpdate}
      onDismissRecommendedUpdate={handleDismissRecommendedUpdate}
    />
  )
}
