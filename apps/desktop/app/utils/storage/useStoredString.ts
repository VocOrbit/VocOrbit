import { useCallback, useState } from "react"

import { loadString, remove, saveString } from "."

type StoredStringSetter = (value?: string | null) => void

export function useStoredString(key: string): [string | undefined, StoredStringSetter] {
  const [value, setValue] = useState<string | undefined>(() => loadString(key) ?? undefined)

  const setStoredValue = useCallback<StoredStringSetter>(
    (nextValue) => {
      const normalized =
        typeof nextValue === "string" && nextValue.length > 0 ? nextValue : undefined

      setValue(normalized)

      if (normalized === undefined) {
        remove(key)
        return
      }

      saveString(key, normalized)
    },
    [key],
  )

  return [value, setStoredValue]
}
