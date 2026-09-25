import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  FlatList,
  Pressable,
  TextStyle,
  View,
  ViewStyle,
  type GestureResponderEvent,
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"

import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAuth } from "@/context/AuthContext"
import { useVocabularyGroupSelection } from "@/context/VocabularyGroupContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { type WordInsightLearningItemGroup, wordInsightApi } from "@/services/api/wordInsightApi"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { DEFAULT_MAX_FONT_SIZE_MULTIPLIER } from "@/utils/textScaling"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

type VocabularyGroupsScreenProps = AppStackScreenProps<"VocabularyGroups">

function resolveErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") {
    return translate("vocabulary:errors.sessionExpired")
  }
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:errors.cannotConnect")
  }
  return translate("vocabulary:errors.groupActionFailed")
}

export const VocabularyGroupsScreen: FC<VocabularyGroupsScreenProps> = ({ navigation }) => {
  const { themed, theme } = useAppTheme()
  const { setSession } = useAuth()
  const { selectedGroupId, setSelectedGroupId } = useVocabularyGroupSelection()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])

  const [groups, setGroups] = useState<WordInsightLearningItemGroup[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [requiresLogin, setRequiresLogin] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [flashMessage, setFlashMessage] = useState<string | undefined>(undefined)
  const [newGroupName, setNewGroupName] = useState("")
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId),
    [groups, selectedGroupId],
  )
  const activeGroupName =
    selectedGroup?.name ??
    (selectedGroupId
      ? translate("vocabulary:showroom.selectGroupTitle")
      : translate("vocabulary:practiceHub.allWords"))

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current)
      }
    }
  }, [])

  const showFlashMessage = useCallback((message: string) => {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current)
    }
    setFlashMessage(message)
    flashTimeoutRef.current = setTimeout(() => {
      setFlashMessage(undefined)
    }, 2400)
  }, [])

  const loadGroups = useCallback(async () => {
    setIsLoadingGroups(true)
    setErrorMessage(undefined)
    setRequiresLogin(false)

    const response = await wordInsightApi.listLearningItemGroups()
    if (response.kind === "ok") {
      setGroups(response.data)
      if (selectedGroupId && !response.data.some((group) => group.id === selectedGroupId)) {
        setSelectedGroupId(undefined)
      }
      setIsLoadingGroups(false)
      return
    }

    setIsLoadingGroups(false)
    setErrorMessage(resolveErrorMessage(response))
    setRequiresLogin(response.kind === "unauthorized")
  }, [selectedGroupId, setSelectedGroupId])

  useFocusEffect(
    useCallback(() => {
      void loadGroups()
    }, [loadGroups]),
  )

  const handleCreateGroup = useCallback(() => {
    const trimmedName = newGroupName.trim()
    if (!trimmedName || isMutating) return

    setIsMutating(true)
    setErrorMessage(undefined)
    void (async () => {
      try {
        const response = await wordInsightApi.createLearningItemGroup(trimmedName)
        if (response.kind === "ok") {
          setGroups((prev) => [
            response.data,
            ...prev.filter((group) => group.id !== response.data.id),
          ])
          setNewGroupName("")
          setSelectedGroupId(response.data.id)
          showFlashMessage(translate("vocabulary:showroom.groupCreated"))
          return
        }

        setErrorMessage(resolveErrorMessage(response))
        setRequiresLogin(response.kind === "unauthorized")
      } finally {
        setIsMutating(false)
      }
    })()
  }, [isMutating, newGroupName, setSelectedGroupId, showFlashMessage])

  const handleSelectGroup = useCallback(
    (groupId?: string, event?: GestureResponderEvent) => {
      event?.stopPropagation()
      setSelectedGroupId(groupId)
    },
    [setSelectedGroupId],
  )

  const handleRetry = useCallback(() => {
    if (requiresLogin) {
      setSession(undefined)
      return
    }

    void loadGroups()
  }, [loadGroups, requiresLogin, setSession])

  const showState = Boolean(errorMessage) && groups.length === 0 && !isLoadingGroups
  const isCreateDisabled = newGroupName.trim().length === 0 || isMutating

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      backgroundColor={showroomColors.background}
      systemBarStyle={theme.isDark ? "light" : "dark"}
      contentContainerStyle={themed($screenContent)}
    >
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
        <Text style={themed($headerTitle)} text={translate("vocabulary:showroom.groupsTitle")} />
        <View style={themed($headerSpacer)}>
          <AppTutorialVideoButton
            screen="vocabulary_groups"
            placement="overview"
            variant="help"
            containerStyle={themed($iconButton)}
          />
        </View>
      </View>

      {flashMessage ? (
        <Text style={themed($flashMessage)} text={flashMessage} />
      ) : errorMessage && !showState ? (
        <Text style={themed($errorMessage)} text={errorMessage} />
      ) : null}

      {showState ? (
        <View style={themed($stateWrap)}>
          <Text style={themed($stateTitle)} text={errorMessage} />
          <Pressable
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel={
              requiresLogin
                ? translate("vocabulary:common.signIn")
                : translate("vocabulary:common.retry")
            }
            style={({ pressed }) => [themed($stateButton), pressed && themed($stateButtonPressed)]}
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
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themed([$listContent, $bottomInsets])}
          ListHeaderComponent={
            <View style={themed($contentWrap)}>
              <View
                style={[
                  themed($activePanel),
                  selectedGroupId && !selectedGroup && themed($activePanelEmpty),
                ]}
              >
                <Text
                  style={themed($activeLabel)}
                  text={translate("vocabulary:showroom.activeGroupTitle")}
                />
                <Text
                  style={[
                    themed($activeName),
                    selectedGroupId && !selectedGroup && themed($activeNameEmpty),
                  ]}
                  text={activeGroupName}
                  numberOfLines={2}
                />
              </View>

              <View style={themed($createRow)}>
                <TextField
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  placeholder={translate("vocabulary:showroom.groupNamePlaceholder")}
                  placeholderTextColor={showroomColors.textMuted}
                  autoCapitalize="sentences"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleCreateGroup}
                  allowFontScaling
                  maxFontSizeMultiplier={DEFAULT_MAX_FONT_SIZE_MULTIPLIER}
                  containerStyle={themed($groupNameInputContainer)}
                  inputWrapperStyle={themed($groupNameInputWrapper)}
                  style={themed($groupNameInput)}
                />
                <Pressable
                  onPress={handleCreateGroup}
                  disabled={isCreateDisabled}
                  accessibilityRole="button"
                  accessibilityLabel={translate("vocabulary:showroom.createGroupButton")}
                  style={({ pressed }) => [
                    themed($createButton),
                    isCreateDisabled && themed($buttonDisabled),
                    pressed && !isCreateDisabled && themed($createButtonPressed),
                  ]}
                >
                  <MaterialCommunityIcons name="plus" size={17} color="#FFFFFF" />
                  <Text
                    style={themed($createButtonText)}
                    text={translate("vocabulary:showroom.createGroupButton")}
                    numberOfLines={1}
                  />
                </Pressable>
              </View>

              <View style={themed($sectionHeader)}>
                <Text
                  style={themed($sectionTitle)}
                  text={translate("vocabulary:showroom.groupsListTitle")}
                />
                <Text
                  style={themed($sectionMeta)}
                  text={
                    isLoadingGroups
                      ? translate("vocabulary:showroom.groupsLoading")
                      : translate("vocabulary:showroom.groupsCount", { count: groups.length })
                  }
                />
              </View>

              <Pressable
                onPress={() => setSelectedGroupId(undefined)}
                accessibilityRole="radio"
                accessibilityState={{ selected: !selectedGroupId }}
                accessibilityLabel={translate("vocabulary:practiceHub.allWords")}
                style={({ pressed }) => [
                  themed($allWordsCard),
                  !selectedGroupId && themed($groupCardActive),
                  pressed && themed($groupCardPressed),
                ]}
              >
                <View style={themed($radioHitArea)}>
                  <View
                    style={[themed($radioOuter), !selectedGroupId && themed($radioOuterActive)]}
                  >
                    {!selectedGroupId ? <View style={themed($radioDot)} /> : null}
                  </View>
                </View>

                <View style={themed($groupCardBody)}>
                  <Text
                    style={[
                      themed($groupCardTitle),
                      !selectedGroupId && themed($groupCardTitleActive),
                    ]}
                    text={translate("vocabulary:practiceHub.allWords")}
                    numberOfLines={1}
                  />
                </View>
              </Pressable>
            </View>
          }
          ListEmptyComponent={
            <View style={themed($emptyCard)}>
              <Text
                style={themed($emptyTitle)}
                text={
                  isLoadingGroups
                    ? translate("vocabulary:showroom.groupsLoading")
                    : translate("vocabulary:showroom.groupsEmpty")
                }
              />
            </View>
          }
          renderItem={({ item }) => {
            const isActive = item.id === selectedGroupId

            return (
              <Pressable
                onPress={() =>
                  navigation.navigate("VocabularyGroupDetail", {
                    groupId: item.id,
                    groupName: item.name,
                    itemCount: item.itemCount,
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={item.name}
                style={({ pressed }) => [
                  themed($groupCard),
                  isActive && themed($groupCardActive),
                  pressed && themed($groupCardPressed),
                ]}
              >
                <Pressable
                  onPress={(event) => handleSelectGroup(item.id, event)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={item.name}
                  hitSlop={8}
                  style={themed($radioHitArea)}
                >
                  <View style={[themed($radioOuter), isActive && themed($radioOuterActive)]}>
                    {isActive ? <View style={themed($radioDot)} /> : null}
                  </View>
                </Pressable>

                <View style={themed($groupCardBody)}>
                  <Text
                    style={[themed($groupCardTitle), isActive && themed($groupCardTitleActive)]}
                    text={item.name}
                    numberOfLines={1}
                  />
                  <Text
                    style={[themed($groupCardMeta), isActive && themed($groupCardMetaActive)]}
                    text={translate("vocabulary:showroom.groupWordCount", {
                      count: item.itemCount,
                    })}
                  />
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={isActive ? showroomColors.accentText : showroomColors.textMuted}
                />
              </Pressable>
            )
          }}
        />
      )}
    </Screen>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.lg,
  paddingBottom: spacing.sm,
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
  flex: 1,
  marginHorizontal: 12,
  fontFamily: typography.primary.semiBold,
  fontSize: 21,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $headerSpacer: ThemedStyle<ViewStyle> = () => ({
  width: 40,
})

const $flashMessage: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  paddingHorizontal: spacing.xl,
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $errorMessage: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  paddingHorizontal: spacing.xl,
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.error,
})

