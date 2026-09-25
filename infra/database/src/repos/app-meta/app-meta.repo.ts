import {
  type SQL,
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  AppAnnouncement,
  AppAnnouncementReward,
  AppAnnouncementRewardClaimResult,
  AppAnnouncementRewardCreditType,
  AppAnnouncementRewardRequirement,
  AppAnnouncementRewardRequirementType,
  AppAnnouncementsSummary,
  AppTutorialVideo,
  AppTutorialVideoPlatform,
} from "../../../../../modules/app-meta/src/domain/app-meta";
import type {
  AppMetaRepo,
  CreateAnnouncementInput,
  CreateTutorialVideoInput,
  ListTutorialVideosInput,
} from "../../../../../modules/app-meta/src/ports/app-meta-repo";
import { newId } from "../../../../../packages/core/src/ids";
import {
  appAnnouncementReads,
  appAnnouncementRewardClaims,
  appAnnouncements,
  appTutorialVideos,
  creditLedger,
  userCredits,
  users,
} from "../../schema";

function resolveActiveWindow(now: Date) {
  return and(
    eq(appAnnouncements.isActive, true),
    or(isNull(appAnnouncements.startsAt), lte(appAnnouncements.startsAt, now)),
    or(isNull(appAnnouncements.endsAt), gt(appAnnouncements.endsAt, now)),
  );
}

function resolveTutorialVideoActiveWindow(now: Date) {
  return and(
    eq(appTutorialVideos.isActive, true),
    or(isNull(appTutorialVideos.startsAt), lte(appTutorialVideos.startsAt, now)),
    or(isNull(appTutorialVideos.endsAt), gt(appTutorialVideos.endsAt, now)),
  );
}

function normalizeTutorialVideoPlatform(
  value: string | null | undefined,
): AppTutorialVideoPlatform {
  if (value === "ios" || value === "android" || value === "all") {
    return value;
  }
  return "all";
}

function resolveLocaleCandidates(locale: string | undefined): string[] | undefined {
  if (!locale) return undefined;
  const normalized = locale.trim().toLowerCase().replaceAll("_", "-");
  if (!normalized) return undefined;
  if (normalized === "all") return ["all"];
  const base = normalized.split("-")[0];
  return [...new Set([normalized, base, "en", "all"].filter(Boolean))];
}

