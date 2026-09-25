import { FC } from "react"
import { Pressable, ScrollView, StyleProp, TextStyle, View, ViewStyle } from "react-native"

import { Icon, IconTypes } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

import { resolvePracticeLoadUiState } from "./shared/practiceLoadState"
import type {
  PracticeTileData,
  VocabularyPracticeViewModel,
} from "./useVocabularyPracticeViewModel"

type VocabularyPracticeViewProps = VocabularyPracticeViewModel & {
  onRequestBack: () => void
  onRequestPracticeDetail: (practiceId: PracticeTileData["questionType"]) => void
  onRequestLogin: () => void
  onRequestOpenIap: () => void
  onRequestOpenShowroom: () => void
}

type ModeChipProps = {
  label: string
  selected: boolean
  onPress: () => void
}

type PracticeTileVariant = "default" | "compact"

type PracticeTileProps = PracticeTileData & {
  style?: StyleProp<ViewStyle>
  variant?: PracticeTileVariant
  onPress?: () => void
  disabled?: boolean
}

type IconButtonProps = {
  icon: IconTypes
  accessibilityLabel: string
  onPress: () => void
  size?: number
}

const IconButton: FC<IconButtonProps> = ({ icon, accessibilityLabel, onPress, size = 18 }) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
      hitSlop={6}
    >
      <Icon icon={icon} size={size} color={showroomColors.textStrong} />
    </Pressable>
  )
}

const PracticeTile: FC<PracticeTileProps> = ({
  label,
  icon,
  accent,
  available,
  reason,
  availableItemCount,
  style,
  variant = "default",
  onPress,
  disabled,
}) => {
  const { themed } = useAppTheme()
  const iconSize = variant === "compact" ? 26 : 32
  const isDisabled = disabled === true
  const hintText = available
    ? translate("vocabulary:practiceHub.hints.availableCount", { count: availableItemCount })
    : reason === "missing_synonyms"
      ? translate("vocabulary:practiceHub.hints.missingSynonyms")
      : translate("vocabulary:practiceHub.hints.minActiveWords")

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        themed($tileBase),
        style,
        isDisabled && themed($tileDisabled),
        pressed && !isDisabled && themed($tilePressed),
      ]}
    >
      <View style={themed($tileIconArea)}>
        <View
          style={[themed($tileIconWrap), variant === "compact" && themed($tileIconWrapCompact)]}
        >
          <Icon icon={icon} size={iconSize} color={accent} />
        </View>
      </View>
      <View style={themed($tileTextBlock)}>
        <Text
          style={variant === "compact" ? themed($tileLabelCompact) : themed($tileLabel)}
          text={label}
        />
        <Text style={isDisabled ? themed($tileHintDisabled) : themed($tileHint)} text={hintText} />
      </View>
    </Pressable>
  )
}

const ModeChip: FC<ModeChipProps> = ({ label, selected, onPress }) => {
  const { themed } = useAppTheme()

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={translate("vocabulary:practiceHub.accessibility.useMode", {
        mode: label,
      })}
      style={({ pressed }) => [
        themed($modeChip),
        selected && themed($modeChipSelected),
        pressed && !selected && themed($modeChipPressed),
      ]}
    >
      <Text style={selected ? themed($modeChipTextSelected) : themed($modeChipText)} text={label} />
    </Pressable>
  )
}

