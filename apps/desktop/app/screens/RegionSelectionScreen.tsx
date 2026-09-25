import { FC, useMemo, useState } from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import {
  listHomeRegionOptions,
  persistHomeRegionSelection,
  readHomeRegionCode,
  readSelectedHomeRegion,
  type HomeRegionCode,
} from "@/services/region/homeRegion"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { syncRegionConfigToKeychain } from "@/utils/sharedKeychain"

type RegionSelectionScreenProps = AppStackScreenProps<"RegionSelection">

export const RegionSelectionScreen: FC<RegionSelectionScreenProps> = ({ navigation, route }) => {
  const { themed, theme } = useAppTheme()
  const { logout } = useAuth()
  const regionOptions = useMemo(() => listHomeRegionOptions(), [])
  const [selectedRegionCode, setSelectedRegionCode] = useState<HomeRegionCode | undefined>(() =>
    readHomeRegionCode(),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSettingsFlow = route.params?.source === "settings"
  const currentRegion = useMemo(() => readSelectedHomeRegion(), [])

  const handleSelectRegion = async (regionCode: HomeRegionCode) => {
    if (isSubmitting) return

    const previousRegionCode = readHomeRegionCode()
    setSelectedRegionCode(regionCode)
    setIsSubmitting(true)

    const nextRegion = persistHomeRegionSelection(regionCode)
    await syncRegionConfigToKeychain({
      homeRegion: nextRegion.code,
      backendBaseUrl: nextRegion.baseUrl,
    }).catch(() => undefined)

    if (isSettingsFlow) {
      if (previousRegionCode === regionCode) {
        setIsSubmitting(false)
        navigation.goBack()
        return
      }

      logout()
      return
    }

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    })
  }

  return (
    <Screen
      preset="auto"
      backgroundColor={theme.colors.vocabularyShowroom.background}
      systemBarStyle={theme.isDark ? "light" : "dark"}
      contentContainerStyle={themed($container)}
      safeAreaEdges={["top", "bottom"]}
    >
      {isSettingsFlow ? (
        <View style={themed($headerControls)}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
            hitSlop={6}
          >
            <Icon icon="back" size={16} color={theme.colors.vocabularyShowroom.textStrong} />
          </Pressable>
        </View>
      ) : null}

      <View style={themed($heroCard)}>
        <View style={themed($heroEyebrowRow)}>
          <View style={themed($heroEyebrowIcon)}>
            <Icon icon="pin" size={14} color={theme.colors.vocabularyShowroom.accentText} />
          </View>
          <Text
            text={isSettingsFlow ? "REGION SETTINGS" : "PICK YOUR HOME REGION"}
            size="xxs"
            weight="medium"
            style={themed($heroEyebrowText)}
          />
        </View>

        <Text
          text={isSettingsFlow ? "Change your region" : "Choose your nearest region"}
          size="xl"
          weight="bold"
          style={themed($title)}
        />

        <Text
          text={
            isSettingsFlow
              ? "Pick the region closest to where you are now."
              : "Pick the closest region for faster responses and better reliability."
          }
          size="sm"
          style={themed($subtitle)}
        />

        {currentRegion ? (
          <View style={themed($infoPanel)}>
            <View style={themed($infoRow)}>
              <View style={themed($infoPill)}>
                <Text text="Current region" size="xxs" weight="medium" style={themed($infoPillText)} />
              </View>
              <Text
                text={`${currentRegion.emoji} ${currentRegion.title}`}
                size="xs"
                weight="medium"
                style={themed($currentRegionText)}
              />
            </View>

            <View style={themed($infoRow)}>
              <View style={themed($infoIconBubble)}>
                <Icon icon="lock" size={12} color={theme.colors.vocabularyShowroom.accentText} />
              </View>
              <Text
                text={
                  isSettingsFlow
                    ? "Changing region signs you out. You will sign in again on the selected region."
                    : "Your account data is stored in this region."
                }
                size="xs"
                weight="medium"
                style={themed($importantText)}
              />
            </View>
          </View>
        ) : null}
      </View>

      <View style={themed($sectionHeader)}>
        <Text text="Available regions" size="xs" weight="medium" style={themed($sectionTitle)} />
        <Text
          text={
            isSubmitting
              ? "Saving..."
              : isSettingsFlow
                ? "Tap a region to switch"
                : "Tap a region to continue"
          }
          size="xxs"
          style={themed($sectionHint)}
        />
      </View>

      <View style={themed($optionsContainer)}>
        {regionOptions.map((option) => {
          const isSelected = selectedRegionCode === option.code
          const isCurrent = currentRegion?.code === option.code
          return (
            <Pressable
              key={option.code}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: isSubmitting }}
              disabled={isSubmitting}
              style={({ pressed }) =>
                themed([
                  $optionCard,
                  isSelected && $optionCardSelected,
                  !isSelected && isCurrent && $optionCardCurrent,
                  pressed && $optionCardPressed,
                  isSubmitting && $optionCardDisabled,
                ])
              }
              onPress={() => {
                void handleSelectRegion(option.code)
              }}
            >
              <View style={themed($optionTopRow)}>
                <View style={themed([$emojiBadge, isSelected && $emojiBadgeSelected])}>
                  <Text text={option.emoji} size="md" />
                </View>

                <View style={themed($optionCopy)}>
                  <View style={themed($optionTitleRow)}>
                    <Text text={option.title} size="sm" weight="bold" style={themed($optionTitle)} />
                    <View style={themed($badgeRow)}>
                      {isCurrent ? (
                        <View style={themed($metaBadge)}>
                          <Text text="Current" size="xxs" weight="medium" style={themed($metaBadgeText)} />
                        </View>
                      ) : null}
                      {isSelected && !isCurrent ? (
                        <View style={themed([$metaBadge, $metaBadgeSelected])}>
                          <Text
                            text="Selected"
                            size="xxs"
                            weight="medium"
                            style={themed([$metaBadgeText, $metaBadgeSelectedText])}
                          />
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <Text text={option.subtitle} size="xs" style={themed($optionSubtitle)} />
                </View>

                <View style={themed([$selectionIndicator, isSelected && $selectionIndicatorSelected])}>
                  {isSelected ? <Icon icon="check" size={12} color={theme.colors.vocabularyShowroom.accentText} /> : null}
                </View>
              </View>
            </Pressable>
          )
        })}
      </View>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xl,
})

