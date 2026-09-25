import { describe, expect, it } from "bun:test";
import type { ExerciseQuestionType, ExerciseSessionDetail } from "../src/domain/exercise";
import type { ExerciseRepo } from "../src/ports/exercise-repo";
import type { ExerciseLanguagePreferencesReader } from "../src/ports/language-preferences";
import type { ExerciseWordSource, WordSourceLearningItem } from "../src/ports/word-source";
import { createExercisesPublicContract } from "../src/public-contract";
import { getExerciseWeeklyAnalytics } from "../src/use-cases/get-weekly-analytics";

function createMemoryRepo(): ExerciseRepo {
  return {
    async createSession(input) {
      const now = new Date().toISOString();
      return {
        session: {
          ...input.session,
          questionTypes: input.session.questionTypes as ExerciseQuestionType[],
          createdAt: now,
          updatedAt: now,
        },
        progress: {
          totalQuestions: input.questions.length,
          answeredQuestions: 0,
          correctAnswers: 0,
          scorePercent: 0,
        },
        questions: input.questions.map((question) => ({
          id: question.id,
          orderNo: question.orderNo,
          type: question.type,
          itemId: question.itemId,
          prompt: question.prompt,
          options: question.options,
          explanation: question.explanation,
          answered: false,
        })),
      } satisfies ExerciseSessionDetail;
    },
    async getSessionDetail() {
      return null;
    },
    async submitAnswer() {
      return null;
    },
    async completeSession() {
      return null;
    },
    async getWeeklyAnalyticsData() {
      return {
        sessions: [],
        answers: [],
      };
    },
  };
}

function createWordSource(): ExerciseWordSource {
  const now = new Date().toISOString();
  const items: WordSourceLearningItem[] = [
    {
      id: "item-1",
      lemma: "bridge",
      vocab: "bridge",
      targetMeaning: "kopru",
      lastMeaning: "kopru",
      definitionL2: "A structure built over water.",
      lastSeenMode: "basic",
      createdAt: now,
    },
    {
      id: "item-2",
      lemma: "cookie",
      vocab: "cookie",
      targetMeaning: "kurabiye",
      lastMeaning: "kurabiye",
      definitionL2: "A small sweet baked food.",
      lastSeenMode: "basic",
      createdAt: now,
    },
  ];

  return {
    async listActiveLearningItems(input) {
      if (input.groupIds?.length) {
        return input.groupIds.includes("group-1") ? items : [];
      }
      return items;
    },
    async getLearningItemDetail() {
      return null;
    },
  };
}

function createLanguagePreferences(l1Language: string): ExerciseLanguagePreferencesReader {
  return {
    async getByUserId() {
      return {
        l1Language,
        l2Language: "es",
      };
    },
  };
}

