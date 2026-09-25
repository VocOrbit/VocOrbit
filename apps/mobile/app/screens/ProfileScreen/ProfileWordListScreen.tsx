import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ActivityIndicator, FlatList, Platform, Pressable, TextStyle, View, ViewStyle } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { WORD_INSIGHT_LIST_PAGE_LIMIT } from "@/config/pagination"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { speakWord } from "@/services/pronunciation/pronunciationService"
import { type WordInsightLearningItem, wordInsightApi } from "@/services/api/wordInsightApi"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { resolveDisplayPhonetic } from "@/utils/phonetic"

type ProfileWordListScreenProps = AppStackScreenProps<"ProfileWordList">
type ProfileWordListMode = "favorites" | "learned"

function resolveListErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") return translate("vocabulary:errors.sessionExpired")
  if (problem.kind === "not-found") return translate("vocabulary:errors.itemNotFound")
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:errors.cannotConnect")
  }
  return translate("vocabulary:errors.listLoadFailed")
}

function resolveListTitle(mode: ProfileWordListMode): string {
  return mode === "favorites"
    ? translate("vocabulary:profile.favoriteWordsTitle")
    : translate("vocabulary:profile.learnedWordsTitle")
}

function resolveEmptyStateText(mode: ProfileWordListMode): string {
  return mode === "favorites"
    ? translate("vocabulary:profile.emptyFavorites")
    : translate("vocabulary:profile.emptyLearned")
}

