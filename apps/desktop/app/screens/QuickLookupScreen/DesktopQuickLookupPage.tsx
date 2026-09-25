import { FC, useCallback, useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAuth } from "@/context/AuthContext"
import { useLanguagePreferences } from "@/context/LanguagePreferencesContext"
import { translate } from "@/i18n/translate"
import { wordInsightApi } from "@/services/api/wordInsightApi"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import {
  closeQuickLookupWindow,
  focusMainVocOrbit,
  getQuickLookupInitialText,
  invokeDesktopCommand,
  isDesktopShellRuntime,
} from "@/services/desktop/desktopQuickLookupBridge"
import {
  buildShareContextSnippet,
  extractShareWords,
  normalizeShareSelection,
  tokenizeShareText,
} from "@/services/share/shareIntent"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type QuickLookupInsight = {
  word: string
  meaning: string
  definitionL2?: string
  translationL1?: string
  partOfSpeech?: string
}

function readNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function parseInsight(value: unknown): QuickLookupInsight | undefined {
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
    definitionL2: readNonEmptyString(insight.definitionL2),
    translationL1: readNonEmptyString(insight.translationL1),
    partOfSpeech: readNonEmptyString(insight.partOfSpeech),
  }
}

function resolveProblemMessage(problem: GeneralApiProblem): {
  title: string
  body: string
} {
  const problemMessage = "message" in problem ? problem.message : undefined

  switch (problem.kind) {
    case "unauthorized":
      return {
        title: translate("vocabulary:quickLookup.errors.signInRequiredTitle"),
        body: translate("vocabulary:quickLookup.errors.signInRequiredBody"),
      }
    case "forbidden":
      return {
        title: translate("vocabulary:quickLookup.errors.creditsRequiredTitle"),
        body:
          problem.message || translate("vocabulary:quickLookup.errors.creditsRequiredBody"),
      }
    case "timeout":
      return {
        title: translate("vocabulary:quickLookup.errors.timeoutTitle"),
        body: translate("vocabulary:quickLookup.errors.timeoutBody"),
      }
    case "cannot-connect":
      return {
        title: translate("vocabulary:quickLookup.errors.connectionTitle"),
        body: translate("vocabulary:quickLookup.errors.connectionBody"),
      }
    default:
      return {
        title: translate("vocabulary:quickLookup.errors.lookupFailedTitle"),
        body: problemMessage || translate("vocabulary:quickLookup.errors.lookupFailedBody"),
      }
  }
}

async function readClipboardText(): Promise<string | undefined> {
  const fromDesktop = await invokeDesktopCommand<string>("read_clipboard_text")
  if (typeof fromDesktop === "string") {
    const normalized = fromDesktop.replace(/\s+/g, " ").trim()
    if (normalized.length > 0) return normalized
  }

  if (typeof navigator === "undefined" || !navigator.clipboard?.readText) {
    return undefined
  }

  try {
    const value = await navigator.clipboard.readText()
    const normalized = value.replace(/\s+/g, " ").trim()
    return normalized.length > 0 ? normalized : undefined
  } catch {
    return undefined
  }
}

const QUICK_LOOKUP_SHORTCUT_LABEL = "Cmd/Ctrl + Shift + L"