function normalizeVersion(value: string | undefined): number[] {
  if (!value) return [];
  const normalized = value.trim();
  if (!normalized) return [];
  const mainPart = normalized.split("-")[0]?.split("+")[0]?.trim() ?? "";
  if (!mainPart) return [];
  return mainPart.split(".").map((part) => {
    const numeric = Number.parseInt(part.replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
  });
}

function compareVersions(a: string | undefined, b: string | undefined): number {
  const partsA = normalizeVersion(a);
  const partsB = normalizeVersion(b);
  const maxLength = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < maxLength; i += 1) {
    const va = partsA[i] ?? 0;
    const vb = partsB[i] ?? 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

function matchesAppVersion(
  video: { minAppVersion?: string; maxAppVersion?: string },
  appVersion: string | undefined,
): boolean {
  if (!appVersion) return true;
  if (video.minAppVersion && compareVersions(appVersion, video.minAppVersion) < 0) return false;
  if (video.maxAppVersion && compareVersions(appVersion, video.maxAppVersion) > 0) return false;
  return true;
}

function isAnnouncementActiveAt(
  input: { isActive: boolean; startsAt: Date | null; endsAt: Date | null },
  now: Date,
): boolean {
  if (!input.isActive) return false;
  if (input.startsAt && input.startsAt.getTime() > now.getTime()) return false;
  if (input.endsAt && input.endsAt.getTime() <= now.getTime()) return false;
  return true;
}

function normalizeRewardCreditType(
  value: string | null | undefined,
): AppAnnouncementRewardCreditType | undefined {
  if (value === "basic" || value === "advanced") {
    return value;
  }
  return undefined;
}

function normalizeRewardRequirementType(
  value: string | null | undefined,
): AppAnnouncementRewardRequirementType | undefined {
  if (value === "referral_signup") {
    return value;
  }
  return undefined;
}

function normalizeRewardRequirementCount(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 1;
  const normalized = Math.floor(value);
  return normalized > 0 ? normalized : 1;
}

function mapRewardRequirement(input: {
  rewardRequirementType: string | null;
  rewardRequirementCount: number | null;
  referralQualifiedCount: number;
  referralCode?: string | null;
}): AppAnnouncementRewardRequirement | undefined {
  const type = normalizeRewardRequirementType(input.rewardRequirementType);
  if (!type) return undefined;
  const currentCountRaw = Number(input.referralQualifiedCount ?? 0);
  const currentCount = Number.isFinite(currentCountRaw)
    ? Math.max(0, Math.floor(currentCountRaw))
    : 0;

  return {
    type,
    requiredCount: normalizeRewardRequirementCount(input.rewardRequirementCount),
    currentCount,
    referralCode: input.referralCode ?? undefined,
  };
}

function mapReward(row: {
  rewardCreditType: string | null;
  rewardAmount: number | null;
  claimedAt: Date | null;
  rewardRequirementType: string | null;
  rewardRequirementCount: number | null;
  referralQualifiedCount: number;
  referralCode?: string | null;
}): AppAnnouncementReward | undefined {
  const creditType = normalizeRewardCreditType(row.rewardCreditType);
  const amount = row.rewardAmount ?? 0;
  if (!creditType || amount <= 0) return undefined;
  const requirement = mapRewardRequirement(row);
  const requirementSatisfied =
    !requirement || requirement.currentCount >= requirement.requiredCount;

  return {
    creditType,
    amount,
    isClaimed: Boolean(row.claimedAt),
    claimedAt: row.claimedAt?.toISOString(),
    canClaim: !row.claimedAt && requirementSatisfied,
    requirement,
  };
}

function mapAnnouncement(row: {
  id: string;
  level: string;
  title: string;
  body: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  deepLink: string | null;
  rewardCreditType: string | null;
  rewardAmount: number | null;
  rewardRequirementType: string | null;
  rewardRequirementCount: number | null;
  referralQualifiedCount: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  readAt: Date | null;
  claimedAt: Date | null;
  referralCode?: string | null;
}): AppAnnouncement {
  return {
    id: row.id,
    level:
      row.level === "critical" || row.level === "warning" || row.level === "info"
        ? row.level
        : "info",
    title: row.title,
    body: row.body,
    ctaLabel: row.ctaLabel ?? undefined,
    ctaUrl: row.ctaUrl ?? undefined,
    deepLink: row.deepLink ?? undefined,
    isActive: row.isActive,
    startsAt: row.startsAt?.toISOString(),
    endsAt: row.endsAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    isRead: Boolean(row.readAt),
    readAt: row.readAt?.toISOString(),
    reward: mapReward(row),
  };
}

function mapTutorialVideo(row: {
  id: string;
  slug: string;
  screen: string;
  placement: string;
  locale: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  platform: string;
  priority: number;
  minAppVersion: string | null;
  maxAppVersion: string | null;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): AppTutorialVideo {
  return {
    id: row.id,
    slug: row.slug,
    screen: row.screen,
    placement: row.placement,
    locale: row.locale,
    title: row.title,
    description: row.description ?? undefined,
    youtubeUrl: row.youtubeUrl,
    thumbnailUrl: row.thumbnailUrl ?? undefined,
    durationSeconds: row.durationSeconds ?? undefined,
    platform: normalizeTutorialVideoPlatform(row.platform),
    priority: row.priority,
    minAppVersion: row.minAppVersion ?? undefined,
    maxAppVersion: row.maxAppVersion ?? undefined,
    isActive: row.isActive,
    startsAt: row.startsAt?.toISOString(),
    endsAt: row.endsAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function resolveReferralRequirementState(
  db: Pick<PostgresJsDatabase, "select">,
  input: {
    userId: string;
    requirementType: string | null;
    requirementCount: number | null;
    windowStartsAt: Date;
    now: Date;
  },
): Promise<AppAnnouncementRewardRequirement | undefined> {
  const type = normalizeRewardRequirementType(input.requirementType);
  if (!type) return undefined;

  const [countRow, userRow] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(
        and(
          eq(users.referredByUserId, input.userId),
          gte(users.referredAt, input.windowStartsAt),
          lte(users.referredAt, input.now),
        ),
      )
      .limit(1),
    db
      .select({ referralCode: users.referralCode })
      .from(users)
      .where(eq(users.id, input.userId))
      .limit(1),
  ]);

  return {
    type,
    requiredCount: normalizeRewardRequirementCount(input.requirementCount),
    currentCount: Number(countRow[0]?.count ?? 0),
    referralCode: userRow[0]?.referralCode ?? undefined,
  };
}

export function createAppMetaRepo(db: PostgresJsDatabase): AppMetaRepo {
  return {
    async createTutorialVideo(input: CreateTutorialVideoInput): Promise<AppTutorialVideo> {
      const now = new Date();
      const insertedRows = await db
        .insert(appTutorialVideos)
        .values({
          id: newId(),
          slug: input.slug,
          screen: input.screen,
          placement: input.placement,
          locale: input.locale,
          title: input.title,
          description: input.description ?? null,
          youtubeUrl: input.youtubeUrl,
          thumbnailUrl: input.thumbnailUrl ?? null,
          durationSeconds: input.durationSeconds ?? null,
          platform: input.platform,
          priority: input.priority,
          minAppVersion: input.minAppVersion ?? null,
          maxAppVersion: input.maxAppVersion ?? null,
          isActive: input.isActive ?? true,
          startsAt: input.startsAt ? new Date(input.startsAt) : null,
          endsAt: input.endsAt ? new Date(input.endsAt) : null,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const row = insertedRows[0];
      if (!row) {
        throw new Error("Failed to create app tutorial video");
      }

      return mapTutorialVideo(row);
    },

    async listActiveTutorialVideos(input: ListTutorialVideosInput): Promise<AppTutorialVideo[]> {
      const now = new Date();
      const filters: SQL[] = [];
      const activeWindow = resolveTutorialVideoActiveWindow(now);
      if (activeWindow) {
        filters.push(activeWindow);
      }

      if (input.screen) {
        filters.push(eq(appTutorialVideos.screen, input.screen));
      }
      if (input.placement) {
        filters.push(eq(appTutorialVideos.placement, input.placement));
      }

      if (input.platform === "all") {
        filters.push(eq(appTutorialVideos.platform, "all"));
      } else if (input.platform) {
        const platformFilter = or(
          eq(appTutorialVideos.platform, "all"),
          eq(appTutorialVideos.platform, input.platform),
        );
        if (platformFilter) {
          filters.push(platformFilter);
        }
      }

      const localeCandidates = resolveLocaleCandidates(input.locale);
      if (localeCandidates?.length) {
        filters.push(inArray(appTutorialVideos.locale, localeCandidates));
      }

      const fetchLimit = Math.min(Math.max(input.limit * 5, 100), 500);
      const rows = await db
        .select()
        .from(appTutorialVideos)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(asc(appTutorialVideos.priority), desc(appTutorialVideos.createdAt))
        .limit(fetchLimit);

      return rows
        .map(mapTutorialVideo)
        .filter((video) => matchesAppVersion(video, input.appVersion))
        .slice(0, input.limit);
    },

    async createAnnouncement(input: CreateAnnouncementInput): Promise<AppAnnouncement> {
      const now = new Date();
      const insertedRows = await db
        .insert(appAnnouncements)
        .values({
          id: newId(),
          level: input.level,
          title: input.title,
          body: input.body,
          ctaLabel: input.ctaLabel ?? null,
          ctaUrl: input.ctaUrl ?? null,
          deepLink: input.deepLink ?? null,
          rewardCreditType: input.rewardCreditType ?? null,
          rewardAmount: input.rewardAmount ?? null,
          rewardRequirementType: input.rewardRequirementType ?? null,
          rewardRequirementCount: input.rewardRequirementCount ?? null,
          isActive: input.isActive ?? true,
          startsAt: input.startsAt ? new Date(input.startsAt) : null,
          endsAt: input.endsAt ? new Date(input.endsAt) : null,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const row = insertedRows[0];
      if (!row) {
        throw new Error("Failed to create app announcement");
      }

      return mapAnnouncement({
        id: row.id,
        level: row.level,
        title: row.title,
        body: row.body,
        ctaLabel: row.ctaLabel,
        ctaUrl: row.ctaUrl,
        deepLink: row.deepLink,
        rewardCreditType: row.rewardCreditType,
        rewardAmount: row.rewardAmount,
        rewardRequirementType: row.rewardRequirementType,
        rewardRequirementCount: row.rewardRequirementCount,
        referralQualifiedCount: 0,
        referralCode: null,
        isActive: row.isActive,
        startsAt: row.startsAt,
        endsAt: row.endsAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        readAt: null,
        claimedAt: null,
      });
    },

    async listActiveAnnouncements(input: {
      userId: string;
      limit: number;
    }): Promise<AppAnnouncement[]> {
      const now = new Date();
      const referralCodeRows = await db
        .select({ referralCode: users.referralCode })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);
      const userReferralCode = referralCodeRows[0]?.referralCode ?? null;
      const rows = await db
        .select({
          id: appAnnouncements.id,
          level: appAnnouncements.level,
          title: appAnnouncements.title,
          body: appAnnouncements.body,
          ctaLabel: appAnnouncements.ctaLabel,
          ctaUrl: appAnnouncements.ctaUrl,
          deepLink: appAnnouncements.deepLink,
          rewardCreditType: appAnnouncements.rewardCreditType,
          rewardAmount: appAnnouncements.rewardAmount,
          rewardRequirementType: appAnnouncements.rewardRequirementType,
          rewardRequirementCount: appAnnouncements.rewardRequirementCount,
          isActive: appAnnouncements.isActive,
          startsAt: appAnnouncements.startsAt,
          endsAt: appAnnouncements.endsAt,
          createdAt: appAnnouncements.createdAt,
          updatedAt: appAnnouncements.updatedAt,
          readAt: appAnnouncementReads.readAt,
          claimedAt: appAnnouncementRewardClaims.claimedAt,
        })
        .from(appAnnouncements)
        .leftJoin(
          appAnnouncementReads,
          and(
            eq(appAnnouncementReads.announcementId, appAnnouncements.id),
            eq(appAnnouncementReads.userId, input.userId),
          ),
        )
        .leftJoin(
          appAnnouncementRewardClaims,
          and(
            eq(appAnnouncementRewardClaims.announcementId, appAnnouncements.id),
            eq(appAnnouncementRewardClaims.userId, input.userId),
          ),
        )
        .where(resolveActiveWindow(now))
        .orderBy(desc(appAnnouncements.createdAt))
        .limit(input.limit);

      return await Promise.all(
        rows.map(async (row) => {
          let referralQualifiedCount = 0;
          if (row.rewardRequirementType === "referral_signup") {
            const windowStartsAt = row.startsAt ?? row.createdAt;
            const countRows = await db
              .select({ count: sql<number>`count(*)::int` })
              .from(users)
              .where(
                and(
                  eq(users.referredByUserId, input.userId),
                  isNotNull(users.referredAt),
                  gte(users.referredAt, windowStartsAt),
                  lte(users.referredAt, now),
                ),
              )
              .limit(1);
            referralQualifiedCount = Number(countRows[0]?.count ?? 0);
          }

          return mapAnnouncement({
            ...row,
            referralQualifiedCount,
            referralCode: userReferralCode,
          });
        }),
      );
    },

    async getAnnouncementsSummary(userId: string): Promise<AppAnnouncementsSummary> {
      const now = new Date();
      const activeWindow = resolveActiveWindow(now);

      const totalRows = await db
        .select({ count: sql<number>`count(*)` })
        .from(appAnnouncements)
        .where(activeWindow);
      const totalActiveCount = Number(totalRows[0]?.count ?? 0);

      const unreadRows = await db
        .select({ count: sql<number>`count(*)` })
        .from(appAnnouncements)
        .leftJoin(
          appAnnouncementReads,
          and(
            eq(appAnnouncementReads.announcementId, appAnnouncements.id),
            eq(appAnnouncementReads.userId, userId),
          ),
        )
        .where(and(activeWindow, isNull(appAnnouncementReads.readAt)));
      const unreadCount = Number(unreadRows[0]?.count ?? 0);

      return {
        unreadCount,
        totalActiveCount,
      };
    },

    async markAnnouncementRead(input: {
      userId: string;
      announcementId: string;
    }): Promise<boolean> {
      const existsRows = await db
        .select({ id: appAnnouncements.id })
        .from(appAnnouncements)
        .where(eq(appAnnouncements.id, input.announcementId))
        .limit(1);
      const exists = Boolean(existsRows[0]);
      if (!exists) return false;

      await db
        .insert(appAnnouncementReads)
        .values({
          userId: input.userId,
          announcementId: input.announcementId,
          readAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [appAnnouncementReads.userId, appAnnouncementReads.announcementId],
          set: {
            readAt: new Date(),
          },
        });

      return true;
    },

    async markAllAnnouncementsRead(userId: string): Promise<number> {
      const now = new Date();
      const activeRows = await db
        .select({ id: appAnnouncements.id })
        .from(appAnnouncements)
        .where(resolveActiveWindow(now));

      if (activeRows.length === 0) return 0;

      await db
        .insert(appAnnouncementReads)
        .values(
          activeRows.map((row) => ({
            userId,
            announcementId: row.id,
            readAt: now,
          })),
        )
        .onConflictDoUpdate({
          target: [appAnnouncementReads.userId, appAnnouncementReads.announcementId],
          set: {
            readAt: now,
          },
        });

      return activeRows.length;
    },

    async claimAnnouncementReward(input: {
      userId: string;
      announcementId: string;
    }): Promise<AppAnnouncementRewardClaimResult> {
      return await db.transaction(async (tx) => {
        const now = new Date();
        const announcementRows = await tx
          .select({
            id: appAnnouncements.id,
            isActive: appAnnouncements.isActive,
            startsAt: appAnnouncements.startsAt,
            endsAt: appAnnouncements.endsAt,
            createdAt: appAnnouncements.createdAt,
            rewardCreditType: appAnnouncements.rewardCreditType,
            rewardAmount: appAnnouncements.rewardAmount,
            rewardRequirementType: appAnnouncements.rewardRequirementType,
            rewardRequirementCount: appAnnouncements.rewardRequirementCount,
          })
          .from(appAnnouncements)
          .where(eq(appAnnouncements.id, input.announcementId))
          .limit(1);

        const announcement = announcementRows[0];
        if (!announcement) {
          return {
            announcementId: input.announcementId,
            claimed: false,
            reason: "announcement_not_found",
          };
        }

        if (!isAnnouncementActiveAt(announcement, now)) {
          return {
            announcementId: input.announcementId,
            claimed: false,
            reason: "announcement_inactive",
          };
        }

        const rewardCreditType = normalizeRewardCreditType(announcement.rewardCreditType);
        const rewardAmount = announcement.rewardAmount ?? 0;
        if (!rewardCreditType || rewardAmount <= 0) {
          return {
            announcementId: input.announcementId,
            claimed: false,
            reason: "no_reward_configured",
          };
        }

        const rewardRequirement = await resolveReferralRequirementState(tx, {
          userId: input.userId,
          requirementType: announcement.rewardRequirementType,
          requirementCount: announcement.rewardRequirementCount,
          windowStartsAt: announcement.startsAt ?? announcement.createdAt,
          now,
        });

        if (rewardRequirement && rewardRequirement.currentCount < rewardRequirement.requiredCount) {
          return {
            announcementId: input.announcementId,
            claimed: false,
            reward: {
              creditType: rewardCreditType,
              amount: rewardAmount,
            },
            reason: "reward_requirement_not_met",
            requirement: rewardRequirement,
          };
        }

        const claimedRows = await tx
          .insert(appAnnouncementRewardClaims)
          .values({
            userId: input.userId,
            announcementId: input.announcementId,
            creditType: rewardCreditType,
            amount: rewardAmount,
            claimedAt: now,
          })
          .onConflictDoNothing({
            target: [
              appAnnouncementRewardClaims.userId,
              appAnnouncementRewardClaims.announcementId,
            ],
          })
          .returning({
            claimedAt: appAnnouncementRewardClaims.claimedAt,
          });

        const claimedRow = claimedRows[0];
        if (!claimedRow) {
          return {
            announcementId: input.announcementId,
            claimed: false,
            reward: {
              creditType: rewardCreditType,
              amount: rewardAmount,
            },
            reason: "already_claimed",
            requirement: rewardRequirement,
          };
        }

        await tx
          .insert(userCredits)
          .values({
            userId: input.userId,
            updatedAt: now,
          })
          .onConflictDoNothing();

        if (rewardCreditType === "basic") {
          await tx
            .update(userCredits)
            .set({
              freeBasic: sql`${userCredits.freeBasic} + ${rewardAmount}`,
              updatedAt: now,
            })
            .where(eq(userCredits.userId, input.userId));
        } else {
          await tx
            .update(userCredits)
            .set({
              freeAdvanced: sql`${userCredits.freeAdvanced} + ${rewardAmount}`,
              updatedAt: now,
            })
            .where(eq(userCredits.userId, input.userId));
        }

        await tx.insert(creditLedger).values({
          id: newId(),
          userId: input.userId,
          reason: "announcement_reward",
          creditType: rewardCreditType,
          amount: rewardAmount,
          mode: "free",
          requestId: `announcement:${input.announcementId}`,
          createdAt: now,
        });

        return {
          announcementId: input.announcementId,
          claimed: true,
          reward: {
            creditType: rewardCreditType,
            amount: rewardAmount,
          },
          claimedAt: claimedRow.claimedAt.toISOString(),
          requirement: rewardRequirement,
        };
      });
    },
  };
}
