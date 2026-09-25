import { ComponentProps, FC, useEffect, useRef, useState, type ReactNode } from "react"
import { Animated, Easing, Pressable, View } from "react-native"
import type {
  LayoutChangeEvent,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type VocabularyHowToUseScreenProps = AppStackScreenProps<"VocabularyHowToUse">
type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>["name"]
type TutorialStage = 1 | 2 | 3 | 4 | 5 | 6

const totalGuidedSteps = 6
const stageIcons: Record<TutorialStage, MaterialIconName> = {
  1: "text-box-search-outline",
  2: "share-variant",
  3: "apps",
  4: "cursor-default-click-outline",
  5: "lightning-bolt-outline",
  6: "repeat",
}

const stageTitleTx: Record<TutorialStage, TxKeyPath> = {
  1: "vocabulary:howToUse.actionSelectSentence",
  2: "vocabulary:howToUse.actionShare",
  3: "vocabulary:howToUse.actionChooseVocOrbit",
  4: "vocabulary:howToUse.actionPickWord",
  5: "vocabulary:howToUse.actionStartAnalysis",
  6: "vocabulary:howToUse.miniRepeatTitle",
}

const stageInstructionTx: Record<TutorialStage, TxKeyPath> = {
  1: "vocabulary:howToUse.instructionSelectSentence",
  2: "vocabulary:howToUse.instructionShare",
  3: "vocabulary:howToUse.instructionChooseVocOrbit",
  4: "vocabulary:howToUse.instructionPickWord",
  5: "vocabulary:howToUse.instructionStartAnalysis",
  6: "vocabulary:howToUse.instructionMiniRepeat",
}

const exampleStep = {
  meaningTx: "vocabulary:welcome.steps.step1.meaning" as TxKeyPath,
  whyTx: "vocabulary:welcome.steps.step1.why" as TxKeyPath,
}

export const VocabularyHowToUseScreen: FC<VocabularyHowToUseScreenProps> = ({ navigation }) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const [activeStage, setActiveStage] = useState<TutorialStage>(1)
  const [isMiniAnswerVisible, setIsMiniAnswerVisible] = useState(false)
  const scrollRef = useRef<ScrollView | null>(null)
  const stageOffsetsRef = useRef<Partial<Record<TutorialStage, number>>>({})
  const sentenceSelected = activeStage >= 2
  const shareTapped = activeStage >= 3
  const vocorbitChosen = activeStage >= 4
  const wordPicked = activeStage >= 5
  const analysisDone = activeStage >= 6

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (activeStage === 1) {
        scrollRef.current?.scrollTo({ y: 0, animated: true })
        return
      }

      const targetOffset = stageOffsetsRef.current[activeStage]
      if (typeof targetOffset !== "number") return

      scrollRef.current?.scrollTo({
        y: Math.max(targetOffset - 12, 0),
        animated: true,
      })
    }, 140)

    return () => clearTimeout(timeout)
  }, [activeStage])

  function registerStageLayout(...stages: TutorialStage[]) {
    return (event: LayoutChangeEvent) => {
      stages.forEach((stage) => {
        stageOffsetsRef.current[stage] = event.nativeEvent.layout.y
      })
    }
  }

  function restart() {
    setActiveStage(1)
    setIsMiniAnswerVisible(false)
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      backgroundColor={colors.vocabularyShowroom.background}
      contentContainerStyle={themed($screenContent)}
      ScrollViewProps={{ ref: scrollRef } as unknown as ScrollViewProps}
    >
      <View style={themed($header)}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={translate("common:back")}
          style={({ pressed }) => [themed($backButton), pressed && themed($backButtonPressed)]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.vocabularyShowroom.textStrong}
          />
        </Pressable>
        <Text
          tx="vocabulary:showroom.emptyCta"
          weight="bold"
          size="xl"
          style={themed($headerTitle)}
        />
        <View style={themed($headerSpacer)}>
          <AppTutorialVideoButton
            screen="vocabulary_how_to_use"
            placement="overview"
            variant="help"
            containerStyle={themed($backButton)}
          />
        </View>
      </View>

      <View style={themed($intro)}>
        <View style={themed($introIcon)}>
          <MaterialCommunityIcons
            name={stageIcons[activeStage]}
            size={28}
            color={colors.vocabularyShowroom.textStrong}
          />
        </View>
        <View style={themed($introCopy)}>
          <Text
            tx="vocabulary:howToUse.previewTitle"
            weight="bold"
            size="lg"
            style={themed($introTitle)}
          />
          <Text
            text={translate("vocabulary:welcome.progress", {
              current: activeStage,
              total: totalGuidedSteps,
            })}
            size="xs"
            weight="bold"
            style={themed($progressText)}
          />
        </View>
      </View>

      <AppTutorialVideoButton
        screen="vocabulary_how_to_use"
        placement="overview"
        variant="banner"
        compactAfterSeen={false}
        hideAfterSeen
        containerStyle={themed($overviewTutorialVideo)}
      />

      <View style={themed($progressTrack)} accessibilityElementsHidden>
        {Array.from({ length: totalGuidedSteps }, (_, index) => {
          const step = index + 1
          const isActive = step === activeStage
          const isComplete = step < activeStage
          return (
            <View
              key={step}
              style={[
                themed($progressDot),
                isActive && themed($progressDotActive),
                isComplete && themed($progressDotComplete),
              ]}
            />
          )
        })}
      </View>

      <View style={themed($coachCard)}>
        <Text tx={stageTitleTx[activeStage]} size="sm" weight="bold" style={themed($coachTitle)} />
        <Text tx={stageInstructionTx[activeStage]} size="xs" style={themed($coachText)} />
      </View>

      <View
        onLayout={registerStageLayout(1, 2)}
        style={[
          themed($stepCard),
          (activeStage === 1 || activeStage === 2) && themed($stepCardActive),
        ]}
      >
        <View style={themed($stepHeader)}>
          <View style={themed($stepHeaderCopy)}>
            <Text
              tx="vocabulary:howToUse.readerLabel"
              size="xs"
              weight="bold"
              style={themed($sectionMeta)}
            />
            <Text
              tx="vocabulary:howToUse.sharedSentenceLabel"
              size="sm"
              weight="bold"
              style={themed($sectionTitle)}
            />
          </View>
          {activeStage === 1 ? (
            <ActiveBadge step={1} />
          ) : activeStage === 2 ? (
            <ActiveBadge step={2} />
          ) : (
            <DoneBadge />
          )}
        </View>

        <PulseTarget active={activeStage === 1} style={themed($widePulseTarget)}>
          <Pressable
            disabled={activeStage !== 1}
            onPress={() => setActiveStage(2)}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:howToUse.actionSelectSentence")}
            style={({ pressed }) => [
              themed($selectedSentenceBox),
              sentenceSelected && themed($selectedSentenceBoxSelected),
              pressed && themed($selectedSentenceBoxPressed),
            ]}
          >
            <Text size="sm" style={themed($selectedSentenceText)}>
              <Text tx="vocabulary:howToUse.sentencePrefix" />
              <Text
                tx="vocabulary:howToUse.sentenceTarget"
                weight="bold"
                style={themed($selectedSentenceWord)}
              />
              <Text tx="vocabulary:howToUse.sentenceSuffix" />
            </Text>
          </Pressable>
        </PulseTarget>

        <View style={themed($selectionToolbar)}>
          <View style={themed($toolbarActionMuted)}>
            <Text
              tx="vocabulary:howToUse.copyAction"
              size="xs"
              weight="bold"
              style={themed($toolbarTextMuted)}
            />
          </View>
          <PulseTarget active={activeStage === 2} style={themed($toolbarPulseTarget)}>
            <Pressable
              disabled={activeStage !== 2}
              onPress={() => setActiveStage(3)}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:howToUse.actionShare")}
              style={({ pressed }) => [
                themed($toolbarAction),
                activeStage === 2 && themed($controlActive),
                shareTapped && themed($toolbarActionDone),
                pressed && themed($toolbarActionPressed),
              ]}
            >
              <MaterialCommunityIcons
                name="share-outline"
                size={16}
                color={
                  shareTapped
                    ? colors.vocabularyShowroom.textStrong
                    : colors.vocabularyShowroom.accentText
                }
              />
              <Text
                tx="vocabulary:howToUse.actionShareShort"
                size="xs"
                weight="bold"
                style={shareTapped ? themed($toolbarTextDone) : themed($toolbarText)}
              />
            </Pressable>
          </PulseTarget>
        </View>
      </View>

      <View
        onLayout={registerStageLayout(3)}
        style={[
          themed($stepCard),
          activeStage === 3 && themed($stepCardActive),
          !shareTapped && themed($stepCardDisabled),
        ]}
      >
        <View style={themed($stepHeader)}>
          <View style={themed($stepHeaderCopy)}>
            <Text
              tx="vocabulary:howToUse.shareSheetTitle"
              size="xs"
              weight="bold"
              style={themed($sectionMeta)}
            />
            <Text
              tx="vocabulary:howToUse.actionChooseVocOrbit"
              size="sm"
              weight="bold"
              style={themed($sectionTitle)}
            />
          </View>
          {activeStage === 3 ? <ActiveBadge step={3} /> : vocorbitChosen ? <DoneBadge /> : null}
        </View>

        <View style={themed($appTargets)}>
          <View style={themed($appButton)}>
            <View style={themed($appIconMuted)}>
              <MaterialCommunityIcons
                name="email-outline"
                size={22}
                color={colors.vocabularyShowroom.textMuted}
              />
            </View>
            <Text tx="vocabulary:howToUse.mailApp" size="xxs" style={themed($appLabel)} />
          </View>
          <View style={themed($appButton)}>
            <View style={themed($appIconMuted)}>
              <MaterialCommunityIcons
                name="note-text-outline"
                size={22}
                color={colors.vocabularyShowroom.textMuted}
              />
            </View>
            <Text tx="vocabulary:howToUse.notesApp" size="xxs" style={themed($appLabel)} />
          </View>
          <PulseTarget active={activeStage === 3} style={themed($appPulseTarget)}>
            <Pressable
              disabled={activeStage !== 3}
              onPress={() => setActiveStage(4)}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:howToUse.actionChooseVocOrbit")}
              style={({ pressed }) => [
                themed($appButton),
                activeStage === 3 && themed($controlActive),
                pressed && themed($appButtonPressed),
              ]}
            >
              <View style={themed($appIconVocOrbit)}>
                <MaterialCommunityIcons
                  name="orbit"
                  size={24}
                  color={colors.vocabularyShowroom.accentText}
                />
              </View>
              <Text text="VocOrbit" size="xxs" weight="bold" style={themed($appLabelStrong)} />
            </Pressable>
          </PulseTarget>
        </View>
      </View>

      <View
        onLayout={registerStageLayout(4)}
        style={[
          themed($stepCard),
          activeStage === 4 && themed($stepCardActive),
          !vocorbitChosen && themed($stepCardDisabled),
        ]}
      >
        <View style={themed($stepHeader)}>
          <View style={themed($stepHeaderCopy)}>
            <Text
              tx="vocabulary:howToUse.vocorbitPreviewTitle"
              size="xs"
              weight="bold"
              style={themed($sectionMeta)}
            />
            <Text
              tx="vocabulary:howToUse.actionPickWord"
              size="sm"
              weight="bold"
              style={themed($sectionTitle)}
            />
          </View>
          {activeStage === 4 ? <ActiveBadge step={4} /> : wordPicked ? <DoneBadge /> : null}
        </View>

        <View style={themed($shareCaptureTop)}>
          <View style={themed($brandRow)}>
            <View style={themed($brandIcon)}>
              <MaterialCommunityIcons
                name="orbit"
                size={18}
                color={colors.vocabularyShowroom.accentText}
              />
            </View>
            <Text text="VocOrbit" size="sm" weight="bold" style={themed($brandText)} />
          </View>
          <View style={themed($closePill)}>
            <Text tx="common:cancel" size="xxs" weight="medium" style={themed($closePillText)} />
          </View>
        </View>

        <View style={themed($pickerCard)}>
          <Text
            tx="vocabulary:howToUse.targetWordLabel"
            size="sm"
            weight="bold"
            style={themed($sectionTitle)}
          />
          <View style={themed($pickerMetaRow)}>
            <View style={themed($tapBadge)}>
              <MaterialCommunityIcons
                name="eye-outline"
                size={14}
                color={colors.palette.primary600}
              />
              <Text
                tx="vocabulary:howToUse.targetWordLabel"
                size="xxs"
                weight="bold"
                style={themed($tapBadgeText)}
              />
            </View>

            {wordPicked ? (
              <Text
                tx="vocabulary:howToUse.sentenceTarget"
                size="sm"
                weight="bold"
                style={themed($selectionValue)}
              />
            ) : null}
          </View>

          <PulseTarget active={activeStage === 4} style={themed($widePulseTarget)}>
            <Pressable
              disabled={activeStage !== 4}
              onPress={() => setActiveStage(5)}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:howToUse.actionPickWord")}
              style={[themed($pickerBox), wordPicked && themed($pickerBoxSelected)]}
            >
              <Text size="sm" style={themed($pickerText)}>
                <Text tx="vocabulary:howToUse.sentencePrefix" />
                <Text
                  suppressHighlighting
                  onPress={() => activeStage === 4 && setActiveStage(5)}
                  weight={wordPicked ? "bold" : "normal"}
                  style={[
                    themed($pickerWord),
                    activeStage === 4 && themed($activeWord),
                    wordPicked && themed($pickerWordSelected),
                  ]}
                >
                  {translate("vocabulary:howToUse.sentenceTarget")}
                </Text>
                <Text tx="vocabulary:howToUse.sentenceSuffix" />
              </Text>
            </Pressable>
          </PulseTarget>
        </View>
      </View>

      <View
        onLayout={registerStageLayout(5)}
        style={[
          themed($stepCard),
          activeStage === 5 && themed($stepCardActive),
          !wordPicked && themed($stepCardDisabled),
        ]}
      >
        <View style={themed($stepHeader)}>
          <View style={themed($stepHeaderCopy)}>
            <Text
              tx="vocabulary:howToUse.vocorbitPreviewTitle"
              size="xs"
              weight="bold"
              style={themed($sectionMeta)}
            />
            <Text
              tx="vocabulary:howToUse.actionStartAnalysis"
              size="sm"
              weight="bold"
              style={themed($sectionTitle)}
            />
          </View>
          {activeStage === 5 ? <ActiveBadge step={5} /> : analysisDone ? <DoneBadge /> : null}
        </View>

        <View style={themed($analysisSummary)}>
          <View>
            <Text
              tx="vocabulary:howToUse.targetWordLabel"
              size="xxs"
              weight="bold"
              style={themed($sectionMeta)}
            />
            <Text
              tx="vocabulary:howToUse.sentenceTarget"
              size="xl"
              weight="bold"
              style={themed($resultWord)}
            />
          </View>
          <Text
            tx="vocabulary:howToUse.instructionStartAnalysis"
            size="xs"
            style={themed($placeholderText)}
          />
        </View>

        <PulseTarget active={activeStage === 5} style={themed($widePulseTarget)}>
          <Pressable
            disabled={activeStage !== 5}
            onPress={() => setActiveStage(6)}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:howToUse.actionStartAnalysis")}
            style={({ pressed }) => [
              themed($analysisButton),
              activeStage === 5 && themed($controlActive),
              pressed && themed($analysisButtonPressed),
            ]}
          >
            <Text
              tx="vocabulary:howToUse.actionStartAnalysis"
              size="sm"
              weight="bold"
              style={themed($analysisButtonText)}
            />
          </Pressable>
        </PulseTarget>
      </View>

      <View
        onLayout={registerStageLayout(6)}
        style={[
          themed($stepCard),
          activeStage === 6 && themed($stepCardActive),
          !analysisDone && themed($stepCardDisabled),
        ]}
      >
        <View style={themed($stepHeader)}>
          <View style={themed($stepHeaderCopy)}>
            <Text
              tx="vocabulary:repeatSession.title"
              size="xs"
              weight="bold"
              style={themed($sectionMeta)}
            />
            <Text
              tx="vocabulary:howToUse.miniRepeatTitle"
              size="sm"
              weight="bold"
              style={themed($sectionTitle)}
            />
          </View>
          {isMiniAnswerVisible ? (
            <DoneBadge />
          ) : activeStage === 6 ? (
            <ActiveBadge step={6} />
          ) : null}
        </View>

        <View style={themed($miniReviewCard)}>
          <View style={themed($autoSavedBadge)}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={15}
              color={colors.vocabularyShowroom.textStrong}
            />
            <Text
              tx="vocabulary:howToUse.savedTitle"
              size="xxs"
              weight="bold"
              style={themed($autoSavedText)}
            />
          </View>
          <Text
            tx="vocabulary:howToUse.sentenceTarget"
            size="xl"
            weight="bold"
            style={themed($resultWord)}
          />
          <View style={themed($miniContextBox)}>
            <Text size="sm" style={themed($selectedSentenceText)}>
              <Text tx="vocabulary:howToUse.sentencePrefix" />
              <Text
                tx="vocabulary:howToUse.sentenceTarget"
                weight="bold"
                style={themed($selectedSentenceWord)}
              />
              <Text tx="vocabulary:howToUse.sentenceSuffix" />
            </Text>
          </View>
          <View style={themed($miniAnswerBox)}>
            <Text
              tx="vocabulary:repeatSession.answerLabel"
              size="xs"
              weight="bold"
              style={themed($sectionMeta)}
            />
            <Text
              tx={
                isMiniAnswerVisible ? exampleStep.meaningTx : "vocabulary:howToUse.miniRepeatPrompt"
              }
              size="sm"
              weight={isMiniAnswerVisible ? "bold" : "medium"}
              style={isMiniAnswerVisible ? themed($resultBody) : themed($placeholderText)}
            />
          </View>
        </View>

        <PulseTarget
          active={activeStage === 6 && !isMiniAnswerVisible}
          style={themed($widePulseTarget)}
        >
          <Pressable
            disabled={activeStage !== 6 || isMiniAnswerVisible}
            onPress={() => setIsMiniAnswerVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:repeatSession.showAnswer")}
            style={({ pressed }) => [
              themed($analysisButton),
              activeStage === 6 && !isMiniAnswerVisible && themed($controlActive),
              pressed && themed($analysisButtonPressed),
              isMiniAnswerVisible && themed($analysisButtonDone),
            ]}
          >
            <Text
              tx={
                isMiniAnswerVisible
                  ? "vocabulary:howToUse.miniRepeatDone"
                  : "vocabulary:repeatSession.showAnswer"
              }
              size="sm"
              weight="bold"
              style={themed($analysisButtonText)}
            />
          </Pressable>
        </PulseTarget>
      </View>

      <View style={themed($secondaryActions)}>
        <Pressable
          onPress={restart}
          accessibilityRole="button"
          accessibilityLabel={translate("vocabulary:howToUse.restart")}
          style={({ pressed }) => [
            themed($secondaryButton),
            pressed && themed($secondaryButtonPressed),
          ]}
        >
          <Text
            tx="vocabulary:howToUse.restart"
            size="xs"
            weight="bold"
            style={themed($secondaryButtonText)}
          />
        </Pressable>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={translate("vocabulary:howToUse.actionPractice")}
          style={({ pressed }) => [
            themed($secondaryButton),
            themed($secondaryButtonPrimary),
            pressed && themed($secondaryButtonPrimaryPressed),
          ]}
        >
          <Text
            tx="vocabulary:howToUse.actionPractice"
            size="xs"
            weight="bold"
            style={themed($secondaryButtonPrimaryText)}
          />
        </Pressable>
      </View>
    </Screen>
  )
}

