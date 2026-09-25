import type { LookupMode } from "../../../../modules/word-insight/src/ports/usage-repo";
import { sanitizePlainText } from "../../../../packages/core/src/security/sanitize";
import type { ParsedModelOutput } from "./types";

const FIELD_LIMITS = {
  surface: 80,
  lemma: 80,
  phonetic: 48,
  partOfSpeech: 32,
  sourceMeaning: 320,
  definitionL2: 360,
  translationL1: 120,
  whyThisSense: 320,
  meaning: 120,
  shortExplanation: 320,
  exampleSentence: 320,
  translatedExample: 320,
} as const;

const ARRAY_LIMITS = {
  synonyms: { maxItems: 6, maxChars: 32 },
  alternativeMeanings: { maxItems: 5, maxChars: 80 },
  antonyms: { maxItems: 5, maxChars: 48 },
  usageNotes: { maxItems: 5, maxChars: 120 },
  collocations: { maxItems: 6, maxChars: 56 },
} as const;

const TOKEN_PATTERN = /[\p{L}]+/gu;
const TURKISH_CHAR_PATTERN = /[çğıöşü]/i;
const TURKISH_SUFFIX_PATTERN = /(mak|mek|lar|ler|dır|dir|dur|dür|lık|lik|luk|lük)$/i;
const LANGUAGE_MARKER_PATTERN = /^\[\[(SL|TL)\]\]\s*/i;
const SOURCE_LANGUAGE_MARKER = "[[SL]]";
const TARGET_LANGUAGE_MARKER = "[[TL]]";

const LANGUAGE_HINTS: Record<
  string,
  {
    stopwords: Set<string>;
    keywords?: Set<string>;
    uniqueCharPattern?: RegExp;
    suffixPattern?: RegExp;
  }
> = {
  en: {
    stopwords: new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "to",
      "of",
      "in",
      "on",
      "for",
      "with",
      "by",
      "from",
      "is",
      "are",
      "be",
      "as",
      "that",
      "this",
      "these",
      "those",
      "at",
    ]),
  },
  tr: {
    stopwords: new Set([
      "ve",
      "bir",
      "bu",
      "şu",
      "o",
      "de",
      "da",
      "için",
      "icin",
      "ile",
      "gibi",
      "olan",
      "olarak",
      "çok",
      "cok",
      "daha",
      "en",
      "ama",
      "veya",
      "mi",
      "mı",
      "mu",
      "mü",
    ]),
    keywords: new Set([
      "canli",
      "cok",
      "degil",
      "etmek",
      "gelenekleri",
      "hayatta",
      "kalmak",
      "olmak",
      "olu",
      "olan",
      "pasif",
      "sanati",
      "surdurmek",
      "var",
      "yasatmak",
      "yok",
    ]),
    uniqueCharPattern: TURKISH_CHAR_PATTERN,
    suffixPattern: TURKISH_SUFFIX_PATTERN,
  },
  es: {
    stopwords: new Set([
      "el",
      "la",
      "los",
      "las",
      "un",
      "una",
      "y",
      "o",
      "de",
      "del",
      "en",
      "para",
      "con",
      "por",
      "que",
      "es",
      "son",
      "como",
      "este",
      "esta",
    ]),
  },
  fr: {
    stopwords: new Set([
      "le",
      "la",
      "les",
      "un",
      "une",
      "et",
      "ou",
      "de",
      "des",
      "en",
      "pour",
      "avec",
      "par",
      "que",
      "est",
      "sont",
      "comme",
      "ce",
      "cette",
    ]),
  },
  de: {
    stopwords: new Set([
      "der",
      "die",
      "das",
      "ein",
      "eine",
      "und",
      "oder",
      "von",
      "im",
      "in",
      "zu",
      "mit",
      "für",
      "fur",
      "ist",
      "sind",
      "als",
      "dieser",
      "diese",
    ]),
  },
  it: {
    stopwords: new Set([
      "il",
      "lo",
      "la",
      "i",
      "gli",
      "le",
      "un",
      "una",
      "e",
      "o",
      "di",
      "del",
      "in",
      "per",
      "con",
      "da",
      "che",
      "è",
      "e",
      "sono",
      "come",
      "questo",
      "questa",
    ]),
  },
  pt: {
    stopwords: new Set([
      "o",
      "a",
      "os",
      "as",
      "um",
      "uma",
      "e",
      "ou",
      "de",
      "do",
      "da",
      "em",
      "para",
      "com",
      "por",
      "que",
      "é",
      "e",
      "são",
      "sao",
      "como",
      "este",
      "esta",
    ]),
  },
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function sanitizeModelText(value: string): string {
  return normalizeWhitespace(sanitizePlainText(value));
}

