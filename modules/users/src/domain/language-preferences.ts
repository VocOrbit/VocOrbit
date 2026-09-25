import { ValidationError } from "../../../../packages/core/src/errors";

const LANGUAGE_TAG_REGEX = /^[a-z]{2,3}(?:-[a-z]{2})?$/i;
const PRESERVED_REGIONAL_LANGUAGE_TAGS = new Set<string>(["en-us", "en-gb"]);

export type UserLanguagePreferences = {
  userId: string;
  l1Language: string;
  l2Language: string;
  updatedAt: string;
};

export function normalizeLanguageTag(value: string, fieldName: string): string {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    throw new ValidationError(`${fieldName} is required`);
  }
  if (!LANGUAGE_TAG_REGEX.test(normalized)) {
    throw new ValidationError(`Invalid ${fieldName}`);
  }
  if (PRESERVED_REGIONAL_LANGUAGE_TAGS.has(normalized)) {
    return normalized;
  }
  const [baseCode] = normalized.split("-");
  return baseCode ?? normalized;
}
