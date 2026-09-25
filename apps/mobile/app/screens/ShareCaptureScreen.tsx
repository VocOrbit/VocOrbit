import { FC, useEffect, useState } from "react"
import {
  ActivityIndicator,
  AppState,
  Image,
  ImageStyle,
  Platform,
  Pressable,
  ScrollView,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { wordInsightApi } from "@/services/api/wordInsightApi"
import {
  buildShareContextSnippet,
  extractShareWords,
  isAndroidOverlayPermissionGranted,
  normalizeShareSelection,
  openAndroidOverlaySettings,
  tokenizeShareText,
} from "@/services/share/shareIntent"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

const closeIcon = require("../../assets/icons/x.png")
const appIcon = require("../../assets/images/app-icon-all.png")

const BASIC_CREDITS_REQUIRED_BODY =
  "You are out of basic credits. Open Billing & credits in VocOrbit to continue."

type ShareInsightViewData = {
  word: string
  partOfSpeech?: string
  sourceLang?: string
  targetLang?: string
  meaning: string
  definitionL2?: string
  translationL1?: string
  whyThisSense?: string
}

function readNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function parseInsightResult(value: unknown): ShareInsightViewData | undefined {
  if (!value || typeof value !== "object") return undefined

  const insight = value as Record<string, unknown>
  const word = readNonEmptyString(insight.word)
  const meaning =
    readNonEmptyString(insight.translationL1) ??
    readNonEmptyString(insight.definitionL2) ??
    readNonEmptyString(insight.meaning)

  if (!word || !meaning) return undefined

  return {
    word,
    meaning,
    partOfSpeech: readNonEmptyString(insight.partOfSpeech),
    sourceLang: readNonEmptyString(insight.sourceLang),
    targetLang: readNonEmptyString(insight.targetLang),
    definitionL2: readNonEmptyString(insight.definitionL2),
    translationL1: readNonEmptyString(insight.translationL1),
    whyThisSense:
      readNonEmptyString(insight.whyThisSense) ??
      readNonEmptyString(insight.shortExplanation),
  }
}

function resolveProblemMessage(problem: GeneralApiProblem): {
  title: string
  body: string
  allowOpenIap: boolean
} {
  switch (problem.kind) {
    case "unauthorized":
      return {
        title: "Sign in required",
        body: "Your session is not ready for share lookup. Open VocOrbit, sign in again, then retry.",
        allowOpenIap: false,
      }
    case "forbidden":
      return {
        title: "Basic credits required",
        body: BASIC_CREDITS_REQUIRED_BODY,
        allowOpenIap: true,
      }
    case "timeout":
      return {
        title: "Request timed out",
        body: "The lookup took too long. Try again with the same sentence.",
        allowOpenIap: false,
      }
    case "cannot-connect":
      return {
        title: "Connection problem",
        body: "VocOrbit could not reach the server. Check your connection and retry.",
        allowOpenIap: false,
      }
    case "server":
    case "rejected":
    case "not-found":
      return {
        title: "Lookup failed",
        body: problem.message || "VocOrbit could not finish this insight request.",
        allowOpenIap: false,
      }
    default:
      return {
        title: "Lookup failed",
        body: "VocOrbit could not finish this insight request.",
        allowOpenIap: false,
      }
  }
}

export const ShareCaptureScreen: FC<AppStackScreenProps<"ShareCapture">> = function ShareCaptureScreen({
  navigation,
  route,
}) {
  const { themed, theme } = useAppTheme()
  const { colors } = theme

  const payload = route.params.payload
  const wordOptions = extractShareWords(payload.text)
  const textSegments = tokenizeShareText(payload.text)
  const initialSelectedWord =
    payload.selectedWord ?? (wordOptions.length === 1 ? wordOptions[0]?.normalized ?? "" : "")

  const [selectedWord, setSelectedWord] = useState(initialSelectedWord)
  const [isLoading, setIsLoading] = useState(false)
  const [errorTitle, setErrorTitle] = useState<string | undefined>()
  const [errorBody, setErrorBody] = useState<string | undefined>()
  const [allowOpenIap, setAllowOpenIap] = useState(false)
  const [insight, setInsight] = useState<ShareInsightViewData | undefined>()
  const [hasOverlayPermission, setHasOverlayPermission] = useState(
    Platform.OS !== "android" || payload.needsOverlayPermission !== true,
  )

  useEffect(() => {
    setSelectedWord(initialSelectedWord)
    setIsLoading(false)
    setInsight(undefined)
    setErrorTitle(undefined)
    setErrorBody(undefined)
    setAllowOpenIap(false)
  }, [initialSelectedWord, payload.receivedAt])

  useEffect(() => {
    setInsight(undefined)
    setErrorTitle(undefined)
    setErrorBody(undefined)
    setAllowOpenIap(false)
  }, [selectedWord])

  useEffect(() => {
    if (Platform.OS !== "android") return

    let isMounted = true
    let previousAppState = AppState.currentState

    const syncOverlayPermission = async () => {
      const granted = await isAndroidOverlayPermissionGranted()
      if (isMounted) {
        setHasOverlayPermission(granted)
      }
    }

    void syncOverlayPermission()

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const becameActive = previousAppState !== "active" && nextAppState === "active"
      previousAppState = nextAppState

      if (becameActive) {
        void syncOverlayPermission()
      }
    })

    return () => {
      isMounted = false
      subscription.remove()
    }
  }, [payload.receivedAt])

  const canRunInsight = selectedWord.length > 0 && !isLoading
  const shouldShowOverlayButton = Platform.OS === "android" && !hasOverlayPermission

  async function handleRunInsight() {
    const normalizedSelectedWord = normalizeShareSelection(selectedWord)
    if (!normalizedSelectedWord || isLoading) return

    setIsLoading(true)
    setInsight(undefined)
    setErrorTitle(undefined)
    setErrorBody(undefined)
    setAllowOpenIap(false)

    try {
      const response = await wordInsightApi.runExplainAndWait({
        mode: "basic",
        sentence: buildShareContextSnippet(payload.text, normalizedSelectedWord),
        selectedWord: normalizedSelectedWord,
      })

      if (response.kind !== "ok") {
        const error = resolveProblemMessage(response)
        setErrorTitle(error.title)
        setErrorBody(error.body)
        setAllowOpenIap(error.allowOpenIap)
        return
      }

      if (response.data.status !== "completed") {
        const isCreditError = response.data.errorCode?.toLowerCase().includes("credit") ?? false
        setErrorTitle(isCreditError ? "Basic credits required" : "Lookup failed")
        setErrorBody(
          isCreditError
            ? BASIC_CREDITS_REQUIRED_BODY
            : response.data.errorMessage || "VocOrbit could not finish this insight request.",
        )
        setAllowOpenIap(isCreditError)
        return
      }

      const parsedInsight = parseInsightResult(response.data.result?.insight)
      if (!parsedInsight) {
        setErrorTitle("Invalid response")
        setErrorBody("VocOrbit received an unexpected insight payload.")
        return
      }

      setInsight(parsedInsight)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleOpenOverlaySettings() {
    await openAndroidOverlaySettings()
  }

  function handleClose() {
    if (navigation.canGoBack()) {
      navigation.goBack()
      return
    }
    navigation.navigate("VocabularyShowroomScreen")
  }

  return (
    <Screen
      preset="scroll"
      backgroundColor={colors.vocabularyShowroom.background}
      contentContainerStyle={themed($screenContent)}
      safeAreaEdges={["top", "bottom"]}
    >
      <View style={themed($canvas)}>
        <View pointerEvents="none" style={themed($backgroundLayer)}>
          <View style={themed($blobPrimary)} />
          <View style={themed($blobSecondary)} />
          <View style={themed($blobTertiary)} />
        </View>

        <View style={themed($topCard)}>
          <View style={themed($headerRow)}>
            <View style={themed($brandRow)}>
              <Image source={appIcon} resizeMode="cover" style={themed($brandIcon)} />
              <Text text="VocOrbit" size="lg" weight="bold" />
            </View>

            <View style={themed($headerActions)}>
              <AppTutorialVideoButton
                screen="share_capture"
                placement="overview"
                variant="help"
                containerStyle={themed($headerHelpButton)}
              />
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [themed($closeButton), pressed && themed($closeButtonPressed)]}
              >
                <Image source={closeIcon} resizeMode="contain" style={themed($closeIcon)} />
                <Text text="Close" size="xs" weight="medium" style={themed($closeButtonText)} />
              </Pressable>
            </View>
          </View>
        </View>

        <AppTutorialVideoButton
          screen="share_capture"
          placement="overview"
          variant="banner"
          hideAfterSeen
          containerStyle={{ marginBottom: theme.spacing.md }}
        />

        <View style={themed($card)}>
          <Text text="Tap a word" size="sm" weight="bold" />
          <View style={themed($pickerMetaRow)}>
            <View style={themed($tapBadge)}>
              <Icon icon="view" size={14} color={colors.palette.primary600} />
              <Text text="Tap words" size="xxs" weight="bold" style={themed($tapBadgeText)} />
            </View>

            {selectedWord ? (
              <Text
                text={`Selected word: ${selectedWord}`}
                size="sm"
                weight="bold"
                style={themed($selectionValue)}
              />
            ) : null}
          </View>

          <View style={[themed($pickerBox), selectedWord ? themed($pickerBoxSelected) : undefined]}>
            <ScrollView nestedScrollEnabled style={themed($pickerScroll)} showsVerticalScrollIndicator={false}>
              <Text size="sm" style={themed($pickerText)}>
                {textSegments.map((segment) => {
                  if (!segment.normalizedWord) {
                    return <Text key={segment.key}>{segment.text}</Text>
                  }

                  const isSelected = segment.normalizedWord === selectedWord
                  return (
                    <Text
                      key={segment.key}
                      suppressHighlighting
                      onPress={() => setSelectedWord(segment.normalizedWord ?? "")}
                      weight={isSelected ? "bold" : "normal"}
                      style={[themed($pickerWord), isSelected && themed($pickerWordSelected)]}
                    >
                      {segment.text}
                    </Text>
                  )
                })}
              </Text>
            </ScrollView>
          </View>

          <Button
            text={isLoading ? "Getting basic meaning..." : "Get basic meaning"}
            preset="default"
            disabled={!canRunInsight}
            onPress={() => void handleRunInsight()}
            style={themed($primaryButton)}
            disabledStyle={themed($primaryButtonDisabled)}
            textStyle={themed($primaryButtonText)}
            disabledTextStyle={themed($primaryButtonTextDisabled)}
          />

          {shouldShowOverlayButton ? (
            <View style={themed($overlayButtonWrap)}>
              <Button
                text="Open overlay settings"
                onPress={() => void handleOpenOverlaySettings()}
                style={themed($secondaryButton)}
                textStyle={themed($secondaryButtonText)}
              />
            </View>
          ) : null}
        </View>

        {isLoading ? (
          <View style={themed($card)}>
            <View style={themed($loadingRow)}>
              <ActivityIndicator color={colors.tint} />
              <View style={themed($loadingTextWrap)}>
                <Text text="Running basic insight" size="sm" weight="bold" />
                <Text
                  text="VocOrbit is matching the selected word against this exact sentence."
                  size="xs"
                  style={themed($cardBody)}
                />
              </View>
            </View>
          </View>
        ) : null}

        {errorTitle && errorBody ? (
          <View style={themed($errorCard)}>
            <Text text={errorTitle} size="sm" weight="bold" style={themed($errorTitle)} />
            <Text text={errorBody} size="xs" style={themed($errorBody)} />

            {allowOpenIap ? (
              <Button
                text="Open Billing & credits"
                onPress={() => navigation.navigate("ProfileIap")}
                style={themed($secondaryButton)}
                textStyle={themed($secondaryButtonText)}
              />
            ) : (
              <Button
                text="Retry"
                onPress={() => void handleRunInsight()}
                disabled={!canRunInsight}
                style={themed($secondaryButton)}
                textStyle={themed($secondaryButtonText)}
              />
            )}
          </View>
        ) : null}

        {insight ? (
          <View style={themed($resultCard)}>
            <Text text="Basic meaning" size="sm" weight="bold" />
            <Text text={insight.word.toUpperCase()} size="xl" weight="bold" />

            <View style={themed($resultMeaningBox)}>
              <Text text={insight.translationL1 || insight.meaning} size="md" weight="bold" />
              {insight.partOfSpeech ? (
                <Text text={insight.partOfSpeech} size="xxs" weight="bold" style={themed($resultMeta)} />
              ) : null}
            </View>

            {insight.definitionL2 ? (
              <View style={themed($resultSection)}>
                <Text text="Context meaning" size="xxs" weight="bold" style={themed($resultSectionLabel)} />
                <Text text={insight.definitionL2} size="sm" style={themed($resultSectionBody)} />
              </View>
            ) : null}

            {insight.whyThisSense ? (
              <View style={themed($resultSection)}>
                <Text text="Why this meaning" size="xxs" weight="bold" style={themed($resultSectionLabel)} />
                <Text text={insight.whyThisSense} size="sm" style={themed($resultSectionBody)} />
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Screen>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xxl,
})

const $canvas: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
})

const $backgroundLayer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
})

