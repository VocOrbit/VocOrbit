import { ValidationError } from "../../../../packages/core/src/errors";
import type { AppTutorialVideo } from "../domain/app-meta";
import type { AppMetaRepo, CreateTutorialVideoInput } from "../ports/app-meta-repo";
import {
  normalizeHttpUrl,
  normalizeOptionalNonNegativeInteger,
  normalizeOptionalPositiveInteger,
  normalizeOptionalText,
  normalizeOptionalVersion,
  normalizeRequiredIdentifier,
  normalizeRequiredLocale,
  normalizeRequiredText,
  normalizeTutorialVideoPlatform,
  normalizeYouTubeUrl,
  parseOptionalDate,
} from "./tutorial-video-validation";

export async function createTutorialVideo(
  repo: AppMetaRepo,
  input: {
    slug: string;
    screen: string;
    placement: string;
    locale?: string;
    title: string;
    description?: string;
    youtubeUrl: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    platform?: string;
    priority?: number;
    minAppVersion?: string;
    maxAppVersion?: string;
    isActive?: boolean;
    startsAt?: string;
    endsAt?: string;
  },
): Promise<AppTutorialVideo> {
  const startsAt = parseOptionalDate(input.startsAt, "startsAt");
  const endsAt = parseOptionalDate(input.endsAt, "endsAt");

  if (startsAt && endsAt && new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
    throw new ValidationError("endsAt must be greater than startsAt");
  }

  const minAppVersion = normalizeOptionalVersion(input.minAppVersion, "minAppVersion");
  const maxAppVersion = normalizeOptionalVersion(input.maxAppVersion, "maxAppVersion");

  const payload: CreateTutorialVideoInput = {
    slug: normalizeRequiredIdentifier(input.slug, "slug"),
    screen: normalizeRequiredIdentifier(input.screen, "screen"),
    placement: normalizeRequiredIdentifier(input.placement, "placement"),
    locale: normalizeRequiredLocale(input.locale),
    title: normalizeRequiredText(input.title, "title"),
    description: normalizeOptionalText(input.description),
    youtubeUrl: normalizeYouTubeUrl(input.youtubeUrl),
    thumbnailUrl: normalizeHttpUrl(input.thumbnailUrl, "thumbnailUrl"),
    durationSeconds: normalizeOptionalPositiveInteger(input.durationSeconds, "durationSeconds"),
    platform: normalizeTutorialVideoPlatform(input.platform, "all"),
    priority: normalizeOptionalNonNegativeInteger(input.priority, "priority") ?? 100,
    minAppVersion,
    maxAppVersion,
    isActive: input.isActive,
    startsAt,
    endsAt,
  };

  return await repo.createTutorialVideo(payload);
}
