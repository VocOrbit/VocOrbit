import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
} from "../../../../packages/core/src/config/constants";
import { NotFoundError, ValidationError } from "../../../../packages/core/src/errors";
import { sanitizePlainText } from "../../../../packages/core/src/security/sanitize";
import type { LearningItem, LearningItemGroup, WordInsightUsageRepo } from "../ports/usage-repo";

const MAX_GROUP_NAME_LENGTH = 80;
const MAX_BULK_ITEM_IDS = 100;

function normalizeGroupName(value: string | undefined): string {
  if (typeof value !== "string") {
    throw new ValidationError("Group name is required");
  }

  const name = sanitizePlainText(value).trim().replace(/\s+/g, " ");
  if (!name) {
    throw new ValidationError("Group name is required");
  }
  if (name.length > MAX_GROUP_NAME_LENGTH) {
    throw new ValidationError(`Group name must be at most ${MAX_GROUP_NAME_LENGTH} characters`);
  }
  return name;
}

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

function normalizeId(value: string | undefined, fieldName: string): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} is required`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ValidationError(`${fieldName} is required`);
  }
  return trimmed;
}

function normalizeItemIds(value: string[] | undefined): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ValidationError("At least one learning item id is required");
  }
  if (value.length > MAX_BULK_ITEM_IDS) {
    throw new ValidationError(`At most ${MAX_BULK_ITEM_IDS} learning item ids can be added`);
  }

  const ids = value
    .map((itemId) => normalizeId(itemId, "Learning item id"))
    .filter((itemId, index, all) => all.indexOf(itemId) === index);
  if (ids.length === 0) {
    throw new ValidationError("At least one learning item id is required");
  }
  return ids;
}

export async function createLearningItemGroup(
  usageRepo: WordInsightUsageRepo,
  input: { userId: string; name: string },
): Promise<LearningItemGroup> {
  return await usageRepo.createLearningItemGroup({
    userId: input.userId,
    name: normalizeGroupName(input.name),
  });
}

export async function listLearningItemGroups(
  usageRepo: WordInsightUsageRepo,
  input: { userId: string },
): Promise<LearningItemGroup[]> {
  return await usageRepo.listLearningItemGroups({
    userId: input.userId,
  });
}

export async function listLearningItemGroupsForItem(
  usageRepo: WordInsightUsageRepo,
  input: { userId: string; itemId: string },
): Promise<LearningItemGroup[]> {
  const groups = await usageRepo.listLearningItemGroupsForItem({
    userId: input.userId,
    itemId: normalizeId(input.itemId, "Learning item id"),
  });
  if (!groups) {
    throw new NotFoundError("Learning item not found");
  }
  return groups;
}

export async function updateLearningItemGroup(
  usageRepo: WordInsightUsageRepo,
  input: { userId: string; groupId: string; name: string },
): Promise<LearningItemGroup> {
  const group = await usageRepo.updateLearningItemGroup({
    userId: input.userId,
    groupId: normalizeId(input.groupId, "Group id"),
    name: normalizeGroupName(input.name),
  });
  if (!group) {
    throw new NotFoundError("Learning item group not found");
  }
  return group;
}

export async function deleteLearningItemGroup(
  usageRepo: WordInsightUsageRepo,
  input: { userId: string; groupId: string },
): Promise<{ deleted: true }> {
  const deleted = await usageRepo.deleteLearningItemGroup({
    userId: input.userId,
    groupId: normalizeId(input.groupId, "Group id"),
  });
  if (!deleted) {
    throw new NotFoundError("Learning item group not found");
  }
  return { deleted: true };
}

export async function addLearningItemToGroup(
  usageRepo: WordInsightUsageRepo,
  input: { userId: string; groupId: string; itemId: string },
): Promise<LearningItemGroup> {
  const group = await usageRepo.addLearningItemToGroup({
    userId: input.userId,
    groupId: normalizeId(input.groupId, "Group id"),
    itemId: normalizeId(input.itemId, "Learning item id"),
  });
  if (!group) {
    throw new NotFoundError("Learning item group or item not found");
  }
  return group;
}

export async function addLearningItemsToGroup(
  usageRepo: WordInsightUsageRepo,
  input: { userId: string; groupId: string; itemIds: string[] },
): Promise<LearningItemGroup> {
  const group = await usageRepo.addLearningItemsToGroup({
    userId: input.userId,
    groupId: normalizeId(input.groupId, "Group id"),
    itemIds: normalizeItemIds(input.itemIds),
  });
  if (!group) {
    throw new NotFoundError("Learning item group or item not found");
  }
  return group;
}

export async function removeLearningItemFromGroup(
  usageRepo: WordInsightUsageRepo,
  input: { userId: string; groupId: string; itemId: string },
): Promise<LearningItemGroup> {
  const group = await usageRepo.removeLearningItemFromGroup({
    userId: input.userId,
    groupId: normalizeId(input.groupId, "Group id"),
    itemId: normalizeId(input.itemId, "Learning item id"),
  });
  if (!group) {
    throw new NotFoundError("Learning item group or item not found");
  }
  return group;
}

export async function listLearningItemsByGroup(
  usageRepo: WordInsightUsageRepo,
  input: { userId: string; groupId: string; limit?: number; offset?: number },
): Promise<LearningItem[]> {
  const items = await usageRepo.listLearningItemsByGroup({
    userId: input.userId,
    groupId: normalizeId(input.groupId, "Group id"),
    limit: parseLimit(input.limit),
    offset: parseOffset(input.offset),
  });
  if (!items) {
    throw new NotFoundError("Learning item group not found");
  }
  return items;
}
