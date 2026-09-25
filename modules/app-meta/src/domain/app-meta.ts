export type AnnouncementLevel = "info" | "warning" | "critical";

export type AppPlatform = "ios" | "android";

export type AppTutorialVideoPlatform = AppPlatform | "all";

export type AppTutorialVideo = {
  id: string;
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
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type AppUpdateStatus = "none" | "recommended" | "required";

export type AppAnnouncementRewardCreditType = "basic" | "advanced";
export type AppAnnouncementRewardRequirementType = "referral_signup";

export type AppAnnouncementRewardRequirement = {
  type: AppAnnouncementRewardRequirementType;
  requiredCount: number;
  currentCount: number;
  referralCode?: string;
};

export type AppAnnouncementReward = {
  creditType: AppAnnouncementRewardCreditType;
  amount: number;
  isClaimed: boolean;
  claimedAt?: string;
  canClaim: boolean;
  requirement?: AppAnnouncementRewardRequirement;
};

export type AppAnnouncement = {
  id: string;
  level: AnnouncementLevel;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  deepLink?: string;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  readAt?: string;
  reward?: AppAnnouncementReward;
};

export type AppAnnouncementRewardClaimFailureReason =
  | "announcement_not_found"
  | "announcement_inactive"
  | "no_reward_configured"
  | "already_claimed"
  | "reward_requirement_not_met";

export type AppAnnouncementRewardClaimResult = {
  announcementId: string;
  claimed: boolean;
  reward?: {
    creditType: AppAnnouncementRewardCreditType;
    amount: number;
  };
  claimedAt?: string;
  reason?: AppAnnouncementRewardClaimFailureReason;
  requirement?: AppAnnouncementRewardRequirement;
};

export type AppAnnouncementsSummary = {
  unreadCount: number;
  totalActiveCount: number;
};

export type AppBootstrapUpdate = {
  platform: AppPlatform;
  currentVersion?: string;
  latestVersion?: string;
  minimumSupportedVersion?: string;
  status: AppUpdateStatus;
  title?: string;
  message?: string;
  storeUrl?: string;
};

export type AppBootstrap = {
  serverTime: string;
  update: AppBootstrapUpdate;
  announcements: AppAnnouncementsSummary;
};
