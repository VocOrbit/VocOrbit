import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useMMKVString } from "react-native-mmkv"

import { authApi } from "@/services/api/authApi"
import { readHomeRegionCode, resolveBackendBaseUrl } from "@/services/region/homeRegion"
import { setCrashUser } from "@/utils/crashReporting"
import { storage } from "@/utils/storage"
import { readAuthSessionFromKeychain, syncAuthSessionToKeychain } from "@/utils/sharedKeychain"

export type AuthContextType = {
  isSessionResolved: boolean
  isAuthenticated: boolean
  authToken?: string
  refreshToken?: string
  userId?: string
  authEmail?: string
  setSession: (session?: { accessToken: string; refreshToken?: string; userId?: string; email?: string }) => void
  setAuthToken: (token?: string) => void
  setAuthEmail: (email: string) => void
  logout: () => void
  validationError: string
}

export const AuthContext = createContext<AuthContextType | null>(null)

export interface AuthProviderProps {}

export const AuthProvider: FC<PropsWithChildren<AuthProviderProps>> = ({ children }) => {
  const [authToken, setAuthToken] = useMMKVString("AuthProvider.authToken", storage)
  const [refreshToken, setRefreshToken] = useMMKVString("AuthProvider.refreshToken", storage)
  const [userId, setUserId] = useMMKVString("AuthProvider.userId", storage)
  const [authEmail, setAuthEmail] = useMMKVString("AuthProvider.authEmail", storage)
  const [isSessionResolved, setIsSessionResolved] = useState(false)
  const hasAttemptedKeychainRestoreRef = useRef(false)
  const hasCompletedInitialSessionResolveRef = useRef(false)

  useEffect(() => {
    const homeRegion = readHomeRegionCode()
    const backendBaseUrl = resolveBackendBaseUrl()

    syncAuthSessionToKeychain(
      authToken
        ? {
            accessToken: authToken,
            refreshToken: refreshToken ?? undefined,
            userId: userId ?? undefined,
            homeRegion,
            backendBaseUrl,
          }
        : undefined,
    ).catch((error) => {
      if (__DEV__) {
        console.warn("Failed to sync auth session to keychain", error)
      }
    })
  }, [authToken, refreshToken, userId])

  useEffect(() => {
    setCrashUser(userId)
  }, [userId])

  const setSession = useCallback(
    (session?: { accessToken: string; refreshToken?: string; userId?: string; email?: string }) => {
      if (__DEV__ && !session?.accessToken) {
        const trace = new Error("setSession(undefined) trace").stack
        console.warn("Auth session cleared", trace)
      }
      setAuthToken(session?.accessToken)
      setRefreshToken(session?.refreshToken)
      setUserId(session?.userId)
      setAuthEmail(session?.email ?? "")
    },
    [setAuthEmail, setAuthToken, setRefreshToken, setUserId],
  )

  const logout = useCallback(() => {
    void authApi.logout()
    setSession(undefined)
  }, [setSession])

  useEffect(() => {
    let isMounted = true

    const markSessionResolved = () => {
      hasCompletedInitialSessionResolveRef.current = true
      if (__DEV__) {
        console.log("[auth] markSessionResolved", {
          hasToken: Boolean(authToken),
          hasUserId: Boolean(userId),
        })
      }
      if (isMounted) setIsSessionResolved(true)
    }

    const resolveSession = async () => {
      if (!authToken) {
        if (!hasAttemptedKeychainRestoreRef.current) {
          hasAttemptedKeychainRestoreRef.current = true

          const keychainSession = await readAuthSessionFromKeychain()
          if (!isMounted) return

          if (keychainSession?.accessToken) {
            setSession({
              accessToken: keychainSession.accessToken,
              refreshToken: keychainSession.refreshToken,
              userId: keychainSession.userId,
            })
            return
          }
        }

        markSessionResolved()
        return
      }

      // Once we have an in-memory/MMKV token, keychain restore should not run again
      // during this app session (prevents runtime auth resets from bouncing users
      // back into an old restored session and resetting navigation stack).
      hasAttemptedKeychainRestoreRef.current = true

      const response = await authApi.getMe()
      if (!isMounted) return

      if (response.kind === "ok") {
        setUserId(response.data.user.id)
        if (response.data.user.email) {
          setAuthEmail(response.data.user.email)
        }
        markSessionResolved()
        return
      }

      if (response.kind === "unauthorized") {
        setSession(undefined)
      }
      markSessionResolved()
    }

    // Keep navigation mounted on token rotations (for example refresh token updates).
    // We only block rendering until the very first session resolution is completed.
    if (!hasCompletedInitialSessionResolveRef.current) {
      setIsSessionResolved(false)
    }
    void resolveSession()

    return () => {
      isMounted = false
    }
  }, [authToken, setAuthEmail, setSession, setUserId])

  const validationError = useMemo(() => {
    if (!authEmail || authEmail.length === 0) return "can't be blank"
    if (authEmail.length < 6) return "must be at least 6 characters"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) return "must be a valid email address"
    return ""
  }, [authEmail])

  const value = {
    isSessionResolved,
    isAuthenticated: !!authToken,
    authToken,
    refreshToken,
    userId,
    authEmail,
    setSession,
    setAuthToken,
    setAuthEmail,
    logout,
    validationError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