export const DesktopQuickLookupPage: FC = () => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { isAuthenticated, isSessionResolved } = useAuth()
  const { preferences } = useLanguagePreferences()

  const [contextText, setContextText] = useState(getQuickLookupInitialText())
  const [selectedWord, setSelectedWord] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isReadingClipboard, setIsReadingClipboard] = useState(false)
  const [errorTitle, setErrorTitle] = useState<string | undefined>()
  const [errorBody, setErrorBody] = useState<string | undefined>()
  const [insight, setInsight] = useState<QuickLookupInsight | undefined>()

  const wordOptions = useMemo(() => extractShareWords(contextText, 48), [contextText])
  const textSegments = useMemo(() => tokenizeShareText(contextText), [contextText])
  const normalizedSelectedWord = normalizeShareSelection(selectedWord)
  const isSelectedWordInContext =
    normalizedSelectedWord.length > 0 &&
    wordOptions.some((word) => word.normalized === normalizedSelectedWord)
  const canAnalyze =
    isAuthenticated && !isLoading && contextText.trim().length > 0 && isSelectedWordInContext

  useEffect(() => {
    if (!normalizedSelectedWord && wordOptions.length === 1) {
      setSelectedWord(wordOptions[0]?.normalized ?? "")
      return
    }

    if (normalizedSelectedWord && !isSelectedWordInContext) {
      setSelectedWord(wordOptions.length === 1 ? wordOptions[0]?.normalized ?? "" : "")
    }
  }, [isSelectedWordInContext, normalizedSelectedWord, wordOptions])

  useEffect(() => {
    if (typeof window === "undefined") return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        void closeQuickLookupWindow()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const resetFeedback = useCallback(() => {
    setErrorTitle(undefined)
    setErrorBody(undefined)
    setInsight(undefined)
  }, [])

  const handleContextChange = useCallback(
    (value: string) => {
      setContextText(value)
      resetFeedback()
    },
    [resetFeedback],
  )

  const handlePasteClipboard = useCallback(async () => {
    setIsReadingClipboard(true)
    const value = await readClipboardText()
    setIsReadingClipboard(false)

    if (!value) {
      setErrorTitle(translate("vocabulary:quickLookup.errors.clipboardUnavailableTitle"))
      setErrorBody(translate("vocabulary:quickLookup.errors.clipboardUnavailableBody"))
      return
    }

    setContextText(value)
    setSelectedWord("")
    resetFeedback()
  }, [resetFeedback])

  const handleRunLookup = useCallback(async () => {
    if (!canAnalyze) return

    setIsLoading(true)
    resetFeedback()

    try {
      const response = await wordInsightApi.runExplainAndWait({
        mode: "basic",
        sentence: buildShareContextSnippet(contextText, normalizedSelectedWord),
        selectedWord: normalizedSelectedWord,
        sourceLang: preferences?.l2Language,
        targetLang: preferences?.l1Language,
      })

      if (response.kind !== "ok") {
        const problem = resolveProblemMessage(response)
        setErrorTitle(problem.title)
        setErrorBody(problem.body)
        return
      }

      if (response.data.status !== "completed") {
        setErrorTitle(translate("vocabulary:quickLookup.errors.lookupFailedTitle"))
        setErrorBody(
          response.data.errorMessage || translate("vocabulary:quickLookup.errors.lookupFailedBody"),
        )
        return
      }

      setInsight(parseInsight(response.data.result?.insight))
    } finally {
      setIsLoading(false)
    }
  }, [
    canAnalyze,
    contextText,
    normalizedSelectedWord,
    preferences?.l1Language,
    preferences?.l2Language,
    resetFeedback,
  ])

  const handleOpenVocOrbit = useCallback(async () => {
    await focusMainVocOrbit()
    await closeQuickLookupWindow()
  }, [])

  const selectionStatusText = !contextText.trim()
    ? translate("vocabulary:quickLookup.selection.empty")
    : isSelectedWordInContext
      ? translate("vocabulary:quickLookup.selection.selected", {
          word: selectedWord,
        })
      : translate("vocabulary:quickLookup.selection.pending")

  return (
    <Screen
      preset="scroll"
      backgroundColor={colors.background}
      contentContainerStyle={themed($screenContent)}
      safeAreaEdges={["top", "bottom"]}
    >
      <View style={themed($page)}>
        <View style={themed($card)}>
          <View style={themed($headerRow)}>
            <View style={themed($headerCopy)}>
              <Text text={translate("vocabulary:quickLookup.title")} size="lg" weight="bold" />
              <Text
                text={translate("vocabulary:quickLookup.subtitle")}
                size="xs"
                style={themed($mutedText)}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:quickLookup.actions.close")}
              onPress={() => {
                void closeQuickLookupWindow()
              }}
              style={({ pressed }) => [themed($closeButton), pressed && themed($closeButtonPressed)]}
            >
              <Text text="x" weight="bold" style={themed($closeButtonText)} />
            </Pressable>
          </View>

          <Text
            text={translate("vocabulary:quickLookup.shortcutHint", {
              shortcut: QUICK_LOOKUP_SHORTCUT_LABEL,
            })}
            size="xxs"
            style={themed($shortcutHint)}
          />

          {!isSessionResolved ? (
            <View style={themed($loadingCard)}>
              <ActivityIndicator color={colors.tint} />
              <Text text={translate("vocabulary:quickLookup.loadingSession")} size="xs" />
            </View>
          ) : !isAuthenticated ? (
            <View style={themed($infoCard)}>
              <Text
                text={translate("vocabulary:quickLookup.authRequiredTitle")}
                size="sm"
                weight="bold"
              />
              <Text
                text={translate("vocabulary:quickLookup.authRequiredBody")}
                size="xs"
                style={themed($mutedText)}
              />
              <Button
                text={translate("vocabulary:quickLookup.actions.openVocOrbit")}
                onPress={() => {
                  void handleOpenVocOrbit()
                }}
                style={themed($primaryButton)}
                pressedStyle={themed($primaryButtonPressed)}
                textStyle={themed($primaryButtonText)}
              />
            </View>
          ) : (
            <>
              <View style={themed($editorWrap)}>
                <Text
                  text={translate("vocabulary:quickLookup.inputLabel")}
                  size="xxs"
                  weight="bold"
                  style={themed($fieldLabel)}
                />
                <TextField
                  value={contextText}
                  onChangeText={handleContextChange}
                  multiline
                  autoCorrect={false}
                  autoCapitalize="none"
                  placeholder={translate("vocabulary:quickLookup.inputPlaceholder")}
                  containerStyle={themed($textFieldContainer)}
                  inputWrapperStyle={themed($textFieldWrapper)}
                  style={themed($textFieldInput)}
                />
              </View>

              <View style={themed($actionRow)}>
                <Button
                  text={
                    isReadingClipboard
                      ? translate("vocabulary:quickLookup.actions.readingClipboard")
                      : translate("vocabulary:quickLookup.actions.pasteClipboard")
                  }
                  onPress={() => {
                    void handlePasteClipboard()
                  }}
                  disabled={isReadingClipboard || isLoading}
                  style={themed($secondaryButton)}
                  pressedStyle={themed($secondaryButtonPressed)}
                  textStyle={themed($secondaryButtonText)}
                />
                <Button
                  text={translate("vocabulary:quickLookup.actions.openVocOrbit")}
                  onPress={() => {
                    void handleOpenVocOrbit()
                  }}
                  style={themed($ghostButton)}
                  pressedStyle={themed($ghostButtonPressed)}
                  textStyle={themed($ghostButtonText)}
                />
              </View>

              {contextText.trim().length > 0 ? (
                <View style={themed($pickerCard)}>
                  <Text
                    text={translate("vocabulary:quickLookup.selection.title")}
                    size="xxs"
                    weight="bold"
                    style={themed($fieldLabel)}
                  />
                  <Text text={selectionStatusText} size="xxs" style={themed($mutedText)} />
                  <View style={themed($pickerBox)}>
                    <ScrollView style={themed($pickerScroll)} showsVerticalScrollIndicator={false}>
                      <Text size="sm" style={themed($pickerText)}>
                        {textSegments.map((segment) => {
                          if (!segment.normalizedWord) {
                            return <Text key={segment.key}>{segment.text}</Text>
                          }

                          const isSelected = segment.normalizedWord === normalizedSelectedWord
                          return (
                            <Text
                              key={segment.key}
                              suppressHighlighting
                              onPress={() => {
                                setSelectedWord(segment.normalizedWord ?? "")
                                resetFeedback()
                              }}
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
                </View>
              ) : null}

              <Button
                text={
                  isLoading
                    ? translate("vocabulary:quickLookup.actions.runningLookup")
                    : translate("vocabulary:quickLookup.actions.runBasicLookup")
                }
                onPress={() => {
                  void handleRunLookup()
                }}
                disabled={!canAnalyze}
                style={themed($primaryButton)}
                pressedStyle={themed($primaryButtonPressed)}
                textStyle={themed($primaryButtonText)}
                disabledStyle={themed($primaryButtonDisabled)}
                disabledTextStyle={themed($primaryButtonTextDisabled)}
              />

              {errorTitle && errorBody ? (
                <View style={themed($errorCard)}>
                  <Text text={errorTitle} size="sm" weight="bold" style={themed($errorTitle)} />
                  <Text text={errorBody} size="xs" style={themed($errorBody)} />
                </View>
              ) : null}

              {insight ? (
                <View style={themed($resultCard)}>
                  <Text
                    text={translate("vocabulary:quickLookup.resultTitle")}
                    size="xxs"
                    weight="bold"
                    style={themed($fieldLabel)}
                  />
                  <Text text={insight.word} size="lg" weight="bold" />
                  <Text text={insight.translationL1 ?? insight.meaning} size="md" weight="bold" />
                  {insight.definitionL2 ? (
                    <Text text={insight.definitionL2} size="xs" style={themed($mutedText)} />
                  ) : null}
                  <Text
                    text={translate("vocabulary:quickLookup.savedHint")}
                    size="xxs"
                    style={themed($successText)}
                  />
                  <View style={themed($resultActionsRow)}>
                    <Button
                      text={translate("vocabulary:quickLookup.actions.openVocOrbit")}
                      onPress={() => {
                        void handleOpenVocOrbit()
                      }}
                      style={themed($primaryButton)}
                      pressedStyle={themed($primaryButtonPressed)}
                      textStyle={themed($primaryButtonText)}
                    />
                    <Button
                      text={translate("vocabulary:quickLookup.actions.close")}
                      onPress={() => {
                        void closeQuickLookupWindow()
                      }}
                      style={themed($ghostButton)}
                      pressedStyle={themed($ghostButtonPressed)}
                      textStyle={themed($ghostButtonText)}
                    />
                  </View>
                </View>
              ) : null}
            </>
          )}

          {isDesktopShellRuntime() ? null : (
            <Text
              text={translate("vocabulary:quickLookup.browserHint")}
              size="xxs"
              style={themed($footerHint)}
            />
          )}
        </View>
      </View>
    </Screen>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  padding: spacing.md,
})

const $page: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  maxWidth: 560,
  alignSelf: "center",
})

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 24,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  gap: spacing.md,
})

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: spacing.md,
})

