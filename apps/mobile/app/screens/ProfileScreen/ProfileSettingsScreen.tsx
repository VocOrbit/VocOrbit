import { FC, useMemo } from "react"
import { Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native"

import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useUiPreferences, vocabularyFontScaleLimits } from "@/context/UiPreferencesContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

type ProfileSettingsScreenProps = AppStackScreenProps<"ProfileSettings">

const FONT_SCALE_STEPS = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3]
type SettingsIconAccent = {
  backgroundColor: string
  iconColor: string
}

const THEME_MODE_OPTIONS = [
  {
    key: "system",
    value: undefined,
    labelTx: "vocabulary:settings.themeModeSystem",
    accessibilityTx: "vocabulary:settings.accessibility.useSystemTheme",
  },
  {
    key: "light",
    value: "light",
    labelTx: "vocabulary:settings.themeModeLight",
    accessibilityTx: "vocabulary:settings.accessibility.useLightTheme",
  },
  {
    key: "dark",
    value: "dark",
    labelTx: "vocabulary:settings.themeModeDark",
    accessibilityTx: "vocabulary:settings.accessibility.useDarkTheme",
  },
] as const

const getSettingsIconAccent = (
  key: "languagePair" | "billing" | "englishUi",
  isDark: boolean,
): SettingsIconAccent => {
  const accents = {
    languagePair: isDark
      ? { backgroundColor: "rgba(96, 165, 250, 0.18)", iconColor: "#93C5FD" }
      : { backgroundColor: "rgba(59, 130, 246, 0.12)", iconColor: "#2F6FDB" },
    billing: isDark
      ? { backgroundColor: "rgba(251, 191, 36, 0.18)", iconColor: "#FCD34D" }
      : { backgroundColor: "rgba(245, 158, 11, 0.14)", iconColor: "#C57A08" },
    englishUi: isDark
      ? { backgroundColor: "rgba(168, 197, 171, 0.18)", iconColor: "#A8C5AB" }
      : { backgroundColor: "rgba(144, 176, 149, 0.16)", iconColor: "#5F7B67" },
  } as const

  return accents[key]
}

function getClosestStep(scale: number): number {
  let closestIndex = 0
  let minDistance = Number.POSITIVE_INFINITY
  FONT_SCALE_STEPS.forEach((step, index) => {
    const distance = Math.abs(step - scale)
    if (distance < minDistance) {
      minDistance = distance
      closestIndex = index
    }
  })
  return closestIndex
}