const $blobPrimary: ThemedStyle<ViewStyle> = ({ isDark }) => ({
  position: "absolute",
  top: -100,
  right: -90,
  width: 260,
  height: 260,
  borderRadius: 130,
  backgroundColor: isDark ? "rgba(168, 197, 171, 0.14)" : "rgba(144, 176, 149, 0.2)",
})

const $blobSecondary: ThemedStyle<ViewStyle> = ({ isDark }) => ({
  position: "absolute",
  top: 240,
  left: -120,
  width: 280,
  height: 280,
  borderRadius: 140,
  backgroundColor: isDark ? "rgba(126, 159, 166, 0.12)" : "rgba(158, 181, 187, 0.18)",
})

const $blobTertiary: ThemedStyle<ViewStyle> = ({ isDark }) => ({
  position: "absolute",
  bottom: -160,
  right: -120,
  width: 300,
  height: 300,
  borderRadius: 150,
  backgroundColor: isDark ? "rgba(217, 214, 184, 0.08)" : "rgba(217, 214, 184, 0.18)",
})

const $topCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 28,
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
})

const $headerRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $brandRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $brandIcon: ThemedStyle<ImageStyle> = () => ({
  width: 30,
  height: 30,
  borderRadius: 8,
})

const $headerActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $headerHelpButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.neutral200,
  borderColor: colors.palette.neutral300,
})

