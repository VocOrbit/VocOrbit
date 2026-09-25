import type {
  AppAnnouncement,
  AppAnnouncementRewardClaimResult,
  AppBootstrap,
  AppPlatform,
  AppTutorialVideo,
} from "./domain/app-meta";
import type { AppMetaRepo } from "./ports/app-meta-repo";
import { claimAnnouncementReward } from "./use-cases/claim-announcement-reward";
import { createAnnouncement } from "./use-cases/create-announcement";
import { createTutorialVideo } from "./use-cases/create-tutorial-video";
import { type AppBootstrapConfig, getBootstrap } from "./use-cases/get-bootstrap";
import { listAnnouncements } from "./use-cases/list-announcements";
import { listTutorialVideos } from "./use-cases/list-tutorial-videos";
import { markAllAnnouncementsRead } from "./use-cases/mark-all-announcements-read";
import { markAnnouncementRead } from "./use-cases/mark-announcement-read";

type AppMetaDeps = {
  repo: AppMetaRepo;
  bootstrapConfig: AppBootstrapConfig;
};

export interface AppMetaPublicContract {
  getBootstrap(input: {
    userId: string;
    platform: AppPlatform;
    appVersion?: string;
  }): Promise<AppBootstrap>;
  listTutorialVideos(input: {
    locale?: string;
    screen?: string;
    placement?: string;
    platform?: string;
    appVersion?: string;
    limit?: number;
  }): Promise<AppTutorialVideo[]>;
  createTutorialVideo(input: {
    slug: string;
    screen: string;
    placement: string;
    locale?: string;
    title: string;
    description?: string;
    youtubeUrl: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    platform?: string;
    priority?: number;
    minAppVersion?: string;
    maxAppVersion?: string;
    isActive?: boolean;
    startsAt?: string;
    endsAt?: string;
  }): Promise<AppTutorialVideo>;
  listAnnouncements(input: { userId: string; limit?: number }): Promise<AppAnnouncement[]>;
  markAnnouncementRead(input: {
    userId: string;
    announcementId: string;
  }): Promise<{ announcementId: string; marked: boolean }>;
  markAllAnnouncementsRead(input: { userId: string }): Promise<{ markedCount: number }>;
  claimAnnouncementReward(input: {
    userId: string;
    announcementId: string;
  }): Promise<AppAnnouncementRewardClaimResult>;
  createAnnouncement(input: {
    level?: string;
    title: string;
    body: string;
    ctaLabel?: string;
    ctaUrl?: string;
    deepLink?: string;
    isActive?: boolean;
    startsAt?: string;
    endsAt?: string;
    rewardCreditType?: string;
    rewardAmount?: number;
    rewardRequirementType?: string;
    rewardRequirementCount?: number;
  }): Promise<AppAnnouncement>;
}

export function createAppMetaPublicContract(deps: AppMetaDeps): AppMetaPublicContract {
  return {
    getBootstrap(input) {
      return getBootstrap(deps.repo, deps.bootstrapConfig, input);
    },
    listAnnouncements(input) {
      return listAnnouncements(deps.repo, input);
    },
    listTutorialVideos(input) {
      return listTutorialVideos(deps.repo, input);
    },
    createTutorialVideo(input) {
      return createTutorialVideo(deps.repo, input);
    },
    markAnnouncementRead(input) {
      return markAnnouncementRead(deps.repo, input);
    },
    markAllAnnouncementsRead(input) {
      return markAllAnnouncementsRead(deps.repo, input);
    },
    claimAnnouncementReward(input) {
      return claimAnnouncementReward(deps.repo, input);
    },
    createAnnouncement(input) {
      return createAnnouncement(deps.repo, input);
    },
  };
}
