import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"

import { languagePreferencesApi, type UserLanguagePreferencesPayload } from "@/services/api/languagePreferencesApi"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { loadStoredAuthSession } from "@/services/api/backendClient"
import { wordInsightApi } from "@/services/api/wordInsightApi"
import {
  DEFAULT_QUICK_LOOKUP_SHORTCUT,
  formatQuickLookupShortcut,
  getQuickLookupShortcut,
} from "@/services/desktop/quickLookupShortcut"
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

function resolveProblemMessage(problem: GeneralApiProblem): { title: string; body: string } {
  const message = "message" in problem ? problem.message : undefined

  switch (problem.kind) {
    case "unauthorized":
      return {
        title: "Sign in required",
        body: "Open VocOrbit, sign in again, then use quick lookup one more time.",
      }
    case "forbidden":
      return {
        title: "Basic credits required",
        body: message || "Your account cannot run a basic lookup right now.",
      }
    case "timeout":
      return {
        title: "Request timed out",
        body: "The lookup took too long. Try again with the same text.",
      }
    case "cannot-connect":
      return {
        title: "Connection problem",
        body: "VocOrbit could not reach the server. Check your connection and retry.",
      }
    default:
      return {
        title: "Lookup failed",
        body: message || "VocOrbit could not finish this insight request.",
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

export const DesktopQuickLookupStandalone: FC = () => {
  const [sessionResolved, setSessionResolved] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | undefined>()
  const [preferences, setPreferences] = useState<UserLanguagePreferencesPayload | undefined>()
  const [contextText, setContextText] = useState(getQuickLookupInitialText())
  const [selectedWord, setSelectedWord] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isReadingClipboard, setIsReadingClipboard] = useState(false)
  const [errorTitle, setErrorTitle] = useState<string | undefined>()
  const [errorBody, setErrorBody] = useState<string | undefined>()
  const [insight, setInsight] = useState<QuickLookupInsight | undefined>()
  const [showManualPasteInput, setShowManualPasteInput] = useState(false)
  const [shortcutLabel, setShortcutLabel] = useState(
    formatQuickLookupShortcut(DEFAULT_QUICK_LOOKUP_SHORTCUT),
  )
  const manualPasteInputRef = useRef<TextInput>(null)

  const wordOptions = useMemo(() => extractShareWords(contextText, 48), [contextText])
  const textSegments = useMemo(() => tokenizeShareText(contextText), [contextText])
  const normalizedSelectedWord = normalizeShareSelection(selectedWord)
  const hasContextText = contextText.trim().length > 0
  const isSelectedWordInContext =
    normalizedSelectedWord.length > 0 &&
    wordOptions.some((word) => word.normalized === normalizedSelectedWord)
  const canAnalyze =
    isAuthenticated && !isLoading && hasContextText && isSelectedWordInContext
  const hasLookupError = Boolean(errorTitle && errorBody && hasContextText)
  const emptyStateTitle = showManualPasteInput ? "Paste text" : "Copy text first"
  const emptyStateBody =
    errorBody && !hasContextText
      ? errorBody
      : showManualPasteInput
        ? "Paste a sentence below, then pick the exact word."
        : "Copy a sentence in any app, then open quick lookup."

  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.style.backgroundColor = "#0B0E16"
    document.body.style.backgroundColor = "#0B0E16"
    document.body.style.margin = "0"
  }, [])

  useEffect(() => {
    let isMounted = true

    const resolveSession = async () => {
      const session = loadStoredAuthSession()
      if (!isMounted) return

      if (!session?.accessToken) {
        setIsAuthenticated(false)
        setUserId(undefined)
        setSessionResolved(true)
        return
      }

      setIsAuthenticated(true)
      setUserId(session.userId)

      if (session.userId) {
        const response = await languagePreferencesApi.getLanguagePreferences(session.userId)
        if (!isMounted) return
        if (response.kind === "ok") {
          setPreferences(response.data)
        }
      }

      setSessionResolved(true)
    }

    void resolveSession()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isDesktopShellRuntime()) return

    let isMounted = true

    void getQuickLookupShortcut().then((shortcut) => {
      if (!isMounted) return
      setShortcutLabel(formatQuickLookupShortcut(shortcut))
    })

    return () => {
      isMounted = false
    }
  }, [])

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

  const handlePasteClipboard = useCallback(async () => {
    setIsReadingClipboard(true)
    const value = await readClipboardText()
    setIsReadingClipboard(false)

    if (!value) {
      setShowManualPasteInput(true)
      setErrorTitle("Copy text first")
      setErrorBody("No copied text was found. Paste a sentence below or copy one and try again.")
      return
    }

    setShowManualPasteInput(false)
    setContextText(value)
    setSelectedWord("")
    resetFeedback()
  }, [resetFeedback])

  const handleContextChange = useCallback(
    (value: string) => {
      setContextText(value)
      resetFeedback()

      if (!value.trim()) {
        setSelectedWord("")
        return
      }

      const normalizedCurrent = normalizeShareSelection(selectedWord)
      const nextWords = extractShareWords(value, 48)
      if (
        normalizedCurrent &&
        !nextWords.some((word) => word.normalized === normalizedCurrent)
      ) {
        setSelectedWord(nextWords.length === 1 ? nextWords[0]?.normalized ?? "" : "")
      }
    },
    [resetFeedback, selectedWord],
  )

  const handleClear = useCallback(() => {
    setContextText("")
    setSelectedWord("")
    setShowManualPasteInput(false)
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
        setErrorTitle("Lookup failed")
        setErrorBody(response.data.errorMessage || "VocOrbit could not finish this insight request.")
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

  const selectionStatusText = !hasContextText
    ? "Paste text first."
    : isSelectedWordInContext
      ? `Selected: ${selectedWord}`
      : "Click the exact word inside the text."

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>Quick lookup</Text>
          </View>

          {!sessionResolved ? (
            <View style={styles.centerCard}>
              <ActivityIndicator color="#D8E7D7" />
              <Text style={styles.bodyText}>Preparing your VocOrbit session...</Text>
            </View>
          ) : !isAuthenticated ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Sign in required</Text>
              <Text style={styles.bodyText}>Open VocOrbit, sign in, then use the quick lookup shortcut again.</Text>
              <Pressable
                onPress={() => void handleOpenVocOrbit()}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
              >
                <Text style={styles.primaryButtonText}>Open VocOrbit</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {!hasContextText ? (
                <View style={styles.pasteHeroCard}>
                  <View style={styles.heroCopy}>
                    <Text style={styles.heroTitle}>{emptyStateTitle}</Text>
                    <Text style={styles.heroBody}>{emptyStateBody}</Text>
                  </View>

                  <Pressable
                    onPress={() => void handlePasteClipboard()}
                    disabled={isReadingClipboard || isLoading}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      styles.heroButton,
                      (pressed || isReadingClipboard || isLoading) && styles.primaryButtonPressed,
                      (isReadingClipboard || isLoading) && styles.primaryButtonDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.primaryButtonText,
                        (isReadingClipboard || isLoading) && styles.primaryButtonTextDisabled,
                      ]}
                    >
                      {isReadingClipboard ? "Reading clipboard..." : "Paste copied text"}
                    </Text>
                  </Pressable>

                  <Text style={styles.shortcutHint}>Shortcut: {shortcutLabel}</Text>

                  {showManualPasteInput ? (
                    <View style={styles.manualPasteWrap}>
                      <TextInput
                        ref={manualPasteInputRef}
                        value={contextText}
                        onChangeText={handleContextChange}
                        multiline
                        autoCorrect={false}
                        autoCapitalize="none"
                        placeholder="Paste a sentence or paragraph here."
                        placeholderTextColor="#7E8B84"
                        style={styles.textInput}
                      />
                    </View>
                  ) : null}
                </View>
              ) : (
                <>
                  {insight ? (
                    <View style={styles.resultCard}>
                      <Text style={styles.resultWord}>{insight.word}</Text>
                      <Text style={styles.resultMeaning}>
                        {insight.translationL1 ?? insight.meaning}
                      </Text>
                      {insight.definitionL2 ? (
                        <Text style={styles.resultDefinition}>{insight.definitionL2}</Text>
                      ) : null}
                    </View>
                  ) : null}

                  <View style={styles.pickerCard}>
                    <View style={styles.pickerHeaderRow}>
                      <View style={styles.pickerHeaderCopy}>
                        <Text style={styles.fieldLabel}>Choose the target word</Text>
                        <Text style={styles.mutedText}>{selectionStatusText}</Text>
                      </View>

                      <View style={styles.inlineActions}>
                        <Pressable
                          onPress={() => void handlePasteClipboard()}
                          disabled={isReadingClipboard || isLoading}
                          style={({ pressed }) => [
                            styles.inlineButton,
                            (pressed || isReadingClipboard || isLoading) && styles.inlineButtonPressed,
                          ]}
                        >
                          <Text style={styles.inlineButtonText}>
                            {isReadingClipboard ? "Reading..." : "Paste again"}
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={handleClear}
                          disabled={isLoading}
                          style={({ pressed }) => [
                            styles.inlineButton,
                            pressed && styles.inlineButtonPressed,
                          ]}
                        >
                          <Text style={styles.inlineButtonText}>Clear</Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.pickerBox}>
                      <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                        <Text style={styles.pickerText}>
                          {textSegments.map((segment) => {
                            if (!segment.normalizedWord) {
                              return <Text key={segment.key}>{segment.text}</Text>
                            }

                            const isSelected = segment.normalizedWord === normalizedSelectedWord
                            return (
                              <Text
                                key={segment.key}
                                onPress={() => {
                                  setSelectedWord(segment.normalizedWord ?? "")
                                  resetFeedback()
                                }}
                                style={[styles.pickerWord, isSelected && styles.pickerWordSelected]}
                              >
                                {segment.text}
                              </Text>
                            )
                          })}
                        </Text>
                      </ScrollView>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => void handleRunLookup()}
                    disabled={!canAnalyze}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      (!canAnalyze || pressed) && styles.primaryButtonPressed,
                      !canAnalyze && styles.primaryButtonDisabled,
                    ]}
                  >
                    <View style={styles.buttonContentRow}>
                      {isLoading ? (
                        <ActivityIndicator
                          size="small"
                          color={canAnalyze ? "#0C0F0F" : "#87928C"}
                          style={styles.loadingSpinner}
                        />
                      ) : null}
                      <Text
                        style={[
                          styles.primaryButtonText,
                          !canAnalyze && styles.primaryButtonTextDisabled,
                        ]}
                      >
                        {isLoading ? "Looking up..." : "Run basic lookup"}
                      </Text>
                    </View>
                  </Pressable>
                </>
              )}

              {hasLookupError ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorTitle}>{errorTitle}</Text>
                  <Text style={styles.errorBody}>{errorBody}</Text>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B0E16",
    padding: 16,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#39423F",
    backgroundColor: "#0C0F0F",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    color: "#E7ECE7",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
  },
  shortcutHint: {
    color: "#AEB8B0",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  centerCard: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#39423F",
    backgroundColor: "#1D2321",
    padding: 16,
    gap: 10,
  },
  infoTitle: {
    color: "#E7ECE7",
    fontSize: 16,
    fontWeight: "700",
  },
  bodyText: {
    color: "#CFD9D0",
    fontSize: 14,
    lineHeight: 20,
  },
  editorWrap: {
    gap: 8,
  },
  pasteHeroCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#39423F",
    backgroundColor: "#111514",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
  },
  heroCopy: {
    gap: 6,
  },
  heroTitle: {
    color: "#E7ECE7",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
  },
  heroBody: {
    color: "#CFD9D0",
    fontSize: 14,
    lineHeight: 20,
  },
  heroButton: {
    width: "100%",
  },
  manualPasteWrap: {
    width: "100%",
  },
  fieldLabel: {
    color: "#AEB8B0",
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  textInput: {
    minHeight: 112,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#39423F",
    backgroundColor: "#1D2321",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#E7ECE7",
    fontSize: 15,
    lineHeight: 23,
    textAlignVertical: "top",
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: "#90B095",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonDisabled: {
    backgroundColor: "#39423F",
    opacity: 0.8,
  },
  primaryButtonText: {
    color: "#0C0F0F",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingSpinner: {
    transform: [{ scale: 0.92 }],
  },
  primaryButtonTextDisabled: {
    color: "#87928C",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#39423F",
    backgroundColor: "#1D2321",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryButtonPressed: {
    opacity: 0.82,
  },
  secondaryButtonText: {
    color: "#E7ECE7",
    fontSize: 14,
    fontWeight: "600",
  },
  pickerCard: {
    gap: 10,
  },
  pickerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  pickerHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  inlineActions: {
    flexDirection: "row",
    gap: 8,
  },
  inlineButton: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#39423F",
    backgroundColor: "#1D2321",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  inlineButtonPressed: {
    opacity: 0.84,
  },
  inlineButtonText: {
    color: "#E7ECE7",
    fontSize: 12,
    fontWeight: "600",
  },
  mutedText: {
    color: "#AEB8B0",
    fontSize: 12,
    lineHeight: 18,
  },
  pickerBox: {
    minHeight: 120,
    maxHeight: 180,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#39423F",
    backgroundColor: "#1D2321",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerScroll: {
    flexGrow: 0,
  },
  pickerText: {
    color: "#E7ECE7",
    fontSize: 16,
    lineHeight: 26,
  },
  pickerWord: {
    color: "#E7ECE7",
    textDecorationLine: "underline",
  },
  pickerWordSelected: {
    color: "#E2EEE4",
    backgroundColor: "#5F7B67",
    fontWeight: "700",
  },
  errorCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#7C4A47",
    backgroundColor: "#2A1D1C",
    padding: 16,
    gap: 6,
  },
  errorTitle: {
    color: "#F18980",
    fontSize: 16,
    fontWeight: "700",
  },
  errorBody: {
    color: "#E7D2D0",
    fontSize: 14,
    lineHeight: 20,
  },
  resultCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#90B095",
    backgroundColor: "#142018",
    padding: 16,
    gap: 10,
  },
  resultWord: {
    color: "#F8F8F5",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  resultMeaning: {
    color: "#F8F8F5",
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "700",
  },
  resultDefinition: {
    color: "#D7E4D9",
    fontSize: 14,
    lineHeight: 20,
  },
})
