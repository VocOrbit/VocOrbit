import { ValidationError } from "../../../../packages/core/src/errors";
import type { AppTutorialVideoPlatform } from "../domain/app-meta";

const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9._-]{0,119}$/;
const LOCALE_PATTERN = /^(all|[a-z]{2,3}(?:-[a-z0-9]{2,8}){0,2})$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export function normalizeOptionalText(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeRequiredText(value: string | undefined, fieldName: string): string {
  const normalized = normalizeOptionalText(value);
  if (!normalized) {
    throw new ValidationError(`${fieldName} is required`);
  }
  return normalized;
}

export function normalizeOptionalIdentifier(
  value: string | undefined,
  fieldName: string,
): string | undefined {
  const normalized = normalizeOptionalText(value)?.toLowerCase();
  if (!normalized) return undefined;
  if (!IDENTIFIER_PATTERN.test(normalized)) {
    throw new ValidationError(`${fieldName} must be a lowercase identifier`);
  }
  return normalized;
}

export function normalizeRequiredIdentifier(value: string | undefined, fieldName: string): string {
  const normalized = normalizeRequiredText(value, fieldName).toLowerCase();
  if (!IDENTIFIER_PATTERN.test(normalized)) {
    throw new ValidationError(`${fieldName} must be a lowercase identifier`);
  }
  return normalized;
}

export function normalizeOptionalLocale(value: string | undefined): string | undefined {
  const normalized = normalizeOptionalText(value)?.toLowerCase().replaceAll("_", "-");
  if (!normalized) return undefined;
  if (!LOCALE_PATTERN.test(normalized)) {
    throw new ValidationError("locale must be a valid language tag");
  }
  return normalized;
}

export function normalizeRequiredLocale(value: string | undefined): string {
  return normalizeOptionalLocale(value) ?? "en";
}

export function normalizeTutorialVideoPlatform(
  value: string | undefined,
  fallback: AppTutorialVideoPlatform,
): AppTutorialVideoPlatform {
  const normalized = normalizeOptionalText(value)?.toLowerCase();
  if (!normalized) return fallback;
  if (normalized === "all" || normalized === "ios" || normalized === "android") {
    return normalized;
  }
  throw new ValidationError("platform must be one of: all, ios, android");
}

export function parseOptionalDate(
  value: string | undefined,
  fieldName: string,
): string | undefined {
  const normalized = normalizeOptionalText(value);
  if (!normalized) return undefined;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date`);
  }
  return parsed.toISOString();
}

export function normalizeOptionalVersion(
  value: string | undefined,
  fieldName: string,
): string | undefined {
  const normalized = normalizeOptionalText(value);
  if (!normalized) return undefined;
  if (normalized.length > 64) {
    throw new ValidationError(`${fieldName} must be at most 64 characters`);
  }
  return normalized;
}

export function normalizeOptionalPositiveInteger(
  value: number | undefined,
  fieldName: string,
): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
  return value;
}

export function normalizeOptionalNonNegativeInteger(
  value: number | undefined,
  fieldName: string,
): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  if (!Number.isInteger(value) || value < 0) {
    throw new ValidationError(`${fieldName} must be a non-negative integer`);
  }
  return value;
}

export function normalizeHttpUrl(value: string | undefined, fieldName: string): string | undefined {
  const normalized = normalizeOptionalText(value);
  if (!normalized) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new ValidationError(`${fieldName} must be a valid URL`);
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new ValidationError(`${fieldName} must be an HTTP(S) URL`);
  }
  return parsed.toString();
}

export function normalizeYouTubeUrl(value: string | undefined): string {
  const normalized = normalizeHttpUrl(value, "youtubeUrl");
  if (!normalized) {
    throw new ValidationError("youtubeUrl is required");
  }

  const host = new URL(normalized).hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) {
    throw new ValidationError("youtubeUrl must be a YouTube URL");
  }
  return normalized;
}
