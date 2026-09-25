import { FC, useEffect, useMemo, useState } from "react"
import * as Application from "expo-application"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { useLanguagePreferences } from "@/context/LanguagePreferencesContext"
import { appMetaApi, type AppTutorialVideo, type MobilePlatform } from "@/services/api/appMetaApi"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { openLinkInBrowser } from "@/utils/openLinkInBrowser"
import { loadString, saveString } from "@/utils/storage"

type TutorialVideoVariant = "chip" | "banner" | "help"

type TutorialVideoSource = {
  screen: string
  placement: string
}

type AppTutorialVideoButtonProps = {
  screen: string
  placement: string
  sources?: TutorialVideoSource[]
  variant?: TutorialVideoVariant
  limit?: number
  compactAfterSeen?: boolean
  hideAfterSeen?: boolean
  containerStyle?: StyleProp<ViewStyle>
}

type TutorialVideoCacheEntry = {
  expiresAt: number
  videos: AppTutorialVideo[]
}

const TUTORIAL_VIDEO_CACHE_TTL_MS = 6 * 60 * 60 * 1000
const tutorialVideoCache = new Map<string, TutorialVideoCacheEntry>()

function resolveMobilePlatform(): MobilePlatform {
  return Platform.OS === "android" ? "android" : "ios"
}

