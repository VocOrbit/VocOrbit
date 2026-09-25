import { describe, expect, it } from "bun:test";
import { ForbiddenError, ValidationError } from "../../../packages/core/src/errors";
import type { WordInsight } from "../src/domain/word-insight";
import type { WordInsightLanguagePreferencesReader } from "../src/ports/language-preferences";
import type { WordInsightUsageRepo } from "../src/ports/usage-repo";
import { explainWord } from "../src/use-cases/explain-word";

function createFakeInsight(overrides?: Partial<WordInsight>): WordInsight {
  return {
    word: "bank",
    lemma: "bank",
    sourceLang: "en",
    targetLang: "tr",
    partOfSpeech: "noun",
    meaning: "banka",
    shortExplanation: "Cümlede finans kurumu anlamında kullanılmış.",
    exampleSentence: "I went to the bank yesterday.",
    translatedExample: "Dün bankaya gittim.",
    synonyms: ["financial institution"],
    confidence: 0.91,
    provider: "fake",
    model: "fake-model",
    ...overrides,
  };
}

function createUsageRepo(): WordInsightUsageRepo {
  return {
    async getOrCreateBalances() {
      return {
        freeBasic: 2,
        freeAdvanced: 1,
        paidBasic: 0,
        paidAdvanced: 0,
      };
    },
    async recordSuccessfulLookup(input) {
      return {
        lookupId: "lookup-1",
        credits: {
          freeBasic: input.mode === "basic" ? 1 : 2,
          freeAdvanced: input.mode === "advanced" ? 0 : 1,
          paidBasic: 0,
          paidAdvanced: 0,
        },
        spend: {
          mode: input.mode,
          source: "free",
          amount: 1,
        },
      };
    },
    async listLearningItems() {
      return [];
    },
    async getLearningItemMasterySummary() {
      return {
        activeItemCount: 0,
        learnedItemCount: 0,
        totalItemCount: 0,
        weeklyStudiedItemCount: 0,
        weeklyLearnedItemCount: 0,
        topGroups: [],
      };
    },
    async getLearningItemDetail() {
      return null;
    },
    async createLearningItemGroup(input) {
      return {
        id: "group-1",
        userId: input.userId,
        name: input.name,
        itemCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async listLearningItemGroups() {
      return [];
    },
    async listLearningItemGroupsForItem() {
      return [];
    },
    async updateLearningItemGroup() {
      return null;
    },
    async deleteLearningItemGroup() {
      return false;
    },
    async addLearningItemToGroup() {
      return null;
    },
    async addLearningItemsToGroup() {
      return null;
    },
    async removeLearningItemFromGroup() {
      return null;
    },
    async listLearningItemsByGroup() {
      return null;
    },
    async markLearningItemLearned() {
      return null;
    },
    async reopenLearningItem() {
      return null;
    },
    async softDeleteLearningItem() {
      return null;
    },
    async markLearningItemFavorite() {
      return null;
    },
    async unmarkLearningItemFavorite() {
      return null;
    },
    async reportLearningItemIssue() {
      return null;
    },
  };
}

function createLanguagePreferencesReader(
  l1Language?: string,
  l2Language?: string,
): WordInsightLanguagePreferencesReader {
  return {
    async getByUserId() {
      if (!l1Language || !l2Language) return null;
      return {
        l1Language,
        l2Language,
      };
    },
  };
}

describe("word insight use-case", () => {
  it("rejects when no credits are available", async () => {
    await expect(
      explainWord(
        {
          provider: {
            async explainWord() {
              return createFakeInsight();
            },
          },
          languagePreferences: createLanguagePreferencesReader(),
          usageRepo: {
            async getOrCreateBalances() {
              return {
                freeBasic: 0,
                freeAdvanced: 0,
                paidBasic: 0,
                paidAdvanced: 0,
              };
            },
            async recordSuccessfulLookup() {
              return null;
            },
            async listLearningItems() {
              return [];
            },
            async getLearningItemMasterySummary() {
              return {
                activeItemCount: 0,
                learnedItemCount: 0,
                totalItemCount: 0,
                weeklyStudiedItemCount: 0,
                weeklyLearnedItemCount: 0,
                topGroups: [],
              };
            },
            async getLearningItemDetail() {
              return null;
            },
            async createLearningItemGroup(input) {
              return {
                id: "group-1",
                userId: input.userId,
                name: input.name,
                itemCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
            },
            async listLearningItemGroups() {
              return [];
            },
            async listLearningItemGroupsForItem() {
              return [];
            },
            async updateLearningItemGroup() {
              return null;
            },
            async deleteLearningItemGroup() {
              return false;
            },
            async addLearningItemToGroup() {
              return null;
            },
            async addLearningItemsToGroup() {
              return null;
            },
            async removeLearningItemFromGroup() {
              return null;
            },
            async listLearningItemsByGroup() {
              return null;
            },
            async markLearningItemLearned() {
              return null;
            },
            async reopenLearningItem() {
              return null;
            },
            async softDeleteLearningItem() {
              return null;
            },
            async markLearningItemFavorite() {
              return null;
            },
            async unmarkLearningItemFavorite() {
              return null;
            },
            async reportLearningItemIssue() {
              return null;
            },
          },
          defaults: {
            sourceLang: "en",
            targetLang: "tr",
            maxSentenceChars: 2000,
            maxSelectedWordChars: 80,
          },
        },
        {
          sentence: "I went to the bank yesterday.",
          selectedWord: "bank",
        },
        {
          user: {
            id: "u1",
            name: "Test User",
            email: "test@example.com",
            role: "user",
          },
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("uses preferred target language when request does not include targetLang", async () => {
    let capturedTargetLang = "";

    const insight = await explainWord(
      {
        provider: {
          async explainWord(input) {
            capturedTargetLang = input.targetLang;
            return createFakeInsight({ targetLang: input.targetLang });
          },
        },
        languagePreferences: createLanguagePreferencesReader(),
        usageRepo: createUsageRepo(),
        defaults: {
          sourceLang: "en",
          targetLang: "tr",
          maxSentenceChars: 2000,
          maxSelectedWordChars: 80,
        },
      },
      {
        sentence: "I went to the bank yesterday.",
        selectedWord: "bank",
      },
      {
        user: {
          id: "u1",
          name: "Test User",
          email: "test@example.com",
          role: "user",
        },
        preferredTargetLang: "de",
      },
    );

    expect(capturedTargetLang).toBe("de");
    expect(insight.mode).toBe("basic");
    expect(insight.insight.targetLang).toBe("de");
  });

  it("rejects when selectedWord is not in sentence", async () => {
    await expect(
      explainWord(
        {
          provider: {
            async explainWord() {
              return createFakeInsight();
            },
          },
          languagePreferences: createLanguagePreferencesReader(),
          usageRepo: createUsageRepo(),
          defaults: {
            sourceLang: "en",
            targetLang: "tr",
            maxSentenceChars: 2000,
            maxSelectedWordChars: 80,
          },
        },
        {
          sentence: "I went to the river yesterday.",
          selectedWord: "bank",
        },
        {
          user: {
            id: "u1",
            name: "Test User",
            email: "test@example.com",
            role: "user",
          },
        },
      ),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("normalizes confidence and synonyms from provider output", async () => {
    const insight = await explainWord(
      {
        provider: {
          async explainWord() {
            return createFakeInsight({
              confidence: 9,
              synonyms: ["bank", "bank", "  "],
            });
          },
        },
        languagePreferences: createLanguagePreferencesReader(),
        usageRepo: createUsageRepo(),
        defaults: {
          sourceLang: "en",
          targetLang: "tr",
          maxSentenceChars: 2000,
          maxSelectedWordChars: 80,
        },
      },
      {
        sentence: "I went to the bank yesterday.",
        selectedWord: "bank",
      },
      {
        user: {
          id: "u1",
          name: "Test User",
          email: "test@example.com",
          role: "user",
        },
      },
    );

    expect(insight.insight.confidence).toBe(1);
    expect(insight.insight.synonyms).toEqual(["bank"]);
    expect(insight.spend.source).toBe("free");
  });

  it("uses persisted language preferences as fallback", async () => {
    let capturedSourceLang = "";
    let capturedTargetLang = "";

    const insight = await explainWord(
      {
        provider: {
          async explainWord(input) {
            capturedSourceLang = input.sourceLang;
            capturedTargetLang = input.targetLang;
            return createFakeInsight({
              sourceLang: input.sourceLang,
              targetLang: input.targetLang,
            });
          },
        },
        languagePreferences: createLanguagePreferencesReader("es-es", "de-de"),
        usageRepo: createUsageRepo(),
        defaults: {
          sourceLang: "en",
          targetLang: "tr",
          maxSentenceChars: 2000,
          maxSelectedWordChars: 80,
        },
      },
      {
        sentence: "I went to the bank yesterday.",
        selectedWord: "bank",
      },
      {
        user: {
          id: "u1",
          name: "Test User",
          email: "test@example.com",
          role: "user",
        },
      },
    );

    expect(capturedSourceLang).toBe("de");
    expect(capturedTargetLang).toBe("es");
    expect(insight.insight.sourceLang).toBe("de");
    expect(insight.insight.targetLang).toBe("es");
  });

  it("keeps supported english variants in resolved languages", async () => {
    let capturedSourceLang = "";
    let capturedTargetLang = "";

    await explainWord(
      {
        provider: {
          async explainWord(input) {
            capturedSourceLang = input.sourceLang;
            capturedTargetLang = input.targetLang;
            return createFakeInsight({
              sourceLang: input.sourceLang,
              targetLang: input.targetLang,
            });
          },
        },
        languagePreferences: createLanguagePreferencesReader("tr", "en-gb"),
        usageRepo: createUsageRepo(),
        defaults: {
          sourceLang: "en",
          targetLang: "tr",
          maxSentenceChars: 2000,
          maxSelectedWordChars: 80,
        },
      },
      {
        sentence: "I went to the bank yesterday.",
        selectedWord: "bank",
      },
      {
        user: {
          id: "u1",
          name: "Test User",
          email: "test@example.com",
          role: "user",
        },
      },
    );

    expect(capturedSourceLang).toBe("en-gb");
    expect(capturedTargetLang).toBe("tr");
  });
});
