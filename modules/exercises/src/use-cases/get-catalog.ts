import { UnauthorizedError } from "../../../../packages/core/src/errors";
import type {
  ExerciseCatalog,
  ExerciseCatalogItem,
  ExerciseQuestionType,
} from "../domain/exercise";
import type { ExerciseWordSource, WordSourceLearningItem } from "../ports/word-source";
import { normalizeGroupIds, parseMode, parseTimezoneOffsetMinutes } from "./session-shared";

const ORDERED_TYPES: ExerciseQuestionType[] = [
  "meaning_match",
  "guess_word",
  "fill_in_gap",
  "match_synonym",
];

function normalizeToken(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

function normalizeSynonyms(raw: string[] | undefined): string[] {
  if (!raw || raw.length === 0) return [];

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const candidate of raw) {
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    const key = normalizeToken(trimmed);
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(trimmed);
  }

  return normalized;
}

function pickPreferredSynonym(synonyms: string[], vocab: string): string | undefined {
  if (synonyms.length === 0) return undefined;

  const vocabKey = normalizeToken(vocab);
  const distinct = synonyms.find((candidate) => normalizeToken(candidate) !== vocabKey);
  if (distinct) return distinct;
  return synonyms[0];
}

function createBaseCatalogItems(candidateCount: number): ExerciseCatalogItem[] {
  if (candidateCount < 2) {
    return ORDERED_TYPES.map((type) => ({
      type,
      available: false,
      availableItemCount: 0,
      reason: "not_enough_learning_items",
    }));
  }

  return ORDERED_TYPES.map((type) => ({
    type,
    available: type === "match_synonym" ? false : true,
    availableItemCount: type === "match_synonym" ? 0 : candidateCount,
  }));
}

async function countSynonymReadyItems(
  wordSource: ExerciseWordSource,
  userId: string,
  items: WordSourceLearningItem[],
): Promise<number> {
  if (items.length < 2) return 0;

  const details = await Promise.all(
    items.map((item) =>
      wordSource.getLearningItemDetail({
        userId,
        itemId: item.id,
      }),
    ),
  );

  let count = 0;
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (!item) continue;
    const detail = details[index];
    const synonyms = normalizeSynonyms(detail?.synonyms);
    const preferred = pickPreferredSynonym(synonyms, item.vocab);
    if (preferred) count += 1;
  }

  return count;
}

export async function getExerciseCatalog(
  deps: {
    wordSource: ExerciseWordSource;
    defaults: {
      maxLearningItemsScan: number;
    };
  },
  input: {
    userId: string;
    mode?: "basic" | "advanced";
    timezoneOffsetMinutes?: number;
    groupIds?: string[];
  },
): Promise<ExerciseCatalog> {
  if (!input.userId) throw new UnauthorizedError("Authenticated user is required");

  const mode = parseMode(input.mode);
  const timezoneOffsetMinutes = parseTimezoneOffsetMinutes(input.timezoneOffsetMinutes);
  const groupIds = normalizeGroupIds(input.groupIds);

  const allActiveItems = await deps.wordSource.listActiveLearningItems({
    userId: input.userId,
    limit: deps.defaults.maxLearningItemsScan,
    groupIds,
  });

  const modeItems = allActiveItems.filter((item) => item.lastSeenMode === mode);
  const candidateItems = modeItems.length >= 2 ? modeItems : allActiveItems;
  const items = createBaseCatalogItems(candidateItems.length);

  if (candidateItems.length >= 2) {
    const synonymReadyCount = await countSynonymReadyItems(
      deps.wordSource,
      input.userId,
      candidateItems,
    );

    const synonymItem = items.find((item) => item.type === "match_synonym");
    if (synonymItem) {
      if (synonymReadyCount > 0) {
        synonymItem.available = true;
        synonymItem.availableItemCount = synonymReadyCount;
      } else {
        synonymItem.available = false;
        synonymItem.availableItemCount = 0;
        synonymItem.reason = "missing_synonyms";
      }
    }
  }

  return {
    mode,
    timezoneOffsetMinutes,
    activeItemCount: allActiveItems.length,
    items,
  };
}
