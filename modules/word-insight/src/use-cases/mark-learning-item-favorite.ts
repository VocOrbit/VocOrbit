import { NotFoundError } from "../../../../packages/core/src/errors";
import type { LearningItem, WordInsightUsageRepo } from "../ports/usage-repo";

export async function markLearningItemFavorite(
  usageRepo: WordInsightUsageRepo,
  input: {
    userId: string;
    itemId: string;
  },
): Promise<LearningItem> {
  const item = await usageRepo.markLearningItemFavorite({
    userId: input.userId,
    itemId: input.itemId,
  });
  if (!item) {
    throw new NotFoundError("Learning item not found");
  }
  return item;
}
