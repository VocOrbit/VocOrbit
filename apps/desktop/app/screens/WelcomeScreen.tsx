import { FC, useEffect, useState } from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { TxKeyPath } from "@/i18n"
import type { AppStackParamList } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { loadString, saveString, storageKeys } from "@/utils/storage"

type OnboardingFlowStep = {
  id: number
  titleTx: TxKeyPath
  bodyTx: TxKeyPath
}

const onboardingFlowSteps: ReadonlyArray<OnboardingFlowStep> = [
  {
    id: 1,
    titleTx: "vocabulary:welcome.steps.step1.title",
    bodyTx: "vocabulary:welcome.steps.step1.body",
  },
  {
    id: 2,
    titleTx: "vocabulary:welcome.steps.step2.title",
    bodyTx: "vocabulary:welcome.steps.step2.body",
  },
  {
    id: 3,
    titleTx: "vocabulary:welcome.steps.step3.title",
    bodyTx: "vocabulary:welcome.steps.step3.body",
  },
]

const exampleStep = {
  sourceTx: "vocabulary:welcome.steps.step1.source" as TxKeyPath,
  wordTx: "vocabulary:welcome.steps.step1.word" as TxKeyPath,
  meaningTx: "vocabulary:welcome.steps.step1.meaning" as TxKeyPath,
  whyTx: "vocabulary:welcome.steps.step1.why" as TxKeyPath,
  hintTx: "vocabulary:welcome.steps.step1.hint" as TxKeyPath,
}

export const WelcomeScreen: FC = function WelcomeScreen() {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const [isExampleExpanded, setIsExampleExpanded] = useState(false)
  const hasSeenWelcome = loadString(storageKeys.hasSeenWelcome) === "true"

  useEffect(() => {
    if (!hasSeenWelcome) return
    navigation.reset({
      index: 0,
      routes: [{ name: "VocabularyShowroomScreen" }],
    })
  }, [hasSeenWelcome, navigation])

  function completeOnboarding() {
    saveString(storageKeys.hasSeenWelcome, "true")
    navigation.reset({
      index: 0,
      routes: [{ name: "VocabularyShowroomScreen" }],
    })
  }

  return (
    <Screen
      preset="scroll"
      backgroundColor={colors.vocabularyShowroom.background}
      contentContainerStyle={themed($screenContent)}
      safeAreaEdges={["top", "bottom"]}
    >
      <View style={themed($canvas)}>
        <View pointerEvents="none" style={themed($backgroundLayer)}>
          <View style={themed($blobPrimary)} />
          <View style={themed($blobSecondary)} />
          <View style={themed($blobTertiary)} />
        </View>

        <View style={themed($headerCard)}>
          <View style={themed($badge)}>
            <Text tx="vocabulary:welcome.badge" size="xxs" weight="bold" style={themed($badgeText)} />
          </View>
          <Text tx="vocabulary:welcome.title" size="xl" weight="bold" />
          <Text tx="vocabulary:welcome.subtitle" size="sm" style={themed($subtitle)} />
        </View>

        <View style={themed($flowCard)}>
          <Text tx="vocabulary:welcome.flowTitle" size="sm" weight="bold" style={themed($flowTitle)} />

          <View style={themed($flowList)}>
            {onboardingFlowSteps.map((step) => (
              <View key={step.id} style={themed($flowRow)}>
                <View style={themed($flowIndex)}>
                  <Text text={`${step.id}`} size="xxs" weight="bold" style={themed($flowIndexText)} />
                </View>
                <View style={themed($flowContent)}>
                  <Text tx={step.titleTx} size="sm" weight="bold" style={themed($flowStepTitle)} />
                  <Text tx={step.bodyTx} size="xs" style={themed($flowStepBody)} />
                </View>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [themed($exampleToggle), pressed && themed($exampleTogglePressed)]}
            onPress={() => setIsExampleExpanded((prev) => !prev)}
          >
            <Text
              tx={
                isExampleExpanded
                  ? "vocabulary:welcome.actions.hideExample"
                  : "vocabulary:welcome.actions.showExample"
              }
              size="xs"
              weight="bold"
              style={themed($exampleToggleText)}
            />
          </Pressable>

          {isExampleExpanded ? (
            <View style={themed($exampleCard)}>
              <Text tx="vocabulary:welcome.mock.contextLabel" size="xxs" weight="medium" style={themed($mockLabel)} />
              <View style={themed($sourceBox)}>
                <Text tx={exampleStep.sourceTx} size="sm" style={themed($sourceText)} />
              </View>

              <View style={themed($selectedRow)}>
                <Text tx="vocabulary:welcome.mock.selectedWordLabel" size="xs" style={themed($selectedLabel)} />
                <View style={themed($wordChip)}>
                  <Text tx={exampleStep.wordTx} size="xs" weight="medium" />
                </View>
              </View>

              <View style={themed($resultBox)}>
                <Text tx="vocabulary:welcome.mock.meaningLabel" size="xxs" weight="bold" style={themed($resultHeading)} />
                <Text tx={exampleStep.meaningTx} size="sm" style={themed($resultBody)} />
                <Text tx="vocabulary:welcome.mock.whyLabel" size="xxs" weight="bold" style={themed($whyHeading)} />
                <Text tx={exampleStep.whyTx} size="xs" style={themed($whyBody)} />
              </View>

              <View style={themed($hintBox)}>
                <Text tx={exampleStep.hintTx} size="xs" style={themed($hintText)} />
              </View>
            </View>
          ) : null}
        </View>

        <Button
          tx="vocabulary:welcome.actions.enterApp"
          testID="next-screen-button"
          preset="reversed"
          style={themed($primaryButton)}
          textStyle={themed($primaryButtonText)}
          pressedStyle={themed($primaryButtonPressed)}
          onPress={completeOnboarding}
        />
      </View>
    </Screen>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xxl,
})

const $canvas: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
})

