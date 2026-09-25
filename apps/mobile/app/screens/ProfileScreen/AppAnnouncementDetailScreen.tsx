import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { Pressable, ScrollView, Share, TextStyle, View, ViewStyle } from "react-native"

import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import Config from "@/config"
import { useAuth } from "@/context/AuthContext"
import { useAppMeta } from "@/context/AppMetaContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { appMetaApi } from "@/services/api/appMetaApi"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { openLinkInBrowser } from "@/utils/openLinkInBrowser"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

type AppAnnouncementDetailScreenProps = AppStackScreenProps<"AppAnnouncementDetail">

function resolveErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") {
    return translate("vocabulary:errors.reloginRequired")
  }
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:errors.cannotConnect")
  }
  return translate("vocabulary:announcements.loadFailed")
}

function levelLabel(level: "info" | "warning" | "critical"): string {
  if (level === "critical") return translate("vocabulary:announcements.levelCritical")
  if (level === "warning") return translate("vocabulary:announcements.levelWarning")
  return translate("vocabulary:announcements.levelInfo")
}

function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString()
}

export const AppAnnouncementDetailScreen: FC<AppAnnouncementDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const { setSession } = useAuth()
  const { refreshBootstrap } = useAppMeta()

  const [item, setItem] = useState(route.params.announcement)
  const [isMarkingRead, setIsMarkingRead] = useState(false)
  const [isClaimingReward, setIsClaimingReward] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [requiresLogin, setRequiresLogin] = useState(false)

  const reward = item.reward
  const rewardRequirement = reward?.requirement
  const hasReferralRequirement = rewardRequirement?.type === "referral_signup"
  const hasLink = Boolean(item.deepLink ?? item.ctaUrl)
  const createdAtLabel = useMemo(() => formatDateTime(item.createdAt), [item.createdAt])

  useEffect(() => {
    setItem(route.params.announcement)
    setErrorMessage(undefined)
    setRequiresLogin(false)
  }, [route.params.announcement])

  const markAsRead = useCallback(async () => {
    if (item.isRead || isMarkingRead) return

    setIsMarkingRead(true)
    const response = await appMetaApi.markAnnouncementRead(item.id)
    setIsMarkingRead(false)

    if (response.kind === "ok" && response.data.marked) {
      setItem((prev) => ({
        ...prev,
        isRead: true,
        readAt: prev.readAt ?? new Date().toISOString(),
      }))
      await refreshBootstrap()
      return
    }

    if (response.kind === "ok") {
      setErrorMessage(translate("vocabulary:announcements.loadFailed"))
      return
    }

    if (response.kind === "unauthorized") {
      setRequiresLogin(true)
    }
    setErrorMessage(resolveErrorMessage(response))
  }, [isMarkingRead, item.id, item.isRead, refreshBootstrap])

  useEffect(() => {
    void markAsRead()
  }, [markAsRead])

  const handleOpenLink = useCallback(async () => {
    const link = item.deepLink ?? item.ctaUrl
    if (!link) return
    const didOpen = await openLinkInBrowser(link)
    if (!didOpen) {
      setErrorMessage(translate("vocabulary:errors.unexpected"))
      return
    }
  }, [item.ctaUrl, item.deepLink])

  const handleClaimReward = useCallback(async () => {
    if (!reward || !reward.canClaim || isClaimingReward) return

    setIsClaimingReward(true)
    const response = await appMetaApi.claimAnnouncementReward(item.id)
    setIsClaimingReward(false)

    if (response.kind === "ok") {
      if (response.data.claimed || response.data.reason === "already_claimed") {
        setItem((prev) => ({
          ...prev,
          reward: prev.reward
            ? {
                ...prev.reward,
                isClaimed: true,
                canClaim: false,
                claimedAt: response.data.claimedAt ?? prev.reward.claimedAt,
              }
            : prev.reward,
        }))
        if (response.data.claimed) {
          await refreshBootstrap()
        }
        return
      }

      if (response.data.reason === "announcement_inactive") {
        setErrorMessage(translate("vocabulary:announcements.claimFailed"))
        return
      }

      if (response.data.reason === "reward_requirement_not_met") {
        setItem((prev) => ({
          ...prev,
          reward: prev.reward
            ? {
                ...prev.reward,
                canClaim: false,
                requirement: response.data.requirement ?? prev.reward.requirement,
              }
            : prev.reward,
        }))
        setErrorMessage(translate("vocabulary:announcements.requirementNotMet"))
        return
      }

      setErrorMessage(translate("vocabulary:announcements.claimFailed"))
      return
    }

    if (response.kind === "unauthorized") {
      setRequiresLogin(true)
    }
    setErrorMessage(resolveErrorMessage(response))
  }, [isClaimingReward, item.id, refreshBootstrap, reward])

  const handleShareReferral = useCallback(async () => {
    const referralCode = rewardRequirement?.referralCode?.trim()
    if (!referralCode) {
      setErrorMessage(translate("vocabulary:announcements.referralCodeMissing"))
      return
    }

    const referralShareBaseUrl =
      (Config.REFERRAL_SHARE_BASE_URL || "").trim() || "https://vocorbit.com"
    const normalizedShareBaseUrl = referralShareBaseUrl.replace(/\/+$/, "")
    const inviteLink = `${normalizedShareBaseUrl}/referral?ref=${encodeURIComponent(referralCode)}`
    try {
      await Share.share({
        title: item.title,
        message: translate("vocabulary:announcements.referralShareMessage", {
          link: inviteLink,
        }),
      })
    } catch {
      setErrorMessage(translate("vocabulary:errors.unexpected"))
    }
  }, [item.title, rewardRequirement?.referralCode])

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      backgroundColor={showroomColors.background}
      systemBarStyle={theme.isDark ? "light" : "dark"}
      contentContainerStyle={themed($screen)}
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
          >
            <Icon icon="back" size={16} color={showroomColors.textStrong} />
          </Pressable>

          <Text style={themed($headerTitle)} text={translate("vocabulary:announcements.title")} />
          <View style={themed($headerSpacer)}>
            <AppTutorialVideoButton
              screen="app_announcement_detail"
              placement="overview"
              variant="help"
              containerStyle={themed($iconButton)}
            />
          </View>
        </View>

        <ScrollView
          style={themed($contentScroll)}
          contentContainerStyle={themed([$contentContainer, $bottomInsets])}
          showsVerticalScrollIndicator={false}
        >
          <AppTutorialVideoButton
            screen="app_announcement_detail"
            placement="overview"
            variant="banner"
            hideAfterSeen
            containerStyle={{ marginBottom: theme.spacing.md }}
          />

          <View style={themed($metaRow)}>
            <Text style={themed($levelBadge)} text={levelLabel(item.level)} />
            <Text style={themed($metaText)} text={createdAtLabel} />
          </View>

          <Text style={themed($title)} text={item.title} />
          <Text style={themed($body)} text={item.body} />

          {reward ? (
            <View style={themed($rewardCard)}>
              <Text
                style={themed($rewardText)}
                text={translate("vocabulary:announcements.rewardText", {
                  amount: reward.amount,
                  creditType:
                    reward.creditType === "advanced"
                      ? translate("vocabulary:announcements.creditAdvanced")
                      : translate("vocabulary:announcements.creditBasic"),
                })}
              />
              {hasReferralRequirement ? (
                <Text
                  style={themed($rewardRequirementText)}
                  text={translate("vocabulary:announcements.referralProgress", {
                    current: rewardRequirement?.currentCount ?? 0,
                    required: rewardRequirement?.requiredCount ?? 1,
                  })}
                />
              ) : null}
              <Pressable
                onPress={() => {
                  void handleClaimReward()
                }}
                disabled={!reward.canClaim || isClaimingReward}
                accessibilityRole="button"
                accessibilityLabel={translate("vocabulary:announcements.claimReward")}
                style={({ pressed }) => [
                  themed($actionButton),
                  (!reward.canClaim || isClaimingReward) && themed($actionButtonDisabled),
                  pressed && reward.canClaim && !isClaimingReward && themed($actionButtonPressed),
                ]}
              >
                <Text
                  style={themed($actionButtonText)}
                  text={
                    reward.isClaimed
                      ? translate("vocabulary:announcements.rewardClaimed")
                      : isClaimingReward
                        ? translate("vocabulary:announcements.claimingReward")
                        : translate("vocabulary:announcements.claimReward")
                  }
                />
              </Pressable>
              {hasReferralRequirement && !reward.isClaimed && !reward.canClaim ? (
                <Pressable
                  onPress={() => {
                    void handleShareReferral()
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={translate("vocabulary:announcements.shareInvite")}
                  style={({ pressed }) => [
                    themed($linkButton),
                    pressed && themed($actionButtonPressed),
                  ]}
                >
                  <Text
                    style={themed($actionButtonText)}
                    text={translate("vocabulary:announcements.shareInvite")}
                  />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {hasLink ? (
            <Pressable
              onPress={() => {
                void handleOpenLink()
              }}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:announcements.openLink")}
              style={({ pressed }) => [
                themed($linkButton),
                pressed && themed($actionButtonPressed),
              ]}
            >
              <Text
                style={themed($actionButtonText)}
                text={item.ctaLabel ?? translate("vocabulary:announcements.openLink")}
              />
            </Pressable>
          ) : null}

          {errorMessage ? (
            <View style={themed($errorWrap)}>
              <Text style={themed($errorText)} text={errorMessage} />
              <Pressable
                onPress={() => {
                  if (requiresLogin) {
                    setSession(undefined)
                    return
                  }
                  setErrorMessage(undefined)
                }}
                accessibilityRole="button"
                accessibilityLabel={
                  requiresLogin ? translate("vocabulary:common.signIn") : translate("vocabulary:common.retry")
                }
                style={({ pressed }) => [themed($errorButton), pressed && themed($errorButtonPressed)]}
              >
                <Text
                  style={themed($errorButtonText)}
                  text={
                    requiresLogin ? translate("vocabulary:common.signIn") : translate("vocabulary:common.retry")
                  }
                />
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
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

const $layout: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
})

const $headerRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $iconButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 42,
  width: 42,
  borderRadius: 21,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $iconButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $headerTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 24,
  color: colors.vocabularyShowroom.textStrong,
})

const $headerSpacer: ThemedStyle<ViewStyle> = () => ({
  width: 42,
})

const $contentScroll: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  flex: 1,
})

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xl,
})