export const VocabularyPracticeView: FC<VocabularyPracticeViewProps> = ({
  selectedMode,
  isLoading,
  problem,
  practiceTiles,
  layout,
  onSelectMode,
  onRetryLoad,
  onRequestBack,
  onRequestPracticeDetail,
  onRequestLogin,
  onRequestOpenIap,
  onRequestOpenShowroom,
}) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])

  const { practiceTileSize, practiceTileMinHeight, tileGap } = layout
  const loadState = resolvePracticeLoadUiState(problem)

  const handleStateActionPress = () => {
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
        <IconButton
          icon="back"
          accessibilityLabel={translate("vocabulary:practiceHub.accessibility.goBack")}
          onPress={onRequestBack}
        />
        <Text style={themed($headerTitle)} text={translate("vocabulary:practiceHub.title")} />
        <View style={themed($headerSpacer)} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={themed([$scrollContent, $bottomInsets])}
      >
        <View style={themed($section)}>
          <Text
            style={themed($sectionLabel)}
            text={translate("vocabulary:practiceHub.sectionLabel")}
          />
          <View style={themed($modeRow)}>
            <ModeChip
              label={translate("vocabulary:practiceHub.modeBasic")}
              selected={selectedMode === "basic"}
              onPress={() => onSelectMode("basic")}
            />
            <ModeChip
              label={translate("vocabulary:practiceHub.modeAdvanced")}
              selected={selectedMode === "advanced"}
              onPress={() => onSelectMode("advanced")}
            />
          </View>

          {isLoading ? (
            <View style={themed($stateCard)}>
              <Text
                style={themed($stateTitle)}
                text={translate("vocabulary:practiceHub.loadingTitle")}
              />
              <Text
                style={themed($stateMessage)}
                text={translate("vocabulary:practiceHub.loadingMessage")}
              />
            </View>
          ) : problem ? (
            <View style={themed($stateCard)}>
              <Text style={themed($stateTitle)} text={loadState.title} />
              <Text style={themed($stateMessage)} text={loadState.message} />
              <Pressable
                onPress={handleStateActionPress}
                accessibilityRole="button"
                accessibilityLabel={loadState.actionLabel}
                style={({ pressed }) => [
                  themed($stateActionButton),
                  pressed && themed($stateActionButtonPressed),
                ]}
              >
                <Text style={themed($stateActionText)} text={loadState.actionLabel} />
              </Pressable>
            </View>
          ) : (
            <View style={themed($grid)}>
              {practiceTiles.map((item, index) => {
                const showRightMargin = index % 2 === 0
                const showBottomMargin = index < practiceTiles.length - 2
                return (
                  <PracticeTile
                    key={item.id}
                    {...item}
                    disabled={!item.available}
                    onPress={() => {
                      if (!item.available) return
                      onRequestPracticeDetail(item.id)
                    }}
                    style={[
                      { width: practiceTileSize, minHeight: practiceTileMinHeight },
                      showRightMargin && { marginRight: tileGap },
                      showBottomMargin && { marginBottom: tileGap },
                    ]}
                  />
                )
              })}
            </View>
          )}
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

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xs,
})

const $headerTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 22,
  color: colors.vocabularyShowroom.textStrong,
})

const $headerSpacer: ThemedStyle<ViewStyle> = () => ({
  width: 44,
})

const $iconButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 44,
  width: 44,
  borderRadius: 22,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $iconButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xl,
  paddingBottom: spacing.xxl,
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $sectionLabel: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  color: colors.vocabularyShowroom.textMuted,
  marginBottom: 12,
})

const $modeRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  marginBottom: spacing.sm,
  gap: spacing.sm,
})

const $modeChip: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 34,
  borderRadius: 999,
  paddingHorizontal: spacing.md,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
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
  textTransform: "capitalize",
  color: colors.vocabularyShowroom.textStrong,
})

const $modeChipTextSelected: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  textTransform: "capitalize",
  color: "#FFFFFF",
})

const $stateCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 24,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.lg,
  alignItems: "center",
})

const $stateTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 20,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $stateMessage: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 15,
  lineHeight: 22,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $stateActionButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  minHeight: 48,
  paddingHorizontal: spacing.lg,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $stateActionButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $stateActionText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  color: colors.vocabularyShowroom.accentText,
})

const $grid: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  flexWrap: "wrap",
})

const $tileBase: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 24,
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
  paddingBottom: spacing.lg,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  justifyContent: "flex-start",
  shadowColor: "#000000",
  shadowOpacity: 0.28,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
})

const $tilePressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
  borderColor: colors.vocabularyShowroom.outline,
})

const $tileDisabled: ThemedStyle<ViewStyle> = ({ colors }) => ({
  opacity: 0.66,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $tileIconArea: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "flex-start",
})

const $tileTextBlock: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  marginTop: spacing.sm,
  alignSelf: "flex-start",
})

const $tileIconWrap: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 54,
  width: 54,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $tileIconWrapCompact: ThemedStyle<ViewStyle> = () => ({
  height: 46,
  width: 46,
  borderRadius: 16,
})

const $tileLabel: ThemedStyle<TextStyle> = ({ typography, colors, isDark }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
  lineHeight: 20,
  color: isDark ? colors.vocabularyShowroom.textStrong : "#000000",
})

const $tileLabelCompact: ThemedStyle<TextStyle> = ({ typography, colors, isDark }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  lineHeight: 18,
  color: isDark ? colors.vocabularyShowroom.textStrong : "#000000",
})

const $tileHint: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  lineHeight: 14,
  marginTop: 4,
  color: colors.vocabularyShowroom.textMuted,
})

const $tileHintDisabled: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  lineHeight: 14,
  marginTop: 4,
  color: colors.vocabularyShowroom.textMuted,
  opacity: 0.85,
})
