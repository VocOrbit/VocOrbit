import { FC, useCallback, useEffect, useRef, useState } from "react"
import { FlatList, Pressable, TextInput, TextStyle, View, ViewStyle } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

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
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

type VocabularySearchScreenProps = AppStackScreenProps<"VocabularySearch">

function resolveErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") {
    return translate("vocabulary:errors.sessionExpired")
  }
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:errors.cannotConnect")
  }
  return translate("vocabulary:errors.searchLoadFailed")
}

export const VocabularySearchScreen: FC<VocabularySearchScreenProps> = ({ navigation }) => {
  const { themed, theme } = useAppTheme()
  const { setSession } = useAuth()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])

  const requestVersionRef = useRef(0)
  const [queryInput, setQueryInput] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [items, setItems] = useState<WordInsightLearningItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [pronunciationErrorMessage, setPronunciationErrorMessage] = useState<string | undefined>(undefined)
  const [requiresLogin, setRequiresLogin] = useState(false)
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(queryInput.trim())
    }, 500)
    return () => clearTimeout(timeout)
  }, [queryInput])

  const loadSearchResults = useCallback(async (query: string, mode: "initial" | "loadMore" = "initial") => {
    if (mode === "loadMore") {
      if (isLoadingRef.current || isLoadingMoreRef.current || !hasMoreRef.current) return
    }

    requestVersionRef.current += 1
    const requestVersion = requestVersionRef.current
    const offset = mode === "loadMore" ? itemsRef.current.length : 0

    if (mode === "initial") {
      isLoadingRef.current = true
      setIsLoading(true)
      setErrorMessage(undefined)
      setRequiresLogin(false)
    } else {
      isLoadingMoreRef.current = true
      setIsLoadingMore(true)
    }

    const response = await wordInsightApi.listLearningItems({
      status: "all",
      limit: WORD_INSIGHT_LIST_PAGE_LIMIT,
      offset,
      q: query || undefined,
    })
    if (requestVersionRef.current !== requestVersion) return

    if (response.kind === "ok") {
      if (mode === "loadMore") {
        setItems((prev) => {
          const existingIds = new Set(prev.map((item) => item.id))
          const appended = response.data.filter((item) => !existingIds.has(item.id))
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

    if (mode === "initial") {
      setItems([])
      isLoadingRef.current = false
      setIsLoading(false)
      setErrorMessage(resolveErrorMessage(response))
      setRequiresLogin(response.kind === "unauthorized")
    }
    isLoadingMoreRef.current = false
    setIsLoadingMore(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      void loadSearchResults(debouncedQuery, "initial")
    }, [debouncedQuery, loadSearchResults]),
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

  const emptyText =
    debouncedQuery.length > 0
      ? translate("vocabulary:search.emptyResult")
      : translate("vocabulary:search.emptyHint")

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
          <Text style={themed($headerTitle)} text={translate("vocabulary:search.title")} />
          <View style={themed($headerSpacer)} />
        </View>

        <View style={themed($searchWrap)}>
          <Text style={themed($searchEmoji)} text="🔎" />
          <TextInput
            value={queryInput}
            onChangeText={setQueryInput}
            placeholder={translate("vocabulary:search.placeholder")}
            placeholderTextColor={showroomColors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={themed($searchInput)}
          />
          {queryInput.length > 0 ? (
            <Pressable
              onPress={() => setQueryInput("")}
              accessibilityRole="button"
              accessibilityLabel="Clear search query"
              style={({ pressed }) => [themed($clearButton), pressed && themed($clearButtonPressed)]}
            >
              <Icon icon="x" size={12} color={showroomColors.textStrong} />
            </Pressable>
          ) : null}
        </View>

        {pronunciationErrorMessage ? (
          <Text style={themed($pronunciationErrorText)} text={pronunciationErrorMessage} />
        ) : null}

        {isLoading ? (
          <View style={themed($stateWrap)}>
            <Text style={themed($stateTitle)} text={translate("vocabulary:search.loading")} />
          </View>
        ) : errorMessage ? (
          <View style={themed($stateWrap)}>
            <Text style={themed($stateTitle)} text={errorMessage} />
            <Pressable
              onPress={
                requiresLogin
                  ? () => setSession(undefined)
                  : () => void loadSearchResults(debouncedQuery, "initial")
              }
              accessibilityRole="button"
              accessibilityLabel={requiresLogin ? "Go to login" : "Retry loading search data"}
              style={({ pressed }) => [themed($stateButton), pressed && themed($stateButtonPressed)]}
            >
              <Text
                style={themed($stateButtonText)}
                text={requiresLogin ? translate("vocabulary:common.signIn") : translate("vocabulary:common.retry")}
              />
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <View style={themed($stateWrap)}>
            <Text style={themed($stateTitle)} text={emptyText} />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={themed([$listContent, $bottomInsets])}
            onEndReached={() => {
              if (hasMore && !isLoadingMore) {
                void loadSearchResults(debouncedQuery, "loadMore")
              }
            }}
            onEndReachedThreshold={0.6}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={themed($loadingMoreWrap)}>
                  <Text style={themed($stateTitle)} text={translate("vocabulary:search.loading")} />
                </View>
              ) : null
            }
            renderItem={({ item }) => {
              const phonetic = item.phonetic?.trim() || "-"
              const translation = item.translationL1 ?? item.targetMeaning
              const detail = item.definitionL2 || item.whyThisSense || "-"

              return (
                <View style={themed($card)}>
                  <Text style={themed($word)} text={item.vocab} />

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
                    accessibilityLabel={`Play pronunciation for ${item.vocab}`}
                    style={({ pressed }) => [
                      themed($pronunciationPill),
                      pressed && themed($pronunciationPillPressed),
                    ]}
                  >
                    <Text style={themed($pronunciationText)} text={phonetic} />
                    <View style={themed($audioIconWrap)}>
                      <MaterialCommunityIcons name="volume-high" size={12} color={showroomColors.textStrong} />
                    </View>
                  </Pressable>

                  <Text style={themed($translation)} text={translation} />
                  <Text style={themed($detail)} text={detail} />

                  <View style={themed($badgeRow)}>
                    {item.isFavorite ? (
                      <Text style={themed($badgeText)} text={translate("vocabulary:common.favoriteLabel")} />
                    ) : null}
                    {item.status === "learned" ? (
                      <Text style={themed($badgeText)} text={translate("vocabulary:common.learnedLabel")} />
                    ) : null}
                  </View>

                  <Pressable
                    onPress={() => navigation.navigate("VocabularyDetail", { entryId: item.id })}
                    accessibilityRole="button"
                    accessibilityLabel={`Open detail for ${item.vocab}`}
                    style={({ pressed }) => [
                      themed($detailButton),
                      pressed && themed($detailButtonPressed),
                    ]}
                  >
                    <Icon icon="view" size={16} color={showroomColors.textStrong} />
                    <Text style={themed($detailButtonText)} text={translate("vocabulary:common.detailButton")} />
                  </Pressable>
                </View>
              )
            }}
          />
        )}
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

const $searchWrap: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  minHeight: 48,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
})

const $pronunciationErrorText: ThemedStyle<TextStyle> = ({ spacing, colors, typography }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.error,
})

const $searchEmoji: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 16,
  color: colors.vocabularyShowroom.textStrong,
})

