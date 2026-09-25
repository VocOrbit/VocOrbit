import { backendApiClient } from "./backendClient"
import type { GeneralApiProblem } from "./apiProblem"

export type MobilePlatform = "ios" | "android"

export type MobileUpdateStatus = "none" | "recommended" | "required"

export type AppBootstrapPayload = {
  serverTime: string
  update: {
    platform: MobilePlatform
    currentVersion?: string
    latestVersion?: string
    minimumSupportedVersion?: string
    status: MobileUpdateStatus
    title?: string
    message?: string
    storeUrl?: string
  }
  announcements: {
    unreadCount: number
    totalActiveCount: number
  }
}

export type AppAnnouncement = {
  id: string
  level: "info" | "warning" | "critical"
  title: string
  body: string
  ctaLabel?: string
  ctaUrl?: string
  deepLink?: string
  isActive: boolean
  startsAt?: string
  endsAt?: string
  createdAt: string
  updatedAt: string
  isRead: boolean
  readAt?: string
  reward?: {
    creditType: "basic" | "advanced"
    amount: number
    isClaimed: boolean
    claimedAt?: string
    canClaim: boolean
    requirement?: {
      type: "referral_signup"
      requiredCount: number
      currentCount: number
      referralCode?: string
    }
  }
}

export type AppTutorialVideo = {
  id: string
  slug: string
  screen: string
  placement: string
  locale: string
  title: string
  description?: string
  youtubeUrl: string
  thumbnailUrl?: string
  durationSeconds?: number
  platform: MobilePlatform | "all"
  priority: number
  minAppVersion?: string
  maxAppVersion?: string
  isActive: boolean
  startsAt?: string
  endsAt?: string
  createdAt: string
  updatedAt: string
}

export const appMetaApi = {
  async getBootstrap(input: {
    platform: MobilePlatform
    appVersion?: string
  }): Promise<{ kind: "ok"; data: AppBootstrapPayload } | GeneralApiProblem> {
    return backendApiClient.get<AppBootstrapPayload>("/v1/app/bootstrap", {
      platform: input.platform,
      appVersion: input.appVersion,
    })
  },

  async listAnnouncements(input?: {
    limit?: number
  }): Promise<{ kind: "ok"; data: AppAnnouncement[] } | GeneralApiProblem> {
    return backendApiClient.get<AppAnnouncement[]>("/v1/app/announcements", {
      limit:
        typeof input?.limit === "number" ? String(Math.max(1, Math.floor(input.limit))) : undefined,
    })
  },

  async listTutorialVideos(input: {
    locale?: string
    screen: string
    placement: string
    platform: MobilePlatform
    appVersion?: string
    limit?: number
  }): Promise<{ kind: "ok"; data: AppTutorialVideo[] } | GeneralApiProblem> {
    return backendApiClient.get<AppTutorialVideo[]>("/v1/app/tutorial-videos", {
      locale: input.locale,
      screen: input.screen,
      placement: input.placement,
      platform: input.platform,
      appVersion: input.appVersion,
      limit:
        typeof input.limit === "number" ? String(Math.max(1, Math.floor(input.limit))) : undefined,
    })
  },

  async markAnnouncementRead(
    announcementId: string,
  ): Promise<
    { kind: "ok"; data: { announcementId: string; marked: boolean } } | GeneralApiProblem
  > {
    return backendApiClient.post<{ announcementId: string; marked: boolean }>(
      `/v1/app/announcements/${announcementId}/read`,
      undefined,
    )
  },

  async markAllAnnouncementsRead(): Promise<
    { kind: "ok"; data: { markedCount: number } } | GeneralApiProblem
  > {
    return backendApiClient.post<{ markedCount: number }>(
      "/v1/app/announcements/read-all",
      undefined,
    )
  },

  async claimAnnouncementReward(announcementId: string): Promise<
    | {
        kind: "ok"
        data: {
          announcementId: string
          claimed: boolean
          reward?: { creditType: "basic" | "advanced"; amount: number }
          claimedAt?: string
          reason?:
            | "announcement_not_found"
            | "announcement_inactive"
            | "no_reward_configured"
            | "already_claimed"
            | "reward_requirement_not_met"
          requirement?: {
            type: "referral_signup"
            requiredCount: number
            currentCount: number
            referralCode?: string
          }
        }
      }
    | GeneralApiProblem
  > {
    return backendApiClient.post<{
      announcementId: string
      claimed: boolean
      reward?: { creditType: "basic" | "advanced"; amount: number }
      claimedAt?: string
      reason?:
        | "announcement_not_found"
        | "announcement_inactive"
        | "no_reward_configured"
        | "already_claimed"
        | "reward_requirement_not_met"
      requirement?: {
        type: "referral_signup"
        requiredCount: number
        currentCount: number
        referralCode?: string
      }
    }>(`/v1/app/announcements/${announcementId}/claim`, undefined)
  },
}
