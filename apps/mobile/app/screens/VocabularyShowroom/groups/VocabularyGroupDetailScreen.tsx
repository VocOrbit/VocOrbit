import { FC, useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { WORD_INSIGHT_LIST_PAGE_LIMIT } from "@/config/pagination"
import { useAuth } from "@/context/AuthContext"
import { useVocabularyGroupSelection } from "@/context/VocabularyGroupContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import {
  type WordInsightLearningItem,
  type WordInsightLearningItemGroup,
  wordInsightApi,
} from "@/services/api/wordInsightApi"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { DEFAULT_MAX_FONT_SIZE_MULTIPLIER } from "@/utils/textScaling"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

type VocabularyGroupDetailScreenProps = AppStackScreenProps<"VocabularyGroupDetail">

function resolveErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") {
    return translate("vocabulary:errors.sessionExpired")
  }
  if (problem.kind === "not-found") {
    return translate("vocabulary:errors.groupNotFound")
  }
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:errors.cannotConnect")
  }
  return translate("vocabulary:errors.groupActionFailed")
}

export const VocabularyGroupDetailScreen: FC<VocabularyGroupDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { groupId, groupName, itemCount } = route.params
  const { themed, theme } = useAppTheme()
  const { setSession } = useAuth()
  const { selectedGroupId, setSelectedGroupId } = useVocabularyGroupSelection()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])

  const [group, setGroup] = useState<WordInsightLearningItemGroup | undefined>(undefined)
  const [items, setItems] = useState<WordInsightLearningItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [requiresLogin, setRequiresLogin] = useState(false)
  const [listError, setListError] = useState<string | undefined>(undefined)
  const [isMutatingItemId, setIsMutatingItemId] = useState<string | undefined>(undefined)
  const [isDeletingGroup, setIsDeletingGroup] = useState(false)
  const [isRenameMode, setIsRenameMode] = useState(false)
  const [renameGroupName, setRenameGroupName] = useState(groupName)
  const [isRenamingGroup, setIsRenamingGroup] = useState(false)

  const itemsRef = useRef<WordInsightLearningItem[]>([])
  const isLoadingRef = useRef(isLoading)
  const isLoadingMoreRef = useRef(isLoadingMore)
  const hasMoreRef = useRef(hasMore)

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

  const loadItems = useCallback(
    async (mode: "initial" | "loadMore" = "initial") => {
      if (mode === "loadMore") {
        if (isLoadingRef.current || isLoadingMoreRef.current || !hasMoreRef.current) return
        isLoadingMoreRef.current = true
        setIsLoadingMore(true)
      } else {
        isLoadingRef.current = true
        setIsLoading(true)
        setListError(undefined)
        setRequiresLogin(false)
        hasMoreRef.current = true
        setHasMore(true)
      }

      const offset = mode === "loadMore" ? itemsRef.current.length : 0
      const [itemsResponse, groupsResponse] = await Promise.all([
        wordInsightApi.listLearningItemsByGroup(groupId, {
          limit: WORD_INSIGHT_LIST_PAGE_LIMIT,
          offset,
        }),
        mode === "initial" ? wordInsightApi.listLearningItemGroups() : Promise.resolve(undefined),
      ])

      if (groupsResponse) {
        if (groupsResponse.kind === "ok") {
          const currentGroup = groupsResponse.data.find((candidate) => candidate.id === groupId)
          if (!currentGroup) {
            setItems([])
            setListError(translate("vocabulary:errors.groupNotFound"))
            hasMoreRef.current = false
            setHasMore(false)
            isLoadingRef.current = false
            isLoadingMoreRef.current = false
            setIsLoading(false)
            setIsLoadingMore(false)
            return
          }
          setGroup(currentGroup)
        } else if (groupsResponse.kind === "unauthorized") {
          setRequiresLogin(true)
        }
      }

      if (itemsResponse.kind === "ok") {
        if (mode === "loadMore") {
          setItems((prev) => {
            const existingIds = new Set(prev.map((item) => item.id))
            const appended = itemsResponse.data.filter((item) => !existingIds.has(item.id))
            return [...prev, ...appended]
          })
        } else {
          setItems(itemsResponse.data)
        }
        hasMoreRef.current = itemsResponse.data.length >= WORD_INSIGHT_LIST_PAGE_LIMIT
        setHasMore(itemsResponse.data.length >= WORD_INSIGHT_LIST_PAGE_LIMIT)
        isLoadingRef.current = false
        isLoadingMoreRef.current = false
        setIsLoading(false)
        setIsLoadingMore(false)
        return
      }

      if (mode === "initial") {
        setItems([])
        setListError(resolveErrorMessage(itemsResponse))
        setRequiresLogin(itemsResponse.kind === "unauthorized")
        isLoadingRef.current = false
        setIsLoading(false)
      }
      isLoadingMoreRef.current = false
      setIsLoadingMore(false)
    },
    [groupId],
  )

  useFocusEffect(
    useCallback(() => {
      itemsRef.current = []
      void loadItems("initial")
    }, [loadItems]),
  )

  const displayName = group?.name ?? groupName
  const displayCount = group?.itemCount ?? itemCount ?? items.length
  const isActiveGroup = selectedGroupId === groupId
  const activeControlForeground = theme.isDark ? showroomColors.accent : showroomColors.accentText
  const showErrorState = Boolean(listError) && items.length === 0 && !isLoading
  const isRenameDisabled = renameGroupName.trim().length === 0 || isRenamingGroup

  useEffect(() => {
    if (!isRenameMode) {
      setRenameGroupName(displayName)
    }
  }, [displayName, isRenameMode])

  const handleRetry = useCallback(() => {
    if (requiresLogin) {
      setSession(undefined)
      return
    }

    void loadItems("initial")
  }, [loadItems, requiresLogin, setSession])

  const handleDeleteGroup = useCallback(() => {
    if (isDeletingGroup) return

    Alert.alert(
      translate("vocabulary:showroom.groupDeleteConfirmTitle"),
      translate("vocabulary:showroom.groupDeleteConfirmBody", { name: displayName }),
      [
        {
          text: translate("vocabulary:showroom.groupDeleteConfirmCancel"),
          style: "cancel",
        },
        {
          text: translate("vocabulary:showroom.groupDeleteConfirmAction"),
          style: "destructive",
          onPress: () => {
            setIsDeletingGroup(true)
            setListError(undefined)
            void (async () => {
              try {
                const response = await wordInsightApi.deleteLearningItemGroup(groupId)
                if (response.kind === "ok") {
                  if (selectedGroupId === groupId) {
                    setSelectedGroupId(undefined)
                  }
                  navigation.goBack()
                  return
                }

                setListError(resolveErrorMessage(response))
                setRequiresLogin(response.kind === "unauthorized")
              } finally {
                setIsDeletingGroup(false)
              }
            })()
          },
        },
      ],
    )
  }, [displayName, groupId, isDeletingGroup, navigation, selectedGroupId, setSelectedGroupId])

  const handleSaveRenamedGroup = useCallback(() => {
    if (isRenamingGroup) return

    const trimmedName = renameGroupName.trim()
    if (!trimmedName) return

    if (trimmedName === displayName.trim()) {
      setIsRenameMode(false)
      setRenameGroupName(displayName)
      return
    }

    setIsRenamingGroup(true)
    setListError(undefined)
    void (async () => {
      try {
        const response = await wordInsightApi.updateLearningItemGroup(groupId, trimmedName)
        if (response.kind === "ok") {
          setGroup(response.data)
          setRenameGroupName(response.data.name)
          setIsRenameMode(false)
          navigation.setParams({
            groupName: response.data.name,
            itemCount: response.data.itemCount,
          })
          return
        }

        setListError(resolveErrorMessage(response))
        setRequiresLogin(response.kind === "unauthorized")
      } finally {
        setIsRenamingGroup(false)
      }
    })()
  }, [displayName, groupId, isRenamingGroup, navigation, renameGroupName])

  const handleRenameButtonPress = useCallback(() => {
    if (isRenameMode) {
      handleSaveRenamedGroup()
      return
    }

    setRenameGroupName(displayName)
    setIsRenameMode(true)
  }, [displayName, handleSaveRenamedGroup, isRenameMode])

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      if (isMutatingItemId) return

      setIsMutatingItemId(itemId)
      setListError(undefined)
      void (async () => {
        try {
          const response = await wordInsightApi.removeLearningItemFromGroup(groupId, itemId)
          if (response.kind === "ok") {
            setGroup(response.data)
            setItems((prev) => prev.filter((item) => item.id !== itemId))
            return
          }

          setListError(resolveErrorMessage(response))
          setRequiresLogin(response.kind === "unauthorized")
        } finally {
          setIsMutatingItemId(undefined)
        }
      })()
    },
    [groupId, isMutatingItemId],
  )

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      backgroundColor={showroomColors.background}
      systemBarStyle={theme.isDark ? "light" : "dark"}
      contentContainerStyle={themed($screenContent)}
    >
      <View style={themed($layout)}>
        <View style={themed($headerRow)}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={translate("common:back")}
            style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
            hitSlop={6}
          >
            <Icon icon="back" size={16} color={showroomColors.textStrong} />
          </Pressable>
          <Text style={themed($headerTitle)} text={displayName} numberOfLines={1} />
          <Pressable
            onPress={handleDeleteGroup}
            disabled={isDeletingGroup}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:showroom.groupDeleteConfirmAction")}
            style={({ pressed }) => [
              themed($iconButton),
              themed($deleteHeaderButton),
              isDeletingGroup && themed($buttonDisabled),
              pressed && !isDeletingGroup && themed($deleteHeaderButtonPressed),
            ]}
            hitSlop={6}
          >
            {isDeletingGroup ? (
              <ActivityIndicator size="small" color={showroomColors.dangerText} />
            ) : (
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={18}
                color={showroomColors.dangerText}
              />
            )}
          </Pressable>
        </View>

        <View style={themed($summaryPanel)}>
          <View style={themed($summaryTitleRow)}>
            <View style={themed($summaryTextWrap)}>
              <Text
                style={themed($summaryLabel)}
                text={translate("vocabulary:showroom.groupsTitle")}
              />
              {isRenameMode ? (
                <View style={themed($renamePanel)}>
                  <TextField
                    value={renameGroupName}
                    onChangeText={setRenameGroupName}
                    placeholder={translate("vocabulary:showroom.groupNamePlaceholder")}
                    placeholderTextColor={showroomColors.textMuted}
                    autoCapitalize="sentences"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSaveRenamedGroup}
                    allowFontScaling
                    maxFontSizeMultiplier={DEFAULT_MAX_FONT_SIZE_MULTIPLIER}
                    editable={!isRenamingGroup}
                    autoFocus
                    containerStyle={themed($renameInputContainer)}
                    inputWrapperStyle={themed($renameInputWrapper)}
                    style={themed($renameInput)}
                  />
                </View>
              ) : (
                <Text style={themed($summaryName)} text={displayName} numberOfLines={2} />
              )}
            </View>
            <View style={themed($summarySide)}>
              <Pressable
                onPress={handleRenameButtonPress}
                disabled={isRenameMode ? isRenameDisabled : isRenamingGroup}
                accessibilityRole="button"
                accessibilityLabel={translate("vocabulary:showroom.renameGroupButton")}
                style={({ pressed }) => [
                  themed($renameIconButton),
                  isRenameMode && themed($renameIconButtonActive),
                  (isRenameMode ? isRenameDisabled : isRenamingGroup) && themed($buttonDisabled),
                  pressed &&
                    !(isRenameMode ? isRenameDisabled : isRenamingGroup) &&
                    themed($renameIconButtonPressed),
                ]}
              >
                {isRenamingGroup ? (
                  <ActivityIndicator size="small" color={activeControlForeground} />
                ) : (
                  <MaterialCommunityIcons
                    name={isRenameMode ? "check" : "pencil-outline"}
                    size={18}
                    color={isRenameMode ? activeControlForeground : showroomColors.textStrong}
                  />
                )}
              </Pressable>
              <View style={themed($countPill)}>
                <Text
                  style={themed($countPillText)}
                  text={translate("vocabulary:showroom.groupWordCount", { count: displayCount })}
                />
              </View>
            </View>
          </View>

          <View style={themed($summaryActions)}>
            <Pressable
              onPress={() => setSelectedGroupId(groupId)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isActiveGroup }}
              accessibilityLabel={displayName}
              style={({ pressed }) => [
                themed($secondaryActionButton),
                isActiveGroup && themed($secondaryActionButtonActive),
                pressed && themed($secondaryActionButtonPressed),
              ]}
            >
              <MaterialCommunityIcons
                name={isActiveGroup ? "radiobox-marked" : "radiobox-blank"}
                size={17}
                color={isActiveGroup ? activeControlForeground : showroomColors.textStrong}
              />
              <Text
                style={[
                  themed($secondaryActionText),
                  isActiveGroup && themed($secondaryActionTextActive),
                ]}
                text={
                  isActiveGroup
                    ? translate("vocabulary:showroom.activeGroupTitle")
                    : translate("vocabulary:showroom.activateGroupButton")
                }
                numberOfLines={1}
              />
            </Pressable>

            <Pressable
              onPress={() =>
                navigation.navigate("VocabularySearch", {
                  targetGroupId: groupId,
                  targetGroupName: displayName,
                })
              }
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:showroom.groupAddTo", {
                name: displayName,
              })}
              style={({ pressed }) => [
                themed($primaryActionButton),
                pressed && themed($primaryActionButtonPressed),
              ]}
            >
              <MaterialCommunityIcons name="plus" size={17} color={showroomColors.accentText} />
              <Text
                style={themed($primaryActionText)}
                text={translate("vocabulary:showroom.addToGroupButton")}
                numberOfLines={1}
              />
            </Pressable>
          </View>
        </View>

        {listError && items.length > 0 ? (
          <Text style={themed($listErrorText)} text={listError} />
        ) : null}

        {isLoading ? (
          <View style={themed($stateWrap)}>
            <ActivityIndicator size="small" color={showroomColors.textStrong} />
            <Text style={themed($stateTitle)} text={translate("vocabulary:search.loading")} />
          </View>
        ) : showErrorState ? (
          <View style={themed($stateWrap)}>
            <Text style={themed($stateTitle)} text={listError} />
            <Pressable
              onPress={handleRetry}
              accessibilityRole="button"
              accessibilityLabel={
                requiresLogin
                  ? translate("vocabulary:common.signIn")
                  : translate("vocabulary:common.retry")
              }
              style={({ pressed }) => [
                themed($stateButton),
                pressed && themed($stateButtonPressed),
              ]}
            >
              <Text
                style={themed($stateButtonText)}
                text={
                  requiresLogin
                    ? translate("vocabulary:common.signIn")
                    : translate("vocabulary:common.retry")
                }
              />
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <View style={themed($emptyWrap)}>
            <Text
              style={themed($emptyTitle)}
              text={translate("vocabulary:showroom.groupItemsEmpty")}
            />
            <Text
              style={themed($emptyBody)}
              text={translate("vocabulary:showroom.searchToAddHint")}
            />
            <Pressable
              onPress={() =>
                navigation.navigate("VocabularySearch", {
                  targetGroupId: groupId,
                  targetGroupName: displayName,
                })
              }
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:showroom.groupAddTo", {
                name: displayName,
              })}
              style={({ pressed }) => [
                themed($emptyActionButton),
                pressed && themed($primaryActionButtonPressed),
              ]}
            >
              <MaterialCommunityIcons name="plus" size={17} color="#FFFFFF" />
              <Text
                style={themed($primaryActionText)}
                text={translate("vocabulary:showroom.addToGroupButton")}
              />
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={themed([$wordListContent, $bottomInsets])}
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
              const detail = item.definitionL2 || item.whyThisSense || "-"
              const isMutating = isMutatingItemId === item.id

              return (
                <View style={themed($wordCard)}>
                  <View style={themed($wordCardBody)}>
                    <Text style={themed($wordTitle)} text={item.vocab} numberOfLines={1} />
                    <Text style={themed($wordMeaning)} text={translation} numberOfLines={1} />
                    <Text style={themed($wordDetail)} text={detail} numberOfLines={2} />
                  </View>

                  <View style={themed($wordActions)}>
                    <Pressable
                      onPress={() => navigation.navigate("VocabularyDetail", { entryId: item.id })}
                      accessibilityRole="button"
                      accessibilityLabel={translate("vocabulary:common.detailButton")}
                      style={({ pressed }) => [
                        themed($wordActionButton),
                        pressed && themed($wordActionButtonPressed),
                      ]}
                    >
                      <Icon icon="view" size={17} color={showroomColors.textStrong} />
                      <Text
                        style={themed($wordActionText)}
                        text={translate("vocabulary:common.detailButton")}
                        numberOfLines={1}
                      />
                    </Pressable>

                    <Pressable
                      onPress={() => handleRemoveItem(item.id)}
                      disabled={isMutatingItemId !== undefined}
                      accessibilityRole="button"
                      accessibilityLabel={translate("vocabulary:showroom.removeFromGroupButton")}
                      style={({ pressed }) => [
                        themed($removeButton),
                        isMutating && themed($buttonDisabled),
                        pressed && !isMutating && themed($removeButtonPressed),
                      ]}
                    >
                      {isMutating ? (
                        <ActivityIndicator size="small" color={showroomColors.dangerText} />
                      ) : (
                        <MaterialCommunityIcons
                          name="minus-circle-outline"
                          size={17}
                          color={showroomColors.dangerText}
                        />
                      )}
                      <Text
                        style={themed($removeButtonText)}
                        text={translate("vocabulary:showroom.removeFromGroupButton")}
                        numberOfLines={1}
                      />
                    </Pressable>
                  </View>
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

const $deleteHeaderButton: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  borderWidth: 1,
  borderColor: isDark ? colors.vocabularyShowroom.dangerBorder : colors.vocabularyShowroom.outline,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceSoft : "rgba(217, 117, 117, 0.12)",
})