describe("exercise prompts", () => {
  it("uses english prompts when l1Language is english", async () => {
    const exercises = createExercisesPublicContract({
      repo: createMemoryRepo(),
      wordSource: createWordSource(),
      languagePreferences: createLanguagePreferences("en"),
      defaults: {
        totalQuestions: 10,
        maxTotalQuestions: 30,
        todayMinimum: 0,
        maxTodayMinimum: 20,
        maxLearningItemsScan: 100,
      },
    });

    const detail = await exercises.createSession(
      {
        mode: "basic",
        totalQuestions: 2,
        todayMinimum: 0,
        questionTypes: ["meaning_match", "guess_word"],
      },
      {
        user: {
          id: "user-1",
        },
      },
    );

    const meaningPrompt = detail.questions.find(
      (question) => question.type === "meaning_match",
    )?.prompt;
    const guessPrompt = detail.questions.find((question) => question.type === "guess_word")?.prompt;

    expect(meaningPrompt).toContain("What is the meaning of");
    expect(guessPrompt).toContain("Which word means");
  });

  it("keeps turkish prompts when l1Language is turkish", async () => {
    const exercises = createExercisesPublicContract({
      repo: createMemoryRepo(),
      wordSource: createWordSource(),
      languagePreferences: createLanguagePreferences("tr"),
      defaults: {
        totalQuestions: 10,
        maxTotalQuestions: 30,
        todayMinimum: 0,
        maxTodayMinimum: 20,
        maxLearningItemsScan: 100,
      },
    });

    const detail = await exercises.createSession(
      {
        mode: "basic",
        totalQuestions: 2,
        todayMinimum: 0,
        questionTypes: ["meaning_match", "guess_word"],
      },
      {
        user: {
          id: "user-1",
        },
      },
    );

    const meaningPrompt = detail.questions.find(
      (question) => question.type === "meaning_match",
    )?.prompt;
    const guessPrompt = detail.questions.find((question) => question.type === "guess_word")?.prompt;

    expect(meaningPrompt).toContain("kelimesinin anlamı nedir");
    expect(guessPrompt).toContain("anlamına gelen kelime hangisi");
  });

  it("uses spanish prompts when l1Language is spanish", async () => {
    const exercises = createExercisesPublicContract({
      repo: createMemoryRepo(),
      wordSource: createWordSource(),
      languagePreferences: createLanguagePreferences("es"),
      defaults: {
        totalQuestions: 10,
        maxTotalQuestions: 30,
        todayMinimum: 0,
        maxTodayMinimum: 20,
        maxLearningItemsScan: 100,
      },
    });

    const detail = await exercises.createSession(
      {
        mode: "basic",
        totalQuestions: 2,
        todayMinimum: 0,
        questionTypes: ["meaning_match", "guess_word"],
      },
      {
        user: {
          id: "user-1",
        },
      },
    );

    const meaningPrompt = detail.questions.find(
      (question) => question.type === "meaning_match",
    )?.prompt;
    const guessPrompt = detail.questions.find((question) => question.type === "guess_word")?.prompt;

    expect(meaningPrompt).toContain("¿Cuál es el significado de");
    expect(guessPrompt).toContain("¿Qué palabra significa");
  });

  it("normalizes regional portuguese tags for prompts", async () => {
    const exercises = createExercisesPublicContract({
      repo: createMemoryRepo(),
      wordSource: createWordSource(),
      languagePreferences: createLanguagePreferences("pt-br"),
      defaults: {
        totalQuestions: 10,
        maxTotalQuestions: 30,
        todayMinimum: 0,
        maxTodayMinimum: 20,
        maxLearningItemsScan: 100,
      },
    });

    const detail = await exercises.createSession(
      {
        mode: "basic",
        totalQuestions: 2,
        todayMinimum: 0,
        questionTypes: ["meaning_match", "guess_word"],
      },
      {
        user: {
          id: "user-1",
        },
      },
    );

    const meaningPrompt = detail.questions.find(
      (question) => question.type === "meaning_match",
    )?.prompt;
    const guessPrompt = detail.questions.find((question) => question.type === "guess_word")?.prompt;

    expect(meaningPrompt).toContain("Qual é o significado de");
    expect(guessPrompt).toContain("Qual palavra significa");
  });

  it("prefers explicit promptLanguage over stored user preference", async () => {
    const exercises = createExercisesPublicContract({
      repo: createMemoryRepo(),
      wordSource: createWordSource(),
      languagePreferences: createLanguagePreferences("tr"),
      defaults: {
        totalQuestions: 10,
        maxTotalQuestions: 30,
        todayMinimum: 0,
        maxTodayMinimum: 20,
        maxLearningItemsScan: 100,
      },
    });

    const detail = await exercises.createSession(
      {
        mode: "basic",
        totalQuestions: 2,
        todayMinimum: 0,
        promptLanguage: "es",
        questionTypes: ["meaning_match", "guess_word"],
      },
      {
        user: {
          id: "user-1",
        },
      },
    );

    const meaningPrompt = detail.questions.find(
      (question) => question.type === "meaning_match",
    )?.prompt;
    const guessPrompt = detail.questions.find((question) => question.type === "guess_word")?.prompt;

    expect(meaningPrompt).toContain("¿Cuál es el significado de");
    expect(guessPrompt).toContain("¿Qué palabra significa");
  });

  it("creates sessions only from selected group learning items", async () => {
    const now = new Date().toISOString();
    const groupedItems: WordSourceLearningItem[] = [
      {
        id: "item-business-1",
        lemma: "invoice",
        vocab: "invoice",
        targetMeaning: "fatura",
        lastMeaning: "fatura",
        definitionL2: "A document requesting payment.",
        lastSeenMode: "basic",
        createdAt: now,
      },
      {
        id: "item-business-2",
        lemma: "deadline",
        vocab: "deadline",
        targetMeaning: "son tarih",
        lastMeaning: "son tarih",
        definitionL2: "The latest time by which something must be finished.",
        lastSeenMode: "basic",
        createdAt: now,
      },
    ];
    const travelItem: WordSourceLearningItem = {
      id: "item-travel-1",
      lemma: "boarding",
      vocab: "boarding",
      targetMeaning: "ucaga binis",
      lastMeaning: "ucaga binis",
      definitionL2: "The process of getting onto a plane.",
      lastSeenMode: "basic",
      createdAt: now,
    };
    const wordSource: ExerciseWordSource = {
      async listActiveLearningItems(input) {
        if (input.groupIds?.includes("group-business")) {
          return groupedItems;
        }
        return [...groupedItems, travelItem];
      },
      async getLearningItemDetail() {
        return null;
      },
    };
    const exercises = createExercisesPublicContract({
      repo: createMemoryRepo(),
      wordSource,
      languagePreferences: createLanguagePreferences("tr"),
      defaults: {
        totalQuestions: 10,
        maxTotalQuestions: 30,
        todayMinimum: 0,
        maxTodayMinimum: 20,
        maxLearningItemsScan: 100,
      },
    });

    const detail = await exercises.createSession(
      {
        mode: "basic",
        totalQuestions: 3,
        todayMinimum: 0,
        questionTypes: ["meaning_match"],
        groupIds: ["group-business"],
      },
      {
        user: {
          id: "user-1",
        },
      },
    );

    expect(detail.session.totalQuestions).toBe(2);
    expect(detail.questions.every((question) => question.itemId.startsWith("item-business"))).toBe(
      true,
    );
  });

  it("calculates catalog availability from selected group learning items", async () => {
    const now = new Date().toISOString();
    const groupedItems: WordSourceLearningItem[] = [
      {
        id: "item-business-1",
        lemma: "invoice",
        vocab: "invoice",
        targetMeaning: "fatura",
        lastMeaning: "fatura",
        definitionL2: "A document requesting payment.",
        lastSeenMode: "basic",
        createdAt: now,
      },
      {
        id: "item-business-2",
        lemma: "deadline",
        vocab: "deadline",
        targetMeaning: "son tarih",
        lastMeaning: "son tarih",
        definitionL2: "The latest time by which something must be finished.",
        lastSeenMode: "basic",
        createdAt: now,
      },
    ];
    const otherItems: WordSourceLearningItem[] = Array.from({ length: 5 }).map((_, index) => ({
      id: `item-other-${index + 1}`,
      lemma: `other-${index + 1}`,
      vocab: `other-${index + 1}`,
      targetMeaning: "diger",
      lastMeaning: "diger",
      definitionL2: "Another word.",
      lastSeenMode: "basic",
      createdAt: now,
    }));
    const wordSource: ExerciseWordSource = {
      async listActiveLearningItems(input) {
        if (input.groupIds?.includes("group-business")) {
          return groupedItems;
        }
        return [...groupedItems, ...otherItems];
      },
      async getLearningItemDetail() {
        return null;
      },
    };
    const exercises = createExercisesPublicContract({
      repo: createMemoryRepo(),
      wordSource,
      languagePreferences: createLanguagePreferences("tr"),
      defaults: {
        totalQuestions: 10,
        maxTotalQuestions: 30,
        todayMinimum: 0,
        maxTodayMinimum: 20,
        maxLearningItemsScan: 100,
      },
    });

    const catalog = await exercises.getCatalog({
      userId: "user-1",
      mode: "basic",
      groupIds: ["group-business"],
    });

    expect(catalog.activeItemCount).toBe(2);
    expect(
      catalog.items
        .filter((item) => item.type !== "match_synonym")
        .every((item) => item.availableItemCount === 2),
    ).toBe(true);
  });

  it("keeps weekly weak items limited to active learning items", async () => {
    const now = new Date().toISOString();
    const repo: ExerciseRepo = {
      ...createMemoryRepo(),
      async getWeeklyAnalyticsData() {
        return {
          sessions: [
            {
              id: "session-1",
              mode: "basic",
              status: "completed",
              createdAt: now,
              completedAt: now,
            },
          ],
          answers: [
            {
              sessionId: "session-1",
              questionId: "question-active",
              mode: "basic",
              questionType: "meaning_match",
              itemId: "item-active",
              itemStatus: "active",
              prompt: "active word",
              isCorrect: false,
              answeredAt: now,
            },
            {
              sessionId: "session-1",
              questionId: "question-learned",
              mode: "basic",
              questionType: "meaning_match",
              itemId: "item-learned",
              itemStatus: "learned",
              prompt: "learned word",
              isCorrect: false,
              answeredAt: now,
            },
            {
              sessionId: "session-1",
              questionId: "question-deleted",
              mode: "basic",
              questionType: "meaning_match",
              itemId: "item-deleted",
              itemStatus: "deleted",
              prompt: "deleted word",
              isCorrect: false,
              answeredAt: now,
            },
          ],
        };
      },
    };

    const analytics = await getExerciseWeeklyAnalytics(repo, {
      userId: "user-1",
      timezoneOffsetMinutes: 0,
    });

    expect(analytics.summary.answeredQuestions).toBe(3);
    expect(analytics.weakItems.map((item) => item.itemId)).toEqual(["item-active"]);
  });
});
