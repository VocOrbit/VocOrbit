import { FC, memo, useCallback, useEffect, useMemo, useState } from "react"
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import type { ListRenderItem } from "react-native"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import {
  resolveLanguageLabel,
  resolveLanguageOption,
  supportedLanguageOptions,
  useLanguagePreferences,
} from "@/context/LanguagePreferencesContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { loadString, storageKeys } from "@/utils/storage"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

type LanguagePreferencesScreenProps = AppStackScreenProps<"LanguagePreferences">
type LanguagePickerKey = "l1" | "l2"
type LanguageOptionItem = (typeof supportedLanguageOptions)[number]

const DEFAULT_L1 = "en-gb"
const DEFAULT_L2 = "es"

function buildOptionDescription(code: string): string {
  const option = resolveLanguageOption(code)
  if (!option) return code.toUpperCase()

  if (option.nativeName.toLowerCase() === option.language.toLowerCase()) {
    return `${option.flag} ${option.language}`
  }

  return `${option.flag} ${option.language} (${option.nativeName})`
}

function normalizeSelectableCode(code: string, fallbackCode: string): string {
  const resolved = resolveLanguageOption(code)?.code
  if (resolved) return resolved
  const fallback = resolveLanguageOption(fallbackCode)?.code
  return fallback ?? fallbackCode
}

type LanguagePickerItemProps = {
  item: LanguageOptionItem
  isSelected: boolean
  onSelect: (code: string) => void
}

const LanguagePickerItem = memo<LanguagePickerItemProps>(
  ({ item, isSelected, onSelect }) => {
    const { themed, theme } = useAppTheme()
    const showroomColors = theme.colors.vocabularyShowroom
    const subtitle =
      item.nativeName.toLowerCase() === item.language.toLowerCase()
        ? item.code.toUpperCase()
        : item.nativeName

    const handlePress = useCallback(() => {
      onSelect(item.code)
    }, [item.code, onSelect])

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={translate("languagePreferences:accessibility.selectLanguageItem", {
          language: item.language,
          country: item.country,
        })}
        onPress={handlePress}
        style={({ pressed }) => [
          themed($pickerListItem),
          isSelected && themed($pickerListItemSelected),
          pressed && themed($pickerListItemPressed),
        ]}
      >
        <View style={themed($pickerListItemLeft)}>
          <Text style={themed($pickerListFlag)} text={item.flag} />
          <View style={themed($pickerListTextWrap)}>
            <Text style={themed($pickerListTitle)} text={item.language} />
            <Text style={themed($pickerListSubtitle)} text={subtitle} />
          </View>
        </View>

        {isSelected ? <Icon icon="check" size={16} color={showroomColors.textStrong} /> : null}
      </Pressable>
    )
  },
  (prevProps, nextProps) =>
    prevProps.item.code === nextProps.item.code &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.onSelect === nextProps.onSelect,
)

