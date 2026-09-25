import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  TextStyle,
  View,
  ViewToken,
  ViewStyle,
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import { Icon, IconTypes } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { type VocabularyActionKey, useUiPreferences } from "@/context/UiPreferencesContext"
import { translate } from "@/i18n/translate"
import { isDesktopShellRuntime } from "@/services/desktop/desktopQuickLookupBridge"
import { speakWord } from "@/services/pronunciation/pronunciationService"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

import type { VocabularyShowroomViewModel } from "./useVocabularyShowroomViewModel"
import type { VocabularyEntry } from "../types"

type VocabularyShowroomViewProps = VocabularyShowroomViewModel & {
  announcementUnreadCount: number
  hasRecommendedUpdate: boolean
  recommendedUpdateMessage?: string
  onRequestDetails: (entryId: string) => void
  onRequestPractice: () => void
  onRequestProfile: () => void
  onRequestSearch: () => void
  onRequestAddWord: () => void
  onRequestAnnouncements: () => void
  onRequestUpdate: () => void
  onDismissRecommendedUpdate: () => void
}

type VocabularyContentProps = {
  item: VocabularyEntry
  height: number
  variant: "card" | "list"
  fontScale: number
  actionOrder: VocabularyActionKey[]
  isFavoriteActive: boolean
  isFavoriteMutating: boolean
  isRepeatActive: boolean
  onPressPronunciation: (entry: VocabularyEntry) => void
  onPressDetails: (entryId: string) => void
  onPressFavorite: (entry: VocabularyEntry) => void
  onPressRepeat: (entry: VocabularyEntry) => void
}

type IconButtonProps = {
  icon?: IconTypes
  emoji?: string
  accessibilityLabel: string
  onPress: () => void
  size?: number
  variant?: "icon" | "action"
  isActive?: boolean
  disabled?: boolean
  iconColor?: string
}

type ShowroomIconAccentKey =
  | "profile"
  | "announcements"
  | "search"
  | "toggle"
  | "repeat"
  | "favorite"
  | "details"

type ShowroomIconAccent = {
  iconColor: string
  fill: string
  fillPressed: string
  fillActive: string
  borderColor?: string
  borderColorActive?: string
}

function createFontScaleStyle(fontScale: number, fontSize: number, lineHeight?: number): TextStyle {
  const scaledFontSize = Math.round(fontSize * fontScale)
  return {
    fontSize: scaledFontSize,
    ...(typeof lineHeight === "number" ? { lineHeight: Math.round(lineHeight * fontScale) } : {}),
  }
}

function getShowroomIconAccent(key: ShowroomIconAccentKey, isDark: boolean): ShowroomIconAccent {
  const accents = {
    profile: isDark
      ? {
          iconColor: "#8FA6BE",
          fill: "rgba(96, 165, 250, 0.07)",
          fillPressed: "rgba(96, 165, 250, 0.11)",
          fillActive: "rgba(96, 165, 250, 0.10)",
          borderColor: "rgba(147, 197, 253, 0.11)",
          borderColorActive: "rgba(147, 197, 253, 0.16)",
        }
      : {
          iconColor: "#3E5D89",
          fill: "rgba(59, 130, 246, 0.05)",
          fillPressed: "rgba(59, 130, 246, 0.08)",
          fillActive: "rgba(59, 130, 246, 0.07)",
          borderColor: "rgba(59, 130, 246, 0.09)",
          borderColorActive: "rgba(59, 130, 246, 0.14)",
        },
    announcements: isDark
      ? {
          iconColor: "#BBAE82",
          fill: "rgba(251, 191, 36, 0.07)",
          fillPressed: "rgba(251, 191, 36, 0.11)",
          fillActive: "rgba(251, 191, 36, 0.10)",
          borderColor: "rgba(252, 211, 77, 0.11)",
          borderColorActive: "rgba(252, 211, 77, 0.16)",
        }
      : {
          iconColor: "#775D23",
          fill: "rgba(245, 158, 11, 0.05)",
          fillPressed: "rgba(245, 158, 11, 0.08)",
          fillActive: "rgba(245, 158, 11, 0.07)",
          borderColor: "rgba(245, 158, 11, 0.10)",
          borderColorActive: "rgba(245, 158, 11, 0.14)",
        },
    search: isDark
      ? {
          iconColor: "#89B8B1",
          fill: "rgba(45, 212, 191, 0.06)",
          fillPressed: "rgba(45, 212, 191, 0.10)",
          fillActive: "rgba(45, 212, 191, 0.09)",
          borderColor: "rgba(94, 234, 212, 0.10)",
          borderColorActive: "rgba(94, 234, 212, 0.14)",
        }
      : {
          iconColor: "#2E6A64",
          fill: "rgba(20, 184, 166, 0.05)",
          fillPressed: "rgba(20, 184, 166, 0.08)",
          fillActive: "rgba(20, 184, 166, 0.07)",
          borderColor: "rgba(20, 184, 166, 0.09)",
          borderColorActive: "rgba(20, 184, 166, 0.14)",
        },
    toggle: isDark
      ? {
          iconColor: "#ABA2C3",
          fill: "rgba(167, 139, 250, 0.07)",
          fillPressed: "rgba(167, 139, 250, 0.11)",
          fillActive: "rgba(167, 139, 250, 0.10)",
          borderColor: "rgba(196, 181, 253, 0.11)",
          borderColorActive: "rgba(196, 181, 253, 0.16)",
        }
      : {
          iconColor: "#5A5487",
          fill: "rgba(139, 92, 246, 0.05)",
          fillPressed: "rgba(139, 92, 246, 0.08)",
          fillActive: "rgba(139, 92, 246, 0.07)",
          borderColor: "rgba(139, 92, 246, 0.09)",
          borderColorActive: "rgba(139, 92, 246, 0.14)",
        },
    repeat: isDark
      ? {
          iconColor: "#92B79D",
          fill: "rgba(74, 222, 128, 0.06)",
          fillPressed: "rgba(74, 222, 128, 0.10)",
          fillActive: "rgba(74, 222, 128, 0.09)",
          borderColor: "rgba(134, 239, 172, 0.10)",
          borderColorActive: "rgba(134, 239, 172, 0.14)",
        }
      : {
          iconColor: "#3C6F4E",
          fill: "rgba(34, 197, 94, 0.05)",
          fillPressed: "rgba(34, 197, 94, 0.08)",
          fillActive: "rgba(34, 197, 94, 0.07)",
          borderColor: "rgba(34, 197, 94, 0.09)",
          borderColorActive: "rgba(34, 197, 94, 0.14)",
        },
    favorite: isDark
      ? {
          iconColor: "#BF9A9A",
          fill: "rgba(248, 113, 113, 0.06)",
          fillPressed: "rgba(248, 113, 113, 0.10)",
          fillActive: "rgba(248, 113, 113, 0.09)",
          borderColor: "rgba(252, 165, 165, 0.10)",
          borderColorActive: "rgba(252, 165, 165, 0.14)",
        }
      : {
          iconColor: "#844848",
          fill: "rgba(239, 68, 68, 0.05)",
          fillPressed: "rgba(239, 68, 68, 0.08)",
          fillActive: "rgba(239, 68, 68, 0.07)",
          borderColor: "rgba(239, 68, 68, 0.09)",
          borderColorActive: "rgba(239, 68, 68, 0.14)",
        },
    details: isDark
      ? {
          iconColor: "#90B4BC",
          fill: "rgba(56, 189, 248, 0.06)",
          fillPressed: "rgba(56, 189, 248, 0.10)",
          fillActive: "rgba(56, 189, 248, 0.09)",
          borderColor: "rgba(147, 228, 249, 0.10)",
          borderColorActive: "rgba(147, 228, 249, 0.14)",
        }
      : {
          iconColor: "#3E6578",
          fill: "rgba(14, 165, 233, 0.05)",
          fillPressed: "rgba(14, 165, 233, 0.08)",
          fillActive: "rgba(14, 165, 233, 0.07)",
          borderColor: "rgba(14, 165, 233, 0.09)",
          borderColorActive: "rgba(14, 165, 233, 0.14)",
        },
  } as const

  return accents[key]
}

