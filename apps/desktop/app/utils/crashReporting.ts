import * as Application from "expo-application"
import crashlytics from "@react-native-firebase/crashlytics"

let isInitialized = false

/**
 * Error classifications used to sort errors on error reporting services.
 */
export enum ErrorType {
  /**
   * An error that would normally cause a red screen in dev
   * and force the user to sign out and restart.
   */
  FATAL = "Fatal",
  /**
   * An error caught by try/catch where defined using Reactotron.tron.error.
   */
  HANDLED = "Handled",
}

function isCrashReportingEnabled(): boolean {
  const enableInDev = process.env.EXPO_PUBLIC_CRASHLYTICS_ENABLE_IN_DEV === "true"
  return enableInDev || !__DEV__
}

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error
  return new Error(typeof error === "string" ? error : JSON.stringify(error))
}

function safeRecord(operation: () => Promise<unknown> | void): void {
  try {
    const result = operation()
    if (result && typeof result.then === "function") {
      void result.catch((err) => {
        if (__DEV__) console.warn("Crashlytics operation failed", err)
      })
    }
  } catch (error) {
    if (__DEV__) console.warn("Crashlytics operation failed", error)
  }
}

/**
 * Initialize Crashlytics once at app bootstrap.
 */
export const initCrashReporting = () => {
  if (isInitialized) return
  isInitialized = true

  const enabled = isCrashReportingEnabled()
  safeRecord(() => crashlytics().setCrashlyticsCollectionEnabled(enabled))

  safeRecord(() => crashlytics().setAttribute("app_version", Application.nativeApplicationVersion ?? "unknown"))
  safeRecord(() => crashlytics().setAttribute("build_number", Application.nativeBuildVersion ?? "unknown"))
  safeRecord(() => crashlytics().setAttribute("environment", __DEV__ ? "development" : "production"))
  safeRecord(() => crashlytics().log(`Crash reporting initialized (enabled=${enabled ? "true" : "false"})`))
}

export const setCrashUser = (userId?: string) => {
  if (!isInitialized) return
  safeRecord(() => crashlytics().setUserId(userId?.trim() || "anonymous"))
  safeRecord(() => crashlytics().setAttribute("is_authenticated", userId ? "true" : "false"))
}

export const setCrashLanguagePair = (l1Language?: string, l2Language?: string) => {
  if (!isInitialized) return
  safeRecord(() => crashlytics().setAttribute("l1_language", l1Language ?? "unknown"))
  safeRecord(() => crashlytics().setAttribute("l2_language", l2Language ?? "unknown"))
}

export const setCrashCurrentScreen = (screenName: string) => {
  if (!isInitialized) return
  safeRecord(() => crashlytics().setAttribute("current_screen", screenName))
}

export const addCrashBreadcrumb = (message: string) => {
  if (!isInitialized) return
  safeRecord(() => crashlytics().log(message))
}

/**
 * Manually report a handled error.
 */
export const reportCrash = (error: Error, type: ErrorType = ErrorType.FATAL) => {
  const normalizedError = normalizeError(error)
  const typeLabel = type === ErrorType.HANDLED ? "handled" : "fatal"

  if (__DEV__) {
    // Log to console and Reactotron in development
    const message = normalizedError.message || "Unknown"
    console.error(normalizedError)
    console.log(message, type)
  } else {
    safeRecord(() => crashlytics().setAttribute("error_type", typeLabel))
    safeRecord(() => crashlytics().recordError(normalizedError))
  }
}
