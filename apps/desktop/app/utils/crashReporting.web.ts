let isInitialized = false

export enum ErrorType {
  FATAL = "Fatal",
  HANDLED = "Handled",
}

export const initCrashReporting = () => {
  isInitialized = true
}

export const setCrashUser = (_userId?: string) => {}

export const setCrashLanguagePair = (_l1Language?: string, _l2Language?: string) => {}

export const setCrashCurrentScreen = (_screenName: string) => {}

export const addCrashBreadcrumb = (message: string) => {
  if (__DEV__ && isInitialized) {
    console.log("[crash-breadcrumb]", message)
  }
}

export const reportCrash = (error: Error, type: ErrorType = ErrorType.FATAL) => {
  if (__DEV__) {
    console.error("[crash-report]", type, error)
  }
}
