/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { useCallback, useEffect, useRef } from "react"
import { AppState } from "react-native"
import { NavigationContainer, StackActions } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import Config from "@/config"
import { useAppMeta } from "@/context/AppMetaContext"
import { useAuth } from "@/context/AuthContext"
import { useLanguagePreferences } from "@/context/LanguagePreferencesContext"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { ForceUpdateScreen } from "@/screens/ForceUpdateScreen"
import { LoginScreen } from "@/screens/LoginScreen"
import { AppAnnouncementDetailScreen } from "@/screens/ProfileScreen/AppAnnouncementDetailScreen"
import { AppAnnouncementsScreen } from "@/screens/ProfileScreen/AppAnnouncementsScreen"
import { LanguagePreferencesScreen } from "@/screens/ProfileScreen/LanguagePreferencesScreen"
import { ProfileAccountDetailsScreen } from "@/screens/ProfileScreen/ProfileAccountDetailsScreen"
import { ProfileAchievementsScreen } from "@/screens/ProfileScreen/ProfileAchievementsScreen"
import { ProfileIapScreen } from "@/screens/ProfileScreen/ProfileIapScreen"
import { ProfileScreen } from "@/screens/ProfileScreen/ProfileScreen"
import { ProfileSettingsScreen } from "@/screens/ProfileScreen/ProfileSettingsScreen"
import { ProfileWeeklyAnalyticsScreen } from "@/screens/ProfileScreen/ProfileWeeklyAnalyticsScreen"
import { ProfileWordListScreen } from "@/screens/ProfileScreen/ProfileWordListScreen"
import { RegionSelectionScreen } from "@/screens/RegionSelectionScreen"
import { ShareCaptureScreen } from "@/screens/ShareCaptureScreen"
import { VocabularyPerfectionChallengeScreen } from "@/screens/VocabularyShowroom/challenges/perfection/VocabularyPerfectionChallengeScreen"
import { VocabularyRushChallengeScreen } from "@/screens/VocabularyShowroom/challenges/rush/VocabularyRushChallengeScreen"
import { VocabularySprintChallengeScreen } from "@/screens/VocabularyShowroom/challenges/sprint/VocabularySprintChallengeScreen"
import { VocabularyDetailScreen } from "@/screens/VocabularyShowroom/detail/VocabularyDetailScreen"
import { VocabularyReportIssueScreen } from "@/screens/VocabularyShowroom/detail/VocabularyReportIssueScreen"
import { VocabularyGroupDetailScreen } from "@/screens/VocabularyShowroom/groups/VocabularyGroupDetailScreen"
import { VocabularyGroupsScreen } from "@/screens/VocabularyShowroom/groups/VocabularyGroupsScreen"
import { VocabularyHowToUseScreen } from "@/screens/VocabularyShowroom/howToUse/VocabularyHowToUseScreen"
import { VocabularyFillInGapPracticeScreen } from "@/screens/VocabularyShowroom/practice/fillInGap/VocabularyFillInGapPracticeScreen"
import { VocabularyListenSayPracticeScreen } from "@/screens/VocabularyShowroom/practice/listenSay/VocabularyListenSayPracticeScreen"
import { VocabularyMatchSynonymsPracticeScreen } from "@/screens/VocabularyShowroom/practice/matchSynonyms/VocabularyMatchSynonymsPracticeScreen"
import { VocabularyPracticeDetailScreen } from "@/screens/VocabularyShowroom/practice/meaningMatch/VocabularyPracticeDetailScreen"
import { VocabularyPracticeScreen } from "@/screens/VocabularyShowroom/practice/VocabularyPracticeScreen"
import { VocabularyRepeatSessionScreen } from "@/screens/VocabularyShowroom/repeat/VocabularyRepeatSessionScreen"
import { VocabularySearchScreen } from "@/screens/VocabularyShowroom/search/VocabularySearchScreen"
import { VocabularyShowroomScreen } from "@/screens/VocabularyShowroom/showroom/VocabularyShowroomScreen"
import { WelcomeScreen } from "@/screens/WelcomeScreen"
import { hasSelectedHomeRegion } from "@/services/region/homeRegion"
import {
  consumeLastRepeatNotificationOpen,
  registerRepeatNotificationOpenListener,
  syncRepeatNotificationSchedules,
  type RepeatNotificationOpenTarget,
} from "@/services/repeat/repeatService"
import {
  clearPendingSharePayload,
  consumeNativeSharePayload,
  persistPendingSharePayload,
  readPendingSharePayload,
  type ShareCapturePayload,
} from "@/services/share/shareIntent"
import { useAppTheme } from "@/theme/context"
import { loadString, storageKeys } from "@/utils/storage"

