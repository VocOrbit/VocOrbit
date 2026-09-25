import { UnauthorizedError, ValidationError } from "../../../../packages/core/src/errors";
import type { LearningItemMasterySummary, WordInsightUsageRepo } from "../ports/usage-repo";

const DEFAULT_TOP_GROUP_LIMIT = 3;
const MAX_TOP_GROUP_LIMIT = 10;

function parseTopGroupLimit(value: number | undefined): number {
  if (value === undefined) return DEFAULT_TOP_GROUP_LIMIT;
  if (!Number.isFinite(value) || value <= 0) {
    throw new ValidationError("Invalid top group limit");
  }
  return Math.min(Math.floor(value), MAX_TOP_GROUP_LIMIT);
}

export async function getLearningItemMasterySummary(
  usageRepo: WordInsightUsageRepo,
  input: {
    userId: string;
    topGroupLimit?: number;
  },
): Promise<LearningItemMasterySummary> {
  if (!input.userId) throw new UnauthorizedError("Authenticated user is required");

  return await usageRepo.getLearningItemMasterySummary({
    userId: input.userId,
    topGroupLimit: parseTopGroupLimit(input.topGroupLimit),
  });
}