function resolveIconButtonAccentKey(
  icon: IconTypes | undefined,
  emoji: string | undefined,
  variant: "icon" | "action",
): ShowroomIconAccentKey | undefined {
  if (variant === "icon") {
    if (icon === "community") return "profile"
    if (icon === "more") return "announcements"
    if (emoji) return "search"
    if (icon === "components" || icon === "view") return "toggle"
    return undefined
  }

  if (icon === "heart") return "favorite"
  if (icon === "bell") return "repeat"
  if (icon === "view" || icon === "components") return "details"
  return undefined
}

const IconButton: FC<IconButtonProps> = ({
  icon,
  emoji,
  accessibilityLabel,
  onPress,
  size = 20,
  variant = "icon",
  isActive = false,
  disabled = false,
  iconColor,
}) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const baseStyle = variant === "action" ? $actionButton : $iconButton
  const pressedStyle = variant === "action" ? $actionButtonPressed : $iconButtonPressed
  const accentKey = variant === "action" && isActive ? resolveIconButtonAccentKey(icon, emoji, variant) : undefined
  const accent = accentKey ? getShowroomIconAccent(accentKey, theme.isDark) : undefined
  const baseAccentStyle =
    accent == null
      ? undefined
      : { backgroundColor: accent.fill, borderColor: accent.borderColor }
  const activeAccentStyle =
    accent == null || variant !== "action" || !isActive
      ? undefined
      : {
          backgroundColor: accent.fillActive,
          borderColor: accent.borderColorActive ?? accent.borderColor,
        }
  const pressedAccentStyle =
    accent == null
      ? undefined
      : {
          backgroundColor: accent.fillPressed,
          borderColor: accent.borderColorActive ?? accent.borderColor,
        }
  const resolvedIconColor = iconColor ?? accent?.iconColor ?? showroomColors.textMuted

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        themed(baseStyle),
        baseAccentStyle,
        isActive && variant === "action" ? themed($actionButtonActive) : null,
        activeAccentStyle,
        disabled ? themed($buttonDisabled) : null,
        pressed && themed(pressedStyle),
        pressed && pressedAccentStyle,
      ]}
      hitSlop={6}
    >
      {emoji ? (
        <Text style={[themed($emojiIcon), { color: resolvedIconColor }]} text={emoji} />
      ) : icon ? (
        <Icon icon={icon} size={size} color={resolvedIconColor} />
      ) : null}
    </Pressable>
  )
}

function areActionOrdersEqual(
  previousOrder: VocabularyActionKey[],
  nextOrder: VocabularyActionKey[],
): boolean {
  if (previousOrder === nextOrder) return true
  if (previousOrder.length !== nextOrder.length) return false
  for (let index = 0; index < previousOrder.length; index += 1) {
    if (previousOrder[index] !== nextOrder[index]) return false
  }
  return true
}

function areVocabularyContentPropsEqual(
  previousProps: VocabularyContentProps,
  nextProps: VocabularyContentProps,
): boolean {
  return (
    previousProps.item.id === nextProps.item.id &&
    previousProps.item.word === nextProps.item.word &&
    previousProps.item.pronunciation === nextProps.item.pronunciation &&
    previousProps.item.definition === nextProps.item.definition &&
    previousProps.item.example === nextProps.item.example &&
    previousProps.height === nextProps.height &&
    previousProps.variant === nextProps.variant &&
    previousProps.fontScale === nextProps.fontScale &&
    previousProps.isFavoriteActive === nextProps.isFavoriteActive &&
    previousProps.isFavoriteMutating === nextProps.isFavoriteMutating &&
    previousProps.isRepeatActive === nextProps.isRepeatActive &&
    areActionOrdersEqual(previousProps.actionOrder, nextProps.actionOrder) &&
    previousProps.onPressPronunciation === nextProps.onPressPronunciation &&
    previousProps.onPressDetails === nextProps.onPressDetails &&
    previousProps.onPressFavorite === nextProps.onPressFavorite &&
    previousProps.onPressRepeat === nextProps.onPressRepeat
  )
}

function resolveFocusedListIndex(
  viewableItems: ViewToken[],
  total: number,
  fallbackIndex: number,
): number {
  if (total <= 0) return 0

  const indices = viewableItems
    .filter((item) => item.isViewable && typeof item.index === "number")
    .map((item) => item.index as number)
    .filter((index, position, source) => source.indexOf(index) === position)
    .sort((a, b) => a - b)

  if (indices.length <= 0) {
    return Math.max(0, Math.min(total - 1, fallbackIndex))
  }

  const centeredIndex = indices[Math.floor(indices.length / 2)]
  return Math.max(0, Math.min(total - 1, centeredIndex))
}

const VocabularyContent: FC<VocabularyContentProps> = memo(({
  item,
  height,
  variant,
  fontScale,
  actionOrder,
  isFavoriteActive,
  isFavoriteMutating,
  isRepeatActive,
  onPressPronunciation,
  onPressDetails,
  onPressFavorite,
  onPressRepeat,
}) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const isListVariant = variant === "list"
  const wordTextScaleStyle = useMemo(
    () => createFontScaleStyle(fontScale, isListVariant ? 28 : 40, isListVariant ? 34 : 48),
    [fontScale, isListVariant],
  )
  const pronunciationScaleStyle = useMemo(
    () => createFontScaleStyle(fontScale, 13),
    [fontScale],
  )
  const definitionScaleStyle = useMemo(
    () => createFontScaleStyle(fontScale, isListVariant ? 16 : 20, isListVariant ? 22 : 28),
    [fontScale, isListVariant],
  )
  const exampleScaleStyle = useMemo(
    () => createFontScaleStyle(fontScale, isListVariant ? 13 : 14, isListVariant ? 19 : 24),
    [fontScale, isListVariant],
  )
  const actionConfigs = useMemo(
    () => ({
      details: {
        icon: "view" as const,
        label: `Show details for ${item.word}`,
        onPress: () => onPressDetails(item.id),
        isActive: false,
        disabled: false,
      },
      favorite: {
        icon: "heart" as const,
        label: `Favorite ${item.word}`,
        onPress: () => onPressFavorite(item),
        isActive: isFavoriteActive,
        disabled: isFavoriteMutating,
      },
      repeat: {
        icon: "bell" as const,
        label: `Add ${item.word} to repeat list`,
        onPress: () => onPressRepeat(item),
        isActive: isRepeatActive,
        disabled: false,
      },
    }),
    [
      isFavoriteActive,
      isFavoriteMutating,
      isRepeatActive,
      item.id,
      item.word,
      onPressDetails,
      onPressFavorite,
      onPressRepeat,
    ],
  )

  return (
    <View
      style={[
        themed($contentCard),
        isListVariant ? themed($contentListCard) : { height },
      ]}
    >
      <Text
        style={[themed(isListVariant ? $wordList : $word), wordTextScaleStyle]}
        text={item.word}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.62}
      />
      <Pressable
        onPress={() => onPressPronunciation(item)}
        accessibilityRole="button"
        accessibilityLabel={`Play pronunciation for ${item.word}`}
        style={({ pressed }) => [
          themed($pronunciationPill),
          isListVariant && themed($pronunciationPillList),
          pressed && themed($pillPressed),
        ]}
      >
        <Text style={[themed($pronunciationText), pronunciationScaleStyle]} text={item.pronunciation} />
        <View style={[themed($audioIcon), { backgroundColor: showroomColors.surfaceSoft }]}>
          <MaterialCommunityIcons name="volume-high" size={12} color={showroomColors.textMuted} />
        </View>
      </Pressable>
      <Text
        style={[themed(isListVariant ? $definitionList : $definition), definitionScaleStyle]}
        text={item.definition}
      />
      <Text style={[themed(isListVariant ? $exampleList : $example), exampleScaleStyle]} text={item.example} />
      {isListVariant ? (
        <View style={themed($listCardActionsRow)}>
          {actionOrder.map((action) => {
            const config = actionConfigs[action]
            if (!config) return null
            const accentKey = action === "details" ? "details" : action === "favorite" ? "favorite" : "repeat"
            const accent = getShowroomIconAccent(accentKey, theme.isDark)
            const isColorActive = config.isActive && (action === "favorite" || action === "repeat")

            return (
              <Pressable
                key={`${item.id}-${action}`}
                onPress={config.onPress}
                disabled={config.disabled}
                accessibilityRole="button"
                accessibilityLabel={config.label}
                style={({ pressed }) => [
                  themed($listCardActionButton),
                  config.isActive && themed($listCardActionButtonActive),
                  isColorActive
                    ? {
                        backgroundColor: accent.fill,
                        borderColor: accent.borderColorActive ?? accent.borderColor,
                      }
                    : null,
                  config.disabled && themed($buttonDisabled),
                  pressed && themed($listCardActionButtonPressed),
                  pressed && isColorActive
                    ? {
                        backgroundColor: accent.fillPressed,
                        borderColor: accent.borderColorActive ?? accent.borderColor,
                      }
                    : null,
                ]}
              >
                <Icon
                  icon={config.icon}
                  size={18}
                  color={isColorActive ? accent.iconColor : showroomColors.textMuted}
                />
              </Pressable>
            )
          })}
        </View>
      ) : null}
    </View>
  )
}, areVocabularyContentPropsEqual)