const PulseTarget: FC<{
  active: boolean
  children: ReactNode
  style?: StyleProp<ViewStyle>
}> = ({ active, children, style }) => {
  const { themed } = useAppTheme()
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!active) {
      progress.stopAnimation()
      progress.setValue(0)
      return undefined
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 760,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 760,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    )

    loop.start()

    return () => loop.stop()
  }, [active, progress])

  const targetScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.035],
  })
  const haloOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.48],
  })
  const haloScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  })

  return (
    <Animated.View
      style={[themed($pulseTarget), style, active && { transform: [{ scale: targetScale }] }]}
    >
      {active ? (
        <Animated.View
          pointerEvents="none"
          style={[
            themed($pulseHalo),
            {
              opacity: haloOpacity,
              transform: [{ scale: haloScale }],
            },
          ]}
        />
      ) : null}
      {children}
    </Animated.View>
  )
}

const ActiveBadge: FC<{ step: TutorialStage }> = ({ step }) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <View style={themed($activeBadge)}>
      <MaterialCommunityIcons
        name="cursor-default-click-outline"
        size={14}
        color={colors.palette.primary600}
      />
      <Text
        text={translate("vocabulary:welcome.progressSingle", { current: step })}
        size="xxs"
        weight="bold"
        style={themed($activeBadgeText)}
      />
    </View>
  )
}

