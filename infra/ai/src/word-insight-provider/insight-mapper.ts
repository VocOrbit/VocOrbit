import type { WordInsight } from "../../../../modules/word-insight/src/domain/word-insight";
import type { WordInsightRequest } from "../../../../modules/word-insight/src/ports/word-insight-provider";
import { sanitizePlainText } from "../../../../packages/core/src/security/sanitize";
import type { ParsedModelOutput } from "./types";

const PROVIDER_METADATA_PATTERN = /\(provider=[^)]+\)/gi;
const PROVIDER_ASSIGNMENT_PATTERN = /\bprovider=[\w.-]+\b/gi;
const TRANSLATED_NOT_AVAILABLE_PATTERN = /^translated example is not available\.?$/i;
const MAX_TEXT_CHARS = 320;
const MAX_WORD_CHARS = 80;
const TRANSLATION_CHARS = 120;
const SOURCE_MEANING_CHARS = 320;
const DEFINITION_CHARS = 360;
const EXPLANATION_CHARS = 320;
const EXAMPLE_CHARS = 320;
const TRANSLATED_EXAMPLE_CHARS = 320;

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function clampText(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  const sliced = value.slice(0, maxChars).trim();
  return sliced.replace(/[,\s;:.-]+$/g, "").trim();
}

function sanitizeUserFacingText(
  value: string | undefined,
  options: { maxChars?: number; allowTranslatedUnavailable?: boolean } = {},
): string | undefined {
  if (typeof value !== "string") return undefined;
  const plain = sanitizePlainText(value);
  const normalized = plain
    .replace(PROVIDER_METADATA_PATTERN, "")
    .replace(PROVIDER_ASSIGNMENT_PATTERN, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!normalized) return undefined;
  if (
    options.allowTranslatedUnavailable !== true &&
    TRANSLATED_NOT_AVAILABLE_PATTERN.test(normalized)
  ) {
    return undefined;
  }
  return clampText(normalized, options.maxChars ?? MAX_TEXT_CHARS);
}

function sanitizeSynonyms(value: string[] | undefined): string[] {
  if (!Array.isArray(value)) return [];
  const cleaned = value
    .map((item) => sanitizeUserFacingText(item, { maxChars: 32 }))
    .filter((item): item is string => typeof item === "string" && item.length > 0);
  return [...new Set(cleaned)].slice(0, 6);
}

export function toInsight(
  input: WordInsightRequest,
  output: ParsedModelOutput,
  provider: string,
  model: string,
): WordInsight {
  const selectedWord = sanitizeUserFacingText(input.selectedWord, {
    maxChars: MAX_WORD_CHARS,
    allowTranslatedUnavailable: true,
  });
  const surface = selectedWord ?? input.selectedWord.trim();
  const translationL1 =
    sanitizeUserFacingText(output.translationL1, { maxChars: TRANSLATION_CHARS }) ??
    sanitizeUserFacingText(output.meaning, { maxChars: TRANSLATION_CHARS }) ??
    surface;
  const whyThisSense =
    sanitizeUserFacingText(output.whyThisSense, { maxChars: EXPLANATION_CHARS }) ??
    sanitizeUserFacingText(output.shortExplanation, { maxChars: EXPLANATION_CHARS }) ??
    translationL1;
  const sanitizedInputSentence = sanitizeUserFacingText(input.sentence, {
    maxChars: EXAMPLE_CHARS,
    allowTranslatedUnavailable: true,
  });
  const definitionL2 =
    sanitizeUserFacingText(output.definitionL2, { maxChars: DEFINITION_CHARS }) ??
    sanitizeUserFacingText(output.sourceMeaning, { maxChars: SOURCE_MEANING_CHARS }) ??
    surface;
  const translatedExample =
    sanitizeUserFacingText(output.translatedExample, {
      maxChars: TRANSLATED_EXAMPLE_CHARS,
    }) ?? "";

  return {
    word: surface,
    surface,
    lemma:
      sanitizeUserFacingText(output.lemma, { maxChars: MAX_WORD_CHARS, allowTranslatedUnavailable: true }) ??
      surface.toLocaleLowerCase("en-US"),
    phonetic: sanitizeUserFacingText(output.phonetic, {
      maxChars: 48,
      allowTranslatedUnavailable: true,
    }),
    sourceLang: input.sourceLang,
    targetLang: input.targetLang,
    partOfSpeech:
      sanitizeUserFacingText(output.partOfSpeech, {
        maxChars: 32,
        allowTranslatedUnavailable: true,
      }) ?? "unknown",
    sourceMeaning:
      sanitizeUserFacingText(output.sourceMeaning, { maxChars: SOURCE_MEANING_CHARS }) ??
      definitionL2,
    definitionL2,
    translationL1,
    whyThisSense,
    meaning: translationL1,
    shortExplanation: whyThisSense,
    exampleSentence:
      sanitizeUserFacingText(output.exampleSentence, { maxChars: EXAMPLE_CHARS }) ??
      sanitizedInputSentence ??
      input.sentence,
    translatedExample,
    synonyms: sanitizeSynonyms(output.synonyms),
    confidence: clamp01(output.confidence ?? 0.5),
    provider,
    model,
    details: output.details,
  };
}
