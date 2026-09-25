import { FC, useEffect, useRef } from "react"
import { Animated, Easing, Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native"

import { Icon, IconTypes } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

import { resolvePracticeLoadUiState } from "../shared/practiceLoadState"
import type {
  AnswerState,
  PracticeAnswer,
  PracticeQuestion,
  VocabularyPracticeDetailViewModel,
} from "./useVocabularyPracticeDetailViewModel"

type OptionTone = "default" | "correct" | "incorrect"

type OptionButtonProps = {
  label: string
  tone: OptionTone
  showStatus: boolean
  statusIcon?: IconTypes
  onPress: () => void
}

type VocabularyPracticeDetailViewProps = VocabularyPracticeDetailViewModel & {
  onRequestLeave: () => void
  onRequestLogin: () => void
  onRequestOpenIap: () => void
  onRequestOpenShowroom: () => void
}

const OptionButton: FC<OptionButtonProps> = ({
  label,
  tone,
  showStatus,
  statusIcon,
  onPress,
}) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const showIcon = showStatus && statusIcon
  const hasLongLabel = label.trim().length > 28

  return (
    <Pressable
      onPress={onPress}
      disabled={showStatus}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        themed($optionButton),
        hasLongLabel && themed($optionButtonLongLabel),
        tone === "correct" && themed($optionButtonCorrect),
        tone === "incorrect" && themed($optionButtonIncorrect),
        pressed && !showStatus && themed($optionButtonPressed),
      ]}
    >
      <View style={themed($optionContent)}>
        <View
          style={[
            themed($optionStatus),
            !showStatus && themed($optionStatusHidden),
            tone === "correct" && themed($optionStatusCorrect),
            tone === "incorrect" && themed($optionStatusIncorrect),
          ]}
        >
          {showIcon ? (
            <Icon icon={statusIcon} size={14} color={showroomColors.background} />
          ) : null}
        </View>
        <Text
          style={[
            themed($optionText),
            tone === "correct" && !theme.isDark && themed($optionTextCorrect),
            tone === "incorrect" && !theme.isDark && themed($optionTextIncorrect),
          ]}
          text={label}
        />
        <View style={themed($optionStatusSpacer)} />
      </View>
    </Pressable>
  )
}

const resolveOptionTone = (
  answer: PracticeAnswer,
  question: PracticeQuestion,
  selectedId: string | null,
  answerState: AnswerState,
): OptionTone => {
  if (answerState === "idle") return "default"
  if (answer.id === question.correctId) return "correct"
  if (answerState === "incorrect" && answer.id === selectedId) return "incorrect"
  return "default"
}

const resolveStatusIcon = (
  answer: PracticeAnswer,
  question: PracticeQuestion,
  selectedId: string | null,
  answerState: AnswerState,
): IconTypes | undefined => {
  if (answerState === "correct" && answer.id === selectedId) return "check"
  if (answerState === "incorrect" && answer.id === selectedId) return "x"
  if (answerState === "incorrect" && answer.id === question.correctId) return "check"
  return undefined
}