function clampText(value: string, maxChars: number): string {
  const sanitized = sanitizeModelText(value);
  if (!sanitized) return "";
  if (sanitized.length <= maxChars) return sanitized;
  const sliced = sanitized.slice(0, maxChars).trim();
  return sliced.replace(/[,\s;:.-]+$/g, "").trim();
}

function pickText(value: unknown, maxChars = 240): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = clampText(value, maxChars);
  if (!cleaned) return undefined;
  return cleaned;
}

function pickTextFromValues(
  values: ReadonlyArray<unknown>,
  maxChars = 240,
): string | undefined {
  for (const value of values) {
    const picked = pickText(value, maxChars);
    if (picked) return picked;
  }
  return undefined;
}

function pickStringArray(
  value: unknown,
  options: {
    maxItems: number;
    maxChars: number;
  },
): string[] {
  const normalizedValues: string[] = (() => {
    if (Array.isArray(value)) {
      return value.map((item) =>
        typeof item === "string" ? clampText(item, options.maxChars) : "",
      );
    }
    if (typeof value === "string") {
      const parts = value
        .split(/[,\n;|]/g)
        .map((item) => clampText(item, options.maxChars))
        .filter((item) => item.length > 0);
      return parts;
    }
    return [];
  })();

  if (normalizedValues.length === 0) return [];
  const items = normalizedValues;
  const filtered = items.filter((item) => item.length > 0);
  const unique = [...new Set(filtered)];
  return unique.slice(0, options.maxItems);
}

function pickDetails(parsed: Record<string, unknown>): Record<string, unknown> | undefined {
  const rawDetails =
    parsed.details && typeof parsed.details === "object" && !Array.isArray(parsed.details)
      ? (parsed.details as Record<string, unknown>)
      : undefined;

  const pickDetailArray = (
    keys: ReadonlyArray<string>,
    options: { maxItems: number; maxChars: number },
  ): string[] => {
    for (const key of keys) {
      const value = rawDetails?.[key] ?? parsed[key];
      const picked = pickStringArray(value, options);
      if (picked.length > 0) return picked;
    }
    return [];
  };

  const details: Record<string, unknown> = {};

  const alternativeMeanings = pickDetailArray(
    ["alternativeMeanings", "alternateMeanings", "alternativeSenses", "otherMeanings"],
    ARRAY_LIMITS.alternativeMeanings,
  );
  if (alternativeMeanings.length > 0) {
    details.alternativeMeanings = alternativeMeanings;
  }

  const antonyms = pickDetailArray(
    ["antonyms", "opposites", "oppositeWords"],
    ARRAY_LIMITS.antonyms,
  );
  if (antonyms.length > 0) {
    details.antonyms = antonyms;
  }

  const usageNotes = pickDetailArray(["usageNotes", "notes", "usageTips"], ARRAY_LIMITS.usageNotes);
  if (usageNotes.length > 0) {
    details.usageNotes = usageNotes;
  }

  const collocations = pickDetailArray(
    ["collocations", "commonCollocations", "phrases", "commonPhrases"],
    ARRAY_LIMITS.collocations,
  );
  if (collocations.length > 0) {
    details.collocations = collocations;
  }

  if (Object.keys(details).length === 0) return undefined;
  return details;
}

