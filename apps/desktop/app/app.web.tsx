if (__DEV__) {
  require("./devtools/ReactotronConfig")
}
import "./utils/gestureHandler"

import { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import * as Linking from "expo-linking"
import i18n from "i18next"
import { getStateFromPath } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { AppBootScreen } from "./components/AppBootScreen"
import { AuthProvider } from "./context/AuthContext"
import { AppMetaProvider } from "./context/AppMetaContext"
import { LanguagePreferencesProvider } from "./context/LanguagePreferencesContext"
import { UiPreferencesProvider } from "./context/UiPreferencesContext"
import { initI18n } from "./i18n"
import { AppNavigator } from "./navigators/AppNavigator"
import { useNavigationPersistence } from "./navigators/navigationUtilities"
import { isDesktopExternalAuthPage, persistDesktopShellRuntimeFromUrl } from "./services/auth/desktopAuthBridge"
import { isDesktopQuickLookupPage } from "./services/desktop/desktopQuickLookupBridge"
import { DesktopExternalAuthPage } from "./screens/LoginScreen/DesktopExternalAuthPage"
import { DesktopQuickLookupStandalone } from "./screens/QuickLookupScreen/DesktopQuickLookupStandalone"
import { ThemeProvider } from "./theme/context"
import { customFontsToLoad } from "./theme/typography"
import { loadDateFnsLocale } from "./utils/formatDate"
import { initCrashReporting } from "./utils/crashReporting"
import * as storage from "./utils/storage"
import { capturePendingReferralCodeFromUrl } from "./services/referral/pendingReferral"

persistDesktopShellRuntimeFromUrl()

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

const prefix = Linking.createURL("/")
const appSchemePrefixes = ["vocorbit://", "com.vocorbit://"]
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

export function App() {
  if (typeof window !== "undefined" && isDesktopExternalAuthPage()) {
    return <DesktopExternalAuthPage />
  }

  if (typeof window !== "undefined" && isDesktopQuickLookupPage()) {
    return (
      <SafeAreaProvider>
        <DesktopQuickLookupStandalone />
      </SafeAreaProvider>
    )
  }

  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)
  const [, setI18nRenderTick] = useState(0)

  useEffect(() => {
    if (typeof document === "undefined") return

    document.documentElement.style.backgroundColor = "#0B0E16"
    document.body.style.backgroundColor = "#0B0E16"
    document.body.style.margin = "0"
  }, [])

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

  if (!isNavigationStateRestored || !isI18nInitialized || (!areFontsLoaded && !fontLoadError)) {
    return <AppBootScreen message="Setting up your desktop workspace..." />
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

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  )
}
