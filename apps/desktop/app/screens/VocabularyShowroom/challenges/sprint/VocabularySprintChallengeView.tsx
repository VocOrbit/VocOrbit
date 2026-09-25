import { FC } from "react"
import { Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native"

import { Icon, IconTypes } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

import type {
  SprintAnswerState,
  SprintHistoryItem,
  VocabularySprintChallengeViewModel,
} from "./useVocabularySprintChallengeViewModel"

type SprintViewProps = VocabularySprintChallengeViewModel & {
  onRequestExit: () => void
  onRequestShare: () => void
}

type RuleItemProps = {
  icon: IconTypes
  label: string
}

type AnswerButtonProps = {
  label: string
  tone: "default" | "correct" | "incorrect"
  disabled: boolean
  onPress: () => void
}

type StatBadgeProps = {
  icon: IconTypes
  label: string
  tone: "correct" | "incorrect"
}

type ResultCardProps = {
  item: SprintHistoryItem
  index: number
}

const RuleItem: FC<RuleItemProps> = ({ icon, label }) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom

  return (
    <View style={themed($ruleRow)}>
      <View style={[themed($ruleIcon), { marginRight: theme.spacing.md }]}>
        <Icon icon={icon} size={16} color={showroomColors.textStrong} />
      </View>
      <Text style={themed($ruleText)} text={label} />
    </View>
  )
}

const AnswerButton: FC<AnswerButtonProps> = ({ label, tone, disabled, onPress }) => {
  const { themed } = useAppTheme()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        themed($answerButton),
        tone === "correct" && themed($answerButtonCorrect),
        tone === "incorrect" && themed($answerButtonIncorrect),
        pressed && !disabled && themed($answerButtonPressed),
      ]}
    >
      <Text style={themed($answerText)} text={label} />
    </Pressable>
  )
}

const resolveAnswerTone = (
  answerId: string,
  correctId: string,
  selectedAnswerId: string | null,
  answerState: SprintAnswerState,
) => {
  if (answerState === "idle") return "default"
  if (answerId === correctId) return "correct"
  if (answerId === selectedAnswerId) return "incorrect"
  return "default"
}

const StatBadge: FC<StatBadgeProps> = ({ icon, label, tone }) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const badgeToneStyle = tone === "correct" ? themed($badgeIconCorrect) : themed($badgeIconIncorrect)

  return (
    <View style={themed($badgeRow)}>
      <View style={[themed($badgeIcon), badgeToneStyle, { marginRight: theme.spacing.xs }]}>
        <Icon icon={icon} size={12} color={showroomColors.background} />
      </View>
      <Text style={themed($badgeText)} text={label} />
    </View>
  )
}

const ResultCard: FC<ResultCardProps> = ({ item, index }) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const isCorrect = item.status === "correct"
  const statusLabel = isCorrect ? "Correct" : "Wrong"
  const statusIcon: IconTypes = isCorrect ? "check" : "x"
  const statusStyle = isCorrect ? themed($resultStatusCorrect) : themed($resultStatusIncorrect)

  return (
    <View style={themed($resultCard)}>
      <View style={themed($resultCardHeader)}>
        <Text style={themed($resultCardIndex)} text={`Q${index + 1}`} />
        <View style={[themed($resultStatusPill), statusStyle]}>
          <View style={themed($resultStatusIcon)}>
            <Icon icon={statusIcon} size={12} color={showroomColors.background} />
          </View>
          <Text style={themed($resultStatusText)} text={statusLabel} />
        </View>
      </View>
      <Text style={themed($resultPrompt)} text={item.prompt} />
      <Text style={themed($resultMetaLabel)} text="Your answer" />
      <Text
        style={[themed($resultMetaValue), !item.selectedLabel && themed($resultMetaValueMuted)]}
        text={item.selectedLabel ?? "No answer"}
      />
      <Text style={themed($resultMetaLabel)} text="Correct answer" />
      <Text style={themed($resultMetaValue)} text={item.correctLabel ?? ""} />
    </View>
  )
}

const SprintIllustration: FC = () => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($sprintIllustration)}>
      <View style={themed($sprintWatchTop)} />
      <View style={themed($sprintWatchSide)} />
      <View style={themed($sprintWatchOuter)}>
        <View style={themed($sprintWatchInner)}>
          <View style={themed($sprintWatchFace)} />
          <View style={themed($sprintWatchHandLong)} />
          <View style={themed($sprintWatchHandShort)} />
        </View>
      </View>
      <View style={themed([$sprintPill, $sprintPillCream])} />
      <View style={themed([$sprintPill, $sprintPillGreen])} />
      <View style={themed([$sprintPill, $sprintPillCreamBottom])} />
      <View style={themed($sprintCheck)} />
    </View>
  )
}

