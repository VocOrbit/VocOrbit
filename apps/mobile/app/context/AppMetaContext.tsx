import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react"
import * as Application from "expo-application"
import { AppState, Platform } from "react-native"

import { useAuth } from "@/context/AuthContext"
import { appMetaApi, type AppBootstrapPayload, type MobilePlatform } from "@/services/api/appMetaApi"
import { authApi } from "@/services/api/authApi"

type AppMetaContextType = {
  isResolved: boolean
  isLoading: boolean
  bootstrap?: AppBootstrapPayload
  unreadAnnouncementCount: number
  refreshBootstrap: () => Promise<void>
}

const AppMetaContext = createContext<AppMetaContextType | null>(null)

function resolveMobilePlatform(): MobilePlatform {
  return Platform.OS === "android" ? "android" : "ios"
}

function resolveCurrentAppVersion(): string | undefined {
  const version = Application.nativeApplicationVersion
  if (typeof version !== "string") return undefined
  const trimmed = version.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export const AppMetaProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isSessionResolved, isAuthenticated, userId, setSession } = useAuth()
  const [isResolved, setIsResolved] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [bootstrap, setBootstrap] = useState<AppBootstrapPayload | undefined>(undefined)

  const refreshBootstrap = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setBootstrap(undefined)
      return
    }

    setIsLoading(true)
    const response = await appMetaApi.getBootstrap({
      platform: resolveMobilePlatform(),
      appVersion: resolveCurrentAppVersion(),
    })

    if (response.kind === "ok") {
      setBootstrap(response.data)
      setIsLoading(false)
      return
    }

    if (response.kind === "unauthorized") {
      // App bootstrap can briefly return unauthorized after store/app-state transitions.
      // Confirm current auth session before forcing logout.
      const meResponse = await authApi.getMe()
      if (meResponse.kind === "unauthorized") {
        setSession(undefined)
        setBootstrap(undefined)
      }
      setIsLoading(false)
      return
    }

    if (__DEV__) {
      console.warn("App bootstrap request failed.", response)
    }
    setIsLoading(false)
  }, [isAuthenticated, setSession, userId])

  useEffect(() => {
    if (!isSessionResolved) {
      setIsResolved(false)
      return
    }

    if (!isAuthenticated || !userId) {
      setBootstrap(undefined)
      setIsLoading(false)
      setIsResolved(true)
      return
    }

    setIsResolved(false)
    void (async () => {
      await refreshBootstrap()
      setIsResolved(true)
    })()
  }, [isAuthenticated, isSessionResolved, refreshBootstrap, userId])

  useEffect(() => {
    if (!isAuthenticated || !userId || !isSessionResolved) return

    let previousState = AppState.currentState
    const subscription = AppState.addEventListener("change", (nextState) => {
      const wasBackgrounded = previousState === "background" || previousState === "inactive"
      previousState = nextState
      if (!wasBackgrounded || nextState !== "active") return
      void refreshBootstrap()
    })

    return () => {
      subscription.remove()
    }
  }, [isAuthenticated, isSessionResolved, refreshBootstrap, userId])

  const value = useMemo<AppMetaContextType>(() => {
    const unreadAnnouncementCount = bootstrap?.announcements.unreadCount ?? 0
    return {
      isResolved,
      isLoading,
      bootstrap,
      unreadAnnouncementCount,
      refreshBootstrap,
    }
  }, [bootstrap, isLoading, isResolved, refreshBootstrap])

  return <AppMetaContext.Provider value={value}>{children}</AppMetaContext.Provider>
}

export function useAppMeta(): AppMetaContextType {
  const context = useContext(AppMetaContext)
  if (!context) {
    throw new Error("useAppMeta must be used within an AppMetaProvider")
  }
  return context
}