const DoneBadge: FC = () => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <View style={themed($doneBadge)}>
      <MaterialCommunityIcons name="check" size={15} color={colors.vocabularyShowroom.textStrong} />
    </View>
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
  marginBottom: spacing.md,
})

const $backButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 54,
  height: 54,
  borderRadius: 27,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $backButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $headerTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 1,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $headerSpacer: ThemedStyle<ViewStyle> = () => ({
  width: 54,
  height: 54,
})

const $intro: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginBottom: spacing.md,
})

const $introIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 56,
  height: 56,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $introCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
})

const $introTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.vocabularyShowroom.textStrong,
  marginBottom: spacing.xxxs,
})

const $overviewTutorialVideo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  marginBottom: spacing.md,
})

const $progressText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
})

const $progressTrack: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
  marginBottom: spacing.md,
})

const $progressDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  height: 5,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.outline,
})

const $progressDotActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $progressDotComplete: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $coachCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 86,
  padding: spacing.md,
  borderRadius: 18,
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  marginBottom: spacing.md,
})

const $coachTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
})

const $coachText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.vocabularyShowroom.textMuted,
  marginTop: spacing.xxxs,
})

const $stepCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.md,
  borderRadius: 22,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  marginBottom: spacing.md,
})

const $stepCardActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.accent,
})

