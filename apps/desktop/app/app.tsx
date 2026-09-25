/* eslint-disable import/first */
/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
if (__DEV__) {
  // Load Reactotron in development only.
  // Note that you must be using metro's `inlineRequires` for this to work.
  // If you turn it off in metro.config.js, you'll have to manually import it.
  require("./devtools/ReactotronConfig")
}
import "./utils/gestureHandler"

import { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import * as Linking from "expo-linking"
import i18n from "i18next"
import { getStateFromPath } from "@react-navigation/native"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { AuthProvider } from "./context/AuthContext"
import { AppMetaProvider } from "./context/AppMetaContext"
import { LanguagePreferencesProvider } from "./context/LanguagePreferencesContext"
import { UiPreferencesProvider } from "./context/UiPreferencesContext"
import { initI18n } from "./i18n"
import { AppNavigator } from "./navigators/AppNavigator"
import { useNavigationPersistence } from "./navigators/navigationUtilities"
import { ThemeProvider } from "./theme/context"
import { customFontsToLoad } from "./theme/typography"
import { loadDateFnsLocale } from "./utils/formatDate"
import { initCrashReporting } from "./utils/crashReporting"
import * as storage from "./utils/storage"
import { capturePendingReferralCodeFromUrl } from "./services/referral/pendingReferral"

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

// Web linking configuration
const prefix = Linking.createURL("/")
const appSchemePrefixes = [
  "vocorbit://",
  "com.vocorbit://",
]
const config = {
  screens: {
    Login: {
      path: "login",
    },
    Welcome: "welcome",
    ProfileIap: "settings/iap",
  },
}

const NAVIGABLE_DEEP_LINK_PATHS = new Set(["login", "welcome", "settings/iap"])

function normalizeDeepLinkPath(path?: string | null): string {
  return (path ?? "").trim().replace(/^\/+|\/+$/g, "")
}

/**
 * This is the root component of our app.
 * @param {AppProps} props - The props for the `App` component.
 * @returns {JSX.Element} The rendered `App` component.
 */
export function App() {
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)
  const [, setI18nRenderTick] = useState(0)

  useEffect(() => {
    initCrashReporting()

    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  useEffect(() => {
    let isMounted = true

    void Linking.getInitialURL().then((url) => {
      if (!isMounted) return
      capturePendingReferralCodeFromUrl(url)
    })

    const subscription = Linking.addEventListener("url", ({ url }) => {
      capturePendingReferralCodeFromUrl(url)
    })

    return () => {
      isMounted = false
      subscription.remove()
    }
  }, [])

  useEffect(() => {
    const handleLanguageChanged = () => {
      setI18nRenderTick((value) => value + 1)
      void loadDateFnsLocale()
    }

    i18n.on("languageChanged", handleLanguageChanged)

    return () => {
      i18n.off("languageChanged", handleLanguageChanged)
    }
  }, [])

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  // In iOS: application:didFinishLaunchingWithOptions:
  // In Android: https://stackoverflow.com/a/45838109/204044
  // You can replace with your own loading component if you wish.
  if (!isNavigationStateRestored || !isI18nInitialized || (!areFontsLoaded && !fontLoadError)) {
    return null
  }

  const linking = {
    prefixes: [...appSchemePrefixes, prefix],
    config,
    getStateFromPath: (path: string, options: Parameters<typeof getStateFromPath>[1]) => {
      const normalizedPath = normalizeDeepLinkPath(path)
      if (!normalizedPath || !NAVIGABLE_DEEP_LINK_PATHS.has(normalizedPath)) {
        if (__DEV__ && normalizedPath) {
          console.log("[linking] ignored path", normalizedPath)
        }
        return undefined
      }
      return getStateFromPath(path, options)
    },
  }

  // otherwise, we're ready to render the app
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <AuthProvider>
          <LanguagePreferencesProvider>
            <AppMetaProvider>
              <UiPreferencesProvider>
                <ThemeProvider>
                  <AppNavigator
                    linking={linking}
                    initialState={initialNavigationState}
                    onStateChange={onNavigationStateChange}
                  />
                </ThemeProvider>
              </UiPreferencesProvider>
            </AppMetaProvider>
          </LanguagePreferencesProvider>
        </AuthProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  )
}
