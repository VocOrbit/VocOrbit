import { FC, useCallback, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { useFocusEffect } from "@react-navigation/native"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import {
  billingApi,
  type BillingStore,
  type BillingSubscriptionState,
} from "@/services/api/billingApi"
import {
  wordInsightApi,
  type WordInsightCreditBalances,
} from "@/services/api/wordInsightApi"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type ProfileIapScreenProps = AppStackScreenProps<"ProfileIap">

function resolveProblemMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") {
    return problem.message || translate("vocabulary:iap.errors.unauthorized")
  }
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:iap.errors.cannotConnect")
  }
  if (problem.kind === "forbidden") {
    return problem.message || translate("vocabulary:iap.errors.forbidden")
  }
  if (problem.kind === "rejected" || problem.kind === "not-found" || problem.kind === "server") {
    return problem.message || translate("vocabulary:iap.errors.generic")
  }
  return translate("vocabulary:iap.errors.generic")
}

function resolveSubscriptionStatus(status: BillingSubscriptionState["status"]): string {
  if (status === "active") return translate("vocabulary:iap.status.active")
  if (status === "pending") return translate("vocabulary:iap.status.pending")
  if (status === "expired") return translate("vocabulary:iap.status.expired")
  if (status === "canceled") return translate("vocabulary:iap.status.canceled")
  if (status === "refunded") return translate("vocabulary:iap.status.refunded")
  return translate("vocabulary:iap.status.none")
}

function resolveStoreLabel(store?: BillingStore): string | undefined {
  if (store === "apple") return "App Store"
  if (store === "google") return "Google Play"
  return undefined
}

function formatNumber(value?: number): string {
  return new Intl.NumberFormat().format(value ?? 0)
}

function formatDate(value?: string): string | undefined {
  if (!value) return undefined

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date)
}