function pickConfidence(value: unknown): number | undefined {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : undefined;
  if (!Number.isFinite(numeric)) return undefined;
  return Number(numeric);
}

function pickSanitizedDetails(parsed: Record<string, unknown>) {
  return pickDetails(parsed);
}

function pickSynonyms(parsed: Record<string, unknown>): string[] {
  const details =
    parsed.details && typeof parsed.details === "object" && !Array.isArray(parsed.details)
      ? (parsed.details as Record<string, unknown>)
      : undefined;

  const candidates: Array<unknown> = [
    parsed.synonyms,
    details?.synonyms,
    parsed.similarWords,
    details?.similarWords,
    parsed.relatedWords,
    details?.relatedWords,
  ];

  for (const candidate of candidates) {
    const picked = pickStringArray(candidate, ARRAY_LIMITS.synonyms);
    if (picked.length > 0) return picked;
  }

  return [];
}

function pickResponseText(parsed: Record<string, unknown>) {
  const details =
    parsed.details && typeof parsed.details === "object" && !Array.isArray(parsed.details)
      ? (parsed.details as Record<string, unknown>)
      : undefined;
  const read = (key: string) => details?.[key] ?? parsed[key];

  return {
    surface: pickTextFromValues(
      [read("surface"), read("word"), read("selectedWord")],
      FIELD_LIMITS.surface,
    ),
    lemma: pickTextFromValues([read("lemma"), read("baseForm"), read("root")], FIELD_LIMITS.lemma),
    phonetic: pickTextFromValues([read("phonetic"), read("pronunciation")], FIELD_LIMITS.phonetic),
    partOfSpeech: pickTextFromValues(
      [read("partOfSpeech"), read("pos"), read("wordType")],
      FIELD_LIMITS.partOfSpeech,
    ),
    sourceMeaning: pickTextFromValues(
      [read("sourceMeaning"), read("definitionL2"), read("definition"), read("sourceDefinition")],
      FIELD_LIMITS.sourceMeaning,
    ),
    definitionL2: pickTextFromValues(
      [read("definitionL2"), read("definition"), read("sourceMeaning"), read("sourceDefinition")],
      FIELD_LIMITS.definitionL2,
    ),
    translationL1: pickTextFromValues(
      [read("translationL1"), read("meaning"), read("targetMeaning"), read("translation")],
      FIELD_LIMITS.translationL1,
    ),
    whyThisSense: pickTextFromValues(
      [read("whyThisSense"), read("shortExplanation"), read("explanation"), read("reason")],
      FIELD_LIMITS.whyThisSense,
    ),
    meaning: pickTextFromValues(
      [read("meaning"), read("translationL1"), read("targetMeaning"), read("translation")],
      FIELD_LIMITS.meaning,
    ),
    shortExplanation: pickTextFromValues(
      [read("shortExplanation"), read("whyThisSense"), read("explanation"), read("reason")],
      FIELD_LIMITS.shortExplanation,
    ),
    exampleSentence: pickTextFromValues(
      [read("exampleSentence"), read("example"), read("contextExample")],
      FIELD_LIMITS.exampleSentence,
    ),
    translatedExample: pickTextFromValues(
      [
        read("translatedExample"),
        read("exampleTranslation"),
        read("translatedSentence"),
        read("exampleInTarget"),
      ],
      FIELD_LIMITS.translatedExample,
    ),
  };
}

function tryParseObject(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (typeof parsed === "string") {
      try {
        const nested = JSON.parse(parsed) as Record<string, unknown> | null;
        if (!nested || typeof nested !== "object" || Array.isArray(nested)) return null;
        return nested;
      } catch {
        return null;
      }
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractJsonObjectCandidate(value: string): string | null {
  if (value.includes("```")) return null;
  const start = value.indexOf("{");
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let index = start; index < value.length; index += 1) {
    const char = value[index];
    if (!char) continue;

    if (inString) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === "\\") {
        escapeNext = true;
        continue;
      }
      if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }
    if (char === "{") {
      depth += 1;
      continue;
    }
    if (char !== "}") continue;
    depth -= 1;
    if (depth === 0) {
      return value.slice(start, index + 1);
    }
    if (depth < 0) return null;
  }

  return null;
}

