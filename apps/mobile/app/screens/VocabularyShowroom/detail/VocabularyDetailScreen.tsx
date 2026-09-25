import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import { Icon, IconTypes } from "@/components/Icon"
import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { resolveLanguageOption } from "@/context/LanguagePreferencesContext"
import { translate } from "@/i18n/translate"
import { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import {
  type LookupMode,
  type WordInsightLearningItemGroup,
  type WordInsightWaitTransport,
  wordInsightApi,
} from "@/services/api/wordInsightApi"
import { speakWord } from "@/services/pronunciation/pronunciationService"
import {
  formatRepeatDueLabel,
  getRepeatProgressForEntry,
  removeRepeatWord,
  type RepeatProgressItem,
} from "@/services/repeat/repeatService"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { DEFAULT_MAX_FONT_SIZE_MULTIPLIER } from "@/utils/textScaling"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

import {
  applyWordInsightToEntryDetail,
  mapLearningItemDetailToEntryDetail,
  mapLearningItemToEntry,
  type VocabularyEntryDetail,
} from "../types"

type VocabularyDetailScreenProps = AppStackScreenProps<"VocabularyDetail">

const DETAIL_GROUP_PREVIEW_LIMIT = 8
const DETAIL_GROUP_SEARCH_RESULT_LIMIT = 16
const vocabularyDetailTutorialVideoSources = [
  { screen: "vocabulary_detail", placement: "word_detail" },
  { screen: "vocabulary_detail", placement: "advanced_analysis" },
]

type IconButtonProps = {
  icon: IconTypes
  accessibilityLabel: string
  onPress: () => void
  size?: number
}

function resolveLoadErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") {
    return translate("vocabulary:errors.sessionExpired")
  }
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:errors.cannotConnect")
  }
  return translate("vocabulary:errors.detailLoadFailed")
}

function resolveUpdateErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "not-found") return translate("vocabulary:errors.itemNotFound")
  if (problem.kind === "unauthorized") return translate("vocabulary:errors.reloginRequired")
  return translate("vocabulary:errors.stateUpdateFailed")
}

function resolveDeleteErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "not-found") return translate("vocabulary:errors.itemNotFound")
  if (problem.kind === "unauthorized") return translate("vocabulary:errors.reloginRequired")
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:errors.cannotConnect")
  }
  return translate("vocabulary:errors.stateUpdateFailed")
}

function resolveGroupErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "not-found") return translate("vocabulary:errors.groupNotFound")
  if (problem.kind === "unauthorized") return translate("vocabulary:errors.reloginRequired")
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:errors.cannotConnect")
  }
  return translate("vocabulary:errors.groupActionFailed")
}

function resolveExplainErrorMessage(problem: GeneralApiProblem, mode: LookupMode): string {
  if (problem.kind === "unauthorized") return translate("vocabulary:errors.reloginRequired")
  if (problem.kind === "forbidden") {
    return mode === "advanced"
      ? translate("vocabulary:errors.advancedCreditInsufficient")
      : translate("vocabulary:errors.basicCreditInsufficient")
  }
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:errors.cannotConnect")
  }
  return translate("vocabulary:errors.analysisRequestFailed")
}

function parseInsufficientCreditMode(input: {
  errorCode?: string
  errorMessage?: string
  fallbackMode: LookupMode
}): LookupMode | undefined {
  const normalizedCode = input.errorCode?.trim().toLocaleLowerCase("en-US")
  const normalizedMessage = input.errorMessage?.trim().toLocaleLowerCase("en-US")
  const hasInsufficientCreditsText =
    typeof normalizedMessage === "string" &&
    normalizedMessage.includes("insufficient") &&
    normalizedMessage.includes("credit")

  if (!hasInsufficientCreditsText && normalizedCode !== "forbidden") {
    return undefined
  }

  if (normalizedMessage?.includes("advanced")) return "advanced"
  if (normalizedMessage?.includes("basic")) return "basic"
  return input.fallbackMode
}

function resolveFailedJobMessage(input: {
  mode: LookupMode
  errorCode?: string
  errorMessage?: string
}): string {
  const normalizedCode = input.errorCode?.trim().toLocaleLowerCase("en-US") ?? ""
  const normalizedMessage = input.errorMessage?.trim().toLocaleLowerCase("en-US") ?? ""
  const combined = `${normalizedCode} ${normalizedMessage}`.trim()

  if (combined.includes("invalid_model_json_output")) {
    return translate("vocabulary:errors.invalidModelOutput")
  }

  if (combined.includes("insufficient") && combined.includes("credit")) {
    return input.mode === "advanced"
      ? translate("vocabulary:errors.advancedCreditInsufficient")
      : translate("vocabulary:errors.basicCreditInsufficient")
  }

  if (combined.includes("timeout")) {
    return translate("vocabulary:errors.analysisTimeout")
  }

  const rawMessage = input.errorMessage?.trim()
  if (rawMessage) {
    const machineLike = /^[a-z0-9_.:-]+$/i.test(rawMessage)
    if (!machineLike) return rawMessage
  }

  return input.mode === "advanced"
    ? translate("vocabulary:errors.advancedAnalysisFailed")
    : translate("vocabulary:errors.basicAnalysisFailed")
}

function sentenceIncludesSelectedWord(sentence: string, selectedWord: string): boolean {
  return sentence.toLocaleLowerCase("en-US").includes(selectedWord.toLocaleLowerCase("en-US"))
}

const IconButton: FC<IconButtonProps> = ({ icon, accessibilityLabel, onPress, size = 18 }) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
      hitSlop={6}
    >
      <Icon icon={icon} size={size} color={showroomColors.textStrong} />
    </Pressable>
  )
}

