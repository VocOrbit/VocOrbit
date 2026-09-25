import { ValidationError } from "../../../../packages/core/src/errors";
import type { AppTutorialVideo } from "../domain/app-meta";
import type { AppMetaRepo } from "../ports/app-meta-repo";
import {
  normalizeOptionalIdentifier,
  normalizeOptionalLocale,
  normalizeOptionalVersion,
  normalizeTutorialVideoPlatform,
} from "./tutorial-video-validation";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export async function listTutorialVideos(
  repo: AppMetaRepo,
  input: {
    locale?: string;
    screen?: string;
    placement?: string;
    platform?: string;
    appVersion?: string;
    limit?: number | undefined;
  },
): Promise<AppTutorialVideo[]> {
  let limit = DEFAULT_LIMIT;
  if (typeof input.limit === "number") {
    if (!Number.isFinite(input.limit) || input.limit <= 0) {
      throw new ValidationError("limit must be greater than 0");
    }
    limit = Math.min(Math.floor(input.limit), MAX_LIMIT);
  }

  return await repo.listActiveTutorialVideos({
    locale: normalizeOptionalLocale(input.locale),
    screen: normalizeOptionalIdentifier(input.screen, "screen"),
    placement: normalizeOptionalIdentifier(input.placement, "placement"),
    platform: input.platform ? normalizeTutorialVideoPlatform(input.platform, "all") : undefined,
    appVersion: normalizeOptionalVersion(input.appVersion, "appVersion"),
    limit,
  });
}
