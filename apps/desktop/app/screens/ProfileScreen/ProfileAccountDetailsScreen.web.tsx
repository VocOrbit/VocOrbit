import { FC } from "react"
import { Platform, Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { readSelectedHomeRegion } from "@/services/region/homeRegion"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type ProfileAccountDetailsScreenProps = AppStackScreenProps<"ProfileAccountDetails">

const packageJson = require("../../../package.json") as { version?: string }

export const ProfileAccountDetailsScreen: FC<ProfileAccountDetailsScreenProps> = ({ navigation }) => {
  const { themed, theme } = useAppTheme()
  const { authEmail, userId } = useAuth()
  const showroomColors = theme.colors.vocabularyShowroom
  const selectedRegion = readSelectedHomeRegion()
  const selectedRegionLabel = selectedRegion ? `${selectedRegion.emoji} ${selectedRegion.title}` : "-"
  const appVersion = packageJson.version || "-"
  const buildNumber = "-"
  const platform = Platform.OS
  const osVersion =
    typeof navigator !== "undefined" ? navigator.userAgent : String(Platform.Version ?? "-")

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      backgroundColor={showroomColors.background}
      contentContainerStyle={themed($screenContent)}
    >
      <View style={themed($layout)}>
        <View style={themed($headerRow)}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:accountDetails.accessibility.goBack")}
            style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
          >
            <Icon icon="back" size={16} color={showroomColors.textStrong} />
          </Pressable>
          <Text style={themed($headerTitle)} text={translate("vocabulary:accountDetails.title")} />
          <View style={themed($headerSpacer)} />
        </View>

        <ScrollView contentContainerStyle={themed($scrollContent)} showsVerticalScrollIndicator={false}>
          <View style={themed($card)}>
            <Text style={themed($fieldLabel)} text={translate("vocabulary:accountDetails.emailLabel")} />
            <Text style={themed($fieldValue)} text={authEmail || "-"} />

            <Text style={themed($fieldLabel)} text={translate("vocabulary:accountDetails.userIdLabel")} />
            <Text style={themed($fieldValueSecondary)} text={userId || "-"} />

            <Text style={themed($fieldLabel)} text={translate("vocabulary:accountDetails.regionLabel")} />
            <Text style={themed($fieldValue)} text={selectedRegionLabel} />

            <Text style={themed($fieldLabel)} text={translate("vocabulary:accountDetails.appVersionLabel")} />
            <Text style={themed($fieldValue)} text={appVersion} />

            <Text style={themed($fieldLabel)} text={translate("vocabulary:accountDetails.buildLabel")} />
            <Text style={themed($fieldValue)} text={buildNumber} />

            <Text style={themed($fieldLabel)} text={translate("vocabulary:accountDetails.platformLabel")} />
            <Text style={themed($fieldValue)} text={platform} />

            <Text style={themed($fieldLabel)} text={translate("vocabulary:accountDetails.osVersionLabel")} />
            <Text style={themed($fieldValue)} text={osVersion} numberOfLines={3} />
          </View>

        </ScrollView>
      </View>
    </Screen>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $layout: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.lg,
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
  fontSize: 20,
  color: colors.vocabularyShowroom.textStrong,
})

const $headerSpacer: ThemedStyle<ViewStyle> = () => ({
  height: 40,
  width: 40,
})

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.lg,
  paddingBottom: spacing.xxl,
  gap: spacing.lg,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: spacing.lg,
  padding: spacing.lg,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  gap: spacing.xs,
})

const $fieldLabel: ThemedStyle<TextStyle> = ({ typography, colors, spacing }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
  textTransform: "uppercase",
})

const $fieldValue: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 15,
  color: colors.vocabularyShowroom.textStrong,
})

const $fieldValueSecondary: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.code?.normal ?? typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