export const VocabularyPracticeDetailView: FC<VocabularyPracticeDetailViewProps> = ({
  practiceId: _practiceId,
  question,
  progress,
  isLastQuestion,
  isSessionCompleted,
  correctAnswers,
  scorePercent,
  totalQuestions,
  selectedId,
  answerState,
  showLeavePrompt,
  correctAnswer,
  isLoadingQuestions,
  hasQuestions,
  loadProblem,
  onRetryLoad,
  onSelectAnswer,
  onNextWord,
  onOpenLeavePrompt,
  onCloseLeavePrompt,
  onRequestLeave,
  onRequestLogin,
  onRequestOpenIap,
  onRequestOpenShowroom,
}) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const bottomInset = $bottomInsets.paddingBottom ?? 0
  const slideAnim = useRef(new Animated.Value(0)).current

  const isResultVisible = answerState !== "idle"
  const resultLift = 220
  const scrollBottomPadding =
    theme.spacing.xxl + bottomInset + (isResultVisible ? resultLift + theme.spacing.lg : 0)

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isResultVisible ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [isResultVisible, slideAnim])

  const resultTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [resultLift, 0],
  })
  const resultOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  const progressWidth: `${number}%` = `${Math.round(progress * 100)}%`
  const resultCtaLabel = isSessionCompleted
    ? translate("vocabulary:practiceHub.resultCta.backToPractice")
    : isLastQuestion
      ? translate("vocabulary:practiceHub.resultCta.seeResult")
      : translate("vocabulary:practiceHub.resultCta.nextWord")
  const loadState = resolvePracticeLoadUiState(loadProblem)

  const handleLoadActionPress = () => {
    if (isLoadingQuestions) return

    if (!hasQuestions && !loadProblem) {
      onRequestOpenShowroom()
      return
    }

    if (loadState.action === "login") {
      onRequestLogin()
      return
    }
    if (loadState.action === "iap") {
      onRequestOpenIap()
      return
    }
    if (loadState.action === "showroom") {
      onRequestOpenShowroom()
      return
    }
    onRetryLoad()
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

      <View style={themed($headerRow)}>
        <Pressable
          onPress={onOpenLeavePrompt}
          accessibilityRole="button"
          accessibilityLabel={translate("vocabulary:practiceHub.accessibility.closePractice")}
          style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
          hitSlop={6}
        >
          <Icon icon="x" size={16} color={showroomColors.textStrong} />
        </Pressable>
        <View style={themed($progressTrack)}>
          <View style={[themed($progressFill), { width: progressWidth }]} />
        </View>
        <View style={themed($headerSpacer)} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[themed($scrollContent), { paddingBottom: scrollBottomPadding }]}
      >
        {hasQuestions ? (
          <>
            <View style={themed($questionStack)}>
              <View style={themed($questionCardBack)} />
              <View style={themed($questionCardMid)} />
              <View style={themed($questionCard)}>
                <Text style={themed($questionText)} text={question.prompt} />
              </View>
            </View>

            <View style={themed($options)}>
              <Text
                style={themed($optionsTitle)}
                text={translate("vocabulary:practiceHub.selectAnswer")}
              />
              {question.answers.map((answer, index) => {
                const tone = resolveOptionTone(answer, question, selectedId, answerState)
                const statusIcon = resolveStatusIcon(answer, question, selectedId, answerState)

                return (
                  <View
                    key={answer.id}
                    style={
                      index < question.answers.length - 1
                        ? { marginBottom: theme.spacing.md }
                        : undefined
                    }
                  >
                    <OptionButton
                      label={answer.label}
                      tone={tone}
                      showStatus={isResultVisible}
                      statusIcon={statusIcon}
                      onPress={() => onSelectAnswer(answer.id)}
                    />
                  </View>
                )
              })}
            </View>
          </>
        ) : (
          <View style={themed($loadCard)}>
            <Text
              style={themed($loadTitle)}
              text={
                isLoadingQuestions
                  ? translate("vocabulary:practiceHub.loadingQuestionsTitle")
                  : loadState.title
              }
            />
            <Text
              style={themed($loadMessage)}
              text={
                isLoadingQuestions
                  ? translate("vocabulary:practiceHub.loadingQuestionsMessage")
                  : loadState.message
              }
            />
            {!isLoadingQuestions && (
              <Pressable
                onPress={handleLoadActionPress}
                accessibilityRole="button"
                accessibilityLabel={loadState.actionLabel}
                style={({ pressed }) => [themed($loadActionButton), pressed && themed($loadActionButtonPressed)]}
              >
                <Text style={themed($loadActionText)} text={loadState.actionLabel} />
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>

      <Animated.View
        pointerEvents={isResultVisible ? "auto" : "none"}
        style={[
          themed($resultOverlay),
          {
            paddingBottom: theme.spacing.xl + bottomInset,
            transform: [{ translateY: resultTranslateY }],
            opacity: resultOpacity,
          },
        ]}
      >
        <View style={themed($resultCard)}>
          <View style={themed($resultHeader)}>
            <View
              style={[
                themed($resultBadge),
                answerState === "correct"
                  ? themed($resultBadgeCorrect)
                  : themed($resultBadgeIncorrect),
              ]}
            >
              <Icon
                icon={answerState === "correct" ? "check" : "x"}
                size={14}
                color={showroomColors.background}
              />
            </View>
            <Text
              style={themed($resultTitle)}
              text={
                answerState === "correct"
                  ? translate("vocabulary:practiceHub.result.correctTitle")
                  : translate("vocabulary:practiceHub.result.incorrectTitle")
              }
            />
          </View>

          {answerState === "incorrect" && (
            <Text
              style={themed($resultLabel)}
              text={translate("vocabulary:practiceHub.result.correctAnswerLabel")}
            />
          )}

          <View style={themed($resultWordRow)}>
            <Text style={themed($resultWord)} text={correctAnswer?.label ?? ""} />
            <View style={themed($resultAudio)}>
              <Icon icon="bell" size={14} color={showroomColors.textStrong} />
            </View>
          </View>

          <Text
            style={themed($resultLabel)}
            text={translate("vocabulary:practiceHub.result.usedInSentenceLabel")}
          />
          <Text style={themed($resultSentence)} text={question.example} />

          {isSessionCompleted && (
            <View style={themed($sessionSummaryWrap)}>
              <Text
                style={themed($resultLabel)}
                text={translate("vocabulary:practiceHub.result.sessionResultLabel")}
              />
              <Text
                style={themed($sessionSummaryText)}
                text={`${correctAnswers}/${totalQuestions} correct (${scorePercent}%)`}
              />
            </View>
          )}

          <Pressable
            onPress={() => {
              if (isSessionCompleted) {
                onRequestLeave()
                return
              }
              onNextWord()
            }}
            accessibilityRole="button"
            accessibilityLabel={resultCtaLabel}
            style={({ pressed }) => [themed($resultCta), pressed && themed($resultCtaPressed)]}
          >
            <Text style={themed($resultCtaText)} text={resultCtaLabel} />
          </Pressable>
        </View>
      </Animated.View>

      {showLeavePrompt && (
        <View style={themed($leaveOverlay)}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:practiceHub.leavePrompt.closePromptAccessibility")}
            style={themed($leaveBackdrop)}
            onPress={onCloseLeavePrompt}
          />
          <View style={themed([$leaveSheet, $bottomInsets])}>
            <View style={themed($leaveHandle)} />
            <Text style={themed($leaveTitle)} text={translate("vocabulary:practiceHub.leavePrompt.title")} />
            <Pressable
              onPress={onCloseLeavePrompt}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:practiceHub.leavePrompt.keepPlaying")}
              style={({ pressed }) => [
                themed($leavePrimaryButton),
                pressed && themed($leavePrimaryButtonPressed),
              ]}
            >
              <Text
                style={themed($leavePrimaryText)}
                text={translate("vocabulary:practiceHub.leavePrompt.keepPlaying")}
              />
            </Pressable>
            <Pressable
              onPress={onRequestLeave}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:practiceHub.leavePrompt.leavePracticeAccessibility")}
              style={({ pressed }) => [
                themed($leaveSecondaryButton),
                pressed && themed($leaveSecondaryButtonPressed),
              ]}
            >
              <Text style={themed($leaveSecondaryText)} text={translate("vocabulary:practiceHub.leavePrompt.leave")} />
            </Pressable>
          </View>
        </View>
      )}
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

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.lg,
  paddingBottom: spacing.sm,
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

const $progressTrack: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  height: 8,
  marginHorizontal: spacing.md,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  overflow: "hidden",
})

const $progressFill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: "100%",
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $headerSpacer: ThemedStyle<ViewStyle> = () => ({
  width: 40,
})

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xl,
})

