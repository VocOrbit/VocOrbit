import { UnauthorizedError, ValidationError } from "../../../../packages/core/src/errors";
import { newId } from "../../../../packages/core/src/ids";
import type { ExerciseQuestionType, ExerciseSessionDetail } from "../domain/exercise";
import type { ExerciseRepo } from "../ports/exercise-repo";
import type { ExerciseLanguagePreferencesReader } from "../ports/language-preferences";
import type {
  ExerciseWordSource,
  WordSourceLearningItem,
  WordSourceLearningItemDetail,
} from "../ports/word-source";
import {
  endOfDayUtc,
  escapeRegExp,
  normalizeGroupIds,
  normalizeQuestionTypes,
  parseMode,
  parseNonNegativeInt,
  parsePositiveInt,
  parseTimezoneOffsetMinutes,
  shuffle,
  startOfDayUtc,
} from "./session-shared";

export type CreateExerciseSessionInput = {
  mode?: "basic" | "advanced";
  totalQuestions?: number;
  todayMinimum?: number;
  timezoneOffsetMinutes?: number;
  promptLanguage?: string;
  questionTypes?: ExerciseQuestionType[];
  groupIds?: string[];
};

export type CreateExerciseSessionContext = {
  user: {
    id: string;
  };
};

type CreateExerciseSessionDeps = {
  repo: ExerciseRepo;
  wordSource: ExerciseWordSource;
  languagePreferences: ExerciseLanguagePreferencesReader;
  defaults: {
    totalQuestions: number;
    maxTotalQuestions: number;
    todayMinimum: number;
    maxTodayMinimum: number;
    maxLearningItemsScan: number;
  };
};

function pickDistractors(values: string[], correct: string, maxDistractors = 3): string[] {
  const unique = [...new Set(values.map((item) => item.trim()).filter((item) => item.length > 0))];
  const filtered = unique.filter(
    (item) => item.toLocaleLowerCase("en-US") !== correct.toLocaleLowerCase("en-US"),
  );
  return shuffle(filtered).slice(0, maxDistractors);
}

function buildOptions(correct: string, candidates: string[]): string[] {
  const distractors = pickDistractors(candidates, correct);
  return shuffle([correct, ...distractors]);
}

function buildGapSentence(sentence: string, word: string): string {
  const escaped = escapeRegExp(word);
  const wholeWord = new RegExp(`\\b${escaped}\\b`, "i");
  if (wholeWord.test(sentence)) {
    return sentence.replace(wholeWord, "____");
  }
  return `${sentence} (____)`;
}

