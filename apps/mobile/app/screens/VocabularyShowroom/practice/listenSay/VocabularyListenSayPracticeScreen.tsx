import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ActivityIndicator, Platform, Pressable, TextStyle, View, ViewStyle } from "react-native"
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { deleteAsync } from "expo-file-system/legacy"

import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { type WordInsightLearningItem, wordInsightApi } from "@/services/api/wordInsightApi"
import { speakWord } from "@/services/pronunciation/pronunciationService"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { resolveDisplayPhonetic } from "@/utils/phonetic"

type VocabularyListenSayPracticeScreenProps = AppStackScreenProps<"VocabularyListenSayPractice">
type SpeakPhase = "ready" | "recording" | "review"

const LISTEN_SAY_LIMIT = 10
const LISTEN_SAY_POOL_LIMIT = 100
const MIN_RECORDING_DURATION_MS = 450
const ANDROID_RECORDING_AUDIO_MODE =
  Platform.OS === "android"
    ? { interruptionMode: "duckOthers" as const, shouldRouteThroughEarpiece: false }
    : {}
const PLAYBACK_AUDIO_MODE = {
  allowsRecording: false,
  playsInSilentMode: true,
  ...(Platform.OS === "android"
    ? { interruptionMode: "mixWithOthers" as const, shouldRouteThroughEarpiece: false }
    : {}),
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

async function deleteTemporaryRecording(uri?: string | null): Promise<void> {
  if (!uri) return

  try {
    await deleteAsync(uri, { idempotent: true })
  } catch {
    if (__DEV__) {
      console.warn("Temporary listen & say recording could not be deleted.", uri)
    }
  }
}

function resolveLoadErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") return translate("vocabulary:errors.sessionExpired")
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:errors.cannotConnect")
  }
  return translate("vocabulary:errors.listLoadFailed")
}

function resolveMeaning(item: WordInsightLearningItem): string {
  return item.targetMeaning || item.lastMeaning || item.translationL1 || "-"
}

function shuffleLearningItems(items: WordInsightLearningItem[]): WordInsightLearningItem[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = current
  }
  return shuffled
}

