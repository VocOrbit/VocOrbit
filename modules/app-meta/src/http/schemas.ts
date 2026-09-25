import { t } from "elysia";

export const appBootstrapQuerySchema = t.Object(
  {
    platform: t.Optional(t.Union([t.Literal("ios"), t.Literal("android")])),
    appVersion: t.Optional(t.String({ minLength: 1, maxLength: 64 })),
  },
  { additionalProperties: false },
);

export const appAnnouncementsQuerySchema = t.Object(
  {
    limit: t.Optional(t.String()),
  },
  { additionalProperties: false },
);

export const appTutorialVideosQuerySchema = t.Object(
  {
    locale: t.Optional(t.String({ minLength: 1, maxLength: 32 })),
    screen: t.Optional(t.String({ minLength: 1, maxLength: 120 })),
    placement: t.Optional(t.String({ minLength: 1, maxLength: 120 })),
    platform: t.Optional(t.Union([t.Literal("all"), t.Literal("ios"), t.Literal("android")])),
    appVersion: t.Optional(t.String({ minLength: 1, maxLength: 64 })),
    limit: t.Optional(t.String()),
  },
  { additionalProperties: false },
);

export const announcementIdParamsSchema = t.Object({
  id: t.String({ minLength: 1 }),
});

export const createTutorialVideoBodySchema = t.Object(
  {
    slug: t.String({ minLength: 1, maxLength: 120 }),
    screen: t.String({ minLength: 1, maxLength: 120 }),
    placement: t.String({ minLength: 1, maxLength: 120 }),
    locale: t.Optional(t.String({ minLength: 1, maxLength: 32 })),
    title: t.String({ minLength: 1, maxLength: 180 }),
    description: t.Optional(t.String({ minLength: 1, maxLength: 2000 })),
    youtubeUrl: t.String({ minLength: 1, maxLength: 1000 }),
    thumbnailUrl: t.Optional(t.String({ minLength: 1, maxLength: 1000 })),
    durationSeconds: t.Optional(t.Integer({ minimum: 1 })),
    platform: t.Optional(t.Union([t.Literal("all"), t.Literal("ios"), t.Literal("android")])),
    priority: t.Optional(t.Integer({ minimum: 0 })),
    minAppVersion: t.Optional(t.String({ minLength: 1, maxLength: 64 })),
    maxAppVersion: t.Optional(t.String({ minLength: 1, maxLength: 64 })),
    isActive: t.Optional(t.Boolean()),
    startsAt: t.Optional(t.String({ minLength: 1, maxLength: 80 })),
    endsAt: t.Optional(t.String({ minLength: 1, maxLength: 80 })),
  },
  { additionalProperties: false },
);

export const createAnnouncementBodySchema = t.Object(
  {
    level: t.Optional(t.Union([t.Literal("info"), t.Literal("warning"), t.Literal("critical")])),
    title: t.String({ minLength: 1, maxLength: 180 }),
    body: t.String({ minLength: 1, maxLength: 5000 }),
    ctaLabel: t.Optional(t.String({ minLength: 1, maxLength: 80 })),
    ctaUrl: t.Optional(t.String({ minLength: 1, maxLength: 1000 })),
    deepLink: t.Optional(t.String({ minLength: 1, maxLength: 1000 })),
    isActive: t.Optional(t.Boolean()),
    startsAt: t.Optional(t.String({ minLength: 1, maxLength: 80 })),
    endsAt: t.Optional(t.String({ minLength: 1, maxLength: 80 })),
    rewardCreditType: t.Optional(t.Union([t.Literal("basic"), t.Literal("advanced")])),
    rewardAmount: t.Optional(t.Integer({ minimum: 1 })),
    rewardRequirementType: t.Optional(t.Union([t.Literal("referral_signup")])),
    rewardRequirementCount: t.Optional(t.Integer({ minimum: 1 })),
  },
  { additionalProperties: false },
);
