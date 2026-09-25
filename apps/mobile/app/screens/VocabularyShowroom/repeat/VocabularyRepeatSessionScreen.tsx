import { FC, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, TextStyle, View, ViewStyle } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import {
  formatRepeatIntervalLabel,
  getRepeatReviewDelayMinutes,
  loadRepeatSessionQueue,
  reviewRepeatWord,
  type RepeatReviewGrade,
} from "@/services/repeat/repeatService"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type VocabularyRepeatSessionScreenProps = AppStackScreenProps<"VocabularyRepeatSession">

const reviewGrades: RepeatReviewGrade[] = ["forgot", "hard", "good"]

export const VocabularyRepeatSessionScreen: FC<VocabularyRepeatSessionScreenProps> = ({ navigation }) => {
  const { userId } = useAuth()
  const { themed, theme } = useAppTheme()
  const { colors } = theme
  const [queue] = useState(() => loadRepeatSessionQueue(userId))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnswerVisible, setIsAnswerVisible] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const currentItem = queue[currentIndex]
  const isComplete = queue.length > 0 && currentIndex >= queue.length
  const progressLabel = `${Math.min(currentIndex + 1, queue.length)}/${queue.length}`
  const contextSentence = currentItem?.contextSentence?.trim() ?? ""

  const reviewOptions = useMemo(() => {
    if (!currentItem) return []

    return reviewGrades.map((grade) => ({
      grade,
      title: translate(
        grade === "forgot"
          ? "vocabulary:detail.reviewForgot"
          : grade === "hard"
            ? "vocabulary:detail.reviewHard"
            : "vocabulary:detail.reviewGood",
      ),
      delayLabel: formatRepeatIntervalLabel(getRepeatReviewDelayMinutes(currentItem.progress, grade)),
    }))
  }, [currentItem])

  async function handleReview(grade: RepeatReviewGrade) {
    if (!currentItem || isReviewing) return

    setIsReviewing(true)
    try {
      await reviewRepeatWord(userId, currentItem.id, grade)
      setIsAnswerVisible(false)
      setCurrentIndex((index) => index + 1)
    } finally {
      setIsReviewing(false)
    }
  }

  function openShowroom() {
    navigation.navigate("VocabularyShowroomScreen")
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      backgroundColor={colors.vocabularyShowroom.background}
      contentContainerStyle={themed($screenContent)}
    >
      <View style={themed($header)}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={translate("common:back")}
          style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.vocabularyShowroom.textStrong}
          />
        </Pressable>
        <View style={themed($headerCopy)}>
          <Text
            tx="vocabulary:repeatSession.title"
            size="xl"
            weight="bold"
            style={themed($headerTitle)}
          />
          <Text
            text={queue.length > 0 ? progressLabel : translate("vocabulary:repeatSession.emptyTitle")}
            size="xs"
            weight="bold"
            style={themed($headerMeta)}
          />
        </View>
        <View style={themed($headerSpacer)}>
          <AppTutorialVideoButton
            screen="vocabulary_repeat_session"
            placement="overview"
            variant="help"
            containerStyle={themed($iconButton)}
          />
        </View>
      </View>
      <Text tx="vocabulary:repeatSession.subtitle" size="sm" style={themed($sessionIntro)} />

      <AppTutorialVideoButton
        screen="vocabulary_repeat_session"
        placement="overview"
        variant="banner"
        hideAfterSeen
        containerStyle={{ marginBottom: theme.spacing.md }}
      />

      {queue.length === 0 ? (
        <View style={themed($emptyCard)}>
          <View style={themed($emptyIcon)}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={30}
              color={colors.vocabularyShowroom.textStrong}
            />
          </View>
          <Text
            tx="vocabulary:repeatSession.emptyTitle"
            size="lg"
            weight="bold"
            style={themed($emptyTitle)}
          />
          <Text tx="vocabulary:repeatSession.emptyBody" size="sm" style={themed($emptyBody)} />
          <Pressable
            onPress={openShowroom}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:repeatSession.backToList")}
            style={({ pressed }) => [themed($primaryButton), pressed && themed($primaryButtonPressed)]}
          >
            <Text
              tx="vocabulary:repeatSession.backToList"
              size="sm"
              weight="bold"
              style={themed($primaryButtonText)}
            />
          </Pressable>
        </View>
      ) : isComplete ? (
        <View style={themed($emptyCard)}>
          <View style={themed($emptyIcon)}>
            <MaterialCommunityIcons
              name="star-four-points-outline"
              size={30}
              color={colors.vocabularyShowroom.textStrong}
            />
          </View>
          <Text
            tx="vocabulary:repeatSession.completeTitle"
            size="lg"
            weight="bold"
            style={themed($emptyTitle)}
          />
          <Text
            text={translate("vocabulary:repeatSession.completeBody", { count: queue.length })}
            size="sm"
            style={themed($emptyBody)}
          />
          <Pressable
            onPress={openShowroom}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:repeatSession.backToList")}
            style={({ pressed }) => [themed($primaryButton), pressed && themed($primaryButtonPressed)]}
          >
            <Text
              tx="vocabulary:repeatSession.backToList"
              size="sm"
              weight="bold"
              style={themed($primaryButtonText)}
            />
          </Pressable>
        </View>
      ) : currentItem ? (
        <View style={themed($sessionCard)}>
          <View style={themed($cardTopRow)}>
            <Text
              tx="vocabulary:repeatSession.cardLabel"
              size="xs"
              weight="bold"
              style={themed($sectionMeta)}
            />
            <Text text={progressLabel} size="xs" weight="bold" style={themed($sectionMeta)} />
          </View>

          <View style={themed($wordPanel)}>
            <Text text={currentItem.word} size="xxl" weight="bold" style={themed($wordText)} />
          </View>

          {contextSentence.length > 0 ? (
            <View style={themed($contextPanel)}>
              <Text
                tx="vocabulary:repeatSession.contextLabel"
                size="xs"
                weight="bold"
                style={themed($sectionMeta)}
              />
              <Text text={contextSentence} size="sm" style={themed($contextText)} />
            </View>
          ) : null}

          <View style={themed($answerPanel)}>
            <Text
              tx={isAnswerVisible ? "vocabulary:repeatSession.answerLabel" : "vocabulary:repeatSession.prompt"}
              size="xs"
              weight="bold"
              style={themed($sectionMeta)}
            />
            <Text
              text={
                isAnswerVisible
                  ? currentItem.translation || translate("vocabulary:repeatSession.noMeaning")
                  : translate("vocabulary:repeatSession.hiddenAnswer")
              }
              size={isAnswerVisible ? "md" : "sm"}
              weight={isAnswerVisible ? "bold" : "medium"}
              style={isAnswerVisible ? themed($answerText) : themed($hiddenText)}
            />
          </View>

          {!isAnswerVisible ? (
            <Pressable
              onPress={() => setIsAnswerVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:repeatSession.showAnswer")}
              style={({ pressed }) => [themed($primaryButton), pressed && themed($primaryButtonPressed)]}
            >
              <Text
                tx="vocabulary:repeatSession.showAnswer"
                size="sm"
                weight="bold"
                style={themed($primaryButtonText)}
              />
            </Pressable>
          ) : (
            <View style={themed($gradeGrid)}>
              {reviewOptions.map((option) => (
                <Pressable
                  key={option.grade}
                  onPress={() => void handleReview(option.grade)}
                  disabled={isReviewing}
                  accessibilityRole="button"
                  accessibilityLabel={translate("vocabulary:detail.reviewOptionAccessibility", {
                    title: option.title,
                    delay: option.delayLabel,
                  })}
                  style={({ pressed }) => [
                    themed($gradeButton),
                    option.grade === "forgot" && themed($gradeButtonForgot),
                    option.grade === "hard" && themed($gradeButtonHard),
                    option.grade === "good" && themed($gradeButtonGood),
                    isReviewing && themed($gradeButtonDisabled),
                    pressed && !isReviewing && themed($gradeButtonPressed),
                  ]}
                >
                  {isReviewing ? (
                    <ActivityIndicator color={colors.vocabularyShowroom.textStrong} />
                  ) : (
                    <>
                      <Text text={option.title} size="sm" weight="bold" style={themed($gradeTitle)} />
                      <Text text={`+${option.delayLabel}`} size="xs" style={themed($gradeDelay)} />
                    </>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ) : null}
    </Screen>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.xxl,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.sm,
  marginBottom: spacing.lg,
})

const $iconButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 54,
  height: 54,
  borderRadius: 27,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $iconButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $headerCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
  alignItems: "center",
})

const $headerTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $headerMeta: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.vocabularyShowroom.textMuted,
  marginTop: spacing.xxxs,
})

const $headerSpacer: ThemedStyle<ViewStyle> = () => ({
  width: 54,
  height: 54,
})

const $sessionIntro: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginBottom: spacing.lg,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
  lineHeight: 21,
})

