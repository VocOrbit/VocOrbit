import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import { Icon, IconTypes } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { resolveLanguageOption } from "@/context/LanguagePreferencesContext"
import { translate } from "@/i18n/translate"
import { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import {
  type LookupMode,
  type WordInsightWaitTransport,
  wordInsightApi,
} from "@/services/api/wordInsightApi"
import { speakWord } from "@/services/pronunciation/pronunciationService"
import {
  formatRepeatIntervalLabel,
  formatRepeatDueLabel,
  getRepeatReviewDelayMinutes,
  getRepeatProgressForEntry,
  removeRepeatWord,
  reviewRepeatWord,
  type RepeatProgressItem,
  type RepeatReviewGrade,
} from "@/services/repeat/repeatService"
import { isDesktopShellRuntime } from "@/services/desktop/desktopQuickLookupBridge"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

import { mapLearningItemDetailToEntryDetail, mapLearningItemToEntry, type VocabularyEntryDetail } from "../types"

type VocabularyDetailScreenProps = AppStackScreenProps<"VocabularyDetail">

const DETAIL_DESKTOP_BREAKPOINT = 1024

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

function parseInsufficientCreditMode(
  input: { errorCode?: string; errorMessage?: string; fallbackMode: LookupMode },
): LookupMode | undefined {
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

function resolveRepeatReviewErrorMessage(): string {
  return translate("vocabulary:errors.repeatProgressUpdateFailed")
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

export const VocabularyDetailScreen: FC<VocabularyDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId } = useAuth()
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const { width: viewportWidth } = useWindowDimensions()
  const entryId = route.params.entryId
  const isDesktopDetailLayout = viewportWidth >= DETAIL_DESKTOP_BREAKPOINT
  const showRepeatUi = false

  const [detail, setDetail] = useState<VocabularyEntryDetail | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isRequestingInsight, setIsRequestingInsight] = useState(false)
  const [isUpdatingRepeatProgress, setIsUpdatingRepeatProgress] = useState(false)
  const [isDeletingItem, setIsDeletingItem] = useState(false)
  const [repeatProgress, setRepeatProgress] = useState<RepeatProgressItem | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [pronunciationErrorMessage, setPronunciationErrorMessage] = useState<string | undefined>(undefined)
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

  const loadDetail = useCallback(async (options: { silent?: boolean } = {}) => {
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
  }, [entryId, refreshRepeatProgress])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

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

  const handleRequestInsight = useCallback(
    async (mode: LookupMode) => {
      if (!entry || !detail || isRequestingInsightRef.current || isRequestingInsight || isUpdatingStatus) {
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

  const handleRepeatReview = useCallback(
    async (grade: RepeatReviewGrade) => {
      if (!entry || isUpdatingRepeatProgress || isRequestingInsight || isUpdatingStatus) return

      setIsUpdatingRepeatProgress(true)
      setErrorMessage(undefined)
      try {
        const response = await reviewRepeatWord(userId, entry.id, grade)
        if (response.result === "updated") {
          setRepeatProgress(response.progress)
          return
        }
        setErrorMessage(resolveRepeatReviewErrorMessage())
      } catch {
        setErrorMessage(resolveRepeatReviewErrorMessage())
      } finally {
        setIsUpdatingRepeatProgress(false)
      }
    },
    [entry, isRequestingInsight, isUpdatingRepeatProgress, isUpdatingStatus, userId],
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
  const repeatDueLabel = formatRepeatDueLabel(repeatProgress?.dueAt)
  const isDesktopShell = isDesktopShellRuntime()
  const repeatReviewOptions = useMemo(
    () => {
      return [
        {
          grade: "forgot" as const,
          title: translate("vocabulary:detail.reviewForgot"),
          delayLabel: formatRepeatIntervalLabel(getRepeatReviewDelayMinutes(repeatProgress, "forgot")),
        },
        {
          grade: "hard" as const,
          title: translate("vocabulary:detail.reviewHard"),
          delayLabel: formatRepeatIntervalLabel(getRepeatReviewDelayMinutes(repeatProgress, "hard")),
        },
        {
          grade: "good" as const,
          title: translate("vocabulary:detail.reviewGood"),
          delayLabel: formatRepeatIntervalLabel(getRepeatReviewDelayMinutes(repeatProgress, "good")),
        },
      ]
    },
    [repeatProgress],
  )
  const isCtaDisabled = isUpdatingStatus || isRequestingInsight || isUpdatingRepeatProgress || isDeletingItem
  const creditCtaLabel =
    insufficientCreditMode === "advanced"
      ? translate("vocabulary:detail.buyAdvancedCredits")
      : insufficientCreditMode === "basic"
        ? translate("vocabulary:detail.buyBasicCredits")
        : translate("vocabulary:detail.buyCredits")

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      backgroundColor={showroomColors.background}
      systemBarStyle={theme.isDark ? "light" : "dark"}
      contentContainerStyle={themed($screenContent)}
      tabletContentMaxWidth={isDesktopDetailLayout ? 1080 : undefined}
    >
      <View style={[themed($detailHeader), isDesktopDetailLayout && desktopDetailStyles.detailHeader]}>
        <IconButton
          icon="x"
          size={isDesktopDetailLayout ? 18 : 16}
          accessibilityLabel={translate("vocabulary:detail.closeDetails")}
          onPress={() => navigation.goBack()}
        />
      </View>

      {isLoading && !detail ? (
        <View style={themed($stateWrap)}>
          <ActivityIndicator size="small" color={showroomColors.textStrong} />
          <Text style={themed($stateBody)} text={translate("vocabulary:detail.loadingDetail")} />
        </View>
      ) : !detail ? (
        <View style={themed($stateWrap)}>
          <Text style={themed($stateTitle)} text={translate("vocabulary:detail.detailLoadFailedTitle")} />
          <Text style={themed($stateBody)} text={errorMessage ?? translate("vocabulary:errors.unexpected")} />
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
            contentContainerStyle={[
              themed($detailScrollContent),
              isDesktopDetailLayout && desktopDetailStyles.detailScrollContent,
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={[themed($detailWord), isDesktopDetailLayout && desktopDetailStyles.detailWord]}
              text={entry?.word ?? ""}
            />
            <Pressable
              onPress={handlePlayPronunciation}
              accessibilityRole="button"
              accessibilityLabel={`Play pronunciation for ${entry?.word ?? "word"}`}
              style={({ pressed }) => [
                themed($detailPronunciationPill),
                isDesktopDetailLayout && desktopDetailStyles.detailPronunciationPill,
                pressed && themed($detailPronunciationPressed),
              ]}
            >
              <Text
                style={[
                  themed($detailPronunciationText),
                  isDesktopDetailLayout && desktopDetailStyles.detailPronunciationText,
                ]}
                text={entry?.pronunciation ?? ""}
              />
              <View style={themed($detailAudioIcon)}>
                <MaterialCommunityIcons name="volume-high" size={12} color={showroomColors.textStrong} />
              </View>
            </Pressable>
            {pronunciationErrorMessage ? (
              <Text
                style={[
                  themed($detailPronunciationError),
                  isDesktopDetailLayout && desktopDetailStyles.detailPronunciationError,
                ]}
                text={pronunciationErrorMessage}
              />
            ) : null}

            {metaText.length > 0 && (
              <Text
                style={[themed($detailMetaText), isDesktopDetailLayout && desktopDetailStyles.detailMetaText]}
                text={metaText}
              />
            )}
            <Text
              style={[themed($detailDefinition), isDesktopDetailLayout && desktopDetailStyles.detailDefinition]}
              text={learningDefinition}
            />
            {nativeMeaning.length > 0 && (
              <Text
                style={[
                  themed($detailNativeMeaning),
                  isDesktopDetailLayout && desktopDetailStyles.detailNativeMeaning,
                ]}
                text={`${targetLangBadge} ${nativeMeaning}`}
              />
            )}

            {contextSentence.length > 0 && (
              <View style={[themed($sectionWrap), isDesktopDetailLayout && desktopDetailStyles.sectionWrap]}>
                <Text
                  style={[
                    themed($detailSectionLabel),
                    isDesktopDetailLayout && desktopDetailStyles.detailSectionLabel,
                  ]}
                  text={`Context (${sourceLangBadge})`}
                />
                <Text
                  style={[themed($sectionText), isDesktopDetailLayout && desktopDetailStyles.sectionText]}
                  text={contextSentence}
                />
              </View>
            )}

            {explanation.length > 0 && (
              <View style={[themed($sectionWrap), isDesktopDetailLayout && desktopDetailStyles.sectionWrap]}>
                <Text
                  style={[
                    themed($detailSectionLabel),
                    isDesktopDetailLayout && desktopDetailStyles.detailSectionLabel,
                  ]}
                  text={translate("vocabulary:detail.whyThisSense")}
                />
                <Text
                  style={[themed($sectionText), isDesktopDetailLayout && desktopDetailStyles.sectionText]}
                  text={explanation}
                />
              </View>
            )}

            {examples.length > 0 && (
              <View style={[themed($detailExamples), isDesktopDetailLayout && desktopDetailStyles.sectionWrap]}>
                <Text
                  style={[
                    themed($detailSectionLabel),
                    isDesktopDetailLayout && desktopDetailStyles.detailSectionLabel,
                  ]}
                  text={translate("vocabulary:detail.examples")}
                />
                {examples.map((example, index) => (
                  <View key={`${entry?.id ?? "entry"}-example-${index}`} style={themed($detailExampleRow)}>
                    <Text
                      style={[
                        themed($detailExampleIndex),
                        isDesktopDetailLayout && desktopDetailStyles.detailExampleIndex,
                      ]}
                      text={`${index + 1}.`}
                    />
                    <Text
                      style={[
                        themed($detailExampleText),
                        isDesktopDetailLayout && desktopDetailStyles.detailExampleText,
                      ]}
                      text={example}
                    />
                  </View>
                ))}
              </View>
            )}

            <View style={[themed($sectionWrap), isDesktopDetailLayout && desktopDetailStyles.sectionWrap]}>
              <Text
                style={[
                  themed($detailSectionLabel),
                  isDesktopDetailLayout && desktopDetailStyles.detailSectionLabel,
                ]}
                text={translate("vocabulary:detail.synonyms")}
              />
              {detail.synonyms.length > 0 ? (
                <View style={themed($synonymsWrap)}>
                  {detail.synonyms.map((synonym) => (
                    <View key={`${entry?.id ?? "entry"}-${synonym}`} style={themed($synonymChip)}>
                      <Text
                        style={[
                          themed($synonymText),
                          isDesktopDetailLayout && desktopDetailStyles.synonymText,
                        ]}
                        text={synonym}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <Text
                  style={[
                    themed($emptySectionText),
                    isDesktopDetailLayout && desktopDetailStyles.emptySectionText,
                  ]}
                  text={translate("vocabulary:detail.noSynonyms")}
                />
              )}
            </View>

            {antonyms.length > 0 && (
              <View style={[themed($sectionWrap), isDesktopDetailLayout && desktopDetailStyles.sectionWrap]}>
                <Text
                  style={[
                    themed($detailSectionLabel),
                    isDesktopDetailLayout && desktopDetailStyles.detailSectionLabel,
                  ]}
                  text={translate("vocabulary:detail.antonyms")}
                />
                <View style={themed($synonymsWrap)}>
                  {antonyms.map((antonym) => (
                    <View key={`${entry?.id ?? "entry"}-${antonym}`} style={themed($synonymChip)}>
                      <Text
                        style={[
                          themed($synonymText),
                          isDesktopDetailLayout && desktopDetailStyles.synonymText,
                        ]}
                        text={antonym}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {collocations.length > 0 && (
              <View style={[themed($sectionWrap), isDesktopDetailLayout && desktopDetailStyles.sectionWrap]}>
                <Text
                  style={[
                    themed($detailSectionLabel),
                    isDesktopDetailLayout && desktopDetailStyles.detailSectionLabel,
                  ]}
                  text={translate("vocabulary:detail.collocations")}
                />
                <View style={themed($synonymsWrap)}>
                  {collocations.map((collocation) => (
                    <View key={`${entry?.id ?? "entry"}-${collocation}`} style={themed($synonymChip)}>
                      <Text
                        style={[
                          themed($synonymText),
                          isDesktopDetailLayout && desktopDetailStyles.synonymText,
                        ]}
                        text={collocation}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {alternativeMeanings.length > 0 && (
              <View style={[themed($detailExamples), isDesktopDetailLayout && desktopDetailStyles.sectionWrap]}>
                <Text
                  style={[
                    themed($detailSectionLabel),
                    isDesktopDetailLayout && desktopDetailStyles.detailSectionLabel,
                  ]}
                  text={translate("vocabulary:detail.alternativeMeanings")}
                />
                {alternativeMeanings.map((meaning, index) => (
                  <View key={`${entry?.id ?? "entry"}-alt-${index}`} style={themed($detailExampleRow)}>
                    <Text
                      style={[
                        themed($detailExampleIndex),
                        isDesktopDetailLayout && desktopDetailStyles.detailExampleIndex,
                      ]}
                      text={`${index + 1}.`}
                    />
                    <Text
                      style={[
                        themed($detailExampleText),
                        isDesktopDetailLayout && desktopDetailStyles.detailExampleText,
                      ]}
                      text={meaning}
                    />
                  </View>
                ))}
              </View>
            )}

            {usageNotes.length > 0 && (
              <View style={[themed($detailExamples), isDesktopDetailLayout && desktopDetailStyles.sectionWrap]}>
                <Text
                  style={[
                    themed($detailSectionLabel),
                    isDesktopDetailLayout && desktopDetailStyles.detailSectionLabel,
                  ]}
                  text={translate("vocabulary:detail.usageNotes")}
                />
                {usageNotes.map((note, index) => (
                  <View key={`${entry?.id ?? "entry"}-note-${index}`} style={themed($detailExampleRow)}>
                    <Text
                      style={[
                        themed($detailExampleIndex),
                        isDesktopDetailLayout && desktopDetailStyles.detailExampleIndex,
                      ]}
                      text={`${index + 1}.`}
                    />
                    <Text
                      style={[
                        themed($detailExampleText),
                        isDesktopDetailLayout && desktopDetailStyles.detailExampleText,
                      ]}
                      text={note}
                    />
                  </View>
                ))}
              </View>
            )}

            <View style={[themed($sectionWrap), isDesktopDetailLayout && desktopDetailStyles.sectionWrap]}>
              <Text
                style={[
                  themed($detailSectionLabel),
                  isDesktopDetailLayout && desktopDetailStyles.detailSectionLabel,
                ]}
                text={translate("vocabulary:detail.stats")}
              />
              <Text
                style={[themed($sectionText), isDesktopDetailLayout && desktopDetailStyles.sectionText]}
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
                      style={[
                        themed($reportIssueButtonText),
                        isDesktopDetailLayout && desktopDetailStyles.reportIssueButtonText,
                      ]}
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
                    <Icon icon="x" size={12} color={theme.colors.error} />
                    <Text
                      style={[
                        themed($deleteItemButtonText),
                        isDesktopDetailLayout && desktopDetailStyles.deleteItemButtonText,
                      ]}
                      text={translate("vocabulary:detail.deleteWord")}
                      numberOfLines={1}
                    />
                  </Pressable>
                </View>
              ) : null}
            </View>
          </ScrollView>

          <View
            style={[
              themed([$detailCtaContainer, $bottomInsets]),
              isDesktopDetailLayout && desktopDetailStyles.detailCtaContainer,
            ]}
          >
            {showRepeatUi && repeatProgress && !isDesktopShell && (
              <View style={themed($repeatReviewWrap)}>
                <Text
                  style={[
                    themed($repeatReviewDueText),
                    isDesktopDetailLayout && desktopDetailStyles.repeatReviewDueText,
                  ]}
                  text={translate("vocabulary:detail.currentPlan", { due: repeatDueLabel })}
                />
                <View style={themed($repeatReviewActions)}>
                  {repeatReviewOptions.map((option) => (
                    <Pressable
                      key={`repeat-review-${option.grade}`}
                      onPress={() => {
                        void handleRepeatReview(option.grade)
                      }}
                      disabled={isCtaDisabled}
                      accessibilityRole="button"
                      accessibilityLabel={translate("vocabulary:detail.reviewOptionAccessibility", {
                        title: option.title,
                        delay: option.delayLabel,
                      })}
                      style={({ pressed }) => [
                        themed($repeatReviewButton),
                        option.grade === "forgot" && themed($repeatReviewButtonForgot),
                        option.grade === "hard" && themed($repeatReviewButtonHard),
                        option.grade === "good" && themed($repeatReviewButtonGood),
                        isCtaDisabled && themed($repeatReviewButtonDisabled),
                        pressed && !isCtaDisabled && themed($repeatReviewButtonPressed),
                      ]}
                    >
                      <Text
                        style={[
                          themed($repeatReviewButtonPrimaryText),
                          isDesktopDetailLayout && desktopDetailStyles.repeatReviewButtonPrimaryText,
                        ]}
                        text={option.title}
                      />
                      <Text
                        style={[
                          themed($repeatReviewButtonSecondaryText),
                          isDesktopDetailLayout && desktopDetailStyles.repeatReviewButtonSecondaryText,
                        ]}
                        text={`+${option.delayLabel}`}
                      />
                    </Pressable>
                  ))}
                </View>
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
                  isDesktopDetailLayout && desktopDetailStyles.detailSecondaryButton,
                  pressed && themed($detailCreditCtaButtonPressed),
                ]}
              >
                <Text
                  style={[
                    themed($detailCreditCtaText),
                    isDesktopDetailLayout && desktopDetailStyles.detailSecondaryButtonText,
                  ]}
                  text={creditCtaLabel}
                />
              </Pressable>
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
                  isDesktopDetailLayout && desktopDetailStyles.detailSecondaryButton,
                  isRequestingInsight && themed($detailSecondaryCtaButtonLoading),
                  isCtaDisabled && themed($detailSecondaryCtaButtonDisabled),
                  pressed && !isCtaDisabled && themed($detailSecondaryCtaButtonPressed),
                ]}
              >
                {isRequestingInsight ? (
                  <View style={themed($advancedButtonContent)}>
                    <ActivityIndicator size="small" color={showroomColors.textStrong} />
                    <Text
                      style={[
                        themed($advancedLoadingTitle),
                        isDesktopDetailLayout && desktopDetailStyles.advancedLoadingTitle,
                      ]}
                      text={translate("vocabulary:detail.runAdvanced")}
                      numberOfLines={1}
                    />
                  </View>
                ) : (
                  <View style={themed($advancedButtonContent)}>
                    <Text
                      style={[
                        themed($detailSecondaryCtaText),
                        isDesktopDetailLayout && desktopDetailStyles.detailSecondaryButtonText,
                      ]}
                      text={translate("vocabulary:detail.runAdvanced")}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.82}
                    />
                  </View>
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
                isDesktopDetailLayout && desktopDetailStyles.detailPrimaryButton,
                isCtaDisabled && themed($detailCtaButtonDisabled),
                pressed && !isCtaDisabled && themed($detailCtaButtonPressed),
              ]}
            >
              {isUpdatingStatus ? (
                <ActivityIndicator size="small" color={showroomColors.accentText} />
              ) : (
                <Text
                  style={[themed($detailCtaText), isDesktopDetailLayout && desktopDetailStyles.detailPrimaryButtonText]}
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
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
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
  fontFamily: typography.code?.normal ?? typography.primary.medium,
  fontSize: 13,
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

const $repeatReviewActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  paddingHorizontal: spacing.xxxs,
})

const $repeatReviewButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  minWidth: 0,
  minHeight: 58,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1.5,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  marginHorizontal: 0,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xs,
})

const $repeatReviewButtonForgot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.palette.accent500,
})

const $repeatReviewButtonHard: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.palette.secondary400,
})

const $repeatReviewButtonGood: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.accent,
})

const $repeatReviewButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $repeatReviewButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.45,
})

const $repeatReviewButtonPrimaryText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $repeatReviewButtonSecondaryText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 11,
  color: colors.vocabularyShowroom.textStrong,
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
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : colors.vocabularyShowroom.accentPressed,
  borderColor: isDark ? colors.vocabularyShowroom.ctaOutlinePressed : colors.vocabularyShowroom.accentPressed,
})

const $detailCtaText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  textAlign: "center",
  color: "#FFFFFF",
})

const $detailSecondaryCtaButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 48,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
  marginBottom: spacing.sm,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  overflow: "hidden",
})

const $detailSecondaryCtaButtonLoading: ThemedStyle<ViewStyle> = ({ colors }) => ({
  minHeight: 48,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $detailSecondaryCtaButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.7,
})

const $detailSecondaryCtaButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $detailSecondaryCtaText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  textAlign: "center",
  color: colors.vocabularyShowroom.textStrong,
})