export const VocabularySprintChallengeView: FC<SprintViewProps> = ({
  phase,
  summaryView,
  title,
  rules,
  question,
  selectedAnswerId,
  answerState,
  timeProgress,
  timeRemainingSeconds,
  isTimeLow,
  stats,
  history,
  onStart,
  onSelectAnswer,
  onShowResults,
  onShowSummary,
  onRequestExit,
  onRequestShare,
}) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])

  if (phase === "intro") {
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

        <View style={themed($introHeader)}>
          <Pressable
            onPress={onRequestExit}
            accessibilityRole="button"
            accessibilityLabel="Close Sprint"
            style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
            hitSlop={6}
          >
            <Icon icon="x" size={16} color={showroomColors.textStrong} />
          </Pressable>
        </View>

        <View style={themed($introContent)}>
          <View style={{ marginBottom: theme.spacing.lg }}>
            <SprintIllustration />
          </View>
          <Text style={[themed($introTitle), { marginBottom: theme.spacing.lg }]} text={title} />
          <View style={themed($rulesCard)}>
            {rules.map((rule, index) => (
              <View
                key={rule.id}
                style={index < rules.length - 1 ? { marginBottom: theme.spacing.md } : undefined}
              >
                <RuleItem icon={rule.icon} label={rule.label} />
              </View>
            ))}
          </View>
        </View>

        <View style={themed([$introFooter, $bottomInsets])}>
          <Pressable
            onPress={onStart}
            accessibilityRole="button"
            accessibilityLabel="Start Sprint"
            style={({ pressed }) => [themed($primaryButton), pressed && themed($primaryButtonPressed)]}
          >
            <Text style={themed($primaryButtonText)} text="Start" />
          </Pressable>
        </View>
      </Screen>
    )
  }

  if (phase === "summary") {
    if (summaryView === "results") {
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

          <View style={themed($resultsHeader)}>
            <Pressable
              onPress={onShowSummary}
              accessibilityRole="button"
              accessibilityLabel="Back to summary"
              style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
              hitSlop={6}
            >
              <Icon icon="back" size={16} color={showroomColors.textStrong} />
            </Pressable>
            <Text style={themed($resultsTitle)} text="Results" />
            <Pressable
              onPress={onRequestShare}
              accessibilityRole="button"
              accessibilityLabel="Share results"
              style={({ pressed }) => [themed($shareButton), pressed && themed($shareButtonPressed)]}
            >
              <Text style={themed($shareText)} text="Share" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={themed([$resultsContent, $bottomInsets])}
          >
            {history.length ? (
              history.map((item, index) => (
                <View
                  key={`${item.id}-${index}`}
                  style={index < history.length - 1 ? { marginBottom: theme.spacing.md } : undefined}
                >
                  <ResultCard item={item} index={index} />
                </View>
              ))
            ) : (
              <Text style={themed($resultsEmpty)} text="No results yet." />
            )}
          </ScrollView>
        </Screen>
      )
    }

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

        <View style={themed($summaryHeader)}>
          <Pressable
            onPress={onRequestExit}
            accessibilityRole="button"
            accessibilityLabel="Close Sprint"
            style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
            hitSlop={6}
          >
            <Icon icon="x" size={16} color={showroomColors.textStrong} />
          </Pressable>
          <Pressable
            onPress={onRequestShare}
            accessibilityRole="button"
            accessibilityLabel="Share results"
            style={({ pressed }) => [themed($shareButton), pressed && themed($shareButtonPressed)]}
          >
            <Text style={themed($shareText)} text="Share" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themed([$summaryContent, $bottomInsets])}
        >
          <View style={{ marginBottom: theme.spacing.lg }}>
            <SprintIllustration />
          </View>
          <Text style={[themed($summaryTitle), { marginBottom: theme.spacing.lg }]} text="Time's up!" />
          <View style={[themed($summaryCard), { marginBottom: theme.spacing.lg }]}>
            <Text style={themed($summaryScore)} text={`${stats.correct}/${stats.totalAnswered}`} />
            <Text style={themed($summarySubtitle)} text="questions correct" />
            <View style={themed($summaryBadges)}>
              <View style={{ marginRight: theme.spacing.lg }}>
                <StatBadge icon="check" label={`${stats.correct} correct`} tone="correct" />
              </View>
              <StatBadge icon="x" label={`${stats.incorrect} incorrect`} tone="incorrect" />
            </View>
          </View>
          <Pressable
            onPress={onShowResults}
            accessibilityRole="button"
            accessibilityLabel="See results"
            style={({ pressed }) => [themed($primaryButton), pressed && themed($primaryButtonPressed)]}
          >
            <Text style={themed($primaryButtonText)} text="See results" />
          </Pressable>
        </ScrollView>
      </Screen>
    )
  }

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

      <View style={themed($playHeader)}>
        <Pressable
          onPress={onRequestExit}
          accessibilityRole="button"
          accessibilityLabel="Close Sprint"
          style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
          hitSlop={6}
        >
          <Icon icon="x" size={16} color={showroomColors.textStrong} />
        </Pressable>
        <View style={themed($playStats)}>
          <View style={[themed($statPill), { marginRight: theme.spacing.sm }]}>
            <View style={{ marginRight: theme.spacing.xs }}>
              <Icon icon="components" size={14} color={showroomColors.textStrong} />
            </View>
            <Text style={themed($statPillText)} text={`${stats.score}`} />
          </View>
          <View style={[themed($statPill), isTimeLow && themed($statPillDanger)]}>
            <View style={{ marginRight: theme.spacing.xs }}>
              <Icon icon="bell" size={14} color={showroomColors.textStrong} />
            </View>
            <Text
              style={[themed($statPillText), isTimeLow && themed($statPillTextDanger)]}
              text={`${Math.max(timeRemainingSeconds, 0)}s`}
            />
          </View>
        </View>
      </View>

      <View style={themed($progressTrack)}>
        <View
          style={[
            themed($progressFill),
            { width: `${Math.round(timeProgress * 100)}%` },
            isTimeLow && themed($progressFillLow),
          ]}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={themed([$playContent, $bottomInsets])}
      >
        <View style={themed($questionStack)}>
          <View style={themed($questionCardBack)} />
          <View style={themed($questionCardMid)} />
          <View style={themed($questionCard)}>
            <Text style={themed($questionText)} text={question.prompt} />
          </View>
        </View>

        <View style={themed($answers)}>
          {question.answers.map((answer, index) => (
            <View
              key={answer.id}
              style={index < question.answers.length - 1 ? { marginBottom: theme.spacing.md } : undefined}
            >
              <AnswerButton
                label={answer.label}
                tone={resolveAnswerTone(answer.id, question.correctId, selectedAnswerId, answerState)}
                disabled={answerState !== "idle"}
                onPress={() => onSelectAnswer(answer.id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
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

const $introHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.lg,
})

const $introContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.xl,
  alignItems: "center",
  justifyContent: "flex-start",
  paddingTop: spacing.xl,
})

const $introTitle: ThemedStyle<TextStyle> = ({ typography, colors, spacing }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 28,
  color: colors.vocabularyShowroom.textStrong,
  paddingTop: spacing.xxs,
})

