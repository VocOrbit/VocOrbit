import type {
  ExplainJobClaimFilter,
  ExplainJobRecord,
  WordInsightExplainJobRepo,
} from "./ports/explain-job-repo";
import type {
  CreditBalances,
  LearningItem,
  LearningItemDetail,
  LearningItemGroup,
  LearningItemMasterySummary,
  LearningItemIssueReport,
} from "./ports/usage-repo";
import { enqueueExplainJob } from "./use-cases/enqueue-explain-job";
import {
  type ExplainWordDeps,
  type ExplainWordInput,
  type ExplainWordResult,
  explainWord,
} from "./use-cases/explain-word";
import { getExplainJob } from "./use-cases/get-explain-job";
import { getLearningItemDetail } from "./use-cases/get-learning-item-detail";
import { getLearningItemMasterySummary } from "./use-cases/get-learning-item-mastery-summary";
import {
  addLearningItemToGroup,
  addLearningItemsToGroup,
  createLearningItemGroup,
  deleteLearningItemGroup,
  listLearningItemGroups,
  listLearningItemGroupsForItem,
  listLearningItemsByGroup,
  removeLearningItemFromGroup,
  updateLearningItemGroup,
} from "./use-cases/learning-item-groups";
import { listLearningItems } from "./use-cases/list-learning-items";
import { markLearningItemFavorite } from "./use-cases/mark-learning-item-favorite";
import { markLearningItemLearned } from "./use-cases/mark-learning-item-learned";
import { processNextExplainJob } from "./use-cases/process-next-explain-job";
import { reopenLearningItem } from "./use-cases/reopen-learning-item";
import { reportLearningItemIssue } from "./use-cases/report-learning-item-issue";
import { softDeleteLearningItem } from "./use-cases/soft-delete-learning-item";
import { unmarkLearningItemFavorite } from "./use-cases/unmark-learning-item-favorite";

export type ExplainWordPublicInput = ExplainWordInput;

export type ExplainWordPublicContext = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
  requestId?: string;
  preferredTargetLang?: string;
};

export type WordInsightDeps = ExplainWordDeps & {
  jobs: WordInsightExplainJobRepo;
};

export interface WordInsightPublicContract {
  enqueueExplainJob(
    input: ExplainWordPublicInput,
    context: ExplainWordPublicContext,
  ): Promise<ExplainJobRecord>;
  getExplainJob(input: { userId: string; jobId: string }): Promise<ExplainJobRecord>;
  processNextExplainJob(options?: {
    onStatus?: (job: ExplainJobRecord) => Promise<void> | void;
    claimFilter?: ExplainJobClaimFilter;
  }): Promise<ExplainJobRecord | null>;
  getCreditBalances(input: { userId: string }): Promise<CreditBalances>;
  explainWord(
    input: ExplainWordPublicInput,
    context: ExplainWordPublicContext,
  ): Promise<ExplainWordResult>;
  listLearningItems(input: {
    userId: string;
    status?: string;
    limit?: number;
    offset?: number;
    favorite?: string;
    q?: string;
    groupIds?: string[];
  }): Promise<LearningItem[]>;
  getLearningItemMasterySummary(input: {
    userId: string;
    topGroupLimit?: number;
  }): Promise<LearningItemMasterySummary>;
  getLearningItemDetail(input: { userId: string; itemId: string }): Promise<LearningItemDetail>;
  createLearningItemGroup(input: { userId: string; name: string }): Promise<LearningItemGroup>;
  listLearningItemGroups(input: { userId: string }): Promise<LearningItemGroup[]>;
  listLearningItemGroupsForItem(input: {
    userId: string;
    itemId: string;
  }): Promise<LearningItemGroup[]>;
  updateLearningItemGroup(input: {
    userId: string;
    groupId: string;
    name: string;
  }): Promise<LearningItemGroup>;
  deleteLearningItemGroup(input: { userId: string; groupId: string }): Promise<{ deleted: true }>;
  addLearningItemToGroup(input: {
    userId: string;
    groupId: string;
    itemId: string;
  }): Promise<LearningItemGroup>;
  addLearningItemsToGroup(input: {
    userId: string;
    groupId: string;
    itemIds: string[];
  }): Promise<LearningItemGroup>;
  removeLearningItemFromGroup(input: {
    userId: string;
    groupId: string;
    itemId: string;
  }): Promise<LearningItemGroup>;
  listLearningItemsByGroup(input: {
    userId: string;
    groupId: string;
    limit?: number;
    offset?: number;
  }): Promise<LearningItem[]>;
  markLearningItemLearned(input: { userId: string; itemId: string }): Promise<LearningItem>;
  reopenLearningItem(input: { userId: string; itemId: string }): Promise<LearningItem>;
  softDeleteLearningItem(input: { userId: string; itemId: string }): Promise<LearningItem>;
  markLearningItemFavorite(input: { userId: string; itemId: string }): Promise<LearningItem>;
  unmarkLearningItemFavorite(input: { userId: string; itemId: string }): Promise<LearningItem>;
  reportLearningItemIssue(input: {
    userId: string;
    itemId: string;
    message: string;
  }): Promise<LearningItemIssueReport>;
}