export const ProfileWordListScreen: FC<ProfileWordListScreenProps> = ({ navigation, route }) => {
  const mode = route.params.mode
  const { themed, theme } = useAppTheme()
  const { logout } = useAuth()
  const showroomColors = theme.colors.vocabularyShowroom
  const [items, setItems] = useState<WordInsightLearningItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isMutatingItemId, setIsMutatingItemId] = useState<string | undefined>(undefined)
  const [listError, setListError] = useState<string | undefined>(undefined)
  const [pronunciationErrorMessage, setPronunciationErrorMessage] = useState<string | undefined>(undefined)
  const itemsRef = useRef<WordInsightLearningItem[]>([])
  const isLoadingRef = useRef(isLoading)
  const isLoadingMoreRef = useRef(isLoadingMore)
  const hasMoreRef = useRef(hasMore)
  const pronunciationErrorTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    itemsRef.current = items
  }, [items])
  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])
  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore
  }, [isLoadingMore])
  useEffect(() => {
    hasMoreRef.current = hasMore
  }, [hasMore])
  useEffect(() => {
    return () => {
      if (pronunciationErrorTimeoutRef.current) {
        clearTimeout(pronunciationErrorTimeoutRef.current)
      }
    }
  }, [])

  const loadItems = useCallback(async (fetchMode: "initial" | "loadMore" = "initial") => {
    if (fetchMode === "loadMore") {
      if (isLoadingRef.current || isLoadingMoreRef.current || !hasMoreRef.current) return
      isLoadingMoreRef.current = true
      setIsLoadingMore(true)
    } else {
      isLoadingRef.current = true
      setIsLoading(true)
      setListError(undefined)
      hasMoreRef.current = true
      setHasMore(true)
    }

    const offset = fetchMode === "loadMore" ? itemsRef.current.length : 0

    const response = await wordInsightApi.listLearningItems({
      status: mode === "favorites" ? "all" : "learned",
      favorite: mode === "favorites" ? true : undefined,
      limit: WORD_INSIGHT_LIST_PAGE_LIMIT,
      offset,
    })

    if (response.kind === "ok") {
      if (fetchMode === "loadMore") {
        setItems((prev) => {
          const existingIds = new Set(prev.map((entry) => entry.id))
          const appended = response.data.filter((entry) => !existingIds.has(entry.id))
          return [...prev, ...appended]
        })
      } else {
        setItems(response.data)
      }
      hasMoreRef.current = response.data.length >= WORD_INSIGHT_LIST_PAGE_LIMIT
      setHasMore(response.data.length >= WORD_INSIGHT_LIST_PAGE_LIMIT)
      isLoadingRef.current = false
      isLoadingMoreRef.current = false
      setIsLoading(false)
      setIsLoadingMore(false)
      return
    }

    if (fetchMode === "initial") {
      isLoadingRef.current = false
      setIsLoading(false)
      setListError(resolveListErrorMessage(response))
      if (response.kind === "unauthorized") {
        logout()
      }
    }
    isLoadingMoreRef.current = false
    setIsLoadingMore(false)
  }, [logout, mode])

  useFocusEffect(
    useCallback(() => {
      itemsRef.current = []
      void loadItems("initial")
    }, [loadItems]),
  )

  const showPronunciationError = useCallback(() => {
    if (pronunciationErrorTimeoutRef.current) {
      clearTimeout(pronunciationErrorTimeoutRef.current)
    }
    setPronunciationErrorMessage(translate("vocabulary:errors.unexpected"))
    pronunciationErrorTimeoutRef.current = setTimeout(() => {
      setPronunciationErrorMessage(undefined)
    }, 2400)
  }, [])

  const handleRemoveItem = useCallback(
    (item: WordInsightLearningItem) => {
      if (isMutatingItemId) return

      setIsMutatingItemId(item.id)
      setListError(undefined)

      void (async () => {
        try {
          const response =
            mode === "favorites"
              ? await wordInsightApi.unmarkLearningItemFavorite(item.id)
              : await wordInsightApi.reopenLearningItem(item.id)

          if (response.kind === "ok") {
            setItems((prev) => prev.filter((entry) => entry.id !== item.id))
            return
          }

          setListError(resolveListErrorMessage(response))
          if (response.kind === "unauthorized") {
            logout()
          }
        } finally {
          setIsMutatingItemId(undefined)
        }
      })()
    },
    [isMutatingItemId, logout, mode],
  )

  const title = useMemo(() => resolveListTitle(mode), [mode])
  const emptyStateText = useMemo(() => resolveEmptyStateText(mode), [mode])

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
          <Text style={themed($headerTitle)} text={title} />
          <View style={themed($headerSpacer)}>
            <AppTutorialVideoButton
              screen="profile_word_list"
              placement={mode}
              variant="help"
              containerStyle={themed($iconButton)}
            />
          </View>
        </View>

        {listError ? <Text style={themed($listErrorText)} text={listError} /> : null}
        {pronunciationErrorMessage ? (
          <Text style={themed($listErrorText)} text={pronunciationErrorMessage} />
        ) : null}

        <AppTutorialVideoButton
          screen="profile_word_list"
          placement={mode}
          variant="banner"
          hideAfterSeen
          containerStyle={{ marginBottom: theme.spacing.md }}
        />

        <View style={themed($listContainer)}>
          {isLoading ? (
            <View style={themed($listStateWrap)}>
              <ActivityIndicator size="small" color={showroomColors.textStrong} />
              <Text style={themed($listStateText)} text={translate("vocabulary:profile.loadingList")} />
            </View>
          ) : items.length === 0 ? (
            <View style={themed($listStateWrap)}>
              <Text style={themed($listStateText)} text={emptyStateText} />
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={themed($wordListContent)}
              onEndReached={() => {
                if (hasMore && !isLoadingMore) {
                  void loadItems("loadMore")
                }
              }}
              onEndReachedThreshold={0.6}
              ListFooterComponent={
                isLoadingMore ? (
                  <View style={themed($listLoadingMoreWrap)}>
                    <ActivityIndicator size="small" color={showroomColors.textStrong} />
                  </View>
                ) : null
              }
              renderItem={({ item }) => {
                const translation = item.translationL1 ?? item.targetMeaning
                const detail = item.definitionL2 || "-"
                const phonetic = resolveDisplayPhonetic(item.phonetic)
                const isMutating = isMutatingItemId === item.id

                return (
                  <View style={themed($listCard)}>
                    <Text style={themed($wordSurface)} text={item.vocab} />

                    <Pressable
                      onPress={() => {
                        void (async () => {
                          const result = await speakWord({
                            word: item.vocab,
                            sourceLang: item.sourceLang,
                          })
                          if (result === "failed") {
                            showPronunciationError()
                          }
                        })()
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={translate("vocabulary:profile.accessibility.playPronunciation", {
                        word: item.vocab,
                      })}
                      style={({ pressed }) => [
                        themed($pronunciationPill),
                        pressed && themed($pronunciationPillPressed),
                      ]}
                    >
                      <Text
                        style={themed($pronunciationText)}
                        text={phonetic}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      />
                      <View style={themed($audioIconWrap)}>
                        <MaterialCommunityIcons
                          name="volume-high"
                          size={14}
                          color={showroomColors.textStrong}
                        />
                      </View>
                    </Pressable>

                    <Text style={themed($wordMeaning)} text={translation} />
                    <Text style={themed($wordDetail)} text={detail} />

                    <View style={themed($rowActionRow)}>
                      <Pressable
                        onPress={() => navigation.navigate("VocabularyDetail", { entryId: item.id })}
                        accessibilityRole="button"
                        accessibilityLabel={translate("vocabulary:profile.accessibility.openDetailForWord", {
                          word: item.vocab,
                        })}
                        style={({ pressed }) => [
                          themed($listCardActionButton),
                          pressed && themed($listCardActionButtonPressed),
                        ]}
                      >
                        <Icon icon="view" size={18} color={showroomColors.textStrong} />
                      </Pressable>

                      <Pressable
                        onPress={() => handleRemoveItem(item)}
                        disabled={isMutatingItemId !== undefined}
                        accessibilityRole="button"
                        accessibilityLabel={translate("vocabulary:profile.accessibility.removeWord", {
                          word: item.vocab,
                        })}
                        style={({ pressed }) => [
                          themed($listCardActionButton),
                          themed($listCardActionButtonDanger),
                          isMutating && themed($listCardActionButtonDisabled),
                          pressed && !isMutating && themed($listCardActionButtonDangerPressed),
                        ]}
                      >
                        {isMutating ? (
                          <ActivityIndicator size="small" color={showroomColors.dangerText} />
                        ) : (
                          <Icon icon="x" size={16} color={showroomColors.dangerText} />
                        )}
                      </Pressable>
                    </View>
                  </View>
                )
              }}
            />
          )}
        </View>
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
  fontSize: 21,
  color: colors.vocabularyShowroom.textStrong,
})

