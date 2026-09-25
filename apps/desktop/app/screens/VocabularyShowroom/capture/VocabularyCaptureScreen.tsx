import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useLanguagePreferences } from "@/context/LanguagePreferencesContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { wordInsightApi } from "@/services/api/wordInsightApi"
import { isDesktopShellRuntime } from "@/services/desktop/desktopQuickLookupBridge"
import { formatQuickLookupShortcut, getQuickLookupShortcut } from "@/services/desktop/quickLookupShortcut"
import {
  buildShareContextSnippet,
  extractShareWords,
  normalizeShareSelection,
  tokenizeShareText,
} from "@/services/share/shareIntent"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type VocabularyCaptureScreenProps = AppStackScreenProps<"VocabularyCapture">

type CaptureInsightViewData = {
  word: string
  partOfSpeech?: string
  sourceLang?: string
  targetLang?: string
  meaning: string
  definitionL2?: string
  translationL1?: string
  whyThisSense?: string
}

type CaptureSuccessState = {
  lookupId: string
  insight?: CaptureInsightViewData
  entryId?: string
}

type CaptureErrorAction = "paste" | "analyze"

function readNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function parseInsightResult(value: unknown): CaptureInsightViewData | undefined {
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
} {
  switch (problem.kind) {
    case "unauthorized":
      return {
        title: translate("vocabulary:capture.problems.signInRequiredTitle"),
        body: translate("vocabulary:capture.problems.signInRequiredBody"),
      }
    case "forbidden":
      return {
        title: translate("vocabulary:capture.problems.basicCreditsRequiredTitle"),
        body:
          problem.message || translate("vocabulary:capture.problems.basicCreditsRequiredBody"),
      }
    case "timeout":
      return {
        title: translate("vocabulary:capture.problems.requestTimedOutTitle"),
        body: translate("vocabulary:capture.problems.requestTimedOutBody"),
      }
    case "cannot-connect":
      return {
        title: translate("vocabulary:capture.problems.connectionProblemTitle"),
        body: translate("vocabulary:capture.problems.connectionProblemBody"),
      }
    case "server":
    case "rejected":
    case "not-found":
      return {
        title: translate("vocabulary:capture.problems.lookupFailedTitle"),
        body: problem.message || translate("vocabulary:capture.problems.lookupFailedBody"),
      }
    default:
      return {
        title: translate("vocabulary:capture.problems.lookupFailedTitle"),
        body: translate("vocabulary:capture.problems.lookupFailedBody"),
      }
  }
}

function resolveFailedJobMessage(input: {
  errorCode?: string
  errorMessage?: string
}): string {
  const normalizedCode = input.errorCode?.trim().toLocaleLowerCase("en-US") ?? ""
  const normalizedMessage = input.errorMessage?.trim().toLocaleLowerCase("en-US") ?? ""
  const combined = `${normalizedCode} ${normalizedMessage}`.trim()

  if (combined.includes("invalid_model_json_output") || combined.includes("model_output_")) {
    return translate("vocabulary:errors.invalidModelOutput")
  }

  if (combined.includes("insufficient") && combined.includes("credit")) {
    return translate("vocabulary:errors.basicCreditInsufficient")
  }

  if (combined.includes("timeout")) {
    return translate("vocabulary:errors.analysisTimeout")
  }

  const rawMessage = input.errorMessage?.trim()
  if (rawMessage) {
    const machineLike = /^[a-z0-9_.:-]+$/i.test(rawMessage)
    if (!machineLike) return rawMessage
  }

  return translate("vocabulary:errors.basicAnalysisFailed")
}

