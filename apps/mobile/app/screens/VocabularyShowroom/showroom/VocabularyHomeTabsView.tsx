import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { translate } from "@/i18n/translate"
import {
  type ProfileAchievementSnapshot,
  resolveProfileAchievements,
} from "@/screens/ProfileScreen/profileAchievementsModel"
import { exercisesApi, type ExerciseWeeklyAnalytics } from "@/services/api/exercisesApi"
import {
  wordInsightApi,
  type WordInsightLearningItemMasterySummary,
} from "@/services/api/wordInsightApi"
import { speakWord } from "@/services/pronunciation/pronunciationService"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

import type { VocabularyEntry } from "../types"
import type { VocabularyShowroomViewModel } from "./useVocabularyShowroomViewModel"

type MainTab = "home" | "practice" | "vocabulary" | "insights" | "profile"
type VocabularyFilter = "all" | "favorites" | "hard"

type VocabularyHomeTabsViewProps = VocabularyShowroomViewModel & {
  announcementUnreadCount: number
  hasRecommendedUpdate: boolean
  recommendedUpdateMessage?: string
  repeatListOpenRequestKey?: number
  vocabularyAllOpenRequestKey?: number
  onRequestDetails: (entryId: string) => void
  onRequestPractice: () => void
  onRequestProfile: () => void
  onRequestSearch: () => void
  onRequestGroups: () => void
  onRequestHowToUse: () => void
  onRequestLearnedWords: () => void
  onRequestRepeatSession: () => void
  onRequestAnnouncements: () => void
  onRequestUpdate: () => void
  onDismissRecommendedUpdate: () => void
  onRequestAccountDetails: () => void
  onRequestBilling: () => void
  onRequestSettings: () => void
  onRequestAchievements: (snapshot: ProfileAchievementSnapshot) => void
  onRequestMasteryCenter: () => void
}

type TabConfig = {
  key: MainTab
  icon: string
}

const TABS: TabConfig[] = [
  { key: "home", icon: "home-variant-outline" },
  { key: "practice", icon: "target" },
  { key: "vocabulary", icon: "cards-outline" },
  { key: "insights", icon: "chart-line" },
  { key: "profile", icon: "account-circle-outline" },
]

const VOCABULARY_FILTERS: VocabularyFilter[] = ["all", "favorites", "hard"]

const DAILY_GOAL = 10
const PRACTICE_BOX_GROUP_NAME = "Practice Box"

function formatCount(value: number | undefined): string {
  return `${Math.max(0, value ?? 0)}`
}

function formatAccuracy(value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "0%"
  return `${Math.round(value)}%`
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return translate("vocabulary:showroom.home.greetingMorning")
  if (hour < 18) return translate("vocabulary:showroom.home.greetingAfternoon")
  return translate("vocabulary:showroom.home.greetingEvening")
}

function getTabLabel(tab: MainTab): string {
  switch (tab) {
    case "home":
      return translate("vocabulary:showroom.tabs.home")
    case "practice":
      return translate("vocabulary:showroom.tabs.practice")
    case "vocabulary":
      return translate("vocabulary:showroom.tabs.vocabulary")
    case "insights":
      return translate("vocabulary:showroom.tabs.insights")
    case "profile":
      return translate("vocabulary:showroom.tabs.profile")
  }
}

function getVocabularyFilterLabel(filter: VocabularyFilter): string {
  switch (filter) {
    case "all":
      return translate("vocabulary:showroom.filters.all")
    case "favorites":
      return translate("vocabulary:showroom.filters.favorites")
    case "hard":
      return translate("vocabulary:showroom.filters.hard")
  }
}

function getDifficultyLabel(difficulty: "New" | "Learning" | "Familiar"): string {
  switch (difficulty) {
    case "New":
      return translate("vocabulary:showroom.difficulty.new")
    case "Learning":
      return translate("vocabulary:showroom.difficulty.learning")
    case "Familiar":
      return translate("vocabulary:showroom.difficulty.familiar")
  }
}