const $backgroundLayer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
})

const $blobPrimary: ThemedStyle<ViewStyle> = ({ isDark }) => ({
  position: "absolute",
  top: -120,
  right: -110,
  width: 320,
  height: 320,
  borderRadius: 160,
  backgroundColor: isDark ? "rgba(168, 197, 171, 0.14)" : "rgba(144, 176, 149, 0.22)",
})

const $blobSecondary: ThemedStyle<ViewStyle> = ({ isDark }) => ({
  position: "absolute",
  bottom: -200,
  left: -170,
  width: 360,
  height: 360,
  borderRadius: 180,
  backgroundColor: isDark ? "rgba(126, 159, 166, 0.14)" : "rgba(158, 181, 187, 0.18)",
})

const $blobTertiary: ThemedStyle<ViewStyle> = ({ isDark }) => ({
  position: "absolute",
  top: 320,
  right: -120,
  width: 300,
  height: 300,
  borderRadius: 150,
  backgroundColor: isDark ? "rgba(217, 214, 184, 0.08)" : "rgba(217, 214, 184, 0.2)",
})

const $headerCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.lg,
  borderRadius: 26,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  marginBottom: spacing.md,
})

const $badge: ThemedStyle<ViewStyle> = ({ colors, spacing, isDark }) => ({
  alignSelf: "flex-start",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: 999,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : colors.palette.neutral900,
  marginBottom: spacing.sm,
})

const $badgeText: ThemedStyle<TextStyle> = ({ colors, isDark }) => ({
  color: isDark ? colors.vocabularyShowroom.textStrong : colors.palette.neutral100,
  letterSpacing: 1,
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.vocabularyShowroom.textMuted,
  marginTop: spacing.xs,
})

const $flowCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.lg,
  borderRadius: 26,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $flowTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.vocabularyShowroom.textMuted,
  marginBottom: spacing.sm,
  letterSpacing: 0.4,
})

const $flowList: ThemedStyle<ViewStyle> = () => ({
  alignItems: "stretch",
})

const $flowRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: spacing.md,
})

const $flowIndex: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: colors.palette.primary500,
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.sm,
  marginTop: 2,
})

const $flowIndexText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.accentText,
})

const $flowContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $flowStepTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xxxs,
})

const $flowStepBody: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
})

const $exampleToggle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.xs,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  alignItems: "center",
  justifyContent: "center",
})

const $exampleTogglePressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $exampleToggleText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  letterSpacing: 0.2,
})

const $exampleCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.md,
  padding: spacing.md,
  borderRadius: 18,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $mockLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.vocabularyShowroom.textMuted,
  marginBottom: spacing.xs,
  letterSpacing: 0.4,
})

const $sourceBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 14,
  padding: spacing.sm,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $sourceText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
})

const $selectedRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginTop: spacing.sm,
})

const $selectedLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.vocabularyShowroom.textMuted,
  marginRight: spacing.xs,
})

const $wordChip: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 999,
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.sm,
  backgroundColor: colors.palette.primary200,
  borderWidth: 1,
  borderColor: colors.palette.primary300,
})

const $resultBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.sm,
  borderRadius: 14,
  padding: spacing.sm,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $resultHeading: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
  letterSpacing: 0.6,
})

const $resultBody: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.xxs,
})

const $whyHeading: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.vocabularyShowroom.textMuted,
  letterSpacing: 0.6,
  marginTop: spacing.sm,
})

const $whyBody: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.vocabularyShowroom.textMuted,
  marginTop: spacing.xxs,
})

const $hintBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.sm,
  padding: spacing.sm,
  borderRadius: 12,
  backgroundColor: colors.vocabularyShowroom.detailBackground,
})

const $hintText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
})

const $primaryButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 16,
  backgroundColor: colors.vocabularyShowroom.accent,
  marginTop: spacing.md,
})

const $primaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $primaryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.accentText,
})