const $deleteHeaderButtonPressed: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : "rgba(217, 117, 117, 0.2)",
  borderColor: colors.vocabularyShowroom.dangerBorder,
})

const $headerTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flex: 1,
  marginHorizontal: 12,
  fontFamily: typography.primary.semiBold,
  fontSize: 21,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $summaryPanel: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  padding: spacing.md,
})

const $summaryTitleRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: spacing.sm,
})

const $summaryTextWrap: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
})

const $summaryLabel: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $summaryName: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.semiBold,
  fontSize: 20,
  lineHeight: 26,
  color: colors.vocabularyShowroom.textStrong,
})

const $summarySide: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "flex-end",
  gap: spacing.xs,
})

const $renameIconButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 34,
  width: 34,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  alignItems: "center",
  justifyContent: "center",
})

const $renameIconButtonActive: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  borderColor: colors.vocabularyShowroom.accent,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : colors.palette.primary100,
})

const $renameIconButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $renamePanel: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $renameInputContainer: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
})

const $renameInputWrapper: ThemedStyle<ViewStyle> = ({ colors }) => ({
  minHeight: 42,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  alignItems: "center",
})

const $renameInput: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  flex: 1,
  minHeight: 42,
  marginHorizontal: 0,
  marginVertical: 0,
  paddingHorizontal: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 15,
  color: colors.vocabularyShowroom.textStrong,
})