const $searchInput: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  flex: 1,
  marginLeft: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 15,
  color: colors.vocabularyShowroom.textStrong,
  paddingVertical: 0,
})

const $clearButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 26,
  width: 26,
  borderRadius: 13,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $clearButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $stateWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginTop: spacing.md,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "transparent",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})

const $stateTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $stateButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
  minHeight: 42,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})

const $stateButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $stateButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
  paddingBottom: spacing.xl,
})

const $loadingMoreWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingTop: spacing.sm,
  paddingBottom: spacing.md,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 18,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  marginBottom: spacing.sm,
})

const $word: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 24,
  lineHeight: 30,
  color: colors.vocabularyShowroom.textStrong,
})

const $pronunciationPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  alignSelf: "flex-start",
  flexDirection: "row",
  alignItems: "center",
  marginTop: spacing.sm,
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.sm,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $pronunciationPillPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $pronunciationText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $audioIconWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginLeft: spacing.xs,
})

const $translation: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.md,
  fontFamily: typography.primary.medium,
  fontSize: 17,
  color: colors.vocabularyShowroom.textStrong,
})

const $detail: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textMuted,
})

const $badgeRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
})

const $badgeText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 11,
  color: colors.vocabularyShowroom.textMuted,
})

const $detailButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  minHeight: 42,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
})

const $detailButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $detailButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})