export const VocabularyShowroomView: FC<VocabularyShowroomViewProps> = ({
  entries,
  isLoading,
  isRefreshing,
  errorMessage,
  requiresLogin,
  repeatWords,
  repeatWordCount,
  repeatWordLimit,
  isRepeatUnlimited,
  cardHeight,
  onListLayout,
  onRefresh,
  onLoadMore,
  onGoToLogin,
  isWordFavorited,
  onToggleFavoriteWord,
  isWordInRepeatList,
  onToggleRepeatWord,
  onRemoveRepeatWord,
  onClearRepeatWords,
  onRequestDetails,
  onRequestPractice,
  onRequestProfile,
  onRequestSearch,
  onRequestAddWord,
  onRequestAnnouncements,
  onRequestUpdate,
  onDismissRecommendedUpdate,
  announcementUnreadCount,
  hasRecommendedUpdate,
  recommendedUpdateMessage,
  isLoadingMore,
  hasMoreEntries,
}) => {
  const { themed, theme } = useAppTheme()
  const { vocabularyFontScale, vocabularyActionOrder } = useUiPreferences()
  const isDesktopShell = isDesktopShellRuntime()
  const showroomColors = theme.colors.vocabularyShowroom
  const $modalInsets = useSafeAreaInsetsStyle(["top", "bottom"])
  const total = entries.length
  const listRef = useRef<FlatList<VocabularyEntry>>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [cardModeInitialIndex, setCardModeInitialIndex] = useState(0)
  const [listModeInitialIndex, setListModeInitialIndex] = useState(0)
  const [isListInMotion, setIsListInMotion] = useState(false)
  const [listViewportHeight, setListViewportHeight] = useState(cardHeight)
  const [isListMode, setIsListMode] = useState(false)
  const [isRepeatListVisible, setIsRepeatListVisible] = useState(false)
  const [isRepeatMutating, setIsRepeatMutating] = useState(false)
  const [isFavoriteMutating, setIsFavoriteMutating] = useState(false)
  const [repeatMessage, setRepeatMessage] = useState<string | undefined>(undefined)
  const repeatMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const cardSnapTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const listFocusSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isListModeRef = useRef(isListMode)
  const isListDragActiveRef = useRef(false)
  const isListMomentumActiveRef = useRef(false)
  const isSwitchToCardQueuedRef = useRef(false)
  const latestListViewableItemsRef = useRef<ViewToken[]>([])
  const latestListFocusedIndexRef = useRef(0)
  const listScrollRevisionRef = useRef(0)
  const listViewabilityRevisionRef = useRef(0)
  const totalRef = useRef(total)
  const activeIndexRef = useRef(0)
  const pendingCardSnapIndexRef = useRef<number | null>(null)
  const hasAppliedListInitialPositionRef = useRef(false)
  const resolvedCardHeight = listViewportHeight > 0 ? listViewportHeight : cardHeight
  const safeIndex = total ? Math.min(activeIndex, total - 1) : 0
  const activeEntry = total ? entries[safeIndex] : undefined
  const repeatWordLimitNumber = repeatWordLimit ?? 0
  const repeatWordLimitLabel = isRepeatUnlimited ? "∞" : String(repeatWordLimitNumber)
  const progressLabel = `${repeatWordCount}/${repeatWordLimitLabel}`
  const announcementBadgeLabel = announcementUnreadCount > 99 ? "99+" : String(announcementUnreadCount)
  const showRepeatUi = false
  const progressValue = isRepeatUnlimited
    ? 100
    : repeatWordLimitNumber > 0
      ? Math.round((Math.min(repeatWordCount, repeatWordLimitNumber) / repeatWordLimitNumber) * 100)
      : 0
  const progressWidth: `${number}%` = `${progressValue}%`
  const isActiveWordInRepeatList = activeEntry ? isWordInRepeatList(activeEntry.id) : false
  const isActiveWordFavorited = activeEntry ? isWordFavorited(activeEntry.id) : false
  const hasStateError = Boolean(errorMessage) || requiresLogin
  const stateButtonText = requiresLogin
    ? translate("vocabulary:common.signIn")
    : hasStateError
      ? translate("vocabulary:common.retry")
      : "Add your first word"
  const stateButtonAccessibilityLabel = requiresLogin
    ? translate("vocabulary:common.signIn")
    : hasStateError
      ? translate("vocabulary:showroom.accessibility.retryShowroom")
      : "Open manual word capture"
  const visibleVocabularyActionOrder = useMemo(
    () => vocabularyActionOrder.filter((action) => action !== "repeat"),
    [vocabularyActionOrder],
  )
  const handleStateButtonPress = requiresLogin
    ? onGoToLogin
    : hasStateError
      ? onRefresh
      : onRequestAddWord
  const orderedActionButtons = useMemo(
    () =>
      visibleVocabularyActionOrder.map((action) => {
        if (action === "details") {
          return {
            key: action,
            icon: "view" as const,
            accessibilityLabel: translate("vocabulary:showroom.accessibility.showDetails"),
            isActive: false,
            disabled: false,
          }
        }
        if (action === "favorite") {
          return {
            key: action,
            icon: "heart" as const,
            accessibilityLabel: translate("vocabulary:showroom.accessibility.favoriteWord"),
            isActive: isActiveWordFavorited,
            disabled: isFavoriteMutating,
          }
        }
        return {
          key: action,
          icon: "bell" as const,
          accessibilityLabel: translate("vocabulary:showroom.accessibility.repeatWordLater"),
          isActive: isActiveWordInRepeatList,
          disabled: isRepeatMutating,
        }
      }),
    [
      isActiveWordFavorited,
      isActiveWordInRepeatList,
      isFavoriteMutating,
      isRepeatMutating,
      visibleVocabularyActionOrder,
    ],
  )

  useEffect(() => {
    return () => {
      if (repeatMessageTimeoutRef.current) {
        clearTimeout(repeatMessageTimeoutRef.current)
      }
      if (cardSnapTimeoutRef.current) {
        clearTimeout(cardSnapTimeoutRef.current)
      }
      if (listFocusSyncTimeoutRef.current) {
        clearTimeout(listFocusSyncTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    isListModeRef.current = isListMode
    if (!isListMode) {
      hasAppliedListInitialPositionRef.current = false
    }
  }, [isListMode])

  useEffect(() => {
    if (!isListMode || total <= 0) return
    if (hasAppliedListInitialPositionRef.current) return

    hasAppliedListInitialPositionRef.current = true
    const targetIndex = Math.max(0, Math.min(total - 1, listModeInitialIndex))

    const applyListPosition = () => {
      listRef.current?.scrollToIndex({
        index: targetIndex,
        animated: false,
        viewPosition: 0.5,
      })
      listRef.current?.recordInteraction?.()
    }

    requestAnimationFrame(() => {
      applyListPosition()
      requestAnimationFrame(() => {
        applyListPosition()
      })
    })
  }, [isListMode, listModeInitialIndex, total])

  const showRepeatMessage = useCallback((message: string) => {
    if (repeatMessageTimeoutRef.current) {
      clearTimeout(repeatMessageTimeoutRef.current)
    }
    setRepeatMessage(message)
    repeatMessageTimeoutRef.current = setTimeout(() => {
      setRepeatMessage(undefined)
    }, 2400)
  }, [])

  const syncActiveIndex = useCallback((nextIndex: number) => {
    activeIndexRef.current = nextIndex
    setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex))
  }, [])

  useEffect(() => {
    if (total <= 0) {
      latestListFocusedIndexRef.current = 0
      activeIndexRef.current = 0
      setActiveIndex(0)
      return
    }
    const clamped = Math.max(0, Math.min(total - 1, activeIndexRef.current))
    latestListFocusedIndexRef.current = Math.max(0, Math.min(total - 1, latestListFocusedIndexRef.current))
    activeIndexRef.current = clamped
    setActiveIndex((prev) => (prev === clamped ? prev : clamped))
  }, [total])

  useEffect(() => {
    totalRef.current = total
  }, [total])

  useEffect(() => {
    if (cardHeight <= 0) return
    setListViewportHeight((prev) => (prev > 0 ? prev : cardHeight))
  }, [cardHeight])

  const snapToCardIndex = useCallback(
    (targetIndex: number, targetHeight: number, animated: boolean) => {
      if (total <= 0 || targetHeight <= 0) return
      const clampedIndex = Math.max(0, Math.min(total - 1, targetIndex))
      syncActiveIndex(clampedIndex)
      listRef.current?.scrollToOffset({
        offset: clampedIndex * targetHeight,
        animated,
      })
    },
    [syncActiveIndex, total],
  )

  const queueCardModeSnap = useCallback(() => {
    const targetIndex = Math.max(0, Math.min(total - 1, latestListFocusedIndexRef.current))
    if (listFocusSyncTimeoutRef.current) {
      clearTimeout(listFocusSyncTimeoutRef.current)
      listFocusSyncTimeoutRef.current = undefined
    }
    isListModeRef.current = false
    isListDragActiveRef.current = false
    isListMomentumActiveRef.current = false
    setIsListInMotion(false)
    setCardModeInitialIndex(targetIndex)
    pendingCardSnapIndexRef.current = targetIndex
    setIsListMode(false)
  }, [total])

  const syncActiveIndexFromLatestListViewables = useCallback(() => {
    if (total <= 0) return
    const nextIndex = resolveFocusedListIndex(
      latestListViewableItemsRef.current,
      total,
      latestListFocusedIndexRef.current,
    )
    latestListFocusedIndexRef.current = nextIndex
    syncActiveIndex(nextIndex)
  }, [syncActiveIndex, total])

  const refreshListViewability = useCallback(() => {
    if (!isListModeRef.current) return
    listRef.current?.recordInteraction?.()
  }, [])

  const runQueuedCardModeSnap = useCallback((attempt = 0) => {
    // Wait for viewability to catch up with the final scroll frame.
    refreshListViewability()
    requestAnimationFrame(() => {
      refreshListViewability()
      syncActiveIndexFromLatestListViewables()
      requestAnimationFrame(() => {
        refreshListViewability()
        syncActiveIndexFromLatestListViewables()

        const isViewabilitySynced = listViewabilityRevisionRef.current >= listScrollRevisionRef.current
        if (isViewabilitySynced || attempt >= 3) {
          queueCardModeSnap()
          return
        }

        if (listFocusSyncTimeoutRef.current) {
          clearTimeout(listFocusSyncTimeoutRef.current)
        }
        listFocusSyncTimeoutRef.current = setTimeout(() => {
          runQueuedCardModeSnap(attempt + 1)
        }, 34)
      })
    })
  }, [queueCardModeSnap, refreshListViewability, syncActiveIndexFromLatestListViewables])

  useEffect(() => {
    if (isListMode || total <= 0 || resolvedCardHeight <= 0) return
    const pendingIndex = pendingCardSnapIndexRef.current
    if (pendingIndex === null) return

    const applySnap = () => {
      snapToCardIndex(pendingIndex, resolvedCardHeight, false)
    }

    requestAnimationFrame(() => {
      applySnap()
      requestAnimationFrame(() => {
        applySnap()
        pendingCardSnapIndexRef.current = null
      })
    })

    if (cardSnapTimeoutRef.current) {
      clearTimeout(cardSnapTimeoutRef.current)
    }
    cardSnapTimeoutRef.current = setTimeout(() => {
      applySnap()
      pendingCardSnapIndexRef.current = null
      cardSnapTimeoutRef.current = undefined
    }, 120)

    return () => {
      if (cardSnapTimeoutRef.current) {
        clearTimeout(cardSnapTimeoutRef.current)
        cardSnapTimeoutRef.current = undefined
      }
    }
  }, [isListMode, resolvedCardHeight, snapToCardIndex, total])

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!isListModeRef.current) return
      const indexedViewableItems = viewableItems.filter(
        (item) => item.isViewable && typeof item.index === "number",
      )

      // Fast flings can emit transient empty snapshots; keep the last valid window.
      if (indexedViewableItems.length <= 0) return

      latestListViewableItemsRef.current = indexedViewableItems
      listViewabilityRevisionRef.current = listScrollRevisionRef.current
      const nextIndex = resolveFocusedListIndex(
        indexedViewableItems,
        totalRef.current,
        latestListFocusedIndexRef.current,
      )
      latestListFocusedIndexRef.current = nextIndex
      syncActiveIndex(nextIndex)
    },
  ).current
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 10,
    minimumViewTime: 0,
    waitForInteraction: false,
  }).current

  const resolveIndexFromScrollOffset = useCallback(
    (offsetY: number) => {
      if (isListMode || total <= 0 || resolvedCardHeight <= 0) return
      const nextIndex = Math.max(0, Math.min(total - 1, Math.round(offsetY / resolvedCardHeight)))
      syncActiveIndex(nextIndex)
    },
    [isListMode, resolvedCardHeight, syncActiveIndex, total],
  )

  const handleListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y
      if (isListModeRef.current) {
        listScrollRevisionRef.current += 1
      }
      resolveIndexFromScrollOffset(offsetY)
    },
    [resolveIndexFromScrollOffset],
  )

  const handleScrollBeginDrag = useCallback(() => {
    if (!isListMode) return
    isListDragActiveRef.current = true
    setIsListInMotion(true)
  }, [isListMode])

  const handleMomentumScrollBegin = useCallback(() => {
    if (!isListMode) return
    isListMomentumActiveRef.current = true
    setIsListInMotion(true)
  }, [isListMode])

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y
      if (isListMode) {
        isListMomentumActiveRef.current = false
        setIsListInMotion(isListDragActiveRef.current)
        refreshListViewability()
        resolveIndexFromScrollOffset(offsetY)
        syncActiveIndexFromLatestListViewables()
        if (isSwitchToCardQueuedRef.current && !isListDragActiveRef.current) {
          isSwitchToCardQueuedRef.current = false
          runQueuedCardModeSnap()
        }
        return
      }

      if (total <= 0 || resolvedCardHeight <= 0) {
        resolveIndexFromScrollOffset(offsetY)
        return
      }

      const targetIndex = Math.max(0, Math.min(total - 1, Math.round(offsetY / resolvedCardHeight)))
      const targetOffset = targetIndex * resolvedCardHeight
      syncActiveIndex(targetIndex)

      if (Math.abs(offsetY - targetOffset) > 1) {
        requestAnimationFrame(() => {
          listRef.current?.scrollToOffset({
            offset: targetOffset,
            animated: false,
          })
        })
      }
    },
    [
      isListMode,
      refreshListViewability,
      resolveIndexFromScrollOffset,
      resolvedCardHeight,
      runQueuedCardModeSnap,
      syncActiveIndex,
      syncActiveIndexFromLatestListViewables,
      total,
    ],
  )

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const velocityY = Math.abs(event.nativeEvent.velocity?.y ?? 0)
      if (isListMode) {
        isListDragActiveRef.current = false
        if (velocityY > 0.01) {
          // Close the tiny race window before onMomentumScrollBegin is dispatched.
          isListMomentumActiveRef.current = true
          setIsListInMotion(true)
        }
        if (velocityY <= 0.01) {
          isListMomentumActiveRef.current = false
          setIsListInMotion(false)
          refreshListViewability()
          syncActiveIndexFromLatestListViewables()
          if (isSwitchToCardQueuedRef.current) {
            isSwitchToCardQueuedRef.current = false
            runQueuedCardModeSnap()
          }
        }
        return
      }
      if (total <= 0 || resolvedCardHeight <= 0) return

      if (velocityY > 0.01) return

      const offsetY = event.nativeEvent.contentOffset.y
      const targetIndex = Math.max(0, Math.min(total - 1, Math.round(offsetY / resolvedCardHeight)))
      const targetOffset = targetIndex * resolvedCardHeight
      syncActiveIndex(targetIndex)

      if (Math.abs(offsetY - targetOffset) > 1) {
        requestAnimationFrame(() => {
          listRef.current?.scrollToOffset({
            offset: targetOffset,
            animated: true,
          })
        })
      }
    },
    [
      isListMode,
      refreshListViewability,
      resolvedCardHeight,
      runQueuedCardModeSnap,
      syncActiveIndex,
      syncActiveIndexFromLatestListViewables,
      total,
    ],
  )

  const handleToggleRepeatWord = useCallback(
    (entry: VocabularyEntry) => {
      if (isRepeatMutating) return

      setIsRepeatMutating(true)
      void (async () => {
        try {
          const result = await onToggleRepeatWord(entry)

          if (result === "added") {
            const nextCount = isRepeatUnlimited
              ? repeatWordCount + 1
              : Math.min(repeatWordCount + 1, repeatWordLimitNumber)
            showRepeatMessage(
              translate("vocabulary:showroom.repeatAdded", {
                word: entry.word,
                count: nextCount,
                limit: repeatWordLimitLabel,
              }),
            )
            return
          }
          if (result === "removed") {
            const nextCount = Math.max(repeatWordCount - 1, 0)
            showRepeatMessage(
              translate("vocabulary:showroom.repeatRemoved", {
                word: entry.word,
                count: nextCount,
                limit: repeatWordLimitLabel,
              }),
            )
            return
          }
          if (result === "permission-denied") {
            showRepeatMessage(translate("vocabulary:showroom.repeatPermissionRequired"))
            return
          }
          showRepeatMessage(translate("vocabulary:showroom.repeatLimitReached"))
        } finally {
          setIsRepeatMutating(false)
        }
      })()
    },
    [
      isRepeatMutating,
      isRepeatUnlimited,
      onToggleRepeatWord,
      repeatWordCount,
      repeatWordLimitLabel,
      repeatWordLimitNumber,
      showRepeatMessage,
    ],
  )

  const handlePronunciationPress = useCallback(
    (entry: VocabularyEntry) => {
      void (async () => {
        const result = await speakWord({
          word: entry.word,
          sourceLang: entry.sourceLang,
        })
        if (result === "failed") {
          showRepeatMessage(translate("vocabulary:errors.unexpected"))
        }
      })()
    },
    [showRepeatMessage],
  )

  const handleToggleFavoriteWord = useCallback(
    (entry: VocabularyEntry) => {
      if (isFavoriteMutating) return

      setIsFavoriteMutating(true)
      void (async () => {
        try {
          const result = await onToggleFavoriteWord(entry)
          if (result === "added") {
            showRepeatMessage(translate("vocabulary:showroom.favoriteAdded", { word: entry.word }))
            return
          }
          if (result === "removed") {
            showRepeatMessage(translate("vocabulary:showroom.favoriteRemoved", { word: entry.word }))
            return
          }
          showRepeatMessage(translate("vocabulary:errors.favoriteActionFailed"))
        } finally {
          setIsFavoriteMutating(false)
        }
      })()
    },
    [isFavoriteMutating, onToggleFavoriteWord, showRepeatMessage],
  )

  const handleClearRepeatList = useCallback(() => {
    if (isRepeatMutating) return

    setIsRepeatMutating(true)
    void (async () => {
      try {
        await onClearRepeatWords()
        showRepeatMessage(translate("vocabulary:showroom.repeatCleared"))
      } finally {
        setIsRepeatMutating(false)
      }
    })()
  }, [isRepeatMutating, onClearRepeatWords, showRepeatMessage])

  const handleRemoveRepeatWord = useCallback(
    (wordId: string) => {
      if (isRepeatMutating) return

      setIsRepeatMutating(true)
      void (async () => {
        try {
          await onRemoveRepeatWord(wordId)
        } finally {
          setIsRepeatMutating(false)
        }
      })()
    },
    [isRepeatMutating, onRemoveRepeatWord],
  )

  const handleActionPress = useCallback(
    (action: string) => {
      if (action === "practice") {
        onRequestPractice()
        return
      }
      if (action === "profile") {
        onRequestProfile()
        return
      }
      if (total <= 0) return
      const liveIndex = Math.max(0, Math.min(total - 1, activeIndexRef.current))
      const liveEntry = entries[liveIndex]
      if (!liveEntry) return
      if (action === "repeat") {
        handleToggleRepeatWord(liveEntry)
        return
      }
      if (action === "favorite") {
        handleToggleFavoriteWord(liveEntry)
        return
      }
      if (action === "details") {
        onRequestDetails(liveEntry.id)
        return
      }
      console.info("Vocabulary action:", action, liveEntry.word)
    },
    [
      entries,
      handleToggleFavoriteWord,
      handleToggleRepeatWord,
      onRequestDetails,
      onRequestPractice,
      onRequestProfile,
      total,
    ],
  )

  const handleToggleViewMode = useCallback(() => {
    if (!isListMode) {
      const targetIndex = total > 0 ? Math.max(0, Math.min(total - 1, activeIndexRef.current)) : 0
      latestListFocusedIndexRef.current = targetIndex
      latestListViewableItemsRef.current = []
      listScrollRevisionRef.current = 0
      listViewabilityRevisionRef.current = 0
      hasAppliedListInitialPositionRef.current = false
      if (listFocusSyncTimeoutRef.current) {
        clearTimeout(listFocusSyncTimeoutRef.current)
        listFocusSyncTimeoutRef.current = undefined
      }
      isListModeRef.current = true
      isListDragActiveRef.current = false
      isListMomentumActiveRef.current = false
      setIsListInMotion(false)
      setListModeInitialIndex(targetIndex)
      setIsListMode(true)
      return
    }
    const isListInMotion = isListDragActiveRef.current || isListMomentumActiveRef.current
    if (isListInMotion) {
      isSwitchToCardQueuedRef.current = true
    } else {
      isSwitchToCardQueuedRef.current = false
      runQueuedCardModeSnap()
    }
  }, [isListMode, runQueuedCardModeSnap, total])

  const handleListContentSizeChange = useCallback(
    (_width: number, contentHeight: number) => {
      if (isListMode || total <= 0 || resolvedCardHeight <= 0) return
      const pendingIndex = pendingCardSnapIndexRef.current
      if (pendingIndex === null) return

      const targetIndex = Math.max(0, Math.min(total - 1, pendingIndex))
      const targetOffset = targetIndex * resolvedCardHeight
      const minRequiredHeight = targetOffset + resolvedCardHeight
      if (contentHeight + 1 < minRequiredHeight) return

      requestAnimationFrame(() => {
        snapToCardIndex(targetIndex, resolvedCardHeight, false)
        pendingCardSnapIndexRef.current = null
      })
    },
    [isListMode, resolvedCardHeight, snapToCardIndex, total],
  )

  const handleFlatListLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onListLayout(event)
      const nextHeight = event?.nativeEvent?.layout?.height
      if (typeof nextHeight !== "number" || nextHeight <= 0) return
      const heightChanged = Math.abs(nextHeight - listViewportHeight) > 0.5
      setListViewportHeight((prev) => (prev === nextHeight ? prev : nextHeight))

      // In card mode, a runtime layout height change can desync paging offset and show two half-cards.
      // Queue a snap back to the current active card with the new item height.
      if (
        !isListMode &&
        total > 0 &&
        heightChanged &&
        pendingCardSnapIndexRef.current === null
      ) {
        pendingCardSnapIndexRef.current = Math.max(0, Math.min(total - 1, activeIndexRef.current))
      }

      if (isListMode || total <= 0) return
      const pendingIndex = pendingCardSnapIndexRef.current
      if (pendingIndex === null) return

      const targetIndex = Math.max(0, Math.min(total - 1, pendingIndex))

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          snapToCardIndex(targetIndex, nextHeight, false)
          pendingCardSnapIndexRef.current = null
        })
      })
    },
    [isListMode, listViewportHeight, onListLayout, snapToCardIndex, total],
  )

  const renderItem = useCallback(
    ({ item }: { item: VocabularyEntry; index: number }) => {
      return (
        <VocabularyContent
          item={item}
          height={resolvedCardHeight}
          variant={isListMode ? "list" : "card"}
          fontScale={vocabularyFontScale}
          actionOrder={visibleVocabularyActionOrder}
          isFavoriteActive={isWordFavorited(item.id)}
          isFavoriteMutating={isFavoriteMutating}
          isRepeatActive={isWordInRepeatList(item.id)}
          onPressPronunciation={handlePronunciationPress}
          onPressDetails={onRequestDetails}
          onPressFavorite={handleToggleFavoriteWord}
          onPressRepeat={handleToggleRepeatWord}
        />
      )
    },
    [
      handleToggleFavoriteWord,
      handlePronunciationPress,
      handleToggleRepeatWord,
      isFavoriteMutating,
      isWordFavorited,
      isListMode,
      isWordInRepeatList,
      onRequestDetails,
      resolvedCardHeight,
      visibleVocabularyActionOrder,
      vocabularyFontScale,
    ],
  )

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
        <View style={themed($topRow)}>
          <View style={themed($topRowLeft)}>
            <IconButton
              icon="community"
              accessibilityLabel={translate("vocabulary:showroom.accessibility.openProfile")}
              onPress={() => handleActionPress("profile")}
            />
            <View style={themed($announcementButtonWrap)}>
              <IconButton
                icon="more"
                accessibilityLabel={translate("vocabulary:showroom.accessibility.openAnnouncements")}
                onPress={onRequestAnnouncements}
              />
              {announcementUnreadCount > 0 ? (
                <View style={themed($announcementBadge)}>
                  <Text style={themed($announcementBadgeText)} text={announcementBadgeLabel} />
                </View>
              ) : null}
            </View>
          </View>
          <View style={themed($topRowCenter)}>
            {showRepeatUi ? (
              <Pressable
                onPress={() => setIsRepeatListVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={translate("vocabulary:showroom.accessibility.openRepeatList")}
                style={({ pressed }) => [themed($progressPill), pressed && themed($progressPillPressed)]}
              >
                <Text style={themed($progressLabel)} text={progressLabel} />
                <View style={themed($progressTrack)}>
                  <View style={[themed($progressFill), { width: progressWidth }]} />
                </View>
                <View style={[themed($progressIconWrap), { backgroundColor: showroomColors.surfaceSoft }]}>
                  <Icon icon="bell" size={18} color={showroomColors.textMuted} />
                </View>
              </Pressable>
            ) : null}
          </View>
          <View style={themed($topRowRight)}>
            <IconButton
              emoji="⌕"
              accessibilityLabel={translate("vocabulary:showroom.accessibility.searchWords")}
              onPress={onRequestSearch}
            />
            <IconButton
              icon={isListMode ? "view" : "components"}
              accessibilityLabel={
                isListMode
                  ? translate("vocabulary:showroom.accessibility.switchToCard")
                  : translate("vocabulary:showroom.accessibility.switchToList")
              }
              onPress={handleToggleViewMode}
              disabled={isListMode && isListInMotion}
            />
          </View>
        </View>

        {hasRecommendedUpdate ? (
          <View style={themed($updateBanner)}>
            <Pressable
              onPress={onRequestUpdate}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:showroom.accessibility.openUpdate")}
              style={({ pressed }) => [
                themed($updateBannerContent),
                pressed && themed($updateBannerPressed),
              ]}
            >
              <Text style={themed($updateBannerTitle)} text={translate("vocabulary:showroom.updateAvailableTitle")} />
              <Text
                style={themed($updateBannerBody)}
                text={recommendedUpdateMessage ?? translate("vocabulary:showroom.updateAvailableBody")}
              />
              <Text style={themed($updateBannerCta)} text={translate("vocabulary:showroom.updateNow")} />
            </Pressable>
            <Pressable
              onPress={onDismissRecommendedUpdate}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:showroom.accessibility.dismissUpdate")}
              style={({ pressed }) => [
                themed($updateBannerDismissButton),
                pressed && themed($updateBannerDismissButtonPressed),
              ]}
              hitSlop={6}
            >
              <Icon icon="x" size={14} color={showroomColors.textStrong} />
            </Pressable>
          </View>
        ) : null}

        <Pressable
          onPress={onRequestAddWord}
          accessibilityRole="button"
          accessibilityLabel={translate("vocabulary:showroom.accessibility.addWord")}
          style={({ pressed }) => [
            themed($captureCtaCard),
            pressed && themed($captureCtaCardPressed),
          ]}
        >
          <View style={themed($captureCtaCopy)}>
            <Text
              style={themed($captureCtaEyebrow)}
              text={translate("vocabulary:showroom.quickAdd.eyebrow")}
            />
            <Text
              style={themed($captureCtaTitle)}
              text={translate("vocabulary:showroom.quickAdd.title")}
            />
            <Text
              style={themed($captureCtaBody)}
              text={translate("vocabulary:showroom.quickAdd.body")}
            />
          </View>
          <View style={themed($captureCtaAction)}>
            <Text
              style={themed($captureCtaActionText)}
              text={translate("vocabulary:showroom.quickAdd.action")}
            />
            <Text
              style={themed($captureCtaActionHint)}
              text={translate("vocabulary:showroom.quickAdd.actionHint")}
            />
          </View>
        </Pressable>

        {total > 0 ? (
          <FlatList
            key={isListMode ? "showroom-list-mode" : `showroom-card-mode-${Math.round(resolvedCardHeight)}`}
            ref={listRef}
            data={entries}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            initialScrollIndex={
              isListMode
                ? undefined
                : Math.max(0, Math.min(total - 1, cardModeInitialIndex))
            }
            initialNumToRender={isListMode ? 8 : 2}
            maxToRenderPerBatch={isListMode ? 8 : 2}
            updateCellsBatchingPeriod={40}
            windowSize={isListMode ? 9 : 3}
            removeClippedSubviews={false}
            onLayout={handleFlatListLayout}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onScroll={handleListScroll}
            onScrollBeginDrag={handleScrollBeginDrag}
            onMomentumScrollBegin={handleMomentumScrollBegin}
            onContentSizeChange={handleListContentSizeChange}
            onScrollEndDrag={handleScrollEndDrag}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            onEndReached={() => {
              if (hasMoreEntries && !isLoadingMore) {
                onLoadMore()
              }
            }}
            onEndReachedThreshold={0.6}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            style={themed($list)}
            onScrollToIndexFailed={({ index }) => {
              const safeIndex = Math.max(0, Math.min(total - 1, index))
              requestAnimationFrame(() => {
                if (isListMode) {
                  listRef.current?.scrollToIndex({
                    index: safeIndex,
                    animated: false,
                    viewPosition: 0.5,
                  })
                  return
                }
                if (resolvedCardHeight <= 0) return
                snapToCardIndex(safeIndex, resolvedCardHeight, false)
              })
            }}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={themed($loadingMoreWrap)}>
                  <ActivityIndicator size="small" color={showroomColors.textStrong} />
                </View>
              ) : null
            }
            pagingEnabled={!isListMode}
            disableIntervalMomentum={!isListMode}
            snapToInterval={isListMode ? undefined : resolvedCardHeight}
            snapToAlignment={isListMode ? undefined : "start"}
            decelerationRate={isListMode ? "normal" : "fast"}
            bounces={isListMode}
            getItemLayout={
              isListMode
                ? undefined
                : (_, index) => ({
                    length: resolvedCardHeight,
                    offset: resolvedCardHeight * index,
                    index,
                  })
            }
          />
        ) : (
          <View style={themed($stateWrap)} onLayout={onListLayout}>
            {isLoading || isRefreshing ? (
              <>
                <ActivityIndicator size="small" color={showroomColors.textStrong} />
                <Text style={themed($stateBody)} text={translate("vocabulary:showroom.loading")} />
              </>
            ) : (
              <>
                {!hasStateError ? (
                  <Text style={themed($stateTitle)} text={translate("vocabulary:showroom.emptyTitle")} />
                ) : null}
                <Text style={themed($stateBody)} text={errorMessage ?? translate("vocabulary:showroom.emptyBody")} />
                <Pressable
                  onPress={handleStateButtonPress}
                  accessibilityRole="button"
                  accessibilityLabel={stateButtonAccessibilityLabel}
                  style={({ pressed }) => [
                    themed($retryButton),
                    pressed && themed($retryButtonPressed),
                  ]}
                >
                  <Text style={themed($retryText)} text={stateButtonText} />
                </Pressable>
              </>
            )}
          </View>
        )}
        {errorMessage && total > 0 && (
          <View style={themed($inlineErrorWrap)}>
            <Text style={themed($inlineErrorText)} text={errorMessage} />
          </View>
        )}
        {repeatMessage ? (
          <View pointerEvents="none" style={themed($toastWrap)}>
            <View style={themed($toastCard)}>
              <Text style={themed($toastText)} text={repeatMessage} />
            </View>
          </View>
        ) : null}

        {!isListMode ? (
          <View style={themed($actionsRow)}>
            {orderedActionButtons.map((actionButton) => {
              return (
                <IconButton
                  key={`main-action-${actionButton.key}`}
                  icon={actionButton.icon}
                  size={20}
                  variant="action"
                  isActive={actionButton.isActive}
                  disabled={actionButton.disabled}
                  accessibilityLabel={actionButton.accessibilityLabel}
                  onPress={() => handleActionPress(actionButton.key)}
                />
              )
            })}
          </View>
        ) : null}

        {showRepeatUi ? (
          <Modal
            visible={isRepeatListVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsRepeatListVisible(false)}
          >
            <View style={themed([$repeatModalBackdrop, $modalInsets])}>
              <View style={themed($repeatModalCard)}>
                <View style={themed($repeatModalHeader)}>
                  <View>
                    <Text style={themed($repeatModalTitle)} text={translate("vocabulary:showroom.repeatListTitle")} />
                    <Text
                      style={themed($repeatModalSubTitle)}
                      text={translate("vocabulary:showroom.repeatCount", {
                        count: repeatWordCount,
                        limit: repeatWordLimitLabel,
                      })}
                    />
                  </View>
                  <Pressable
                    onPress={() => setIsRepeatListVisible(false)}
                    accessibilityRole="button"
                    accessibilityLabel={translate("vocabulary:showroom.accessibility.closeRepeatList")}
                    style={({ pressed }) => [themed($repeatCloseButton), pressed && themed($repeatCloseButtonPressed)]}
                  >
                    <Icon icon="x" size={14} color={showroomColors.textStrong} />
                  </Pressable>
                </View>

                {repeatWords.length === 0 ? (
                  <View style={themed($repeatEmptyWrap)}>
                    <Text
                      style={themed($repeatEmptyText)}
                      text={translate("vocabulary:showroom.repeatEmpty")}
                    />
                  </View>
                ) : (
                  <ScrollView
                    style={themed($repeatListWrap)}
                    contentContainerStyle={themed($repeatListContent)}
                    showsVerticalScrollIndicator
                  >
                    {repeatWords.map((repeatWord) => (
                      <View key={repeatWord.id} style={themed($repeatRow)}>
                        <View style={themed($repeatRowContent)}>
                          <Text style={themed($repeatRowWord)} text={repeatWord.word} />
                          {repeatWord.translation ? (
                            <Text style={themed($repeatRowTranslation)} text={repeatWord.translation} />
                          ) : null}
                        </View>
                        <Pressable
                          onPress={() => handleRemoveRepeatWord(repeatWord.id)}
                          disabled={isRepeatMutating}
                          accessibilityRole="button"
                          accessibilityLabel={translate("vocabulary:showroom.accessibility.removeFromRepeat", {
                            word: repeatWord.word,
                          })}
                          style={({ pressed }) => [themed($repeatRemoveButton), pressed && themed($repeatRemoveButtonPressed)]}
                        >
                          <Icon icon="x" size={12} color={showroomColors.textStrong} />
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                )}

                <View style={themed($repeatModalFooter)}>
                  <Pressable
                    onPress={handleClearRepeatList}
                    disabled={repeatWords.length === 0 || isRepeatMutating}
                    accessibilityRole="button"
                    accessibilityLabel={translate("vocabulary:showroom.accessibility.clearRepeatList")}
                    style={({ pressed }) => [
                      themed($repeatSecondaryButton),
                      (repeatWords.length === 0 || isRepeatMutating) && themed($repeatSecondaryButtonDisabled),
                      pressed && repeatWords.length > 0 && !isRepeatMutating && themed($repeatSecondaryButtonPressed),
                    ]}
                  >
                    <Text style={themed($repeatSecondaryButtonText)} text={translate("vocabulary:showroom.clearAll")} />
                  </Pressable>
                  <Pressable
                    onPress={() => setIsRepeatListVisible(false)}
                    accessibilityRole="button"
                    accessibilityLabel={translate("vocabulary:showroom.done")}
                    style={({ pressed }) => [themed($repeatPrimaryButton), pressed && themed($repeatPrimaryButtonPressed)]}
                  >
                    <Text style={themed($repeatPrimaryButtonText)} text={translate("vocabulary:showroom.done")} />
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        ) : null}

        <View style={themed($footerRow)}>
          <Pressable
            onPress={() => handleActionPress("practice")}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:showroom.accessibility.practiceWord")}
            style={({ pressed }) => [
              themed($practiceButton),
              pressed && themed($practiceButtonPressed),
            ]}
          >
            <Icon icon="check" size={14} color={theme.colors.tint} />
            <Text style={themed($practiceText)} text={translate("vocabulary:showroom.practice")} />
          </Pressable>
        </View>
      </View>
    </Screen>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "flex-start",
})

const $list: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $loadingMoreWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.md,
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

const $topRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.xs,
})

