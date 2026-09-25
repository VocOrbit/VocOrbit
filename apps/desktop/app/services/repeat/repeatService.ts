import { Platform } from "react-native"

import type { VocabularyEntry } from "@/screens/VocabularyShowroom/types"
import { translate } from "@/i18n/translate"
import {
  focusMainVocOrbit,
  invokeDesktopCommand,
  isDesktopShellRuntime,
} from "@/services/desktop/desktopQuickLookupBridge"
import { load, save } from "@/utils/storage"

export type RepeatToggleResult = "added" | "removed" | "limit-reached" | "permission-denied"
export type RepeatReviewGrade = "forgot" | "hard" | "good"
export type RepeatReviewResult = "updated" | "not-found"

export type RepeatWordItem = {
  id: string
  word: string
  translation?: string
  addedAt: string
}

export type RepeatProgressItem = {
  entryId: string
  step: number
  hardCycleIndex: number
  goodCycleIndex: number
  dueAt: string
  streak: number
  lastReviewedAt?: string
  notificationId?: string
  createdAt: string
  updatedAt: string
}

export type RepeatState = {
  words: RepeatWordItem[]
  progressById: Record<string, RepeatProgressItem>
}

export type RepeatWordLimit = number | undefined
type RepeatWordLimitOptions = {
  limit?: number
  unlimited?: boolean
}

type NotificationsModule = {
  AndroidImportance?: {
    DEFAULT?: number
  }
  setNotificationHandler?: (handler: {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean
      shouldPlaySound: boolean
      shouldSetBadge: boolean
    }>
  }) => void
  setNotificationChannelAsync?: (channelId: string, channel: Record<string, unknown>) => Promise<void>
  getPermissionsAsync?: () => Promise<Record<string, unknown>>
  requestPermissionsAsync?: () => Promise<Record<string, unknown>>
  scheduleNotificationAsync?: (request: Record<string, unknown>) => Promise<string>
  cancelScheduledNotificationAsync?: (notificationId: string) => Promise<void>
  addNotificationResponseReceivedListener?: (
    listener: (response: Record<string, unknown>) => void,
  ) => { remove: () => void }
  getLastNotificationResponseAsync?: () => Promise<Record<string, unknown> | null>
}

const REPEAT_WORD_FREE_LIMIT = 10
const REPEAT_WORDS_STORAGE_KEY_PREFIX = "VocabularyShowroom.repeatWords"
const REPEAT_PROGRESS_STORAGE_KEY_PREFIX = "VocabularyShowroom.repeatProgress"
const REPEAT_NOTIFICATION_TYPE = "repeat_review"
const REPEAT_NOTIFICATION_CHANNEL_ID = "repeat-reminders"
const REPEAT_STEP_INTERVALS_MINUTES = [10, 60, 360, 1440, 4320, 10080, 20160, 720]
const REPEAT_FIXED_FORGOT_STEP = 0
const REPEAT_HARD_PROGRESS_STEPS = [1, 2, 7]
const REPEAT_GOOD_PROGRESS_STEPS = [3, 4, 5, 6]

let notificationsConfigured = false
let notificationsModuleMissingWarningShown = false
const handledResponseIds = new Set<string>()
const webScheduledNotificationTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
const webActiveNotifications = new Map<string, Notification>()
const webNotificationResponseListeners = new Set<(response: Record<string, unknown>) => void>()
let webNotificationSequence = 0

function areDesktopRepeatNotificationsDisabled(): boolean {
  return Platform.OS === "web" && isDesktopShellRuntime()
}

function hasWebNotificationSupport(): boolean {
  return (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    typeof Notification !== "undefined"
  )
}

function createWebPermissionStatus(permission: NotificationPermission): Record<string, unknown> {
  return {
    granted: permission === "granted",
    status: permission,
    canAskAgain: permission !== "denied",
  }
}

function buildWebNotificationResponse(entryId: string, identifier: string): Record<string, unknown> {
  return {
    notification: {
      request: {
        identifier,
        content: {
          data: {
            type: REPEAT_NOTIFICATION_TYPE,
            entryId,
          },
        },
      },
    },
  }
}

