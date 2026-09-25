import { ValidationError } from "../../../../packages/core/src/errors";
import type { WordInsightLanguagePreferencesReader } from "../ports/language-preferences";

const LANGUAGE_TAG_REGEX = /^[a-z]{2,3}(?:-[a-z]{2})?$/i;
const PRESERVED_REGIONAL_LANGUAGE_TAGS = new Set<string>(["en-us", "en-gb"]);

function normalizeLanguage(value: string | undefined, fallback: string, fieldName: string): string {
  const candidate = (value ?? fallback).trim();
  if (!candidate) {
    throw new ValidationError(`${fieldName} is required`);
  }
  if (!LANGUAGE_TAG_REGEX.test(candidate)) {
    throw new ValidationError(`Invalid ${fieldName}`);
  }
  const normalized = candidate.toLowerCase();
  if (PRESERVED_REGIONAL_LANGUAGE_TAGS.has(normalized)) {
    return normalized;
  }
  const [baseCode] = normalized.split("-");
  return baseCode ?? normalized;
}

export async function resolveExplainWordLanguages(input: {
  languagePreferences: WordInsightLanguagePreferencesReader;
  userId: string;
  sourceLang?: string;
  targetLang?: string;
  preferredTargetLang?: string;
  defaults: {
    sourceLang: string;
    targetLang: string;
  };
}): Promise<{
  sourceLang: string;
  targetLang: string;
}> {
  const preferences = await input.languagePreferences.getByUserId(input.userId);

  const sourceLang = normalizeLanguage(
    input.sourceLang ?? preferences?.l2Language,
    input.defaults.sourceLang,
    "sourceLang",
  );
  const targetLang = normalizeLanguage(
    input.targetLang ?? preferences?.l1Language ?? input.preferredTargetLang,
    input.defaults.targetLang,
    "targetLang",
  );

  return {
    sourceLang,
    targetLang,
  };
}