const $stepCardDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.52,
})

const $stepHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 42,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.sm,
  marginBottom: spacing.sm,
})

const $stepHeaderCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
})

const $sectionMeta: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
})

const $activeBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxxs,
  minHeight: 32,
  paddingHorizontal: spacing.sm,
  borderRadius: 999,
  backgroundColor: colors.palette.primary100,
})

const $activeBadgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
})

const $pulseTarget: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
})

const $pulseHalo: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: -6,
  right: -6,
  bottom: -6,
  left: -6,
  borderRadius: 22,
  borderWidth: 2,
  borderColor: colors.palette.primary400,
  backgroundColor: colors.palette.primary100,
})

const $toolbarPulseTarget: ThemedStyle<ViewStyle> = () => ({
  borderRadius: 14,
})

const $appPulseTarget: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  borderRadius: 18,
})

const $widePulseTarget: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  borderRadius: 18,
})

const $doneBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $selectedSentenceBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 116,
  padding: spacing.md,
  borderRadius: 18,
  backgroundColor: colors.palette.primary100,
  borderWidth: 1,
  borderColor: colors.palette.primary300,
  justifyContent: "center",
})

const $selectedSentenceBoxSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $selectedSentenceBoxPressed: ThemedStyle<ViewStyle> = () => ({
  transform: [{ scale: 0.99 }],
})