export const LanguagePreferencesScreen: FC<LanguagePreferencesScreenProps> = ({
  navigation,
  route,
}) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])

  const { preferences, isLoading, savePreferences } = useLanguagePreferences()
  const isOnboarding = route.params.source === "onboarding"

  const [l1Language, setL1Language] = useState(DEFAULT_L1)
  const [l2Language, setL2Language] = useState(DEFAULT_L2)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activePicker, setActivePicker] = useState<LanguagePickerKey | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!preferences) return
    const nextL1 = normalizeSelectableCode(preferences.l1Language || DEFAULT_L1, DEFAULT_L1)
    const nextL2 = normalizeSelectableCode(preferences.l2Language || DEFAULT_L2, DEFAULT_L2)
    setL1Language(nextL1)
    setL2Language(nextL2)
  }, [preferences])

  const l1Summary = useMemo(() => buildOptionDescription(l1Language), [l1Language])
  const l2Summary = useMemo(() => buildOptionDescription(l2Language), [l2Language])

  const selectedSummary = useMemo(() => `${resolveLanguageLabel(l1Language)} • ${resolveLanguageLabel(l2Language)}`, [l1Language, l2Language])

  const closePicker = useCallback(() => {
    setActivePicker(null)
    setSearchQuery("")
  }, [])

  const openPicker = useCallback((key: LanguagePickerKey) => {
    setActivePicker(key)
    setSearchQuery("")
  }, [])

  const filteredLanguageOptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    if (!normalizedQuery) return supportedLanguageOptions

    return supportedLanguageOptions.filter((option) => {
      return (
        option.language.toLowerCase().includes(normalizedQuery) ||
        option.nativeName.toLowerCase().includes(normalizedQuery) ||
        option.country.toLowerCase().includes(normalizedQuery) ||
        option.code.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [searchQuery])

  const pickerSelectedCode = activePicker === "l1" ? l1Language : l2Language

  const handleSelectLanguage = useCallback(
    (code: string) => {
      if (activePicker === "l1") {
        setL1Language(code)
      } else if (activePicker === "l2") {
        setL2Language(code)
      }
      closePicker()
    },
    [activePicker, closePicker],
  )

  const renderLanguageItem = useCallback<ListRenderItem<LanguageOptionItem>>(
    ({ item }) => (
      <LanguagePickerItem
        item={item}
        isSelected={item.code === pickerSelectedCode}
        onSelect={handleSelectLanguage}
      />
    ),
    [handleSelectLanguage, pickerSelectedCode],
  )

  const onSave = useCallback(async () => {
    setErrorMessage(undefined)
    setIsSubmitting(true)

    const result = await savePreferences({ l1Language, l2Language })

    setIsSubmitting(false)
    if (!result.ok) {
      setErrorMessage(result.errorMessage ?? translate("languagePreferences:errors.saveFailed"))
      return
    }

    if (isOnboarding) {
      const hasSeenWelcome = loadString(storageKeys.hasSeenWelcome) === "true"
      navigation.reset({
        index: 0,
        routes: [{ name: hasSeenWelcome ? "VocabularyShowroomScreen" : "Welcome" }],
      })
      return
    }

    navigation.goBack()
  }, [isOnboarding, l1Language, l2Language, navigation, savePreferences])

  const isBusy = isLoading || isSubmitting

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
          {isOnboarding ? (
            <View style={themed($headerSpacer)} />
          ) : (
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel={translate("languagePreferences:accessibility.goBack")}
              style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
              hitSlop={6}
            >
              <Icon icon="back" size={16} color={showroomColors.textStrong} />
            </Pressable>
          )}
          <Text
            style={themed($headerTitle)}
            text={
              isOnboarding
                ? translate("languagePreferences:titleOnboarding")
                : translate("languagePreferences:titleSettings")
            }
          />
          <View style={themed($headerSpacer)} />
        </View>

        <Text
          style={themed($headerSubtitle)}
          text={
            isOnboarding
              ? translate("languagePreferences:subtitleOnboarding")
              : translate("languagePreferences:subtitleSettings")
          }
        />

        <View style={themed($summaryCard)}>
          <Text style={themed($summaryLabel)} text={translate("languagePreferences:currentPair")} />
          <Text style={themed($summaryValue)} text={selectedSummary} />
          <Text
            style={themed($summaryHint)}
            text={translate("languagePreferences:availableOptionsCount", {
              count: supportedLanguageOptions.length,
            })}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themed($scrollContent)}
          style={themed($scroll)}
        >
          <View style={themed($sectionCard)}>
            <Text style={themed($sectionTitle)} text={translate("languagePreferences:nativeLanguageTitle")} />
            <Text style={themed($sectionBody)} text={translate("languagePreferences:nativeLanguageBody")} />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={translate("languagePreferences:accessibility.selectNativeLanguage")}
              onPress={() => openPicker("l1")}
              style={({ pressed }) => [themed($selectTrigger), pressed && themed($selectTriggerPressed)]}
            >
              <View style={themed($selectTriggerContent)}>
                <Text style={themed($selectLabel)} text={translate("languagePreferences:selectedLabel")} />
                <Text style={themed($selectValue)} text={l1Summary} />
              </View>
              <Icon icon="caretRight" size={16} color={showroomColors.textMuted} />
            </Pressable>
          </View>

          <View style={themed($sectionCard)}>
            <Text style={themed($sectionTitle)} text={translate("languagePreferences:learningLanguageTitle")} />
            <Text style={themed($sectionBody)} text={translate("languagePreferences:learningLanguageBody")} />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={translate("languagePreferences:accessibility.selectLearningLanguage")}
              onPress={() => openPicker("l2")}
              style={({ pressed }) => [themed($selectTrigger), pressed && themed($selectTriggerPressed)]}
            >
              <View style={themed($selectTriggerContent)}>
                <Text style={themed($selectLabel)} text={translate("languagePreferences:selectedLabel")} />
                <Text style={themed($selectValue)} text={l2Summary} />
              </View>
              <Icon icon="caretRight" size={16} color={showroomColors.textMuted} />
            </Pressable>
          </View>
        </ScrollView>

        <View style={themed([$footerWrap, $bottomInsets])}>
          {errorMessage ? <Text style={themed($errorText)} text={errorMessage} /> : null}
          <Pressable
            onPress={() => {
              void onSave()
            }}
            accessibilityRole="button"
            accessibilityLabel={
              isOnboarding
                ? translate("languagePreferences:accessibility.continueWithSelectedLanguages")
                : translate("languagePreferences:accessibility.saveLanguages")
            }
            disabled={isBusy}
            style={({ pressed }) => [
              themed($saveButton),
              isBusy && themed($saveButtonDisabled),
              pressed && !isBusy && themed($saveButtonPressed),
            ]}
          >
            <Text
              style={themed($saveButtonText)}
              text={
                isBusy
                  ? translate("languagePreferences:saving")
                  : isOnboarding
                    ? translate("languagePreferences:continue")
                    : translate("languagePreferences:save")
              }
            />
          </Pressable>
        </View>
      </View>

      <Modal
        visible={activePicker !== null}
        transparent
        animationType="slide"
        onRequestClose={closePicker}
      >
        <KeyboardAvoidingView
          behavior="height"
          keyboardVerticalOffset={0}
          style={themed($pickerOverlay)}
        >
          <Pressable
            style={themed($pickerScrim)}
            onPress={closePicker}
            accessibilityRole="button"
            accessibilityLabel={translate("languagePreferences:accessibility.closeLanguagePicker")}
          />

          <View style={themed($pickerSheet)}>
            <View style={themed($pickerHeader)}>
              <Text
                style={themed($pickerTitle)}
                text={
                  activePicker === "l1"
                    ? translate("languagePreferences:pickerTitleL1")
                    : translate("languagePreferences:pickerTitleL2")
                }
              />
              <Pressable
                onPress={closePicker}
                accessibilityRole="button"
                accessibilityLabel={translate("languagePreferences:accessibility.closePicker")}
                style={({ pressed }) => [themed($pickerCloseButton), pressed && themed($pickerCloseButtonPressed)]}
              >
                <Icon icon="x" size={14} color={showroomColors.textStrong} />
              </Pressable>
            </View>

            <View style={themed($searchWrap)}>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={translate("languagePreferences:searchPlaceholder")}
                placeholderTextColor={showroomColors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                style={themed($searchInput)}
              />
            </View>

            {filteredLanguageOptions.length === 0 ? (
              <View style={themed($emptyWrap)}>
                <Text style={themed($emptyText)} text={translate("languagePreferences:noResults")} />
              </View>
            ) : (
              <FlatList
                data={filteredLanguageOptions}
                keyExtractor={(item) => item.code}
                style={themed($pickerList)}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={themed($pickerListContent)}
                renderItem={renderLanguageItem}
                extraData={pickerSelectedCode}
                removeClippedSubviews
                initialNumToRender={14}
                maxToRenderPerBatch={14}
                updateCellsBatchingPeriod={40}
                windowSize={9}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

const $headerSubtitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.md,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 21,
  color: colors.vocabularyShowroom.textMuted,
})

const $summaryCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  borderRadius: 18,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $summaryLabel: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  color: colors.vocabularyShowroom.textMuted,
})

