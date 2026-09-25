import { ValidationError } from "../../../../packages/core/src/errors";
import type { AppMetaRepo } from "../ports/app-meta-repo";

export async function markAnnouncementRead(
  repo: AppMetaRepo,
  input: { userId: string; announcementId: string },
) {
  if (!input.userId?.trim()) {
    throw new ValidationError("userId is required");
  }
  if (!input.announcementId?.trim()) {
    throw new ValidationError("announcementId is required");
  }

  const marked = await repo.markAnnouncementRead({
    userId: input.userId,
    announcementId: input.announcementId,
  });

  return {
    announcementId: input.announcementId,
    marked,
  };
}