const $rulesCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  alignSelf: "stretch",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.lg,
  borderRadius: 22,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $ruleRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
})

const $ruleIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 36,
  width: 36,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $ruleText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 15,
  color: colors.vocabularyShowroom.textStrong,
})

const $introFooter: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xl,
  paddingBottom: spacing.lg,
})

const $primaryButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 56,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $primaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $primaryButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: colors.vocabularyShowroom.accentText,
})

const $playHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.lg,
})

const $playStats: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
})

const $statPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.sm,
  height: 34,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $statPillDanger: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#E07D74",
  borderColor: "#C96B63",
})

const $statPillText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $statPillTextDanger: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
})

const $progressTrack: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 8,
  marginTop: spacing.md,
  marginHorizontal: spacing.xl,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  overflow: "hidden",
})

const $progressFill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: "100%",
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $progressFillLow: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#E07D74",
})

const $playContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xxl,
})

const $questionStack: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  minHeight: 190,
  justifyContent: "center",
})

const $questionCardBack: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 16,
  left: 0,
  right: 0,
  height: 178,
  borderRadius: 26,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  opacity: 0.55,
  transform: [{ rotate: "-2deg" }],
})

const $questionCardMid: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 8,
  left: 0,
  right: 0,
  height: 178,
  borderRadius: 26,
  backgroundColor: colors.vocabularyShowroom.surface,
  opacity: 0.7,
  transform: [{ rotate: "1.5deg" }],
})

const $questionCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 26,
  minHeight: 178,
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.detailBackground,
  shadowColor: "#000000",
  shadowOpacity: 0.25,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
})

const $questionText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 16,
  lineHeight: 24,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $answers: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xl,
})

const $answerButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  minHeight: 56,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: "rgba(0, 0, 0, 0.6)",
  shadowColor: "#000000",
  shadowOpacity: 0.35,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
})

const $answerButtonCorrect: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#6E8A5C",
  borderColor: "#4B6642",
})

const $answerButtonIncorrect: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#8A5A54",
  borderColor: "#6D403B",
})

const $answerButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $answerText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: colors.vocabularyShowroom.textStrong,
})

const $summaryHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.lg,
})