const $questionStack: ThemedStyle<ViewStyle> = () => ({
  marginTop: 4,
  alignItems: "center",
  width: "100%",
  minHeight: 180,
  justifyContent: "center",
})

const $questionCardBack: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  position: "absolute",
  top: 16,
  left: 0,
  right: 0,
  height: 168,
  borderRadius: 26,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  opacity: isDark ? 0.28 : 0.52,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.detailDivider,
  transform: [{ rotate: "-2deg" }],
})

const $questionCardMid: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  position: "absolute",
  top: 8,
  left: 0,
  right: 0,
  height: 168,
  borderRadius: 26,
  backgroundColor: colors.vocabularyShowroom.surface,
  opacity: isDark ? 0.58 : 0.78,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.detailDivider,
  transform: [{ rotate: "1.5deg" }],
})

const $questionCard: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  borderRadius: 28,
  width: "100%",
  minHeight: 176,
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.xl,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  shadowColor: "#000000",
  shadowOpacity: isDark ? 0.22 : 0.12,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
})

const $questionText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 18,
  lineHeight: 26,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $options: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  marginTop: spacing.xl,
  paddingTop: spacing.md,
  paddingBottom: spacing.md,
  paddingHorizontal: spacing.sm,
  borderRadius: 26,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.detailDivider,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  shadowColor: "#000000",
  shadowOpacity: isDark ? 0.08 : 0.04,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 5 },
  elevation: 1,
})

const $optionsTitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  alignSelf: "flex-start",
  marginBottom: spacing.md,
  paddingHorizontal: spacing.sm,
  paddingVertical: 5,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.detailDivider,
  backgroundColor: colors.vocabularyShowroom.surface,
  fontFamily: typography.primary.semiBold,
  fontSize: 11,
  letterSpacing: 1.5,
  color: colors.vocabularyShowroom.textMuted,
})

const $optionButton: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  minHeight: 64,
  width: "100%",
  alignSelf: "stretch",
  borderRadius: 999,
  paddingHorizontal: 12,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.detailDivider,
  shadowColor: "#000000",
  shadowOpacity: isDark ? 0.12 : 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 1,
})

const $optionButtonLongLabel: ThemedStyle<ViewStyle> = () => ({
  paddingVertical: 10,
  paddingHorizontal: 8,
})

const $optionButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
  borderColor: colors.vocabularyShowroom.outline,
})

const $optionButtonCorrect: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  backgroundColor: "#6E8A5C",
  borderColor: isDark ? "#4B6642" : colors.vocabularyShowroom.ctaOutline,
})

const $optionButtonIncorrect: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#8A5A54",
  borderColor: "#6D403B",
})