const $metaRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $levelBadge: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  color: colors.vocabularyShowroom.textMuted,
})

const $metaText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $title: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.semiBold,
  fontSize: 30,
  lineHeight: 36,
  color: colors.vocabularyShowroom.textStrong,
})

const $body: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.md,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  lineHeight: 23,
  color: colors.vocabularyShowroom.textMuted,
})

const $rewardCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  padding: spacing.md,
  gap: spacing.sm,
})

const $rewardText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textMuted,
})

const $rewardRequirementText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $actionButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 40,
  borderRadius: 20,
  paddingHorizontal: spacing.md,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $linkButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  minHeight: 44,
  borderRadius: 22,
  paddingHorizontal: spacing.md,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $actionButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.55,
})

const $actionButtonPressed: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.88,
})

const $actionButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $errorWrap: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  borderRadius: 14,
  padding: spacing.md,
  borderWidth: 1,
  borderColor: colors.palette.angry500,
  backgroundColor: colors.palette.angry100,
  gap: spacing.xs,
})

const $errorText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  lineHeight: 18,
  color: colors.palette.angry500,
})

const $errorButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.xs,
  alignSelf: "flex-start",
  minHeight: 30,
  borderRadius: 15,
  paddingHorizontal: spacing.md,
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $errorButtonPressed: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.86,
})

const $errorButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.textStrong,
})
