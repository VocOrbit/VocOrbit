import { createContext, FC, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react"

import { useAuth } from "@/context/AuthContext"
import { load, remove, save } from "@/utils/storage"

type VocabularyGroupContextType = {
  selectedGroupId?: string
  setSelectedGroupId: (groupId?: string) => void
}

type StoredSelection = {
  selectedGroupId?: string
}

const STORAGE_KEY_PREFIX = "VocabularyGroups.selection"
const VocabularyGroupContext = createContext<VocabularyGroupContextType | null>(null)

function normalizeSelection(input: unknown): StoredSelection {
  if (!input || typeof input !== "object") {
    return {}
  }

  const record = input as Record<string, unknown>
  const selectedGroupId =
    typeof record.selectedGroupId === "string" && record.selectedGroupId.trim().length > 0
      ? record.selectedGroupId.trim()
      : undefined

  return { selectedGroupId }
}

export const VocabularyGroupProvider: FC<PropsWithChildren> = ({ children }) => {
  const { userId } = useAuth()
  const storageKey = `${STORAGE_KEY_PREFIX}.${userId?.trim() || "anonymous"}`
  const [selectedGroupId, setSelectedGroupIdState] = useState<string | undefined>(undefined)

  useEffect(() => {
    const stored = normalizeSelection(load<StoredSelection>(storageKey))
    setSelectedGroupIdState(stored.selectedGroupId)
  }, [storageKey])

  useEffect(() => {
    if (!selectedGroupId) {
      remove(storageKey)
      return
    }

    save(storageKey, { selectedGroupId })
  }, [selectedGroupId, storageKey])

  const value = useMemo<VocabularyGroupContextType>(
    () => ({
      selectedGroupId,
      setSelectedGroupId: (groupId?: string) => {
        const normalized = groupId?.trim()
        setSelectedGroupIdState(normalized ? normalized : undefined)
      },
    }),
    [selectedGroupId],
  )

  return (
    <VocabularyGroupContext.Provider value={value}>
      {children}
    </VocabularyGroupContext.Provider>
  )
}

export function useVocabularyGroupSelection(): VocabularyGroupContextType {
  const context = useContext(VocabularyGroupContext)
  if (!context) {
    throw new Error("useVocabularyGroupSelection must be used within a VocabularyGroupProvider")
  }
  return context
}