const $optionContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
})

const $optionStatus: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 28,
  width: 28,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.detailDivider,
})

const $optionStatusHidden: ThemedStyle<ViewStyle> = () => ({
  opacity: 0,
})

const $optionStatusCorrect: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#B9D596",
})

const $optionStatusIncorrect: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#E6A394",
})

const $optionStatusSpacer: ThemedStyle<ViewStyle> = () => ({
  height: 28,
  width: 28,
})

const $optionText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flex: 1,
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
  letterSpacing: 0.3,
})

const $optionTextCorrect: ThemedStyle<TextStyle> = () => ({
  color: "#FFFFFF",
})

const $optionTextIncorrect: ThemedStyle<TextStyle> = () => ({
  color: "#FFFFFF",
})

const $loadCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  borderRadius: 24,
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  alignItems: "center",
})

const $loadTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 22,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $loadMessage: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  lineHeight: 24,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $loadActionButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  minHeight: 48,
  paddingHorizontal: spacing.lg,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $loadActionButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $loadActionText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  color: "#FFFFFF",
})

const $resultCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.lg,
  borderRadius: 26,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $resultOverlay: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.md,
})

const $resultHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.sm,
})

const $resultBadge: ThemedStyle<ViewStyle> = () => ({
  height: 28,
  width: 28,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
})

const $resultBadgeCorrect: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#B9D596",
})

const $resultBadgeIncorrect: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#E6A394",
})

const $resultTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 20,
  color: colors.vocabularyShowroom.textStrong,
})

const $resultLabel: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.medium,
  fontSize: 12,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  color: colors.vocabularyShowroom.textMuted,
})

const $resultWordRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginTop: spacing.xs,
})

const $resultWord: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: colors.vocabularyShowroom.textStrong,
})

const $resultAudio: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginLeft: spacing.xs,
  height: 24,
  width: 24,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $resultSentence: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  marginTop: 6,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textStrong,
})

const $sessionSummaryWrap: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  paddingTop: spacing.sm,
  borderTopWidth: 1,
  borderTopColor: colors.vocabularyShowroom.detailDivider,
})

const $sessionSummaryText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $resultCta: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  marginTop: spacing.lg,
  height: 56,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: isDark ? 1 : 0,
  borderColor: isDark ? colors.vocabularyShowroom.ctaOutline : colors.transparent,
  backgroundColor: isDark ? colors.vocabularyShowroom.surface : colors.vocabularyShowroom.accent,
})

const $resultCtaPressed: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  borderColor: isDark ? colors.vocabularyShowroom.ctaOutlinePressed : colors.transparent,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : colors.vocabularyShowroom.accentPressed,
})

const $resultCtaText: ThemedStyle<TextStyle> = ({ typography, colors, isDark }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: isDark ? colors.tint : colors.palette.neutral100,
})

const $leaveOverlay: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "flex-end",
})

const $leaveBackdrop: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.45)",
})

const $leaveSheet: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  backgroundColor: colors.vocabularyShowroom.surface,
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.sm,
  paddingBottom: spacing.xl,
  borderTopWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  shadowColor: "#000000",
  shadowOpacity: isDark ? 0.26 : 0.12,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: -6 },
  elevation: 12,
})

const $leaveHandle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 4,
  width: 48,
  borderRadius: 999,
  alignSelf: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $leaveTitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.lg,
  marginBottom: spacing.md,
  fontFamily: typography.primary.semiBold,
  fontSize: 22,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $leavePrimaryButton: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  height: 56,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: isDark ? 1 : 0,
  borderColor: isDark ? colors.vocabularyShowroom.ctaOutline : colors.transparent,
  backgroundColor: isDark ? colors.vocabularyShowroom.surface : colors.vocabularyShowroom.accent,
  marginBottom: spacing.md,
})

const $leavePrimaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  borderColor: isDark ? colors.vocabularyShowroom.ctaOutlinePressed : colors.transparent,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : colors.vocabularyShowroom.accentPressed,
})

const $leavePrimaryText: ThemedStyle<TextStyle> = ({ typography, colors, isDark }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: isDark ? colors.tint : colors.palette.neutral100,
})

const $leaveSecondaryButton: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  height: 56,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: isDark ? colors.vocabularyShowroom.dangerBorder : colors.vocabularyShowroom.dangerFill,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceSoft : colors.vocabularyShowroom.dangerFill,
})

const $leaveSecondaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  borderColor: isDark ? colors.vocabularyShowroom.dangerBorder : colors.vocabularyShowroom.dangerFillPressed,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : colors.vocabularyShowroom.dangerFillPressed,
})

const $leaveSecondaryText: ThemedStyle<TextStyle> = ({ typography, colors, isDark }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: isDark ? colors.vocabularyShowroom.dangerText : "#FFFFFF",
})