const $topRowLeft: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
})

const $topRowCenter: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  minWidth: 0,
  alignItems: "center",
  justifyContent: "center",
  marginHorizontal: spacing.xxs,
})

const $topRowRight: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xxs,
})

const $announcementButtonWrap: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
})

const $announcementBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: -2,
  right: -2,
  minWidth: 16,
  height: 16,
  paddingHorizontal: 3,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.error,
})

const $announcementBadgeText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 9,
  lineHeight: 10,
  color: "#FFFFFF",
})

const $iconButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 48,
  width: 48,
  borderRadius: 24,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $iconButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $buttonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.45,
})

const $emojiIcon: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 31,
  lineHeight: 33,
  color: colors.vocabularyShowroom.textStrong,
})

const $progressPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  minWidth: 0,
  minHeight: 44,
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.xs,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $progressPillPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $progressLabel: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
  marginRight: 6,
})

const $progressTrack: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 8,
  flex: 1,
  minWidth: 50,
  borderRadius: 4,
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
  overflow: "hidden",
})

const $progressFill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: "100%",
  borderRadius: 4,
  backgroundColor: colors.vocabularyShowroom.textStrong,
})

const $progressIconWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginLeft: spacing.xxs,
  height: 28,
  width: 28,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
})

const $updateBanner: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  marginTop: spacing.sm,
  marginBottom: spacing.sm,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  overflow: "hidden",
})