function countWordLikeTokens(value: string): number {
  return value
    .split(/\s+/)
    .map((token) => token.replace(/[^\p{L}\p{N}'’-]/gu, ""))
    .filter((token) => token.length > 0).length;
}

function containsWholeWord(sentence: string, word: string): boolean {
  const escaped = escapeRegExp(word.trim());
  if (!escaped) return false;
  const wholeWord = new RegExp(`\\b${escaped}\\b`, "i");
  return wholeWord.test(sentence);
}

function isUsableFillInGapSentence(sentence: string | undefined, word: string): sentence is string {
  if (!sentence) return false;
  const trimmed = sentence.trim();
  if (!trimmed) return false;
  if (normalizeToken(trimmed) === normalizeToken(word)) return false;
  if (countWordLikeTokens(trimmed) < 4) return false;
  if (!containsWholeWord(trimmed, word)) return false;

  const prompt = buildGapSentence(trimmed, word);
  const remaining = prompt.replace(/____/g, " ");
  return countWordLikeTokens(remaining) >= 3;
}

function sortByRecent(items: WordSourceLearningItem[]): WordSourceLearningItem[] {
  return [...items].sort((a, b) => {
    const aMs = Date.parse(a.createdAt);
    const bMs = Date.parse(b.createdAt);
    return bMs - aMs;
  });
}

function isToday(item: WordSourceLearningItem, start: Date, end: Date): boolean {
  const createdMs = Date.parse(item.createdAt);
  return createdMs >= start.getTime() && createdMs < end.getTime();
}

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

function sharedPrefixLength(left: string, right: string): number {
  const max = Math.min(left.length, right.length);
  let index = 0;
  while (index < max && left[index] === right[index]) {
    index += 1;
  }
  return index;
}

function lexicalSimilarityScore(base: string, candidate: string): number {
  const baseToken = normalizeToken(base);
  const candidateToken = normalizeToken(candidate);
  if (!baseToken || !candidateToken) return Number.NEGATIVE_INFINITY;

  let score = 0;
  if (baseToken[0] === candidateToken[0]) score += 2;
  score += Math.min(sharedPrefixLength(baseToken, candidateToken), 4) * 0.6;
  score -= Math.abs(baseToken.length - candidateToken.length) * 0.2;
  return score;
}

function buildSynonymOptions(input: {
  promptWord: string;
  correct: string;
  candidates: string[];
  maxDistractors?: number;
}): string[] {
  const maxDistractors = input.maxDistractors ?? 3;
  const blocked = new Set<string>([
    normalizeToken(input.promptWord),
    normalizeToken(input.correct),
  ]);
  const ranked: Array<{ value: string; score: number }> = [];

  for (const candidate of input.candidates) {
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    const candidateToken = normalizeToken(trimmed);
    if (blocked.has(candidateToken)) continue;
    blocked.add(candidateToken);
    ranked.push({
      value: trimmed,
      score: lexicalSimilarityScore(input.promptWord, trimmed),
    });
  }

  const distractors = ranked
    .sort((a, b) => b.score - a.score)
    .slice(0, maxDistractors)
    .map((entry) => entry.value);

  return shuffle([input.correct, ...distractors]);
}

type ExercisePromptLanguage =
  | "ar"
  | "de"
  | "en"
  | "es"
  | "fr"
  | "hi"
  | "id"
  | "it"
  | "ja"
  | "ko"
  | "pl"
  | "pt"
  | "ru"
  | "tl"
  | "tr"
  | "vi"
  | "zh";

const EXERCISE_PROMPT_BUILDERS: Record<
  ExercisePromptLanguage,
  {
    meaningMatch: (vocab: string) => string;
    guessWord: (meaning: string) => string;
  }
> = {
  ar: {
    meaningMatch: (vocab) => `ما معنى "${vocab}"؟`,
    guessWord: (meaning) => `أي كلمة تعني "${meaning}"؟`,
  },
  de: {
    meaningMatch: (vocab) => `Was bedeutet "${vocab}"?`,
    guessWord: (meaning) => `Welches Wort bedeutet "${meaning}"?`,
  },
  en: {
    meaningMatch: (vocab) => `What is the meaning of "${vocab}"?`,
    guessWord: (meaning) => `Which word means "${meaning}"?`,
  },
  es: {
    meaningMatch: (vocab) => `¿Cuál es el significado de "${vocab}"?`,
    guessWord: (meaning) => `¿Qué palabra significa "${meaning}"?`,
  },
  fr: {
    meaningMatch: (vocab) => `Quelle est la signification de "${vocab}" ?`,
    guessWord: (meaning) => `Quel mot signifie "${meaning}" ?`,
  },
  hi: {
    meaningMatch: (vocab) => `"${vocab}" का अर्थ क्या है?`,
    guessWord: (meaning) => `कौन सा शब्द "${meaning}" का अर्थ देता है?`,
  },
  id: {
    meaningMatch: (vocab) => `Apa arti dari "${vocab}"?`,
    guessWord: (meaning) => `Kata mana yang berarti "${meaning}"?`,
  },
  it: {
    meaningMatch: (vocab) => `Qual è il significato di "${vocab}"?`,
    guessWord: (meaning) => `Quale parola significa "${meaning}"?`,
  },
  ja: {
    meaningMatch: (vocab) => `"${vocab}" の意味は何ですか？`,
    guessWord: (meaning) => `どの単語が「${meaning}」を意味しますか？`,
  },
  ko: {
    meaningMatch: (vocab) => `"${vocab}"의 의미는 무엇인가요?`,
    guessWord: (meaning) => `어떤 단어가 "${meaning}"를 의미하나요?`,
  },
  pl: {
    meaningMatch: (vocab) => `Jakie jest znaczenie słowa "${vocab}"?`,
    guessWord: (meaning) => `Które słowo oznacza "${meaning}"?`,
  },
  pt: {
    meaningMatch: (vocab) => `Qual é o significado de "${vocab}"?`,
    guessWord: (meaning) => `Qual palavra significa "${meaning}"?`,
  },
  ru: {
    meaningMatch: (vocab) => `Что означает "${vocab}"?`,
    guessWord: (meaning) => `Какое слово означает "${meaning}"?`,
  },
  tl: {
    meaningMatch: (vocab) => `Ano ang kahulugan ng "${vocab}"?`,
    guessWord: (meaning) => `Aling salita ang nangangahulugang "${meaning}"?`,
  },
  tr: {
    meaningMatch: (vocab) => `"${vocab}" kelimesinin anlamı nedir?`,
    guessWord: (meaning) => `"${meaning}" anlamına gelen kelime hangisi?`,
  },
  vi: {
    meaningMatch: (vocab) => `"${vocab}" có nghĩa là gì?`,
    guessWord: (meaning) => `Từ nào có nghĩa là "${meaning}"?`,
  },
  zh: {
    meaningMatch: (vocab) => `"${vocab}" 的意思是什么？`,
    guessWord: (meaning) => `哪个词的意思是 "${meaning}"？`,
  },
};

function normalizeLanguageTag(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  const [baseCode] = normalized.split("-");
  return baseCode ?? normalized;
}

function resolvePromptLanguage(value: string | undefined): ExercisePromptLanguage {
  const normalized = normalizeLanguageTag(value);
  if (!normalized) return "en";
  if (normalized in EXERCISE_PROMPT_BUILDERS) {
    return normalized as ExercisePromptLanguage;
  }
  return "en";
}

async function resolvePromptLanguageByUser(
  languagePreferences: ExerciseLanguagePreferencesReader,
  userId: string,
  preferredLanguage?: string,
): Promise<ExercisePromptLanguage> {
  const preferred = preferredLanguage?.trim();
  if (preferred) {
    return resolvePromptLanguage(preferred);
  }

  try {
    const preferences = await languagePreferences.getByUserId(userId);
    return resolvePromptLanguage(preferences?.l1Language);
  } catch {
    return "tr";
  }
}

function buildMeaningMatchPrompt(vocab: string, language: ExercisePromptLanguage): string {
  return EXERCISE_PROMPT_BUILDERS[language].meaningMatch(vocab);
}

function buildGuessWordPrompt(meaning: string, language: ExercisePromptLanguage): string {
  return EXERCISE_PROMPT_BUILDERS[language].guessWord(meaning);
}

export async function createExerciseSession(
  deps: CreateExerciseSessionDeps,
  input: CreateExerciseSessionInput,
  context: CreateExerciseSessionContext,
): Promise<ExerciseSessionDetail> {
  if (!context.user.id) {
    throw new UnauthorizedError("Authenticated user is required");
  }

  const mode = parseMode(input.mode);
  const totalQuestions = parsePositiveInt(
    input.totalQuestions,
    deps.defaults.totalQuestions,
    "totalQuestions",
    deps.defaults.maxTotalQuestions,
  );
  const todayMinimum = parseNonNegativeInt(
    input.todayMinimum,
    deps.defaults.todayMinimum,
    "todayMinimum",
    deps.defaults.maxTodayMinimum,
  );
  const timezoneOffsetMinutes = parseTimezoneOffsetMinutes(input.timezoneOffsetMinutes);
  const questionTypes = normalizeQuestionTypes(input.questionTypes);
  const groupIds = normalizeGroupIds(input.groupIds);
  const promptLanguage = await resolvePromptLanguageByUser(
    deps.languagePreferences,
    context.user.id,
    input.promptLanguage,
  );

  const allActiveItems = await deps.wordSource.listActiveLearningItems({
    userId: context.user.id,
    limit: deps.defaults.maxLearningItemsScan,
    groupIds,
  });
  if (allActiveItems.length < 2) {
    throw new ValidationError("At least 2 active learning items are required to build an exercise");
  }

  const modeItems = allActiveItems.filter((item) => item.lastSeenMode === mode);
  const candidateItems = modeItems.length >= 2 ? modeItems : allActiveItems;
  const sorted = sortByRecent(candidateItems);

  const now = new Date();
  const todayStart = startOfDayUtc(now, timezoneOffsetMinutes);
  const todayEnd = endOfDayUtc(todayStart);

  const todayItems = sorted.filter((item) => isToday(item, todayStart, todayEnd));
  const otherItems = sorted.filter((item) => !isToday(item, todayStart, todayEnd));

  const requiredTodayQuestions = Math.min(todayItems.length, todayMinimum, totalQuestions);
  const selectedToday = todayItems.slice(0, requiredTodayQuestions);
  const remaining = totalQuestions - selectedToday.length;
  const selectedOthers = [...otherItems, ...todayItems.slice(requiredTodayQuestions)].slice(
    0,
    remaining,
  );
  const selectedItems = [...selectedToday, ...selectedOthers];
  if (selectedItems.length === 0) {
    throw new ValidationError("No learning items available for exercise generation");
  }

  const sessionId = newId();
  type SessionQuestion = Parameters<ExerciseRepo["createSession"]>[0]["questions"][number];
  type NewSessionQuestion = Omit<SessionQuestion, "id" | "orderNo">;
  const questions: SessionQuestion[] = [];
  const todayItemIds = new Set(selectedToday.map((item) => item.id));
  let generatedTodayQuestions = 0;

  const appendQuestion = (question: NewSessionQuestion) => {
    questions.push({
      id: newId(),
      orderNo: questions.length + 1,
      ...question,
    });

    if (todayItemIds.has(question.itemId)) {
      generatedTodayQuestions += 1;
    }
  };

  const detailByItemId = new Map<string, WordSourceLearningItemDetail | null>();
  const needsItemDetail = questionTypes.some(
    (type) => type === "fill_in_gap" || type === "match_synonym",
  );
  if (needsItemDetail) {
    const detailPairs = await Promise.all(
      selectedItems.map(
        async (item) =>
          [
            item.id,
            await deps.wordSource.getLearningItemDetail({
              userId: context.user.id,
              itemId: item.id,
            }),
          ] as const,
      ),
    );

    for (const [itemId, detail] of detailPairs) {
      detailByItemId.set(itemId, detail);
    }
  }

  const meaningCandidates = candidateItems.map(
    (candidate) => candidate.targetMeaning || candidate.lastMeaning,
  );
  const vocabCandidates = candidateItems.map((candidate) => candidate.vocab);
  const synonymPool = questionTypes.includes("match_synonym")
    ? selectedItems.flatMap((item) => normalizeSynonyms(detailByItemId.get(item.id)?.synonyms))
    : [];

  for (let i = 0; i < selectedItems.length; i += 1) {
    const item = selectedItems[i];
    if (!item) continue;
    const questionType = questionTypes[i % questionTypes.length];
    if (!questionType) continue;

    const buildMeaningMatchQuestion = (): NewSessionQuestion | null => {
      const correct = item.targetMeaning || item.lastMeaning;
      const options = buildOptions(correct, meaningCandidates);
      if (options.length < 2) return null;
      return {
        type: "meaning_match",
        itemId: item.id,
        prompt: buildMeaningMatchPrompt(item.vocab, promptLanguage),
        options,
        correctAnswer: correct,
        explanation: item.definitionL2,
      };
    };

    const buildGuessWordQuestion = (): NewSessionQuestion | null => {
      const correct = item.vocab;
      const options = buildOptions(correct, vocabCandidates);
      if (options.length < 2) return null;
      return {
        type: "guess_word",
        itemId: item.id,
        prompt: buildGuessWordPrompt(item.targetMeaning || item.lastMeaning, promptLanguage),
        options,
        correctAnswer: correct,
        explanation: item.definitionL2,
      };
    };

    if (questionType === "meaning_match") {
      const question = buildMeaningMatchQuestion();
      if (question) appendQuestion(question);
      continue;
    }

    if (questionType === "guess_word") {
      const question = buildGuessWordQuestion();
      if (question) appendQuestion(question);
      continue;
    }

    if (questionType === "match_synonym") {
      const detail = detailByItemId.get(item.id) ?? null;
      const normalizedSynonyms = normalizeSynonyms(detail?.synonyms);
      const correct = pickPreferredSynonym(normalizedSynonyms, item.vocab);
      if (!correct) continue;

      const ownSynonymKeys = new Set(
        normalizedSynonyms.map((candidate) => normalizeToken(candidate)),
      );
      const distractorCandidates = [
        ...synonymPool.filter((candidate) => !ownSynonymKeys.has(normalizeToken(candidate))),
        ...vocabCandidates,
      ];
      const options = buildSynonymOptions({
        promptWord: item.vocab,
        correct,
        candidates: distractorCandidates,
      });
      if (options.length < 2) continue;

      appendQuestion({
        type: questionType,
        itemId: item.id,
        prompt: item.vocab,
        options,
        correctAnswer: correct,
        explanation: item.definitionL2,
      });
      continue;
    }

    const detail = detailByItemId.get(item.id) ?? null;
    const sentenceCandidate = detail?.sentence?.trim();
    const sentence = isUsableFillInGapSentence(sentenceCandidate, item.vocab)
      ? sentenceCandidate
      : undefined;

    if (!sentence) {
      const fallback = buildMeaningMatchQuestion() ?? buildGuessWordQuestion();
      if (fallback) appendQuestion(fallback);
      continue;
    }

    const prompt = buildGapSentence(sentence, item.vocab);
    const correct = item.vocab;
    const options = buildOptions(correct, vocabCandidates);
    if (options.length < 2) {
      const fallback = buildMeaningMatchQuestion() ?? buildGuessWordQuestion();
      if (fallback) appendQuestion(fallback);
      continue;
    }
    appendQuestion({
      type: questionType,
      itemId: item.id,
      prompt,
      options,
      correctAnswer: correct,
      explanation: detail?.shortExplanation ?? item.definitionL2,
    });
  }

  if (questions.length === 0) {
    throw new ValidationError(
      "No exercise questions could be generated from available learning items",
    );
  }

  return await deps.repo.createSession({
    session: {
      id: sessionId,
      userId: context.user.id,
      mode,
      status: "active",
      totalQuestions: questions.length,
      requiredTodayQuestions: Math.min(generatedTodayQuestions, questions.length),
      questionTypes,
      timezoneOffsetMinutes,
    },
    questions,
  });
}