export const VocabularyListenSayPracticeScreen: FC<VocabularyListenSayPracticeScreenProps> = ({
  navigation,
  route,
}) => {
  const { themed, theme } = useAppTheme()
  const { colors } = theme
  const groupIds = useMemo(() => route.params.groupIds ?? [], [route.params.groupIds])
  const recorder = useAudioRecorder(RecordingPresets.LOW_QUALITY)
  const recorderState = useAudioRecorderState(recorder, 160)
  const [items, setItems] = useState<WordInsightLearningItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<SpeakPhase>("ready")
  const [isLoading, setIsLoading] = useState(true)
  const [loadProblem, setLoadProblem] = useState<GeneralApiProblem | undefined>(undefined)
  const [pronunciationErrorMessage, setPronunciationErrorMessage] = useState<string | undefined>(
    undefined,
  )
  const [recordingErrorMessage, setRecordingErrorMessage] = useState<string | undefined>(undefined)
  const [recordingUri, setRecordingUri] = useState<string | undefined>(undefined)
  const recordingPlayer = useAudioPlayer(recordingUri ?? null)
  const recordingStatus = useAudioPlayerStatus(recordingPlayer)
  const recorderRef = useRef(recorder)
  const recordingPlayerRef = useRef(recordingPlayer)
  const recordingUriRef = useRef<string | undefined>(undefined)
  const recordingStartedAtRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    recorderRef.current = recorder
  }, [recorder])

  useEffect(() => {
    recordingPlayerRef.current = recordingPlayer
  }, [recordingPlayer])

  const currentItem = items[currentIndex]
  const isComplete = items.length > 0 && currentIndex >= items.length
  const progressLabel = items.length
    ? `${Math.min(currentIndex + 1, items.length)}/${items.length}`
    : "0/0"
  const meaning = currentItem ? resolveMeaning(currentItem) : ""
  const phonetic = resolveDisplayPhonetic(
    currentItem?.phonetic,
    currentItem?.lemma ?? currentItem?.vocab,
  )

  const updateRecordingUri = useCallback((uri?: string) => {
    recordingUriRef.current = uri
    setRecordingUri(uri)
  }, [])

  const clearTemporaryRecording = useCallback(() => {
    const uri = recordingUriRef.current
    recordingUriRef.current = undefined
    setRecordingUri(undefined)

    if (uri) {
      void deleteTemporaryRecording(uri)
    }
  }, [])

  const resetPromptState = useCallback(() => {
    try {
      const currentRecorder = recorderRef.current
      if (currentRecorder.getStatus().isRecording) {
        void currentRecorder.stop()
      }
    } catch {
      // Recorder may already be idle.
    }
    try {
      recordingPlayerRef.current.pause()
    } catch {
      // Playback may already be idle.
    }
    clearTemporaryRecording()
    recordingStartedAtRef.current = undefined
    setPhase("ready")
    setPronunciationErrorMessage(undefined)
    setRecordingErrorMessage(undefined)
  }, [clearTemporaryRecording])

  const loadItems = useCallback(async () => {
    setIsLoading(true)
    setLoadProblem(undefined)
    resetPromptState()
    setCurrentIndex(0)

    const responses =
      groupIds.length > 0
        ? await Promise.all(
            groupIds.map((groupId) =>
              wordInsightApi.listLearningItemsByGroup(groupId, { limit: LISTEN_SAY_POOL_LIMIT }),
            ),
          )
        : [
            await wordInsightApi.listLearningItems({
              status: "active",
              limit: LISTEN_SAY_POOL_LIMIT,
            }),
          ]

    const failedResponse = responses.find((response) => response.kind !== "ok")
    if (failedResponse) {
      setLoadProblem(failedResponse)
      setItems([])
      setIsLoading(false)
      if (__DEV__) {
        console.warn("Listen & Say word load failed.", failedResponse)
      }
      return
    }

    const uniqueItems = new Map<string, WordInsightLearningItem>()
    responses.forEach((response) => {
      if (response.kind !== "ok") return
      response.data.forEach((item) => {
        if (item.status === "active" && !uniqueItems.has(item.id)) {
          uniqueItems.set(item.id, item)
        }
      })
    })

    setItems(shuffleLearningItems(Array.from(uniqueItems.values())).slice(0, LISTEN_SAY_LIMIT))
    setIsLoading(false)
  }, [groupIds, resetPromptState])

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  useEffect(
    () => () => {
      try {
        const currentRecorder = recorderRef.current
        if (currentRecorder.getStatus().isRecording) {
          void currentRecorder.stop()
        }
      } catch {
        // Recorder may already be idle.
      }
      try {
        recordingPlayerRef.current.pause()
      } catch {
        // Playback may already be idle.
      }
      void deleteTemporaryRecording(recordingUriRef.current)
      recordingUriRef.current = undefined
    },
    [],
  )

  const handlePlayPronunciation = useCallback(async () => {
    if (!currentItem) return

    setPronunciationErrorMessage(undefined)
    const result = await speakWord({
      word: currentItem.vocab,
      sourceLang: currentItem.sourceLang,
    })
    if (result === "failed") {
      setPronunciationErrorMessage(translate("vocabulary:listenSayPractice.pronunciationFailed"))
    }
  }, [currentItem])

  const handleStartRecording = useCallback(() => {
    if (!currentItem) return

    void (async () => {
      setPronunciationErrorMessage(undefined)
      setRecordingErrorMessage(undefined)
      recordingPlayerRef.current.pause()
      clearTemporaryRecording()

      const permissions = await requestRecordingPermissionsAsync()
      if (!permissions.granted) {
        setRecordingErrorMessage(translate("vocabulary:listenSayPractice.permissionDenied"))
        return
      }

      try {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
          ...ANDROID_RECORDING_AUDIO_MODE,
        })
        await recorder.prepareToRecordAsync()
        recorder.record()
        recordingStartedAtRef.current = Date.now()
        setPhase("recording")
      } catch {
        setPhase("ready")
        setRecordingErrorMessage(translate("vocabulary:listenSayPractice.recordingFailed"))
      }
    })()
  }, [clearTemporaryRecording, currentItem, recorder])

  const handleStopRecording = useCallback(() => {
    if (!currentItem) return

    void (async () => {
      const startedAt = recordingStartedAtRef.current
      const elapsed = startedAt ? Date.now() - startedAt : MIN_RECORDING_DURATION_MS
      if (elapsed < MIN_RECORDING_DURATION_MS) {
        await wait(MIN_RECORDING_DURATION_MS - elapsed)
      }

      try {
        await recorder.stop()
        const uri = recorder.uri ?? recorder.getStatus().url ?? undefined
        if (uri) {
          updateRecordingUri(uri)
          setRecordingErrorMessage(undefined)
          setPhase("review")
        } else {
          setPhase("review")
          setRecordingErrorMessage(translate("vocabulary:listenSayPractice.recordingFailed"))
        }
      } catch {
        setPhase("review")
        setRecordingErrorMessage(translate("vocabulary:listenSayPractice.recordingFailed"))
      } finally {
        recordingStartedAtRef.current = undefined
        try {
          await setAudioModeAsync(PLAYBACK_AUDIO_MODE)
        } catch {
          // Audio mode may already be reset by the platform.
        }
      }
    })()
  }, [currentItem, recorder, updateRecordingUri])

  const handlePlayRecording = useCallback(() => {
    if (!recordingUri) return

    void (async () => {
      if (recordingStatus.playing) {
        recordingPlayer.pause()
        return
      }

      try {
        await setAudioModeAsync(PLAYBACK_AUDIO_MODE)
      } catch {
        // Audio mode should not block local playback.
      }

      try {
        await recordingPlayer.seekTo(0)
      } catch {
        // Some platforms start from the beginning after source replacement.
      }
      recordingPlayer.play()
    })()
  }, [recordingPlayer, recordingStatus.playing, recordingUri])

  const moveToNextItem = useCallback(() => {
    resetPromptState()
    setCurrentIndex((index) => Math.min(index + 1, items.length))
  }, [items.length, resetPromptState])

  const handleRetryWord = useCallback(() => {
    resetPromptState()
  }, [resetPromptState])

  const handleSkipWord = useCallback(() => {
    moveToNextItem()
  }, [moveToNextItem])

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      backgroundColor={colors.vocabularyShowroom.background}
      contentContainerStyle={themed($screenContent)}
    >
      <View style={themed($header)}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={translate("common:back")}
          style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.vocabularyShowroom.textStrong}
          />
        </Pressable>
        <View style={themed($headerCopy)}>
          <Text
            tx="vocabulary:listenSayPractice.title"
            size="xl"
            weight="bold"
            style={themed($headerTitle)}
          />
          <Text text={progressLabel} size="xs" weight="bold" style={themed($headerMeta)} />
        </View>
        <View style={themed($headerSpacer)}>
          <AppTutorialVideoButton
            screen="vocabulary_listen_say_practice"
            placement="overview"
            variant="help"
            containerStyle={themed($iconButton)}
          />
        </View>
      </View>

      <Text tx="vocabulary:listenSayPractice.subtitle" size="sm" style={themed($sessionIntro)} />

      <AppTutorialVideoButton
        screen="vocabulary_listen_say_practice"
        placement="overview"
        variant="banner"
        hideAfterSeen
        containerStyle={{ marginBottom: theme.spacing.md }}
      />

      {isLoading ? (
        <View style={themed($stateCard)}>
          <ActivityIndicator color={colors.vocabularyShowroom.textStrong} />
          <Text
            tx="vocabulary:listenSayPractice.loadingTitle"
            size="lg"
            weight="bold"
            style={themed($stateTitle)}
          />
          <Text
            tx="vocabulary:listenSayPractice.loadingMessage"
            size="sm"
            style={themed($stateBody)}
          />
        </View>
      ) : loadProblem ? (
        <View style={themed($stateCard)}>
          <View style={themed($stateIcon)}>
            <MaterialCommunityIcons
              name="cloud-alert-outline"
              size={30}
              color={colors.vocabularyShowroom.textStrong}
            />
          </View>
          <Text text={resolveLoadErrorMessage(loadProblem)} size="sm" style={themed($stateBody)} />
          <Pressable
            onPress={() => void loadItems()}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:listenSayPractice.retryLoad")}
            style={({ pressed }) => [
              themed($primaryButton),
              pressed && themed($primaryButtonPressed),
            ]}
          >
            <Text
              tx="vocabulary:listenSayPractice.retryLoad"
              size="sm"
              weight="bold"
              style={themed($primaryButtonText)}
            />
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <View style={themed($stateCard)}>
          <View style={themed($stateIcon)}>
            <MaterialCommunityIcons
              name="playlist-remove"
              size={30}
              color={colors.vocabularyShowroom.textStrong}
            />
          </View>
          <Text
            tx="vocabulary:listenSayPractice.emptyTitle"
            size="lg"
            weight="bold"
            style={themed($stateTitle)}
          />
          <Text tx="vocabulary:listenSayPractice.emptyBody" size="sm" style={themed($stateBody)} />
          <Pressable
            onPress={() => navigation.navigate("VocabularyShowroomScreen")}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:listenSayPractice.backToList")}
            style={({ pressed }) => [
              themed($primaryButton),
              pressed && themed($primaryButtonPressed),
            ]}
          >
            <Text
              tx="vocabulary:listenSayPractice.backToList"
              size="sm"
              weight="bold"
              style={themed($primaryButtonText)}
            />
          </Pressable>
        </View>
      ) : isComplete ? (
        <View style={themed($stateCard)}>
          <View style={themed($stateIcon)}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={30}
              color={colors.vocabularyShowroom.textStrong}
            />
          </View>
          <Text
            tx="vocabulary:listenSayPractice.completeTitle"
            size="lg"
            weight="bold"
            style={themed($stateTitle)}
          />
          <Text
            text={translate("vocabulary:listenSayPractice.completeBody", {
              total: items.length,
            })}
            size="sm"
            style={themed($stateBody)}
          />
          <Pressable
            onPress={() => navigation.navigate("VocabularyPractice")}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:listenSayPractice.backToPractice")}
            style={({ pressed }) => [
              themed($primaryButton),
              pressed && themed($primaryButtonPressed),
            ]}
          >
            <Text
              tx="vocabulary:listenSayPractice.backToPractice"
              size="sm"
              weight="bold"
              style={themed($primaryButtonText)}
            />
          </Pressable>
        </View>
      ) : currentItem ? (
        <View style={themed($practiceCard)}>
          <View style={themed($cardTopRow)}>
            <Text
              tx="vocabulary:listenSayPractice.cardLabel"
              size="xs"
              weight="bold"
              style={themed($sectionMeta)}
            />
            <Text text={progressLabel} size="xs" weight="bold" style={themed($sectionMeta)} />
          </View>

          <View style={themed($wordPanel)}>
            <Text
              text={currentItem.vocab}
              size="xxl"
              weight="bold"
              style={themed($wordText)}
              numberOfLines={1}
              ellipsizeMode="tail"
              adjustsFontSizeToFit
              minimumFontScale={0.46}
            />
            <Pressable
              onPress={() => void handlePlayPronunciation()}
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:listenSayPractice.playPronunciation", {
                word: currentItem.vocab,
              })}
              style={({ pressed }) => [
                themed($pronunciationPill),
                pressed && themed($pronunciationPillPressed),
              ]}
            >
              <Text
                text={phonetic}
                size="sm"
                weight="medium"
                style={themed($pronunciationText)}
                numberOfLines={1}
                ellipsizeMode="tail"
                adjustsFontSizeToFit
                minimumFontScale={0.76}
              />
              <MaterialCommunityIcons
                name="volume-high"
                size={18}
                color={colors.vocabularyShowroom.textStrong}
              />
            </Pressable>
          </View>

          {pronunciationErrorMessage ? (
            <Text text={pronunciationErrorMessage} size="xs" style={themed($errorText)} />
          ) : null}

          <View style={themed($meaningPanel)}>
            <Text
              tx="vocabulary:listenSayPractice.meaningLabel"
              size="xs"
              weight="bold"
              style={themed($sectionMeta)}
            />
            <Text text={meaning} size="sm" weight="medium" style={themed($meaningText)} />
          </View>

          {phase === "recording" ? (
            <View style={themed($recordingPanel)}>
              <View style={themed($recordingIcon)}>
                <MaterialCommunityIcons
                  name="microphone-outline"
                  size={30}
                  color={colors.vocabularyShowroom.textStrong}
                />
              </View>
              <Text
                tx="vocabulary:listenSayPractice.recordingTitle"
                size="md"
                weight="bold"
                style={themed($recordingTitle)}
              />
              <Text
                tx="vocabulary:listenSayPractice.recordingBody"
                size="sm"
                style={themed($recordingBody)}
              />
              <Text
                text={`${Math.max(1, Math.ceil(recorderState.durationMillis / 1000))}s`}
                size="xs"
                weight="bold"
                style={themed($recordingDuration)}
              />
              <Pressable
                onPress={handleStopRecording}
                accessibilityRole="button"
                accessibilityLabel={translate("vocabulary:listenSayPractice.stopRecording")}
                style={({ pressed }) => [
                  themed($primaryButton),
                  themed($recordingStopButton),
                  pressed && themed($primaryButtonPressed),
                ]}
              >
                <Text
                  tx="vocabulary:listenSayPractice.stopRecording"
                  size="sm"
                  weight="bold"
                  style={themed($primaryButtonText)}
                />
              </Pressable>
            </View>
          ) : phase === "review" ? (
            <View style={themed($reviewPanel)}>
              <View style={themed($reviewIcon)}>
                <MaterialCommunityIcons
                  name="play-circle-outline"
                  size={30}
                  color={colors.vocabularyShowroom.textStrong}
                />
              </View>
              <Text
                tx="vocabulary:listenSayPractice.reviewTitle"
                size="md"
                weight="bold"
                style={themed($reviewTitle)}
              />
              <Text
                tx="vocabulary:listenSayPractice.reviewBody"
                size="sm"
                style={themed($reviewBody)}
              />

              {recordingErrorMessage ? (
                <Text text={recordingErrorMessage} size="xs" style={themed($errorText)} />
              ) : null}

              <View style={themed($playbackStack)}>
                <Pressable
                  onPress={handlePlayRecording}
                  disabled={!recordingUri}
                  accessibilityRole="button"
                  accessibilityLabel={translate("vocabulary:listenSayPractice.playRecording")}
                  style={({ pressed }) => [
                    themed($voicePlaybackButton),
                    !recordingUri && themed($buttonDisabled),
                    pressed && recordingUri && themed($voicePlaybackButtonPressed),
                  ]}
                >
                  <MaterialCommunityIcons
                    name={recordingStatus.playing ? "pause-circle-outline" : "play-circle-outline"}
                    size={22}
                    color={colors.vocabularyShowroom.background}
                  />
                  <Text
                    tx="vocabulary:listenSayPractice.playRecording"
                    size="sm"
                    weight="bold"
                    style={themed($primaryButtonText)}
                  />
                </Pressable>
                <Pressable
                  onPress={() => void handlePlayPronunciation()}
                  accessibilityRole="button"
                  accessibilityLabel={translate("vocabulary:listenSayPractice.listenAgain")}
                  style={({ pressed }) => [
                    themed($secondaryButton),
                    themed($wideSecondaryButton),
                    pressed && themed($secondaryButtonPressed),
                  ]}
                >
                  <MaterialCommunityIcons
                    name="volume-high"
                    size={18}
                    color={colors.vocabularyShowroom.textStrong}
                  />
                  <Text
                    tx="vocabulary:listenSayPractice.listenAgain"
                    size="sm"
                    weight="bold"
                    style={themed($secondaryButtonText)}
                  />
                </Pressable>
              </View>

              <View style={themed($reviewActions)}>
                <Pressable
                  onPress={handleRetryWord}
                  accessibilityRole="button"
                  accessibilityLabel={translate("vocabulary:listenSayPractice.recordAgain")}
                  style={({ pressed }) => [
                    themed($secondaryButton),
                    themed($wideSecondaryButton),
                    themed($repeatRecordingButton),
                    pressed && themed($secondaryButtonPressed),
                  ]}
                >
                  <MaterialCommunityIcons
                    name="microphone-outline"
                    size={20}
                    color={colors.vocabularyShowroom.textStrong}
                  />
                  <Text
                    tx="vocabulary:listenSayPractice.recordAgain"
                    size="sm"
                    weight="bold"
                    style={themed($secondaryButtonText)}
                  />
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              {recordingErrorMessage ? (
                <Text text={recordingErrorMessage} size="xs" style={themed($errorText)} />
              ) : null}
              <View style={themed($guidancePanel)}>
                <View style={themed($guidanceIcon)}>
                  <MaterialCommunityIcons
                    name="ear-hearing"
                    size={26}
                    color={colors.vocabularyShowroom.textStrong}
                  />
                </View>
                <View style={themed($guidanceCopy)}>
                  <Text
                    tx="vocabulary:listenSayPractice.readyHintTitle"
                    size="sm"
                    weight="bold"
                    style={themed($guidanceTitle)}
                  />
                  <Text
                    tx="vocabulary:listenSayPractice.readyHintBody"
                    size="xs"
                    style={themed($guidanceBody)}
                  />
                </View>
              </View>
              <View style={themed($readyActions)}>
                <Pressable
                  onPress={() => void handlePlayPronunciation()}
                  accessibilityRole="button"
                  accessibilityLabel={translate("vocabulary:listenSayPractice.listen")}
                  style={({ pressed }) => [
                    themed($secondaryButton),
                    themed($wideSecondaryButton),
                    pressed && themed($secondaryButtonPressed),
                  ]}
                >
                  <MaterialCommunityIcons
                    name="volume-high"
                    size={18}
                    color={colors.vocabularyShowroom.textStrong}
                  />
                  <Text
                    tx="vocabulary:listenSayPractice.listen"
                    size="sm"
                    weight="bold"
                    style={themed($secondaryButtonText)}
                  />
                </Pressable>
                <Pressable
                  onPress={handleStartRecording}
                  accessibilityRole="button"
                  accessibilityLabel={translate("vocabulary:listenSayPractice.recordWord")}
                  style={({ pressed }) => [
                    themed($primaryButton),
                    themed($widePrimaryButton),
                    pressed && themed($primaryButtonPressed),
                  ]}
                >
                  <MaterialCommunityIcons
                    name="microphone-outline"
                    size={18}
                    color={colors.vocabularyShowroom.background}
                  />
                  <Text
                    tx="vocabulary:listenSayPractice.recordWord"
                    size="sm"
                    weight="bold"
                    style={themed($primaryButtonText)}
                  />
                </Pressable>
              </View>
            </>
          )}

          <Pressable
            onPress={handleSkipWord}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:listenSayPractice.skipWord")}
            style={({ pressed }) => [themed($skipButton), pressed && themed($skipButtonPressed)]}
          >
            <Text
              tx="vocabulary:listenSayPractice.skipWord"
              size="xs"
              weight="bold"
              style={themed($skipButtonText)}
            />
          </Pressable>
        </View>
      ) : null}
    </Screen>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.xxl,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.sm,
  marginBottom: spacing.lg,
})