const $selectedSentenceText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  lineHeight: 25,
})

const $selectedSentenceWord: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
})

const $selectionToolbar: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 58,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  padding: spacing.sm,
  borderRadius: 18,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  marginTop: spacing.sm,
})

const $toolbarActionMuted: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 40,
  borderRadius: 14,
  paddingHorizontal: spacing.md,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $toolbarAction: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 40,
  borderRadius: 14,
  paddingHorizontal: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xxs,
  backgroundColor: colors.vocabularyShowroom.accent,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.accent,
})

const $toolbarActionDone: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $toolbarActionPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $toolbarText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.accentText,
})

const $toolbarTextDone: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
})

const $toolbarTextMuted: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
})

const $controlActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  shadowColor: colors.vocabularyShowroom.accent,
  shadowOpacity: 0.24,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 3,
})

const $appTargets: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 92,
  flexDirection: "row",
  justifyContent: "space-between",
  gap: spacing.sm,
})

const $appButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
})

const $appButtonPressed: ThemedStyle<ViewStyle> = () => ({
  transform: [{ scale: 0.98 }],
})

const $appIconMuted: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 56,
  height: 56,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $appIconVocOrbit: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 56,
  height: 56,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.accent,
})

const $appLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $appLabelStrong: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $shareCaptureTop: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 58,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacing.sm,
  paddingHorizontal: spacing.sm,
  borderRadius: 18,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $brandRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $brandIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 30,
  height: 30,
  borderRadius: 9,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $brandText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
})