const $headerControls: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
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

const $heroCard: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  borderRadius: spacing.lg,
  padding: spacing.lg,
  marginBottom: spacing.md,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  shadowColor: colors.palette.neutral900,
  shadowOpacity: isDark ? 0.18 : 0.06,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: isDark ? 2 : 3,
})

const $heroEyebrowRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  marginBottom: spacing.sm,
})

const $heroEyebrowIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 24,
  width: 24,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $heroEyebrowText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
  letterSpacing: 0.7,
})

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.vocabularyShowroom.textStrong,
  lineHeight: 38,
  marginBottom: spacing.xs,
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
})

const $infoPanel: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  borderRadius: spacing.md,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  padding: spacing.sm,
  gap: spacing.xs,
})

const $infoRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $infoPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.detailBackground,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xxxs,
})

const $infoPillText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
})

const $infoIconBubble: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 22,
  width: 22,
  borderRadius: 11,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
  flexShrink: 0,
})

const $importantText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  flex: 1,
})

const $currentRegionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  flexShrink: 1,
})

const $sectionHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacing.sm,
  gap: spacing.sm,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
  letterSpacing: 0.4,
})

const $sectionHint: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
})

const $optionsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $optionCard: ThemedStyle<ViewStyle> = ({ colors, spacing, isDark }) => ({
  borderRadius: spacing.lg,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  padding: spacing.sm,
  shadowColor: colors.palette.neutral900,
  shadowOpacity: isDark ? 0.12 : 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 1,
})

const $optionCardCurrent: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.ctaOutline,
})

const $optionCardSelected: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  borderColor: colors.vocabularyShowroom.ctaOutline,
  borderWidth: 2,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : colors.palette.primary100,
})

const $optionCardPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $optionCardDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.72,
})

const $optionTopRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.sm,
})

const $emojiBadge: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 44,
  width: 44,
  borderRadius: spacing.md,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $emojiBadgeSelected: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  backgroundColor: isDark ? colors.vocabularyShowroom.detailBackground : colors.palette.primary200,
  borderColor: colors.vocabularyShowroom.ctaOutline,
})

const $optionCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
})

const $optionTitleRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.xs,
  marginBottom: spacing.xxxs,
})

const $optionTitle: ThemedStyle<TextStyle> = () => ({
  flexShrink: 1,
})

const $badgeRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
})

const $metaBadge: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xxxs,
})

const $metaBadgeSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.ctaOutline,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $metaBadgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
})

const $metaBadgeSelectedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.accentText,
})

const $optionSubtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
  lineHeight: 20,
})

const $selectionIndicator: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 24,
  width: 24,
  borderRadius: 12,
  borderWidth: 1.5,
  borderColor: colors.vocabularyShowroom.outline,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  marginTop: 2,
  flexShrink: 0,
})

const $selectionIndicatorSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.ctaOutline,
  backgroundColor: colors.vocabularyShowroom.accent,
})