const $updateBannerContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  paddingRight: spacing.xxxl,
})

const $updateBannerPressed: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.88,
})

const $updateBannerDismissButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  position: "absolute",
  top: spacing.xs,
  right: spacing.xs,
  height: 28,
  width: 28,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $updateBannerDismissButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $updateBannerTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $updateBannerBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  lineHeight: 17,
  color: colors.vocabularyShowroom.textMuted,
})

const $updateBannerCta: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.textStrong,
})

const $captureCtaCard: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  marginBottom: spacing.sm,
  borderRadius: 20,
  borderWidth: isDark ? 1 : 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.sm,
})

const $captureCtaCardPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $captureCtaCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
})

const $captureCtaEyebrow: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 10,
  lineHeight: 13,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  color: colors.vocabularyShowroom.textMuted,
})

const $captureCtaTitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  lineHeight: 22,
  color: colors.vocabularyShowroom.textStrong,
})

const $captureCtaBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  lineHeight: 17,
  color: colors.vocabularyShowroom.textMuted,
})

const $captureCtaAction: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  minWidth: 116,
  borderRadius: 16,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  alignItems: "flex-start",
  justifyContent: "center",
  backgroundColor: isDark ? colors.vocabularyShowroom.surface : colors.vocabularyShowroom.accent,
  borderWidth: isDark ? 1 : 0,
  borderColor: colors.vocabularyShowroom.ctaOutline,
})