function getProfileName(email?: string): string {
  const localPart = email?.split("@")[0]?.trim()
  if (!localPart) return "VocOrbit"
  return localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toLocaleUpperCase()}${part.slice(1)}`)
    .join(" ")
}

function resolveDifficulty(entry: VocabularyEntry): "New" | "Learning" | "Familiar" {
  if (entry.encounterCount >= 6) return "Familiar"
  if (entry.encounterCount >= 2) return "Learning"
  return "New"
}

function getDayLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) return ""
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(parsed)
}

export const VocabularyHomeTabsView: FC<VocabularyHomeTabsViewProps> = ({
  entries,
  groups,
  activeGroupId,
  activeGroupName,
  isLoading,
  isGroupMutating,
  isRefreshing,
  errorMessage,
  requiresLogin,
  isLoadingMore,
  hasMoreEntries,
  repeatWordCount,
  repeatDueWordCount,
  repeatWordLimit,
  isRepeatUnlimited,
  repeatListOpenRequestKey,
  vocabularyAllOpenRequestKey,
  onRefresh,
  onLoadMore,
  onReloadGroups,
  onGoToLogin,
  isWordFavorited,
  onToggleFavoriteWord,
  isWordInRepeatList,
  onToggleRepeatWord,
  onRequestDetails,
  onRequestPractice,
  onRequestProfile,
  onRequestSearch,
  onRequestGroups,
  onRequestHowToUse,
  onRequestLearnedWords,
  onRequestRepeatSession,
  onRequestAnnouncements,
  onRequestUpdate,
  onDismissRecommendedUpdate,
  onRequestAccountDetails,
  onRequestBilling,
  onRequestSettings,
  onRequestAchievements,
  onRequestMasteryCenter,
  announcementUnreadCount,
  hasRecommendedUpdate,
  recommendedUpdateMessage,
}) => {
  useTranslation()
  const { themed, theme } = useAppTheme()
  const { authEmail, logout } = useAuth()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const vocabularyScrollRef = useRef<ScrollView>(null)
  const vocabularyScrollYRef = useRef(0)
  const shouldRestoreVocabularyScrollRef = useRef(false)
  const [activeTab, setActiveTab] = useState<MainTab>("home")
  const [vocabularyFilter, setVocabularyFilter] = useState<VocabularyFilter>("all")
  const [toastMessage, setToastMessage] = useState<string | undefined>(undefined)
  const [isFavoriteMutating, setIsFavoriteMutating] = useState(false)
  const [isRepeatMutating, setIsRepeatMutating] = useState(false)
  const [collectionPickerEntry, setCollectionPickerEntry] = useState<VocabularyEntry | undefined>()
  const [isCollectionAssigning, setIsCollectionAssigning] = useState(false)
  const [analytics, setAnalytics] = useState<ExerciseWeeklyAnalytics | undefined>(undefined)
  const [masterySummary, setMasterySummary] = useState<
    WordInsightLearningItemMasterySummary | undefined
  >(undefined)
  const [fallbackSavedWordCount, setFallbackSavedWordCount] = useState<number | undefined>(
    undefined,
  )
  const [activeWordListCount, setActiveWordListCount] = useState<number | undefined>(undefined)
  const [favoriteWordListCount, setFavoriteWordListCount] = useState<number | undefined>(undefined)
  const [learnedWordListCount, setLearnedWordListCount] = useState<number | undefined>(undefined)
  const [isInsightsLoading, setIsInsightsLoading] = useState(true)
  const [insightsError, setInsightsError] = useState<string | undefined>(undefined)

  const loadInsights = useCallback(async () => {
    setIsInsightsLoading(true)
    setInsightsError(undefined)
    setFallbackSavedWordCount(undefined)
    setActiveWordListCount(undefined)
    setFavoriteWordListCount(undefined)
    setLearnedWordListCount(undefined)

    const [
      analyticsResponse,
      masteryResponse,
      activeCountResponse,
      favoriteCountResponse,
      learnedCountResponse,
    ] = await Promise.all([
      exercisesApi.getWeeklyAnalytics({
        timezoneOffsetMinutes: -new Date().getTimezoneOffset(),
      }),
      wordInsightApi.getLearningItemMasterySummary(),
      wordInsightApi.countLearningItems({ status: "active" }),
      wordInsightApi.countLearningItems({ status: "active", favorite: true }),
      wordInsightApi.countLearningItems({ status: "learned" }),
    ])

    if (analyticsResponse.kind === "ok") {
      setAnalytics(analyticsResponse.data)
    } else {
      setAnalytics(undefined)
      setInsightsError(translate("vocabulary:showroom.insightsTab.loadFailedTitle"))
    }

    if (masteryResponse.kind === "ok") {
      setMasterySummary(masteryResponse.data)
    } else {
      setMasterySummary(undefined)
      if (activeCountResponse.kind === "ok" && learnedCountResponse.kind === "ok") {
        setFallbackSavedWordCount(activeCountResponse.data + learnedCountResponse.data)
      }
    }

    if (activeCountResponse.kind === "ok") {
      setActiveWordListCount(activeCountResponse.data)
    }

    if (favoriteCountResponse.kind === "ok") {
      setFavoriteWordListCount(favoriteCountResponse.data)
    }

    if (learnedCountResponse.kind === "ok") {
      setLearnedWordListCount(learnedCountResponse.data)
    }

    setIsInsightsLoading(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      void loadInsights()
    }, [loadInsights]),
  )

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToastMessage(message)
    toastTimeoutRef.current = setTimeout(() => setToastMessage(undefined), 2200)
  }, [])

  useEffect(() => {
    if (!repeatListOpenRequestKey) return
    setActiveTab("practice")
    showToast(translate("vocabulary:showroom.toast.dailyReviewReady"))
  }, [repeatListOpenRequestKey, showToast])

  useEffect(() => {
    if (!vocabularyAllOpenRequestKey) return

    setVocabularyFilter("all")
    setActiveTab("vocabulary")
    vocabularyScrollYRef.current = 0
    requestAnimationFrame(() => {
      vocabularyScrollRef.current?.scrollTo({ y: 0, animated: false })
    })
  }, [vocabularyAllOpenRequestKey])

  const loadedFavoriteCount = useMemo(
    () => entries.filter((entry) => isWordFavorited(entry.id)).length,
    [entries, isWordFavorited],
  )
  const favoriteCount = favoriteWordListCount ?? loadedFavoriteCount
  const countedSavedWordCount =
    activeWordListCount !== undefined && learnedWordListCount !== undefined
      ? activeWordListCount + learnedWordListCount
      : undefined
  const exactSavedWordCount =
    countedSavedWordCount ?? fallbackSavedWordCount ?? masterySummary?.totalItemCount
  const learnedCount = learnedWordListCount ?? masterySummary?.learnedItemCount ?? 0
  const learnedWordsPageCount = learnedWordListCount ?? learnedCount
  const learnedWordsPageCountText =
    isInsightsLoading && learnedWordListCount === undefined
      ? translate("vocabulary:profile.loadingList")
      : translate("vocabulary:showroom.home.learnedWordsCount", {
          count: learnedWordsPageCount,
        })
  const activeItemCount = activeWordListCount ?? masterySummary?.activeItemCount ?? entries.length
  const hasExactActiveItemCount =
    activeWordListCount !== undefined || typeof masterySummary?.activeItemCount === "number"
  const practiceWordCountText = hasExactActiveItemCount
    ? translate("vocabulary:showroom.home.savedWordsFiveMin", {
        count: activeItemCount,
      })
    : translate("vocabulary:showroom.vocabularyTab.loadingSavedWords")
  const savedWordCount = exactSavedWordCount ?? activeItemCount + learnedCount
  const hasExactSavedWordCount = typeof exactSavedWordCount === "number"
  const isSavedWordCountLoading = isInsightsLoading && !masterySummary
  const savedWordMetricValue = hasExactSavedWordCount ? formatCount(exactSavedWordCount) : "..."
  const weeklyStudiedCount =
    analytics?.summary.studiedItemCount ?? masterySummary?.weeklyStudiedItemCount ?? 0
  const weeklyAnsweredQuestionCount = analytics?.summary.answeredQuestions ?? 0
  const weeklyLearnedCount = masterySummary?.weeklyLearnedItemCount ?? 0
  const weakItemCount = analytics?.weakItems.length ?? 0
  const stableWordCount = Math.max(savedWordCount - weakItemCount, 0)
  const vocabularyHealthPercent =
    savedWordCount > 0 ? Math.round((stableWordCount / savedWordCount) * 100) : 0
  const streakDays = analytics?.summary.streakDays ?? 0
  const achievementSnapshot = useMemo<ProfileAchievementSnapshot>(
    () => ({
      totalWords: savedWordCount,
      favoriteWords: favoriteCount,
      collections: groups.length,
      currentStreak: streakDays,
      repeatWords: repeatWordCount,
      repeatDueWords: repeatDueWordCount,
      learnedWords: learnedCount,
      activeWords: activeItemCount,
      weeklyStudiedWords: weeklyStudiedCount,
      weeklyLearnedWords: weeklyLearnedCount,
      weakWords: weakItemCount,
      activeDays: analytics?.summary.activeDays ?? 0,
      sessionsCompleted: analytics?.summary.sessionsCompleted ?? 0,
      answeredQuestions: analytics?.summary.answeredQuestions ?? 0,
      correctAnswers: analytics?.summary.correctAnswers ?? 0,
      accuracyPercent: analytics?.summary.accuracyPercent ?? 0,
    }),
    [
      activeItemCount,
      analytics?.summary.accuracyPercent,
      analytics?.summary.activeDays,
      analytics?.summary.answeredQuestions,
      analytics?.summary.correctAnswers,
      analytics?.summary.sessionsCompleted,
      favoriteCount,
      groups.length,
      learnedCount,
      repeatDueWordCount,
      repeatWordCount,
      savedWordCount,
      streakDays,
      weakItemCount,
      weeklyLearnedCount,
      weeklyStudiedCount,
    ],
  )
  const profileAchievements = resolveProfileAchievements(achievementSnapshot)
  const achievementPreview = profileAchievements.slice(0, 3)
  const todayActivity = analytics?.daily[analytics.daily.length - 1]
  const todayAnswered = todayActivity?.answeredQuestions ?? 0
  const dailyGoalProgress = Math.min(todayAnswered / DAILY_GOAL, 1)
  const dailyGoalProgressWidth: `${number}%` = `${Math.round(dailyGoalProgress * 100)}%`
  const repeatLimitLabel = isRepeatUnlimited ? "∞" : `${repeatWordLimit ?? 0}`
  const profileName = getProfileName(authEmail)
  const activeGroup = useMemo(
    () => groups.find((group) => group.id === activeGroupId),
    [activeGroupId, groups],
  )
  const activeCollectionLabel = activeGroupName ?? "All words"
  const vocabularyHeaderCount = activeGroupId ? activeGroup?.itemCount : exactSavedWordCount
  const isVocabularyHeaderCountLoading = activeGroupId ? !activeGroup : isSavedWordCountLoading
  const vocabularyHeaderEyebrow =
    typeof vocabularyHeaderCount === "number"
      ? translate("vocabulary:showroom.vocabularyTab.savedWords", {
          count: vocabularyHeaderCount,
        })
      : isVocabularyHeaderCountLoading
        ? translate("vocabulary:showroom.vocabularyTab.loadingSavedWords")
        : translate("vocabulary:showroom.vocabularyTab.savedWordsUnavailable")
  const canStartPractice = entries.length >= 2
  const canStartRepeatSession = repeatDueWordCount >= 2
  const weakItemIds = useMemo(
    () => new Set((analytics?.weakItems ?? []).map((item) => item.itemId)),
    [analytics?.weakItems],
  )

  const recentEntries = useMemo(
    () => [...entries].sort((a, b) => b.lastLookupAt.localeCompare(a.lastLookupAt)),
    [entries],
  )
  const recentVocabulary = recentEntries.slice(0, 4)
  const mistakes = analytics?.weakItems.slice(0, 3) ?? []

  const filteredEntries = useMemo(() => {
    const filteredByTab = entries.filter((entry) => {
      if (vocabularyFilter === "favorites") return isWordFavorited(entry.id)
      if (vocabularyFilter === "hard") return weakItemIds.has(entry.id)
      return true
    })
    return [...filteredByTab].sort((a, b) => b.lastLookupAt.localeCompare(a.lastLookupAt))
  }, [entries, isWordFavorited, vocabularyFilter, weakItemIds])
  const assignableGroups = useMemo(
    () =>
      groups.filter(
        (group) =>
          group.name.trim().toLocaleLowerCase() !== PRACTICE_BOX_GROUP_NAME.toLocaleLowerCase(),
      ),
    [groups],
  )
  const canLoadMoreForCurrentFilter = useMemo(() => {
    if (!hasMoreEntries) return false
    if (vocabularyFilter === "all") return true

    if (vocabularyFilter === "favorites") {
      if (activeGroupId || favoriteWordListCount === undefined) return true
      return loadedFavoriteCount < favoriteWordListCount
    }

    if (weakItemIds.size === 0) return false
    if (activeGroupId) return true
    return weakItemIds.size > 0 && filteredEntries.length < weakItemIds.size
  }, [
    activeGroupId,
    favoriteWordListCount,
    filteredEntries.length,
    hasMoreEntries,
    loadedFavoriteCount,
    vocabularyFilter,
    weakItemIds.size,
  ])
  const shouldShowLoadMore = isLoadingMore || canLoadMoreForCurrentFilter
  const shouldOfferFilteredLoadMore =
    vocabularyFilter !== "all" && filteredEntries.length === 0 && canLoadMoreForCurrentFilter

  const handleStateButtonPress = useCallback(() => {
    if (requiresLogin) {
      onGoToLogin()
      return
    }
    if (errorMessage) {
      onRefresh()
      return
    }
    onRequestSearch()
  }, [errorMessage, onGoToLogin, onRefresh, onRequestSearch, requiresLogin])

  const handleShowAllVocabulary = useCallback(() => {
    setVocabularyFilter("all")
  }, [])

  const handlePlayVocabularyPronunciation = useCallback(
    (entry: VocabularyEntry) => {
      void (async () => {
        const result = await speakWord({
          word: entry.word,
          sourceLang: entry.sourceLang,
        })
        if (result === "failed") {
          showToast(translate("vocabulary:showroom.toast.pronunciationFailed"))
        }
      })()
    },
    [showToast],
  )

  const handlePrimaryPracticePress = useCallback(() => {
    if (!canStartPractice) {
      onRequestSearch()
      return
    }
    if (canStartRepeatSession) {
      onRequestRepeatSession()
      return
    }
    onRequestPractice()
  }, [
    canStartPractice,
    canStartRepeatSession,
    onRequestPractice,
    onRequestRepeatSession,
    onRequestSearch,
  ])

  const handleOpenLearnedWordsFromHome = useCallback(() => {
    onRequestLearnedWords()
  }, [onRequestLearnedWords])

  const handleVocabularyScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    vocabularyScrollYRef.current = event.nativeEvent.contentOffset.y
  }, [])

  const restoreVocabularyScroll = useCallback(() => {
    if (activeTab !== "vocabulary") return
    const offsetY = vocabularyScrollYRef.current
    if (offsetY <= 0) return
    requestAnimationFrame(() => {
      vocabularyScrollRef.current?.scrollTo({ y: offsetY, animated: false })
    })
  }, [activeTab])

  useFocusEffect(
    useCallback(() => {
      shouldRestoreVocabularyScrollRef.current = true
      restoreVocabularyScroll()
    }, [restoreVocabularyScroll]),
  )

  const handleOpenVocabularyDetails = useCallback(
    (entryId: string) => {
      shouldRestoreVocabularyScrollRef.current = true
      onRequestDetails(entryId)
    },
    [onRequestDetails],
  )

  const handleToggleFavorite = useCallback(
    (entry: VocabularyEntry) => {
      if (isFavoriteMutating) return
      setIsFavoriteMutating(true)
      void (async () => {
        try {
          const result = await onToggleFavoriteWord(entry)
          if (result === "added") {
            setFavoriteWordListCount((current) => (current === undefined ? current : current + 1))
            showToast(translate("vocabulary:showroom.favoriteAdded", { word: entry.word }))
          } else if (result === "removed") {
            setFavoriteWordListCount((current) =>
              current === undefined ? current : Math.max(0, current - 1),
            )
            showToast(translate("vocabulary:showroom.favoriteRemoved", { word: entry.word }))
          } else {
            showToast(translate("vocabulary:showroom.toast.favoriteUpdateFailed"))
          }
        } finally {
          setIsFavoriteMutating(false)
        }
      })()
    },
    [isFavoriteMutating, onToggleFavoriteWord, showToast],
  )

  const handleToggleRepeat = useCallback(
    (entry: VocabularyEntry) => {
      if (isRepeatMutating) return
      setIsRepeatMutating(true)
      void (async () => {
        try {
          const result = await onToggleRepeatWord(entry)
          if (result === "added") {
            showToast(translate("vocabulary:showroom.toast.repeatAdded", { word: entry.word }))
          } else if (result === "removed") {
            showToast(translate("vocabulary:showroom.toast.repeatRemoved", { word: entry.word }))
          } else if (result === "permission-denied") {
            showToast(translate("vocabulary:showroom.toast.repeatPermissionDenied"))
          } else {
            showToast(translate("vocabulary:showroom.toast.repeatFull"))
          }
        } finally {
          setIsRepeatMutating(false)
        }
      })()
    },
    [isRepeatMutating, onToggleRepeatWord, showToast],
  )

  const handleMoveEntryToGroup = useCallback(
    (groupId: string) => {
      const entry = collectionPickerEntry
      if (!entry || isCollectionAssigning || isGroupMutating) return

      setIsCollectionAssigning(true)
      void (async () => {
        try {
          const response = await wordInsightApi.addLearningItemsToGroup(groupId, [entry.id])
          if (response.kind !== "ok") {
            showToast(translate("vocabulary:showroom.toast.collectionUpdateFailed"))
            return
          }

          await onReloadGroups()
          if (activeGroupId === groupId) onRefresh()
          setCollectionPickerEntry(undefined)
          showToast(
            translate("vocabulary:showroom.toast.addedToCollection", {
              word: entry.word,
              collection: response.data.name,
            }),
          )
        } finally {
          setIsCollectionAssigning(false)
        }
      })()
    },
    [
      activeGroupId,
      collectionPickerEntry,
      isCollectionAssigning,
      isGroupMutating,
      onRefresh,
      onReloadGroups,
      showToast,
    ],
  )

  const handleMoreForEntry = useCallback(
    (entry: VocabularyEntry) => {
      Alert.alert(
        entry.word,
        entry.definition || translate("vocabulary:showroom.alerts.savedVocabulary"),
        [
          {
            text: translate("vocabulary:showroom.alerts.moveToCollection"),
            onPress: () => setCollectionPickerEntry(entry),
          },
          {
            text: translate("vocabulary:showroom.alerts.viewDetails"),
            onPress: () => onRequestDetails(entry.id),
          },
          { text: translate("vocabulary:showroom.alerts.cancel"), style: "cancel" },
        ],
      )
    },
    [onRequestDetails],
  )

  const renderState = () => {
    if (isLoading || isRefreshing) {
      return (
        <View style={themed($stateStack)}>
          <SkeletonCard />
          <SkeletonCard compact />
          <SkeletonCard compact />
        </View>
      )
    }

    if (errorMessage || requiresLogin) {
      return (
        <StateCard
          title={translate("vocabulary:showroom.state.loadTitle")}
          body={errorMessage ?? translate("vocabulary:showroom.state.signInAgain")}
          action={
            requiresLogin
              ? translate("vocabulary:showroom.state.signIn")
              : translate("vocabulary:showroom.state.tryAgain")
          }
          onPress={handleStateButtonPress}
        />
      )
    }

    return (
      <StateCard
        title={translate("vocabulary:showroom.state.startTitle")}
        body={translate("vocabulary:showroom.state.startBody")}
        action={translate("vocabulary:showroom.state.addWord")}
        onPress={onRequestSearch}
      />
    )
  }

  const renderHome = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={themed([$scrollContent, $bottomInsets])}
    >
      <HeaderBlock
        eyebrow={`${getGreeting()}, ${profileName}`}
        title={translate("vocabulary:showroom.home.today")}
        actionIcon="bell-outline"
        badgeCount={announcementUnreadCount}
        onActionPress={onRequestAnnouncements}
      />

      {hasRecommendedUpdate ? (
        <View style={themed($updateBanner)}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:showroom.accessibility.openUpdate")}
            onPress={onRequestUpdate}
            style={({ pressed }) => [themed($updateCopy), pressed && themed($pressedSoft)]}
          >
            <Text
              style={themed($updateTitle)}
              text={translate("vocabulary:showroom.home.updateAvailable")}
            />
            <Text
              style={themed($mutedBody)}
              text={recommendedUpdateMessage ?? translate("vocabulary:showroom.home.updateBody")}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:showroom.accessibility.dismissUpdate")}
            onPress={onDismissRecommendedUpdate}
            style={({ pressed }) => [themed($smallIconButton), pressed && themed($pressedSoft)]}
          >
            <MaterialCommunityIcons name="close" size={18} color={showroomColors.textStrong} />
          </Pressable>
        </View>
      ) : null}

      {entries.length === 0 ? (
        renderState()
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:showroom.home.continueLearning")}
            onPress={handlePrimaryPracticePress}
            style={({ pressed }) => [themed($heroCard), pressed && themed($cardPressed)]}
          >
            <View style={themed($heroIcon)}>
              <MaterialCommunityIcons
                name={canStartPractice ? "dumbbell" : "plus"}
                size={26}
                color="#FFFFFF"
              />
            </View>
            <View style={themed($heroCopy)}>
              <Text
                style={themed($cardEyebrow)}
                text={
                  canStartPractice
                    ? translate("vocabulary:showroom.home.continueLearning")
                    : translate("vocabulary:showroom.home.practiceNeedsTwoWords")
                }
              />
              <Text
                style={themed($heroTitle)}
                text={
                  !canStartPractice
                    ? entries.length === 1
                      ? translate("vocabulary:showroom.home.addOneMoreWord")
                      : translate("vocabulary:showroom.home.saveTwoWordsToStart")
                    : canStartRepeatSession
                      ? translate("vocabulary:showroom.home.wordsReadyToReview", {
                          count: repeatDueWordCount,
                        })
                      : translate("vocabulary:showroom.home.practiceYourSavedWords")
                }
              />
              <Text
                style={themed($heroMeta)}
                text={
                  !canStartPractice
                    ? translate("vocabulary:showroom.home.savedWordsProgress", {
                        count: activeItemCount,
                      })
                    : canStartRepeatSession
                      ? translate("vocabulary:showroom.home.dailyReviewFiveMin")
                      : practiceWordCountText
                }
              />
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={showroomColors.textMuted}
            />
          </Pressable>

          <View style={themed($sectionCard)}>
            <View style={themed($sectionHeaderRow)}>
              <View>
                <Text
                  style={themed($sectionTitle)}
                  text={translate("vocabulary:showroom.home.dailyGoal")}
                />
                <Text
                  style={themed($sectionSubtle)}
                  text={translate("vocabulary:showroom.home.questionsToday", {
                    answered: todayAnswered,
                    goal: DAILY_GOAL,
                  })}
                />
              </View>
              <Text style={themed($largeMetric)} text={`${Math.round(dailyGoalProgress * 100)}%`} />
            </View>
            <View style={themed($progressTrack)}>
              <View style={[themed($progressFill), { width: dailyGoalProgressWidth }]} />
            </View>
          </View>

          <SectionHeader
            title={translate("vocabulary:showroom.home.recentVocabulary")}
            action={translate("vocabulary:showroom.tabs.vocabulary")}
            onPress={() => setActiveTab("vocabulary")}
          />
          <View style={themed($compactList)}>
            {recentVocabulary.map((entry) => (
              <CompactWordRow
                key={`recent-${entry.id}`}
                entry={entry}
                collectionLabel={activeCollectionLabel}
                onPress={() => onRequestDetails(entry.id)}
              />
            ))}
          </View>

          <View style={themed($twoColumnGrid)}>
            <MetricCard
              value={formatCount(streakDays)}
              label={translate("vocabulary:showroom.home.dayStreak")}
              icon="fire"
            />
            <MetricCard
              value={`${repeatWordCount}/${repeatLimitLabel}`}
              label={translate("vocabulary:showroom.home.reviewList")}
              icon="bell-ring-outline"
            />
          </View>

          <SectionHeader
            title={translate("vocabulary:showroom.home.weeklyProgress")}
            action={translate("vocabulary:showroom.tabs.insights")}
            onPress={() => setActiveTab("insights")}
          />
          <WeeklyBars
            analytics={analytics}
            isLoading={isInsightsLoading}
            onEmptyAction={handlePrimaryPracticePress}
          />

          <View style={themed($learnedWordsCtaWrap)}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:profile.accessibility.openLearnedWords")}
              onPress={handleOpenLearnedWordsFromHome}
              style={({ pressed }) => [
                themed($learnedWordsButton),
                pressed && themed($cardPressed),
              ]}
            >
              <View style={themed($learnedWordsIcon)}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={22}
                  color={showroomColors.accentText}
                />
              </View>
              <View style={themed($learnedWordsCopy)}>
                <Text
                  style={themed($learnedWordsButtonText)}
                  text={translate("vocabulary:profile.learnedWordsTitle")}
                  numberOfLines={1}
                />
                <Text
                  style={themed($learnedWordsMeta)}
                  text={learnedWordsPageCountText}
                  numberOfLines={1}
                />
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={showroomColors.textMuted}
              />
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  )

  const renderPractice = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={themed([$scrollContent, $bottomInsets])}
    >
      <HeaderBlock
        eyebrow={translate("vocabulary:showroom.practiceTab.eyebrow")}
        title={translate("vocabulary:showroom.tabs.practice")}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={translate("vocabulary:showroom.practiceTab.continuePractice")}
        onPress={handlePrimaryPracticePress}
        style={({ pressed }) => [themed($practiceHero), pressed && themed($cardPressed)]}
      >
        <View style={themed($practiceHeroIcon)}>
          <MaterialCommunityIcons
            name={canStartPractice ? "target" : "plus"}
            size={34}
            color="#FFFFFF"
          />
        </View>
        <Text
          style={themed($practiceHeroTitle)}
          text={
            canStartPractice
              ? translate("vocabulary:showroom.practiceTab.continuePractice")
              : translate("vocabulary:showroom.practiceTab.addMoreWords")
          }
        />
        <Text
          style={themed($practiceHeroBody)}
          text={
            canStartPractice
              ? canStartRepeatSession
                ? translate("vocabulary:showroom.practiceTab.dueWordsFocused", {
                    count: repeatDueWordCount,
                  })
                : translate("vocabulary:showroom.practiceTab.savedWordsChooseQuiz", {
                    count: activeItemCount,
                  })
              : entries.length === 1
                ? translate("vocabulary:showroom.practiceTab.needOneMore")
                : translate("vocabulary:showroom.practiceTab.needTwo")
          }
        />
        <View style={themed($primaryPill)}>
          <Text
            style={themed($primaryPillText)}
            text={
              canStartPractice
                ? translate("vocabulary:showroom.practiceTab.start")
                : translate("vocabulary:showroom.state.addWord")
            }
          />
        </View>
      </Pressable>

      <SectionHeader title={translate("vocabulary:showroom.practiceTab.recentMistakes")} />
      <View style={themed($compactList)}>
        {isInsightsLoading ? (
          <SkeletonCard compact />
        ) : mistakes.length === 0 ? (
          <StateCard
            title={translate("vocabulary:showroom.practiceTab.noWeakTitle")}
            body={translate("vocabulary:showroom.practiceTab.noWeakBody")}
            action={
              canStartPractice
                ? translate("vocabulary:showroom.weeklyBars.startPractice")
                : translate("vocabulary:showroom.state.addWord")
            }
            onPress={handlePrimaryPracticePress}
          />
        ) : (
          mistakes.map((item) => (
            <Pressable
              key={item.itemId}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:showroom.practiceTab.openMistake", {
                word: item.prompt,
              })}
              onPress={() => onRequestDetails(item.itemId)}
              style={({ pressed }) => [themed($mistakeRow), pressed && themed($pressedSoft)]}
            >
              <View style={themed($mistakeIcon)}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={18}
                  color={showroomColors.textStrong}
                />
              </View>
              <View style={themed($rowCopy)}>
                <Text style={themed($rowTitle)} text={item.prompt} numberOfLines={1} />
                <Text
                  style={themed($rowMeta)}
                  text={translate("vocabulary:showroom.practiceTab.mistakeMeta", {
                    wrongAnswers: item.wrongAnswers,
                    accuracy: formatAccuracy(item.accuracyPercent),
                  })}
                />
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={showroomColors.textMuted}
              />
            </Pressable>
          ))
        )}
      </View>

      {canStartPractice ? (
        <>
          <SectionHeader title={translate("vocabulary:showroom.practiceTab.quizModes")} />
          <View style={themed($modeGrid)}>
            {[
              [translate("vocabulary:practiceHub.tiles.meaningMatch"), "cards-outline"],
              [translate("vocabulary:practiceHub.tiles.fillInGap"), "form-textbox"],
              [translate("vocabulary:practiceHub.tiles.guessWord"), "lightbulb-outline"],
              [translate("vocabulary:practiceHub.tiles.matchSynonyms"), "vector-link"],
            ].map(([label, icon]) => (
              <Pressable
                key={label}
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={onRequestPractice}
                style={({ pressed }) => [themed($modeCard), pressed && themed($cardPressed)]}
              >
                <MaterialCommunityIcons
                  name={icon as never}
                  size={22}
                  color={showroomColors.textStrong}
                />
                <Text style={themed($modeTitle)} text={label} />
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
    </ScrollView>
  )

  const renderVocabulary = () => (
    <View style={themed($tabFill)}>
      <ScrollView
        ref={vocabularyScrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleVocabularyScroll}
        scrollEventThrottle={16}
        onContentSizeChange={() => {
          if (!shouldRestoreVocabularyScrollRef.current) return
          shouldRestoreVocabularyScrollRef.current = false
          restoreVocabularyScroll()
        }}
        contentContainerStyle={themed([$scrollContent, $bottomInsets])}
      >
        <HeaderBlock
          eyebrow={vocabularyHeaderEyebrow}
          title={translate("vocabulary:showroom.tabs.vocabulary")}
          actionIcon="magnify"
          onActionPress={onRequestSearch}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={themed($filterRow)}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:showroom.vocabularyTab.openCollection", {
              collection: activeCollectionLabel,
            })}
            onPress={onRequestGroups}
            style={({ pressed }) => [
              themed($filterChip),
              activeGroupId && themed($filterChipSelected),
              pressed && themed($pressedSoft),
            ]}
          >
            <Text
              style={activeGroupId ? themed($filterChipTextSelected) : themed($filterChipText)}
              text={translate("vocabulary:showroom.vocabularyTab.collectionLabel", {
                collection: activeCollectionLabel,
              })}
              numberOfLines={1}
            />
          </Pressable>
          {VOCABULARY_FILTERS.map((filter) => {
            const selected = vocabularyFilter === filter
            const filterLabel = getVocabularyFilterLabel(filter)
            return (
              <Pressable
                key={filter}
                accessibilityRole="button"
                accessibilityLabel={translate("vocabulary:showroom.vocabularyTab.showFilter", {
                  filter: filterLabel,
                })}
                onPress={() => setVocabularyFilter(filter)}
                style={({ pressed }) => [
                  themed($filterChip),
                  selected && themed($filterChipSelected),
                  pressed && !selected && themed($pressedSoft),
                ]}
              >
                <Text
                  style={selected ? themed($filterChipTextSelected) : themed($filterChipText)}
                  text={filterLabel}
                />
              </Pressable>
            )
          })}
        </ScrollView>

        {isLoading || errorMessage || requiresLogin ? (
          renderState()
        ) : entries.length === 0 && activeGroupId ? (
          <StateCard
            title={translate("vocabulary:showroom.vocabularyTab.emptyCollectionTitle", {
              collection: activeCollectionLabel,
            })}
            body={translate("vocabulary:showroom.vocabularyTab.emptyCollectionBody")}
            action={translate("vocabulary:showroom.emptyCta")}
            onPress={onRequestHowToUse}
          />
        ) : entries.length === 0 ? (
          renderState()
        ) : vocabularyFilter === "hard" && isInsightsLoading ? (
          <SkeletonCard compact />
        ) : shouldOfferFilteredLoadMore ? (
          isLoadingMore ? (
            <SkeletonCard compact />
          ) : (
            <StateCard
              title={translate("vocabulary:showroom.vocabularyTab.filterLoadMoreTitle")}
              body={translate("vocabulary:showroom.vocabularyTab.filterLoadMoreBody")}
              action={translate("vocabulary:showroom.vocabularyTab.loadMore")}
              onPress={onLoadMore}
            />
          )
        ) : filteredEntries.length === 0 ? (
          <StateCard
            title={
              vocabularyFilter === "favorites"
                ? translate("vocabulary:showroom.vocabularyTab.favoritesEmptyTitle")
                : vocabularyFilter === "hard"
                  ? translate("vocabulary:showroom.vocabularyTab.hardEmptyTitle")
                  : translate("vocabulary:showroom.vocabularyTab.wordsEmptyTitle")
            }
            body={
              vocabularyFilter === "favorites"
                ? translate("vocabulary:showroom.vocabularyTab.favoritesEmptyBody")
                : vocabularyFilter === "hard"
                  ? translate("vocabulary:showroom.vocabularyTab.hardEmptyBody")
                  : translate("vocabulary:showroom.vocabularyTab.wordsEmptyBody")
            }
            action={
              vocabularyFilter === "favorites"
                ? translate("vocabulary:showroom.state.addWord")
                : vocabularyFilter === "hard" && canStartPractice
                  ? translate("vocabulary:showroom.weeklyBars.startPractice")
                  : translate("vocabulary:showroom.state.addWord")
            }
            onPress={
              vocabularyFilter === "favorites"
                ? handleShowAllVocabulary
                : vocabularyFilter === "hard" && canStartPractice
                  ? handlePrimaryPracticePress
                  : onRequestSearch
            }
          />
        ) : (
          <View style={themed($vocabularyList)}>
            {filteredEntries.map((entry) => (
              <VocabularyFeedCard
                key={entry.id}
                entry={entry}
                collectionLabel={activeCollectionLabel}
                difficulty={getDifficultyLabel(resolveDifficulty(entry))}
                isHardFiltered={vocabularyFilter === "hard"}
                isFavorite={isWordFavorited(entry.id)}
                isSavedForReview={isWordInRepeatList(entry.id)}
                disabled={isFavoriteMutating || isRepeatMutating}
                onPress={() => handleOpenVocabularyDetails(entry.id)}
                onToggleFavorite={() => handleToggleFavorite(entry)}
                onToggleSave={() => handleToggleRepeat(entry)}
                onPlayPronunciation={() => handlePlayVocabularyPronunciation(entry)}
                onMore={() => handleMoreForEntry(entry)}
              />
            ))}
            {shouldShowLoadMore ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  isLoadingMore
                    ? translate("vocabulary:showroom.vocabularyTab.loadingMoreA11y")
                    : translate("vocabulary:showroom.vocabularyTab.loadMoreA11y")
                }
                disabled={isLoadingMore}
                onPress={onLoadMore}
                style={({ pressed }) => [
                  themed($loadMoreButton),
                  pressed && !isLoadingMore && themed($pressedSoft),
                ]}
              >
                {isLoadingMore ? (
                  <ActivityIndicator size="small" color={showroomColors.textStrong} />
                ) : null}
                <Text
                  style={themed($loadMoreText)}
                  text={
                    isLoadingMore
                      ? translate("vocabulary:showroom.vocabularyTab.loading")
                      : translate("vocabulary:showroom.vocabularyTab.loadMore")
                  }
                />
              </Pressable>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  )

  const renderInsights = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={themed([$scrollContent, $bottomInsets])}
    >
      <HeaderBlock
        eyebrow={translate("vocabulary:showroom.insightsTab.eyebrow")}
        title={translate("vocabulary:showroom.tabs.insights")}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={translate("vocabulary:showroom.insightsTab.openMasteryCenter")}
        onPress={onRequestMasteryCenter}
        style={({ pressed }) => [themed($masteryCenterCard), pressed && themed($cardPressed)]}
      >
        <View style={themed($masteryCenterIcon)}>
          <MaterialCommunityIcons name="school" size={25} color={showroomColors.accentText} />
        </View>
        <View style={themed($masteryCenterCopy)}>
          <Text
            style={themed($masteryCenterEyebrow)}
            text={translate("vocabulary:weeklyAnalytics.title")}
            numberOfLines={1}
          />
          <Text
            style={themed($masteryCenterTitle)}
            text={translate("vocabulary:showroom.insightsTab.nextBest")}
            numberOfLines={1}
            adjustsFontSizeToFit
          />
          <Text
            style={themed($masteryCenterMeta)}
            text={translate("vocabulary:showroom.insightsTab.masteryMeta", {
              ready: repeatDueWordCount,
              saved: savedWordCount,
            })}
            numberOfLines={1}
          />
        </View>
        <View style={themed($masteryCenterChevron)}>
          <MaterialCommunityIcons name="chevron-right" size={22} color={showroomColors.textMuted} />
        </View>
      </Pressable>

      {isInsightsLoading ? (
        <View style={themed($stateStack)}>
          <SkeletonCard />
          <SkeletonCard compact />
          <SkeletonCard compact />
        </View>
      ) : insightsError ? (
        <StateCard
          title={translate("vocabulary:showroom.insightsTab.loadFailedTitle")}
          body={insightsError}
          action={translate("vocabulary:showroom.state.tryAgain")}
          onPress={() => void loadInsights()}
        />
      ) : (
        <>
          <View style={themed($twoColumnGrid)}>
            <MetricCard
              value={formatAccuracy(analytics?.summary.accuracyPercent)}
              label={translate("vocabulary:weeklyAnalytics.accuracy")}
              icon="check-decagram-outline"
            />
            <MetricCard
              value={formatCount(savedWordCount)}
              label={translate("vocabulary:showroom.insightsTab.wordsSaved")}
              icon="cards-outline"
            />
            <MetricCard
              value={formatCount(weeklyAnsweredQuestionCount)}
              label={translate("vocabulary:showroom.insightsTab.studiedThisWeek")}
              icon="checkbox-marked-circle-outline"
            />
            <MetricCard
              value={formatCount(weakItemCount)}
              label={translate("vocabulary:weeklyAnalytics.weakWords")}
              icon="alert-outline"
            />
          </View>

          <SectionHeader title={translate("vocabulary:showroom.insightsTab.weeklyActivity")} />
          <WeeklyBars analytics={analytics} isLoading={false} onEmptyAction={onRequestPractice} />

          <View style={themed($sectionCard)}>
            <View style={themed($sectionHeaderRow)}>
              <View>
                <Text
                  style={themed($sectionTitle)}
                  text={translate("vocabulary:showroom.insightsTab.vocabularyHealth")}
                />
                <Text
                  style={themed($sectionSubtle)}
                  text={translate("vocabulary:showroom.insightsTab.healthMeta", {
                    stable: stableWordCount,
                    weak: weakItemCount,
                  })}
                />
              </View>
              <Text style={themed($largeMetric)} text={`${vocabularyHealthPercent}%`} />
            </View>
            <View style={themed($progressTrack)}>
              <View
                style={[
                  themed($progressFill),
                  { width: `${Math.min(100, vocabularyHealthPercent)}%` },
                ]}
              />
            </View>
          </View>
        </>
      )}
    </ScrollView>
  )

  const renderProfile = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={themed([$scrollContent, $bottomInsets])}
    >
      <HeaderBlock
        eyebrow={translate("vocabulary:showroom.profileTab.account")}
        title={translate("vocabulary:profile.title")}
        actionIcon="cog-outline"
        onActionPress={onRequestSettings}
      />

      <View style={themed($profileHero)}>
        <View style={themed($profileCopy)}>
          <Text style={themed($profileName)} text={profileName} numberOfLines={1} />
          <Text
            style={themed($profileEmail)}
            text={authEmail || translate("vocabulary:showroom.profileTab.signedIn")}
            numberOfLines={1}
          />
        </View>
      </View>

      <View style={themed($twoColumnGrid)}>
        <MetricCard
          value={formatCount(streakDays)}
          label={translate("vocabulary:showroom.profileTab.currentStreak")}
          icon="fire"
        />
        <MetricCard
          value={savedWordMetricValue}
          label={translate("vocabulary:showroom.profileTab.savedWords")}
          icon="cards-outline"
        />
        <MetricCard
          value={formatCount(favoriteCount)}
          label={translate("vocabulary:showroom.filters.favorites")}
          icon="heart-outline"
        />
        <MetricCard
          value={formatCount(groups.length)}
          label={translate("vocabulary:showroom.profileTab.collections")}
          icon="folder-outline"
          accessibilityLabel={translate("vocabulary:showroom.profileTab.openCollections")}
          onPress={onRequestGroups}
        />
      </View>

      <SectionHeader
        title={translate("vocabulary:achievements.title")}
        action={translate("vocabulary:showroom.profileTab.viewAll")}
        onPress={() => onRequestAchievements(achievementSnapshot)}
      />
      <View style={themed($achievementGrid)}>
        {achievementPreview.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            title={achievement.title}
            unlocked={achievement.unlocked}
            icon={achievement.icon}
            onPress={() => onRequestAchievements(achievementSnapshot)}
          />
        ))}
      </View>

      <SectionHeader title={translate("vocabulary:settings.title")} />
      <View style={themed($compactList)}>
        <SettingsRow
          title={translate("vocabulary:profile.accountDetailsTitle")}
          icon="account-outline"
          onPress={onRequestAccountDetails}
        />
        <SettingsRow
          title={translate("vocabulary:iap.title")}
          icon="credit-card-outline"
          onPress={onRequestBilling}
        />
        <SettingsRow
          title={translate("vocabulary:showroom.profileTab.appSettings")}
          icon="cog-outline"
          onPress={onRequestSettings}
        />
        <SettingsRow
          title={translate("vocabulary:showroom.profileTab.advancedProfile")}
          icon="view-dashboard-outline"
          onPress={onRequestProfile}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={translate("vocabulary:profile.logOut")}
        onPress={logout}
        style={({ pressed }) => [themed($logoutButton), pressed && themed($cardPressed)]}
      >
        <Text style={themed($logoutText)} text={translate("vocabulary:profile.logOut")} />
      </Pressable>
    </ScrollView>
  )

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      backgroundColor={showroomColors.background}
      systemBarStyle={theme.isDark ? "light" : "dark"}
      contentContainerStyle={themed($screenContent)}
      enableTabletContentConstraint={false}
    >
      <View style={themed($layout)}>
        <View style={themed($contentArea)}>
          {activeTab === "home"
            ? renderHome()
            : activeTab === "practice"
              ? renderPractice()
              : activeTab === "vocabulary"
                ? renderVocabulary()
                : activeTab === "insights"
                  ? renderInsights()
                  : renderProfile()}
        </View>

        {toastMessage ? (
          <View pointerEvents="none" style={themed($toastWrap)}>
            <View style={themed($toastCard)}>
              <Text style={themed($toastText)} text={toastMessage} />
            </View>
          </View>
        ) : null}

        <Modal
          visible={Boolean(collectionPickerEntry)}
          transparent
          animationType="fade"
          onRequestClose={() => {
            if (!isCollectionAssigning) setCollectionPickerEntry(undefined)
          }}
        >
          <Pressable
            style={themed($collectionModalBackdrop)}
            onPress={() => {
              if (!isCollectionAssigning) setCollectionPickerEntry(undefined)
            }}
          >
            <Pressable
              accessibilityRole="menu"
              style={themed($collectionModalCard)}
              onPress={(event) => event.stopPropagation()}
            >
              <View style={themed($collectionModalHeader)}>
                <View style={themed($rowCopy)}>
                  <Text
                    style={themed($collectionModalTitle)}
                    text={translate("vocabulary:showroom.collectionModal.title")}
                  />
                  <Text
                    style={themed($collectionModalSubtitle)}
                    text={
                      collectionPickerEntry?.word ??
                      translate("vocabulary:showroom.alerts.savedVocabulary")
                    }
                    numberOfLines={1}
                  />
                </View>
                {isCollectionAssigning ? <ActivityIndicator color={showroomColors.accent} /> : null}
              </View>

              {assignableGroups.length === 0 ? (
                <StateCard
                  title={translate("vocabulary:showroom.collectionModal.noCollectionsTitle")}
                  body={translate("vocabulary:showroom.collectionModal.noCollectionsBody")}
                  action={translate("vocabulary:showroom.collectionModal.manageCollections")}
                  onPress={() => {
                    setCollectionPickerEntry(undefined)
                    onRequestGroups()
                  }}
                />
              ) : (
                <ScrollView
                  style={themed($collectionModalList)}
                  showsVerticalScrollIndicator={false}
                >
                  {assignableGroups.map((group) => (
                    <Pressable
                      key={group.id}
                      accessibilityRole="menuitem"
                      accessibilityLabel={translate("vocabulary:showroom.collectionModal.addTo", {
                        collection: group.name,
                      })}
                      disabled={isCollectionAssigning}
                      onPress={() => handleMoveEntryToGroup(group.id)}
                      style={({ pressed }) => [
                        themed($collectionOption),
                        pressed && !isCollectionAssigning && themed($pressedSoft),
                      ]}
                    >
                      <View style={themed($settingsIcon)}>
                        <MaterialCommunityIcons
                          name="folder-outline"
                          size={19}
                          color={showroomColors.textStrong}
                        />
                      </View>
                      <View style={themed($rowCopy)}>
                        <Text style={themed($rowTitle)} text={group.name} numberOfLines={1} />
                        <Text
                          style={themed($rowMeta)}
                          text={translate("vocabulary:showroom.groupWordCount", {
                            count: group.itemCount,
                          })}
                        />
                      </View>
                      <MaterialCommunityIcons
                        name="plus"
                        size={20}
                        color={showroomColors.textMuted}
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={translate("vocabulary:showroom.collectionModal.cancelMove")}
                disabled={isCollectionAssigning}
                onPress={() => setCollectionPickerEntry(undefined)}
                style={({ pressed }) => [
                  themed($modalCancelButton),
                  pressed && themed($pressedSoft),
                ]}
              >
                <Text
                  style={themed($modalCancelText)}
                  text={translate("vocabulary:showroom.collectionModal.cancel")}
                />
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        <View style={themed([$tabBarWrap, $bottomInsets])}>
          <View style={themed($tabBar)}>
            {TABS.map((tab) => (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === tab.key }}
                accessibilityLabel={getTabLabel(tab.key)}
                onPress={() => setActiveTab(tab.key)}
                style={({ pressed }) => [
                  themed($tabButton),
                  activeTab === tab.key && themed($tabButtonActive),
                  pressed && themed($pressedSoft),
                ]}
              >
                <MaterialCommunityIcons
                  name={tab.icon as never}
                  size={23}
                  color={activeTab === tab.key ? showroomColors.accent : showroomColors.textMuted}
                />
                <Text
                  style={activeTab === tab.key ? themed($tabTextActive) : themed($tabText)}
                  text={getTabLabel(tab.key)}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  )
}

const HeaderBlock: FC<{
  eyebrow: string
  title: string
  actionIcon?: string
  badgeCount?: number
  onActionPress?: () => void
}> = ({ eyebrow, title, actionIcon, badgeCount = 0, onActionPress }) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom

  return (
    <View style={themed($headerBlock)}>
      <View style={themed($headerCopy)}>
        <Text style={themed($headerEyebrow)} text={eyebrow} numberOfLines={1} />
        <Text style={themed($largeTitle)} text={title} numberOfLines={1} />
      </View>
      {actionIcon && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          onPress={onActionPress}
          style={({ pressed }) => [themed($headerAction), pressed && themed($pressedSoft)]}
        >
          <MaterialCommunityIcons
            name={actionIcon as never}
            size={23}
            color={showroomColors.textStrong}
          />
          {badgeCount > 0 ? (
            <View style={themed($badge)}>
              <Text style={themed($badgeText)} text={badgeCount > 99 ? "99+" : `${badgeCount}`} />
            </View>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  )
}

const SectionHeader: FC<{ title: string; action?: string; onPress?: () => void }> = ({
  title,
  action,
  onPress,
}) => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($sectionHeading)}>
      <Text style={themed($sectionTitle)} text={title} />
      {action && onPress ? (
        <Pressable accessibilityRole="button" accessibilityLabel={action} onPress={onPress}>
          <Text style={themed($sectionAction)} text={action} />
        </Pressable>
      ) : null}
    </View>
  )
}

const StateCard: FC<{ title: string; body: string; action: string; onPress: () => void }> = ({
  title,
  body,
  action,
  onPress,
}) => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($stateCard)}>
      <Text style={themed($stateTitle)} text={title} />
      <Text style={themed($mutedBody)} text={body} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={action}
        onPress={onPress}
        style={({ pressed }) => [themed($stateButton), pressed && themed($stateButtonPressed)]}
      >
        <Text style={themed($stateButtonText)} text={action} />
      </Pressable>
    </View>
  )
}

const SkeletonCard: FC<{ compact?: boolean }> = ({ compact }) => {
  const { themed } = useAppTheme()
  return (
    <View style={[themed($skeletonCard), compact && themed($skeletonCardCompact)]}>
      <View style={themed($skeletonLineLarge)} />
      <View style={themed($skeletonLine)} />
      <View style={themed($skeletonLineShort)} />
    </View>
  )
}

const MetricCard: FC<{
  value: string
  label: string
  icon: string
  accessibilityLabel?: string
  onPress?: () => void
}> = ({ value, label, icon, accessibilityLabel, onPress }) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom

  const content = (
    <>
      <View style={themed($metricIcon)}>
        <MaterialCommunityIcons name={icon as never} size={18} color={showroomColors.textStrong} />
      </View>
      {onPress ? (
        <View style={themed($metricChevron)}>
          <MaterialCommunityIcons name="chevron-right" size={18} color={showroomColors.textMuted} />
        </View>
      ) : null}
      <Text style={themed($metricValue)} text={value} numberOfLines={1} adjustsFontSizeToFit />
      <Text style={themed($metricLabel)} text={label} numberOfLines={1} adjustsFontSizeToFit />
    </>
  )

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        onPress={onPress}
        style={({ pressed }) => [themed($metricCard), pressed && themed($cardPressed)]}
      >
        {content}
      </Pressable>
    )
  }

  return <View style={themed($metricCard)}>{content}</View>
}

const CompactWordRow: FC<{
  entry: VocabularyEntry
  collectionLabel: string
  onPress: () => void
}> = ({ entry, collectionLabel, onPress }) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={translate("vocabulary:showroom.vocabularyTab.openWord", {
        word: entry.word,
      })}
      onPress={onPress}
      style={({ pressed }) => [themed($compactRow), pressed && themed($pressedSoft)]}
    >
      <View style={themed($wordInitial)}>
        <Text style={themed($wordInitialText)} text={entry.word.charAt(0).toLocaleUpperCase()} />
      </View>
      <View style={themed($rowCopy)}>
        <Text style={themed($rowTitle)} text={entry.word} numberOfLines={1} />
        <Text
          style={themed($rowMeta)}
          text={entry.definition || collectionLabel}
          numberOfLines={1}
        />
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={showroomColors.textMuted} />
    </Pressable>
  )
}

const VocabularyFeedCard: FC<{
  entry: VocabularyEntry
  collectionLabel: string
  difficulty: string
  isHardFiltered: boolean
  isFavorite: boolean
  isSavedForReview: boolean
  disabled: boolean
  onPress: () => void
  onToggleFavorite: () => void
  onToggleSave: () => void
  onPlayPronunciation: () => void
  onMore: () => void
}> = ({
  entry,
  collectionLabel,
  difficulty,
  isHardFiltered,
  isFavorite,
  isSavedForReview,
  disabled,
  onPress,
  onToggleFavorite,
  onToggleSave,
  onPlayPronunciation,
  onMore,
}) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={translate("vocabulary:showroom.vocabularyTab.openWord", {
        word: entry.word,
      })}
      onPress={onPress}
      style={({ pressed }) => [themed($feedCard), pressed && themed($cardPressed)]}
    >
      <View style={themed($feedHeader)}>
        <View style={themed($feedTitleWrap)}>
          <Text
            style={themed($feedWord)}
            text={entry.word}
            numberOfLines={1}
            adjustsFontSizeToFit
          />
          {entry.pronunciation ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:profile.accessibility.playPronunciation", {
                word: entry.word,
              })}
              onPress={(event) => {
                event.stopPropagation()
                onPlayPronunciation()
              }}
              style={({ pressed }) => [
                themed($feedPronunciationPill),
                pressed && themed($feedPronunciationPillPressed),
              ]}
            >
              <MaterialCommunityIcons
                name="volume-high"
                size={14}
                color={showroomColors.textMuted}
              />
              <Text
                style={themed($feedPronunciationText)}
                text={entry.pronunciation}
                numberOfLines={1}
              />
            </Pressable>
          ) : null}
        </View>
        <View style={themed($feedActions)}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isSavedForReview
                ? translate("vocabulary:showroom.vocabularyTab.removeRepeatReminder")
                : translate("vocabulary:showroom.vocabularyTab.addRepeatReminder")
            }
            disabled={disabled}
            onPress={(event) => {
              event.stopPropagation()
              onToggleSave()
            }}
            style={({ pressed }) => [
              themed($feedIconButton),
              isSavedForReview && themed($feedIconButtonActive),
              pressed && themed($pressedSoft),
            ]}
          >
            <MaterialCommunityIcons
              name={isSavedForReview ? "bell-ring" : "bell-ring-outline"}
              size={20}
              color={isSavedForReview ? showroomColors.accent : showroomColors.textMuted}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? translate("vocabulary:showroom.vocabularyTab.removeFavorite")
                : translate("vocabulary:common.favoriteLabel")
            }
            disabled={disabled}
            onPress={(event) => {
              event.stopPropagation()
              onToggleFavorite()
            }}
            style={({ pressed }) => [
              themed($feedIconButton),
              isFavorite && themed($feedIconButtonActive),
              pressed && themed($pressedSoft),
            ]}
          >
            <MaterialCommunityIcons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#D94B5F" : showroomColors.textMuted}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:showroom.vocabularyTab.moreOptions")}
            onPress={(event) => {
              event.stopPropagation()
              onMore()
            }}
            style={({ pressed }) => [themed($feedIconButton), pressed && themed($pressedSoft)]}
          >
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={21}
              color={showroomColors.textMuted}
            />
          </Pressable>
        </View>
      </View>
      <Text
        style={themed($feedMeaning)}
        text={entry.definition || translate("vocabulary:showroom.vocabularyTab.noMeaning")}
      />
      <Text
        style={themed($feedExample)}
        text={
          entry.contextSentence ||
          entry.example ||
          translate("vocabulary:showroom.vocabularyTab.exampleFallback")
        }
        numberOfLines={3}
      />
      <View style={themed($feedFooter)}>
        {isHardFiltered ? (
          <View style={themed($hardPill)}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={13}
              color={showroomColors.dangerText}
            />
            <Text
              style={themed($hardPillText)}
              text={translate("vocabulary:showroom.filters.hard")}
            />
          </View>
        ) : null}
        <View style={themed($quietPill)}>
          <Text style={themed($quietPillText)} text={difficulty} />
        </View>
        <View style={themed($quietPill)}>
          <Text style={themed($quietPillText)} text={collectionLabel} numberOfLines={1} />
        </View>
      </View>
    </Pressable>
  )
}

const WeeklyBars: FC<{
  analytics?: ExerciseWeeklyAnalytics
  isLoading: boolean
  onEmptyAction: () => void
}> = ({ analytics, isLoading, onEmptyAction }) => {
  const { themed } = useAppTheme()
  const days = analytics?.daily ?? []
  const maxAnswered = Math.max(...days.map((day) => day.answeredQuestions), 1)

  if (isLoading) return <SkeletonCard compact />

  if (days.length === 0) {
    return (
      <StateCard
        title={translate("vocabulary:showroom.weeklyBars.emptyTitle")}
        body={translate("vocabulary:showroom.weeklyBars.emptyBody")}
        action={translate("vocabulary:showroom.weeklyBars.startPractice")}
        onPress={onEmptyAction}
      />
    )
  }

  return (
    <View style={themed($chartCard)}>
      {days.map((day) => {
        const height = Math.max(8, Math.round((day.answeredQuestions / maxAnswered) * 86))
        return (
          <View key={day.date} style={themed($barColumn)}>
            <View style={themed($barTrack)}>
              <View style={[themed($barFill), { height }]} />
            </View>
            <Text style={themed($barLabel)} text={getDayLabel(day.date)} numberOfLines={1} />
          </View>
        )
      })}
    </View>
  )
}

const AchievementCard: FC<{
  title: string
  unlocked: boolean
  icon: string
  onPress?: () => void
}> = ({ title, unlocked, icon, onPress }) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom

  const content = (
    <>
      <MaterialCommunityIcons
        name={icon as never}
        size={22}
        color={unlocked ? showroomColors.accent : showroomColors.textMuted}
      />
      <Text style={themed($achievementTitle)} text={title} numberOfLines={1} adjustsFontSizeToFit />
      <Text
        style={themed($achievementMeta)}
        text={
          unlocked
            ? translate("vocabulary:achievements.status.unlocked")
            : translate("vocabulary:achievements.status.locked")
        }
      />
    </>
  )

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={translate("vocabulary:achievements.openAchievement", { title })}
        onPress={onPress}
        style={({ pressed }) => [
          themed($achievementCard),
          !unlocked && themed($achievementLocked),
          pressed && themed($cardPressed),
        ]}
      >
        {content}
      </Pressable>
    )
  }

  return (
    <View style={[themed($achievementCard), !unlocked && themed($achievementLocked)]}>
      {content}
    </View>
  )
}

const SettingsRow: FC<{ title: string; icon: string; onPress: () => void }> = ({
  title,
  icon,
  onPress,
}) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [themed($settingsRow), pressed && themed($pressedSoft)]}
    >
      <View style={themed($settingsIcon)}>
        <MaterialCommunityIcons name={icon as never} size={19} color={showroomColors.textStrong} />
      </View>
      <View style={themed($rowCopy)}>
        <Text style={themed($rowTitle)} text={title} numberOfLines={1} />
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={showroomColors.textMuted} />
    </Pressable>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $layout: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.vocabularyShowroom.background,
})

const $contentArea: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $tabFill: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.xxxl + 42,
  gap: spacing.md,
})

const $headerBlock: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.md,
  paddingTop: spacing.sm,
  marginBottom: spacing.xs,
})

const $headerCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
})

const $headerEyebrow: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  lineHeight: 18,
  color: colors.vocabularyShowroom.textMuted,
})

const $largeTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  marginTop: 3,
  fontFamily: typography.primary.bold,
  fontSize: 34,
  lineHeight: 40,
  color: colors.vocabularyShowroom.textStrong,
})

const $headerAction: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 46,
  width: 46,
  borderRadius: 23,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  ...premiumShadow(0.06),
})

const $badge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: -3,
  right: -2,
  minWidth: 18,
  height: 18,
  borderRadius: 9,
  paddingHorizontal: 4,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.error,
})

const $badgeText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 9,
  lineHeight: 11,
  color: "#FFFFFF",
})

const $heroCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 148,
  borderRadius: 24,
  padding: spacing.lg,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  ...premiumShadow(0.08),
})

const $heroIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 58,
  width: 58,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $heroCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
})

const $cardEyebrow: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  lineHeight: 17,
  color: colors.vocabularyShowroom.accent,
})

const $heroTitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.bold,
  fontSize: 22,
  lineHeight: 28,
  color: colors.vocabularyShowroom.textStrong,
})

const $heroMeta: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 19,
  color: colors.vocabularyShowroom.textMuted,
})

const $sectionCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 22,
  padding: spacing.md,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  ...premiumShadow(0.045),
})

const $sectionHeaderRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: spacing.md,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 17,
  lineHeight: 22,
  color: colors.vocabularyShowroom.textStrong,
})

const $sectionSubtle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxxs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 18,
  color: colors.vocabularyShowroom.textMuted,
})

const $largeMetric: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 26,
  lineHeight: 31,
  color: colors.vocabularyShowroom.textStrong,
})

const $progressTrack: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  height: 9,
  borderRadius: 5,
  overflow: "hidden",
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $progressFill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: "100%",
  borderRadius: 5,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $learnedWordsCtaWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
  alignItems: "center",
})

const $learnedWordsButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 64,
  width: "100%",
  borderRadius: 22,
  paddingHorizontal: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  ...premiumShadow(0.045),
})

const $learnedWordsIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 40,
  width: 40,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $learnedWordsCopy: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  minWidth: 0,
  gap: spacing.xxxs,
})

const $learnedWordsButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  lineHeight: 21,
  color: colors.vocabularyShowroom.textStrong,
})

const $learnedWordsMeta: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 18,
  color: colors.vocabularyShowroom.textMuted,
})

const $masteryCenterCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 112,
  borderRadius: 24,
  padding: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  ...premiumShadow(0.06),
})

const $masteryCenterIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 56,
  width: 56,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $masteryCenterCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
})

const $masteryCenterEyebrow: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  lineHeight: 17,
  color: colors.vocabularyShowroom.accent,
})

const $masteryCenterTitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxxs,
  fontFamily: typography.primary.bold,
  fontSize: 18,
  lineHeight: 23,
  color: colors.vocabularyShowroom.textStrong,
})

const $masteryCenterMeta: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 18,
  color: colors.vocabularyShowroom.textMuted,
})

const $masteryCenterChevron: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 34,
  width: 34,
  borderRadius: 17,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $sectionHeading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $sectionAction: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: colors.vocabularyShowroom.accent,
})

const $compactList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $compactRow: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 72,
  borderRadius: 18,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $wordInitial: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 42,
  width: 42,
  borderRadius: 15,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $wordInitialText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 17,
  color: colors.vocabularyShowroom.textStrong,
})

const $rowCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
})

const $rowTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textStrong,
})

const $rowMeta: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxxs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 18,
  color: colors.vocabularyShowroom.textMuted,
})

const $twoColumnGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
})

const $metricCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexGrow: 1,
  flexBasis: "47%",
  minHeight: 126,
  borderRadius: 22,
  padding: spacing.md,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  ...premiumShadow(0.04),
})

const $metricIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 34,
  width: 34,
  borderRadius: 13,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $metricChevron: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  position: "absolute",
  top: spacing.md,
  right: spacing.md,
  height: 28,
  width: 28,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $metricValue: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.bold,
  fontSize: 27,
  lineHeight: 32,
  color: colors.vocabularyShowroom.textStrong,
})

const $metricLabel: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxxs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 17,
  color: colors.vocabularyShowroom.textMuted,
})

const $practiceHero: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 260,
  borderRadius: 26,
  padding: spacing.xl,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  ...premiumShadow(0.08),
})

const $practiceHeroIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 76,
  width: 76,
  borderRadius: 26,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $practiceHeroTitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.lg,
  fontFamily: typography.primary.bold,
  fontSize: 28,
  lineHeight: 34,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $practiceHeroBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 15,
  lineHeight: 21,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $primaryPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  minHeight: 48,
  borderRadius: 24,
  paddingHorizontal: spacing.xl,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $primaryPillText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 16,
  color: "#FFFFFF",
})

const $mistakeRow: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 72,
  borderRadius: 18,
  padding: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $mistakeIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 38,
  width: 38,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $modeGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
})

const $modeCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexBasis: "47%",
  flexGrow: 1,
  minHeight: 96,
  borderRadius: 20,
  padding: spacing.md,
  justifyContent: "space-between",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $modeTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textStrong,
})

const $filterRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
  paddingRight: spacing.lg,
})

const $filterChip: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 38,
  borderRadius: 19,
  paddingHorizontal: spacing.md,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $filterChipSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accent,
  borderColor: colors.vocabularyShowroom.accent,
})

const $filterChipText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $filterChipTextSelected: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: colors.vocabularyShowroom.accentText,
})

const $vocabularyList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
})

const $feedCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 24,
  padding: spacing.lg,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  ...premiumShadow(0.055),
})

const $feedHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: spacing.md,
})

const $feedTitleWrap: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
})

const $feedWord: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 28,
  lineHeight: 34,
  color: colors.vocabularyShowroom.textStrong,
})

const $feedPronunciationPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.xs,
  alignSelf: "flex-start",
  minHeight: 30,
  maxWidth: "100%",
  borderRadius: 15,
  paddingHorizontal: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $feedPronunciationPillPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $feedPronunciationText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flexShrink: 1,
  fontFamily: typography.primary.medium,
  fontSize: 13,
  lineHeight: 17,
  color: colors.vocabularyShowroom.textMuted,
})

const $feedActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
})

const $feedIconButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 36,
  width: 36,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $feedIconButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $feedMeaning: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.md,
  fontFamily: typography.primary.semiBold,
  fontSize: 17,
  lineHeight: 23,
  color: colors.vocabularyShowroom.textStrong,
})

const $feedExample: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 21,
  color: colors.vocabularyShowroom.textMuted,
})

const $feedFooter: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  gap: spacing.xs,
})

const $quietPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 30,
  borderRadius: 15,
  paddingHorizontal: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $quietPillText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $hardPill: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  minHeight: 30,
  borderRadius: 15,
  paddingHorizontal: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xxxs,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.dangerBorder,
  backgroundColor: isDark ? "rgba(143, 78, 84, 0.20)" : "rgba(193, 79, 70, 0.10)",
})

const $hardPillText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 12,
  color: colors.vocabularyShowroom.dangerText,
})

const $loadMoreButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 48,
  borderRadius: 18,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  paddingHorizontal: spacing.lg,
})

const $loadMoreText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
  color: colors.vocabularyShowroom.textStrong,
})

const $chartCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 156,
  borderRadius: 22,
  padding: spacing.md,
  flexDirection: "row",
  alignItems: "flex-end",
  gap: spacing.xs,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  ...premiumShadow(0.04),
})

const $barColumn: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  alignItems: "center",
})

const $barTrack: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 94,
  width: "100%",
  maxWidth: 24,
  borderRadius: 12,
  justifyContent: "flex-end",
  overflow: "hidden",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $barFill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: "100%",
  borderRadius: 12,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $barLabel: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.medium,
  fontSize: 11,
  color: colors.vocabularyShowroom.textMuted,
})

const $profileHero: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 92,
  borderRadius: 24,
  padding: spacing.lg,
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  ...premiumShadow(0.05),
})

const $profileCopy: ThemedStyle<ViewStyle> = () => ({
  minWidth: 0,
})

const $profileName: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 23,
  lineHeight: 28,
  color: colors.vocabularyShowroom.textStrong,
})

const $profileEmail: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.vocabularyShowroom.textMuted,
})

const $achievementGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
})

const $achievementCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  minHeight: 104,
  borderRadius: 20,
  padding: spacing.md,
  justifyContent: "space-between",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $achievementLocked: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.58,
})

const $achievementTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  lineHeight: 17,
  color: colors.vocabularyShowroom.textStrong,
})

const $achievementMeta: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 11,
  color: colors.vocabularyShowroom.textMuted,
})

const $settingsRow: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 64,
  borderRadius: 18,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $settingsIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 38,
  width: 38,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $logoutButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 54,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.dangerFill,
  paddingHorizontal: spacing.lg,
})

const $logoutText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 16,
  color: "#FFFFFF",
})

const $stateStack: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
})

const $stateCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 24,
  padding: spacing.xl,
  alignItems: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $stateTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 19,
  lineHeight: 24,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $mutedBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 21,
  color: colors.vocabularyShowroom.textMuted,
})

const $stateButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  minHeight: 48,
  borderRadius: 18,
  paddingHorizontal: spacing.xl,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $stateButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $stateButtonText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 15,
  color: "#FFFFFF",
})

const $skeletonCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 146,
  borderRadius: 24,
  padding: spacing.lg,
  justifyContent: "center",
  gap: spacing.sm,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $skeletonCardCompact: ThemedStyle<ViewStyle> = () => ({
  minHeight: 82,
})

const $skeletonLineLarge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 22,
  width: "58%",
  borderRadius: 11,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $skeletonLine: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 14,
  width: "82%",
  borderRadius: 7,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $skeletonLineShort: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 14,
  width: "42%",
  borderRadius: 7,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $updateBanner: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 20,
  padding: spacing.xs,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $updateCopy: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $updateTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
  color: colors.vocabularyShowroom.textStrong,
})

const $smallIconButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 38,
  width: 38,
  borderRadius: 19,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $pressedSoft: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $cardPressed: ThemedStyle<ViewStyle> = () => ({
  transform: [{ scale: 0.985 }],
  opacity: 0.92,
})

const $collectionModalBackdrop: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  justifyContent: "flex-end",
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
  backgroundColor: colors.palette.overlay50,
})

const $collectionModalCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  maxHeight: "74%",
  borderRadius: 24,
  padding: spacing.md,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  ...premiumShadow(0.08),
})

const $collectionModalHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
  paddingBottom: spacing.sm,
})

const $collectionModalTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 20,
  lineHeight: 25,
  color: colors.vocabularyShowroom.textStrong,
})

const $collectionModalSubtitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxxs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $collectionModalList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  maxHeight: 320,
  marginTop: spacing.xs,
})

const $collectionOption: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 66,
  borderRadius: 18,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $modalCancelButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
  minHeight: 48,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $modalCancelText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
  color: colors.vocabularyShowroom.textStrong,
})

const $toastWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  left: spacing.lg,
  right: spacing.lg,
  bottom: 104,
  alignItems: "center",
})

const $toastCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  maxWidth: "100%",
  borderRadius: 18,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  backgroundColor: colors.vocabularyShowroom.textStrong,
})

const $toastText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.surface,
  textAlign: "center",
})

const $tabBarWrap: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.sm,
  paddingBottom: spacing.sm,
  backgroundColor: colors.vocabularyShowroom.background,
})

const $tabBar: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 68,
  borderRadius: 24,
  padding: spacing.xxs,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  ...premiumShadow(0.08),
})

const $tabButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  minWidth: 0,
  minHeight: 58,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xxxs,
})

const $tabButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $tabText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 10,
  lineHeight: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $tabTextActive: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 10,
  lineHeight: 12,
  color: colors.vocabularyShowroom.accent,
})

function premiumShadow(opacity: number): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#111313",
      shadowOpacity: opacity,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
    android: {
      elevation: opacity > 0.06 ? 4 : 2,
    },
    default: {},
  }) as ViewStyle
}