const $closePill: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 34,
  borderRadius: 999,
  paddingHorizontal: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $closePillText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
})

const $pickerCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.md,
  borderRadius: 18,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  gap: spacing.sm,
})

const $pickerMetaRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 34,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.sm,
  flexWrap: "wrap",
})

const $tapBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 999,
  backgroundColor: colors.palette.primary100,
})

const $tapBadgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
})

const $selectionValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
})

const $pickerBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 124,
  padding: spacing.md,
  borderRadius: 18,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  justifyContent: "center",
})

const $pickerBoxSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.palette.primary400,
  borderWidth: 2,
})

const $pickerText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  lineHeight: 25,
})

const $pickerWord: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  textDecorationLine: "underline",
  textDecorationColor: colors.palette.primary400,
})

const $activeWord: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
  backgroundColor: colors.palette.primary100,
})

const $pickerWordSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
  backgroundColor: colors.palette.primary100,
})

const $analysisButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 50,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.md,
  backgroundColor: colors.vocabularyShowroom.accent,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.accent,
})

const $analysisSummary: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.md,
  borderRadius: 18,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  gap: spacing.sm,
  marginBottom: spacing.sm,
})

const $analysisButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $analysisButtonDone: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
  borderColor: colors.vocabularyShowroom.outline,
})

const $analysisButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.accentText,
})

const $resultWord: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
})

const $resultBody: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
})

const $placeholderText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
})

const $autoSavedBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignSelf: "flex-start",
  minHeight: 30,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  paddingHorizontal: spacing.sm,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $autoSavedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
})

const $miniReviewCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.md,
  borderRadius: 18,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.palette.primary300,
  gap: spacing.sm,
  marginBottom: spacing.sm,
})

const $miniContextBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.md,
  borderRadius: 18,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $miniAnswerBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 88,
  padding: spacing.md,
  borderRadius: 18,
  backgroundColor: colors.palette.primary100,
  gap: spacing.xs,
  justifyContent: "center",
})

const $secondaryActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
  marginTop: spacing.xs,
})

const $secondaryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  minWidth: 0,
  minHeight: 42,
  borderRadius: 14,
  paddingHorizontal: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $secondaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $secondaryButtonPrimary: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
  borderColor: colors.vocabularyShowroom.outline,
})

const $secondaryButtonPrimaryPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $secondaryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $secondaryButtonPrimaryText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})
