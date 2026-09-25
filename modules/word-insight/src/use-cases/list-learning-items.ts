import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
} from "../../../../packages/core/src/config/constants";
import { NotFoundError, ValidationError } from "../../../../packages/core/src/errors";
import type {
  LearningItem,
  LearningItemListStatus,
  WordInsightUsageRepo,
} from "../ports/usage-repo";

function parseLimit(value: number | undefined): number {
  if (value === undefined) return PAGINATION_DEFAULT_LIMIT;
  if (!Number.isFinite(value) || value <= 0) {
    throw new ValidationError("Invalid limit");
  }
  return Math.min(Math.floor(value), PAGINATION_MAX_LIMIT);
}

function parseOffset(value: number | undefined): number {
  if (value === undefined) return 0;
  if (!Number.isFinite(value) || value < 0) {
    throw new ValidationError("Invalid offset");
  }
  return Math.floor(value);
}

function parseStatus(value: string | undefined): LearningItemListStatus {
  if (!value || value === "active") return "active";
  if (value === "learned" || value === "deleted" || value === "all") return value;
  throw new ValidationError("Invalid status. Use active, learned, deleted or all");
}

function parseFavorite(value: string | undefined): boolean | undefined {
  if (!value) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new ValidationError("Invalid favorite value. Use true or false");
}

function parseSearchQuery(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > 120) {
    throw new ValidationError("Search query is too long");
  }
  return trimmed;
}

function parseGroupIds(value: string[] | undefined): string[] | undefined {
  if (!value || value.length === 0) return undefined;
  if (value.length > 20) {
    throw new ValidationError("At most 20 groups can be selected");
  }

  const groupIds = value
    .map((groupId) => groupId.trim())
    .filter((groupId) => groupId.length > 0)
    .filter((groupId, index, all) => all.indexOf(groupId) === index);
  if (groupIds.length === 0) return undefined;
  return groupIds;
}

export async function listLearningItems(
  usageRepo: WordInsightUsageRepo,
  input: {
    userId: string;
    status?: string;
    limit?: number;
    offset?: number;
    favorite?: string;
    q?: string;
    groupIds?: string[];
  },
): Promise<LearningItem[]> {
  const groupIds = parseGroupIds(input.groupIds);
  if (groupIds) {
    const groups = await usageRepo.listLearningItemGroups({ userId: input.userId });
    const ownedGroupIds = new Set(groups.map((group) => group.id));
    if (groupIds.some((groupId) => !ownedGroupIds.has(groupId))) {
      throw new NotFoundError("Learning item group not found");
    }
  }

  return await usageRepo.listLearningItems({
    userId: input.userId,
    status: parseStatus(input.status),
    limit: parseLimit(input.limit),
    offset: parseOffset(input.offset),
    isFavorite: parseFavorite(input.favorite),
    query: parseSearchQuery(input.q),
    groupIds,
  });
}