import type { AppStackParamList, NavigationProps } from "./navigationTypes"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = () => {
  const { isAuthenticated, isSessionResolved } = useAuth()
  const { isResolved: isLanguagePreferencesResolved, needsOnboarding } = useLanguagePreferences()
  const { isResolved: isAppMetaResolved, bootstrap } = useAppMeta()
  const hasSeenWelcome = loadString(storageKeys.hasSeenWelcome) === "true"
  const hasRegionSelection = hasSelectedHomeRegion()
  const forceUpdateRequired = bootstrap?.update.status === "required"
  const stackKey = isAuthenticated
    ? "auth"
    : hasRegionSelection
      ? "guest-with-region"
      : "guest-without-region"

  const {
    theme: { colors },
  } = useAppTheme()

  if (
    !isSessionResolved ||
    (isAuthenticated && (!isLanguagePreferencesResolved || !isAppMetaResolved))
  ) {
    return null
  }

  return (
    <Stack.Navigator
      key={stackKey}
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
      initialRouteName={
        isAuthenticated
          ? forceUpdateRequired
            ? "ForceUpdate"
            : needsOnboarding
              ? "LanguagePreferences"
              : hasSeenWelcome
                ? "VocabularyShowroomScreen"
                : "Welcome"
          : hasRegionSelection
            ? "Login"
            : "RegionSelection"
      }
    >
      {isAuthenticated ? (
        forceUpdateRequired ? (
          <Stack.Screen name="ForceUpdate" component={ForceUpdateScreen} />
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />

            <Stack.Screen name="VocabularyShowroomScreen" component={VocabularyShowroomScreen} />
            <Stack.Screen name="VocabularyGroups" component={VocabularyGroupsScreen} />
            <Stack.Screen name="VocabularyGroupDetail" component={VocabularyGroupDetailScreen} />
            <Stack.Screen name="VocabularyHowToUse" component={VocabularyHowToUseScreen} />
            <Stack.Screen
              name="VocabularyRepeatSession"
              component={VocabularyRepeatSessionScreen}
            />
            <Stack.Screen name="AppAnnouncements" component={AppAnnouncementsScreen} />
            <Stack.Screen name="AppAnnouncementDetail" component={AppAnnouncementDetailScreen} />
            <Stack.Screen name="VocabularySearch" component={VocabularySearchScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="ProfileAchievements" component={ProfileAchievementsScreen} />
            <Stack.Screen name="ProfileAccountDetails" component={ProfileAccountDetailsScreen} />
            <Stack.Screen name="RegionSelection" component={RegionSelectionScreen} />
            <Stack.Screen name="ProfileWordList" component={ProfileWordListScreen} />
            <Stack.Screen name="ProfileWeeklyAnalytics" component={ProfileWeeklyAnalyticsScreen} />
            <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
            <Stack.Screen name="ProfileIap" component={ProfileIapScreen} />
            <Stack.Screen
              name="LanguagePreferences"
              component={LanguagePreferencesScreen}
              initialParams={{ source: "onboarding" }}
            />
            <Stack.Screen name="ShareCapture" component={ShareCaptureScreen} />
            <Stack.Screen name="VocabularyDetail" component={VocabularyDetailScreen} />
            <Stack.Screen name="VocabularyReportIssue" component={VocabularyReportIssueScreen} />
            <Stack.Screen name="VocabularyPractice" component={VocabularyPracticeScreen} />
            <Stack.Screen
              name="VocabularyPracticeDetail"
              component={VocabularyPracticeDetailScreen}
            />
            <Stack.Screen
              name="VocabularyFillInGapPractice"
              component={VocabularyFillInGapPracticeScreen}
            />
            <Stack.Screen
              name="VocabularyMatchSynonymsPractice"
              component={VocabularyMatchSynonymsPracticeScreen}
            />
            <Stack.Screen
              name="VocabularyListenSayPractice"
              component={VocabularyListenSayPracticeScreen}
            />
            <Stack.Screen
              name="VocabularyRushChallenge"
              component={VocabularyRushChallengeScreen}
            />
            <Stack.Screen
              name="VocabularyPerfectionChallenge"
              component={VocabularyPerfectionChallengeScreen}
            />
            <Stack.Screen
              name="VocabularySprintChallenge"
              component={VocabularySprintChallengeScreen}
            />
          </>
        )
      ) : (
        <>
          <Stack.Screen name="RegionSelection" component={RegionSelectionScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}

      {/** 🔥 Your screens go here */}
      {/* IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS */}
    </Stack.Navigator>
  )
}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()
  const { isAuthenticated, userId } = useAuth()
  const pendingNotificationEntryIdRef = useRef<string | undefined>(undefined)
  const pendingRepeatQueueOpenRef = useRef(false)
  const pendingSharePayloadRef = useRef<ShareCapturePayload | undefined>(undefined)
  const lastOpenedSharePayloadRef = useRef<number | undefined>(undefined)
  const isSyncingSharePayloadRef = useRef(false)

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  const openVocabularyDetail = useCallback((entryId: string) => {
    const normalizedEntryId = entryId.trim()
    if (!normalizedEntryId) return

    if (!navigationRef.isReady()) {
      pendingNotificationEntryIdRef.current = normalizedEntryId
      return
    }

    navigationRef.navigate("VocabularyDetail", { entryId: normalizedEntryId })
  }, [])

  const openRepeatQueue = useCallback(() => {
    if (!navigationRef.isReady()) {
      pendingRepeatQueueOpenRef.current = true
      return
    }

    navigationRef.navigate("VocabularyShowroomScreen", { openRepeatList: true })
  }, [])

  const openRepeatNotificationTarget = useCallback(
    (target: RepeatNotificationOpenTarget) => {
      if (target.type === "entry") {
        openVocabularyDetail(target.entryId)
        return
      }

      openRepeatQueue()
    },
    [openRepeatQueue, openVocabularyDetail],
  )

  const openShareCapture = useCallback((payload: ShareCapturePayload) => {
    if (!navigationRef.isReady()) {
      pendingSharePayloadRef.current = payload
      return
    }

    const currentRouteName = navigationRef.getCurrentRoute()?.name
    if (currentRouteName === "ForceUpdate") {
      return
    }

    pendingSharePayloadRef.current = undefined
    lastOpenedSharePayloadRef.current = payload.receivedAt
    clearPendingSharePayload()

    if (currentRouteName === "ShareCapture") {
      navigationRef.dispatch(StackActions.replace("ShareCapture", { payload }))
      return
    }

    navigationRef.navigate("ShareCapture", { payload })
  }, [])

  const syncIncomingSharePayload = useCallback(async () => {
    if (isSyncingSharePayloadRef.current) return
    isSyncingSharePayloadRef.current = true

    try {
      const incomingPayload = await consumeNativeSharePayload()
      if (incomingPayload) {
        persistPendingSharePayload(incomingPayload)
      }

      if (!isAuthenticated) return

      const payload = incomingPayload ?? readPendingSharePayload()
      if (!payload) return
      if (lastOpenedSharePayloadRef.current === payload.receivedAt) return

      openShareCapture(payload)
    } finally {
      isSyncingSharePayloadRef.current = false
    }
  }, [isAuthenticated, openShareCapture])

  useEffect(() => {
    if (!isAuthenticated) {
      pendingNotificationEntryIdRef.current = undefined
      pendingRepeatQueueOpenRef.current = false
      return
    }

    let cleanup: (() => void) | undefined
    let cancelled = false

    void (async () => {
      await syncRepeatNotificationSchedules(userId)
      const unsubscribe = await registerRepeatNotificationOpenListener(openRepeatNotificationTarget)
      if (cancelled) {
        unsubscribe()
        return
      }
      cleanup = unsubscribe
      await consumeLastRepeatNotificationOpen(openRepeatNotificationTarget)
    })()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [isAuthenticated, openRepeatNotificationTarget, userId])

  useEffect(() => {
    void syncIncomingSharePayload()

    let previousAppState = AppState.currentState
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const becameActive = previousAppState !== "active" && nextAppState === "active"
      previousAppState = nextAppState

      if (becameActive) {
        void syncIncomingSharePayload()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [syncIncomingSharePayload])

  const { onReady: externalOnReady, ...navigationProps } = props

  const handleNavigationReady = useCallback(() => {
    externalOnReady?.()

    const pendingEntryId = pendingNotificationEntryIdRef.current
    if (pendingEntryId) {
      pendingNotificationEntryIdRef.current = undefined
      openVocabularyDetail(pendingEntryId)
    }

    if (pendingRepeatQueueOpenRef.current) {
      pendingRepeatQueueOpenRef.current = false
      openRepeatQueue()
    }

    const pendingSharePayload = pendingSharePayloadRef.current
    if (pendingSharePayload && isAuthenticated) {
      openShareCapture(pendingSharePayload)
    }
  }, [externalOnReady, isAuthenticated, openRepeatQueue, openShareCapture, openVocabularyDetail])

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      onReady={handleNavigationReady}
      {...navigationProps}
    >
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppStack />
      </ErrorBoundary>
    </NavigationContainer>
  )
}
