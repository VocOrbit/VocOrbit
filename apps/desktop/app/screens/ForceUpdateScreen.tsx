import { FC, useCallback } from "react"
import { Linking, Pressable, TextStyle, View, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppMeta } from "@/context/AppMetaContext"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const ForceUpdateScreen: FC = () => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const { bootstrap, refreshBootstrap } = useAppMeta()
  const update = bootstrap?.update
  const title = update?.title ?? translate("vocabulary:forceUpdate.title")
  const message = update?.message ?? translate("vocabulary:forceUpdate.body")

  const openStore = useCallback(() => {
    if (!update?.storeUrl) return
    void Linking.openURL(update.storeUrl)
  }, [update?.storeUrl])

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top", "bottom"]}
      backgroundColor={showroomColors.background}
      systemBarStyle={theme.isDark ? "light" : "dark"}
      contentContainerStyle={themed($screen)}
    >
      <View pointerEvents="none" style={themed($glowTop)} />
      <View pointerEvents="none" style={themed($glowBottom)} />

      <View style={themed($content)}>
        <Text style={themed($title)} text={title} />
        <Text style={themed($body)} text={message} />

        <Pressable
          onPress={openStore}
          accessibilityRole="button"
          accessibilityLabel={translate("vocabulary:forceUpdate.updateNow")}
          style={({ pressed }) => [themed($primaryButton), pressed && themed($primaryButtonPressed)]}
        >
          <Text style={themed($primaryButtonText)} text={translate("vocabulary:forceUpdate.updateNow")} />
        </Pressable>

        <Pressable
          onPress={() => {
            void refreshBootstrap()
          }}
          accessibilityRole="button"
          accessibilityLabel={translate("vocabulary:forceUpdate.checkAgain")}
          style={({ pressed }) => [themed($secondaryButton), pressed && themed($secondaryButtonPressed)]}
        >
          <Text style={themed($secondaryButtonText)} text={translate("vocabulary:forceUpdate.checkAgain")} />
        </Pressable>
      </View>
    </Screen>
  )
}

const $screen: ThemedStyle<ViewStyle> = () => ({
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

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  paddingHorizontal: spacing.xl,
})

const $title: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 32,
  lineHeight: 38,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $body: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.md,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  lineHeight: 24,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $primaryButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.xl,
  minHeight: 56,
  borderRadius: 28,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $primaryButtonPressed: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.86,
})

const $primaryButtonText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: "#1A1B24",
})

const $secondaryButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
  minHeight: 48,
  borderRadius: 24,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $secondaryButtonPressed: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.88,
})

const $secondaryButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 15,
  color: colors.vocabularyShowroom.textStrong,
})
