import type {
  LookupMode,
  LearningItemStatus,
  WordInsightLearningItem,
  WordInsightLearningItemDetail,
} from "@/services/api/wordInsightApi"

export type VocabularyEntry = {
  id: string
  word: string
  pronunciation: string
  partOfSpeech: string
  definition: string
  example: string
  examples?: string[]
  status: LearningItemStatus
  lemma: string
  sourceLang: string
  targetLang: string
  encounterCount: number
  lastSeenMode: LookupMode
  lastLookupAt: string
  isFavorite: boolean
  favoritedAt?: string
}

export type VocabularyEntryDetail = {
  entry: VocabularyEntry
  contextSentence?: string
  learningDefinition?: string
  nativeMeaning?: string
  sentence?: string
  translatedExample?: string
  synonyms: string[]
  alternativeMeanings: string[]
  antonyms: string[]
  usageNotes: string[]
  collocations: string[]
  confidence?: number
  meaning?: string
  shortExplanation?: string
}

type InsightPayload = {
  surface?: unknown
  sourceLang?: unknown
  targetLang?: unknown
  partOfSpeech?: unknown
  sourceMeaning?: unknown
  definitionL2?: unknown
  translationL1?: unknown
  whyThisSense?: unknown
  meaning?: unknown
  shortExplanation?: unknown
  exampleSentence?: unknown
  translatedExample?: unknown
  synonyms?: unknown
  details?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

const providerMetadataPattern = /\(provider=[^)]+\)/gi
const providerAssignmentPattern = /\bprovider=[\w.-]+\b/gi
const translatedUnavailablePattern = /^translated example is not available\.?$/i

function sanitizeUserFacingText(value: string): string {
  return value
    .replace(providerMetadataPattern, "")
    .replace(providerAssignmentPattern, "")
    .replace(/\s{2,}/g, " ")
    .trim()
}

function readNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = sanitizeUserFacingText(value)
  if (trimmed.length === 0) return undefined
  if (translatedUnavailablePattern.test(trimmed)) return undefined
  return trimmed
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0)
}

function readFiniteNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined
  return value
}

function uniqueStrings(values: Array<string | undefined>): string[] {
  const set = new Set<string>()
  for (const value of values) {
    const normalized = readNonEmptyString(value)
    if (!normalized) continue
    if (set.has(normalized)) continue
    set.add(normalized)
  }
  return Array.from(set)
}

function readInsightPayload(payload: unknown): InsightPayload | undefined {
  if (!isRecord(payload)) return undefined
  const insight = payload.insight
  if (!isRecord(insight)) return undefined
  return insight
}

export function mapLearningItemToEntry(item: WordInsightLearningItem): VocabularyEntry {
  const translationL1 =
    readNonEmptyString(item.translationL1) ??
    readNonEmptyString(item.targetMeaning) ??
    readNonEmptyString(item.lastMeaning) ??
    ""
  const definitionL2 = readNonEmptyString(item.definitionL2)
  const whyThisSense = readNonEmptyString(item.whyThisSense)
  const fallbackExample = definitionL2 ?? whyThisSense ?? translationL1
  const pronunciation = readNonEmptyString(item.phonetic) ?? `/${item.lemma}/`

  return {
    id: item.id,
    word: item.vocab,
    pronunciation,
    partOfSpeech: "",
    definition: translationL1,
    example: fallbackExample,
    status: item.status,
    lemma: item.lemma,
    sourceLang: item.sourceLang,
    targetLang: item.targetLang,
    encounterCount: item.encounterCount,
    lastSeenMode: item.lastSeenMode,
    lastLookupAt: item.lastLookupAt,
    isFavorite: item.isFavorite,
    favoritedAt: item.favoritedAt,
  }
}

export function mapLearningItemDetailToEntryDetail(
  detail: WordInsightLearningItemDetail,
): VocabularyEntryDetail {
  const entry = mapLearningItemToEntry(detail.item)
  const insight = readInsightPayload(detail.latestLookup?.responsePayload)
  const partOfSpeech = readNonEmptyString(insight?.partOfSpeech)
  const contextSentence =
    readNonEmptyString(detail.item.contextSentence) ??
    readNonEmptyString(detail.latestLookup?.sentence)
  const exampleSentence = readNonEmptyString(insight?.exampleSentence)
  const sentence = contextSentence ?? exampleSentence
  const translatedExample = readNonEmptyString(insight?.translatedExample)
  const detailsPayload = isRecord(insight?.details) ? insight.details : undefined
  const synonyms = readStringArray(insight?.synonyms)
  const alternativeMeanings = readStringArray(
    detailsPayload?.alternativeMeanings ?? (insight as Record<string, unknown> | undefined)?.alternativeMeanings,
  )
  const antonyms = readStringArray(
    detailsPayload?.antonyms ?? (insight as Record<string, unknown> | undefined)?.antonyms,
  )
  const usageNotes = readStringArray(
    detailsPayload?.usageNotes ?? (insight as Record<string, unknown> | undefined)?.usageNotes,
  )
  const collocations = readStringArray(
    detailsPayload?.collocations ?? (insight as Record<string, unknown> | undefined)?.collocations,
  )
  const confidence =
    readFiniteNumber(detail.latestLookup?.responseSummary?.confidence) ??
    readFiniteNumber((insight as Record<string, unknown> | undefined)?.confidence)
  const translationL1 =
    readNonEmptyString(detail.item.translationL1) ??
    readNonEmptyString(detail.latestLookup?.responseSummary?.meaning) ??
    readNonEmptyString(insight?.translationL1) ??
    readNonEmptyString(insight?.meaning) ??
    entry.definition
  const definitionL2 =
    readNonEmptyString(detail.item.definitionL2) ??
    readNonEmptyString(insight?.definitionL2) ??
    readNonEmptyString(insight?.sourceMeaning)
  const whyThisSense =
    readNonEmptyString(detail.item.whyThisSense) ??
    readNonEmptyString(detail.latestLookup?.responseSummary?.shortExplanation) ??
    readNonEmptyString(insight?.whyThisSense) ??
    readNonEmptyString(insight?.shortExplanation)
  const learningDefinition = definitionL2 ?? sentence

  const examples = contextSentence
    ? uniqueStrings([exampleSentence, translatedExample])
    : uniqueStrings([sentence, translatedExample])

  if (partOfSpeech) {
    entry.partOfSpeech = partOfSpeech
  }

  if (examples.length > 0) {
    entry.examples = examples
  }

  return {
    entry,
    contextSentence,
    learningDefinition,
    nativeMeaning: translationL1,
    sentence,
    translatedExample,
    synonyms,
    alternativeMeanings,
    antonyms,
    usageNotes,
    collocations,
    confidence,
    meaning: translationL1,
    shortExplanation: whyThisSense,
  }
}