export const VocabularyDetailScreen: FC<VocabularyDetailScreenProps> = ({ navigation, route }) => {
  const { userId } = useAuth()
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const entryId = route.params.entryId

  const [detail, setDetail] = useState<VocabularyEntryDetail | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isRequestingInsight, setIsRequestingInsight] = useState(false)
  const [isDeletingItem, setIsDeletingItem] = useState(false)
  const [groups, setGroups] = useState<WordInsightLearningItemGroup[]>([])
  const [itemGroupIds, setItemGroupIds] = useState<string[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(true)
  const [groupMutatingId, setGroupMutatingId] = useState<string | undefined>(undefined)
  const [groupSearchQuery, setGroupSearchQuery] = useState("")
  const [repeatProgress, setRepeatProgress] = useState<RepeatProgressItem | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [pronunciationErrorMessage, setPronunciationErrorMessage] = useState<string | undefined>(
    undefined,
  )
  const [lastExplainTransport, setLastExplainTransport] = useState<
    WordInsightWaitTransport | undefined
  >(undefined)
  const [lastExplainTransportDetail, setLastExplainTransportDetail] = useState<string | undefined>(
    undefined,
  )
  const [insufficientCreditMode, setInsufficientCreditMode] = useState<LookupMode | undefined>(
    undefined,
  )
  const isRequestingInsightRef = useRef(false)
  const pronunciationErrorTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const advancedLoadingPulse = useRef(new Animated.Value(0)).current
  const advancedLoadingSweep = useRef(new Animated.Value(0)).current
  const advancedLoadingSpark = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!isRequestingInsight) {
      advancedLoadingPulse.stopAnimation()
      advancedLoadingSweep.stopAnimation()
      advancedLoadingSpark.stopAnimation()
      advancedLoadingPulse.setValue(0)
      advancedLoadingSweep.setValue(0)
      advancedLoadingSpark.setValue(0)
      return
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(advancedLoadingPulse, {
          toValue: 1,
          duration: 880,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(advancedLoadingPulse, {
          toValue: 0,
          duration: 880,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    )

    const sweepLoop = Animated.loop(
      Animated.timing(advancedLoadingSweep, {
        toValue: 1,
        duration: 1700,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )

    const sparkLoop = Animated.loop(
      Animated.timing(advancedLoadingSpark, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )

    pulseLoop.start()
    sweepLoop.start()
    sparkLoop.start()

    return () => {
      pulseLoop.stop()
      sweepLoop.stop()
      sparkLoop.stop()
      advancedLoadingPulse.setValue(0)
      advancedLoadingSweep.setValue(0)
      advancedLoadingSpark.setValue(0)
    }
  }, [advancedLoadingPulse, advancedLoadingSpark, advancedLoadingSweep, isRequestingInsight])

  useEffect(() => {
    return () => {
      if (pronunciationErrorTimeoutRef.current) {
        clearTimeout(pronunciationErrorTimeoutRef.current)
      }
    }
  }, [])

  const refreshRepeatProgress = useCallback(() => {
    const nextProgress = getRepeatProgressForEntry(userId, entryId)
    setRepeatProgress(nextProgress)
  }, [entryId, userId])

  const loadDetail = useCallback(
    async (options: { silent?: boolean } = {}) => {
      const isSilent = options.silent === true

      if (!isSilent) {
        setIsLoading(true)
        setErrorMessage(undefined)
        setInsufficientCreditMode(undefined)
      }

      const response = await wordInsightApi.getLearningItemDetail(entryId)
      if (response.kind === "ok") {
        setDetail(mapLearningItemDetailToEntryDetail(response.data))
        refreshRepeatProgress()
        if (!isSilent) {
          setIsLoading(false)
        }
        return
      }

      if (!isSilent) {
        setIsLoading(false)
        setErrorMessage(resolveLoadErrorMessage(response))
      }

      if (__DEV__) {
        console.warn(
          isSilent
            ? "Vocabulary detail refresh after insight failed."
            : "Vocabulary detail request failed.",
          response,
        )
      }
    },
    [entryId, refreshRepeatProgress],
  )

  const loadGroups = useCallback(async () => {
    setIsLoadingGroups(true)
    const [groupsResponse, itemGroupsResponse] = await Promise.all([
      wordInsightApi.listLearningItemGroups(),
      wordInsightApi.listLearningItemGroupsForItem(entryId),
    ])

    if (groupsResponse.kind === "ok") {
      setGroups(groupsResponse.data)
    } else {
      setErrorMessage(resolveGroupErrorMessage(groupsResponse))
      if (__DEV__) {
        console.warn("Vocabulary detail groups request failed.", groupsResponse)
      }
    }

    if (itemGroupsResponse.kind === "ok") {
      setItemGroupIds(itemGroupsResponse.data.map((group) => group.id))
    } else {
      setErrorMessage(resolveGroupErrorMessage(itemGroupsResponse))
      if (__DEV__) {
        console.warn("Vocabulary detail item groups request failed.", itemGroupsResponse)
      }
    }

    setIsLoadingGroups(false)
  }, [entryId])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  useEffect(() => {
    void loadGroups()
  }, [loadGroups])

  useEffect(() => {
    refreshRepeatProgress()
  }, [refreshRepeatProgress])

  useEffect(() => {
    const detailEntryId = detail?.entry?.id
    const detailEntryStatus = detail?.entry?.status
    if (!detailEntryId || detailEntryStatus !== "learned" || !repeatProgress) return

    let cancelled = false
    void (async () => {
      await removeRepeatWord(userId, detailEntryId)
      if (cancelled) return
      setRepeatProgress(undefined)
    })()

    return () => {
      cancelled = true
    }
  }, [detail?.entry?.id, detail?.entry?.status, repeatProgress, userId])

  const entry = detail?.entry

  const examples = useMemo(() => {
    if (!detail) return []
    if (detail.entry.examples?.length) return detail.entry.examples
    return detail.entry.example ? [detail.entry.example] : []
  }, [detail])

  const handleToggleLearnedState = useCallback(async () => {
    if (!entry || isUpdatingStatus) return

    setIsUpdatingStatus(true)
    setErrorMessage(undefined)

    const response =
      entry.status === "active"
        ? await wordInsightApi.markLearningItemLearned(entry.id)
        : await wordInsightApi.reopenLearningItem(entry.id)

    if (response.kind === "ok") {
      const mappedEntry = mapLearningItemToEntry(response.data)
      setDetail((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          entry: {
            ...mappedEntry,
            examples: prev.entry.examples,
          },
        }
      })

      if (entry.status === "active" && response.data.status === "learned") {
        await removeRepeatWord(userId, entry.id)
        setRepeatProgress(undefined)
      } else if (entry.status === "learned" && response.data.status === "active") {
        refreshRepeatProgress()
      }

      setIsUpdatingStatus(false)
      return
    }

    setIsUpdatingStatus(false)
    setErrorMessage(resolveUpdateErrorMessage(response))

    if (__DEV__) {
      console.warn("Vocabulary learned status update request failed.", response)
    }
  }, [entry, isUpdatingStatus, refreshRepeatProgress, userId])

  const handleDeleteItem = useCallback(async () => {
    if (!entry || isDeletingItem) return

    setIsDeletingItem(true)
    setErrorMessage(undefined)
    try {
      const response = await wordInsightApi.softDeleteLearningItem(entry.id)
      if (response.kind === "ok") {
        await removeRepeatWord(userId, entry.id)
        navigation.goBack()
        return
      }

      setErrorMessage(resolveDeleteErrorMessage(response))
      if (__DEV__) {
        console.warn("Vocabulary item soft-delete request failed.", response)
      }
    } finally {
      setIsDeletingItem(false)
    }
  }, [entry, isDeletingItem, navigation, userId])

  const handleConfirmDeleteItem = useCallback(() => {
    if (!entry || isDeletingItem) return

    Alert.alert(
      translate("vocabulary:detail.deleteConfirmTitle"),
      translate("vocabulary:detail.deleteConfirmBody", { word: entry.word }),
      [
        {
          text: translate("vocabulary:detail.deleteConfirmCancel"),
          style: "cancel",
        },
        {
          text: translate("vocabulary:detail.deleteConfirmAction"),
          style: "destructive",
          onPress: () => {
            void handleDeleteItem()
          },
        },
      ],
    )
  }, [entry, handleDeleteItem, isDeletingItem])

  const handleToggleGroup = useCallback(
    async (group: WordInsightLearningItemGroup) => {
      if (!entry || groupMutatingId) return

      const isInGroup = itemGroupIds.includes(group.id)
      setGroupMutatingId(group.id)
      setErrorMessage(undefined)
      try {
        const response = isInGroup
          ? await wordInsightApi.removeLearningItemFromGroup(group.id, entry.id)
          : await wordInsightApi.addLearningItemToGroup(group.id, entry.id)

        if (response.kind === "ok") {
          setGroups((prev) =>
            prev.map((existingGroup) =>
              existingGroup.id === response.data.id ? response.data : existingGroup,
            ),
          )
          setItemGroupIds((prev) => {
            if (isInGroup) return prev.filter((groupId) => groupId !== group.id)
            if (prev.includes(group.id)) return prev
            return [...prev, group.id]
          })
          return
        }

        setErrorMessage(resolveGroupErrorMessage(response))
        if (__DEV__) {
          console.warn("Vocabulary detail group toggle request failed.", response)
        }
      } finally {
        setGroupMutatingId(undefined)
      }
    },
    [entry, groupMutatingId, itemGroupIds],
  )

  const handleRequestInsight = useCallback(
    async (mode: LookupMode) => {
      if (
        !entry ||
        !detail ||
        isRequestingInsightRef.current ||
        isRequestingInsight ||
        isUpdatingStatus
      ) {
        return
      }

      const sentence = detail.contextSentence ?? detail.sentence
      const selectedWord = entry.word
      if (!sentence || !selectedWord) {
        setErrorMessage(translate("vocabulary:errors.missingContext"))
        return
      }

      if (!sentenceIncludesSelectedWord(sentence, selectedWord)) {
        setErrorMessage(translate("vocabulary:errors.selectedWordNotInSentence"))
        return
      }

      isRequestingInsightRef.current = true
      setIsRequestingInsight(true)
      setErrorMessage(undefined)
      setLastExplainTransport(undefined)
      setLastExplainTransportDetail(undefined)
      setInsufficientCreditMode(undefined)

      try {
        const explainResponse = await wordInsightApi.runExplainAndWait({
          mode,
          sentence,
          selectedWord,
          sourceLang: entry.sourceLang,
          targetLang: entry.targetLang,
        })

        if (explainResponse.kind !== "ok") {
          setErrorMessage(resolveExplainErrorMessage(explainResponse, mode))
          if (explainResponse.kind === "forbidden") {
            setInsufficientCreditMode(mode)
          }
          return
        }

        const job = explainResponse.data
        setLastExplainTransport(job.transport)
        setLastExplainTransportDetail(job.transportDetail)
        if (job.status === "completed") {
          setDetail((prev) => {
            if (!prev) return prev
            if (job.result?.insight) {
              return applyWordInsightToEntryDetail(prev, {
                mode: job.result.mode,
                sentence: job.input.sentence || sentence,
                selectedWord: job.input.selectedWord || selectedWord,
                insight: job.result.insight,
              })
            }
            return {
              ...prev,
              entry: {
                ...prev.entry,
                lastSeenMode: mode,
              },
            }
          })
          void loadDetail({ silent: true })
          return
        }

        if (job.status === "failed") {
          const normalizedErrorMessage = job.errorMessage?.trim()
          setErrorMessage(
            resolveFailedJobMessage({
              mode,
              errorCode: job.errorCode,
              errorMessage: normalizedErrorMessage,
            }),
          )
          setInsufficientCreditMode(
            parseInsufficientCreditMode({
              errorCode: job.errorCode,
              errorMessage: normalizedErrorMessage,
              fallbackMode: mode,
            }),
          )
          return
        }

        setErrorMessage(translate("vocabulary:errors.analysisFailedGeneric"))
      } finally {
        isRequestingInsightRef.current = false
        setIsRequestingInsight(false)
      }
    },
    [detail, entry, isRequestingInsight, isUpdatingStatus, loadDetail],
  )

  const showPronunciationError = useCallback(() => {
    if (pronunciationErrorTimeoutRef.current) {
      clearTimeout(pronunciationErrorTimeoutRef.current)
    }
    setPronunciationErrorMessage(translate("vocabulary:errors.unexpected"))
    pronunciationErrorTimeoutRef.current = setTimeout(() => {
      setPronunciationErrorMessage(undefined)
    }, 2400)
  }, [])

  const handlePlayPronunciation = useCallback(() => {
    if (!entry) return
    void (async () => {
      const result = await speakWord({
        word: entry.word,
        sourceLang: entry.sourceLang,
      })
      if (result === "failed") {
        showPronunciationError()
      }
    })()
  }, [entry, showPronunciationError])

  const primaryMeaning = detail?.meaning ?? entry?.definition ?? ""
  const learningDefinition =
    detail?.learningDefinition ?? entry?.example ?? detail?.contextSentence ?? entry?.word ?? ""
  const nativeMeaning = detail?.nativeMeaning ?? primaryMeaning
  const explanation = detail?.shortExplanation ?? ""
  const contextSentence = detail?.contextSentence ?? ""
  const sourceLanguageOption = resolveLanguageOption(entry?.sourceLang)
  const targetLanguageOption = resolveLanguageOption(entry?.targetLang)
  const sourceLangBadge = sourceLanguageOption?.flag ?? entry?.sourceLang?.toUpperCase() ?? "L2"
  const targetLangBadge = targetLanguageOption?.flag ?? entry?.targetLang?.toUpperCase() ?? "L1"
  const statusLabel =
    entry?.status === "learned"
      ? translate("vocabulary:detail.statusLearned")
      : translate("vocabulary:detail.statusActive")
  const metaParts = [entry?.partOfSpeech, statusLabel].filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  )
  const metaText = metaParts.join(" | ")
  const ctaLabel =
    entry?.status === "active"
      ? translate("vocabulary:detail.markAsLearned")
      : translate("vocabulary:detail.moveBackToActive")
  const showAnalysisCta = entry?.lastSeenMode === "basic"
  const usageNotes = detail?.usageNotes ?? []
  const collocations = detail?.collocations ?? []
  const alternativeMeanings = detail?.alternativeMeanings ?? []
  const antonyms = detail?.antonyms ?? []
  const normalizedGroupSearchQuery = groupSearchQuery.trim().toLocaleLowerCase()
  const selectedDetailGroups = useMemo(
    () => groups.filter((group) => itemGroupIds.includes(group.id)),
    [groups, itemGroupIds],
  )
  const unselectedDetailGroups = useMemo(
    () => groups.filter((group) => !itemGroupIds.includes(group.id)),
    [groups, itemGroupIds],
  )
  const filteredUnselectedDetailGroups = useMemo(() => {
    if (!normalizedGroupSearchQuery) return unselectedDetailGroups
    return unselectedDetailGroups.filter((group) =>
      group.name.toLocaleLowerCase().includes(normalizedGroupSearchQuery),
    )
  }, [normalizedGroupSearchQuery, unselectedDetailGroups])
  const visibleUnselectedGroupLimit = normalizedGroupSearchQuery
    ? DETAIL_GROUP_SEARCH_RESULT_LIMIT
    : Math.max(DETAIL_GROUP_PREVIEW_LIMIT - selectedDetailGroups.length, 0)
  const visibleUnselectedDetailGroups = filteredUnselectedDetailGroups.slice(
    0,
    visibleUnselectedGroupLimit,
  )
  const visibleDetailGroups = [...selectedDetailGroups, ...visibleUnselectedDetailGroups]
  const hiddenDetailGroupCount = normalizedGroupSearchQuery
    ? Math.max(filteredUnselectedDetailGroups.length - visibleUnselectedDetailGroups.length, 0)
    : Math.max(groups.length - visibleDetailGroups.length, 0)
  const shouldShowGroupSearch = groups.length > DETAIL_GROUP_PREVIEW_LIMIT
  const groupHelperText =
    normalizedGroupSearchQuery && visibleDetailGroups.length === 0
      ? translate("vocabulary:detail.groupSearchNoResults")
      : hiddenDetailGroupCount > 0
        ? translate("vocabulary:detail.groupHiddenCount", { count: hiddenDetailGroupCount })
        : shouldShowGroupSearch
          ? translate("vocabulary:detail.groupSearchHint", { count: groups.length })
          : undefined
  const repeatDueLabel = formatRepeatDueLabel(repeatProgress?.dueAt)
  const isCtaDisabled = isUpdatingStatus || isRequestingInsight || isDeletingItem
  const creditCtaLabel =
    insufficientCreditMode === "advanced"
      ? translate("vocabulary:detail.buyAdvancedCredits")
      : insufficientCreditMode === "basic"
        ? translate("vocabulary:detail.buyBasicCredits")
        : translate("vocabulary:detail.buyCredits")
  const advancedGlowOpacity = advancedLoadingPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.9],
  })
  const advancedSweepOpacity = advancedLoadingPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.34],
  })
  const advancedGlowScale = advancedLoadingPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  })
  const advancedGlowSecondaryOpacity = advancedLoadingPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.58],
  })
  const advancedSweepTranslateX = advancedLoadingSweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-240, 240],
  })
  const advancedSweepSecondaryTranslateX = advancedLoadingSweep.interpolate({
    inputRange: [0, 1],
    outputRange: [240, -240],
  })
  const advancedSparkRotate = advancedLoadingSpark.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })
  const advancedSparkOpacity = advancedLoadingPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  })

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      backgroundColor={showroomColors.background}
      systemBarStyle={theme.isDark ? "light" : "dark"}
      contentContainerStyle={themed($screenContent)}
    >
      <View style={themed($detailHeader)}>
        <IconButton
          icon="x"
          size={16}
          accessibilityLabel={translate("vocabulary:detail.closeDetails")}
          onPress={() => navigation.goBack()}
        />
        <AppTutorialVideoButton
          screen="vocabulary_detail"
          placement="word_detail"
          sources={vocabularyDetailTutorialVideoSources}
          variant="help"
          limit={6}
          containerStyle={themed($detailHeaderHelpButton)}
        />
      </View>

      {isLoading && !detail ? (
        <View style={themed($stateWrap)}>
          <ActivityIndicator size="small" color={showroomColors.textStrong} />
          <Text style={themed($stateBody)} text={translate("vocabulary:detail.loadingDetail")} />
        </View>
      ) : !detail ? (
        <View style={themed($stateWrap)}>
          <Text
            style={themed($stateTitle)}
            text={translate("vocabulary:detail.detailLoadFailedTitle")}
          />
          <Text
            style={themed($stateBody)}
            text={errorMessage ?? translate("vocabulary:errors.unexpected")}
          />
          <Pressable
            onPress={() => {
              void loadDetail()
            }}
            accessibilityRole="button"
            accessibilityLabel="Retry loading details"
            style={({ pressed }) => [themed($retryButton), pressed && themed($retryButtonPressed)]}
          >
            <Text style={themed($retryButtonText)} text={translate("vocabulary:common.retry")} />
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            style={themed($detailScroll)}
            contentContainerStyle={themed($detailScrollContent)}
            showsVerticalScrollIndicator={false}
          >
            <Text style={themed($detailWord)} text={entry?.word ?? ""} />
            <Pressable
              onPress={handlePlayPronunciation}
              accessibilityRole="button"
              accessibilityLabel={`Play pronunciation for ${entry?.word ?? "word"}`}
              style={({ pressed }) => [
                themed($detailPronunciationPill),
                pressed && themed($detailPronunciationPressed),
              ]}
            >
              <Text
                style={themed($detailPronunciationText)}
                text={entry?.pronunciation ?? ""}
                numberOfLines={1}
                ellipsizeMode="tail"
              />
              <View style={themed($detailAudioIcon)}>
                <MaterialCommunityIcons
                  name="volume-high"
                  size={14}
                  color={showroomColors.textStrong}
                />
              </View>
            </Pressable>
            {pronunciationErrorMessage ? (
              <Text style={themed($detailPronunciationError)} text={pronunciationErrorMessage} />
            ) : null}

            {metaText.length > 0 && <Text style={themed($detailMetaText)} text={metaText} />}
            <Text style={themed($detailDefinition)} text={learningDefinition} />
            {nativeMeaning.length > 0 && (
              <Text
                style={themed($detailNativeMeaning)}
                text={`${targetLangBadge} ${nativeMeaning}`}
              />
            )}

            <AppTutorialVideoButton
              screen="vocabulary_detail"
              placement="word_detail"
              variant="banner"
              hideAfterSeen
              containerStyle={themed($detailTutorialVideoWrap)}
            />

            {contextSentence.length > 0 && (
              <View style={themed($sectionWrap)}>
                <Text style={themed($detailSectionLabel)} text={`Context (${sourceLangBadge})`} />
                <Text style={themed($sectionText)} text={contextSentence} />
              </View>
            )}

            {explanation.length > 0 && (
              <View style={themed($sectionWrap)}>
                <Text
                  style={themed($detailSectionLabel)}
                  text={translate("vocabulary:detail.whyThisSense")}
                />
                <Text style={themed($sectionText)} text={explanation} />
              </View>
            )}

            {examples.length > 0 && (
              <View style={themed($detailExamples)}>
                <Text
                  style={themed($detailSectionLabel)}
                  text={translate("vocabulary:detail.examples")}
                />
                {examples.map((example, index) => (
                  <View
                    key={`${entry?.id ?? "entry"}-example-${index}`}
                    style={themed($detailExampleRow)}
                  >
                    <Text style={themed($detailExampleIndex)} text={`${index + 1}.`} />
                    <Text style={themed($detailExampleText)} text={example} />
                  </View>
                ))}
              </View>
            )}

            <View style={themed($sectionWrap)}>
              <Text
                style={themed($detailSectionLabel)}
                text={translate("vocabulary:detail.synonyms")}
              />
              {detail.synonyms.length > 0 ? (
                <View style={themed($synonymsWrap)}>
                  {detail.synonyms.map((synonym) => (
                    <View key={`${entry?.id ?? "entry"}-${synonym}`} style={themed($synonymChip)}>
                      <Text style={themed($synonymText)} text={synonym} />
                    </View>
                  ))}
                </View>
              ) : (
                <Text
                  style={themed($emptySectionText)}
                  text={translate("vocabulary:detail.noSynonyms")}
                />
              )}
            </View>

            {antonyms.length > 0 && (
              <View style={themed($sectionWrap)}>
                <Text
                  style={themed($detailSectionLabel)}
                  text={translate("vocabulary:detail.antonyms")}
                />
                <View style={themed($synonymsWrap)}>
                  {antonyms.map((antonym) => (
                    <View key={`${entry?.id ?? "entry"}-${antonym}`} style={themed($synonymChip)}>
                      <Text style={themed($synonymText)} text={antonym} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {collocations.length > 0 && (
              <View style={themed($sectionWrap)}>
                <Text
                  style={themed($detailSectionLabel)}
                  text={translate("vocabulary:detail.collocations")}
                />
                <View style={themed($synonymsWrap)}>
                  {collocations.map((collocation) => (
                    <View
                      key={`${entry?.id ?? "entry"}-${collocation}`}
                      style={themed($synonymChip)}
                    >
                      <Text style={themed($synonymText)} text={collocation} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {alternativeMeanings.length > 0 && (
              <View style={themed($detailExamples)}>
                <Text
                  style={themed($detailSectionLabel)}
                  text={translate("vocabulary:detail.alternativeMeanings")}
                />
                {alternativeMeanings.map((meaning, index) => (
                  <View
                    key={`${entry?.id ?? "entry"}-alt-${index}`}
                    style={themed($detailExampleRow)}
                  >
                    <Text style={themed($detailExampleIndex)} text={`${index + 1}.`} />
                    <Text style={themed($detailExampleText)} text={meaning} />
                  </View>
                ))}
              </View>
            )}

            {usageNotes.length > 0 && (
              <View style={themed($detailExamples)}>
                <Text
                  style={themed($detailSectionLabel)}
                  text={translate("vocabulary:detail.usageNotes")}
                />
                {usageNotes.map((note, index) => (
                  <View
                    key={`${entry?.id ?? "entry"}-note-${index}`}
                    style={themed($detailExampleRow)}
                  >
                    <Text style={themed($detailExampleIndex)} text={`${index + 1}.`} />
                    <Text style={themed($detailExampleText)} text={note} />
                  </View>
                ))}
              </View>
            )}

            <View style={themed($sectionWrap)}>
              <Text
                style={themed($detailSectionLabel)}
                text={translate("vocabulary:detail.groups")}
              />
              {isLoadingGroups ? (
                <Text
                  style={themed($emptySectionText)}
                  text={translate("vocabulary:detail.groupsLoading")}
                />
              ) : groups.length === 0 ? (
                <Text
                  style={themed($emptySectionText)}
                  text={translate("vocabulary:detail.groupsEmpty")}
                />
              ) : (
                <>
                  {shouldShowGroupSearch ? (
                    <View style={themed($groupSearchWrap)}>
                      <MaterialCommunityIcons
                        name="magnify"
                        size={16}
                        color={showroomColors.textMuted}
                      />
                      <TextInput
                        value={groupSearchQuery}
                        onChangeText={setGroupSearchQuery}
                        placeholder={translate("vocabulary:detail.groupSearchPlaceholder")}
                        placeholderTextColor={showroomColors.textMuted}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                        allowFontScaling
                        maxFontSizeMultiplier={DEFAULT_MAX_FONT_SIZE_MULTIPLIER}
                        style={themed($groupSearchInput)}
                      />
                      {groupSearchQuery.length > 0 ? (
                        <Pressable
                          onPress={() => setGroupSearchQuery("")}
                          accessibilityRole="button"
                          accessibilityLabel={translate("vocabulary:detail.groupSearchClear")}
                          style={({ pressed }) => [
                            themed($groupSearchClearButton),
                            pressed && themed($groupSearchClearButtonPressed),
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="close"
                            size={14}
                            color={showroomColors.textStrong}
                          />
                        </Pressable>
                      ) : null}
                    </View>
                  ) : null}

                  {groupHelperText ? (
                    <Text style={themed($groupHelperText)} text={groupHelperText} />
                  ) : null}

                  {visibleDetailGroups.length > 0 ? (
                    <View style={themed($groupsWrap)}>
                      {visibleDetailGroups.map((group) => {
                        const isSelected = itemGroupIds.includes(group.id)
                        const isMutating = groupMutatingId === group.id
                        return (
                          <Pressable
                            key={`detail-group-${group.id}`}
                            onPress={() => {
                              void handleToggleGroup(group)
                            }}
                            disabled={Boolean(groupMutatingId)}
                            accessibilityRole="button"
                            accessibilityLabel={translate(
                              "vocabulary:detail.groupToggleAccessibility",
                              {
                                name: group.name,
                              },
                            )}
                            style={({ pressed }) => [
                              themed($groupChip),
                              isSelected && themed($groupChipSelected),
                              Boolean(groupMutatingId) && themed($groupChipDisabled),
                              pressed && !groupMutatingId && themed($groupChipPressed),
                            ]}
                          >
                            {isMutating ? (
                              <ActivityIndicator
                                size="small"
                                color={isSelected ? "#FFFFFF" : showroomColors.textStrong}
                              />
                            ) : (
                              <>
                                <MaterialCommunityIcons
                                  name={isSelected ? "folder-check-outline" : "folder-outline"}
                                  size={15}
                                  color={isSelected ? "#FFFFFF" : showroomColors.textMuted}
                                />
                                <Text
                                  style={[
                                    themed($groupChipText),
                                    isSelected && themed($groupChipTextSelected),
                                  ]}
                                  text={group.name}
                                  numberOfLines={1}
                                />
                                <Text
                                  style={[
                                    themed($groupChipCount),
                                    isSelected && themed($groupChipCountSelected),
                                  ]}
                                  text={translate("vocabulary:detail.groupWordCount", {
                                    count: group.itemCount,
                                  })}
                                />
                              </>
                            )}
                          </Pressable>
                        )
                      })}
                    </View>
                  ) : null}
                </>
              )}
            </View>

            <View style={themed($sectionWrap)}>
              <Text
                style={themed($detailSectionLabel)}
                text={translate("vocabulary:detail.stats")}
              />
              <Text
                style={themed($sectionText)}
                text={translate("vocabulary:detail.encountersAndLastMode", {
                  encounters: entry?.encounterCount ?? 0,
                  mode: entry?.lastSeenMode ?? "-",
                })}
              />
              {entry?.id ? (
                <View style={themed($statsActionsWrap)}>
                  <Pressable
                    onPress={() =>
                      navigation.navigate("VocabularyReportIssue", {
                        entryId: entry.id,
                        word: entry.word,
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={translate("vocabulary:detail.reportIssueAccessibility", {
                      word: entry.word,
                    })}
                    style={({ pressed }) => [
                      themed($reportIssueButton),
                      pressed && themed($reportIssueButtonPressed),
                    ]}
                  >
                    <Icon icon="ladybug" size={14} color={showroomColors.textMuted} />
                    <Text
                      style={themed($reportIssueButtonText)}
                      text={translate("vocabulary:detail.reportIssue")}
                      numberOfLines={1}
                    />
                  </Pressable>

                  <Pressable
                    onPress={handleConfirmDeleteItem}
                    disabled={isDeletingItem}
                    accessibilityRole="button"
                    accessibilityLabel={translate("vocabulary:detail.deleteWordAccessibility", {
                      word: entry.word,
                    })}
                    style={({ pressed }) => [
                      themed($deleteItemButton),
                      isDeletingItem && themed($deleteItemButtonDisabled),
                      pressed && !isDeletingItem && themed($deleteItemButtonPressed),
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={15}
                      color={theme.colors.error}
                    />
                    <Text
                      style={themed($deleteItemButtonText)}
                      text={translate("vocabulary:detail.deleteWord")}
                      numberOfLines={1}
                    />
                  </Pressable>
                </View>
              ) : null}
            </View>
          </ScrollView>

          <View style={themed([$detailCtaContainer, $bottomInsets])}>
            {repeatProgress && (
              <View style={themed($repeatReviewWrap)}>
                <Text
                  style={themed($detailSectionLabel)}
                  text={translate("vocabulary:detail.nextReminder")}
                />
                <Text
                  style={themed($repeatReviewDueText)}
                  text={translate("vocabulary:detail.currentPlan", { due: repeatDueLabel })}
                />
              </View>
            )}
            {__DEV__ && lastExplainTransport && (
              <Text
                style={themed($ctaDebugText)}
                text={`Debug transport: ${lastExplainTransport.toUpperCase()}${
                  lastExplainTransportDetail ? ` (${lastExplainTransportDetail})` : ""
                }`}
              />
            )}
            {errorMessage && <Text style={themed($ctaErrorText)} text={errorMessage} />}
            {insufficientCreditMode && (
              <Pressable
                onPress={() => navigation.navigate("ProfileIap")}
                accessibilityRole="button"
                accessibilityLabel="Open credit purchase options"
                style={({ pressed }) => [
                  themed($detailCreditCtaButton),
                  pressed && themed($detailCreditCtaButtonPressed),
                ]}
              >
                <Text style={themed($detailCreditCtaText)} text={creditCtaLabel} />
              </Pressable>
            )}
            {showAnalysisCta && (
              <AppTutorialVideoButton
                screen="vocabulary_detail"
                placement="advanced_analysis"
                variant="banner"
                hideAfterSeen
                containerStyle={themed($advancedTutorialVideoWrap)}
              />
            )}
            {showAnalysisCta && (
              <Pressable
                onPress={() => {
                  void handleRequestInsight("advanced")
                }}
                disabled={isCtaDisabled}
                accessibilityRole="button"
                accessibilityLabel="Request advanced analysis"
                style={({ pressed }) => [
                  themed($detailSecondaryCtaButton),
                  isRequestingInsight && themed($detailSecondaryCtaButtonLoading),
                  isCtaDisabled && themed($detailSecondaryCtaButtonDisabled),
                  pressed && !isCtaDisabled && themed($detailSecondaryCtaButtonPressed),
                ]}
              >
                {isRequestingInsight ? (
                  <View style={themed($advancedLoadingWrap)}>
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        themed($advancedLoadingGlow),
                        { opacity: advancedGlowOpacity, transform: [{ scale: advancedGlowScale }] },
                      ]}
                    />
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        themed($advancedLoadingGlowSecondary),
                        { opacity: advancedGlowSecondaryOpacity },
                      ]}
                    />
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        themed($advancedLoadingSweep),
                        {
                          opacity: advancedSweepOpacity,
                          transform: [{ translateX: advancedSweepTranslateX }],
                        },
                      ]}
                    />
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        themed($advancedLoadingSweepSecondary),
                        {
                          opacity: advancedSweepOpacity,
                          transform: [{ translateX: advancedSweepSecondaryTranslateX }],
                        },
                      ]}
                    />
                    <View style={themed($advancedLoadingHeader)}>
                      <Animated.View
                        style={[
                          themed($advancedLoadingSparkWrap),
                          {
                            opacity: advancedSparkOpacity,
                            transform: [{ rotate: advancedSparkRotate }],
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="star-four-points-outline"
                          size={14}
                          color={showroomColors.textStrong}
                        />
                      </Animated.View>
                      <Text
                        style={themed($advancedLoadingTitle)}
                        text={translate("vocabulary:detail.runAdvanced")}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.82}
                      />
                    </View>
                  </View>
                ) : (
                  <Text
                    style={themed($detailSecondaryCtaText)}
                    text={translate("vocabulary:detail.runAdvanced")}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.82}
                  />
                )}
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                void handleToggleLearnedState()
              }}
              disabled={isCtaDisabled}
              accessibilityRole="button"
              accessibilityLabel={ctaLabel}
              style={({ pressed }) => [
                themed($detailCtaButton),
                isCtaDisabled && themed($detailCtaButtonDisabled),
                pressed && !isCtaDisabled && themed($detailCtaButtonPressed),
              ]}
            >
              {isUpdatingStatus ? (
                <ActivityIndicator size="small" color={showroomColors.accentText} />
              ) : (
                <Text
                  style={themed($detailCtaText)}
                  text={ctaLabel}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                />
              )}
            </Pressable>
          </View>
        </>
      )}
    </Screen>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "flex-start",
})

const $iconButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 44,
  width: 44,
  borderRadius: 22,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $iconButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $detailHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
})

const $detailHeaderHelpButton: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "center",
})

const $stateWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.xl,
})

const $stateTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 20,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $stateBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $retryButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $retryButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $retryButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $detailScroll: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $detailScrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xxxl + spacing.lg,
  alignItems: "center",
})

