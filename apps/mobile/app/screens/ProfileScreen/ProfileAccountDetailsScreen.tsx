import { FC, useCallback, useState } from "react"
import * as Application from "expo-application"
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { readSelectedHomeRegion } from "@/services/region/homeRegion"
import { usersApi } from "@/services/api/usersApi"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type ProfileAccountDetailsScreenProps = AppStackScreenProps<"ProfileAccountDetails">

const accountDeletionCopy = {
  sectionTitle: "Delete account",
  sectionBody:
    "Permanently delete your VocOrbit account and the app data linked to it. This action cannot be undone.",
  action: "Delete account permanently",
  deleting: "Deleting account...",
  confirmTitle: "Delete account?",
  confirmBody:
    "This permanently deletes your VocOrbit account and linked app data. This action cannot be undone.",
  confirmAction: "Delete forever",
  successTitle: "Account deleted",
  successBody: "Your VocOrbit account has been permanently deleted.",
  missingUser: "Your account ID could not be found. Please sign in again.",
  cannotConnect: "Could not reach the server. Check your connection and try again.",
  sessionExpired: "Your session expired. Please sign in again.",
  failed: "We could not delete your account right now. Please try again.",
  accessibilityLabel: "Delete account permanently",
} as const

function resolveDeleteAccountErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") {
    return accountDeletionCopy.sessionExpired
  }
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return accountDeletionCopy.cannotConnect
  }
  const message = "message" in problem ? problem.message : undefined
  return message || accountDeletionCopy.failed
}