async function readClipboardText(): Promise<string | undefined> {
  const tauriWindow = globalThis.window as
    | (Window & {
        __VOCORBIT_DESKTOP_SHELL__?: boolean
        __VOCORBIT_DESKTOP_BRIDGE__?: boolean
        __VOCORBIT_READ_CLIPBOARD_TEXT__?: () => Promise<unknown>
        __TAURI__?: {
          core?: {
            invoke?: (command: string, args?: unknown, options?: unknown) => Promise<unknown>
          }
        }
        __TAURI_INTERNALS__?: {
          invoke?: (command: string, args?: unknown, options?: unknown) => Promise<unknown>
        }
      })
    | undefined

  const desktopClipboardReader = tauriWindow?.__VOCORBIT_READ_CLIPBOARD_TEXT__
  if (typeof desktopClipboardReader === "function") {
    try {
      const value = await desktopClipboardReader()
      if (typeof value === "string") {
        const normalized = value.replace(/\s+/g, " ").trim()
        if (normalized.length > 0) return normalized
      }
    } catch {
      // Fall through to the direct Tauri invoke bridge below.
    }
  }

  const tauriInvoke =
    tauriWindow?.__TAURI__?.core?.invoke ?? tauriWindow?.__TAURI_INTERNALS__?.invoke
  if (typeof tauriInvoke === "function") {
    try {
      const value = await tauriInvoke("read_clipboard_text")
      if (typeof value === "string") {
        const normalized = value.replace(/\s+/g, " ").trim()
        if (normalized.length > 0) return normalized
      }
    } catch {
      // Fall back to browser clipboard APIs below.
    }
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

async function resolveCreatedEntryId(input: {
  lookupId: string
  selectedWord: string
}): Promise<string | undefined> {
  const response = await wordInsightApi.listLearningItems({
    status: "all",
    limit: 20,
    q: input.selectedWord,
  })

  if (response.kind !== "ok") return undefined
  return response.data.find((item) => item.latestLookupId === input.lookupId)?.id
}

export const VocabularyCaptureScreen: FC<VocabularyCaptureScreenProps> = ({ navigation, route }) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { preferences } = useLanguagePreferences()

  const initialSentence = route.params?.initialSentence?.trim() ?? ""
  const seedWordLabel = route.params?.initialWord?.trim() ?? ""
  const seedWord = normalizeShareSelection(seedWordLabel)

  const [contextText, setContextText] = useState(initialSentence)
  const [selectedWord, setSelectedWord] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isReadingClipboard, setIsReadingClipboard] = useState(false)
  const [errorTitle, setErrorTitle] = useState<string | undefined>()
  const [errorBody, setErrorBody] = useState<string | undefined>()
  const [errorAction, setErrorAction] = useState<CaptureErrorAction>("analyze")
  const [success, setSuccess] = useState<CaptureSuccessState | undefined>()
  const hasExplicitSelectionRef = useRef(false)
  const manualPasteInputRef = useRef<TextInput>(null)
  const [showManualPasteInput, setShowManualPasteInput] = useState(false)
  const [desktopShortcutLabel, setDesktopShortcutLabel] = useState(() => formatQuickLookupShortcut(undefined))
  const hasContextText = contextText.trim().length > 0
  const isDesktopShell = isDesktopShellRuntime()

  const resetFeedback = useCallback(() => {
    setErrorTitle(undefined)
    setErrorBody(undefined)
    setErrorAction("analyze")
    setSuccess(undefined)
  }, [])

  const applyInitialState = useCallback(
    (text: string, initialWord: string) => {
      const initialWords = extractShareWords(text, 64)
      const hasInitialWord = Boolean(
        initialWord && initialWords.some((word) => word.normalized === initialWord),
      )

      hasExplicitSelectionRef.current = false
      setContextText(text)
      setShowManualPasteInput(false)
      setSelectedWord(
        hasInitialWord ? initialWord : initialWords.length === 1 ? initialWords[0]?.normalized ?? "" : "",
      )
      setIsLoading(false)
      setIsReadingClipboard(false)
      setErrorTitle(undefined)
      setErrorBody(undefined)
      setSuccess(undefined)
    },
    [],
  )

  useEffect(() => {
    applyInitialState(initialSentence, seedWord)
  }, [applyInitialState, initialSentence, seedWord])

  useEffect(() => {
    if (!showManualPasteInput || hasContextText) return

    const timeoutId = setTimeout(() => {
      manualPasteInputRef.current?.focus()
    }, 80)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [hasContextText, showManualPasteInput])

  useEffect(() => {
    if (!isDesktopShell) return

    let isMounted = true

    void getQuickLookupShortcut()
      .then((shortcut) => {
        if (!isMounted) return
        setDesktopShortcutLabel(formatQuickLookupShortcut(shortcut))
      })
      .catch(() => {
        if (!isMounted) return
        setDesktopShortcutLabel(formatQuickLookupShortcut(undefined))
      })

    return () => {
      isMounted = false
    }
  }, [isDesktopShell])

  const wordOptions = useMemo(() => extractShareWords(contextText, 64), [contextText])
  const textSegments = useMemo(() => tokenizeShareText(contextText), [contextText])
  const normalizedSelectedWord = normalizeShareSelection(selectedWord)
  const isSelectedWordInContext =
    normalizedSelectedWord.length > 0 &&
    wordOptions.some((word) => word.normalized === normalizedSelectedWord)
  const canRunInsight = contextText.trim().length > 0 && isSelectedWordInContext && !isLoading

  useEffect(() => {
    if (hasExplicitSelectionRef.current) return

    if (seedWord && wordOptions.some((word) => word.normalized === seedWord)) {
      setSelectedWord((current) => (current === seedWord ? current : seedWord))
      return
    }

    if (!normalizedSelectedWord && wordOptions.length === 1) {
      setSelectedWord(wordOptions[0]?.normalized ?? "")
      return
    }

    if (normalizedSelectedWord && !isSelectedWordInContext) {
      setSelectedWord(wordOptions.length === 1 ? wordOptions[0]?.normalized ?? "" : "")
    }
  }, [isSelectedWordInContext, normalizedSelectedWord, seedWord, wordOptions])

  const handleContextChange = useCallback(
    (value: string) => {
      const nextWords = extractShareWords(value, 64)
      const nextSelectedWord = normalizeShareSelection(selectedWord)

      setContextText(value)
      resetFeedback()

      if (!value.trim()) {
        setShowManualPasteInput(false)
        hasExplicitSelectionRef.current = false
        setSelectedWord("")
        return
      }

      if (nextSelectedWord && !nextWords.some((word) => word.normalized === nextSelectedWord)) {
        hasExplicitSelectionRef.current = false

        if (seedWord && nextWords.some((word) => word.normalized === seedWord)) {
          setSelectedWord(seedWord)
          return
        }

        setSelectedWord(nextWords.length === 1 ? nextWords[0]?.normalized ?? "" : "")
      }
    },
    [resetFeedback, seedWord, selectedWord],
  )

  const handleSelectWord = useCallback(
    (word: string) => {
      hasExplicitSelectionRef.current = true
      setSelectedWord(word)
      resetFeedback()
    },
    [resetFeedback],
  )

  const handlePasteFromClipboard = useCallback(async () => {
    setIsReadingClipboard(true)
    const clipboardText = await readClipboardText()
    setIsReadingClipboard(false)

    if (!clipboardText) {
      setShowManualPasteInput(true)
      setErrorTitle(translate("vocabulary:capture.problems.clipboardUnavailableTitle"))
      setErrorBody(translate("vocabulary:capture.problems.clipboardUnavailableBody"))
      setErrorAction("paste")
      return
    }

    setShowManualPasteInput(false)
    handleContextChange(clipboardText)
  }, [handleContextChange])

  const handleClear = useCallback(() => {
    hasExplicitSelectionRef.current = false
    setContextText("")
    setShowManualPasteInput(false)
    setSelectedWord("")
    setErrorTitle(undefined)
    setErrorBody(undefined)
    setSuccess(undefined)
  }, [])

  const handleRunInsight = useCallback(async () => {
    const trimmedContext = contextText.trim()
    if (!trimmedContext) {
      setErrorTitle(translate("vocabulary:capture.problems.contextRequiredTitle"))
      setErrorBody(translate("vocabulary:capture.problems.contextRequiredBody"))
      setErrorAction("analyze")
      return
    }

    if (!isSelectedWordInContext) {
      setErrorTitle(translate("vocabulary:capture.problems.selectWordTitle"))
      setErrorBody(translate("vocabulary:capture.problems.selectWordBody"))
      setErrorAction("analyze")
      return
    }

    setIsLoading(true)
    setErrorTitle(undefined)
    setErrorBody(undefined)
    setSuccess(undefined)

    try {
      const response = await wordInsightApi.runExplainAndWait({
        mode: "basic",
        sentence: buildShareContextSnippet(trimmedContext, normalizedSelectedWord),
        selectedWord: normalizedSelectedWord,
        sourceLang: preferences?.l2Language,
        targetLang: preferences?.l1Language,
      })

      if (response.kind !== "ok") {
        const problem = resolveProblemMessage(response)
        setErrorTitle(problem.title)
        setErrorBody(problem.body)
        setErrorAction("analyze")
        return
      }

      if (response.data.status !== "completed") {
        setErrorTitle(translate("vocabulary:capture.problems.lookupFailedTitle"))
        setErrorBody(
          resolveFailedJobMessage({
            errorCode: response.data.errorCode,
            errorMessage: response.data.errorMessage,
          }),
        )
        setErrorAction("analyze")
        return
      }

      const lookupId = response.data.result?.lookupId
      if (!lookupId) {
        setErrorTitle(translate("vocabulary:capture.problems.lookupIncompleteTitle"))
        setErrorBody(translate("vocabulary:capture.problems.lookupIncompleteBody"))
        setErrorAction("analyze")
        return
      }

      const entryId = await resolveCreatedEntryId({
        lookupId,
        selectedWord: normalizedSelectedWord,
      })

      setSuccess({
        lookupId,
        entryId,
        insight: parseInsightResult(response.data.result?.insight),
      })
    } finally {
      setIsLoading(false)
    }
  }, [
    contextText,
    isSelectedWordInContext,
    normalizedSelectedWord,
    preferences?.l1Language,
    preferences?.l2Language,
  ])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || (!event.metaKey && !event.ctrlKey)) return

      const target = event.target as HTMLElement | null
      const tagName = target?.tagName ?? ""
      const isEditable =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        target?.getAttribute("contenteditable") === "true"
      if (!isEditable) return

      event.preventDefault()
      void handleRunInsight()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleRunInsight])

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
      return
    }
    navigation.navigate("VocabularyShowroomScreen")
  }, [navigation])

  const handleOpenSavedWord = useCallback(() => {
    if (!success?.entryId) return
    navigation.replace("VocabularyDetail", { entryId: success.entryId })
  }, [navigation, success?.entryId])

  const handleBackToLibrary = useCallback(() => {
    navigation.navigate("VocabularyShowroomScreen")
  }, [navigation])

  const selectionStatusText = !contextText.trim()
    ? translate("vocabulary:capture.status.pasteFirst")
    : isSelectedWordInContext
      ? translate("vocabulary:capture.status.selectedWord", {
          word: selectedWord,
        })
      : seedWordLabel
        ? translate("vocabulary:capture.status.seedWordMissing", {
            word: seedWordLabel,
          })
        : translate("vocabulary:capture.status.selectWord")

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
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:profile.accessibility.goBack")}
              style={({ pressed }) => [themed($backButton), pressed && themed($backButtonPressed)]}
            >
              <Icon icon="back" size={14} color={colors.text} />
              <Text
                text={translate("vocabulary:capture.backButton")}
                size="xs"
                weight="medium"
                style={themed($backButtonText)}
              />
            </Pressable>

            <View style={themed($headerCopy)}>
              <Text text={translate("vocabulary:capture.headerTitle")} size="lg" weight="bold" />
              <Text
                text={translate("vocabulary:capture.headerBody")}
                size="xs"
                style={themed($cardBody)}
              />
            </View>
          </View>

          {seedWordLabel ? (
            <View style={themed($seedPill)}>
              <Text
                text={translate("vocabulary:capture.seedWordLabel", {
                  word: seedWordLabel,
                })}
                size="xxs"
                weight="bold"
                style={themed($seedPillText)}
              />
            </View>
          ) : null}
        </View>

        {!hasContextText ? (
          <View style={themed($pasteHeroCard)}>
            <View style={themed($pasteHeroIconWrap)}>
              <Icon icon="view" size={22} color={colors.palette.primary600} />
            </View>

            <Text text={translate("vocabulary:capture.pasteHero.title")} size="lg" weight="bold" />
            <Text
              text={
                seedWordLabel
                  ? translate("vocabulary:capture.pasteHero.bodyWithWord", {
                      word: seedWordLabel,
                    })
                  : translate("vocabulary:capture.pasteHero.body")
              }
              size="xs"
              style={themed($pasteHeroBody)}
            />

            <Button
              text={
                isReadingClipboard
                  ? translate("vocabulary:capture.actions.readingClipboard")
                  : translate("vocabulary:capture.actions.pasteCopiedText")
              }
              onPress={() => {
                void handlePasteFromClipboard()
              }}
              disabled={isReadingClipboard || isLoading}
              style={themed($pasteHeroButton)}
              pressedStyle={themed($pasteHeroButtonPressed)}
              textStyle={themed($pasteHeroButtonText)}
              disabledStyle={themed($primaryButtonDisabled)}
              disabledTextStyle={themed($primaryButtonTextDisabled)}
            />

            <Text
              text={translate("vocabulary:capture.pasteHero.hint")}
              size="xxs"
              style={themed($pasteHeroHint)}
            />

            {isDesktopShell ? (
              <Text
                text={translate("vocabulary:quickLookup.shortcutHint", {
                  shortcut: desktopShortcutLabel,
                })}
                size="xxs"
                style={themed($pasteHeroHint)}
              />
            ) : null}

            {showManualPasteInput ? (
              <View style={themed($manualPasteWrap)}>
                <TextField
                  ref={manualPasteInputRef}
                  value={contextText}
                  onChangeText={handleContextChange}
                  multiline
                  autoCorrect={false}
                  autoCapitalize="none"
                  placeholder={translate("vocabulary:capture.actions.pasteCopiedText")}
                  containerStyle={themed($manualPasteFieldContainer)}
                  inputWrapperStyle={themed($manualPasteFieldWrapper)}
                  style={themed($manualPasteFieldInput)}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {hasContextText ? (
          <View style={themed($card)}>
            <View style={themed($pickerHeaderRow)}>
              <View style={themed($pickerHeaderCopy)}>
                <Text text={translate("vocabulary:capture.picker.title")} size="sm" weight="bold" />
                <Text
                  text={translate("vocabulary:capture.picker.body")}
                  size="xs"
                  style={themed($cardBody)}
                />
              </View>

              <View style={themed($pickerHeaderActions)}>
                <Button
                  text={
                    isReadingClipboard
                      ? translate("vocabulary:capture.actions.reading")
                      : translate("vocabulary:capture.actions.pasteAgain")
                  }
                  onPress={() => {
                    void handlePasteFromClipboard()
                  }}
                  disabled={isReadingClipboard || isLoading}
                  style={themed($secondaryButtonCompact)}
                  pressedStyle={themed($secondaryButtonPressed)}
                  textStyle={themed($secondaryButtonText)}
                  disabledStyle={themed($secondaryButtonDisabled)}
                  disabledTextStyle={themed($secondaryButtonTextDisabled)}
                />
                <Button
                  text={translate("vocabulary:capture.actions.clear")}
                  onPress={handleClear}
                  disabled={isLoading}
                  style={themed($ghostButtonCompact)}
                  pressedStyle={themed($ghostButtonPressed)}
                  textStyle={themed($ghostButtonText)}
                  disabledStyle={themed($secondaryButtonDisabled)}
                  disabledTextStyle={themed($secondaryButtonTextDisabled)}
                />
              </View>
            </View>

            <View style={themed($pickerMetaRow)}>
              <View style={themed($tapBadge)}>
                <Icon icon="view" size={14} color={colors.palette.primary600} />
                <Text
                  text={translate("vocabulary:capture.picker.badge")}
                  size="xxs"
                  weight="bold"
                  style={themed($tapBadgeText)}
                />
              </View>

              <Text
                text={selectionStatusText}
                size="xs"
                weight={isSelectedWordInContext ? "bold" : "medium"}
                style={[
                  themed($selectionValue),
                  isSelectedWordInContext ? themed($selectionValueReady) : themed($selectionValueMuted),
                ]}
              />
            </View>

            <View style={[themed($pickerBox), isSelectedWordInContext && themed($pickerBoxSelected)]}>
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
                        onPress={() => handleSelectWord(segment.normalizedWord ?? "")}
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
              text={
                isLoading
                  ? translate("vocabulary:capture.actions.loadingMeaning")
                  : translate("vocabulary:capture.actions.analyzeAndSave")
              }
              preset="default"
              disabled={!canRunInsight}
              onPress={() => {
                void handleRunInsight()
              }}
              style={themed($primaryButton)}
              pressedStyle={themed($primaryButtonPressed)}
              disabledStyle={themed($primaryButtonDisabled)}
              textStyle={themed($primaryButtonText)}
              disabledTextStyle={themed($primaryButtonTextDisabled)}
            />

            <Text
              text={translate("vocabulary:capture.picker.hint")}
              size="xxs"
              style={themed($cardBody)}
            />
          </View>
        ) : null}

        {isLoading ? (
          <View style={themed($card)}>
            <View style={themed($loadingRow)}>
              <ActivityIndicator color={colors.tint} />
              <View style={themed($loadingTextWrap)}>
                <Text text={translate("vocabulary:capture.loading.title")} size="sm" weight="bold" />
                <Text
                  text={translate("vocabulary:capture.loading.body")}
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

            <Button
              text={
                errorAction === "paste" && showManualPasteInput
                  ? translate("vocabulary:capture.actions.pasteAgain")
                  : translate("vocabulary:common.retry")
              }
              onPress={() => {
                if (errorAction === "paste") {
                  void handlePasteFromClipboard()
                  return
                }

                void handleRunInsight()
              }}
              disabled={
                errorAction === "paste" ? isReadingClipboard || isLoading : !canRunInsight
              }
              style={themed($secondaryButton)}
              pressedStyle={themed($secondaryButtonPressed)}
              textStyle={themed($secondaryButtonText)}
              disabledStyle={themed(
                errorAction === "paste" ? $secondaryButtonDisabledStrong : $secondaryButtonDisabled,
              )}
              disabledTextStyle={themed($secondaryButtonTextDisabled)}
            />
          </View>
        ) : null}

        {success ? (
          <View style={themed($resultCard)}>
            <Text text={translate("vocabulary:capture.result.title")} size="sm" weight="bold" />
            <Text
              text={(success.insight?.word ?? selectedWord).toUpperCase()}
              size="xl"
              weight="bold"
            />

            <View style={themed($resultMeaningBox)}>
              <Text
                text={
                  success.insight?.translationL1 ??
                  success.insight?.meaning ??
                  translate("vocabulary:capture.result.savedFallback")
                }
                size="md"
                weight="bold"
              />
              {success.insight?.partOfSpeech ? (
                <Text
                  text={success.insight.partOfSpeech}
                  size="xxs"
                  weight="bold"
                  style={themed($resultMeta)}
                />
              ) : null}
            </View>

            {success.insight?.definitionL2 ? (
              <View style={themed($resultSection)}>
                <Text
                  text={translate("vocabulary:capture.result.contextMeaning")}
                  size="xxs"
                  weight="bold"
                  style={themed($resultSectionLabel)}
                />
                <Text text={success.insight.definitionL2} size="sm" style={themed($resultSectionBody)} />
              </View>
            ) : null}

            {success.insight?.whyThisSense ? (
              <View style={themed($resultSection)}>
                <Text
                  text={translate("vocabulary:capture.result.whyThisMeaning")}
                  size="xxs"
                  weight="bold"
                  style={themed($resultSectionLabel)}
                />
                <Text text={success.insight.whyThisSense} size="sm" style={themed($resultSectionBody)} />
              </View>
            ) : null}

            <View style={themed($resultActionsRow)}>
              {success.entryId ? (
                <Button
                  text={translate("vocabulary:capture.actions.openSavedWord")}
                  onPress={handleOpenSavedWord}
                  style={themed($primaryButton)}
                  pressedStyle={themed($primaryButtonPressed)}
                  textStyle={themed($primaryButtonText)}
                />
              ) : (
                <Button
                  text={translate("vocabulary:capture.actions.backToLibrary")}
                  onPress={handleBackToLibrary}
                  style={themed($primaryButton)}
                  pressedStyle={themed($primaryButtonPressed)}
                  textStyle={themed($primaryButtonText)}
                />
              )}

              <Button
                text={translate("vocabulary:capture.actions.pickAnotherWord")}
                onPress={resetFeedback}
                style={themed($secondaryButton)}
                pressedStyle={themed($secondaryButtonPressed)}
                textStyle={themed($secondaryButtonText)}
              />
            </View>
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
  width: "100%",
  maxWidth: 880,
  alignSelf: "center",
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
  top: 260,
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
  gap: spacing.sm,
})

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: spacing.md,
})

const $headerCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
})

