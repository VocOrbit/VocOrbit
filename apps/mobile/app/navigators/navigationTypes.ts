import { ComponentProps } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"

import type { ProfileAchievementSnapshot } from "@/screens/ProfileScreen/profileAchievementsModel"
import type { VocabularyEntry } from "@/screens/VocabularyShowroom/types"
import type { AppAnnouncement } from "@/services/api/appMetaApi"
import type { ShareCapturePayload } from "@/services/share/shareIntent"

export type PracticeMode = "basic" | "advanced"

// App Stack Navigator types
export type AppStackParamList = {
  Welcome: undefined
  RegionSelection: { source?: "onboarding" | "settings" } | undefined
  Login: undefined
  ForceUpdate: undefined
  VocabularyShowroomScreen: { openRepeatList?: boolean; openVocabularyAll?: boolean } | undefined
  VocabularyGroups: undefined
  VocabularyGroupDetail: { groupId: string; groupName: string; itemCount?: number }
  VocabularyHowToUse: undefined
  VocabularyRepeatSession: undefined
  AppAnnouncements: undefined
  AppAnnouncementDetail: { announcement: AppAnnouncement }
  VocabularySearch:
    | {
        targetGroupId?: string
        targetGroupName?: string
      }
    | undefined
  Profile: undefined
  ProfileAchievements: { snapshot: ProfileAchievementSnapshot }
  ProfileAccountDetails: undefined
  ProfileWordList: { mode: "favorites" | "learned" }
  ProfileWeeklyAnalytics: undefined
  ProfileSettings: undefined
  ProfileIap: undefined
  LanguagePreferences: { source: "onboarding" | "settings" }
  ShareCapture: { payload: ShareCapturePayload }
  VocabularyDetail: { entryId: VocabularyEntry["id"] }
  VocabularyReportIssue: { entryId: VocabularyEntry["id"]; word: string }
  VocabularyPractice: undefined
  VocabularyPracticeDetail: { practiceId: string; mode: PracticeMode; groupIds?: string[] }
  VocabularyFillInGapPractice: { mode: PracticeMode; groupIds?: string[] }
  VocabularyMatchSynonymsPractice: { mode: PracticeMode; groupIds?: string[] }
  VocabularyListenSayPractice: { mode: PracticeMode; groupIds?: string[] }
  VocabularyRushChallenge: undefined
  VocabularyPerfectionChallenge: undefined
  VocabularySprintChallenge: undefined
  // 🔥 Your screens go here
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

export interface NavigationProps extends Partial<
  ComponentProps<typeof NavigationContainer<AppStackParamList>>
> {}