export const ProfileAccountDetailsScreen: FC<ProfileAccountDetailsScreenProps> = ({ navigation }) => {
  const { themed, theme } = useAppTheme()
  const { authEmail, userId, setSession } = useAuth()
  const showroomColors = theme.colors.vocabularyShowroom
  const appVersion = Application.nativeApplicationVersion || "-"
  const buildNumber = Application.nativeBuildVersion || "-"
  const platform = Platform.OS
  const osVersion = String(Platform.Version ?? "-")
  const selectedRegion = readSelectedHomeRegion()
  const selectedRegionLabel = selectedRegion ? `${selectedRegion.emoji} ${selectedRegion.title}` : "-"
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | undefined>(undefined)

  const deleteAccount = useCallback(async () => {
    if (!userId) {
      setDeleteErrorMessage(accountDeletionCopy.missingUser)
      return
    }

    setIsDeleting(true)
    setDeleteErrorMessage(undefined)

    const response = await usersApi.deleteUser(userId)

    setIsDeleting(false)

    if (response.kind === "ok") {
      Alert.alert(accountDeletionCopy.successTitle, accountDeletionCopy.successBody, [
        {
          text: translate("common:ok"),
          onPress: () => setSession(undefined),
        },
      ])
      return
    }

    if (response.kind === "unauthorized") {
      setSession(undefined)
      return
    }

    setDeleteErrorMessage(resolveDeleteAccountErrorMessage(response))
  }, [setSession, userId])

  const confirmDeleteAccount = useCallback(() => {
    Alert.alert(accountDeletionCopy.confirmTitle, accountDeletionCopy.confirmBody, [
      {
        text: translate("common:cancel"),
        style: "cancel",
      },
      {
        text: accountDeletionCopy.confirmAction,
        style: "destructive",
        onPress: () => {
          void deleteAccount()
        },
      },
    ])
  }, [deleteAccount])

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
            accessibilityLabel={translate("vocabulary:accountDetails.accessibility.goBack")}
            style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
            hitSlop={6}
          >
            <Icon icon="back" size={16} color={showroomColors.textStrong} />
          </Pressable>
          <Text style={themed($headerTitle)} text={translate("vocabulary:accountDetails.title")} />
          <View style={themed($headerSpacer)}>
            <AppTutorialVideoButton
              screen="profile_account_details"
              placement="overview"
              variant="help"
              containerStyle={themed($iconButton)}
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themed($scrollContent)}
        >
          <AppTutorialVideoButton
            screen="profile_account_details"
            placement="overview"
            variant="banner"
            hideAfterSeen
            containerStyle={{ marginBottom: theme.spacing.md }}
          />

          <View style={themed($card)}>
            <Text style={themed($fieldLabel)} text={translate("vocabulary:accountDetails.emailLabel")} />
            <Text style={themed($fieldValue)} text={authEmail || "-"} />

            <Text style={themed($fieldLabel)} text={translate("vocabulary:accountDetails.userIdLabel")} />
            <Text style={themed($fieldValueSecondary)} text={userId || "-"} />

            <Text style={themed($fieldLabel)} text={translate("vocabulary:accountDetails.regionLabel")} />
            <Text style={themed($fieldValue)} text={selectedRegionLabel} />

            <Text
              style={themed($fieldLabel)}
              text={translate("vocabulary:accountDetails.appVersionLabel")}
            />
            <Text style={themed($fieldValue)} text={appVersion} />

            <Text style={themed($fieldLabel)} text={translate("vocabulary:accountDetails.buildLabel")} />
            <Text style={themed($fieldValue)} text={buildNumber} />

            <Text style={themed($fieldLabel)} text={translate("vocabulary:accountDetails.platformLabel")} />
            <Text style={themed($fieldValue)} text={platform} />

            <Text style={themed($fieldLabel)} text={translate("vocabulary:accountDetails.osVersionLabel")} />
            <Text style={themed($fieldValue)} text={osVersion} />
          </View>

          <View style={themed($dangerCard)}>
            <Text style={themed($dangerTitle)} text={accountDeletionCopy.sectionTitle} />
            <Text style={themed($dangerBody)} text={accountDeletionCopy.sectionBody} />

            {deleteErrorMessage ? (
              <View style={themed($dangerErrorWrap)}>
                <Text style={themed($dangerErrorText)} text={deleteErrorMessage} />
              </View>
            ) : null}

            <Pressable
              onPress={confirmDeleteAccount}
              disabled={isDeleting}
              accessibilityRole="button"
              accessibilityLabel={accountDeletionCopy.accessibilityLabel}
              style={({ pressed }) => [
                themed($dangerButton),
                isDeleting && themed($dangerButtonDisabled),
                pressed && !isDeleting && themed($dangerButtonPressed),
              ]}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={theme.isDark ? showroomColors.dangerText : "#FFFFFF"} />
              ) : null}
              <Text
                style={themed($dangerButtonText)}
                text={isDeleting ? accountDeletionCopy.deleting : accountDeletionCopy.action}
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

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.xl,
  paddingBottom: spacing.xl,
  gap: spacing.lg,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 24,
  padding: spacing.lg,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  gap: spacing.xs,
})

const $fieldLabel: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.medium,
  fontSize: 12,
  letterSpacing: 0.8,
  textTransform: "uppercase",
  color: colors.vocabularyShowroom.textMuted,
})

const $fieldValue: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: colors.vocabularyShowroom.textStrong,
})

const $fieldValueSecondary: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $dangerCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 24,
  padding: spacing.lg,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.dangerBorder,
  gap: spacing.sm,
})

const $dangerTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: colors.vocabularyShowroom.textStrong,
})

const $dangerBody: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textMuted,
})

const $dangerErrorWrap: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 16,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.dangerBorder,
  backgroundColor: colors.errorBackground,
})

const $dangerErrorText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  lineHeight: 18,
  color: colors.error,
})

const $dangerButton: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  minHeight: 52,
  marginTop: spacing.xs,
  borderRadius: 18,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
  borderWidth: isDark ? 1 : 0,
  borderColor: colors.vocabularyShowroom.dangerBorder,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceSoft : colors.vocabularyShowroom.dangerFill,
})

const $dangerButtonPressed: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  backgroundColor: isDark
    ? colors.vocabularyShowroom.surfaceStrong
    : colors.vocabularyShowroom.dangerFillPressed,
})

const $dangerButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.75,
})

const $dangerButtonText: ThemedStyle<TextStyle> = ({ typography, colors, isDark }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
  color: isDark ? colors.vocabularyShowroom.dangerText : "#FFFFFF",
})
