import { ValidationError } from "../../../../packages/core/src/errors";
import type { AppAnnouncement } from "../domain/app-meta";
import type { AppMetaRepo } from "../ports/app-meta-repo";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export async function listAnnouncements(
  repo: AppMetaRepo,
  input: { userId: string; limit?: number | undefined },
): Promise<AppAnnouncement[]> {
  if (!input.userId?.trim()) {
    throw new ValidationError("userId is required");
  }

  let limit = DEFAULT_LIMIT;
  if (typeof input.limit === "number") {
    if (!Number.isFinite(input.limit) || input.limit <= 0) {
      throw new ValidationError("limit must be greater than 0");
    }
    limit = Math.min(Math.floor(input.limit), MAX_LIMIT);
  }

  return await repo.listActiveAnnouncements({
    userId: input.userId,
    limit,
  });
}