const $detailWord: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 40,
  lineHeight: 48,
  color: colors.vocabularyShowroom.textStrong,
  letterSpacing: 0.6,
  textAlign: "center",
})

const $detailPronunciationPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginTop: spacing.sm,
  maxWidth: "100%",
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.md,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $detailPronunciationPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $detailPronunciationText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flexShrink: 1,
  fontFamily: Platform.select({
    android: typography.secondary?.medium ?? typography.primary.medium,
    default: typography.code?.normal ?? typography.primary.medium,
  }),
  fontSize: 13,
  includeFontPadding: false,
  color: colors.vocabularyShowroom.textStrong,
  letterSpacing: 0.4,
})

const $detailPronunciationError: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.error,
  textAlign: "center",
})

const $detailAudioIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginLeft: spacing.xs,
})

const $detailMetaText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.medium,
  fontSize: 12,
  letterSpacing: 0.4,
  color: colors.vocabularyShowroom.textMuted,
})

const $detailDefinition: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.md,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  lineHeight: 24,
  textAlign: "center",
  color: colors.vocabularyShowroom.textStrong,
})

const $detailNativeMeaning: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.medium,
  fontSize: 14,
  lineHeight: 20,
  textAlign: "center",
  color: colors.vocabularyShowroom.textMuted,
})

