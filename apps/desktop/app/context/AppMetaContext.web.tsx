import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo } from "react"

import { useAuth } from "@/context/AuthContext"
import type { AppBootstrapPayload } from "@/services/api/appMetaApi"

type AppMetaContextType = {
  isResolved: boolean
  isLoading: boolean
  bootstrap?: AppBootstrapPayload
  unreadAnnouncementCount: number
  refreshBootstrap: () => Promise<void>
}

const AppMetaContext = createContext<AppMetaContextType | null>(null)

export const AppMetaProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isSessionResolved } = useAuth()

  const refreshBootstrap = useCallback(async () => {}, [])

  const value = useMemo<AppMetaContextType>(
    () => ({
      isResolved: isSessionResolved,
      isLoading: false,
      bootstrap: undefined,
      unreadAnnouncementCount: 0,
      refreshBootstrap,
    }),
    [isSessionResolved, refreshBootstrap],
  )

  return <AppMetaContext.Provider value={value}>{children}</AppMetaContext.Provider>
}

export function useAppMeta(): AppMetaContextType {
  const context = useContext(AppMetaContext)
  if (!context) {
    throw new Error("useAppMeta must be used within an AppMetaProvider")
  }
  return context
}
