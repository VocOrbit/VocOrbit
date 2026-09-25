import { createContext, FC, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react"

import { load, save } from "@/utils/storage"

export type VocabularyActionKey = "details" | "favorite" | "repeat"

type UiPreferencesContextType = {
  vocabularyFontScale: number
  vocabularyActionOrder: VocabularyActionKey[]
  setVocabularyFontScale: (nextScale: number) => void
  setVocabularyActionOrder: (nextOrder: VocabularyActionKey[]) => void
  moveVocabularyAction: (action: VocabularyActionKey, direction: "left" | "right") => void
  resetVocabularyPreferences: () => void
}

type StoredPreferences = {
  vocabularyFontScale: number
  vocabularyActionOrder: VocabularyActionKey[]
}

const STORAGE_KEY = "UiPreferences.vocabulary"
const MIN_FONT_SCALE = 0.7
const MAX_FONT_SCALE = 1.3
const DEFAULT_FONT_SCALE = 1
const DEFAULT_ACTION_ORDER: VocabularyActionKey[] = ["details", "favorite"]

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function normalizeActionOrder(input: unknown): VocabularyActionKey[] {
  const allowed = new Set<VocabularyActionKey>(DEFAULT_ACTION_ORDER)
  if (!Array.isArray(input)) return [...DEFAULT_ACTION_ORDER]

  const normalized: VocabularyActionKey[] = []
  for (const item of input) {
    if (item !== "details" && item !== "favorite") continue
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
      vocabularyFontScale: DEFAULT_FONT_SCALE,
      vocabularyActionOrder: [...DEFAULT_ACTION_ORDER],
    }
  }

  const record = input as Record<string, unknown>
  const rawScale = typeof record.vocabularyFontScale === "number" ? record.vocabularyFontScale : DEFAULT_FONT_SCALE
  const vocabularyFontScale = clamp(rawScale, MIN_FONT_SCALE, MAX_FONT_SCALE)
  const vocabularyActionOrder = normalizeActionOrder(record.vocabularyActionOrder)

  return {
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
    const setVocabularyFontScale = (nextScale: number) => {
      setStored((prev) => ({
        ...prev,
        vocabularyFontScale: clamp(nextScale, MIN_FONT_SCALE, MAX_FONT_SCALE),
      }))
    }

    const setVocabularyActionOrder = (nextOrder: VocabularyActionKey[]) => {
      setStored((prev) => ({
        ...prev,
        vocabularyActionOrder: normalizeActionOrder(nextOrder),
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
      setStored({
        vocabularyFontScale: DEFAULT_FONT_SCALE,
        vocabularyActionOrder: [...DEFAULT_ACTION_ORDER],
      })
    }

    return {
      vocabularyFontScale: stored.vocabularyFontScale,
      vocabularyActionOrder: stored.vocabularyActionOrder,
      setVocabularyFontScale,
      setVocabularyActionOrder,
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

export const vocabularyFontScaleLimits = {
  min: MIN_FONT_SCALE,
  max: MAX_FONT_SCALE,
} as const