const $captureCtaActionText: ThemedStyle<TextStyle> = ({ typography, colors, isDark }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  color: isDark ? colors.tint : colors.palette.neutral100,
})

const $captureCtaActionHint: ThemedStyle<TextStyle> = ({ spacing, typography, colors, isDark }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 10,
  lineHeight: 13,
  color: isDark ? colors.vocabularyShowroom.textMuted : "rgba(255,255,255,0.84)",
})

const $contentCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.md,
  alignSelf: "stretch",
})

const $contentListCard: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  alignItems: "stretch",
  justifyContent: "flex-start",
  borderRadius: 22,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: isDark ? 2 : 1,
  borderColor: colors.vocabularyShowroom.outline,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  marginBottom: spacing.md,
})

const $word: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 36,
  lineHeight: 44,
  color: colors.vocabularyShowroom.textStrong,
  letterSpacing: 0.4,
})

const $wordList: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 28,
  lineHeight: 34,
  color: colors.vocabularyShowroom.textStrong,
  letterSpacing: 0.2,
})

const $pronunciationPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginTop: spacing.sm,
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.sm,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $pronunciationPillList: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "flex-start",
})

const $pillPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $pronunciationText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
  letterSpacing: 0.3,
})

const $audioIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginLeft: spacing.xs,
  height: 18,
  width: 18,
  borderRadius: 9,
  alignItems: "center",
  justifyContent: "center",
})