const $countPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 28,
  borderRadius: 999,
  paddingHorizontal: spacing.sm,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  alignItems: "center",
  justifyContent: "center",
})

const $countPillText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.textStrong,
})

const $summaryActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginTop: spacing.md,
})

const $secondaryActionButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  minHeight: 42,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
})

const $secondaryActionButtonActive: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  borderColor: colors.vocabularyShowroom.accent,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : colors.palette.primary100,
})

const $secondaryActionButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $secondaryActionText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flexShrink: 1,
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $secondaryActionTextActive: ThemedStyle<TextStyle> = ({ colors, isDark }) => ({
  color: isDark ? colors.vocabularyShowroom.accent : colors.vocabularyShowroom.accentText,
})

const $primaryActionButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  minHeight: 42,
  borderRadius: 12,
  backgroundColor: colors.vocabularyShowroom.accent,
  paddingHorizontal: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
})

const $primaryActionButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $primaryActionText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flexShrink: 1,
  fontFamily: typography.primary.semiBold,
  fontSize: 13,
  color: colors.vocabularyShowroom.accentText,
})

const $listErrorText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.error,
})

const $stateWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})

const $stateTitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
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

const $emptyWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})

const $emptyTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 17,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $emptyBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 19,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $emptyActionButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  minHeight: 42,
  borderRadius: 12,
  backgroundColor: colors.vocabularyShowroom.accent,
  paddingHorizontal: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
})

const $wordListContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
  paddingBottom: spacing.md,
})

const $listLoadingMoreWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.md,
})

const $wordCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  padding: spacing.md,
  marginBottom: spacing.sm,
})

const $wordCardBody: ThemedStyle<ViewStyle> = () => ({
  minWidth: 0,
})

const $wordTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 20,
  color: colors.vocabularyShowroom.textStrong,
})

const $wordMeaning: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $wordDetail: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 19,
  color: colors.vocabularyShowroom.textMuted,
})

const $wordActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
  marginTop: spacing.md,
})

const $wordActionButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  minWidth: 128,
  minHeight: 40,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
})

const $wordActionButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $wordActionText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flexShrink: 1,
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $removeButton: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  flex: 1,
  minWidth: 128,
  minHeight: 40,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: isDark ? colors.vocabularyShowroom.dangerBorder : colors.vocabularyShowroom.outline,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceSoft : "rgba(217, 117, 117, 0.12)",
  paddingHorizontal: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
})

const $removeButtonPressed: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : "rgba(217, 117, 117, 0.2)",
  borderColor: colors.vocabularyShowroom.dangerBorder,
})

const $removeButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flexShrink: 1,
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.dangerText,
})

const $buttonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.6,
})
