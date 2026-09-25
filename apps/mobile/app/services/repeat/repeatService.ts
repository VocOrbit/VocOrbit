import { Platform } from "react-native"

import type { VocabularyEntry } from "@/screens/VocabularyShowroom/types"
import { translate } from "@/i18n/translate"
import { load, remove, save } from "@/utils/storage"

export type RepeatToggleResult = "added" | "removed" | "limit-reached" | "permission-denied"
export type RepeatReviewGrade = "forgot" | "hard" | "good"
export type RepeatReviewResult = "updated" | "not-found"
export type RepeatNotificationOpenTarget =
  | {
      type: "entry"
      entryId: string
    }
  | {
      type: "queue"
    }

export type RepeatWordItem = {
  id: string
  word: string
  translation?: string
  contextSentence?: string
  addedAt: string
}

export type RepeatProgressItem = {
  entryId: string
  step: number
  hardCycleIndex: number
  goodCycleIndex: number
  intervalMinutes: number
  easeFactor: number
  reviewCount: number
  lapseCount: number
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

export type RepeatSessionItem = RepeatWordItem & {
  dueAt: string
  progress: RepeatProgressItem
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
const REPEAT_DIGEST_NOTIFICATION_STORAGE_KEY_PREFIX = "VocabularyShowroom.repeatDigestNotification"
const REPEAT_NOTIFICATION_TYPE = "repeat_review"
const REPEAT_DIGEST_NOTIFICATION_TYPE = "repeat_review_digest"
const REPEAT_NOTIFICATION_CHANNEL_ID = "repeat-reminders"
const REPEAT_STEP_INTERVALS_MINUTES = [10, 60, 360, 1440, 4320, 10080, 20160, 720]
const REPEAT_HARD_PROGRESS_STEPS = [1, 2, 7]
const REPEAT_GOOD_PROGRESS_STEPS = [3, 4, 5, 6]
const REPEAT_LEARNING_FORGOT_DELAY_MINUTES = 10
const REPEAT_LEARNING_HARD_DELAY_MINUTES = 60
const REPEAT_GRADUATING_INTERVAL_MINUTES = 1440
const REPEAT_INITIAL_EASE_FACTOR = 2.5
const REPEAT_MIN_EASE_FACTOR = 1.3
const REPEAT_MAX_EASE_FACTOR = 3.0
const REPEAT_FORGOT_EASE_PENALTY = 0.2
const REPEAT_HARD_EASE_PENALTY = 0.15
const REPEAT_HARD_INTERVAL_FACTOR = 1.2
const REPEAT_MAX_INTERVAL_MINUTES = 365 * 24 * 60
const REPEAT_DAILY_SMART_REVIEW_HOUR = 9
const REPEAT_DAILY_SMART_REVIEW_MINUTE = 0

type RepeatDigestNotificationRecord = {
  notificationId?: string
  dueAt?: string
  dueCount?: number
  scheduledAt?: string
}

let notificationsConfigured = false
let notificationsModuleMissingWarningShown = false
const handledResponseIds = new Set<string>()

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

function buildRepeatDigestNotificationStorageKey(userId?: string): string {
  return userId?.trim()
    ? `${REPEAT_DIGEST_NOTIFICATION_STORAGE_KEY_PREFIX}.${userId.trim()}`
    : `${REPEAT_DIGEST_NOTIFICATION_STORAGE_KEY_PREFIX}.anonymous`
}

function getNotificationsModule(): NotificationsModule | undefined {
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

function computeDueDateFromMinutes(totalMinutes: number, from: Date): Date {
  return new Date(from.getTime() + totalMinutes * 60 * 1000)
}

function clampEaseFactor(value: number): number {
  if (!Number.isFinite(value)) return REPEAT_INITIAL_EASE_FACTOR
  return Math.max(REPEAT_MIN_EASE_FACTOR, Math.min(REPEAT_MAX_EASE_FACTOR, value))
}

function clampIntervalMinutes(value: number): number {
  if (!Number.isFinite(value)) return REPEAT_LEARNING_FORGOT_DELAY_MINUTES
  return Math.max(
    REPEAT_LEARNING_FORGOT_DELAY_MINUTES,
    Math.min(REPEAT_MAX_INTERVAL_MINUTES, Math.round(value)),
  )
}

function resolveStepIntervalMinutes(step: number): number {
  const normalizedStep = Math.max(0, Math.min(step, REPEAT_STEP_INTERVALS_MINUTES.length - 1))
  return REPEAT_STEP_INTERVALS_MINUTES[normalizedStep] ?? REPEAT_LEARNING_FORGOT_DELAY_MINUTES
}

function deriveNearestStepFromInterval(intervalMinutes: number): number {
  let nearestStep = 0
  let nearestDistance = Number.POSITIVE_INFINITY

  REPEAT_STEP_INTERVALS_MINUTES.forEach((stepInterval, index) => {
    const distance = Math.abs(stepInterval - intervalMinutes)
    if (distance < nearestDistance) {
      nearestStep = index
      nearestDistance = distance
    }
  })

  return nearestStep
}

function inferReviewCount(step: number, streak: number): number {
  if (streak > 0) return streak
  return resolveStepIntervalMinutes(step) >= REPEAT_GRADUATING_INTERVAL_MINUTES ? 1 : 0
}

function deriveNextReviewPlan(
  progress: RepeatProgressItem | undefined,
  grade: RepeatReviewGrade,
): {
  intervalMinutes: number
  easeFactor: number
  reviewCount: number
  lapseCount: number
  streak: number
  step: number
  hardCycleIndex: number
  goodCycleIndex: number
} {
  const currentInterval = clampIntervalMinutes(
    progress?.intervalMinutes ?? resolveStepIntervalMinutes(progress?.step ?? 0),
  )
  const currentEase = clampEaseFactor(progress?.easeFactor ?? REPEAT_INITIAL_EASE_FACTOR)
  const currentReviewCount = Math.max(0, Math.floor(progress?.reviewCount ?? 0))
  const currentLapseCount = Math.max(0, Math.floor(progress?.lapseCount ?? 0))
  const currentStreak = Math.max(0, Math.floor(progress?.streak ?? 0))

  if (grade === "forgot") {
    const intervalMinutes = REPEAT_LEARNING_FORGOT_DELAY_MINUTES
    return {
      intervalMinutes,
      easeFactor: clampEaseFactor(currentEase - REPEAT_FORGOT_EASE_PENALTY),
      reviewCount: 0,
      lapseCount: currentLapseCount + 1,
      streak: 0,
      step: deriveNearestStepFromInterval(intervalMinutes),
      hardCycleIndex: -1,
      goodCycleIndex: -1,
    }
  }

  if (grade === "hard") {
    const isLearning = currentReviewCount === 0
    const intervalMinutes =
      isLearning
        ? REPEAT_LEARNING_HARD_DELAY_MINUTES
        : clampIntervalMinutes(currentInterval * REPEAT_HARD_INTERVAL_FACTOR)

    return {
      intervalMinutes,
      easeFactor: clampEaseFactor(currentEase - REPEAT_HARD_EASE_PENALTY),
      reviewCount: isLearning ? 0 : currentReviewCount + 1,
      lapseCount: currentLapseCount,
      streak: isLearning ? currentStreak : currentStreak + 1,
      step: deriveNearestStepFromInterval(intervalMinutes),
      hardCycleIndex: 0,
      goodCycleIndex: -1,
    }
  }

  const intervalMinutes =
    currentReviewCount === 0
      ? REPEAT_GRADUATING_INTERVAL_MINUTES
      : clampIntervalMinutes(currentInterval * currentEase)

  return {
    intervalMinutes,
    easeFactor: currentEase,
    reviewCount: currentReviewCount + 1,
    lapseCount: currentLapseCount,
    streak: currentStreak + 1,
    step: deriveNearestStepFromInterval(intervalMinutes),
    hardCycleIndex: -1,
    goodCycleIndex: 0,
  }
}

function resolveDailySmartReviewDate(earliestDueDate: Date, now = new Date()): Date {
  const nextDate = new Date(earliestDueDate)
  nextDate.setHours(REPEAT_DAILY_SMART_REVIEW_HOUR, REPEAT_DAILY_SMART_REVIEW_MINUTE, 0, 0)

  if (nextDate.getTime() < earliestDueDate.getTime()) {
    nextDate.setDate(nextDate.getDate() + 1)
  }

  if (nextDate.getTime() <= now.getTime()) {
    nextDate.setTime(now.getTime())
    nextDate.setHours(REPEAT_DAILY_SMART_REVIEW_HOUR, REPEAT_DAILY_SMART_REVIEW_MINUTE, 0, 0)

    if (nextDate.getTime() <= now.getTime()) {
      nextDate.setDate(nextDate.getDate() + 1)
    }
  }

  return nextDate
}

function loadRepeatDigestNotificationRecord(userId?: string): RepeatDigestNotificationRecord {
  const raw = load<unknown>(buildRepeatDigestNotificationStorageKey(userId))
  if (typeof raw !== "object" || raw === null) return {}

  const record = raw as Record<string, unknown>
  return {
    notificationId:
      typeof record.notificationId === "string" && record.notificationId.trim().length > 0
        ? record.notificationId.trim()
        : undefined,
    dueAt:
      typeof record.dueAt === "string" && record.dueAt.trim().length > 0
        ? record.dueAt.trim()
        : undefined,
    dueCount: typeof record.dueCount === "number" ? Math.max(0, Math.floor(record.dueCount)) : undefined,
    scheduledAt:
      typeof record.scheduledAt === "string" && record.scheduledAt.trim().length > 0
        ? record.scheduledAt.trim()
        : undefined,
  }
}

function persistRepeatDigestNotificationRecord(
  userId: string | undefined,
  record: RepeatDigestNotificationRecord,
): void {
  if (!record.notificationId) {
    remove(buildRepeatDigestNotificationStorageKey(userId))
    return
  }

  save(buildRepeatDigestNotificationStorageKey(userId), record)
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
  return deriveNextReviewPlan(progress, grade).intervalMinutes
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
    const contextSentence =
      typeof record.contextSentence === "string" && record.contextSentence.trim().length > 0
        ? record.contextSentence.trim()
        : undefined
    const addedAt =
      typeof record.addedAt === "string" && record.addedAt.trim().length > 0
        ? record.addedAt.trim()
        : new Date().toISOString()

    byId.set(id, {
      id,
      word,
      translation,
      contextSentence,
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
    const streak = typeof record.streak === "number" ? Math.max(0, Math.floor(record.streak)) : 0
    const resolvedState = resolveReviewState({
      step,
      hardCycleIndex: normalizeCycleIndex(hardCycleIndexRaw, REPEAT_HARD_PROGRESS_STEPS.length),
      goodCycleIndex: normalizeCycleIndex(goodCycleIndexRaw, REPEAT_GOOD_PROGRESS_STEPS.length),
    })
    const intervalMinutes = clampIntervalMinutes(
      typeof record.intervalMinutes === "number"
        ? record.intervalMinutes
        : resolveStepIntervalMinutes(resolvedState.step),
    )
    const easeFactor = clampEaseFactor(
      typeof record.easeFactor === "number" ? record.easeFactor : REPEAT_INITIAL_EASE_FACTOR,
    )
    const reviewCount =
      typeof record.reviewCount === "number"
        ? Math.max(0, Math.floor(record.reviewCount))
        : inferReviewCount(resolvedState.step, streak)
    const lapseCount =
      typeof record.lapseCount === "number" ? Math.max(0, Math.floor(record.lapseCount)) : 0
    const dueAt =
      typeof record.dueAt === "string"
        ? record.dueAt
        : computeDueDateFromMinutes(intervalMinutes, new Date()).toISOString()
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

    normalized[entryId] = {
      entryId,
      step: resolvedState.step,
      hardCycleIndex: resolvedState.hardCycleIndex,
      goodCycleIndex: resolvedState.goodCycleIndex,
      intervalMinutes,
      easeFactor,
      reviewCount,
      lapseCount,
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
    intervalMinutes: REPEAT_LEARNING_FORGOT_DELAY_MINUTES,
    easeFactor: REPEAT_INITIAL_EASE_FACTOR,
    reviewCount: 0,
    lapseCount: 0,
    dueAt: computeDueDateFromMinutes(REPEAT_LEARNING_FORGOT_DELAY_MINUTES, now).toISOString(),
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

function parseRepeatNotificationOpenTarget(
  response: Record<string, unknown>,
): RepeatNotificationOpenTarget | undefined {
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
  if (payload.type === REPEAT_DIGEST_NOTIFICATION_TYPE) {
    return { type: "queue" }
  }

  if (payload.type !== REPEAT_NOTIFICATION_TYPE) return undefined
  if (typeof payload.entryId !== "string") return undefined

  const entryId = payload.entryId.trim()
  return entryId.length > 0 ? { type: "entry", entryId } : undefined
}

async function cancelNotificationById(notificationId?: string): Promise<void> {
  if (!notificationId) return
  const Notifications = getNotificationsModule()
  if (!Notifications) return
  try {
    await Notifications.cancelScheduledNotificationAsync?.(notificationId)
  } catch {
    // no-op
  }
}

async function cancelRepeatDigestNotification(userId?: string): Promise<void> {
  const record = loadRepeatDigestNotificationRecord(userId)
  await cancelNotificationById(record.notificationId)
  persistRepeatDigestNotificationRecord(userId, {})
}

async function cancelLegacyProgressNotifications(progressById: Record<string, RepeatProgressItem>): Promise<boolean> {
  const notificationIds = Object.values(progressById)
    .map((progress) => progress.notificationId)
    .filter((notificationId): notificationId is string => typeof notificationId === "string" && notificationId.length > 0)

  if (notificationIds.length === 0) return false
  await Promise.all(notificationIds.map((notificationId) => cancelNotificationById(notificationId)))
  return true
}

function removeProgressNotificationIds(
  progressById: Record<string, RepeatProgressItem>,
): Record<string, RepeatProgressItem> {
  let hasNotificationId = false
  const nextProgressById: Record<string, RepeatProgressItem> = {}

  for (const [entryId, progress] of Object.entries(progressById)) {
    if (progress.notificationId) {
      hasNotificationId = true
      const { notificationId: _notificationId, ...rest } = progress
      nextProgressById[entryId] = rest
      continue
    }

    nextProgressById[entryId] = progress
  }

  return hasNotificationId ? nextProgressById : progressById
}

function resolveNextRepeatDigest(
  state: RepeatState,
  now = new Date(),
): { notificationDate: Date; dueCount: number } | undefined {
  const dueItems = state.words
    .map((word) => {
      const progress = state.progressById[word.id] ?? createInitialProgress(word.id, parseIsoDateOrNow(word.addedAt))
      return {
        word,
        dueDate: parseIsoDateOrNow(progress.dueAt),
      }
    })
    .filter((item) => item.word.id.trim().length > 0)

  if (dueItems.length === 0) return undefined

  dueItems.sort((left, right) => left.dueDate.getTime() - right.dueDate.getTime())
  const earliestDueDate = dueItems[0]?.dueDate
  if (!earliestDueDate) return undefined

  const notificationDate = resolveDailySmartReviewDate(earliestDueDate, now)
  const dueCount = Math.max(
    1,
    dueItems.filter((item) => item.dueDate.getTime() <= notificationDate.getTime()).length,
  )

  return {
    notificationDate,
    dueCount,
  }
}

async function scheduleRepeatDigestNotification(
  userId: string | undefined,
  state: RepeatState,
  options?: {
    requestPermission?: boolean
  },
): Promise<string | undefined> {
  const Notifications = getNotificationsModule()
  if (!Notifications) return undefined

  const hasPermission =
    options?.requestPermission === false
      ? await hasRepeatNotificationPermission()
      : await ensureRepeatNotificationPermission()
  if (!hasPermission) return undefined

  const nextDigest = resolveNextRepeatDigest(state)
  if (!nextDigest) return undefined

  const bodyTx =
    nextDigest.dueCount === 1
      ? "vocabulary:detail.repeatDigestNotificationBodySingle"
      : "vocabulary:detail.repeatDigestNotificationBody"

  try {
    const notificationId = await Notifications.scheduleNotificationAsync?.({
      content: {
        title: translate("vocabulary:detail.repeatDigestNotificationTitle"),
        body: translate(bodyTx, { count: nextDigest.dueCount }),
        sound: true,
        data: {
          type: REPEAT_DIGEST_NOTIFICATION_TYPE,
        },
      },
      trigger: {
        type: "date",
        date: nextDigest.notificationDate,
        ...(Platform.OS === "android" ? { channelId: REPEAT_NOTIFICATION_CHANNEL_ID } : {}),
      },
    })

    persistRepeatDigestNotificationRecord(userId, {
      notificationId,
      dueAt: nextDigest.notificationDate.toISOString(),
      dueCount: nextDigest.dueCount,
      scheduledAt: new Date().toISOString(),
    })

    return notificationId
  } catch (error) {
    if (__DEV__) {
      console.warn("Failed to schedule repeat digest notification.", error)
    }
    return undefined
  }
}

async function rescheduleRepeatDigestNotification(
  userId: string | undefined,
  state: RepeatState,
  options?: {
    requestPermission?: boolean
  },
): Promise<RepeatState> {
  const hadLegacyNotifications = await cancelLegacyProgressNotifications(state.progressById)
  await cancelRepeatDigestNotification(userId)

  const nextProgressById = removeProgressNotificationIds(state.progressById)
  const nextState: RepeatState = {
    words: state.words,
    progressById: nextProgressById,
  }

  if (nextState.words.length === 0) {
    if (hadLegacyNotifications || nextProgressById !== state.progressById) {
      persistRepeatState(userId, nextState)
    }
    return nextState
  }

  await scheduleRepeatDigestNotification(userId, nextState, options)

  if (hadLegacyNotifications || nextProgressById !== state.progressById) {
    persistRepeatState(userId, nextState)
  }

  return nextState
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

export function loadRepeatSessionQueue(userId?: string, now = new Date()): RepeatSessionItem[] {
  const state = loadRepeatState(userId)
  const nowTime = now.getTime()

  return state.words
    .map((word) => {
      const progress = state.progressById[word.id] ?? createInitialProgress(word.id, parseIsoDateOrNow(word.addedAt))
      return {
        ...word,
        dueAt: progress.dueAt,
        progress,
      }
    })
    .filter((item) => parseIsoDateOrNow(item.dueAt).getTime() <= nowTime)
    .sort((left, right) => parseIsoDateOrNow(left.dueAt).getTime() - parseIsoDateOrNow(right.dueAt).getTime())
}

export function getRepeatDueWordCount(userId?: string, now = new Date()): number {
  return loadRepeatSessionQueue(userId, now).length
}

export async function syncRepeatNotificationSchedules(userId?: string): Promise<RepeatState> {
  const state = loadRepeatState(userId)
  return rescheduleRepeatDigestNotification(userId, state, {
    requestPermission: false,
  })
}

export function getRepeatProgressForEntry(userId: string | undefined, entryId: string): RepeatProgressItem | undefined {
  const state = loadRepeatState(userId)
  return state.progressById[entryId]
}

export function syncRepeatWordMetadata(
  userId: string | undefined,
  entries: VocabularyEntry[],
): RepeatState {
  const state = loadRepeatState(userId)
  if (state.words.length === 0 || entries.length === 0) return state

  const entriesById = new Map(entries.map((entry) => [entry.id, entry]))
  let didChange = false
  const nextWords = state.words.map((word) => {
    const entry = entriesById.get(word.id)
    if (!entry) return word

    const nextWord: RepeatWordItem = {
      ...word,
      word: entry.word,
      translation: entry.definition || word.translation,
      contextSentence: entry.contextSentence ?? word.contextSentence,
    }

    if (
      nextWord.word !== word.word ||
      nextWord.translation !== word.translation ||
      nextWord.contextSentence !== word.contextSentence
    ) {
      didChange = true
    }

    return nextWord
  })

  if (!didChange) return state

  const nextState: RepeatState = {
    ...state,
    words: nextWords,
  }
  persistRepeatState(userId, nextState)
  return nextState
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
    await cancelNotificationById(state.progressById[wordId]?.notificationId)

    const nextWords = state.words.filter((item) => item.id !== wordId)
    const nextProgress = { ...state.progressById }
    delete nextProgress[wordId]

    const nextState: RepeatState = {
      words: nextWords,
      progressById: nextProgress,
    }
    persistRepeatState(userId, nextState)
    const scheduledState = await rescheduleRepeatDigestNotification(userId, nextState, {
      requestPermission: false,
    })
    return { result: "removed", state: scheduledState }
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
    contextSentence: entry.contextSentence,
    addedAt: new Date().toISOString(),
  }
  const nextProgress = createInitialProgress(wordId)

  const nextState: RepeatState = {
    words: [...state.words, nextWord],
    progressById: {
      ...state.progressById,
      [wordId]: nextProgress,
    },
  }
  persistRepeatState(userId, nextState)
  const scheduledState = await rescheduleRepeatDigestNotification(userId, nextState, {
    requestPermission: false,
  })
  return { result: "added", state: scheduledState }
}

export async function clearRepeatWords(userId: string | undefined): Promise<RepeatState> {
  const state = loadRepeatState(userId)
  await cancelLegacyProgressNotifications(state.progressById)
  await cancelRepeatDigestNotification(userId)

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

  await cancelNotificationById(state.progressById[normalizedId]?.notificationId)

  const nextState: RepeatState = {
    words: state.words.filter((word) => word.id !== normalizedId),
    progressById: Object.fromEntries(
      Object.entries(state.progressById).filter(([key]) => key !== normalizedId),
    ),
  }
  persistRepeatState(userId, nextState)
  return rescheduleRepeatDigestNotification(userId, nextState, {
    requestPermission: false,
  })
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
  const nextReviewPlan = deriveNextReviewPlan(previous, grade)
  const nextDueAt = computeDueDateFromMinutes(nextReviewPlan.intervalMinutes, now).toISOString()
  const nextProgress: RepeatProgressItem = {
    ...previous,
    step: nextReviewPlan.step,
    hardCycleIndex: nextReviewPlan.hardCycleIndex,
    goodCycleIndex: nextReviewPlan.goodCycleIndex,
    intervalMinutes: nextReviewPlan.intervalMinutes,
    easeFactor: nextReviewPlan.easeFactor,
    reviewCount: nextReviewPlan.reviewCount,
    lapseCount: nextReviewPlan.lapseCount,
    dueAt: nextDueAt,
    lastReviewedAt: now.toISOString(),
    streak: nextReviewPlan.streak,
    updatedAt: now.toISOString(),
  }

  const resolvedProgress: RepeatProgressItem = {
    ...nextProgress,
  }

  const nextState: RepeatState = {
    words: state.words,
    progressById: {
      ...state.progressById,
      [entryId]: resolvedProgress,
    },
  }
  persistRepeatState(userId, nextState)
  const scheduledState = await rescheduleRepeatDigestNotification(userId, nextState, {
    requestPermission: false,
  })
  return {
    result: "updated",
    state: scheduledState,
    progress: scheduledState.progressById[entryId] ?? resolvedProgress,
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
  onOpen: (target: RepeatNotificationOpenTarget) => void,
): Promise<() => void> {
  const Notifications = getNotificationsModule()
  if (!Notifications) return () => {}

  await ensureNotificationsConfigured()

  const subscription = Notifications.addNotificationResponseReceivedListener?.((response) => {
    const target = parseRepeatNotificationOpenTarget(response)
    if (!target) return
    onOpen(target)
  })

  return () => {
    subscription?.remove()
  }
}

export async function consumeLastRepeatNotificationOpen(
  onOpen: (target: RepeatNotificationOpenTarget) => void,
): Promise<void> {
  const Notifications = getNotificationsModule()
  if (!Notifications) return

  await ensureNotificationsConfigured()
  const response = await Notifications.getLastNotificationResponseAsync?.()
  if (!response) return

  const target = parseRepeatNotificationOpenTarget(response)
  if (!target) return
  onOpen(target)
}