function emitWebNotificationResponse(entryId: string, identifier: string): void {
  const response = buildWebNotificationResponse(entryId, identifier)
  for (const listener of webNotificationResponseListeners) {
    listener(response)
  }
}

async function focusAppAfterWebNotificationClick(): Promise<void> {
  if (isDesktopShellRuntime()) {
    await focusMainVocOrbit()
    return
  }

  if (typeof window !== "undefined") {
    window.focus()
  }
}

function getWebNotificationsModule(): NotificationsModule | undefined {
  if (areDesktopRepeatNotificationsDisabled()) return undefined
  if (!hasWebNotificationSupport()) return undefined

  return {
    getPermissionsAsync: async () => createWebPermissionStatus(Notification.permission),
    requestPermissionsAsync: async () => {
      const permission =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission

      return createWebPermissionStatus(permission)
    },
    scheduleNotificationAsync: async (request) => {
      const payload = request as Record<string, unknown>
      const content =
        typeof payload.content === "object" && payload.content !== null
          ? (payload.content as Record<string, unknown>)
          : {}
      const trigger =
        typeof payload.trigger === "object" && payload.trigger !== null
          ? (payload.trigger as Record<string, unknown>)
          : {}
      const dueDate = new Date(trigger.date as string | number | Date)
      const dueAt = Number.isNaN(dueDate.getTime()) ? Date.now() : dueDate.getTime()
      const identifier = `repeat-web-${Date.now()}-${++webNotificationSequence}`
      const delayMs = Math.max(dueAt - Date.now(), 0)

      const timeoutId = setTimeout(() => {
        webScheduledNotificationTimeouts.delete(identifier)

        if (!hasWebNotificationSupport() || Notification.permission !== "granted") {
          return
        }

        const title =
          typeof content.title === "string" && content.title.trim().length > 0
            ? content.title.trim()
            : translate("vocabulary:detail.repeatNotificationTitle", { word: "" }).trim()
        const body =
          typeof content.body === "string" && content.body.trim().length > 0
            ? content.body.trim()
            : ""
        const data =
          typeof content.data === "object" && content.data !== null
            ? (content.data as Record<string, unknown>)
            : {}
        const entryId = typeof data.entryId === "string" ? data.entryId.trim() : ""

        try {
          const notification = new Notification(title, {
            body,
            data,
          })

          webActiveNotifications.set(identifier, notification)

          notification.onclick = () => {
            notification.close()
            webActiveNotifications.delete(identifier)

            if (entryId) {
              emitWebNotificationResponse(entryId, identifier)
            }

            void focusAppAfterWebNotificationClick()
          }

          notification.onclose = () => {
            webActiveNotifications.delete(identifier)
          }
        } catch (error) {
          if (__DEV__) {
            console.warn("Failed to display web repeat notification.", error)
          }
        }
      }, delayMs)

      webScheduledNotificationTimeouts.set(identifier, timeoutId)
      return identifier
    },
    cancelScheduledNotificationAsync: async (notificationId: string) => {
      const timeoutId = webScheduledNotificationTimeouts.get(notificationId)
      if (timeoutId) {
        clearTimeout(timeoutId)
        webScheduledNotificationTimeouts.delete(notificationId)
      }

      const notification = webActiveNotifications.get(notificationId)
      if (notification) {
        notification.close()
        webActiveNotifications.delete(notificationId)
      }
    },
    addNotificationResponseReceivedListener: (listener) => {
      webNotificationResponseListeners.add(listener)

      return {
        remove: () => {
          webNotificationResponseListeners.delete(listener)
        },
      }
    },
    getLastNotificationResponseAsync: async () => null,
  }
}

function resolveRepeatWordLimit(options?: RepeatWordLimitOptions): RepeatWordLimit {
  if (options?.unlimited) return undefined

  const rawLimit = options?.limit ?? REPEAT_WORD_FREE_LIMIT
  if (!Number.isFinite(rawLimit)) return undefined

  const normalizedLimit = Math.floor(rawLimit)
  if (normalizedLimit <= 0) return undefined
  return normalizedLimit
}

