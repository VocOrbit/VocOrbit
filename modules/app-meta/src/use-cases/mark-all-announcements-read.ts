import { ValidationError } from "../../../../packages/core/src/errors";
import type { AppMetaRepo } from "../ports/app-meta-repo";

export async function markAllAnnouncementsRead(repo: AppMetaRepo, input: { userId: string }) {
  if (!input.userId?.trim()) {
    throw new ValidationError("userId is required");
  }

  const markedCount = await repo.markAllAnnouncementsRead(input.userId);

  return {
    markedCount,
  };
}