export function createWordInsightPublicContract(deps: WordInsightDeps): WordInsightPublicContract {
  return {
    enqueueExplainJob(input, context) {
      return enqueueExplainJob(deps, input, context);
    },
    getExplainJob(input) {
      return getExplainJob(deps.jobs, input);
    },
    processNextExplainJob(options) {
      return processNextExplainJob(deps, options);
    },
    getCreditBalances(input) {
      return deps.usageRepo.getOrCreateBalances(input.userId);
    },
    explainWord(input, context) {
      return explainWord(deps, input, context);
    },
    listLearningItems(input) {
      return listLearningItems(deps.usageRepo, input);
    },
    getLearningItemMasterySummary(input) {
      return getLearningItemMasterySummary(deps.usageRepo, input);
    },
    getLearningItemDetail(input) {
      return getLearningItemDetail(deps.usageRepo, input);
    },
    createLearningItemGroup(input) {
      return createLearningItemGroup(deps.usageRepo, input);
    },
    listLearningItemGroups(input) {
      return listLearningItemGroups(deps.usageRepo, input);
    },
    listLearningItemGroupsForItem(input) {
      return listLearningItemGroupsForItem(deps.usageRepo, input);
    },
    updateLearningItemGroup(input) {
      return updateLearningItemGroup(deps.usageRepo, input);
    },
    deleteLearningItemGroup(input) {
      return deleteLearningItemGroup(deps.usageRepo, input);
    },
    addLearningItemToGroup(input) {
      return addLearningItemToGroup(deps.usageRepo, input);
    },
    addLearningItemsToGroup(input) {
      return addLearningItemsToGroup(deps.usageRepo, input);
    },
    removeLearningItemFromGroup(input) {
      return removeLearningItemFromGroup(deps.usageRepo, input);
    },
    listLearningItemsByGroup(input) {
      return listLearningItemsByGroup(deps.usageRepo, input);
    },
    markLearningItemLearned(input) {
      return markLearningItemLearned(deps.usageRepo, input);
    },
    reopenLearningItem(input) {
      return reopenLearningItem(deps.usageRepo, input);
    },
    softDeleteLearningItem(input) {
      return softDeleteLearningItem(deps.usageRepo, input);
    },
    markLearningItemFavorite(input) {
      return markLearningItemFavorite(deps.usageRepo, input);
    },
    unmarkLearningItemFavorite(input) {
      return unmarkLearningItemFavorite(deps.usageRepo, input);
    },
    reportLearningItemIssue(input) {
      return reportLearningItemIssue(deps.usageRepo, input);
    },
  };
}