const $detailTutorialVideoWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  alignSelf: "stretch",
})

const $sectionWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  alignSelf: "stretch",
})

const $detailExamples: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  alignSelf: "stretch",
})

const $detailSectionLabel: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: colors.vocabularyShowroom.textMuted,
})

const $sectionText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 15,
  lineHeight: 22,
  color: colors.vocabularyShowroom.textStrong,
})

const $reportIssueButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: 0,
  height: 52,
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $reportIssueButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $reportIssueButtonText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginLeft: spacing.xs,
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
  flexShrink: 1,
  textAlign: "center",
})

const $statsActionsWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
  flexDirection: "column",
  gap: spacing.sm,
})

const $deleteItemButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: 0,
  height: 52,
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.error,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $deleteItemButtonDisabled: ThemedStyle<ViewStyle> = ({ colors }) => ({
  opacity: 0.55,
  borderColor: colors.vocabularyShowroom.outline,
})

const $deleteItemButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $deleteItemButtonText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginLeft: spacing.xs,
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.error,
  flexShrink: 1,
  textAlign: "center",
})

const $detailExampleRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  marginTop: spacing.sm,
})

const $detailExampleIndex: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  width: 22,
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textMuted,
})

const $detailExampleText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flex: 1,
  fontFamily: typography.primary.normal,
  fontSize: 15,
  lineHeight: 22,
  color: colors.vocabularyShowroom.textStrong,
})