function resolveCurrentAppVersion(): string | undefined {
  const version = Application.nativeApplicationVersion
  if (typeof version !== "string") return undefined
  const trimmed = version.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeLocale(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase().replaceAll("_", "-")
  return normalized && normalized.length > 0 ? normalized : undefined
}

function buildCacheKey(input: {
  screen: string
  placement: string
  locale?: string
  platform: MobilePlatform
  appVersion?: string
  limit: number
}): string {
  return [
    input.screen,
    input.placement,
    input.locale ?? "-",
    input.platform,
    input.appVersion ?? "-",
    input.limit,
  ].join("|")
}

function seenStorageKey(videoId: string): string {
  return `appTutorialVideo.seen.${videoId}`
}

function formatDuration(seconds: number | undefined): string | undefined {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) return undefined
  const totalSeconds = Math.max(1, Math.floor(seconds))
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`
}

function buildVideoSubtitle(video: AppTutorialVideo): string | undefined {
  const description = video.description?.trim()
  const durationLabel = formatDuration(video.durationSeconds)
  if (description && durationLabel) return `${description} · ${durationLabel}`
  return description || durationLabel
}

async function loadTutorialVideos(input: {
  screen: string
  placement: string
  locale?: string
  platform: MobilePlatform
  appVersion?: string
  limit: number
}): Promise<AppTutorialVideo[]> {
  const cacheKey = buildCacheKey(input)
  const now = Date.now()
  const cached = tutorialVideoCache.get(cacheKey)
  if (cached && cached.expiresAt > now) {
    return cached.videos
  }

  const response = await appMetaApi.listTutorialVideos(input)
  if (response.kind !== "ok") {
    if (__DEV__) {
      console.warn("Tutorial video request failed.", response)
    }
    return cached?.videos ?? []
  }

  tutorialVideoCache.set(cacheKey, {
    expiresAt: now + TUTORIAL_VIDEO_CACHE_TTL_MS,
    videos: response.data,
  })
  return response.data
}

export const AppTutorialVideoButton: FC<AppTutorialVideoButtonProps> = ({
  screen,
  placement,
  sources,
  variant = "chip",
  limit = 3,
  compactAfterSeen = true,
  hideAfterSeen = false,
  containerStyle,
}) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const { isAuthenticated } = useAuth()
  const { preferences } = useLanguagePreferences()
  const [videos, setVideos] = useState<AppTutorialVideo[]>([])
  const [isOpening, setIsOpening] = useState(false)
  const [hasSeen, setHasSeen] = useState(false)
  const [isVideoListVisible, setIsVideoListVisible] = useState(false)
  const locale = normalizeLocale(preferences?.l1Language)
  const platform = resolveMobilePlatform()
  const appVersion = resolveCurrentAppVersion()
  const resolvedLimit = Math.max(1, Math.floor(limit))
  const resolvedSources = useMemo(
    () => (sources && sources.length > 0 ? sources : [{ screen, placement }]),
    [placement, screen, sources],
  )
  const sourceKey = useMemo(
    () => resolvedSources.map((source) => `${source.screen}:${source.placement}`).join("|"),
    [resolvedSources],
  )
  const video = videos[0]

  useEffect(() => {
    let isMounted = true

    if (!isAuthenticated) {
      setVideos([])
      setIsVideoListVisible(false)
      return () => {
        isMounted = false
      }
    }

    void Promise.all(
      resolvedSources.map((source) =>
        loadTutorialVideos({
          screen: source.screen,
          placement: source.placement,
          locale,
          platform,
          appVersion,
          limit: resolvedLimit,
        }),
      ),
    ).then((videoGroups) => {
      if (!isMounted) return
      const uniqueVideos = videoGroups.flat().filter((nextVideo, index, allVideos) => {
        return allVideos.findIndex((candidate) => candidate.id === nextVideo.id) === index
      })
      setVideos(uniqueVideos)
      setHasSeen(uniqueVideos.some((nextVideo) => loadString(seenStorageKey(nextVideo.id)) === "true"))
    })

    return () => {
      isMounted = false
    }
  }, [
    appVersion,
    isAuthenticated,
    locale,
    platform,
    resolvedLimit,
    resolvedSources,
    sourceKey,
  ])

  const accessibilityLabel = video
    ? `Open tutorial video: ${video.title}`
    : `Open tutorial video for ${placement}`

  const subtitle = useMemo(() => {
    if (!video) return undefined
    return buildVideoSubtitle(video)
  }, [video])
  const chipDurationLabel = formatDuration(video?.durationSeconds)

  async function handleOpenVideo(nextVideo: AppTutorialVideo) {
    if (isOpening) return
    setIsOpening(true)
    const didOpen = await openLinkInBrowser(nextVideo.youtubeUrl)
    if (didOpen) {
      saveString(seenStorageKey(nextVideo.id), "true")
      setHasSeen(true)
      setIsVideoListVisible(false)
    }
    setIsOpening(false)
  }

  if (!isAuthenticated || !video) return null

  if (hideAfterSeen && hasSeen) return null

  if (variant === "help" || (compactAfterSeen && hasSeen)) {
    return (
      <>
        <Pressable
          onPress={() => setIsVideoListVisible(true)}
          disabled={isOpening}
          accessibilityRole="button"
          accessibilityLabel={`Open help videos for ${placement}`}
          style={({ pressed }) => [
            themed($helpButton),
            containerStyle,
            pressed && themed($helpButtonPressed),
            isOpening && themed($disabled),
          ]}
        >
          <MaterialCommunityIcons
            name="help-circle-outline"
            size={22}
            color={showroomColors.textStrong}
          />
        </Pressable>

        <Modal
          visible={isVideoListVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsVideoListVisible(false)}
        >
          <View style={themed($modalBackdrop)}>
            <View style={themed($videoSheet)}>
              <View style={themed($sheetHeader)}>
                <Text text="Help videos" style={themed($sheetTitle)} />
                <Pressable
                  onPress={() => setIsVideoListVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close help videos"
                  style={({ pressed }) => [
                    themed($sheetCloseButton),
                    pressed && themed($sheetCloseButtonPressed),
                  ]}
                  hitSlop={6}
                >
                  <MaterialCommunityIcons name="close" size={18} color={showroomColors.textStrong} />
                </Pressable>
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={themed($videoListContent)}
              >
                {videos.map((tutorialVideo) => {
                  const videoSubtitle = buildVideoSubtitle(tutorialVideo)

                  return (
                    <Pressable
                      key={tutorialVideo.id}
                      onPress={() => {
                        void handleOpenVideo(tutorialVideo)
                      }}
                      disabled={isOpening}
                      accessibilityRole="button"
                      accessibilityLabel={`Open tutorial video: ${tutorialVideo.title}`}
                      style={({ pressed }) => [
                        themed($videoListItem),
                        pressed && themed($videoListItemPressed),
                        isOpening && themed($disabled),
                      ]}
                    >
                      <View style={themed($videoListIconWrap)}>
                        <MaterialCommunityIcons
                          name="play-circle-outline"
                          size={22}
                          color={showroomColors.textStrong}
                        />
                      </View>
                      <View style={themed($videoListCopy)}>
                        <Text
                          text={tutorialVideo.title}
                          style={themed($videoListTitle)}
                          numberOfLines={2}
                        />
                        {videoSubtitle ? (
                          <Text
                            text={videoSubtitle}
                            style={themed($videoListSubtitle)}
                            numberOfLines={2}
                          />
                        ) : null}
                      </View>
                      <MaterialCommunityIcons
                        name="open-in-new"
                        size={16}
                        color={showroomColors.textMuted}
                      />
                    </Pressable>
                  )
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </>
    )
  }

  if (variant === "banner") {
    return (
      <Pressable
        onPress={() => {
          void handleOpenVideo(video)
        }}
        disabled={!video || isOpening}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          themed($banner),
          containerStyle,
          pressed && themed($bannerPressed),
          (!video || isOpening) && themed($disabled),
        ]}
      >
        <View style={themed($bannerIconWrap)}>
          <MaterialCommunityIcons
            name={hasSeen ? "play-circle-outline" : "play-circle"}
            size={24}
            color={showroomColors.textStrong}
          />
        </View>
        <View style={themed($bannerCopy)}>
          <Text
            text={video?.title ?? "Video guide"}
            style={themed($bannerTitle)}
            numberOfLines={1}
          />
          {subtitle ? (
            <Text text={subtitle} style={themed($bannerSubtitle)} numberOfLines={2} />
          ) : null}
        </View>
        <MaterialCommunityIcons name="open-in-new" size={17} color={showroomColors.textMuted} />
      </Pressable>
    )
  }

  return (
    <Pressable
      onPress={() => {
        void handleOpenVideo(video)
      }}
      disabled={!video || isOpening}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        themed($chip),
        containerStyle,
        pressed && themed($chipPressed),
        (!video || isOpening) && themed($disabled),
      ]}
    >
      <MaterialCommunityIcons
        name="play-circle-outline"
        size={17}
        color={showroomColors.textStrong}
      />
      <Text
        text={video?.title ?? "Video guide"}
        style={themed($chipText)}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
      />
      {chipDurationLabel ? (
        <Text text={chipDurationLabel} style={themed($chipMeta)} numberOfLines={1} />
      ) : null}
    </Pressable>
  )
}

const $helpButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 42,
  height: 42,
  borderRadius: 21,
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "flex-start",
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $helpButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $modalBackdrop: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  padding: spacing.lg,
  backgroundColor: "rgba(15, 23, 42, 0.52)",
})

const $videoSheet: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "100%",
  maxHeight: "74%",
  borderRadius: 22,
  padding: spacing.md,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $sheetHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.md,
})

const $sheetTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flex: 1,
  fontFamily: typography.primary.semiBold,
  fontSize: 17,
  lineHeight: 23,
  color: colors.vocabularyShowroom.textStrong,
})

const $sheetCloseButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 34,
  height: 34,
  borderRadius: 17,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $sheetCloseButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $videoListContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xs,
  gap: spacing.sm,
})

const $videoListItem: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 68,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.sm,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $videoListItemPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $videoListIconWrap: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.sm,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $videoListCopy: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginRight: spacing.sm,
})

const $videoListTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  lineHeight: 19,
  color: colors.vocabularyShowroom.textStrong,
})

const $videoListSubtitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  lineHeight: 17,
  color: colors.vocabularyShowroom.textMuted,
})

const $banner: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: "100%",
  minHeight: 66,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $bannerPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $bannerIconWrap: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: 42,
  height: 42,
  borderRadius: 21,
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.sm,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $bannerCopy: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginRight: spacing.sm,
})

const $bannerTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  lineHeight: 19,
  color: colors.vocabularyShowroom.textStrong,
})

const $bannerSubtitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  lineHeight: 17,
  color: colors.vocabularyShowroom.textMuted,
})

const $chip: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  maxWidth: "100%",
  minHeight: 38,
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "center",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $chipPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $chipText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  flexShrink: 1,
  marginLeft: spacing.xs,
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.textStrong,
})

const $chipMeta: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginLeft: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 11,
  color: colors.vocabularyShowroom.textMuted,
})

const $disabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.68,
})
