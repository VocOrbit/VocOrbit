import { FC, useEffect, useMemo, useState } from "react"
import { Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import {
  type VocabularyActionKey,
  useUiPreferences,
  vocabularyFontScaleLimits,
} from "@/context/UiPreferencesContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import {
  DEFAULT_QUICK_LOOKUP_SHORTCUT,
  buildQuickLookupShortcutFromKeyboardEvent,
  formatQuickLookupShortcut,
  getQuickLookupShortcut,
  setQuickLookupShortcut,
} from "@/services/desktop/quickLookupShortcut"
import { isDesktopShellRuntime } from "@/services/desktop/desktopQuickLookupBridge"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

type ProfileSettingsScreenProps = AppStackScreenProps<"ProfileSettings">

const FONT_SCALE_STEPS = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3]
const ACTION_ICONS: Record<VocabularyActionKey, "view" | "heart" | "bell"> = {
  details: "view",
  favorite: "heart",
  repeat: "bell",
}
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
  key: "languagePair" | "billing" | VocabularyActionKey,
  isDark: boolean,
): SettingsIconAccent => {
  const accents = {
    languagePair: isDark
      ? { backgroundColor: "rgba(96, 165, 250, 0.18)", iconColor: "#93C5FD" }
      : { backgroundColor: "rgba(59, 130, 246, 0.12)", iconColor: "#2F6FDB" },
    billing: isDark
      ? { backgroundColor: "rgba(251, 191, 36, 0.18)", iconColor: "#FCD34D" }
      : { backgroundColor: "rgba(245, 158, 11, 0.14)", iconColor: "#C57A08" },
    details: isDark
      ? { backgroundColor: "rgba(167, 139, 250, 0.18)", iconColor: "#C4B5FD" }
      : { backgroundColor: "rgba(139, 92, 246, 0.12)", iconColor: "#6A53E6" },
    favorite: isDark
      ? { backgroundColor: "rgba(248, 113, 113, 0.18)", iconColor: "#FCA5A5" }
      : { backgroundColor: "rgba(239, 68, 68, 0.12)", iconColor: "#D64545" },
    repeat: isDark
      ? { backgroundColor: "rgba(251, 191, 36, 0.18)", iconColor: "#FCD34D" }
      : { backgroundColor: "rgba(245, 158, 11, 0.14)", iconColor: "#C57A08" },
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
  const isDesktopSettingsAvailable = isDesktopShellRuntime()
  const {
    vocabularyFontScale,
    vocabularyActionOrder,
    setVocabularyFontScale,
    setVocabularyActionOrder,
    moveVocabularyAction,
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
  const quickLookupAccent = getSettingsIconAccent("details", theme.isDark)
  const actionIconAccents: Record<VocabularyActionKey, SettingsIconAccent> = {
    details: getSettingsIconAccent("details", theme.isDark),
    favorite: getSettingsIconAccent("favorite", theme.isDark),
    repeat: getSettingsIconAccent("repeat", theme.isDark),
  }
  const actionLabels: Record<VocabularyActionKey, string> = {
    details: translate("vocabulary:settings.actionDetail"),
    favorite: translate("vocabulary:settings.actionFavorite"),
    repeat: translate("vocabulary:settings.actionRepeat"),
  }
  const visibleVocabularyActionOrder = useMemo(
    () => vocabularyActionOrder.filter((action) => action !== "repeat"),
    [vocabularyActionOrder],
  )
  const selectedThemeMode = themeContextOverride ?? "system"
  const [quickLookupShortcut, setQuickLookupShortcutState] = useState(
    DEFAULT_QUICK_LOOKUP_SHORTCUT,
  )
  const [isShortcutLoading, setIsShortcutLoading] = useState(isDesktopSettingsAvailable)
  const [isCapturingShortcut, setIsCapturingShortcut] = useState(false)
  const [shortcutMessage, setShortcutMessage] = useState<string | undefined>()
  const [shortcutError, setShortcutError] = useState<string | undefined>()

  useEffect(() => {
    if (!isDesktopSettingsAvailable) return

    let isMounted = true

    void getQuickLookupShortcut()
      .then((shortcut) => {
        if (!isMounted) return
        setQuickLookupShortcutState(shortcut)
      })
      .catch(() => {
        if (!isMounted) return
        setShortcutError(translate("vocabulary:settings.quickLookupShortcutSaveFailed"))
      })
      .finally(() => {
        if (!isMounted) return
        setIsShortcutLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isDesktopSettingsAvailable])

  useEffect(() => {
    if (!isDesktopSettingsAvailable || !isCapturingShortcut || typeof window === "undefined") {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (event.repeat) return

      if (event.key === "Escape") {
        setIsCapturingShortcut(false)
        setShortcutMessage(undefined)
        setShortcutError(undefined)
        return
      }

      const nextShortcut = buildQuickLookupShortcutFromKeyboardEvent(event)
      if (!nextShortcut) {
        setShortcutError(translate("vocabulary:settings.quickLookupShortcutInvalid"))
        return
      }

      setIsCapturingShortcut(false)
      setShortcutError(undefined)
      setShortcutMessage(translate("vocabulary:settings.quickLookupShortcutSaving"))

      void setQuickLookupShortcut(nextShortcut)
        .then((savedShortcut) => {
          setQuickLookupShortcutState(savedShortcut)
          setShortcutMessage(
            translate("vocabulary:settings.quickLookupShortcutUpdated", {
              shortcut: formatQuickLookupShortcut(savedShortcut),
            }),
          )
        })
        .catch(() => {
          setShortcutError(translate("vocabulary:settings.quickLookupShortcutSaveFailed"))
          setShortcutMessage(undefined)
        })
    }

    window.addEventListener("keydown", handleKeyDown, true)
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [isCapturingShortcut, isDesktopSettingsAvailable])

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
          <View style={themed($headerSpacer)} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={themed($scrollArea)}
          contentContainerStyle={themed($scrollAreaContent)}
        >
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
                <Icon icon="lock" size={16} color={billingAccent.iconColor} />
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

            {isDesktopSettingsAvailable ? (
              <View style={themed($sectionCard)}>
                <View style={themed($desktopShortcutHeader)}>
                  <View
                    style={[
                      themed($languageCardIconWrap),
                      { backgroundColor: quickLookupAccent.backgroundColor },
                    ]}
                  >
                    <Icon icon="view" size={16} color={quickLookupAccent.iconColor} />
                  </View>

                  <View style={themed($desktopShortcutCopy)}>
                    <Text
                      style={themed($sectionTitle)}
                      text={translate("vocabulary:settings.quickLookupShortcutTitle")}
                    />
                    <Text
                      style={themed($sectionBody)}
                      text={translate("vocabulary:settings.quickLookupShortcutSubtitle")}
                    />
                  </View>
                </View>

                <View style={themed($shortcutPill)}>
                  <Text
                    style={themed($shortcutPillText)}
                    text={
                      isShortcutLoading
                        ? translate("vocabulary:settings.quickLookupShortcutLoading")
                        : formatQuickLookupShortcut(quickLookupShortcut)
                    }
                  />
                </View>

                {isCapturingShortcut ? (
                  <View style={themed($shortcutCaptureCard)}>
                    <Text
                      style={themed($shortcutCaptureTitle)}
                      text={translate("vocabulary:settings.quickLookupShortcutListening")}
                    />
                    <Text
                      style={themed($shortcutCaptureBody)}
                      text={translate("vocabulary:settings.quickLookupShortcutListeningHint")}
                    />
                  </View>
                ) : null}

                {shortcutError ? (
                  <Text style={themed($shortcutErrorText)} text={shortcutError} />
                ) : shortcutMessage ? (
                  <Text style={themed($shortcutHelperText)} text={shortcutMessage} />
                ) : null}

                <View style={themed($shortcutActionRow)}>
                  <Pressable
                    onPress={() => {
                      setShortcutMessage(undefined)
                      setShortcutError(undefined)
                      setIsCapturingShortcut(true)
                    }}
                    disabled={isShortcutLoading}
                    accessibilityRole="button"
                    accessibilityLabel={translate(
                      "vocabulary:settings.accessibility.changeQuickLookupShortcut",
                    )}
                    style={({ pressed }) => [
                      themed($themeModeButton),
                      themed($shortcutActionButton),
                      pressed && !isShortcutLoading && themed($themeModeButtonPressed),
                      isCapturingShortcut && themed($themeModeButtonSelected),
                      isShortcutLoading && themed($stepButtonDisabled),
                    ]}
                  >
                    <Text
                      style={themed([
                        $themeModeButtonText,
                        isCapturingShortcut && $themeModeButtonTextSelected,
                      ])}
                      text={
                        isCapturingShortcut
                          ? translate("vocabulary:settings.quickLookupShortcutListening")
                          : translate("vocabulary:settings.quickLookupShortcutChange")
                      }
                    />
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setShortcutError(undefined)
                      setIsCapturingShortcut(false)
                      setShortcutMessage(translate("vocabulary:settings.quickLookupShortcutSaving"))

                      void setQuickLookupShortcut(DEFAULT_QUICK_LOOKUP_SHORTCUT)
                        .then((savedShortcut) => {
                          setQuickLookupShortcutState(savedShortcut)
                          setShortcutMessage(
                            translate("vocabulary:settings.quickLookupShortcutUpdated", {
                              shortcut: formatQuickLookupShortcut(savedShortcut),
                            }),
                          )
                        })
                        .catch(() => {
                          setShortcutError(
                            translate("vocabulary:settings.quickLookupShortcutSaveFailed"),
                          )
                          setShortcutMessage(undefined)
                        })
                    }}
                    disabled={isShortcutLoading}
                    accessibilityRole="button"
                    accessibilityLabel={translate(
                      "vocabulary:settings.accessibility.resetQuickLookupShortcut",
                    )}
                    style={({ pressed }) => [
                      themed($themeModeButton),
                      themed($shortcutActionButton),
                      pressed && !isShortcutLoading && themed($themeModeButtonPressed),
                      isShortcutLoading && themed($stepButtonDisabled),
                    ]}
                  >
                    <Text
                      style={themed($themeModeButtonText)}
                      text={translate("vocabulary:settings.quickLookupShortcutReset")}
                    />
                  </Pressable>
                </View>
              </View>
            ) : null}

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

            <View style={themed($sectionCard)}>
              <Text
                style={themed($sectionTitle)}
                text={translate("vocabulary:settings.actionOrderTitle")}
              />
                <Text
                  style={themed($sectionBody)}
                  text={translate("vocabulary:settings.actionOrderSubtitle")}
                />

              <View style={themed($previewRow)}>
                {visibleVocabularyActionOrder.map((action) => {
                  const accent = actionIconAccents[action]

                  return (
                    <View
                      key={`preview-${action}`}
                      style={[themed($previewAction), { backgroundColor: accent.backgroundColor }]}
                    >
                      <Icon icon={ACTION_ICONS[action]} size={16} color={accent.iconColor} />
                    </View>
                  )
                })}
              </View>

              <View style={themed($orderList)}>
                {visibleVocabularyActionOrder.map((action, index) => {
                  const canMoveLeft = index > 0
                  const canMoveRight = index < visibleVocabularyActionOrder.length - 1
                  const accent = actionIconAccents[action]

                  return (
                    <View key={action} style={themed($orderRow)}>
                      <View style={themed($orderLabelWrap)}>
                        <View
                          style={[
                            themed($orderLabelIconWrap),
                            { backgroundColor: accent.backgroundColor },
                          ]}
                        >
                          <Icon icon={ACTION_ICONS[action]} size={14} color={accent.iconColor} />
                        </View>
                        <Text style={themed($orderLabelText)} text={actionLabels[action]} />
                      </View>

                      <View style={themed($orderControls)}>
                        <Pressable
                          onPress={() => {
                            if (isDesktopSettingsAvailable) {
                              const nextOrder = [...visibleVocabularyActionOrder]
                              ;[nextOrder[index - 1], nextOrder[index]] = [nextOrder[index]!, nextOrder[index - 1]!]
                              setVocabularyActionOrder(nextOrder)
                              return
                            }
                            moveVocabularyAction(action, "left")
                          }}
                          disabled={!canMoveLeft}
                          accessibilityRole="button"
                          accessibilityLabel={translate(
                            "vocabulary:settings.accessibility.moveActionLeft",
                            {
                              action: actionLabels[action],
                            },
                          )}
                          style={({ pressed }) => [
                            themed($orderMoveButton),
                            !canMoveLeft && themed($stepButtonDisabled),
                            pressed && canMoveLeft && themed($orderMoveButtonPressed),
                          ]}
                        >
                          <Icon icon="caretLeft" size={14} color={showroomColors.textStrong} />
                        </Pressable>

                        <Pressable
                          onPress={() => {
                            if (isDesktopSettingsAvailable) {
                              const nextOrder = [...visibleVocabularyActionOrder]
                              ;[nextOrder[index], nextOrder[index + 1]] = [nextOrder[index + 1]!, nextOrder[index]!]
                              setVocabularyActionOrder(nextOrder)
                              return
                            }
                            moveVocabularyAction(action, "right")
                          }}
                          disabled={!canMoveRight}
                          accessibilityRole="button"
                          accessibilityLabel={translate(
                            "vocabulary:settings.accessibility.moveActionRight",
                            {
                              action: actionLabels[action],
                            },
                          )}
                          style={({ pressed }) => [
                            themed($orderMoveButton),
                            !canMoveRight && themed($stepButtonDisabled),
                            pressed && canMoveRight && themed($orderMoveButtonPressed),
                          ]}
                        >
                          <Icon icon="caretRight" size={14} color={showroomColors.textStrong} />
                        </Pressable>
                      </View>
                    </View>
                  )
                })}
              </View>
            </View>

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

const $desktopShortcutHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.sm,
})

const $desktopShortcutCopy: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xxs,
})

const $shortcutPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  minHeight: 44,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.md,
})

const $shortcutPillText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
  color: colors.vocabularyShowroom.textStrong,
})

const $shortcutCaptureCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.accent,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.sm,
})

const $shortcutCaptureTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $shortcutCaptureBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $shortcutHelperText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $shortcutErrorText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.error,
})

const $shortcutActionRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  flexDirection: "row",
  gap: spacing.xs,
})

const $shortcutActionButton: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $previewRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm,
})

const $previewAction: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 36,
  width: 36,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $orderList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  gap: spacing.sm,
})

const $orderRow: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  borderRadius: 12,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $orderLabelWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $orderLabelIconWrap: ThemedStyle<ViewStyle> = () => ({
  height: 24,
  width: 24,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
})

const $orderLabelText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $orderControls: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $orderMoveButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 30,
  width: 30,
  borderRadius: 15,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $orderMoveButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
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