const $backButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 40,
  paddingHorizontal: spacing.sm,
  borderRadius: 999,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  flexDirection: "row",
  gap: spacing.xs,
})

const $backButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
})

const $backButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $seedPill: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignSelf: "flex-start",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 999,
  backgroundColor: colors.palette.primary100,
})

const $seedPillText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
  letterSpacing: 0.2,
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

const $pasteHeroCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 28,
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.xl,
  marginBottom: spacing.lg,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  alignItems: "center",
  gap: spacing.sm,
})

const $pasteHeroIconWrap: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 58,
  width: 58,
  borderRadius: 29,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.palette.primary100,
})

const $pasteHeroBody: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
  maxWidth: 520,
})

const $pasteHeroButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
  minWidth: 260,
  backgroundColor: "#42624B",
  borderWidth: 0,
  borderRadius: 18,
})

const $pasteHeroButtonPressed: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.92,
})

const $pasteHeroButtonText: ThemedStyle<TextStyle> = () => ({
  color: "#FFFFFF",
})

const $pasteHeroHint: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral700,
  textAlign: "center",
})

const $manualPasteWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 620,
  marginTop: spacing.sm,
})

const $manualPasteFieldContainer: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
})

const $manualPasteFieldWrapper: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 156,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  backgroundColor: colors.palette.neutral200,
})

