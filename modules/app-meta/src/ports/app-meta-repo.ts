import type {
  AnnouncementLevel,
  AppAnnouncement,
  AppAnnouncementRewardClaimResult,
  AppAnnouncementRewardCreditType,
  AppAnnouncementRewardRequirementType,
  AppAnnouncementsSummary,
  AppTutorialVideo,
  AppTutorialVideoPlatform,
} from "../domain/app-meta";

export type CreateAnnouncementInput = {
  level: AnnouncementLevel;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  deepLink?: string;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
  rewardCreditType?: AppAnnouncementRewardCreditType;
  rewardAmount?: number;
  rewardRequirementType?: AppAnnouncementRewardRequirementType;
  rewardRequirementCount?: number;
};

export type CreateTutorialVideoInput = {
  slug: string;
  screen: string;
  placement: string;
  locale: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  platform: AppTutorialVideoPlatform;
  priority: number;
  minAppVersion?: string;
  maxAppVersion?: string;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
};

export type ListTutorialVideosInput = {
  locale?: string;
  screen?: string;
  placement?: string;
  platform?: AppTutorialVideoPlatform;
  appVersion?: string;
  limit: number;
};

export interface AppMetaRepo {
  createTutorialVideo(input: CreateTutorialVideoInput): Promise<AppTutorialVideo>;
  listActiveTutorialVideos(input: ListTutorialVideosInput): Promise<AppTutorialVideo[]>;
  createAnnouncement(input: CreateAnnouncementInput): Promise<AppAnnouncement>;
  listActiveAnnouncements(input: { userId: string; limit: number }): Promise<AppAnnouncement[]>;
  getAnnouncementsSummary(userId: string): Promise<AppAnnouncementsSummary>;
  markAnnouncementRead(input: { userId: string; announcementId: string }): Promise<boolean>;
  markAllAnnouncementsRead(userId: string): Promise<number>;
  claimAnnouncementReward(input: {
    userId: string;
    announcementId: string;
  }): Promise<AppAnnouncementRewardClaimResult>;
}