export const ProfileSettingsScreen: FC<ProfileSettingsScreenProps> = ({ navigation }) => {
  const { themed, theme, setThemeContextOverride, themeContextOverride } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const {
    forceEnglishUi,
    vocabularyFontScale,
    setForceEnglishUi,
    setVocabularyFontScale,
    resetVocabularyPreferences,
  } = useUiPreferences()

  const closestStepIndex = useMemo(() => getClosestStep(vocabularyFontScale), [vocabularyFontScale])
  const progressPercent =
    ((vocabularyFontScale - vocabularyFontScaleLimits.min) /
      (vocabularyFontScaleLimits.max - vocabularyFontScaleLimits.min)) *
    100

  const canDecrease = closestStepIndex > 0
  const canIncrease = closestStepIndex < FONT_SCALE_STEPS.length - 1
  const languagePairAccent = getSettingsIconAccent("languagePair", theme.isDark)
  const billingAccent = getSettingsIconAccent("billing", theme.isDark)
  const englishUiAccent = getSettingsIconAccent("englishUi", theme.isDark)
  const selectedThemeMode = themeContextOverride ?? "system"

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
            accessibilityLabel={translate("vocabulary:settings.accessibility.goBack")}
            style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
            hitSlop={6}
          >
            <Icon icon="back" size={16} color={showroomColors.textStrong} />
          </Pressable>
          <Text style={themed($headerTitle)} text={translate("vocabulary:settings.title")} />
          <View style={themed($headerSpacer)}>
            <AppTutorialVideoButton
              screen="profile_settings"
              placement="overview"
              variant="help"
              containerStyle={themed($iconButton)}
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={themed($scrollArea)}
          contentContainerStyle={themed($scrollAreaContent)}
        >
          <AppTutorialVideoButton
            screen="profile_settings"
            placement="overview"
            variant="banner"
            hideAfterSeen
            containerStyle={{ marginBottom: theme.spacing.md }}
          />

          <View style={themed($settingsSection)}>
            <Pressable
              onPress={() => navigation.navigate("LanguagePreferences", { source: "settings" })}
              accessibilityRole="button"
              accessibilityLabel={translate(
                "vocabulary:settings.accessibility.openLanguagePreferences",
              )}
              style={({ pressed }) => [
                themed($languageCard),
                pressed && themed($languageCardPressed),
              ]}
            >
              <View
                style={[
                  themed($languageCardIconWrap),
                  { backgroundColor: languagePairAccent.backgroundColor },
                ]}
              >
                <Icon icon="settings" size={16} color={languagePairAccent.iconColor} />
              </View>
              <View style={themed($languageCardContent)}>
                <Text
                  style={themed($sectionTitle)}
                  text={translate("vocabulary:settings.languagePairTitle")}
                />
                <Text
                  style={themed($sectionBody)}
                  text={translate("vocabulary:settings.languagePairSubtitle")}
                />
              </View>
              <Icon icon="caretRight" size={16} color={showroomColors.textMuted} />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("ProfileIap")}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:settings.accessibility.openBillingCredits")}
              style={({ pressed }) => [
                themed($languageCard),
                pressed && themed($languageCardPressed),
              ]}
            >
              <View
                style={[
                  themed($languageCardIconWrap),
                  { backgroundColor: billingAccent.backgroundColor },
                ]}
              >
                <Icon icon="bell" size={16} color={billingAccent.iconColor} />
              </View>
              <View style={themed($languageCardContent)}>
                <Text
                  style={themed($sectionTitle)}
                  text={translate("vocabulary:settings.billingCreditsTitle")}
                />
                <Text
                  style={themed($sectionBody)}
                  text={translate("vocabulary:settings.billingCreditsSubtitle")}
                />
              </View>
              <Icon icon="caretRight" size={16} color={showroomColors.textMuted} />
            </Pressable>

            <View style={themed($sectionCard)}>
              <Text
                style={themed($sectionTitle)}
                text={translate("vocabulary:settings.themeModeTitle")}
              />
              <Text
                style={themed($sectionBody)}
                text={translate("vocabulary:settings.themeModeSubtitle")}
              />

              <View style={themed($themeModeRow)}>
                {THEME_MODE_OPTIONS.map((option) => {
                  const isSelected = selectedThemeMode === option.key
                  return (
                    <Pressable
                      key={option.key}
                      onPress={() => setThemeContextOverride(option.value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={translate(option.accessibilityTx)}
                      style={({ pressed }) => [
                        themed($themeModeButton),
                        pressed && themed($themeModeButtonPressed),
                        isSelected && themed($themeModeButtonSelected),
                      ]}
                    >
                      <Text
                        style={themed([
                          $themeModeButtonText,
                          isSelected && $themeModeButtonTextSelected,
                        ])}
                        text={translate(option.labelTx)}
                      />
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View style={themed($sectionCard)}>
              <Text
                style={themed($sectionTitle)}
                text={translate("vocabulary:settings.textSizeTitle")}
              />
              <Text
                style={themed($sectionBody)}
                text={translate("vocabulary:settings.textSizeSubtitle")}
              />

              <View style={themed($sliderControlRow)}>
                <Pressable
                  onPress={() => {
                    if (!canDecrease) return
                    setVocabularyFontScale(FONT_SCALE_STEPS[Math.max(closestStepIndex - 1, 0)] ?? 1)
                  }}
                  disabled={!canDecrease}
                  accessibilityRole="button"
                  accessibilityLabel={translate(
                    "vocabulary:settings.accessibility.decreaseTextSize",
                  )}
                  style={({ pressed }) => [
                    themed($stepButton),
                    !canDecrease && themed($stepButtonDisabled),
                    pressed && canDecrease && themed($stepButtonPressed),
                  ]}
                >
                  <Text style={themed($stepButtonText)} text="-" />
                </Pressable>

                <View style={themed($sliderTrack)}>
                  <View
                    style={[
                      themed($sliderFill),
                      { width: `${Math.max(0, Math.min(progressPercent, 100))}%` },
                    ]}
                  />
                </View>

                <Pressable
                  onPress={() => {
                    if (!canIncrease) return
                    setVocabularyFontScale(
                      FONT_SCALE_STEPS[
                        Math.min(closestStepIndex + 1, FONT_SCALE_STEPS.length - 1)
                      ] ?? 1,
                    )
                  }}
                  disabled={!canIncrease}
                  accessibilityRole="button"
                  accessibilityLabel={translate(
                    "vocabulary:settings.accessibility.increaseTextSize",
                  )}
                  style={({ pressed }) => [
                    themed($stepButton),
                    !canIncrease && themed($stepButtonDisabled),
                    pressed && canIncrease && themed($stepButtonPressed),
                  ]}
                >
                  <Text style={themed($stepButtonText)} text="+" />
                </Pressable>
              </View>

              <Text
                style={themed($scaleValueText)}
                text={`${Math.round(vocabularyFontScale * 100)}%`}
              />
            </View>

            <Pressable
              onPress={() => setForceEnglishUi(!forceEnglishUi)}
              accessibilityRole="switch"
              accessibilityState={{ checked: forceEnglishUi }}
              accessibilityLabel={translate("vocabulary:settings.accessibility.toggleEnglishUi")}
              style={({ pressed }) => [
                themed($languageCard),
                forceEnglishUi && themed($englishToggleCardActive),
                pressed && themed($languageCardPressed),
              ]}
            >
              <View
                style={[
                  themed($languageCardIconWrap),
                  { backgroundColor: englishUiAccent.backgroundColor },
                ]}
              >
                <Icon icon="settings" size={16} color={englishUiAccent.iconColor} />
              </View>
              <View style={themed($languageCardContent)}>
                <Text
                  style={themed($sectionTitle)}
                  text={translate("vocabulary:settings.forceEnglishUiTitle")}
                />
                <Text
                  style={themed($sectionBody)}
                  text={translate("vocabulary:settings.forceEnglishUiSubtitle")}
                />
              </View>
              <View
                pointerEvents="none"
                style={[
                  themed($englishToggleTrack),
                  forceEnglishUi && themed($englishToggleTrackOn),
                ]}
              >
                <View
                  style={[
                    themed($englishToggleKnob),
                    forceEnglishUi && themed($englishToggleKnobOn),
                  ]}
                />
              </View>
            </Pressable>

            <View style={themed([$resetWrap, $bottomInsets])}>
              <Pressable
                onPress={resetVocabularyPreferences}
                accessibilityRole="button"
                accessibilityLabel={translate("vocabulary:settings.accessibility.resetSettings")}
                style={({ pressed }) => [
                  themed($resetButton),
                  pressed && themed($resetButtonPressed),
                ]}
              >
                <Text
                  style={themed($resetButtonText)}
                  text={translate("vocabulary:settings.resetToDefaults")}
                />
              </Pressable>
            </View>
          </View>
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
  paddingBottom: spacing.xl,
})

const $scrollArea: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $scrollAreaContent: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 1,
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

const $settingsSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xl,
  gap: spacing.sm,
})

const $languageCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 88,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
})

