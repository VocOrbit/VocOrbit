import { ValidationError } from "../../../../packages/core/src/errors";
import type {
  AnnouncementLevel,
  AppAnnouncement,
  AppAnnouncementRewardCreditType,
  AppAnnouncementRewardRequirementType,
} from "../domain/app-meta";
import type { AppMetaRepo, CreateAnnouncementInput } from "../ports/app-meta-repo";

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseOptionalDate(value: string | undefined, fieldName: string): string | undefined {
  const normalized = normalizeOptionalText(value);
  if (!normalized) return undefined;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date`);
  }
  return parsed.toISOString();
}

function normalizeLevel(level?: string): AnnouncementLevel {
  if (!level) return "info";
  const normalized = level.trim().toLowerCase();
  if (normalized === "info" || normalized === "warning" || normalized === "critical") {
    return normalized;
  }
  throw new ValidationError("level must be one of: info, warning, critical");
}

function normalizeRewardCreditType(value?: string): AppAnnouncementRewardCreditType | undefined {
  const normalized = normalizeOptionalText(value)?.toLowerCase();
  if (!normalized) return undefined;
  if (normalized === "basic" || normalized === "advanced") {
    return normalized;
  }
  throw new ValidationError("rewardCreditType must be one of: basic, advanced");
}

function normalizeRewardRequirementType(
  value?: string,
): AppAnnouncementRewardRequirementType | undefined {
  const normalized = normalizeOptionalText(value)?.toLowerCase();
  if (!normalized) return undefined;
  if (normalized === "referral_signup") {
    return normalized;
  }
  throw new ValidationError("rewardRequirementType must be: referral_signup");
}

export async function createAnnouncement(
  repo: AppMetaRepo,
  input: {
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
  },
): Promise<AppAnnouncement> {
  const title = normalizeOptionalText(input.title);
  if (!title) {
    throw new ValidationError("title is required");
  }
  const body = normalizeOptionalText(input.body);
  if (!body) {
    throw new ValidationError("body is required");
  }

  const startsAt = parseOptionalDate(input.startsAt, "startsAt");
  const endsAt = parseOptionalDate(input.endsAt, "endsAt");

  if (startsAt && endsAt && new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
    throw new ValidationError("endsAt must be greater than startsAt");
  }

  const rewardCreditType = normalizeRewardCreditType(input.rewardCreditType);
  const rewardAmountRaw = input.rewardAmount;
  const hasRewardAmount = typeof rewardAmountRaw === "number" && Number.isFinite(rewardAmountRaw);
  const rewardAmount = hasRewardAmount ? Math.floor(rewardAmountRaw) : undefined;

  if ((rewardCreditType && !hasRewardAmount) || (!rewardCreditType && hasRewardAmount)) {
    throw new ValidationError("rewardCreditType and rewardAmount must be provided together");
  }

  if (hasRewardAmount && (!Number.isInteger(rewardAmountRaw) || (rewardAmount ?? 0) <= 0)) {
    throw new ValidationError("rewardAmount must be a positive integer");
  }

  const rewardRequirementType = normalizeRewardRequirementType(input.rewardRequirementType);
  const rewardRequirementCountRaw = input.rewardRequirementCount;
  const hasRewardRequirementCount =
    typeof rewardRequirementCountRaw === "number" && Number.isFinite(rewardRequirementCountRaw);
  const rewardRequirementCount = hasRewardRequirementCount
    ? Math.floor(rewardRequirementCountRaw)
    : undefined;

  if (!rewardCreditType && rewardRequirementType) {
    throw new ValidationError("rewardRequirementType requires rewardCreditType/rewardAmount");
  }
  if (!rewardCreditType && hasRewardRequirementCount) {
    throw new ValidationError("rewardRequirementCount requires rewardCreditType/rewardAmount");
  }

  if (!rewardRequirementType && hasRewardRequirementCount) {
    throw new ValidationError(
      "rewardRequirementType must be provided when rewardRequirementCount is set",
    );
  }

  if (
    hasRewardRequirementCount &&
    (!Number.isInteger(rewardRequirementCountRaw) || (rewardRequirementCount ?? 0) <= 0)
  ) {
    throw new ValidationError("rewardRequirementCount must be a positive integer");
  }

  const payload: CreateAnnouncementInput = {
    level: normalizeLevel(input.level),
    title,
    body,
    ctaLabel: normalizeOptionalText(input.ctaLabel),
    ctaUrl: normalizeOptionalText(input.ctaUrl),
    deepLink: normalizeOptionalText(input.deepLink),
    isActive: input.isActive,
    startsAt,
    endsAt,
    rewardCreditType,
    rewardAmount,
    rewardRequirementType,
    rewardRequirementCount:
      rewardRequirementType === "referral_signup" ? (rewardRequirementCount ?? 1) : undefined,
  };

  return await repo.createAnnouncement(payload);
}
