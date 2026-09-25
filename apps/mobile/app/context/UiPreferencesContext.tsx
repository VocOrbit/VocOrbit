import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { load, save } from "@/utils/storage"

export type VocabularyActionKey = "details" | "favorite" | "repeat"

type UiPreferencesContextType = {
  forceEnglishUi: boolean
  vocabularyFontScale: number
  vocabularyActionOrder: VocabularyActionKey[]
  setForceEnglishUi: (forceEnglishUi: boolean) => void
  setVocabularyFontScale: (nextScale: number) => void
  moveVocabularyAction: (action: VocabularyActionKey, direction: "left" | "right") => void
  resetVocabularyPreferences: () => void
}

type StoredPreferences = {
  forceEnglishUi: boolean
  vocabularyFontScale: number
  vocabularyActionOrder: VocabularyActionKey[]
}

const STORAGE_KEY = "UiPreferences.vocabulary"
const MIN_FONT_SCALE = 0.7
const MAX_FONT_SCALE = 1.3
const DEFAULT_FORCE_ENGLISH_UI = false
const DEFAULT_FONT_SCALE = 1
const DEFAULT_ACTION_ORDER: VocabularyActionKey[] = ["details", "favorite", "repeat"]

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function normalizeActionOrder(input: unknown): VocabularyActionKey[] {
  const allowed = new Set<VocabularyActionKey>(DEFAULT_ACTION_ORDER)
  if (!Array.isArray(input)) return [...DEFAULT_ACTION_ORDER]

  const normalized: VocabularyActionKey[] = []
  for (const item of input) {
    if (item !== "details" && item !== "favorite" && item !== "repeat") continue
    if (!allowed.has(item)) continue
    normalized.push(item)
    allowed.delete(item)
  }

  for (const fallback of DEFAULT_ACTION_ORDER) {
    if (allowed.has(fallback)) normalized.push(fallback)
  }
  return normalized
}

function normalizeStoredPreferences(input: unknown): StoredPreferences {
  if (!input || typeof input !== "object") {
    return {
      forceEnglishUi: DEFAULT_FORCE_ENGLISH_UI,
      vocabularyFontScale: DEFAULT_FONT_SCALE,
      vocabularyActionOrder: [...DEFAULT_ACTION_ORDER],
    }
  }

  const record = input as Record<string, unknown>
  const forceEnglishUi =
    typeof record.forceEnglishUi === "boolean" ? record.forceEnglishUi : DEFAULT_FORCE_ENGLISH_UI
  const rawScale =
    typeof record.vocabularyFontScale === "number" ? record.vocabularyFontScale : DEFAULT_FONT_SCALE
  const vocabularyFontScale = clamp(rawScale, MIN_FONT_SCALE, MAX_FONT_SCALE)
  const vocabularyActionOrder = normalizeActionOrder(record.vocabularyActionOrder)

  return {
    forceEnglishUi,
    vocabularyFontScale,
    vocabularyActionOrder,
  }
}

const UiPreferencesContext = createContext<UiPreferencesContextType | null>(null)

export const UiPreferencesProvider: FC<PropsWithChildren> = ({ children }) => {
  const [stored, setStored] = useState<StoredPreferences>(() =>
    normalizeStoredPreferences(load<unknown>(STORAGE_KEY)),
  )

  useEffect(() => {
    save(STORAGE_KEY, stored)
  }, [stored])

  const value = useMemo<UiPreferencesContextType>(() => {
    const setForceEnglishUi = (forceEnglishUi: boolean) => {
      setStored((prev) => ({
        ...prev,
        forceEnglishUi,
      }))
    }

    const setVocabularyFontScale = (nextScale: number) => {
      setStored((prev) => ({
        ...prev,
        vocabularyFontScale: clamp(nextScale, MIN_FONT_SCALE, MAX_FONT_SCALE),
      }))
    }

    const moveVocabularyAction = (action: VocabularyActionKey, direction: "left" | "right") => {
      setStored((prev) => {
        const index = prev.vocabularyActionOrder.findIndex((item) => item === action)
        if (index < 0) return prev

        const targetIndex = direction === "left" ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= prev.vocabularyActionOrder.length) return prev

        const nextOrder = [...prev.vocabularyActionOrder]
        ;[nextOrder[index], nextOrder[targetIndex]] = [nextOrder[targetIndex]!, nextOrder[index]!]

        return {
          ...prev,
          vocabularyActionOrder: nextOrder,
        }
      })
    }

    const resetVocabularyPreferences = () => {
      setStored((prev) => ({
        ...prev,
        vocabularyFontScale: DEFAULT_FONT_SCALE,
        vocabularyActionOrder: [...DEFAULT_ACTION_ORDER],
      }))
    }

    return {
      forceEnglishUi: stored.forceEnglishUi,
      vocabularyFontScale: stored.vocabularyFontScale,
      vocabularyActionOrder: stored.vocabularyActionOrder,
      setForceEnglishUi,
      setVocabularyFontScale,
      moveVocabularyAction,
      resetVocabularyPreferences,
    }
  }, [stored])

  return <UiPreferencesContext.Provider value={value}>{children}</UiPreferencesContext.Provider>
}

export function useUiPreferences(): UiPreferencesContextType {
  const context = useContext(UiPreferencesContext)
  if (!context) {
    throw new Error("useUiPreferences must be used within a UiPreferencesProvider")
  }
  return context
}

export function useOptionalUiPreferences(): UiPreferencesContextType | null {
  return useContext(UiPreferencesContext)
}

export const vocabularyFontScaleLimits = {
  min: MIN_FONT_SCALE,
  max: MAX_FONT_SCALE,
} as const