const $languageCardPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $englishToggleCardActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.accent,
})

const $languageCardIconWrap: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 34,
  width: 34,
  borderRadius: 17,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $languageCardContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.sm,
})

const $sectionCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 18,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  padding: spacing.md,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  color: colors.vocabularyShowroom.textStrong,
})

const $sectionBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $themeModeRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $themeModeButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  minHeight: 38,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.xs,
})

const $themeModeButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $themeModeButtonSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.accent,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $themeModeButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $themeModeButtonTextSelected: ThemedStyle<TextStyle> = () => ({
  color: "#FFFFFF",
})

const $sliderControlRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  flexDirection: "row",
  alignItems: "center",
})

const $stepButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 34,
  width: 34,
  borderRadius: 17,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $stepButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $stepButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.45,
})

const $stepButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: colors.vocabularyShowroom.textStrong,
})

const $sliderTrack: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  height: 8,
  marginHorizontal: spacing.sm,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  overflow: "hidden",
})

const $sliderFill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: "100%",
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.textStrong,
})

const $scaleValueText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $englishToggleTrack: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flexShrink: 0,
  height: 30,
  width: 52,
  borderRadius: 15,
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
  paddingHorizontal: 3,
})

const $englishToggleTrackOn: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $englishToggleKnob: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 24,
  width: 24,
  borderRadius: 12,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $englishToggleKnobOn: ThemedStyle<ViewStyle> = () => ({
  transform: [{ translateX: 22 }],
})

const $resetWrap: ThemedStyle<ViewStyle> = () => ({})

const $resetButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 52,
  borderRadius: 26,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.xl,
})

const $resetButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $resetButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 15,
  color: colors.vocabularyShowroom.textStrong,
})