const $emptyCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 380,
  borderRadius: 24,
  padding: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  gap: spacing.md,
})

const $emptyIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 64,
  height: 64,
  borderRadius: 22,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $emptyTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $emptyBody: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
  lineHeight: 22,
})

const $sessionCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 24,
  padding: spacing.lg,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  gap: spacing.md,
})

const $cardTopRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
})

const $sectionMeta: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
})

const $wordPanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 160,
  borderRadius: 22,
  padding: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $wordText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $contextPanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 18,
  padding: spacing.md,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.detailDivider,
  gap: spacing.xs,
})

const $contextText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  lineHeight: 22,
})

const $answerPanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 112,
  borderRadius: 18,
  padding: spacing.md,
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  gap: spacing.xs,
})

const $answerText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  lineHeight: 24,
})

const $hiddenText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
  lineHeight: 22,
})

const $primaryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 52,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.md,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $primaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $primaryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.accentText,
  textAlign: "center",
})

const $gradeGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
})

const $gradeButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  minHeight: 92,
  borderRadius: 22,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.sm,
  borderWidth: 2,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $gradeButtonForgot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.dangerBorder,
})

const $gradeButtonHard: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.ctaOutline,
})

const $gradeButtonGood: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.accent,
})

const $gradeButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $gradeButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.6,
})

const $gradeTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $gradeDelay: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.vocabularyShowroom.textMuted,
  marginTop: spacing.xxs,
  textAlign: "center",
})
