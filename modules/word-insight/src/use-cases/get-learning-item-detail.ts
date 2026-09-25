import { NotFoundError } from "../../../../packages/core/src/errors";
import type { LearningItemDetail, WordInsightUsageRepo } from "../ports/usage-repo";

export async function getLearningItemDetail(
  usageRepo: WordInsightUsageRepo,
  input: {
    userId: string;
    itemId: string;
  },
): Promise<LearningItemDetail> {
  const detail = await usageRepo.getLearningItemDetail({
    userId: input.userId,
    itemId: input.itemId,
  });
  if (!detail) {
    throw new NotFoundError("Learning item not found");
  }
  return detail;
}