function mapParsedToOutput(parsed: Record<string, unknown>): ParsedModelOutput {
  const text = pickResponseText(parsed);
  const details = pickSanitizedDetails(parsed);

  return {
    ...text,
    synonyms: pickSynonyms(parsed),
    confidence: pickConfidence(parsed.confidence),
    details,
  };
}

function tryParseJson(value: string): ParsedModelOutput | null {
  const parsed = tryParseObject(value);
  if (parsed) return mapParsedToOutput(parsed);

  const candidate = extractJsonObjectCandidate(value);
  if (!candidate) return null;

  const rescued = tryParseObject(candidate);
  if (!rescued) return null;
  return mapParsedToOutput(rescued);
}

function hasText(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function alignAliasFields(parsed: ParsedModelOutput): ParsedModelOutput {
  const preferredTranslation = hasText(parsed.translationL1) ? parsed.translationL1 : parsed.meaning;
  const preferredMeaning = hasText(parsed.meaning) ? parsed.meaning : parsed.translationL1;
  const preferredExplanation = hasText(parsed.whyThisSense)
    ? parsed.whyThisSense
    : parsed.shortExplanation;
  const preferredShortExplanation = hasText(parsed.shortExplanation)
    ? parsed.shortExplanation
    : parsed.whyThisSense;

  return {
    ...parsed,
    translationL1: preferredTranslation,
    meaning: preferredTranslation ?? preferredMeaning,
    whyThisSense: preferredExplanation,
    shortExplanation: preferredExplanation ?? preferredShortExplanation,
  };
}

function hasNonEmptyStringArray(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.some((item) => typeof item === "string" && item.trim().length > 0)
  );
}

function hasLanguageMarker(value: string | undefined, marker: string): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed.startsWith(marker)) return false;
  const content = trimmed.slice(marker.length).trim();
  return content.length > 0;
}

function stripLanguageMarker(value: string | undefined): string | undefined {
  if (typeof value !== "string") return value;
  const stripped = value.replace(LANGUAGE_MARKER_PATTERN, "").trim();
  return stripped.length > 0 ? stripped : undefined;
}

function normalizeLanguageCode(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  const [base] = normalized.split("-");
  return base && base.length > 0 ? base : normalized;
}

function collectTokens(value: string): string[] {
  const normalized = value.replace(LANGUAGE_MARKER_PATTERN, "").toLocaleLowerCase("en-US");
  return normalized.match(TOKEN_PATTERN) ?? [];
}

function languageSignalScore(values: string[], language: string): number {
  const hint = LANGUAGE_HINTS[language];
  if (!hint) return 0;

  let score = 0;
  let tokenCount = 0;

  for (const value of values) {
    if (!value) continue;
    if (hint.uniqueCharPattern?.test(value)) {
      score += 2;
    }

    const tokens = collectTokens(value);
    tokenCount += tokens.length;
    for (const token of tokens) {
      if (hint.stopwords.has(token)) {
        score += 1;
      }
      if (hint.keywords?.has(token)) {
        score += 1.1;
      }
      if (hint.suffixPattern && token.length >= 4 && hint.suffixPattern.test(token)) {
        score += 0.35;
      }
    }
  }

  return score / Math.max(1, tokenCount);
}

function collectSourceLanguageTexts(parsed: ParsedModelOutput, mode: LookupMode): string[] {
  const values: string[] = [];
  if (hasText(parsed.definitionL2)) values.push(parsed.definitionL2 as string);
  if (hasText(parsed.sourceMeaning)) values.push(parsed.sourceMeaning as string);

  if (mode !== "advanced") {
    return values;
  }

  if (hasText(parsed.exampleSentence)) values.push(parsed.exampleSentence as string);
  if (Array.isArray(parsed.synonyms)) values.push(...parsed.synonyms);

  const details =
    parsed.details && typeof parsed.details === "object" && !Array.isArray(parsed.details)
      ? (parsed.details as Record<string, unknown>)
      : undefined;

  const pushStrings = (value: unknown) => {
    if (!Array.isArray(value)) return;
    for (const item of value) {
      if (typeof item === "string" && item.trim().length > 0) {
        values.push(item);
      }
    }
  };

  pushStrings(details?.alternativeMeanings);
  pushStrings(details?.antonyms);
  pushStrings(details?.collocations);

  return values;
}

