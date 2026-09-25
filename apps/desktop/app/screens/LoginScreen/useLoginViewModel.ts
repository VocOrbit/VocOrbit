import { useCallback, useEffect, useRef, useState } from "react"

import { useAuth } from "@/context/AuthContext"
import type { TxKeyPath } from "@/i18n"
import { authApi } from "@/services/api/authApi"
import {
  AppleSignInCancelledError,
  AppleSignInUnavailableError,
  isAppleSignInSupported,
  resolveAppleFirebaseIdToken,
} from "@/services/auth/appleIdToken"
import {
  GoogleSignInCancelledError,
  GoogleSignInUnavailableError,
  resolveGoogleFirebaseIdToken,
} from "@/services/auth/googleIdToken"
import {
  clearDesktopAuthStateFromUrl,
  getDesktopExternalAuthProvider,
  getDesktopFirebaseIdTokenFromUrl,
  isDesktopShellRuntime,
  openDesktopExternalAuth,
  returnFirebaseTokenToDesktop,
} from "@/services/auth/desktopAuthBridge"
import {
  clearPendingReferralCode,
  getPendingReferralCode,
} from "@/services/referral/pendingReferral"

export type LoginViewModel = {
  isLoading: boolean
  loadingProvider: "google" | "apple" | "review" | null
  isAppleLoginAvailable: boolean
  isReviewLoginAvailable: boolean
  reviewEmail: string
  reviewPassword: string
  errorTx?: TxKeyPath
  errorMessage?: string
  setReviewEmail: (value: string) => void
  setReviewPassword: (value: string) => void
  onGoogleLogin: () => Promise<void>
  onAppleLogin: () => Promise<void>
  onReviewLogin: () => Promise<void>
}

type SignInApiResult = Awaited<ReturnType<typeof authApi.signInWithFirebase>>

