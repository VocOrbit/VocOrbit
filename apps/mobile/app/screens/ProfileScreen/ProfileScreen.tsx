import { FC } from "react"
import { Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native"

import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

type ProfileScreenProps = AppStackScreenProps<"Profile">

type ProfileIconAccent = {
  backgroundColor: string
  iconColor: string
}

const getProfileIconAccent = (
  key: "account" | "billing" | "settings" | "favorites" | "learned" | "analytics",
  isDark: boolean,
): ProfileIconAccent => {
  const accents = {
    account: isDark
      ? { backgroundColor: "rgba(96, 165, 250, 0.18)", iconColor: "#93C5FD" }
      : { backgroundColor: "rgba(59, 130, 246, 0.12)", iconColor: "#2F6FDB" },
    billing: isDark
      ? { backgroundColor: "rgba(251, 191, 36, 0.18)", iconColor: "#FCD34D" }
      : { backgroundColor: "rgba(245, 158, 11, 0.14)", iconColor: "#C57A08" },
    settings: isDark
      ? { backgroundColor: "rgba(251, 191, 36, 0.18)", iconColor: "#FCD34D" }
      : { backgroundColor: "rgba(245, 158, 11, 0.14)", iconColor: "#C57A08" },
    favorites: isDark
      ? { backgroundColor: "rgba(248, 113, 113, 0.18)", iconColor: "#FCA5A5" }
      : { backgroundColor: "rgba(239, 68, 68, 0.12)", iconColor: "#D64545" },
    learned: isDark
      ? { backgroundColor: "rgba(74, 222, 128, 0.18)", iconColor: "#86EFAC" }
      : { backgroundColor: "rgba(34, 197, 94, 0.12)", iconColor: "#2D9D63" },
    analytics: isDark
      ? { backgroundColor: "rgba(167, 139, 250, 0.18)", iconColor: "#C4B5FD" }
      : { backgroundColor: "rgba(139, 92, 246, 0.12)", iconColor: "#6A53E6" },
  } as const

  return accents[key]
}

export const ProfileScreen: FC<ProfileScreenProps> = ({ navigation }) => {
  const { themed, theme } = useAppTheme()
  const { logout } = useAuth()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const accountAccent = getProfileIconAccent("account", theme.isDark)
  const billingAccent = getProfileIconAccent("billing", theme.isDark)
  const settingsAccent = getProfileIconAccent("settings", theme.isDark)
  const favoritesAccent = getProfileIconAccent("favorites", theme.isDark)
  const learnedAccent = getProfileIconAccent("learned", theme.isDark)
  const analyticsAccent = getProfileIconAccent("analytics", theme.isDark)

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
            accessibilityLabel={translate("vocabulary:profile.accessibility.goBack")}
            style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
            hitSlop={6}
          >
            <Icon icon="back" size={16} color={showroomColors.textStrong} />
          </Pressable>
          <Text style={themed($headerTitle)} text={translate("vocabulary:profile.title")} />
          <View style={themed($headerSpacer)}>
            <AppTutorialVideoButton
              screen="profile"
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
            screen="profile"
            placement="overview"
            variant="banner"
            hideAfterSeen
            containerStyle={{ marginBottom: theme.spacing.md }}
          />

          <View style={themed($listButtonSection)}>
            <Pressable
              onPress={() => navigation.navigate("ProfileAccountDetails")}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:profile.accessibility.openAccountDetails")}
              style={({ pressed }) => [themed($listButton), pressed && themed($listButtonPressed)]}
            >
              <View
                style={[
                  themed($listButtonIconWrap),
                  { backgroundColor: accountAccent.backgroundColor },
                ]}
              >
                <Icon icon="community" size={18} color={accountAccent.iconColor} />
              </View>
              <View style={themed($listButtonContent)}>
                <Text
                  style={themed($listButtonTitle)}
                  text={translate("vocabulary:profile.accountDetailsTitle")}
                />
                <Text
                  style={themed($listButtonSubtitle)}
                  text={translate("vocabulary:profile.accountDetailsSubtitle")}
                />
              </View>
              <Icon icon="caretRight" size={16} color={showroomColors.textMuted} />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("ProfileIap")}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:settings.accessibility.openBillingCredits")}
              style={({ pressed }) => [themed($listButton), pressed && themed($listButtonPressed)]}
            >
              <View
                style={[
                  themed($listButtonIconWrap),
                  { backgroundColor: billingAccent.backgroundColor },
                ]}
              >
                <Icon icon="bell" size={18} color={billingAccent.iconColor} />
              </View>
              <View style={themed($listButtonContent)}>
                <Text
                  style={themed($listButtonTitle)}
                  text={translate("vocabulary:settings.billingCreditsTitle")}
                />
                <Text
                  style={themed($listButtonSubtitle)}
                  text={translate("vocabulary:settings.billingCreditsSubtitle")}
                />
              </View>
              <Icon icon="caretRight" size={16} color={showroomColors.textMuted} />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("ProfileWeeklyAnalytics")}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:profile.accessibility.openWeeklyAnalytics")}
              style={({ pressed }) => [themed($listButton), pressed && themed($listButtonPressed)]}
            >
              <View
                style={[
                  themed($listButtonIconWrap),
                  { backgroundColor: analyticsAccent.backgroundColor },
                ]}
              >
                <Icon icon="components" size={18} color={analyticsAccent.iconColor} />
              </View>
              <View style={themed($listButtonContent)}>
                <Text
                  style={themed($listButtonTitle)}
                  text={translate("vocabulary:profile.weeklyAnalyticsTitle")}
                />
                <Text
                  style={themed($listButtonSubtitle)}
                  text={translate("vocabulary:profile.weeklyAnalyticsSubtitle")}
                />
              </View>
              <Icon icon="caretRight" size={16} color={showroomColors.textMuted} />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("ProfileWordList", { mode: "favorites" })}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:profile.accessibility.openFavoriteWords")}
              style={({ pressed }) => [themed($listButton), pressed && themed($listButtonPressed)]}
            >
              <View
                style={[
                  themed($listButtonIconWrap),
                  { backgroundColor: favoritesAccent.backgroundColor },
                ]}
              >
                <Icon icon="heart" size={18} color={favoritesAccent.iconColor} />
              </View>
              <View style={themed($listButtonContent)}>
                <Text
                  style={themed($listButtonTitle)}
                  text={translate("vocabulary:profile.favoriteWordsTitle")}
                />
                <Text
                  style={themed($listButtonSubtitle)}
                  text={translate("vocabulary:profile.favoriteWordsSubtitle")}
                />
              </View>
              <Icon icon="caretRight" size={16} color={showroomColors.textMuted} />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("ProfileWordList", { mode: "learned" })}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:profile.accessibility.openLearnedWords")}
              style={({ pressed }) => [themed($listButton), pressed && themed($listButtonPressed)]}
            >
              <View
                style={[
                  themed($listButtonIconWrap),
                  { backgroundColor: learnedAccent.backgroundColor },
                ]}
              >
                <Icon icon="check" size={18} color={learnedAccent.iconColor} />
              </View>
              <View style={themed($listButtonContent)}>
                <Text
                  style={themed($listButtonTitle)}
                  text={translate("vocabulary:profile.learnedWordsTitle")}
                />
                <Text
                  style={themed($listButtonSubtitle)}
                  text={translate("vocabulary:profile.learnedWordsSubtitle")}
                />
              </View>
              <Icon icon="caretRight" size={16} color={showroomColors.textMuted} />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("ProfileSettings")}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:profile.accessibility.openSettings")}
              style={({ pressed }) => [themed($listButton), pressed && themed($listButtonPressed)]}
            >
              <View
                style={[
                  themed($listButtonIconWrap),
                  { backgroundColor: settingsAccent.backgroundColor },
                ]}
              >
                <Icon icon="settings" size={18} color={settingsAccent.iconColor} />
              </View>
              <View style={themed($listButtonContent)}>
                <Text
                  style={themed($listButtonTitle)}
                  text={translate("vocabulary:profile.settingsTitle")}
                />
                <Text
                  style={themed($listButtonSubtitle)}
                  text={translate("vocabulary:profile.settingsSubtitle")}
                />
              </View>
              <Icon icon="caretRight" size={16} color={showroomColors.textMuted} />
            </Pressable>
          </View>

          <View style={themed([$logoutWrap, $bottomInsets])}>
            <Pressable
              onPress={logout}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:profile.accessibility.logOut")}
              style={({ pressed }) => [
                themed($logoutButton),
                pressed && themed($logoutButtonPressed),
              ]}
            >
              <Text
                style={themed($logoutButtonText)}
                text={translate("vocabulary:profile.logOut")}
              />
            </Pressable>
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

const $listButtonSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xl,
  gap: spacing.sm,
})

const $listButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 82,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
})

const $listButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $listButtonIconWrap: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 36,
  width: 36,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $listButtonContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.sm,
})

const $listButtonTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  color: colors.vocabularyShowroom.textStrong,
})

const $listButtonSubtitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $logoutWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: "auto",
  paddingTop: spacing.xl,
})

const $logoutButton: ThemedStyle<ViewStyle> = ({ spacing, isDark, colors }) => ({
  minHeight: 56,
  borderRadius: 28,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: isDark ? 1 : 0,
  borderColor: isDark ? colors.vocabularyShowroom.dangerBorder : colors.transparent,
  backgroundColor: isDark
    ? colors.vocabularyShowroom.surface
    : colors.vocabularyShowroom.dangerFill,
  paddingHorizontal: spacing.xl,
})

const $logoutButtonPressed: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.82,
})

const $logoutButtonText: ThemedStyle<TextStyle> = ({ typography, isDark, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: isDark ? colors.vocabularyShowroom.dangerText : "#FFFFFF",
})