const $summaryValue: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  color: colors.vocabularyShowroom.textStrong,
})

const $summaryHint: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $scroll: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.md,
  gap: spacing.md,
})

const $sectionCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 18,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  color: colors.vocabularyShowroom.textStrong,
})

const $sectionBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  marginBottom: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 19,
  color: colors.vocabularyShowroom.textMuted,
})

const $selectTrigger: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 66,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $selectTriggerPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $selectTriggerContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $selectLabel: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.7,
  color: colors.vocabularyShowroom.textMuted,
})

const $selectValue: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.medium,
  fontSize: 14,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textStrong,
})

const $footerWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.md,
  paddingTop: spacing.sm,
  marginTop: spacing.sm,
})

const $errorText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginBottom: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.error,
})

const $saveButton: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  minHeight: 56,
  borderRadius: 28,
  paddingHorizontal: spacing.xl,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceSoft : colors.vocabularyShowroom.accent,
  borderWidth: isDark ? 1 : 0,
  borderColor: isDark ? colors.vocabularyShowroom.ctaOutline : colors.transparent,
})

const $saveButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.72,
})

const $saveButtonPressed: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  opacity: 0.86,
  backgroundColor: isDark
    ? colors.vocabularyShowroom.surfaceStrong
    : colors.vocabularyShowroom.accentPressed,
  borderColor: isDark ? colors.vocabularyShowroom.ctaOutlinePressed : colors.transparent,
})

const $saveButtonText: ThemedStyle<TextStyle> = ({ typography, colors, isDark }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: isDark ? colors.vocabularyShowroom.ctaOutline : "#FFFFFF",
})

const $pickerOverlay: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "flex-end",
})

const $pickerScrim: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: "rgba(0, 0, 0, 0.42)",
})

const $pickerSheet: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: "82%",
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  backgroundColor: colors.vocabularyShowroom.background,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  paddingTop: spacing.md,
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.md,
})

const $pickerHeader: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $pickerTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  color: colors.vocabularyShowroom.textStrong,
})

const $pickerCloseButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 32,
  width: 32,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $pickerCloseButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $searchWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $searchInput: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  minHeight: 44,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  color: colors.vocabularyShowroom.textStrong,
  fontFamily: typography.primary.normal,
  fontSize: 14,
})

const $pickerList: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $pickerListContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.sm,
  paddingBottom: spacing.lg,
  gap: spacing.xs,
})

const $pickerListItem: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 64,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $pickerListItemSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.vocabularyShowroom.accent,
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $pickerListItemPressed: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.86,
})

const $pickerListItemLeft: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  flex: 1,
})

const $pickerListFlag: ThemedStyle<TextStyle> = () => ({
  fontSize: 20,
})

const $pickerListTextWrap: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $pickerListTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $pickerListSubtitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxxs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $emptyWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
})

const $emptyText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})
