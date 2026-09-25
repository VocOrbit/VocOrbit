import { FC, useCallback, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import i18next from "i18next"

import { Icon } from "@/components/Icon"
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
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

type ProfileWeeklyAnalyticsScreenProps = AppStackScreenProps<"ProfileWeeklyAnalytics">
type AnalyticsModeFilter = ExerciseAnalyticsMode

const MODE_OPTIONS: Array<{
  value: AnalyticsModeFilter
  label: () => string
}> = [
  { value: "all", label: () => translate("vocabulary:weeklyAnalytics.modeAll") },
  { value: "basic", label: () => translate("vocabulary:weeklyAnalytics.modeBasic") },
  { value: "advanced", label: () => translate("vocabulary:weeklyAnalytics.modeAdvanced") },
]

function getQuestionTypeLabel(type: ExerciseQuestionType): string {
  if (type === "meaning_match") return translate("vocabulary:weeklyAnalytics.questionTypeMeaningMatch")
  if (type === "guess_word") return translate("vocabulary:weeklyAnalytics.questionTypeGuessWord")
  if (type === "fill_in_gap") return translate("vocabulary:weeklyAnalytics.questionTypeFillInGap")
  return translate("vocabulary:weeklyAnalytics.questionTypeMatchSynonym")
}

function resolveErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") return translate("vocabulary:weeklyAnalytics.errors.unauthorized")
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:weeklyAnalytics.errors.cannotConnect")
  }
  return translate("vocabulary:weeklyAnalytics.errors.loadFailed")
}

function formatDateLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`)
  return new Intl.DateTimeFormat(i18next.language || "en", { weekday: "short", day: "numeric" }).format(
    parsed,
  )
}

export const ProfileWeeklyAnalyticsScreen: FC<ProfileWeeklyAnalyticsScreenProps> = ({
  navigation,
}) => {
  const { themed, theme } = useAppTheme()
  const { logout } = useAuth()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const [selectedMode, setSelectedMode] = useState<AnalyticsModeFilter>("all")
  const [analytics, setAnalytics] = useState<ExerciseWeeklyAnalytics | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const loadAnalytics = useCallback(
    async (mode: AnalyticsModeFilter) => {
      setIsLoading(true)
      setErrorMessage(undefined)

      const response = await exercisesApi.getWeeklyAnalytics({
        mode: mode === "all" ? undefined : mode,
        timezoneOffsetMinutes: -new Date().getTimezoneOffset(),
      })

      if (response.kind === "ok") {
        setAnalytics(response.data)
        setIsLoading(false)
        return
      }

      setAnalytics(undefined)
      setIsLoading(false)
      setErrorMessage(resolveErrorMessage(response))
      if (response.kind === "unauthorized") {
        logout()
      }
    },
    [logout],
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
          <View style={themed($headerSpacer)} />
        </View>

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
                accessibilityLabel={translate("vocabulary:weeklyAnalytics.accessibility.filterByMode", {
                  mode: option.label(),
                })}
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themed([$scrollContent, $bottomInsets])}
        >
          {isLoading ? (
            <View style={themed($stateCard)}>
              <ActivityIndicator size="small" color={showroomColors.textStrong} />
              <Text style={themed($stateText)} text={translate("vocabulary:weeklyAnalytics.loading")} />
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
                <Text style={themed($retryButtonText)} text={translate("vocabulary:common.retry")} />
              </Pressable>
            </View>
          ) : analytics ? (
            <>
              <View style={themed($summaryCard)}>
                <Text style={themed($sectionTitle)} text={translate("vocabulary:weeklyAnalytics.summaryTitle")} />
                <View style={themed($summaryGrid)}>
                  <View style={themed($summaryItem)}>
                    <Text style={themed($summaryValue)} text={`${analytics.summary.sessionsCreated}`} />
                    <Text style={themed($summaryLabel)} text={translate("vocabulary:weeklyAnalytics.sessions")} />
                  </View>
                  <View style={themed($summaryItem)}>
                    <Text style={themed($summaryValue)} text={`${analytics.summary.sessionsCompleted}`} />
                    <Text style={themed($summaryLabel)} text={translate("vocabulary:weeklyAnalytics.completed")} />
                  </View>
                  <View style={themed($summaryItem)}>
                    <Text style={themed($summaryValue)} text={`${analytics.summary.answeredQuestions}`} />
                    <Text style={themed($summaryLabel)} text={translate("vocabulary:weeklyAnalytics.answered")} />
                  </View>
                  <View style={themed($summaryItem)}>
                    <Text style={themed($summaryValue)} text={`${analytics.summary.accuracyPercent}%`} />
                    <Text style={themed($summaryLabel)} text={translate("vocabulary:weeklyAnalytics.accuracy")} />
                  </View>
                  <View style={themed($summaryItem)}>
                    <Text style={themed($summaryValue)} text={`${analytics.summary.activeDays}`} />
                    <Text style={themed($summaryLabel)} text={translate("vocabulary:weeklyAnalytics.activeDays")} />
                  </View>
                  <View style={themed($summaryItem)}>
                    <Text style={themed($summaryValue)} text={`${analytics.summary.streakDays}`} />
                    <Text style={themed($summaryLabel)} text={translate("vocabulary:weeklyAnalytics.streak")} />
                  </View>
                </View>
              </View>

              <View style={themed($sectionCard)}>
                <Text style={themed($sectionTitle)} text={translate("vocabulary:weeklyAnalytics.dailyTrend")} />
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
                <Text style={themed($sectionTitle)} text={translate("vocabulary:weeklyAnalytics.byQuestionType")} />
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
                <Text style={themed($sectionTitle)} text={translate("vocabulary:weeklyAnalytics.byMode")} />
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

              <View style={themed($sectionCard)}>
                <Text style={themed($sectionTitle)} text={translate("vocabulary:weeklyAnalytics.weakItems")} />
                {analytics.weakItems.length === 0 ? (
                  <Text
                    style={themed($emptyWeakText)}
                    text={translate("vocabulary:weeklyAnalytics.noWeakItems")}
                  />
                ) : (
                  analytics.weakItems.map((item) => (
                    <View key={item.itemId} style={themed($weakItemRow)}>
                      <Text style={themed($weakPrompt)} text={item.prompt} />
                      <Text
                        style={themed($weakMeta)}
                        text={translate("vocabulary:weeklyAnalytics.weakItemMeta", {
                          wrongAnswers: item.wrongAnswers,
                          accuracyPercent: item.accuracyPercent,
                        })}
                      />
                    </View>
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

const $modeRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  flexDirection: "row",
  gap: spacing.xs,
})

const $modeChip: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 36,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.md,
  alignItems: "center",
  justifyContent: "center",
})

const $modeChipSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accent,
  borderColor: colors.vocabularyShowroom.accent,
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
  color: "#FFFFFF",
})

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
  paddingBottom: spacing.xl,
  gap: spacing.sm,
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
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
})

const $summaryCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 16,
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
