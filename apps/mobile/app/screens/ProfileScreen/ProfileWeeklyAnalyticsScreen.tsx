import { FC, useCallback, useMemo, useRef, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import i18next from "i18next"

import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { Icon, type IconTypes } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import {
  exercisesApi,
  type ExerciseAnalyticsMode,
  type ExerciseQuestionType,
  type ExerciseWeeklyAnalytics,
} from "@/services/api/exercisesApi"
import {
  wordInsightApi,
  type WordInsightLearningItemMasterySummary,
} from "@/services/api/wordInsightApi"
import { getRepeatDueWordCount } from "@/services/repeat/repeatService"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

type ProfileWeeklyAnalyticsScreenProps = AppStackScreenProps<"ProfileWeeklyAnalytics">
type AnalyticsModeFilter = ExerciseAnalyticsMode
type MasteryPathTone = "active" | "done" | "muted"
type MasteryPathAction = "review" | "weak"

const MODE_OPTIONS: Array<{
  value: AnalyticsModeFilter
  label: () => string
}> = [
  { value: "all", label: () => translate("vocabulary:weeklyAnalytics.modeAll") },
  { value: "basic", label: () => translate("vocabulary:weeklyAnalytics.modeBasic") },
  { value: "advanced", label: () => translate("vocabulary:weeklyAnalytics.modeAdvanced") },
]
function getQuestionTypeLabel(type: ExerciseQuestionType): string {
  if (type === "meaning_match")
    return translate("vocabulary:weeklyAnalytics.questionTypeMeaningMatch")
  if (type === "guess_word") return translate("vocabulary:weeklyAnalytics.questionTypeGuessWord")
  if (type === "fill_in_gap") return translate("vocabulary:weeklyAnalytics.questionTypeFillInGap")
  return translate("vocabulary:weeklyAnalytics.questionTypeMatchSynonym")
}

function resolveErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized")
    return translate("vocabulary:weeklyAnalytics.errors.unauthorized")
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:weeklyAnalytics.errors.cannotConnect")
  }
  return translate("vocabulary:weeklyAnalytics.errors.loadFailed")
}

function formatDateLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`)
  return new Intl.DateTimeFormat(i18next.language || "en", {
    weekday: "short",
    day: "numeric",
  }).format(parsed)
}

function resolveMasteryActionText(input: {
  repeatDueWordCount: number
  weakItemCount: number
  activeItemCount: number
}): string {
  if (input.repeatDueWordCount > 0) {
    return translate("vocabulary:weeklyAnalytics.masteryActionRepeat", {
      count: input.repeatDueWordCount,
    })
  }
  if (input.weakItemCount > 0) {
    return translate("vocabulary:weeklyAnalytics.masteryActionWeak", {
      count: input.weakItemCount,
    })
  }
  if (input.activeItemCount > 0) {
    return translate("vocabulary:weeklyAnalytics.masteryActionStable")
  }
  return translate("vocabulary:weeklyAnalytics.masteryActionEmpty")
}

function getMasteryPrimaryActionText(input: {
  repeatDueWordCount: number
  weakItemCount: number
  activeItemCount: number
}): string {
  if (input.repeatDueWordCount > 0) {
    return translate("vocabulary:weeklyAnalytics.startDailyReview")
  }
  if (input.weakItemCount >= 2 || input.activeItemCount >= 2) {
    return translate("vocabulary:weeklyAnalytics.startPractice")
  }
  return translate("vocabulary:weeklyAnalytics.addWords")
}

export const ProfileWeeklyAnalyticsScreen: FC<ProfileWeeklyAnalyticsScreenProps> = ({
  navigation,
}) => {
  const { themed, theme } = useAppTheme()
  const { logout, userId } = useAuth()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const scrollRef = useRef<ScrollView>(null)
  const weakItemsYRef = useRef(0)
  const [selectedMode, setSelectedMode] = useState<AnalyticsModeFilter>("all")
  const [analytics, setAnalytics] = useState<ExerciseWeeklyAnalytics | undefined>(undefined)
  const [masterySummary, setMasterySummary] = useState<
    WordInsightLearningItemMasterySummary | undefined
  >(undefined)
  const [repeatDueWordCount, setRepeatDueWordCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const loadAnalytics = useCallback(
    async (mode: AnalyticsModeFilter) => {
      setIsLoading(true)
      setErrorMessage(undefined)
      setRepeatDueWordCount(getRepeatDueWordCount(userId))

      const [analyticsResponse, masteryResponse] = await Promise.all([
        exercisesApi.getWeeklyAnalytics({
          mode: mode === "all" ? undefined : mode,
          timezoneOffsetMinutes: -new Date().getTimezoneOffset(),
        }),
        wordInsightApi.getLearningItemMasterySummary(),
      ])

      if (masteryResponse.kind === "ok") {
        setMasterySummary(masteryResponse.data)
      } else {
        setMasterySummary(undefined)
        if (masteryResponse.kind === "unauthorized") {
          logout()
        }
      }

      if (analyticsResponse.kind === "ok") {
        setAnalytics(analyticsResponse.data)
        setIsLoading(false)
        return
      }

      setAnalytics(undefined)
      setIsLoading(false)
      setErrorMessage(resolveErrorMessage(analyticsResponse))
      if (analyticsResponse.kind === "unauthorized") {
        logout()
      }
    },
    [logout, userId],
  )

  useFocusEffect(
    useCallback(() => {
      void loadAnalytics(selectedMode)
    }, [loadAnalytics, selectedMode]),
  )

  const maxAnsweredInDay = useMemo(() => {
    const values = analytics?.daily.map((day) => day.answeredQuestions) ?? []
    return Math.max(...values, 0)
  }, [analytics])
  const weakItemCount = analytics?.weakItems.length ?? 0
  const firstWeakItemId = analytics?.weakItems[0]?.itemId
  const activeItemCount = masterySummary?.activeItemCount ?? 0
  const learnedItemCount = masterySummary?.learnedItemCount ?? 0
  const totalItemCount = masterySummary?.totalItemCount ?? activeItemCount + learnedItemCount
  const masteryProgress = totalItemCount > 0 ? Math.min(learnedItemCount / totalItemCount, 1) : 0
  const masteryProgressWidth: `${number}%` = `${Math.round(masteryProgress * 100)}%`
  const masteryProgressLabel = `${Math.round(masteryProgress * 100)}%`
  const masteryPrimaryActionText = getMasteryPrimaryActionText({
    repeatDueWordCount,
    weakItemCount,
    activeItemCount,
  })
  const masteryPathSteps: Array<{
    id: string
    title: string
    subtitle: string
    meta: string
    icon: IconTypes
    tone: MasteryPathTone
    action: MasteryPathAction
    enabled: boolean
  }> = [
    {
      id: "review",
      title: translate("vocabulary:weeklyAnalytics.pathReviewTitle"),
      subtitle:
        repeatDueWordCount > 0
          ? translate("vocabulary:weeklyAnalytics.pathReviewReady", { count: repeatDueWordCount })
          : translate("vocabulary:weeklyAnalytics.pathReviewEmpty"),
      meta: translate("vocabulary:weeklyAnalytics.pathCount", { count: repeatDueWordCount }),
      icon: "bell",
      tone: repeatDueWordCount > 0 ? "active" : "muted",
      action: "review",
      enabled: repeatDueWordCount > 0,
    },
    {
      id: "weak",
      title: translate("vocabulary:weeklyAnalytics.pathWeakTitle"),
      subtitle:
        weakItemCount > 0
          ? translate("vocabulary:weeklyAnalytics.pathWeakReady", { count: weakItemCount })
          : translate("vocabulary:weeklyAnalytics.pathWeakEmpty"),
      meta: translate("vocabulary:weeklyAnalytics.pathCount", { count: weakItemCount }),
      icon: "view",
      tone: weakItemCount > 0 && repeatDueWordCount === 0 ? "active" : "muted",
      action: "weak",
      enabled: weakItemCount > 0,
    },
  ]

  const handlePrimaryMasteryAction = useCallback(() => {
    if (repeatDueWordCount > 0) {
      navigation.navigate("VocabularyRepeatSession")
      return
    }

    if (weakItemCount >= 2 || activeItemCount >= 2) {
      navigation.navigate("VocabularyPractice")
      return
    }

    navigation.navigate("VocabularyShowroomScreen", { openVocabularyAll: true })
  }, [activeItemCount, navigation, repeatDueWordCount, weakItemCount])

  const handleMasteryPathStepPress = useCallback(
    (action: MasteryPathAction) => {
      if (action === "review") {
        if (repeatDueWordCount > 0) navigation.navigate("VocabularyRepeatSession")
        return
      }

      if (action === "weak") {
        if (weakItemsYRef.current > 0) {
          scrollRef.current?.scrollTo({
            y: Math.max(weakItemsYRef.current - theme.spacing.md, 0),
            animated: true,
          })
          return
        }
        if (firstWeakItemId) navigation.navigate("VocabularyDetail", { entryId: firstWeakItemId })
        return
      }
    },
    [firstWeakItemId, navigation, repeatDueWordCount, theme.spacing.md],
  )

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      backgroundColor={showroomColors.background}
      systemBarStyle={theme.isDark ? "light" : "dark"}
      contentContainerStyle={themed($screenContent)}
    >
      <View pointerEvents="none" style={themed($glowTop)} />
      <View pointerEvents="none" style={themed($glowBottom)} />

      <View style={themed($layout)}>
        <View style={themed($headerRow)}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:weeklyAnalytics.accessibility.goBack")}
            style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
            hitSlop={6}
          >
            <Icon icon="back" size={16} color={showroomColors.textStrong} />
          </Pressable>
          <Text style={themed($headerTitle)} text={translate("vocabulary:weeklyAnalytics.title")} />
          <View style={themed($headerSpacer)}>
            <AppTutorialVideoButton
              screen="profile_weekly_analytics"
              placement="overview"
              variant="help"
              containerStyle={themed($iconButton)}
            />
          </View>
        </View>

        <AppTutorialVideoButton
          screen="profile_weekly_analytics"
          placement="overview"
          variant="banner"
          hideAfterSeen
          containerStyle={{ marginBottom: theme.spacing.md }}
        />

        <View style={themed($modeRow)}>
          {MODE_OPTIONS.map((option) => {
            const selected = option.value === selectedMode
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  if (selectedMode === option.value) return
                  setSelectedMode(option.value)
                }}
                accessibilityRole="button"
                accessibilityLabel={translate(
                  "vocabulary:weeklyAnalytics.accessibility.filterByMode",
                  {
                    mode: option.label(),
                  },
                )}
                style={({ pressed }) => [
                  themed($modeChip),
                  selected && themed($modeChipSelected),
                  pressed && !selected && themed($modeChipPressed),
                ]}
              >
                <Text
                  style={selected ? themed($modeChipTextSelected) : themed($modeChipText)}
                  text={option.label()}
                />
              </Pressable>
            )
          })}
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themed([$scrollContent, $bottomInsets])}
        >
          {isLoading ? (
            <View style={themed($stateCard)}>
              <ActivityIndicator size="small" color={showroomColors.textStrong} />
              <Text
                style={themed($stateText)}
                text={translate("vocabulary:weeklyAnalytics.loading")}
              />
            </View>
          ) : errorMessage ? (
            <View style={themed($stateCard)}>
              <Text style={themed($stateErrorText)} text={errorMessage} />
              <Pressable
                onPress={() => void loadAnalytics(selectedMode)}
                accessibilityRole="button"
                accessibilityLabel={translate("vocabulary:weeklyAnalytics.accessibility.retry")}
                style={({ pressed }) => [
                  themed($retryButton),
                  pressed && themed($retryButtonPressed),
                ]}
              >
                <Text
                  style={themed($retryButtonText)}
                  text={translate("vocabulary:common.retry")}
                />
              </Pressable>
            </View>
          ) : analytics ? (
            <>
              <View style={themed($masteryHeroCard)}>
                <View style={themed($masteryHeroIconWrap)}>
                  <Icon icon="components" size={28} color={showroomColors.accentText} />
                </View>
                <Text
                  style={themed($masteryHeroTitle)}
                  text={translate("vocabulary:weeklyAnalytics.title")}
                />
                <Text
                  style={themed($masteryHeroMessage)}
                  text={resolveMasteryActionText({
                    repeatDueWordCount,
                    weakItemCount,
                    activeItemCount,
                  })}
                />

                <View style={themed($masteryHeroProgressHeader)}>
                  <Text
                    style={themed($masteryHeroProgressLabel)}
                    text={translate("vocabulary:weeklyAnalytics.masteryTitle")}
                  />
                  <Text style={themed($masteryHeroProgressValue)} text={masteryProgressLabel} />
                </View>
                <View style={themed($masteryHeroTrack)}>
                  <View style={[themed($masteryHeroFill), { width: masteryProgressWidth }]} />
                </View>

                <Pressable
                  onPress={handlePrimaryMasteryAction}
                  accessibilityRole="button"
                  accessibilityLabel={masteryPrimaryActionText}
                  style={({ pressed }) => [
                    themed($masteryPrimaryButton),
                    pressed && themed($masteryPrimaryButtonPressed),
                  ]}
                >
                  <Text style={themed($masteryPrimaryButtonText)} text={masteryPrimaryActionText} />
                </Pressable>
              </View>

              <View style={themed($masteryPathCard)}>
                <View style={themed($masteryPathHeader)}>
                  <Text
                    style={themed($sectionTitle)}
                    text={translate("vocabulary:weeklyAnalytics.learningPathTitle")}
                  />
                  <Text
                    style={themed($sectionSubTitle)}
                    text={translate("vocabulary:weeklyAnalytics.learningPathSubtitle")}
                  />
                </View>

                <View style={themed($masteryPathList)}>
                  {masteryPathSteps.map((step) => (
                    <MasteryPathStep
                      key={step.id}
                      title={step.title}
                      subtitle={step.subtitle}
                      meta={step.meta}
                      icon={step.icon}
                      tone={step.tone}
                      onPress={
                        step.enabled ? () => handleMasteryPathStepPress(step.action) : undefined
                      }
                    />
                  ))}
                </View>
              </View>

              <View style={themed($sectionCard)}>
                <View style={themed($topGroupsWrap)}>
                  <Text
                    style={themed($topGroupsTitle)}
                    text={translate("vocabulary:weeklyAnalytics.strongestGroups")}
                  />
                  {(masterySummary?.topGroups ?? []).length === 0 ? (
                    <Text
                      style={themed($topGroupsEmpty)}
                      text={translate("vocabulary:weeklyAnalytics.noStrongGroups")}
                    />
                  ) : (
                    (masterySummary?.topGroups ?? []).map((group) => (
                      <View key={group.id} style={themed($topGroupRow)}>
                        <Text style={themed($topGroupName)} text={group.name} />
                        <Text
                          style={themed($topGroupMeta)}
                          text={translate("vocabulary:weeklyAnalytics.groupStrengthMeta", {
                            count: group.itemCount,
                            learned: group.learnedItemCount,
                          })}
                        />
                      </View>
                    ))
                  )}
                </View>
              </View>

              <View style={themed($summaryCard)}>
                <Text
                  style={themed($sectionTitle)}
                  text={translate("vocabulary:weeklyAnalytics.summaryTitle")}
                />
                <View style={themed($summaryGrid)}>
                  <View style={themed($summaryItem)}>
                    <Text
                      style={themed($summaryValue)}
                      text={`${analytics.summary.sessionsCreated}`}
                    />
                    <Text
                      style={themed($summaryLabel)}
                      text={translate("vocabulary:weeklyAnalytics.sessions")}
                    />
                  </View>
                  <View style={themed($summaryItem)}>
                    <Text
                      style={themed($summaryValue)}
                      text={`${analytics.summary.sessionsCompleted}`}
                    />
                    <Text
                      style={themed($summaryLabel)}
                      text={translate("vocabulary:weeklyAnalytics.completed")}
                    />
                  </View>
                  <View style={themed($summaryItem)}>
                    <Text
                      style={themed($summaryValue)}
                      text={`${analytics.summary.answeredQuestions}`}
                    />
                    <Text
                      style={themed($summaryLabel)}
                      text={translate("vocabulary:weeklyAnalytics.answered")}
                    />
                  </View>
                  <View style={themed($summaryItem)}>
                    <Text
                      style={themed($summaryValue)}
                      text={`${analytics.summary.accuracyPercent}%`}
                    />
                    <Text
                      style={themed($summaryLabel)}
                      text={translate("vocabulary:weeklyAnalytics.accuracy")}
                    />
                  </View>
                  <View style={themed($summaryItem)}>
                    <Text style={themed($summaryValue)} text={`${analytics.summary.activeDays}`} />
                    <Text
                      style={themed($summaryLabel)}
                      text={translate("vocabulary:weeklyAnalytics.activeDays")}
                    />
                  </View>
                  <View style={themed($summaryItem)}>
                    <Text style={themed($summaryValue)} text={`${analytics.summary.streakDays}`} />
                    <Text
                      style={themed($summaryLabel)}
                      text={translate("vocabulary:weeklyAnalytics.streak")}
                    />
                  </View>
                </View>
              </View>

              <View style={themed($sectionCard)}>
                <Text
                  style={themed($sectionTitle)}
                  text={translate("vocabulary:weeklyAnalytics.dailyTrend")}
                />
                {analytics.daily.map((day) => {
                  const answeredWidth: `${number}%` =
                    maxAnsweredInDay > 0
                      ? `${Math.round((day.answeredQuestions / maxAnsweredInDay) * 100)}%`
                      : "0%"
                  return (
                    <View key={day.date} style={themed($dailyRow)}>
                      <View style={themed($dailyLabelWrap)}>
                        <Text style={themed($dailyDate)} text={formatDateLabel(day.date)} />
                        <Text
                          style={themed($dailyMeta)}
                          text={`${day.correctAnswers}/${day.answeredQuestions} · ${day.accuracyPercent}%`}
                        />
                      </View>
                      <View style={themed($dailyBarTrack)}>
                        <View style={[themed($dailyBarFill), { width: answeredWidth }]} />
                      </View>
                    </View>
                  )
                })}
              </View>

              <View style={themed($sectionCard)}>
                <Text
                  style={themed($sectionTitle)}
                  text={translate("vocabulary:weeklyAnalytics.byQuestionType")}
                />
                {analytics.byType.map((entry) => (
                  <View key={entry.type} style={themed($statRow)}>
                    <Text style={themed($statLabel)} text={getQuestionTypeLabel(entry.type)} />
                    <Text
                      style={themed($statValue)}
                      text={`${entry.correctAnswers}/${entry.answeredQuestions} (${entry.accuracyPercent}%)`}
                    />
                  </View>
                ))}
              </View>

              <View style={themed($sectionCard)}>
                <Text
                  style={themed($sectionTitle)}
                  text={translate("vocabulary:weeklyAnalytics.byMode")}
                />
                {analytics.byMode.map((entry) => (
                  <View key={entry.mode} style={themed($statRow)}>
                    <Text
                      style={themed($statLabel)}
                      text={
                        entry.mode === "basic"
                          ? translate("vocabulary:weeklyAnalytics.modeBasic")
                          : translate("vocabulary:weeklyAnalytics.modeAdvanced")
                      }
                    />
                    <Text
                      style={themed($statValue)}
                      text={`${entry.correctAnswers}/${entry.answeredQuestions} (${entry.accuracyPercent}%)`}
                    />
                  </View>
                ))}
              </View>

              <View
                style={themed($sectionCard)}
                onLayout={(event) => {
                  weakItemsYRef.current = event.nativeEvent.layout.y
                }}
              >
                <Text
                  style={themed($sectionTitle)}
                  text={translate("vocabulary:weeklyAnalytics.weakItems")}
                />
                {analytics.weakItems.length === 0 ? (
                  <Text
                    style={themed($emptyWeakText)}
                    text={translate("vocabulary:weeklyAnalytics.noWeakItems")}
                  />
                ) : (
                  analytics.weakItems.map((item) => (
                    <Pressable
                      key={item.itemId}
                      accessibilityRole="button"
                      accessibilityLabel={translate(
                        "vocabulary:weeklyAnalytics.accessibility.openWeakItem",
                        { word: item.prompt },
                      )}
                      onPress={() =>
                        navigation.navigate("VocabularyDetail", { entryId: item.itemId })
                      }
                      style={({ pressed }) => [
                        themed($weakItemRow),
                        pressed && themed($weakItemRowPressed),
                      ]}
                    >
                      <Text style={themed($weakPrompt)} text={item.prompt} />
                      <Text
                        style={themed($weakMeta)}
                        text={translate("vocabulary:weeklyAnalytics.weakItemMeta", {
                          wrongAnswers: item.wrongAnswers,
                          accuracyPercent: item.accuracyPercent,
                        })}
                      />
                    </Pressable>
                  ))
                )}
              </View>
            </>
          ) : null}
        </ScrollView>
      </View>
    </Screen>
  )
}

const MasteryPathStep: FC<{
  title: string
  subtitle: string
  meta: string
  icon: IconTypes
  tone: MasteryPathTone
  onPress?: () => void
}> = ({ title, subtitle, meta, icon, tone, onPress }) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const isActive = tone === "active"
  const isDone = tone === "done"

  const content = (
    <>
      <View
        style={[
          themed($masteryPathNode),
          isActive && themed($masteryPathNodeActive),
          isDone && themed($masteryPathNodeDone),
          !isActive && !isDone && themed($masteryPathNodeMuted),
        ]}
      >
        <Icon
          icon={icon}
          size={17}
          color={
            isActive
              ? showroomColors.accentText
              : isDone
                ? showroomColors.accent
                : showroomColors.textMuted
          }
        />
      </View>
      <View style={[themed($masteryPathStepCard), isActive && themed($masteryPathStepCardActive)]}>
        <View style={themed($masteryPathStepCopy)}>
          <Text style={themed($masteryPathStepTitle)} text={title} numberOfLines={1} />
          <Text style={themed($masteryPathStepSubtitle)} text={subtitle} numberOfLines={2} />
        </View>
        <View
          style={[themed($masteryPathMetaPill), isActive && themed($masteryPathMetaPillActive)]}
        >
          <Text
            style={isActive ? themed($masteryPathMetaTextActive) : themed($masteryPathMetaText)}
            text={meta}
            numberOfLines={1}
            adjustsFontSizeToFit
          />
        </View>
      </View>
    </>
  )

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        style={({ pressed }) => [
          themed($masteryPathStep),
          pressed && themed($masteryPathStepPressed),
        ]}
      >
        {content}
      </Pressable>
    )
  }

  return <View style={themed($masteryPathStep)}>{content}</View>
}

const $screenContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $glowTop: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: -120,
  left: -80,
  height: 260,
  width: 260,
  borderRadius: 130,
  backgroundColor: colors.vocabularyShowroom.glow,
})

const $glowBottom: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  bottom: -140,
  right: -100,
  height: 280,
  width: 280,
  borderRadius: 140,
  backgroundColor: colors.vocabularyShowroom.glow,
})

const $layout: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.lg,
})

const $headerRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $iconButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 40,
  width: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $iconButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $headerTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 22,
  color: colors.vocabularyShowroom.textStrong,
})

const $headerSpacer: ThemedStyle<ViewStyle> = () => ({
  width: 40,
})

const $modeRow: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  flexDirection: "row",
  gap: spacing.xxxs,
  borderRadius: 22,
  padding: 4,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $modeChip: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  minHeight: 36,
  borderRadius: 18,
  backgroundColor: colors.transparent,
  paddingHorizontal: spacing.xs,
  alignItems: "center",
  justifyContent: "center",
})

const $modeChipSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surface,
  shadowColor: "#000000",
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 5 },
  elevation: 2,
})

const $modeChipPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $modeChipText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $modeChipTextSelected: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
  paddingBottom: spacing.xl,
  gap: spacing.md,
})

const $stateCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.lg,
  alignItems: "center",
})

const $stateText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.vocabularyShowroom.textMuted,
})

const $stateErrorText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.error,
  textAlign: "center",
})

const $retryButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  minHeight: 42,
  borderRadius: 999,
  paddingHorizontal: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $retryButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $retryButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
  color: colors.vocabularyShowroom.accentText,
})

const $sectionCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 22,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
})

const $summaryCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 22,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  color: colors.vocabularyShowroom.textStrong,
})

const $sectionSubTitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxxs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 18,
  color: colors.vocabularyShowroom.textMuted,
})

const $masteryHeroCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 24,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  padding: spacing.lg,
  alignItems: "stretch",
  shadowColor: "#000000",
  shadowOpacity: 0.06,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 3,
})

const $masteryHeroIconWrap: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 58,
  width: 58,
  borderRadius: 21,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
  alignSelf: "center",
})

const $masteryHeroTitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.md,
  fontFamily: typography.primary.bold,
  fontSize: 29,
  lineHeight: 35,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $masteryHeroMessage: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 15,
  lineHeight: 21,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $masteryHeroProgressHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.sm,
})

const $masteryHeroProgressLabel: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flex: 1,
  minWidth: 0,
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  lineHeight: 18,
  color: colors.vocabularyShowroom.textStrong,
})

const $masteryHeroProgressValue: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 18,
  lineHeight: 23,
  color: colors.vocabularyShowroom.textStrong,
})

const $masteryHeroTrack: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.xs,
  height: 10,
  borderRadius: 999,
  overflow: "hidden",
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $masteryHeroFill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: "100%",
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $masteryPrimaryButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  minHeight: 52,
  borderRadius: 26,
  paddingHorizontal: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $masteryPrimaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $masteryPrimaryButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 16,
  color: colors.vocabularyShowroom.accentText,
})

const $masteryPathCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 24,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  padding: spacing.md,
  shadowColor: "#000000",
  shadowOpacity: 0.04,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
})

const $masteryPathHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xxs,
})

const $masteryPathList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  gap: spacing.sm,
})

const $masteryPathStep: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $masteryPathStepPressed: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.82,
})

const $masteryPathNode: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 44,
  width: 44,
  borderRadius: 22,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $masteryPathNodeActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.accent,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $masteryPathNodeDone: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.accent,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $masteryPathNodeMuted: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.outline,
})

const $masteryPathStepCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  minHeight: 76,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $masteryPathStepCardActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.accent,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $masteryPathStepCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
})

const $masteryPathStepTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textStrong,
})

const $masteryPathStepSubtitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxxs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  lineHeight: 17,
  color: colors.vocabularyShowroom.textMuted,
})

const $masteryPathMetaPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minWidth: 48,
  maxWidth: 76,
  minHeight: 32,
  borderRadius: 16,
  paddingHorizontal: spacing.xs,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $masteryPathMetaPillActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $masteryPathMetaText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 12,
  color: colors.vocabularyShowroom.textStrong,
})

const $masteryPathMetaTextActive: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 12,
  color: colors.vocabularyShowroom.accentText,
})

const $topGroupsWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $topGroupsTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $topGroupsEmpty: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $topGroupRow: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.xs,
  minHeight: 42,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.vocabularyShowroom.detailDivider,
  paddingBottom: spacing.xs,
})

const $topGroupName: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flex: 1,
  minWidth: 0,
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $topGroupMeta: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flexShrink: 0,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $summaryGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
  flexDirection: "row",
  flexWrap: "wrap",
})

const $summaryItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "33.3333%",
  paddingVertical: spacing.sm,
  alignItems: "center",
})

const $summaryValue: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 20,
  color: colors.vocabularyShowroom.textStrong,
})

const $summaryLabel: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $dailyRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $dailyLabelWrap: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "baseline",
  justifyContent: "space-between",
})

const $dailyDate: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $dailyMeta: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $dailyBarTrack: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.xxs,
  height: 8,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  overflow: "hidden",
})

const $dailyBarFill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: "100%",
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $statRow: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottomWidth: 1,
  borderBottomColor: colors.vocabularyShowroom.detailDivider,
  paddingBottom: spacing.xs,
})

const $statLabel: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $statValue: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $weakItemRow: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  padding: spacing.sm,
})

const $weakItemRowPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $weakPrompt: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $weakMeta: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $emptyWeakText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})