function collectTargetLanguageTexts(parsed: ParsedModelOutput, mode: LookupMode): string[] {
  const values: string[] = [];
  if (hasText(parsed.translationL1)) values.push(parsed.translationL1 as string);
  if (hasText(parsed.meaning)) values.push(parsed.meaning as string);
  if (hasText(parsed.whyThisSense)) values.push(parsed.whyThisSense as string);
  if (hasText(parsed.shortExplanation)) values.push(parsed.shortExplanation as string);

  if (mode !== "advanced") {
    return values;
  }

  if (hasText(parsed.translatedExample)) values.push(parsed.translatedExample as string);
  const details =
    parsed.details && typeof parsed.details === "object" && !Array.isArray(parsed.details)
      ? (parsed.details as Record<string, unknown>)
      : undefined;
  if (Array.isArray(details?.usageNotes)) {
    for (const note of details.usageNotes) {
      if (typeof note === "string" && note.trim().length > 0) {
        values.push(note);
      }
    }
  }

  return values;
}

function collectNonEmptyTextValues(values: Array<string | undefined>): string[] {
  return values.filter((value): value is string => hasText(value));
}

function collectNonEmptyStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function assertExpectedLanguage(
  values: string[],
  expectedLang: string,
  unexpectedLang: string,
) {
  if (values.length === 0) return;
  const expectedSignal = languageSignalScore(values, expectedLang);
  const unexpectedSignal = languageSignalScore(values, unexpectedLang);
  if (unexpectedSignal >= 0.18 && unexpectedSignal > expectedSignal + 0.12) {
    throw new Error("model_output_language_violation");
  }
}

function validateMarkedTextValue(value: string | undefined, marker: string) {
  if (!hasText(value)) return;
  if (!hasLanguageMarker(value, marker)) {
    throw new Error("model_output_language_marker_violation");
  }
}

function validateMarkedArrayValues(values: unknown, marker: string) {
  if (!Array.isArray(values)) return;
  for (const value of values) {
    if (typeof value !== "string" || value.trim().length === 0) continue;
    if (!hasLanguageMarker(value, marker)) {
      throw new Error("model_output_language_marker_violation");
    }
  }
}

function validateLanguageMarkers(parsed: ParsedModelOutput, mode: LookupMode) {
  validateMarkedTextValue(parsed.definitionL2, SOURCE_LANGUAGE_MARKER);
  validateMarkedTextValue(parsed.sourceMeaning, SOURCE_LANGUAGE_MARKER);
  validateMarkedTextValue(parsed.translationL1, TARGET_LANGUAGE_MARKER);
  validateMarkedTextValue(parsed.meaning, TARGET_LANGUAGE_MARKER);
  validateMarkedTextValue(parsed.whyThisSense, TARGET_LANGUAGE_MARKER);
  validateMarkedTextValue(parsed.shortExplanation, TARGET_LANGUAGE_MARKER);
  validateMarkedArrayValues(parsed.synonyms, SOURCE_LANGUAGE_MARKER);

  const details =
    parsed.details && typeof parsed.details === "object" && !Array.isArray(parsed.details)
      ? (parsed.details as Record<string, unknown>)
      : undefined;

  if (mode === "advanced") {
    validateMarkedTextValue(parsed.exampleSentence, SOURCE_LANGUAGE_MARKER);
    validateMarkedTextValue(parsed.translatedExample, TARGET_LANGUAGE_MARKER);
    validateMarkedArrayValues(details?.alternativeMeanings, SOURCE_LANGUAGE_MARKER);
    validateMarkedArrayValues(details?.antonyms, SOURCE_LANGUAGE_MARKER);
    validateMarkedArrayValues(details?.collocations, SOURCE_LANGUAGE_MARKER);
    validateMarkedArrayValues(details?.usageNotes, TARGET_LANGUAGE_MARKER);
  }
}