const $definition: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 20,
  lineHeight: 28,
  textAlign: "center",
  color: colors.vocabularyShowroom.textStrong,
  marginTop: spacing.lg,
})

const $definitionList: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 16,
  lineHeight: 22,
  textAlign: "left",
  color: colors.vocabularyShowroom.textStrong,
  marginTop: spacing.sm,
})

const $example: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 24,
  textAlign: "center",
  color: colors.vocabularyShowroom.textMuted,
  marginTop: spacing.md,
  maxWidth: "90%",
  alignSelf: "center",
})

const $exampleList: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 19,
  textAlign: "left",
  color: colors.vocabularyShowroom.textMuted,
  marginTop: spacing.xs,
})

const $listCardActionsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $listCardActionButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  height: 40,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.detailDivider,
  marginHorizontal: spacing.xxs,
})

const $listCardActionButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
  borderColor: colors.vocabularyShowroom.outline,
})

const $listCardActionButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $stateWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})

const $stateTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $stateBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $retryButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $retryButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $retryText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $inlineErrorWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $inlineErrorText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.error,
  textAlign: "center",
})

const $toastWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  top: 58,
  left: spacing.xl,
  right: spacing.xl,
  alignItems: "center",
  zIndex: 60,
})

const $toastCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  maxWidth: "100%",
  borderRadius: 14,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $toastText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $actionsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "center",
  paddingHorizontal: 0,
  paddingVertical: spacing.sm,
  marginTop: -spacing.xs,
  marginBottom: spacing.sm,
})