export const ProfileIapScreen: FC<ProfileIapScreenProps> = ({ navigation }) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom

  const [subscription, setSubscription] = useState<BillingSubscriptionState | undefined>()
  const [creditBalances, setCreditBalances] = useState<WordInsightCreditBalances | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadBillingState = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "refresh") {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    setErrorMessage(undefined)

    try {
      const [subscriptionResponse, creditsResponse] = await Promise.all([
        billingApi.getSubscription(),
        wordInsightApi.getCreditBalances(),
      ])

      if (
        subscriptionResponse.kind === "unauthorized" ||
        creditsResponse.kind === "unauthorized"
      ) {
        setSubscription(undefined)
        setCreditBalances(undefined)
        setErrorMessage(translate("vocabulary:iap.errors.unauthorized"))
        return
      }

      let nextError: string | undefined

      if (subscriptionResponse.kind === "ok") {
        setSubscription(subscriptionResponse.data)
      } else {
        setSubscription(undefined)
        nextError = resolveProblemMessage(subscriptionResponse)
      }

      if (creditsResponse.kind === "ok") {
        setCreditBalances(creditsResponse.data)
      } else {
        setCreditBalances(undefined)
        nextError = nextError ?? resolveProblemMessage(creditsResponse)
      }

      setErrorMessage(nextError)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void loadBillingState("initial")
      return undefined
    }, [loadBillingState]),
  )

  const availableBasic = useMemo(() => {
    if (!creditBalances) return undefined
    return creditBalances.freeBasic + creditBalances.paidBasic
  }, [creditBalances])

  const availableAdvanced = useMemo(() => {
    if (!creditBalances) return undefined
    return creditBalances.freeAdvanced + creditBalances.paidAdvanced
  }, [creditBalances])

  const subscriptionStatus = subscription?.status ?? "none"
  const subscriptionStatusLabel = resolveSubscriptionStatus(subscriptionStatus)
  const currentPlanLabel = subscription?.plan?.sku ?? subscription?.sku
  const storeLabel = resolveStoreLabel(subscription?.store)
  const renewalDate = formatDate(subscription?.expiresAt)
  const updatedDate = formatDate(subscription?.updatedAt)

  const statusToneStyle =
    subscriptionStatus === "active"
      ? themed($statusPillActive)
      : subscriptionStatus === "pending"
        ? themed($statusPillPending)
        : subscriptionStatus === "expired" ||
            subscriptionStatus === "canceled" ||
            subscriptionStatus === "refunded"
          ? themed($statusPillDanger)
          : themed($statusPillNeutral)

  const statusToneTextStyle =
    subscriptionStatus === "active"
      ? themed($statusPillActiveText)
      : subscriptionStatus === "pending"
        ? themed($statusPillPendingText)
        : subscriptionStatus === "expired" ||
            subscriptionStatus === "canceled" ||
            subscriptionStatus === "refunded"
          ? themed($statusPillDangerText)
          : themed($statusPillNeutralText)

  const hasLoadedState = !isLoading || Boolean(subscription) || Boolean(creditBalances)

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      backgroundColor={showroomColors.background}
      contentContainerStyle={themed($screen)}
    >
      <View style={themed($container)}>
        <View style={themed($headerRow)}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:profile.accessibility.goBack")}
            style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
          >
            <Icon icon="back" size={16} color={showroomColors.textStrong} />
          </Pressable>

          <View style={themed($headerCopy)}>
            <Text style={themed($headerTitle)} text={translate("vocabulary:iap.title")} />
            <Text
              style={themed($headerSubtitle)}
              text={translate("vocabulary:iap.desktop.subtitle")}
            />
          </View>

          <Pressable
            onPress={() => void loadBillingState("refresh")}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:iap.accessibility.refresh")}
            style={({ pressed }) => [
              themed($refreshButton),
              pressed && themed($refreshButtonPressed),
            ]}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={showroomColors.accentText} />
            ) : null}
            <Text
              style={themed($refreshButtonText)}
              text={translate("vocabulary:iap.refresh")}
            />
          </Pressable>
        </View>

        <View style={themed($heroCard)}>
          <View style={themed($badgeRow)}>
            <View style={themed($heroBadge)}>
              <Text
                style={themed($heroBadgeText)}
                text={translate("vocabulary:iap.desktop.desktopBadge")}
              />
            </View>
            <View style={themed($heroBadgeOutline)}>
              <Text
                style={themed($heroBadgeOutlineText)}
                text={translate("vocabulary:iap.desktop.phoneOnlyBadge")}
              />
            </View>
          </View>
          <Text
            style={themed($heroTitle)}
            text={translate("vocabulary:iap.desktop.balanceTitle")}
          />
          <Text
            style={themed($heroBody)}
            text={translate("vocabulary:iap.desktop.balanceBody")}
          />
        </View>

        {errorMessage ? (
          <View style={themed($errorCard)}>
            <Text style={themed($errorTitle)} text={translate("vocabulary:iap.title")} />
            <Text style={themed($errorBody)} text={errorMessage} />
          </View>
        ) : null}

        {!hasLoadedState ? (
          <View style={themed($loadingCard)}>
            <ActivityIndicator size="small" color={showroomColors.textStrong} />
            <Text style={themed($loadingText)} text={translate("vocabulary:iap.loading")} />
          </View>
        ) : (
          <>
            <View style={themed($metricGrid)}>
              <View style={[themed($metricCard), themed($metricCardAccent)]}>
                <Text
                  style={themed($metricLabelAccent)}
                  text={translate("vocabulary:iap.desktop.basicAvailable")}
                />
                <Text
                  style={themed($metricValueAccent)}
                  text={availableBasic !== undefined ? formatNumber(availableBasic) : "—"}
                />
                <View style={themed($metricSplitRow)}>
                  <View style={[themed($metricSplitPill), themed($metricSplitPillAccent)]}>
                    <Text
                      style={themed($metricSplitLabelAccent)}
                      text={translate("vocabulary:iap.desktop.freeCredits")}
                    />
                    <Text
                      style={themed($metricSplitValueAccent)}
                      text={formatNumber(creditBalances?.freeBasic)}
                    />
                  </View>
                  <View style={[themed($metricSplitPill), themed($metricSplitPillAccent)]}>
                    <Text
                      style={themed($metricSplitLabelAccent)}
                      text={translate("vocabulary:iap.desktop.paidCredits")}
                    />
                    <Text
                      style={themed($metricSplitValueAccent)}
                      text={formatNumber(creditBalances?.paidBasic)}
                    />
                  </View>
                </View>
              </View>

              <View style={themed($metricCard)}>
                <Text
                  style={themed($metricLabel)}
                  text={translate("vocabulary:iap.desktop.advancedAvailable")}
                />
                <Text
                  style={themed($metricValue)}
                  text={availableAdvanced !== undefined ? formatNumber(availableAdvanced) : "—"}
                />
                <View style={themed($metricSplitRow)}>
                  <View style={themed($metricSplitPill)}>
                    <Text
                      style={themed($metricSplitLabel)}
                      text={translate("vocabulary:iap.desktop.freeCredits")}
                    />
                    <Text
                      style={themed($metricSplitValue)}
                      text={formatNumber(creditBalances?.freeAdvanced)}
                    />
                  </View>
                  <View style={themed($metricSplitPill)}>
                    <Text
                      style={themed($metricSplitLabel)}
                      text={translate("vocabulary:iap.desktop.paidCredits")}
                    />
                    <Text
                      style={themed($metricSplitValue)}
                      text={formatNumber(creditBalances?.paidAdvanced)}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={themed($contentGrid)}>
              <View style={themed($sectionCard)}>
                <View style={themed($sectionHeaderRow)}>
                  <Text
                    style={themed($sectionTitle)}
                    text={translate("vocabulary:iap.currentSubscription")}
                  />
                  <View style={[themed($statusPillBase), statusToneStyle]}>
                    <Text style={statusToneTextStyle} text={subscriptionStatusLabel} />
                  </View>
                </View>

                {currentPlanLabel ? (
                  <Text
                    style={themed($sectionLead)}
                    text={translate("vocabulary:iap.currentPlan", { plan: currentPlanLabel })}
                  />
                ) : (
                  <Text
                    style={themed($sectionBody)}
                    text={translate("vocabulary:iap.desktop.noPlanBody")}
                  />
                )}

                {subscription?.plan ? (
                  <View style={themed($metaStack)}>
                    <Text
                      style={themed($metaText)}
                      text={translate("vocabulary:iap.planTopup", {
                        basic: subscription.plan.monthlyPaidBasicTopup,
                        advanced: subscription.plan.monthlyPaidAdvancedTopup,
                      })}
                    />
                    <Text
                      style={themed($metaText)}
                      text={translate("vocabulary:iap.planCaps", {
                        basicCap: subscription.plan.paidBasicCap,
                        advancedCap: subscription.plan.paidAdvancedCap,
                      })}
                    />
                  </View>
                ) : null}

                <View style={themed($metaStack)}>
                  {storeLabel ? (
                    <Text
                      style={themed($metaText)}
                      text={translate("vocabulary:iap.desktop.storeLabel", { store: storeLabel })}
                    />
                  ) : null}
                  {renewalDate ? (
                    <Text
                      style={themed($metaText)}
                      text={translate(
                        subscriptionStatus === "expired" ||
                          subscriptionStatus === "canceled" ||
                          subscriptionStatus === "refunded"
                          ? "vocabulary:iap.desktop.expiresOn"
                          : "vocabulary:iap.desktop.renewsOn",
                        { date: renewalDate },
                      )}
                    />
                  ) : null}
                  {updatedDate ? (
                    <Text
                      style={themed($metaText)}
                      text={translate("vocabulary:iap.desktop.updatedOn", { date: updatedDate })}
                    />
                  ) : null}
                </View>
              </View>

              <View style={themed($sectionCard)}>
                <View style={themed($sectionHeaderRow)}>
                  <Text
                    style={themed($sectionTitle)}
                    text={translate("vocabulary:iap.desktop.mobileTitle")}
                  />
                  <View style={[themed($statusPillBase), themed($phonePill)]}>
                    <Text
                      style={themed($phonePillText)}
                      text={translate("vocabulary:iap.desktop.phoneOnlyBadge")}
                    />
                  </View>
                </View>

                <Text
                  style={themed($sectionBody)}
                  text={translate("vocabulary:iap.desktop.mobileBody")}
                />

                <View style={themed($stepList)}>
                  <View style={themed($stepRow)}>
                    <View style={themed($stepBullet)}>
                      <Text style={themed($stepBulletText)} text="1" />
                    </View>
                    <Text
                      style={themed($stepText)}
                      text={translate("vocabulary:iap.desktop.stepOpenPhone")}
                    />
                  </View>
                  <View style={themed($stepRow)}>
                    <View style={themed($stepBullet)}>
                      <Text style={themed($stepBulletText)} text="2" />
                    </View>
                    <Text
                      style={themed($stepText)}
                      text={translate("vocabulary:iap.desktop.stepOpenBilling")}
                    />
                  </View>
                  <View style={themed($stepRow)}>
                    <View style={themed($stepBullet)}>
                      <Text style={themed($stepBulletText)} text="3" />
                    </View>
                    <Text
                      style={themed($stepText)}
                      text={translate("vocabulary:iap.desktop.stepFinishPurchase")}
                    />
                  </View>
                </View>

                <View style={themed($hintCard)}>
                  <Text
                    style={themed($hintText)}
                    text={translate("vocabulary:iap.desktop.mobileHint")}
                  />
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </Screen>
  )
}