const $advancedButtonContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
  minHeight: 20,
})

const $advancedLoadingTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
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

const desktopDetailStyles = StyleSheet.create({
  detailHeader: {
    paddingTop: 24,
    paddingHorizontal: 28,
  },
  detailScrollContent: {
    paddingTop: 28,
    paddingHorizontal: 40,
    paddingBottom: 180,
  },
  detailWord: {
    fontSize: 56,
    lineHeight: 64,
    maxWidth: 760,
  },
  detailPronunciationPill: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  detailPronunciationText: {
    fontSize: 15,
  },
  detailPronunciationError: {
    fontSize: 13,
  },
  detailMetaText: {
    marginTop: 14,
    fontSize: 14,
    letterSpacing: 0.6,
  },
  detailDefinition: {
    marginTop: 22,
    maxWidth: 820,
    fontSize: 21,
    lineHeight: 33,
  },
  detailNativeMeaning: {
    marginTop: 10,
    maxWidth: 760,
    fontSize: 17,
    lineHeight: 26,
  },
  sectionWrap: {
    marginTop: 28,
  },
  detailSectionLabel: {
    fontSize: 13,
    letterSpacing: 1.3,
  },
  sectionText: {
    marginTop: 12,
    fontSize: 18,
    lineHeight: 30,
  },
  detailExampleIndex: {
    width: 28,
    fontSize: 16,
  },
  detailExampleText: {
    fontSize: 18,
    lineHeight: 30,
  },
  synonymText: {
    fontSize: 14,
  },
  emptySectionText: {
    marginTop: 12,
    fontSize: 16,
  },
  reportIssueButtonText: {
    fontSize: 13,
  },
  deleteItemButtonText: {
    fontSize: 13,
  },
  detailCtaContainer: {
    paddingHorizontal: 28,
    paddingTop: 14,
    paddingBottom: 22,
  },
  repeatReviewDueText: {
    fontSize: 14,
  },
  repeatReviewButtonPrimaryText: {
    fontSize: 14,
  },
  repeatReviewButtonSecondaryText: {
    fontSize: 12,
  },
  detailSecondaryButton: {
    minHeight: 56,
    paddingHorizontal: 22,
  },
  detailSecondaryButtonText: {
    fontSize: 17,
  },
  detailPrimaryButton: {
    minHeight: 56,
  },
  detailPrimaryButtonText: {
    fontSize: 18,
  },
  advancedLoadingTitle: {
    fontSize: 17,
  },
})