const $actionButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 46,
  width: 46,
  borderRadius: 23,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.detailDivider,
  marginHorizontal: spacing.sm,
})

const $actionButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.detailDivider,
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $actionButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $repeatModalBackdrop: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  justifyContent: "center",
  paddingVertical: 12,
  paddingHorizontal: 24,
  backgroundColor: colors.palette.overlay50,
})

const $repeatModalCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: "100%",
  maxHeight: "86%",
  borderRadius: 20,
  padding: spacing.lg,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $repeatModalHeader: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $repeatModalTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: colors.vocabularyShowroom.textStrong,
})

const $repeatModalSubTitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $repeatCloseButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 34,
  width: 34,
  borderRadius: 17,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $repeatCloseButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $repeatEmptyWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
})

const $repeatEmptyText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textMuted,
})

const $repeatListWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  maxHeight: 380,
})

const $repeatListContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xs,
})

const $repeatRow: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.vocabularyShowroom.detailDivider,
})

const $repeatRowContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  paddingRight: 12,
})

const $repeatRowWord: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 15,
  color: colors.vocabularyShowroom.textStrong,
})

const $repeatRowTranslation: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $repeatRemoveButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 30,
  width: 30,
  borderRadius: 15,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $repeatRemoveButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $repeatModalFooter: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  flexDirection: "row",
  justifyContent: "flex-end",
})

const $repeatSecondaryButton: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  paddingHorizontal: spacing.md,
  height: 40,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: isDark ? colors.vocabularyShowroom.dangerBorder : colors.vocabularyShowroom.dangerFill,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceSoft : colors.vocabularyShowroom.dangerFill,
  marginRight: spacing.sm,
})

const $repeatSecondaryButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.5,
})

const $repeatSecondaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  backgroundColor: isDark
    ? colors.vocabularyShowroom.surfaceStrong
    : colors.vocabularyShowroom.dangerFillPressed,
})

const $repeatSecondaryButtonText: ThemedStyle<TextStyle> = ({ typography, colors, isDark }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: isDark ? colors.vocabularyShowroom.dangerText : "#FFFFFF",
})

const $repeatPrimaryButton: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  paddingHorizontal: spacing.lg,
  height: 40,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: isDark ? 1 : 0,
  borderColor: colors.vocabularyShowroom.ctaOutline,
  backgroundColor: isDark ? colors.vocabularyShowroom.surface : colors.vocabularyShowroom.accent,
})

const $repeatPrimaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : colors.vocabularyShowroom.accentPressed,
  borderColor: isDark ? colors.vocabularyShowroom.ctaOutlinePressed : colors.vocabularyShowroom.accentPressed,
})

const $repeatPrimaryButtonText: ThemedStyle<TextStyle> = ({ typography, colors, isDark }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  color: isDark ? colors.tint : colors.palette.neutral100,
})

const $footerRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
})

const $practiceButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $practiceButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
  borderColor: colors.vocabularyShowroom.outline,
})

const $practiceText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
  marginLeft: spacing.xs,
})