const $iconButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 54,
  height: 54,
  borderRadius: 27,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $iconButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $headerCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
  alignItems: "center",
})

const $headerTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $headerMeta: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.vocabularyShowroom.textMuted,
  marginTop: spacing.xxxs,
})

const $headerSpacer: ThemedStyle<ViewStyle> = () => ({
  width: 54,
  height: 54,
})

const $sessionIntro: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginBottom: spacing.lg,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
  lineHeight: 21,
})

const $stateCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 380,
  borderRadius: 24,
  padding: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  gap: spacing.md,
})

const $stateIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 64,
  height: 64,
  borderRadius: 22,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $stateTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $stateBody: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
  lineHeight: 22,
})

const $practiceCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 24,
  padding: spacing.lg,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  gap: spacing.md,
})

const $cardTopRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
})

const $sectionMeta: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
  textTransform: "uppercase",
})

const $wordPanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 172,
  borderRadius: 22,
  padding: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  gap: spacing.sm,
})

const $wordText: ThemedStyle<TextStyle> = ({ colors }) => ({
  width: "100%",
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $pronunciationPill: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  maxWidth: "100%",
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.md,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $pronunciationPillPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $pronunciationText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  flexShrink: 1,
  fontFamily: Platform.select({
    android: typography.secondary?.medium ?? typography.primary.medium,
    default: typography.primary.medium,
  }),
  includeFontPadding: false,
  color: colors.vocabularyShowroom.textStrong,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.dangerText,
  textAlign: "center",
})

