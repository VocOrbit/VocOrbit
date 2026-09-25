import { describe, expect, it } from "bun:test";
import { NotFoundError, ValidationError } from "../../../packages/core/src/errors";
import type { WordInsightUsageRepo } from "../src/ports/usage-repo";
import { getLearningItemDetail } from "../src/use-cases/get-learning-item-detail";
import {
  addLearningItemToGroup,
  addLearningItemsToGroup,
  createLearningItemGroup,
  deleteLearningItemGroup,
  listLearningItemGroups,
  listLearningItemsByGroup,
  removeLearningItemFromGroup,
  updateLearningItemGroup,
} from "../src/use-cases/learning-item-groups";
import { listLearningItems } from "../src/use-cases/list-learning-items";
import { markLearningItemFavorite } from "../src/use-cases/mark-learning-item-favorite";
import { markLearningItemLearned } from "../src/use-cases/mark-learning-item-learned";
import { reopenLearningItem } from "../src/use-cases/reopen-learning-item";
import { reportLearningItemIssue } from "../src/use-cases/report-learning-item-issue";
import { softDeleteLearningItem } from "../src/use-cases/soft-delete-learning-item";
import { unmarkLearningItemFavorite } from "../src/use-cases/unmark-learning-item-favorite";

function createUsageRepo(): WordInsightUsageRepo {
  return {
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
    async listLearningItems(input) {
      return [
        {
          id: "item-1",
          userId: input.userId,
          lemma: "bank",
          vocab: "bank",
          sourceLang: "en",
          targetLang: "tr",
          status: input.status === "all" ? "active" : input.status,
          encounterCount: 1,
          lastSeenMode: "basic",
          lastMeaning: "banka",
          targetMeaning: "banka",
          phonetic: "/bæŋk/",
          definitionL2: "A financial institution where money is kept and managed.",
          isFavorite: false,
          latestLookupId: "lookup-1",
          lastLookupAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    },
    async getLearningItemMasterySummary(input) {
      return {
        activeItemCount: 1,
        learnedItemCount: 0,
        totalItemCount: 1,
        weeklyStudiedItemCount: 1,
        weeklyLearnedItemCount: 0,
        topGroups: [
          {
            id: "group-1",
            name: "Is Ingilizcesi",
            itemCount: 1,
            activeItemCount: 1,
            learnedItemCount: 0,
          },
        ].slice(0, input.topGroupLimit),
      };
    },
    async getLearningItemDetail() {
      return {
        item: {
          id: "item-1",
          userId: "u1",
          lemma: "bank",
          vocab: "bank",
          sourceLang: "en",
          targetLang: "tr",
          status: "active",
          encounterCount: 2,
          lastSeenMode: "basic",
          lastMeaning: "banka",
          targetMeaning: "banka",
          phonetic: "/bæŋk/",
          definitionL2: "A financial institution where money is kept and managed.",
          isFavorite: false,
          latestLookupId: "lookup-1",
          lastLookupAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        latestLookup: {
          id: "lookup-1",
          requestId: "req-1",
          mode: "basic",
          vocab: "bank",
          sentence: "I went to the bank yesterday.",
          sourceLang: "en",
          targetLang: "tr",
          aiProvider: "openai",
          aiModel: "gpt-4o-mini",
          responsePayload: {
            schemaVersion: "word-insight.v1",
            insight: { meaning: "banka" },
          },
          createdAt: new Date().toISOString(),
        },
      };
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
    async listLearningItemGroups(input) {
      return [
        {
          id: "group-1",
          userId: input.userId,
          name: "Is Ingilizcesi",
          itemCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    },
    async listLearningItemGroupsForItem(input) {
      return [
        {
          id: "group-1",
          userId: input.userId,
          name: "Is Ingilizcesi",
          itemCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    },
    async updateLearningItemGroup(input) {
      return {
        id: input.groupId,
        userId: input.userId,
        name: input.name,
        itemCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async deleteLearningItemGroup() {
      return true;
    },
    async addLearningItemToGroup(input) {
      return {
        id: input.groupId,
        userId: input.userId,
        name: "Is Ingilizcesi",
        itemCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async addLearningItemsToGroup(input) {
      return {
        id: input.groupId,
        userId: input.userId,
        name: "Is Ingilizcesi",
        itemCount: new Set(input.itemIds).size,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async removeLearningItemFromGroup(input) {
      return {
        id: input.groupId,
        userId: input.userId,
        name: "Is Ingilizcesi",
        itemCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async listLearningItemsByGroup(input) {
      return [
        {
          id: "item-1",
          userId: input.userId,
          lemma: "bank",
          vocab: "bank",
          sourceLang: "en",
          targetLang: "tr",
          status: "active",
          encounterCount: 1,
          lastSeenMode: "basic",
          lastMeaning: "banka",
          targetMeaning: "banka",
          phonetic: "/bæŋk/",
          definitionL2: "A financial institution where money is kept and managed.",
          isFavorite: false,
          latestLookupId: "lookup-1",
          lastLookupAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    },
    async markLearningItemLearned() {
      return {
        id: "item-1",
        userId: "u1",
        lemma: "bank",
        vocab: "bank",
        sourceLang: "en",
        targetLang: "tr",
        status: "learned",
        encounterCount: 2,
        lastSeenMode: "basic",
        lastMeaning: "banka",
        targetMeaning: "banka",
        phonetic: "/bæŋk/",
        definitionL2: "A financial institution where money is kept and managed.",
        isFavorite: false,
        latestLookupId: "lookup-1",
        lastLookupAt: new Date().toISOString(),
        learnedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async reopenLearningItem() {
      return {
        id: "item-1",
        userId: "u1",
        lemma: "bank",
        vocab: "bank",
        sourceLang: "en",
        targetLang: "tr",
        status: "active",
        encounterCount: 2,
        lastSeenMode: "basic",
        lastMeaning: "banka",
        targetMeaning: "banka",
        phonetic: "/bæŋk/",
        definitionL2: "A financial institution where money is kept and managed.",
        isFavorite: false,
        latestLookupId: "lookup-1",
        lastLookupAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async softDeleteLearningItem() {
      return {
        id: "item-1",
        userId: "u1",
        lemma: "bank",
        vocab: "bank",
        sourceLang: "en",
        targetLang: "tr",
        status: "deleted",
        encounterCount: 2,
        lastSeenMode: "basic",
        lastMeaning: "banka",
        targetMeaning: "banka",
        phonetic: "/bæŋk/",
        definitionL2: "A financial institution where money is kept and managed.",
        isFavorite: false,
        latestLookupId: "lookup-1",
        lastLookupAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async markLearningItemFavorite() {
      return {
        id: "item-1",
        userId: "u1",
        lemma: "bank",
        vocab: "bank",
        sourceLang: "en",
        targetLang: "tr",
        status: "active",
        encounterCount: 2,
        lastSeenMode: "basic",
        lastMeaning: "banka",
        targetMeaning: "banka",
        phonetic: "/bæŋk/",
        definitionL2: "A financial institution where money is kept and managed.",
        isFavorite: true,
        favoritedAt: new Date().toISOString(),
        latestLookupId: "lookup-1",
        lastLookupAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async unmarkLearningItemFavorite() {
      return {
        id: "item-1",
        userId: "u1",
        lemma: "bank",
        vocab: "bank",
        sourceLang: "en",
        targetLang: "tr",
        status: "active",
        encounterCount: 2,
        lastSeenMode: "basic",
        lastMeaning: "banka",
        targetMeaning: "banka",
        phonetic: "/bæŋk/",
        definitionL2: "A financial institution where money is kept and managed.",
        isFavorite: false,
        latestLookupId: "lookup-1",
        lastLookupAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async reportLearningItemIssue(input) {
      return {
        id: "report-1",
        userId: input.userId,
        itemId: input.itemId,
        lookupId: "lookup-1",
        message: input.message,
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
  };
}

describe("word insight learning use-cases", () => {
  it("lists active learning items by default", async () => {
    const items = await listLearningItems(createUsageRepo(), { userId: "u1" });
    expect(items.length).toBe(1);
    expect(items[0]?.status).toBe("active");
  });

  it("rejects invalid status value", async () => {
    await expect(
      listLearningItems(createUsageRepo(), {
        userId: "u1",
        status: "invalid",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects invalid favorite value", async () => {
    await expect(
      listLearningItems(createUsageRepo(), {
        userId: "u1",
        favorite: "yes",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects too long search query", async () => {
    await expect(
      listLearningItems(createUsageRepo(), {
        userId: "u1",
        q: "x".repeat(121),
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("marks an item as learned", async () => {
    const item = await markLearningItemLearned(createUsageRepo(), {
      userId: "u1",
      itemId: "item-1",
    });
    expect(item.status).toBe("learned");
  });

  it("marks item as favorite", async () => {
    const item = await markLearningItemFavorite(createUsageRepo(), {
      userId: "u1",
      itemId: "item-1",
    });
    expect(item.isFavorite).toBe(true);
    expect(typeof item.favoritedAt).toBe("string");
  });

  it("gets learning item detail", async () => {
    const detail = await getLearningItemDetail(createUsageRepo(), {
      userId: "u1",
      itemId: "item-1",
    });
    expect(detail.item.id).toBe("item-1");
    expect(detail.item.targetMeaning).toBe("banka");
    expect(detail.item.phonetic).toBe("/bæŋk/");
    expect(detail.latestLookup?.id).toBe("lookup-1");
  });

  it("creates and lists learning item groups with item counts", async () => {
    const group = await createLearningItemGroup(createUsageRepo(), {
      userId: "u1",
      name: "  Is   Ingilizcesi  ",
    });
    expect(group.name).toBe("Is Ingilizcesi");
    expect(group.itemCount).toBe(0);

    const groups = await listLearningItemGroups(createUsageRepo(), { userId: "u1" });
    expect(groups[0]?.id).toBe("group-1");
    expect(groups[0]?.itemCount).toBe(1);
  });

  it("updates and deletes learning item groups", async () => {
    const group = await updateLearningItemGroup(createUsageRepo(), {
      userId: "u1",
      groupId: "group-1",
      name: "Seyahat",
    });
    expect(group.name).toBe("Seyahat");

    const result = await deleteLearningItemGroup(createUsageRepo(), {
      userId: "u1",
      groupId: "group-1",
    });
    expect(result.deleted).toBe(true);
  });

  it("adds and removes learning items from groups", async () => {
    const single = await addLearningItemToGroup(createUsageRepo(), {
      userId: "u1",
      groupId: "group-1",
      itemId: "item-1",
    });
    expect(single.itemCount).toBe(1);

    const bulk = await addLearningItemsToGroup(createUsageRepo(), {
      userId: "u1",
      groupId: "group-1",
      itemIds: ["item-1", "item-1", "item-2"],
    });
    expect(bulk.itemCount).toBe(2);

    const removed = await removeLearningItemFromGroup(createUsageRepo(), {
      userId: "u1",
      groupId: "group-1",
      itemId: "item-1",
    });
    expect(removed.itemCount).toBe(0);
  });

  it("lists learning items in a group", async () => {
    const items = await listLearningItemsByGroup(createUsageRepo(), {
      userId: "u1",
      groupId: "group-1",
    });
    expect(items[0]?.id).toBe("item-1");
  });

  it("throws not found when group mutation returns null", async () => {
    const repo = {
      ...createUsageRepo(),
      async addLearningItemToGroup() {
        return null;
      },
    } satisfies WordInsightUsageRepo;

    await expect(
      addLearningItemToGroup(repo, {
        userId: "u1",
        groupId: "missing",
        itemId: "item-1",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("reopens learned item", async () => {
    const item = await reopenLearningItem(createUsageRepo(), {
      userId: "u1",
      itemId: "item-1",
    });
    expect(item.status).toBe("active");
  });

  it("unmarks item as favorite", async () => {
    const item = await unmarkLearningItemFavorite(createUsageRepo(), {
      userId: "u1",
      itemId: "item-1",
    });
    expect(item.isFavorite).toBe(false);
  });

  it("soft deletes item", async () => {
    const item = await softDeleteLearningItem(createUsageRepo(), {
      userId: "u1",
      itemId: "item-1",
    });
    expect(item.status).toBe("deleted");
    expect(typeof item.deletedAt).toBe("string");
  });

  it("throws not found when mark learned returns null", async () => {
    const repo = {
      ...createUsageRepo(),
      async markLearningItemLearned() {
        return null;
      },
    } satisfies WordInsightUsageRepo;

    await expect(
      markLearningItemLearned(repo, {
        userId: "u1",
        itemId: "missing",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws not found when detail item is missing", async () => {
    const repo = {
      ...createUsageRepo(),
      async getLearningItemDetail() {
        return null;
      },
    } satisfies WordInsightUsageRepo;

    await expect(
      getLearningItemDetail(repo, {
        userId: "u1",
        itemId: "missing",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws not found when mark favorite returns null", async () => {
    const repo = {
      ...createUsageRepo(),
      async markLearningItemFavorite() {
        return null;
      },
    } satisfies WordInsightUsageRepo;

    await expect(
      markLearningItemFavorite(repo, {
        userId: "u1",
        itemId: "missing",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("creates issue report for learning item", async () => {
    const report = await reportLearningItemIssue(createUsageRepo(), {
      userId: "u1",
      itemId: "item-1",
      message: "Bu ceviri bu baglamda yanlis gorunuyor.",
    });
    expect(report.status).toBe("open");
    expect(report.itemId).toBe("item-1");
  });
});