const $manualPasteFieldInput: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  minHeight: 128,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  lineHeight: 25,
  color: colors.text,
})

const $pickerHeaderRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: spacing.md,
  flexWrap: "wrap",
})

const $pickerHeaderCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 220,
})

const $pickerHeaderActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
})

const $secondaryButtonCompact: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 44,
  borderRadius: 16,
  backgroundColor: colors.palette.neutral200,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  paddingHorizontal: spacing.md,
})

const $ghostButtonCompact: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 44,
  borderRadius: 16,
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  paddingHorizontal: spacing.md,
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

const $selectionValue: ThemedStyle<TextStyle> = () => ({
  flexShrink: 1,
})

const $selectionValueReady: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
})

const $selectionValueMuted: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral700,
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
  maxHeight: 240,
  minHeight: 148,
})

const $pickerText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  lineHeight: 25,
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

const $primaryButtonPressed: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.92,
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

const $secondaryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minWidth: 168,
  borderRadius: 18,
  backgroundColor: colors.palette.neutral200,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  paddingHorizontal: spacing.md,
})

const $secondaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
})

const $secondaryButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.55,
})

const $secondaryButtonDisabledStrong: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  borderColor: colors.palette.neutral300,
  opacity: 1,
})

const $secondaryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $secondaryButtonTextDisabled: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral500,
})

const $ghostButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minWidth: 120,
  borderRadius: 18,
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  paddingHorizontal: spacing.md,
})

const $ghostButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
})

const $ghostButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
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

const $errorCard: ThemedStyle<ViewStyle> = ({ colors, spacing, isDark }) => ({
  backgroundColor: isDark ? "rgba(53, 35, 36, 0.94)" : colors.errorBackground,
  borderRadius: 24,
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderWidth: 1,
  borderColor: isDark ? "rgba(213, 106, 97, 0.44)" : colors.error,
  gap: spacing.sm,
})

const $errorTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
})

const $errorBody: ThemedStyle<TextStyle> = ({ colors, isDark }) => ({
  color: isDark ? "rgba(255, 245, 244, 0.92)" : colors.palette.neutral800,
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

const $resultActionsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
  marginTop: spacing.xs,
})