const $meaningPanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 18,
  padding: spacing.md,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.detailDivider,
  gap: spacing.xs,
})

const $meaningText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  lineHeight: 22,
})

const $recordingPanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 22,
  padding: spacing.lg,
  alignItems: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  gap: spacing.sm,
})

const $recordingIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 72,
  height: 72,
  borderRadius: 36,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
  borderWidth: 2,
  borderColor: colors.vocabularyShowroom.accent,
})

const $recordingTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $recordingBody: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
  lineHeight: 22,
})

const $recordingDuration: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $recordingStopButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $reviewPanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 22,
  padding: spacing.lg,
  alignItems: "stretch",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  gap: spacing.sm,
})

const $reviewIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 64,
  height: 64,
  borderRadius: 32,
  alignSelf: "center",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $reviewTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $reviewBody: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
  lineHeight: 22,
})

const $playbackStack: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
  marginTop: spacing.xs,
})

const $reviewActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
  marginTop: spacing.sm,
})

const $guidancePanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  borderRadius: 18,
  padding: spacing.md,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  gap: spacing.sm,
})

const $guidanceIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 54,
  height: 54,
  borderRadius: 27,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $guidanceCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 0,
})

const $guidanceTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
})

const $guidanceBody: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.vocabularyShowroom.textMuted,
  lineHeight: 19,
  marginTop: spacing.xxxs,
})

const $readyActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $primaryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 54,
  borderRadius: 27,
  paddingHorizontal: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  gap: spacing.xs,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $primaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $primaryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.background,
  textAlign: "center",
})

const $secondaryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 54,
  borderRadius: 27,
  paddingHorizontal: spacing.md,
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  gap: spacing.xs,
  flex: 1,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $secondaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $buttonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.48,
})

const $secondaryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $wideSecondaryButton: ThemedStyle<ViewStyle> = () => ({
  flex: 0,
  width: "100%",
})

const $widePrimaryButton: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
})

const $voicePlaybackButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 62,
  borderRadius: 31,
  paddingHorizontal: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  gap: spacing.xs,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $voicePlaybackButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accentPressed,
})

const $repeatRecordingButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 62,
  paddingHorizontal: spacing.lg,
})

const $skipButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignSelf: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
})

const $skipButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderRadius: 999,
})

const $skipButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})