const $synonymsWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
  flexDirection: "row",
  flexWrap: "wrap",
})

const $synonymChip: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  marginRight: spacing.xs,
  marginBottom: spacing.xs,
})

const $synonymText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $groupSearchWrap: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
  minHeight: 44,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
})

const $groupSearchInput: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  flex: 1,
  marginLeft: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
  paddingVertical: 0,
})

const $groupSearchClearButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 26,
  width: 26,
  borderRadius: 13,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $groupSearchClearButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $groupHelperText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  lineHeight: 17,
  color: colors.vocabularyShowroom.textMuted,
})

const $groupsWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
  flexDirection: "row",
  flexWrap: "wrap",
})

const $groupChip: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  maxWidth: "100%",
  minHeight: 38,
  flexDirection: "row",
  alignItems: "center",
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  marginRight: spacing.xs,
  marginBottom: spacing.xs,
})

const $groupChipSelected: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  borderColor: colors.vocabularyShowroom.accent,
  backgroundColor: isDark
    ? colors.vocabularyShowroom.surfaceStrong
    : colors.vocabularyShowroom.accent,
})

const $groupChipDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.65,
})

const $groupChipPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $groupChipText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  maxWidth: 150,
  marginLeft: spacing.xs,
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $groupChipTextSelected: ThemedStyle<TextStyle> = ({ colors, isDark }) => ({
  color: isDark ? colors.vocabularyShowroom.textStrong : "#FFFFFF",
})

