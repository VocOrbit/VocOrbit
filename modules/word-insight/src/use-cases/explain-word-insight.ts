import type { WordInsight } from "../domain/word-insight";
import { sanitizePlainText } from "../../../../packages/core/src/security/sanitize";

const DEFINITION_NOT_AVAILABLE_PATTERN = /^Contextual definition in [^"]+ is not available for "[^"]+"\.?$/i;

function clampText(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  const sliced = value.slice(0, maxChars).trim();
  return sliced.replace(/[,\s;:.-]+$/g, "").trim();
}

function sanitizeText(value: string | undefined, maxChars = 320): string | undefined {
  if (typeof value !== "string") return undefined;
  const plain = sanitizePlainText(value).replace(/\s+/g, " ").trim();
  if (!plain) return undefined;
  return clampText(plain, maxChars);
}

function sanitizeSynonyms(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) return [];
  const cleaned = values
    .map((item) => sanitizeText(item, 32))
    .filter((item): item is string => typeof item === "string" && item.length > 0);
  return [...new Set(cleaned)].slice(0, 6);
}

export function normalizeExplainWordInsight(raw: WordInsight): WordInsight {
  const synonyms = sanitizeSynonyms(raw.synonyms);
  const confidence = Number.isFinite(raw.confidence) ? raw.confidence : 0.5;
  const surface = sanitizeText(raw.surface, 80) ?? sanitizeText(raw.word, 80) ?? "word";
  const translationL1 = sanitizeText(raw.translationL1, 120) ?? sanitizeText(raw.meaning, 120);
  const whyThisSense = sanitizeText(raw.whyThisSense) ?? sanitizeText(raw.shortExplanation);
  const primaryDefinition = sanitizeText(raw.definitionL2, 360) ?? sanitizeText(raw.sourceMeaning, 320);
  const definitionFallback =
    sanitizeText(raw.sourceMeaning, 320) ??
    sanitizeText(raw.definitionL2, 360) ??
    sanitizeText(raw.lemma, 80) ??
    surface;
  const definitionL2 =
    !primaryDefinition || DEFINITION_NOT_AVAILABLE_PATTERN.test(primaryDefinition)
      ? definitionFallback
      : primaryDefinition;
  const normalizedTranslationL1 = translationL1 ?? sanitizeText(raw.word, 120) ?? surface;
  const normalizedWhyThisSense = whyThisSense ?? normalizedTranslationL1;
  const exampleSentence = sanitizeText(raw.exampleSentence, 320) ?? "";
  const translatedExample = sanitizeText(raw.translatedExample, 320) ?? "";

  return {
    ...raw,
    word: surface,
    surface,
    translationL1: normalizedTranslationL1,
    whyThisSense: normalizedWhyThisSense,
    definitionL2,
    sourceMeaning: sanitizeText(raw.sourceMeaning, 320) ?? definitionL2,
    meaning: normalizedTranslationL1,
    shortExplanation: normalizedWhyThisSense,
    exampleSentence,
    translatedExample,
    confidence: Math.max(0, Math.min(1, confidence)),
    synonyms,
  };
}

export function resolveExplainWordLemma(insight: WordInsight, fallback: string): string {
  return insight.lemma.trim() ? insight.lemma.trim() : fallback;
}

export function buildExplainWordResponsePayload(insight: WordInsight): Record<string, unknown> {
  return {
    schemaVersion: "word-insight.v1",
    insight,
  };
}