export function useLoginViewModel(): LoginViewModel {
  const { setSession } = useAuth()
  const desktopExternalAuthProvider = getDesktopExternalAuthProvider()
  const desktopFirebaseIdToken = getDesktopFirebaseIdTokenFromUrl()
  const [loadingProvider, setLoadingProvider] = useState<"google" | "apple" | "review" | null>(
    null,
  )
  const [isAppleLoginAvailable, setIsAppleLoginAvailable] = useState(false)
  const [isReviewLoginAvailable, setIsReviewLoginAvailable] = useState(false)
  const [reviewEmail, setReviewEmail] = useState("")
  const [reviewPassword, setReviewPassword] = useState("")
  const [errorTx, setErrorTx] = useState<TxKeyPath | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const hasConsumedDesktopFirebaseTokenRef = useRef(false)
  const isLoading = loadingProvider !== null

  useEffect(() => {
    let isMounted = true
    void isAppleSignInSupported().then((supported) => {
      if (!isMounted) return
      setIsAppleLoginAvailable(supported)
    })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    void (async () => {
      const status = await authApi.getReviewSignInStatus()
      if (!isMounted || status.kind !== "ok") return
      setIsReviewLoginAvailable(status.data.enabled === true)
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const applySignInResult = useCallback(
    (result: SignInApiResult): boolean => {
      if (result.kind === "ok") {
        clearPendingReferralCode()
        setSession({
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
          userId: result.data.userId,
          email: result.data.email,
        })
        setErrorMessage(undefined)
        return true
      }

      if (result.kind === "unauthorized") {
        setSession(undefined)
        setErrorMessage(undefined)
        setErrorTx("loginScreen:errors.unauthorized")
        return false
      }

      if (result.kind === "cannot-connect" || result.kind === "timeout") {
        setErrorMessage(undefined)
        setErrorTx("loginScreen:errors.cannotConnect")
        return false
      }

      if (result.kind === "server") {
        setErrorMessage(undefined)
        setErrorTx("loginScreen:errors.server")
        return false
      }

      if (result.kind === "rejected" || result.kind === "forbidden") {
        setErrorMessage(undefined)
        setErrorTx("loginScreen:errors.rejected")
        return false
      }

      if (result.kind === "bad-data") {
        setErrorMessage(undefined)
        setErrorTx("loginScreen:errors.badData")
        return false
      }

      setErrorMessage(undefined)
      setErrorTx("loginScreen:errors.generic")
      return false
    },
    [setSession],
  )

  const signInWithFirebaseToken = useCallback(
    async (idToken: string): Promise<boolean> => {
      const pendingReferralCode = getPendingReferralCode()
      const result = await authApi.signInWithFirebase(idToken, pendingReferralCode)
      return applySignInResult(result)
    },
    [applySignInResult],
  )

  const onGoogleLogin = useCallback(async () => {
    setLoadingProvider("google")
    setErrorTx(undefined)
    setErrorMessage(undefined)

    try {
      if (isDesktopShellRuntime() && !desktopExternalAuthProvider) {
        openDesktopExternalAuth("google")
        return
      }

      const idToken = await resolveGoogleFirebaseIdToken()
      if (returnFirebaseTokenToDesktop(idToken)) {
        return
      }
      await signInWithFirebaseToken(idToken)
    } catch (error) {
      if (error instanceof GoogleSignInCancelledError) {
        setErrorMessage(undefined)
        setErrorTx("loginScreen:errors.googleCancelled")
      } else if (error instanceof GoogleSignInUnavailableError) {
        setErrorTx(undefined)
        setErrorMessage(error.message?.trim() || "Google sign in is unavailable on this device.")
      } else {
        setErrorTx(undefined)
        setErrorMessage(error instanceof Error ? error.message : "Google sign in failed.")
      }
    } finally {
      setLoadingProvider(null)
    }
  }, [desktopExternalAuthProvider, signInWithFirebaseToken])

  const onAppleLogin = useCallback(async () => {
    setLoadingProvider("apple")
    setErrorTx(undefined)
    setErrorMessage(undefined)

    try {
      if (isDesktopShellRuntime() && !desktopExternalAuthProvider) {
        openDesktopExternalAuth("apple")
        return
      }

      const idToken = await resolveAppleFirebaseIdToken()
      if (returnFirebaseTokenToDesktop(idToken)) {
        return
      }
      await signInWithFirebaseToken(idToken)
    } catch (error) {
      if (error instanceof AppleSignInCancelledError) {
        setErrorTx(undefined)
        setErrorMessage(undefined)
      } else if (error instanceof AppleSignInUnavailableError) {
        setErrorTx(undefined)
        setErrorMessage(error.message?.trim() || "Apple sign in failed.")
      } else {
        setErrorMessage(undefined)
        setErrorTx("loginScreen:errors.generic")
      }
    } finally {
      setLoadingProvider(null)
    }
  }, [desktopExternalAuthProvider, signInWithFirebaseToken])

  useEffect(() => {
    if (!desktopFirebaseIdToken || hasConsumedDesktopFirebaseTokenRef.current) {
      return
    }

    hasConsumedDesktopFirebaseTokenRef.current = true
    setLoadingProvider("google")
    setErrorTx(undefined)
    setErrorMessage(undefined)

    void signInWithFirebaseToken(desktopFirebaseIdToken)
      .then(() => {
        clearDesktopAuthStateFromUrl()
      })
      .finally(() => {
        setLoadingProvider(null)
      })
  }, [desktopFirebaseIdToken, signInWithFirebaseToken])

  const onReviewLogin = useCallback(async () => {
    const normalizedEmail = reviewEmail.trim()
      if (!normalizedEmail || !reviewPassword) {
        setErrorMessage(undefined)
        setErrorTx("loginScreen:errors.generic")
        return
      }

    setLoadingProvider("review")
    setErrorTx(undefined)
    setErrorMessage(undefined)
    try {
      const result = await authApi.signInWithReview(normalizedEmail, reviewPassword)
      const success = applySignInResult(result)
      if (success) {
        setReviewPassword("")
      }
    } finally {
      setLoadingProvider(null)
    }
  }, [applySignInResult, reviewEmail, reviewPassword])

  return {
    isLoading,
    loadingProvider,
    isAppleLoginAvailable,
    isReviewLoginAvailable,
    reviewEmail,
    reviewPassword,
    errorTx,
    errorMessage,
    setReviewEmail,
    setReviewPassword,
    onGoogleLogin,
    onAppleLogin,
    onReviewLogin,
  }
}