const $headerCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $closeButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 34,
  height: 34,
  borderRadius: 17,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.palette.neutral200,
})

const $closeButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
})

const $closeButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  lineHeight: 16,
})

const $shortcutHint: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $loadingCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 120,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm,
})

const $infoCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.md,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  backgroundColor: colors.palette.neutral200,
  gap: spacing.sm,
})

const $editorWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $fieldLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  letterSpacing: 0.7,
})

const $textFieldContainer: ThemedStyle<ViewStyle> = () => ({
  marginBottom: 0,
})

const $textFieldWrapper: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 118,
  alignItems: "flex-start",
  backgroundColor: colors.palette.neutral200,
  borderColor: colors.palette.neutral300,
  borderRadius: 20,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $textFieldInput: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  minHeight: 94,
  color: colors.text,
  textAlignVertical: "top",
  fontFamily: typography.primary.normal,
  fontSize: 15,
  lineHeight: 24,
})

const $actionRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
})

const $pickerCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $pickerBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 120,
  maxHeight: 180,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $pickerScroll: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 0,
})

const $pickerText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  lineHeight: 26,
})

const $pickerWord: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  textDecorationLine: "underline",
})

const $pickerWordSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
  backgroundColor: colors.palette.primary100,
})

const $primaryButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  minHeight: 48,
  borderRadius: 999,
  backgroundColor: colors.palette.primary300,
})

const $primaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary400,
})

const $primaryButtonDisabled: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
  opacity: 0.72,
})

const $primaryButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
})

const $primaryButtonTextDisabled: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.palette.neutral500,
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
})

const $secondaryButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  minHeight: 44,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  backgroundColor: colors.palette.neutral200,
})

const $secondaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
})

const $secondaryButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.medium,
  fontSize: 14,
})

const $ghostButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  minHeight: 44,
  borderRadius: 999,
  backgroundColor: colors.palette.overlay20,
})

const $ghostButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.overlay20,
})

const $ghostButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.medium,
  fontSize: 14,
})

const $errorCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.md,
  borderRadius: 20,
  backgroundColor: colors.palette.angry100,
  borderWidth: 1,
  borderColor: colors.error,
  gap: spacing.xs,
})

const $errorTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
})

const $errorBody: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $resultCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.md,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.palette.primary300,
  backgroundColor: colors.palette.primary100,
  gap: spacing.sm,
})

const $resultActionsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
})

const $successText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
})

const $mutedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $footerHint: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
})