const $screen: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xxl,
})

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 1100,
  alignSelf: "center",
  gap: spacing.lg,
})

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
  flexWrap: "wrap",
})

const $headerCopy: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  minWidth: 260,
  gap: spacing.xs,
})

const $headerTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 28,
  lineHeight: 34,
  color: colors.vocabularyShowroom.textStrong,
})

const $headerSubtitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 15,
  lineHeight: 22,
  color: colors.vocabularyShowroom.textMuted,
})

const $iconButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 44,
  width: 44,
  borderRadius: 22,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $iconButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $refreshButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 44,
  borderRadius: 22,
  paddingHorizontal: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  gap: spacing.xs,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $refreshButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $refreshButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: colors.vocabularyShowroom.accentText,
})

const $heroCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: spacing.xl,
  padding: spacing.xl,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  gap: spacing.md,
})

const $badgeRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
})

const $heroBadge: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 999,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $heroBadgeText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 12,
  color: colors.vocabularyShowroom.accentText,
  textTransform: "uppercase",
  letterSpacing: 0.3,
})

const $heroBadgeOutline: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 999,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $heroBadgeOutlineText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
  textTransform: "uppercase",
  letterSpacing: 0.3,
})

const $heroTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 24,
  lineHeight: 30,
  color: colors.vocabularyShowroom.textStrong,
})