const $headerSpacer: ThemedStyle<ViewStyle> = () => ({
  width: 40,
})

const $listErrorText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.md,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.error,
})

const $listContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  marginTop: spacing.sm,
  backgroundColor: "transparent",
})

const $listStateWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})

const $listStateText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $wordListContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.sm,
  paddingBottom: spacing.sm,
})

const $listLoadingMoreWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.md,
})

const $listCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 22,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  marginBottom: spacing.sm,
})

const $wordSurface: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 28,
  lineHeight: 34,
  color: colors.vocabularyShowroom.textStrong,
})

const $pronunciationPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  alignSelf: "flex-start",
  flexDirection: "row",
  alignItems: "center",
  marginTop: spacing.sm,
  maxWidth: "100%",
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.sm,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $pronunciationPillPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $pronunciationText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flexShrink: 1,
  fontFamily: Platform.select({
    android: typography.secondary?.medium ?? typography.primary.medium,
    default: typography.primary.medium,
  }),
  fontSize: 13,
  includeFontPadding: false,
  color: colors.vocabularyShowroom.textStrong,
})

const $audioIconWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginLeft: spacing.xs,
})

const $wordMeaning: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.md,
  fontFamily: typography.primary.medium,
  fontSize: 18,
  lineHeight: 24,
  color: colors.vocabularyShowroom.textStrong,
})

const $wordDetail: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textMuted,
})

const $listCardActionButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  minHeight: 44,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.md,
})

const $listCardActionButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $listCardActionButtonDanger: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceSoft : "rgba(217, 117, 117, 0.12)",
  borderColor: isDark ? colors.vocabularyShowroom.dangerBorder : colors.vocabularyShowroom.outline,
})

const $listCardActionButtonDangerPressed: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : "rgba(217, 117, 117, 0.2)",
  borderColor: isDark ? colors.vocabularyShowroom.dangerBorder : colors.vocabularyShowroom.dangerBorder,
})

const $listCardActionButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.6,
})

const $rowActionRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})