export function getRepeatWordLimit(options?: RepeatWordLimitOptions): RepeatWordLimit {
  return resolveRepeatWordLimit(options)
}

function buildRepeatWordsStorageKey(userId?: string): string {
  return userId?.trim()
    ? `${REPEAT_WORDS_STORAGE_KEY_PREFIX}.${userId.trim()}`
    : `${REPEAT_WORDS_STORAGE_KEY_PREFIX}.anonymous`
}

function buildRepeatProgressStorageKey(userId?: string): string {
  return userId?.trim()
    ? `${REPEAT_PROGRESS_STORAGE_KEY_PREFIX}.${userId.trim()}`
    : `${REPEAT_PROGRESS_STORAGE_KEY_PREFIX}.anonymous`
}

function getNotificationsModule(): NotificationsModule | undefined {
  const webNotifications = getWebNotificationsModule()
  if (webNotifications) {
    return webNotifications
  }

  try {
    return require("expo-notifications") as NotificationsModule
  } catch {
    if (__DEV__ && !notificationsModuleMissingWarningShown) {
      notificationsModuleMissingWarningShown = true
      console.warn("expo-notifications not installed. Repeat notifications are disabled.")
    }
    return undefined
  }
}

async function ensureNotificationsConfigured(): Promise<void> {
  const Notifications = getNotificationsModule()
  if (!Notifications || notificationsConfigured) return

  notificationsConfigured = true

  Notifications.setNotificationHandler?.({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync?.(REPEAT_NOTIFICATION_CHANNEL_ID, {
      name: "Repeat reminders",
      importance: Notifications.AndroidImportance?.DEFAULT ?? 3,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
    })
  }
}

function isNotificationPermissionGranted(status: Record<string, unknown> | null | undefined): boolean {
  if (!status) return false
  if (status.granted === true) return true

  const ios = status.ios
  if (typeof ios === "object" && ios !== null) {
    const iosStatus = (ios as Record<string, unknown>).status
    if (iosStatus === 2 || iosStatus === 3 || iosStatus === 4) return true
  }

  return false
}

export async function ensureRepeatNotificationPermission(): Promise<boolean> {
  if (areDesktopRepeatNotificationsDisabled()) {
    return true
  }

  const Notifications = getNotificationsModule()
  if (!Notifications) return false

  await ensureNotificationsConfigured()

  const existing = await Notifications.getPermissionsAsync?.()
  if (isNotificationPermissionGranted(existing)) {
    return true
  }

  const requested = await Notifications.requestPermissionsAsync?.()
  return isNotificationPermissionGranted(requested)
}

async function hasRepeatNotificationPermission(): Promise<boolean> {
  if (areDesktopRepeatNotificationsDisabled()) {
    return false
  }

  const Notifications = getNotificationsModule()
  if (!Notifications) return false

  await ensureNotificationsConfigured()
  const existing = await Notifications.getPermissionsAsync?.()
  return isNotificationPermissionGranted(existing)
}

function parseIsoDateOrNow(value: unknown): Date {
  if (typeof value !== "string") return new Date()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function computeDueDate(step: number, from: Date): Date {
  const normalizedStep = Math.max(0, Math.min(step, REPEAT_STEP_INTERVALS_MINUTES.length - 1))
  const minutes = REPEAT_STEP_INTERVALS_MINUTES[normalizedStep] ?? REPEAT_STEP_INTERVALS_MINUTES[0]
  return new Date(from.getTime() + minutes * 60 * 1000)
}

export function formatRepeatIntervalLabel(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return translate("vocabulary:detail.repeatAfterMinutes", { count: totalMinutes })
  }

  const totalHours = totalMinutes / 60
  if (totalHours < 24) {
    const hours = Math.round(totalHours)
    return translate("vocabulary:detail.repeatAfterHours", { count: hours })
  }

  const totalDays = totalHours / 24
  if (totalDays < 7) {
    const days = Math.round(totalDays)
    return translate("vocabulary:detail.repeatAfterDays", { count: days })
  }

  const weeks = Math.round(totalDays / 7)
  return translate("vocabulary:detail.repeatAfterWeeks", { count: weeks })
}

export function getRepeatReviewDelayMinutes(
  progress: RepeatProgressItem | undefined,
  grade: RepeatReviewGrade,
): number {
  const nextStep = deriveReviewStep(progress, grade).step
  return REPEAT_STEP_INTERVALS_MINUTES[nextStep] ?? REPEAT_STEP_INTERVALS_MINUTES[0]
}

function normalizeRepeatWords(raw: unknown): RepeatWordItem[] {
  if (!Array.isArray(raw)) return []

  const byId = new Map<string, RepeatWordItem>()
  for (const item of raw) {
    if (typeof item === "string") {
      const trimmedId = item.trim()
      if (!trimmedId || byId.has(trimmedId)) continue
      byId.set(trimmedId, {
        id: trimmedId,
        word: trimmedId,
        addedAt: new Date().toISOString(),
      })
      continue
    }

    if (typeof item !== "object" || item === null) continue
    const record = item as Record<string, unknown>
    const id = typeof record.id === "string" ? record.id.trim() : ""
    if (!id || byId.has(id)) continue

    const word = typeof record.word === "string" && record.word.trim().length > 0 ? record.word.trim() : id
    const translation =
      typeof record.translation === "string" && record.translation.trim().length > 0
        ? record.translation.trim()
        : undefined
    const addedAt =
      typeof record.addedAt === "string" && record.addedAt.trim().length > 0
        ? record.addedAt.trim()
        : new Date().toISOString()

    byId.set(id, {
      id,
      word,
      translation,
      addedAt,
    })
  }

  return Array.from(byId.values())
}

function normalizeRepeatProgress(raw: unknown): Record<string, RepeatProgressItem> {
  if (typeof raw !== "object" || raw === null) return {}

  const input = raw as Record<string, unknown>
  const normalized: Record<string, RepeatProgressItem> = {}
  const nowIso = new Date().toISOString()

  for (const [entryId, value] of Object.entries(input)) {
    if (typeof entryId !== "string" || entryId.trim().length === 0) continue
    if (typeof value !== "object" || value === null) continue
    const record = value as Record<string, unknown>

    const stepRaw = typeof record.step === "number" ? record.step : 0
    const step = Math.max(0, Math.min(Math.floor(stepRaw), REPEAT_STEP_INTERVALS_MINUTES.length - 1))
    const hardCycleIndexRaw = typeof record.hardCycleIndex === "number" ? record.hardCycleIndex : undefined
    const goodCycleIndexRaw = typeof record.goodCycleIndex === "number" ? record.goodCycleIndex : undefined

    const dueAt = typeof record.dueAt === "string" ? record.dueAt : computeDueDate(step, new Date()).toISOString()
    const streak = typeof record.streak === "number" ? Math.max(0, Math.floor(record.streak)) : 0
    const lastReviewedAt =
      typeof record.lastReviewedAt === "string" && record.lastReviewedAt.trim().length > 0
        ? record.lastReviewedAt.trim()
        : undefined
    const notificationId =
      typeof record.notificationId === "string" && record.notificationId.trim().length > 0
        ? record.notificationId.trim()
        : undefined
    const createdAt =
      typeof record.createdAt === "string" && record.createdAt.trim().length > 0
        ? record.createdAt.trim()
        : nowIso
    const updatedAt =
      typeof record.updatedAt === "string" && record.updatedAt.trim().length > 0
        ? record.updatedAt.trim()
        : nowIso
    const resolvedState = resolveReviewState({
      step,
      hardCycleIndex: normalizeCycleIndex(hardCycleIndexRaw, REPEAT_HARD_PROGRESS_STEPS.length),
      goodCycleIndex: normalizeCycleIndex(goodCycleIndexRaw, REPEAT_GOOD_PROGRESS_STEPS.length),
    })

    normalized[entryId] = {
      entryId,
      step: resolvedState.step,
      hardCycleIndex: resolvedState.hardCycleIndex,
      goodCycleIndex: resolvedState.goodCycleIndex,
      dueAt,
      streak,
      lastReviewedAt,
      notificationId,
      createdAt,
      updatedAt,
    }
  }

  return normalized
}

function persistRepeatState(userId: string | undefined, state: RepeatState): void {
  save(buildRepeatWordsStorageKey(userId), state.words)
  save(buildRepeatProgressStorageKey(userId), state.progressById)
}

function createInitialProgress(entryId: string, now = new Date()): RepeatProgressItem {
  const nowIso = now.toISOString()
  return {
    entryId,
    step: 0,
    hardCycleIndex: -1,
    goodCycleIndex: -1,
    dueAt: computeDueDate(0, now).toISOString(),
    streak: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  }
}

function clampRepeatStep(step: number): number {
  return Math.max(0, Math.min(step, REPEAT_STEP_INTERVALS_MINUTES.length - 1))
}

function normalizeCycleIndex(index: number | undefined, sequenceLength: number): number {
  if (typeof index !== "number" || !Number.isFinite(index)) return -1
  const floored = Math.floor(index)
  if (floored < -1) return -1
  if (floored >= sequenceLength) return sequenceLength - 1
  return floored
}

function inferCycleIndexFromStep(step: number, sequence: number[]): number {
  const index = sequence.indexOf(step)
  return index >= 0 ? index : -1
}

type RepeatReviewState = {
  step: number
  hardCycleIndex: number
  goodCycleIndex: number
}

function resolveReviewState(progress: RepeatProgressItem | RepeatReviewState | undefined): RepeatReviewState {
  const normalizedStep = clampRepeatStep(progress?.step ?? 0)
  const hardCycleIndex = normalizeCycleIndex(progress?.hardCycleIndex, REPEAT_HARD_PROGRESS_STEPS.length)
  const goodCycleIndex = normalizeCycleIndex(progress?.goodCycleIndex, REPEAT_GOOD_PROGRESS_STEPS.length)

  return {
    step: normalizedStep,
    hardCycleIndex:
      hardCycleIndex >= 0 ? hardCycleIndex : inferCycleIndexFromStep(normalizedStep, REPEAT_HARD_PROGRESS_STEPS),
    goodCycleIndex:
      goodCycleIndex >= 0 ? goodCycleIndex : inferCycleIndexFromStep(normalizedStep, REPEAT_GOOD_PROGRESS_STEPS),
  }
}

function deriveNextHardCycleIndex(previousHardCycleIndex: number): number {
  if (previousHardCycleIndex < 0) return 0
  return (previousHardCycleIndex + 1) % REPEAT_HARD_PROGRESS_STEPS.length
}

function deriveNextGoodCycleIndex(previousGoodCycleIndex: number): number {
  if (previousGoodCycleIndex < 0) return 0
  return (previousGoodCycleIndex + 1) % REPEAT_GOOD_PROGRESS_STEPS.length
}

function deriveReviewStep(previous: RepeatProgressItem | RepeatReviewState | undefined, grade: RepeatReviewGrade): RepeatReviewState {
  const current = resolveReviewState(previous)

  if (grade === "forgot") {
    return {
      step: REPEAT_FIXED_FORGOT_STEP,
      hardCycleIndex: -1,
      goodCycleIndex: -1,
    }
  }

  if (grade === "hard") {
    const nextHardCycleIndex = deriveNextHardCycleIndex(current.hardCycleIndex)
    const nextStep = REPEAT_HARD_PROGRESS_STEPS[nextHardCycleIndex] ?? (REPEAT_HARD_PROGRESS_STEPS[0] ?? 1)
    return {
      step: nextStep,
      hardCycleIndex: nextHardCycleIndex,
      goodCycleIndex: current.goodCycleIndex,
    }
  }

  if (grade === "good") {
    const nextGoodCycleIndex = deriveNextGoodCycleIndex(current.goodCycleIndex)
    const nextStep = REPEAT_GOOD_PROGRESS_STEPS[nextGoodCycleIndex] ?? (REPEAT_GOOD_PROGRESS_STEPS[0] ?? 3)
    return {
      step: nextStep,
      hardCycleIndex: current.hardCycleIndex,
      goodCycleIndex: nextGoodCycleIndex,
    }
  }

  return current
}

function parseEntryIdFromNotificationResponse(response: Record<string, unknown>): string | undefined {
  const notification = response.notification
  if (typeof notification !== "object" || notification === null) return undefined
  const request = (notification as Record<string, unknown>).request
  if (typeof request !== "object" || request === null) return undefined

  const rawIdentifier = (request as Record<string, unknown>).identifier
  if (typeof rawIdentifier === "string" && rawIdentifier.length > 0) {
    if (handledResponseIds.has(rawIdentifier)) return undefined
    handledResponseIds.add(rawIdentifier)
  }

  const content = (request as Record<string, unknown>).content
  if (typeof content !== "object" || content === null) return undefined
  const data = (content as Record<string, unknown>).data
  if (typeof data !== "object" || data === null) return undefined

  const payload = data as Record<string, unknown>
  if (payload.type !== REPEAT_NOTIFICATION_TYPE) return undefined
  if (typeof payload.entryId !== "string") return undefined

  const entryId = payload.entryId.trim()
  return entryId.length > 0 ? entryId : undefined
}

async function cancelNotificationById(notificationId?: string): Promise<void> {
  if (!notificationId) return

  if (areDesktopRepeatNotificationsDisabled()) {
    try {
      await invokeDesktopCommand("cancel_repeat_notification", {
        notificationId,
      })
    } catch {
      // no-op
    }
    return
  }

  const Notifications = getNotificationsModule()
  if (!Notifications) return
  try {
    await Notifications.cancelScheduledNotificationAsync?.(notificationId)
  } catch {
    // no-op
  }
}

async function scheduleNotificationForWord(
  word: RepeatWordItem,
  progress: RepeatProgressItem,
  options?: {
    requestPermission?: boolean
  },
): Promise<string | undefined> {
  if (areDesktopRepeatNotificationsDisabled()) {
    return undefined
  }

  const Notifications = getNotificationsModule()
  if (!Notifications) return undefined

  const hasPermission =
    options?.requestPermission === false
      ? await hasRepeatNotificationPermission()
      : await ensureRepeatNotificationPermission()
  if (!hasPermission) return undefined

  const dueDate = parseIsoDateOrNow(progress.dueAt)
  if (dueDate.getTime() <= Date.now()) {
    dueDate.setTime(Date.now() + 15 * 1000)
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync?.({
      content: {
        title: translate("vocabulary:detail.repeatNotificationTitle", { word: word.word }),
        body: translate("vocabulary:detail.repeatNotificationBody", { word: word.word }),
        sound: true,
        data: {
          type: REPEAT_NOTIFICATION_TYPE,
          entryId: word.id,
        },
      },
      trigger: {
        type: "date",
        date: dueDate,
        ...(Platform.OS === "android" ? { channelId: REPEAT_NOTIFICATION_CHANNEL_ID } : {}),
      },
    })

    return notificationId
  } catch (error) {
    if (__DEV__) {
      console.warn("Failed to schedule repeat notification.", error)
    }
    return undefined
  }
}

function createRepeatState(rawWords: unknown, rawProgress: unknown): RepeatState {
  const words = normalizeRepeatWords(rawWords)
  const progressById = normalizeRepeatProgress(rawProgress)

  const filteredProgress: Record<string, RepeatProgressItem> = {}
  for (const word of words) {
    const existing = progressById[word.id]
    filteredProgress[word.id] = existing ?? createInitialProgress(word.id, parseIsoDateOrNow(word.addedAt))
  }

  return {
    words,
    progressById: filteredProgress,
  }
}

export function loadRepeatState(userId?: string): RepeatState {
  const rawWords = load<unknown>(buildRepeatWordsStorageKey(userId))
  const rawProgress = load<unknown>(buildRepeatProgressStorageKey(userId))
  const state = createRepeatState(rawWords, rawProgress)
  persistRepeatState(userId, state)
  return state
}

export async function syncRepeatNotificationSchedules(userId?: string): Promise<RepeatState> {
  const state = loadRepeatState(userId)
  if (state.words.length === 0) return state

  if (areDesktopRepeatNotificationsDisabled()) {
    let hasChanges = false
    const nextProgressById: Record<string, RepeatProgressItem> = { ...state.progressById }

    for (const word of state.words) {
      const currentProgress =
        nextProgressById[word.id] ?? createInitialProgress(word.id, parseIsoDateOrNow(word.addedAt))

      if (currentProgress.notificationId) {
        await cancelNotificationById(currentProgress.notificationId)
        hasChanges = true
      }

      nextProgressById[word.id] = {
        ...currentProgress,
        notificationId: undefined,
      }
    }

    if (!hasChanges) return state

    const nextState: RepeatState = {
      words: state.words,
      progressById: nextProgressById,
    }
    persistRepeatState(userId, nextState)
    return nextState
  }

  const hasPermission = await hasRepeatNotificationPermission()
  if (!hasPermission) return state

  let hasChanges = false
  const nextProgressById: Record<string, RepeatProgressItem> = { ...state.progressById }

  for (const word of state.words) {
    const currentProgress =
      nextProgressById[word.id] ?? createInitialProgress(word.id, parseIsoDateOrNow(word.addedAt))

    await cancelNotificationById(currentProgress.notificationId)
    const nextNotificationId = await scheduleNotificationForWord(word, currentProgress, {
      requestPermission: false,
    })

    if (currentProgress.notificationId !== nextNotificationId) {
      hasChanges = true
    }

    nextProgressById[word.id] = {
      ...currentProgress,
      notificationId: nextNotificationId,
    }
  }

  if (!hasChanges) return state

  const nextState: RepeatState = {
    words: state.words,
    progressById: nextProgressById,
  }
  persistRepeatState(userId, nextState)
  return nextState
}

export function getRepeatProgressForEntry(userId: string | undefined, entryId: string): RepeatProgressItem | undefined {
  const state = loadRepeatState(userId)
  return state.progressById[entryId]
}

export async function toggleRepeatWord(
  userId: string | undefined,
  entry: VocabularyEntry,
  options?: RepeatWordLimitOptions,
): Promise<{ result: RepeatToggleResult; state: RepeatState }> {
  const state = loadRepeatState(userId)
  const repeatWordLimit = resolveRepeatWordLimit(options)
  const wordId = entry.id.trim()
  if (!wordId) {
    return { result: "removed", state }
  }

  const existingWord = state.words.find((item) => item.id === wordId)
  if (existingWord) {
    const progress = state.progressById[wordId]
    await cancelNotificationById(progress?.notificationId)

    const nextWords = state.words.filter((item) => item.id !== wordId)
    const nextProgress = { ...state.progressById }
    delete nextProgress[wordId]

    const nextState: RepeatState = {
      words: nextWords,
      progressById: nextProgress,
    }
    persistRepeatState(userId, nextState)
    return { result: "removed", state: nextState }
  }

  if (typeof repeatWordLimit === "number" && state.words.length >= repeatWordLimit) {
    return { result: "limit-reached", state }
  }

  const hasNotificationPermission = await ensureRepeatNotificationPermission()
  if (!hasNotificationPermission) {
    return { result: "permission-denied", state }
  }

  const nextWord: RepeatWordItem = {
    id: wordId,
    word: entry.word,
    translation: entry.definition,
    addedAt: new Date().toISOString(),
  }
  const nextProgress = createInitialProgress(wordId)
  const notificationId = await scheduleNotificationForWord(nextWord, nextProgress)

  const nextState: RepeatState = {
    words: [...state.words, nextWord],
    progressById: {
      ...state.progressById,
      [wordId]: {
        ...nextProgress,
        notificationId,
      },
    },
  }
  persistRepeatState(userId, nextState)
  return { result: "added", state: nextState }
}

export async function clearRepeatWords(userId: string | undefined): Promise<RepeatState> {
  const state = loadRepeatState(userId)
  await Promise.all(
    Object.values(state.progressById).map((progress) => cancelNotificationById(progress.notificationId)),
  )

  const nextState: RepeatState = {
    words: [],
    progressById: {},
  }
  persistRepeatState(userId, nextState)
  return nextState
}

export async function removeRepeatWord(
  userId: string | undefined,
  entryId: string,
): Promise<RepeatState> {
  const state = loadRepeatState(userId)
  const normalizedId = entryId.trim()
  if (!normalizedId) return state

  const progress = state.progressById[normalizedId]
  await cancelNotificationById(progress?.notificationId)

  const nextState: RepeatState = {
    words: state.words.filter((word) => word.id !== normalizedId),
    progressById: Object.fromEntries(
      Object.entries(state.progressById).filter(([key]) => key !== normalizedId),
    ),
  }
  persistRepeatState(userId, nextState)
  return nextState
}

export async function reviewRepeatWord(
  userId: string | undefined,
  entryId: string,
  grade: RepeatReviewGrade,
): Promise<{ result: RepeatReviewResult; state: RepeatState; progress?: RepeatProgressItem }> {
  const state = loadRepeatState(userId)
  const word = state.words.find((item) => item.id === entryId)
  if (!word) {
    return { result: "not-found", state }
  }

  const previous = state.progressById[entryId] ?? createInitialProgress(entryId)
  await cancelNotificationById(previous.notificationId)

  const now = new Date()
  const nextReviewState = deriveReviewStep(previous, grade)
  const nextStep = nextReviewState.step
  const nextDueAt = computeDueDate(nextStep, now).toISOString()
  const nextProgress: RepeatProgressItem = {
    ...previous,
    step: nextStep,
    hardCycleIndex: nextReviewState.hardCycleIndex,
    goodCycleIndex: nextReviewState.goodCycleIndex,
    dueAt: nextDueAt,
    lastReviewedAt: now.toISOString(),
    streak: grade === "forgot" ? 0 : previous.streak + 1,
    updatedAt: now.toISOString(),
  }

  const notificationId = await scheduleNotificationForWord(word, nextProgress)
  const resolvedProgress: RepeatProgressItem = {
    ...nextProgress,
    notificationId,
  }

  const nextState: RepeatState = {
    words: state.words,
    progressById: {
      ...state.progressById,
      [entryId]: resolvedProgress,
    },
  }
  persistRepeatState(userId, nextState)
  return {
    result: "updated",
    state: nextState,
    progress: resolvedProgress,
  }
}

export function formatRepeatDueLabel(dueAtIso?: string): string {
  if (!dueAtIso) return translate("vocabulary:detail.repeatUnscheduled")
  const dueDate = parseIsoDateOrNow(dueAtIso)
  const diffMs = dueDate.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / (60 * 1000))

  if (diffMinutes <= 0) return translate("vocabulary:detail.repeatNow")
  if (diffMinutes < 60) {
    return translate("vocabulary:detail.repeatInMinutes", { count: diffMinutes })
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) {
    return translate("vocabulary:detail.repeatInHours", { count: diffHours })
  }

  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) {
    return translate("vocabulary:detail.repeatInDays", { count: diffDays })
  }

  const diffWeeks = Math.round(diffDays / 7)
  return translate("vocabulary:detail.repeatInWeeks", { count: diffWeeks })
}

export async function registerRepeatNotificationOpenListener(
  onOpen: (entryId: string) => void,
): Promise<() => void> {
  if (areDesktopRepeatNotificationsDisabled()) {
    return () => {}
  }

  const Notifications = getNotificationsModule()
  if (!Notifications) return () => {}

  await ensureNotificationsConfigured()

  const subscription = Notifications.addNotificationResponseReceivedListener?.((response) => {
    const entryId = parseEntryIdFromNotificationResponse(response)
    if (!entryId) return
    onOpen(entryId)
  })

  return () => {
    subscription?.remove()
  }
}

export async function consumeLastRepeatNotificationOpen(
  onOpen: (entryId: string) => void,
): Promise<void> {
  if (areDesktopRepeatNotificationsDisabled()) {
    return
  }

  const Notifications = getNotificationsModule()
  if (!Notifications) return

  await ensureNotificationsConfigured()
  const response = await Notifications.getLastNotificationResponseAsync?.()
  if (!response) return

  const entryId = parseEntryIdFromNotificationResponse(response)
  if (!entryId) return
  onOpen(entryId)
}
