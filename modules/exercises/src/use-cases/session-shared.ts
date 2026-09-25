import { ValidationError } from "../../../../packages/core/src/errors";
import type { ExerciseQuestionType } from "../domain/exercise";

const SUPPORTED_QUESTION_TYPES: ExerciseQuestionType[] = [
  "meaning_match",
  "fill_in_gap",
  "guess_word",
  "match_synonym",
];

const DEFAULT_QUESTION_TYPES: ExerciseQuestionType[] = [
  "meaning_match",
  "fill_in_gap",
  "guess_word",
];

const MAX_GROUP_IDS = 20;

export function normalizeQuestionTypes(
  input: ExerciseQuestionType[] | undefined,
): ExerciseQuestionType[] {
  if (!input || input.length === 0) return DEFAULT_QUESTION_TYPES;
  const unique = [...new Set(input)];
  const invalid = unique.find((type) => !SUPPORTED_QUESTION_TYPES.includes(type));
  if (invalid) throw new ValidationError(`Unsupported question type: ${invalid}`);
  return unique;
}

export function parseMode(mode: string | undefined): "basic" | "advanced" {
  if (!mode) return "basic";
  if (mode === "basic" || mode === "advanced") return mode;
  throw new ValidationError("mode must be 'basic' or 'advanced'");
}

export function parsePositiveInt(
  value: unknown,
  fallback: number,
  key: string,
  max: number,
): number {
  if (value === undefined || value === null) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ValidationError(`${key} must be a positive number`);
  }
  return Math.min(Math.floor(parsed), max);
}

export function parseNonNegativeInt(
  value: unknown,
  fallback: number,
  key: string,
  max: number,
): number {
  if (value === undefined || value === null) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ValidationError(`${key} must be a non-negative number`);
  }
  return Math.min(Math.floor(parsed), max);
}

export function parseTimezoneOffsetMinutes(value: unknown): number {
  if (value === undefined || value === null) return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ValidationError("timezoneOffsetMinutes must be a number");
  }
  const normalized = Math.floor(parsed);
  if (normalized < -840 || normalized > 840) {
    throw new ValidationError("timezoneOffsetMinutes must be between -840 and 840");
  }
  return normalized;
}

export function normalizeGroupIds(input: string[] | undefined): string[] | undefined {
  if (!input || input.length === 0) return undefined;
  if (input.length > MAX_GROUP_IDS) {
    throw new ValidationError(`At most ${MAX_GROUP_IDS} groups can be selected`);
  }

  const groupIds = input
    .map((groupId) => groupId.trim())
    .filter((groupId) => groupId.length > 0)
    .filter((groupId, index, all) => all.indexOf(groupId) === index);
  if (groupIds.length === 0) {
    throw new ValidationError("At least one group id is required");
  }
  return groupIds;
}

export function startOfDayUtc(now: Date, timezoneOffsetMinutes: number): Date {
  const offsetMs = timezoneOffsetMinutes * 60_000;
  const local = new Date(now.getTime() + offsetMs);
  const localMidnightUtcMs = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate(),
    0,
    0,
    0,
    0,
  );
  return new Date(localMidnightUtcMs - offsetMs);
}

export function endOfDayUtc(startUtc: Date): Date {
  return new Date(startUtc.getTime() + 24 * 60 * 60 * 1_000);
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j] as T, arr[i] as T];
  }
  return arr;
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
