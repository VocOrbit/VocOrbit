import { FC, useCallback, useMemo, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, TextStyle, View, ViewStyle } from "react-native"
import { useFocusEffect } from "@react-navigation/native"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { useAppMeta } from "@/context/AppMetaContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { type AppAnnouncement, appMetaApi } from "@/services/api/appMetaApi"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

type AppAnnouncementsScreenProps = AppStackScreenProps<"AppAnnouncements">

function resolveErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") {
    return translate("vocabulary:errors.reloginRequired")
  }
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:errors.cannotConnect")
  }
  return translate("vocabulary:announcements.loadFailed")
}

function levelLabel(level: AppAnnouncement["level"]): string {
  if (level === "critical") return translate("vocabulary:announcements.levelCritical")
  if (level === "warning") return translate("vocabulary:announcements.levelWarning")
  return translate("vocabulary:announcements.levelInfo")
}

export const AppAnnouncementsScreen: FC<AppAnnouncementsScreenProps> = ({ navigation }) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const { setSession } = useAuth()
  const { refreshBootstrap } = useAppMeta()

  const [items, setItems] = useState<AppAnnouncement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [requiresLogin, setRequiresLogin] = useState(false)

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items])

  const loadAnnouncements = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "refresh") {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setErrorMessage(undefined)
    setRequiresLogin(false)

    const response = await appMetaApi.listAnnouncements({ limit: 80 })
    if (response.kind === "ok") {
      setItems(response.data)
      setIsLoading(false)
      setIsRefreshing(false)
      return
    }

    setIsLoading(false)
    setIsRefreshing(false)
    setErrorMessage(resolveErrorMessage(response))
    setRequiresLogin(response.kind === "unauthorized")
    if (__DEV__) {
      console.warn("Announcements request failed.", response)
    }
  }, [])

  const markAsReadLocally = useCallback((announcementId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === announcementId
          ? {
              ...item,
              isRead: true,
              readAt: item.readAt ?? new Date().toISOString(),
            }
          : item,
      ),
    )
  }, [])

  const handleMarkRead = useCallback(
    async (item: AppAnnouncement) => {
      if (item.isRead || isMutating) return

      setIsMutating(true)
      const response = await appMetaApi.markAnnouncementRead(item.id)
      setIsMutating(false)

      if (response.kind === "ok" && response.data.marked) {
        markAsReadLocally(item.id)
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
    },
    [isMutating, markAsReadLocally, refreshBootstrap],
  )

  const handleMarkAllRead = useCallback(async () => {
    if (isMutating) return
    setIsMutating(true)
    const response = await appMetaApi.markAllAnnouncementsRead()
    setIsMutating(false)

    if (response.kind === "ok") {
      setItems((prev) =>
        prev.map((item) =>
          item.isRead
            ? item
            : {
                ...item,
                isRead: true,
                readAt: new Date().toISOString(),
              },
        ),
      )
      await refreshBootstrap()
      return
    }

    if (response.kind === "unauthorized") {
      setRequiresLogin(true)
    }
    setErrorMessage(resolveErrorMessage(response))
  }, [isMutating, refreshBootstrap])

  useFocusEffect(
    useCallback(() => {
      void loadAnnouncements("initial")
      void refreshBootstrap()
    }, [loadAnnouncements, refreshBootstrap]),
  )

  const renderItem = useCallback(
    ({ item }: { item: AppAnnouncement }) => {
      const hasClaimableReward = Boolean(item.reward?.canClaim)
      const nextItem =
        item.isRead
          ? item
          : {
              ...item,
              isRead: true,
              readAt: item.readAt ?? new Date().toISOString(),
            }

      return (
        <Pressable
          onPress={() => {
            if (!item.isRead) {
              void handleMarkRead(item)
            }
            navigation.navigate("AppAnnouncementDetail", { announcement: nextItem })
          }}
          accessibilityRole="button"
          accessibilityLabel={translate("vocabulary:announcements.openAnnouncement", { title: item.title })}
          style={({ pressed }) => [
            themed($card),
            !item.isRead && themed($cardUnread),
            pressed && themed($cardPressed),
          ]}
        >
          <View style={themed($cardTopRow)}>
            <Text style={themed($levelBadge)} text={levelLabel(item.level)} />
            {!item.isRead ? <View style={themed($unreadDot)} /> : null}
          </View>

          <Text style={themed($cardTitle)} text={item.title} />
          <Text style={themed($cardBody)} text={item.body} numberOfLines={3} />

          <View style={themed($cardBottomRow)}>
            <Text style={themed($openHint)} text={translate("vocabulary:common.detailButton")} />
            <View style={themed($tagRow)}>
              {hasClaimableReward ? (
                <View style={themed($tag)}>
                  <Text style={themed($tagText)} text={translate("vocabulary:announcements.claimReward")} />
                </View>
              ) : null}
            </View>
          </View>
        </Pressable>
      )
    },
    [handleMarkRead, navigation, themed],
  )

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
            hitSlop={6}
          >
            <Icon icon="back" size={16} color={showroomColors.textStrong} />
          </Pressable>

          <Text style={themed($headerTitle)} text={translate("vocabulary:announcements.title")} />
          <View style={themed($headerSpacer)} />
        </View>

        <View style={themed($metaRow)}>
          <Text
            style={themed($metaText)}
            text={translate("vocabulary:announcements.unreadCount", { count: unreadCount })}
          />
          <Pressable
            onPress={() => {
              void handleMarkAllRead()
            }}
            disabled={isMutating || unreadCount <= 0}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:announcements.markAllRead")}
            style={({ pressed }) => [
              themed($markAllButton),
              (isMutating || unreadCount <= 0) && themed($markAllButtonDisabled),
              pressed && unreadCount > 0 && !isMutating && themed($markAllButtonPressed),
            ]}
          >
            <Text style={themed($markAllButtonText)} text={translate("vocabulary:announcements.markAllRead")} />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={themed($stateWrap)}>
            <ActivityIndicator size="small" color={showroomColors.textStrong} />
            <Text style={themed($stateText)} text={translate("vocabulary:announcements.loading")} />
          </View>
        ) : items.length === 0 ? (
          <View style={themed($stateWrap)}>
            <Text style={themed($stateText)} text={translate("vocabulary:announcements.empty")} />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onRefresh={() => {
              void loadAnnouncements("refresh")
            }}
            refreshing={isRefreshing}
            contentContainerStyle={themed([$listContent, $bottomInsets])}
            showsVerticalScrollIndicator={false}
          />
        )}

        {errorMessage ? (
          <View style={themed($errorWrap)}>
            <Text style={themed($errorText)} text={errorMessage} />
            <Pressable
              onPress={() => {
                if (requiresLogin) {
                  setSession(undefined)
                } else {
                  void loadAnnouncements("refresh")
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={
                requiresLogin ? translate("vocabulary:common.signIn") : translate("vocabulary:common.retry")
              }
              style={({ pressed }) => [themed($errorButton), pressed && themed($errorButtonPressed)]}
            >
              <Text
                style={themed($errorButtonText)}
                text={requiresLogin ? translate("vocabulary:common.signIn") : translate("vocabulary:common.retry")}
              />
            </Pressable>
          </View>
        ) : null}
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

const $metaRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  marginBottom: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $metaText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textMuted,
})

const $markAllButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 34,
  borderRadius: 17,
  paddingHorizontal: spacing.md,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $markAllButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.5,
})

const $markAllButtonPressed: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.85,
})

const $markAllButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $stateWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm,
})

const $stateText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 15,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
  paddingBottom: spacing.xl,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
})

const $cardUnread: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.accent,
})

const $cardPressed: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.9,
})

const $cardTopRow: ThemedStyle<ViewStyle> = () => ({
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

const $unreadDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 10,
  width: 10,
  borderRadius: 5,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $cardTitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.semiBold,
  fontSize: 19,
  lineHeight: 24,
  color: colors.vocabularyShowroom.textStrong,
})

const $cardBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textMuted,
})

const $cardBottomRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.sm,
})

const $openHint: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $tagRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
})

const $tag: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 24,
  borderRadius: 12,
  paddingHorizontal: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $tagText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 11,
  color: colors.vocabularyShowroom.textMuted,
})

const $errorWrap: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
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