function validateLanguageSeparation(
  parsed: ParsedModelOutput,
  options: {
    mode: LookupMode;
    sourceLang?: string;
    targetLang?: string;
  },
) {
  const sourceLang = normalizeLanguageCode(options.sourceLang);
  const targetLang = normalizeLanguageCode(options.targetLang);
  if (!sourceLang || !targetLang || sourceLang === targetLang) return;
  if (!LANGUAGE_HINTS[sourceLang] || !LANGUAGE_HINTS[targetLang]) return;

  const details =
    parsed.details && typeof parsed.details === "object" && !Array.isArray(parsed.details)
      ? (parsed.details as Record<string, unknown>)
      : undefined;

  const sourceFieldGroups: string[][] = [
    collectNonEmptyTextValues([parsed.definitionL2, parsed.sourceMeaning]),
  ];
  const targetFieldGroups: string[][] = [
    collectNonEmptyTextValues([
      parsed.translationL1,
      parsed.meaning,
      parsed.whyThisSense,
      parsed.shortExplanation,
    ]),
  ];

  if (options.mode === "advanced") {
    sourceFieldGroups.push(collectNonEmptyTextValues([parsed.exampleSentence]));
    sourceFieldGroups.push(collectNonEmptyStringArray(parsed.synonyms));
    sourceFieldGroups.push(collectNonEmptyStringArray(details?.alternativeMeanings));
    sourceFieldGroups.push(collectNonEmptyStringArray(details?.antonyms));
    sourceFieldGroups.push(collectNonEmptyStringArray(details?.collocations));

    targetFieldGroups.push(collectNonEmptyTextValues([parsed.translatedExample]));
    targetFieldGroups.push(collectNonEmptyStringArray(details?.usageNotes));
  }

  for (const fieldGroup of sourceFieldGroups) {
    assertExpectedLanguage(fieldGroup, sourceLang, targetLang);
  }
  for (const fieldGroup of targetFieldGroups) {
    assertExpectedLanguage(fieldGroup, targetLang, sourceLang);
  }

  const sourceTexts = collectSourceLanguageTexts(parsed, options.mode);
  if (sourceTexts.length > 0) {
    assertExpectedLanguage(sourceTexts, sourceLang, targetLang);
  }

  const targetTexts = collectTargetLanguageTexts(parsed, options.mode);
  if (targetTexts.length > 0) {
    assertExpectedLanguage(targetTexts, targetLang, sourceLang);
  }
}

function stripLanguageMarkersFromArray(values: unknown): string[] | undefined {
  if (!Array.isArray(values)) return undefined;
  const normalized = values
    .map((value) => (typeof value === "string" ? stripLanguageMarker(value) : undefined))
    .filter((value): value is string => typeof value === "string" && value.length > 0);
  if (normalized.length === 0) return undefined;
  return normalized;
}