const $contentWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.xs,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xxl,
})

const $activePanel: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.accent,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : colors.palette.primary100,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
})

const $activePanelEmpty: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $activeLabel: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $activeName: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.semiBold,
  fontSize: 22,
  lineHeight: 28,
  color: colors.vocabularyShowroom.textStrong,
})

const $activeNameEmpty: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
})

const $createRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginTop: spacing.md,
})

const $groupNameInputContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $groupNameInputWrapper: ThemedStyle<ViewStyle> = ({ colors }) => ({
  minHeight: 44,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  alignItems: "center",
})

const $groupNameInput: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  flex: 1,
  minHeight: 44,
  marginHorizontal: 0,
  marginVertical: 0,
  paddingHorizontal: spacing.md,
  fontFamily: typography.primary.normal,
  fontSize: 15,
  color: colors.vocabularyShowroom.textStrong,
})

const $createButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 44,
  borderRadius: 12,
  backgroundColor: colors.vocabularyShowroom.accent,
  paddingHorizontal: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
})

const $createButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $createButtonText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: "#FFFFFF",
})

const $buttonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.5,
})

const $sectionHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: spacing.lg,
  marginBottom: spacing.sm,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: colors.vocabularyShowroom.textStrong,
})

const $sectionMeta: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $groupCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginHorizontal: spacing.xl,
  marginBottom: spacing.sm,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  minHeight: 70,
  flexDirection: "row",
  alignItems: "center",
})

const $allWordsCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.sm,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  minHeight: 70,
  flexDirection: "row",
  alignItems: "center",
})

const $groupCardActive: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  borderColor: colors.vocabularyShowroom.accent,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : colors.palette.primary100,
})

const $groupCardPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $radioHitArea: ThemedStyle<ViewStyle> = () => ({
  height: 44,
  width: 44,
  alignItems: "flex-start",
  justifyContent: "center",
})

const $radioOuter: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 22,
  width: 22,
  borderRadius: 11,
  borderWidth: 2,
  borderColor: colors.vocabularyShowroom.textMuted,
  alignItems: "center",
  justifyContent: "center",
})

const $radioOuterActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.accent,
})

const $radioDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 10,
  width: 10,
  borderRadius: 5,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $groupCardBody: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
})

const $groupCardTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 17,
  color: colors.vocabularyShowroom.textStrong,
})

const $groupCardTitleActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
})

const $groupCardMeta: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $groupCardMetaActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
})

const $emptyCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginHorizontal: spacing.xl,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  padding: spacing.lg,
})

const $emptyTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $stateWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.xl,
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