const $groupChipCount: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginLeft: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $groupChipCountSelected: ThemedStyle<TextStyle> = ({ colors, isDark }) => ({
  color: isDark ? colors.vocabularyShowroom.textMuted : "rgba(255,255,255,0.84)",
})

const $emptySectionText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.vocabularyShowroom.textMuted,
})

const $detailCtaContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.sm,
  paddingBottom: spacing.lg,
  borderTopWidth: 1,
  borderTopColor: colors.vocabularyShowroom.detailDivider,
  backgroundColor: colors.vocabularyShowroom.background,
})

const $ctaErrorText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginBottom: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.error,
  textAlign: "center",
})

const $ctaDebugText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginBottom: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 11,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $repeatReviewWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $repeatReviewDueText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $repeatReviewHintText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $advancedTutorialVideoWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $detailCtaButton: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  minHeight: 50,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: isDark ? 1.5 : 0,
  borderColor: colors.vocabularyShowroom.ctaOutline,
  backgroundColor: isDark ? colors.vocabularyShowroom.surface : colors.vocabularyShowroom.accent,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.xs,
})

const $detailCtaButtonDisabled: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  opacity: 0.7,
  borderWidth: isDark ? 1.5 : 0,
  borderColor: colors.vocabularyShowroom.ctaOutline,
  backgroundColor: isDark ? colors.vocabularyShowroom.surface : colors.vocabularyShowroom.accent,
})