const $shareButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $shareButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $shareText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $summaryContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.xl,
  alignItems: "center",
})

const $summaryTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 30,
  color: colors.vocabularyShowroom.textStrong,
})

const $summaryCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  alignSelf: "stretch",
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.lg,
  borderRadius: 22,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  alignItems: "center",
})

const $summaryScore: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 46,
  color: colors.vocabularyShowroom.textStrong,
})

const $summarySubtitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  marginTop: 4,
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textMuted,
})

const $summaryBadges: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
})

const $badgeRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
})

const $badgeIcon: ThemedStyle<ViewStyle> = () => ({
  height: 22,
  width: 22,
  borderRadius: 11,
  alignItems: "center",
  justifyContent: "center",
})

const $badgeIconCorrect: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#B9D596",
})

const $badgeIconIncorrect: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#E6A394",
})

const $badgeText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $resultsHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.lg,
  paddingBottom: spacing.sm,
})

const $resultsTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flex: 1,
  textAlign: "center",
  fontFamily: typography.primary.semiBold,
  fontSize: 20,
  color: colors.vocabularyShowroom.textStrong,
})

const $resultsContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xxl,
})

const $resultsEmpty: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  marginTop: 24,
  textAlign: "center",
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textMuted,
})

const $resultCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 20,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $resultCardHeader: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $resultCardIndex: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: colors.vocabularyShowroom.textMuted,
})

const $resultStatusPill: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: 999,
  borderWidth: 1,
})

const $resultStatusIcon: ThemedStyle<ViewStyle> = () => ({
  marginRight: 6,
})

const $resultStatusText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.background,
})

const $resultStatusCorrect: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#6E8A5C",
  borderColor: "#4B6642",
})

const $resultStatusIncorrect: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#8A5A54",
  borderColor: "#6D403B",
})

const $resultPrompt: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.medium,
  fontSize: 14,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textStrong,
})

const $resultMetaLabel: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.medium,
  fontSize: 11,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  color: colors.vocabularyShowroom.textMuted,
})

const $resultMetaValue: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  marginTop: 4,
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $resultMetaValueMuted: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
})

const $sprintIllustration: ThemedStyle<ViewStyle> = () => ({
  height: 160,
  width: 200,
  alignItems: "center",
  justifyContent: "center",
})

const $sprintPill: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  height: 22,
  width: 96,
  borderRadius: 999,
  borderWidth: 2,
  borderColor: "#1B1B1D",
  shadowColor: "#000000",
  shadowOpacity: 0.2,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 4,
})

const $sprintPillCream: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#F4F0E8",
  transform: [{ rotate: "-12deg" }, { translateY: 24 }],
})

const $sprintPillGreen: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#B8D97C",
  transform: [{ rotate: "-12deg" }, { translateY: 2 }],
})

const $sprintPillCreamBottom: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#F4F0E8",
  transform: [{ rotate: "-12deg" }, { translateY: 46 }],
})

const $sprintCheck: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  height: 6,
  width: 16,
  borderBottomWidth: 3,
  borderRightWidth: 3,
  borderColor: "#1B1B1D",
  transform: [{ rotate: "-40deg" }],
  left: 70,
  top: 90,
})

const $sprintWatchOuter: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 6,
  left: 70,
  height: 60,
  width: 60,
  borderRadius: 30,
  backgroundColor: "#F4F0E8",
  borderWidth: 2,
  borderColor: "#1B1B1D",
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000000",
  shadowOpacity: 0.2,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 4,
})

const $sprintWatchInner: ThemedStyle<ViewStyle> = () => ({
  height: 42,
  width: 42,
  borderRadius: 21,
  backgroundColor: "#9BC9C6",
  borderWidth: 2,
  borderColor: "#1B1B1D",
  alignItems: "center",
  justifyContent: "center",
})

const $sprintWatchFace: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  height: 30,
  width: 30,
  borderRadius: 15,
  backgroundColor: "#F4F0E8",
})

const $sprintWatchHandLong: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  height: 16,
  width: 2,
  borderRadius: 2,
  backgroundColor: "#1B1B1D",
  transform: [{ rotate: "20deg" }, { translateY: -4 }],
})

const $sprintWatchHandShort: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  height: 10,
  width: 2,
  borderRadius: 2,
  backgroundColor: "#1B1B1D",
  transform: [{ rotate: "-40deg" }, { translateY: 2 }],
})

const $sprintWatchTop: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  height: 12,
  width: 18,
  borderRadius: 4,
  backgroundColor: "#1B1B1D",
  top: -2,
  left: 91,
})

const $sprintWatchSide: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  height: 10,
  width: 14,
  borderRadius: 4,
  backgroundColor: "#1B1B1D",
  top: 18,
  left: 128,
})