const $closeButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 40,
  paddingHorizontal: spacing.sm,
  borderRadius: 999,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  flexDirection: "row",
  gap: spacing.xs,
})

const $closeButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
})

const $closeIcon: ThemedStyle<ImageStyle> = ({ colors }) => ({
  width: 14,
  height: 14,
  tintColor: colors.text,
})

const $closeButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 24,
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  gap: spacing.sm,
})

const $cardBody: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $selectionValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
})

const $pickerMetaRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.sm,
  flexWrap: "wrap",
})

const $tapBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 999,
  backgroundColor: colors.palette.primary100,
})

const $tapBadgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
  letterSpacing: 0.2,
})

const $pickerBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.md,
  borderRadius: 18,
  backgroundColor: colors.palette.neutral200,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
})

const $pickerBoxSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.palette.primary400,
  borderWidth: 2,
})

const $pickerScroll: ThemedStyle<ViewStyle> = () => ({
  maxHeight: 210,
  minHeight: 138,
})

const $pickerText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  lineHeight: 24,
})

const $pickerWord: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  textDecorationLine: "underline",
  textDecorationColor: colors.palette.primary400,
})

const $pickerWordSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
  backgroundColor: colors.palette.primary100,
})

const $primaryButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
  backgroundColor: "#42624B",
  borderWidth: 0,
  borderRadius: 18,
})

const $primaryButtonDisabled: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
})

const $primaryButtonText: ThemedStyle<TextStyle> = () => ({
  color: "#FFFFFF",
})

const $primaryButtonTextDisabled: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral500,
})

const $overlayButtonWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $secondaryButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
})

const $secondaryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $loadingRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $loadingTextWrap: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $errorCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.errorBackground,
  borderRadius: 24,
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderWidth: 1,
  borderColor: colors.error,
  gap: spacing.sm,
})

const $errorTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
})

const $errorBody: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $resultCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 24,
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderWidth: 1,
  borderColor: colors.palette.primary300,
  gap: spacing.sm,
})

const $resultMeaningBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.md,
  borderRadius: 18,
  backgroundColor: colors.palette.primary100,
  gap: spacing.xxs,
})

const $resultMeta: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
  letterSpacing: 0.4,
})

const $resultSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xxs,
})

const $resultSectionLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral700,
  letterSpacing: 0.5,
})

const $resultSectionBody: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})