const $detailCtaButtonPressed: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  backgroundColor: isDark
    ? colors.vocabularyShowroom.surfaceStrong
    : colors.vocabularyShowroom.accentPressed,
  borderColor: isDark
    ? colors.vocabularyShowroom.ctaOutlinePressed
    : colors.vocabularyShowroom.accentPressed,
})

const $detailCtaText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  textAlign: "center",
  color: "#FFFFFF",
})

const $detailSecondaryCtaButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 46,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  marginBottom: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
})

const $detailSecondaryCtaButtonLoading: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 50,
  alignItems: "stretch",
  justifyContent: "center",
  overflow: "hidden",
  borderWidth: 1.5,
  borderColor: colors.vocabularyShowroom.ctaOutlinePressed,
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
})

const $detailSecondaryCtaButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.7,
})

const $detailSecondaryCtaButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $detailSecondaryCtaText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  textAlign: "center",
  color: colors.vocabularyShowroom.textStrong,
})

const $advancedLoadingWrap: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
})

const $advancedLoadingGlow: ThemedStyle<ViewStyle> = ({ colors }) => ({
  ...StyleSheet.absoluteFillObject,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.accent,
})

const $advancedLoadingGlowSecondary: ThemedStyle<ViewStyle> = ({ colors }) => ({
  ...StyleSheet.absoluteFillObject,
  borderRadius: 999,
  borderWidth: 1.5,
  borderColor: colors.palette.secondary400,
})

const $advancedLoadingSweep: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: -12,
  bottom: -12,
  width: 110,
  borderRadius: 40,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $advancedLoadingSweepSecondary: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: -10,
  bottom: -10,
  width: 90,
  borderRadius: 40,
  backgroundColor: colors.palette.secondary400,
})

const $advancedLoadingHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xxs,
})

const $advancedLoadingSparkWrap: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  justifyContent: "center",
})

const $advancedLoadingTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flexShrink: 1,
  fontFamily: typography.primary.medium,
  fontSize: 14,
  textAlign: "center",
  color: colors.vocabularyShowroom.textStrong,
})

const $detailCreditCtaButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 46,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.error,
  marginBottom: spacing.sm,
})

const $detailCreditCtaButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $detailCreditCtaText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.error,
})