const $heroBody: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 15,
  lineHeight: 24,
  color: colors.vocabularyShowroom.textMuted,
  maxWidth: 760,
})

const $errorCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: spacing.lg,
  padding: spacing.lg,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.dangerBorder,
  gap: spacing.xs,
})

const $errorTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
  color: colors.vocabularyShowroom.dangerText,
})

const $errorBody: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 21,
  color: colors.vocabularyShowroom.textStrong,
})

const $loadingCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: spacing.xl,
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  gap: spacing.sm,
})

const $loadingText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textMuted,
})

const $metricGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.lg,
})

const $metricCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexGrow: 1,
  flexBasis: 320,
  minWidth: 280,
  borderRadius: spacing.xl,
  padding: spacing.xl,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  gap: spacing.md,
})

const $metricCardAccent: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accent,
  borderColor: "transparent",
})

const $metricLabel: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
  textTransform: "uppercase",
  letterSpacing: 0.3,
})

const $metricLabelAccent: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.accentText,
  opacity: 0.78,
  textTransform: "uppercase",
  letterSpacing: 0.3,
})

const $metricValue: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 42,
  lineHeight: 46,
  color: colors.vocabularyShowroom.textStrong,
})

const $metricValueAccent: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 42,
  lineHeight: 46,
  color: colors.vocabularyShowroom.accentText,
})

const $metricSplitRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
})

const $metricSplitPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexGrow: 1,
  minWidth: 120,
  borderRadius: spacing.md,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  gap: spacing.xxs,
})

const $metricSplitPillAccent: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $metricSplitLabel: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $metricSplitLabelAccent: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.accentText,
  opacity: 0.72,
})

const $metricSplitValue: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: colors.vocabularyShowroom.textStrong,
})

const $metricSplitValueAccent: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: colors.vocabularyShowroom.accentText,
})

const $contentGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.lg,
})

const $sectionCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexGrow: 1,
  flexBasis: 420,
  minWidth: 300,
  borderRadius: spacing.xl,
  padding: spacing.xl,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  gap: spacing.md,
})

const $sectionHeaderRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: spacing.sm,
  flexWrap: "wrap",
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 20,
  color: colors.vocabularyShowroom.textStrong,
})

const $sectionLead: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 15,
  lineHeight: 22,
  color: colors.vocabularyShowroom.textStrong,
})

const $sectionBody: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 15,
  lineHeight: 24,
  color: colors.vocabularyShowroom.textMuted,
})

const $metaStack: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $metaText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 21,
  color: colors.vocabularyShowroom.textStrong,
})

const $statusPillBase: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  borderRadius: 999,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
})

const $statusPillActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $statusPillActiveText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 12,
  color: colors.vocabularyShowroom.accentText,
})

const $statusPillPending: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $statusPillPendingText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 12,
  color: colors.vocabularyShowroom.textStrong,
})

const $statusPillDanger: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.dangerFill,
})

const $statusPillDangerText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 12,
  color: colors.vocabularyShowroom.textStrong,
})

const $statusPillNeutral: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $statusPillNeutralText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $phonePill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $phonePillText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $stepList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
})

const $stepRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.sm,
})

const $stepBullet: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 28,
  height: 28,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $stepBulletText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $stepText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flex: 1,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 21,
  color: colors.vocabularyShowroom.textStrong,
})

const $hintCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: spacing.lg,
  padding: spacing.md,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $hintText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textMuted,
})