function stripLanguageMarkersFromOutput(parsed: ParsedModelOutput): ParsedModelOutput {
  const details =
    parsed.details && typeof parsed.details === "object" && !Array.isArray(parsed.details)
      ? (parsed.details as Record<string, unknown>)
      : undefined;

  const nextDetails: Record<string, unknown> | undefined = details
    ? {
        ...(stripLanguageMarkersFromArray(details.alternativeMeanings)
          ? { alternativeMeanings: stripLanguageMarkersFromArray(details.alternativeMeanings) }
          : {}),
        ...(stripLanguageMarkersFromArray(details.antonyms)
          ? { antonyms: stripLanguageMarkersFromArray(details.antonyms) }
          : {}),
        ...(stripLanguageMarkersFromArray(details.usageNotes)
          ? { usageNotes: stripLanguageMarkersFromArray(details.usageNotes) }
          : {}),
        ...(stripLanguageMarkersFromArray(details.collocations)
          ? { collocations: stripLanguageMarkersFromArray(details.collocations) }
          : {}),
      }
    : undefined;

  return {
    ...parsed,
    definitionL2: stripLanguageMarker(parsed.definitionL2),
    sourceMeaning: stripLanguageMarker(parsed.sourceMeaning),
    translationL1: stripLanguageMarker(parsed.translationL1),
    meaning: stripLanguageMarker(parsed.meaning),
    whyThisSense: stripLanguageMarker(parsed.whyThisSense),
    shortExplanation: stripLanguageMarker(parsed.shortExplanation),
    exampleSentence: stripLanguageMarker(parsed.exampleSentence),
    translatedExample: stripLanguageMarker(parsed.translatedExample),
    synonyms: stripLanguageMarkersFromArray(parsed.synonyms),
    details: nextDetails && Object.keys(nextDetails).length > 0 ? nextDetails : undefined,
  };
}

function validateParsedOutput(
  parsed: ParsedModelOutput,
  options: {
    mode: LookupMode;
    sourceLang?: string;
    targetLang?: string;
    allowIncompleteBasic?: boolean;
    lenientBasic?: boolean;
  },
) {
  const hasMeaning = hasText(parsed.translationL1) || hasText(parsed.meaning);
  const hasExplanation = hasText(parsed.whyThisSense) || hasText(parsed.shortExplanation);
  const hasDefinition = hasText(parsed.definitionL2) || hasText(parsed.sourceMeaning);
  const allowIncompleteBasic = options.mode === "basic" && options.allowIncompleteBasic === true;
  const lenientBasic = options.mode === "basic" && options.lenientBasic === true;
  const hasAnyBasicSignal =
    hasMeaning ||
    hasExplanation ||
    hasDefinition ||
    hasText(parsed.lemma) ||
    hasText(parsed.surface) ||
    hasText(parsed.exampleSentence) ||
    hasText(parsed.translatedExample);

  if (lenientBasic) {
    if (!hasAnyBasicSignal) {
      throw new Error("model_output_schema_violation");
    }
    return;
  }

  if (allowIncompleteBasic) {
    if (!hasMeaning && !hasExplanation && !hasDefinition) {
      throw new Error("model_output_schema_violation");
    }
  } else if (!hasMeaning || !hasExplanation || !hasDefinition) {
    throw new Error("model_output_schema_violation");
  }

  validateLanguageMarkers(parsed, options.mode);
  validateLanguageSeparation(parsed, options);

  if (options.mode !== "advanced") return;

  const hasExampleSentence = hasText(parsed.exampleSentence);
  const hasTranslatedExample = hasText(parsed.translatedExample);
  const hasSynonyms = (parsed.synonyms?.length ?? 0) > 0;
  const details =
    parsed.details && typeof parsed.details === "object" && !Array.isArray(parsed.details)
      ? (parsed.details as Record<string, unknown>)
      : undefined;
  const hasAlternativeMeanings = hasNonEmptyStringArray(details?.alternativeMeanings);
  const hasAntonyms = hasNonEmptyStringArray(details?.antonyms);
  const hasCollocations = hasNonEmptyStringArray(details?.collocations);

  if (
    !hasExampleSentence ||
    !hasTranslatedExample ||
    !hasSynonyms ||
    !hasAlternativeMeanings ||
    !hasAntonyms ||
    !hasCollocations
  ) {
    throw new Error("model_output_schema_violation");
  }
}

export function parseModelOutput(
  content: string,
  options: {
    mode: LookupMode;
    sourceLang?: string;
    targetLang?: string;
    allowIncompleteBasic?: boolean;
    lenientBasic?: boolean;
  },
): ParsedModelOutput {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("empty_model_output");
  }

  const parsed = tryParseJson(trimmed);
  if (!parsed) {
    throw new Error("invalid_model_json_output");
  }

  const aligned = alignAliasFields(parsed);
  validateParsedOutput(aligned, options);
  return stripLanguageMarkersFromOutput(aligned);
}
