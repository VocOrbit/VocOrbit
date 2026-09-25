export type LookupMode = "basic" | "advanced";

export type LearningItemStatus = "active" | "learned" | "deleted";
export type LearningItemListStatus = LearningItemStatus | "all";

export type CreditBalances = {
  freeBasic: number;
  freeAdvanced: number;
  paidBasic: number;
  paidAdvanced: number;
};

export type CreditSpend = {
  mode: LookupMode;
  source: "free" | "paid";
  amount: number;
};

export type RecordLookupInput = {
  requestId: string;
  userId: string;
  mode: LookupMode;
  sentence: string;
  selectedWord: string;
  lemma: string;
  sourceLang: string;
  targetLang: string;
  aiProvider: string;
  aiModel: string;
  responseSummary: {
    meaning: string;
    shortExplanation: string;
    confidence: number;
  };
  responsePayload: Record<string, unknown>;
  latencyMs: number;
};

export type RecordLookupResult = {
  lookupId: string;
  credits: CreditBalances;
  spend: CreditSpend;
};

export type LearningItem = {
  id: string;
  userId: string;
  lemma: string;
  vocab: string;
  sourceLang: string;
  targetLang: string;
  status: LearningItemStatus;
  encounterCount: number;
  lastSeenMode: LookupMode;
  lastMeaning: string;
  targetMeaning: string;
  phonetic?: string;
  definitionL2: string;
  translationL1?: string;
  whyThisSense?: string;
  contextSentence?: string;
  isFavorite: boolean;
  favoritedAt?: string;
  latestLookupId?: string;
  lastLookupAt: string;
  learnedAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type LookupDetail = {
  id: string;
  requestId: string;
  mode: LookupMode;
  vocab: string;
  sentence: string;
  sourceLang: string;
  targetLang: string;
  responseSummary?: {
    meaning: string;
    shortExplanation: string;
    confidence: number;
  };
  responsePayload?: Record<string, unknown>;
  createdAt: string;
};

export type LearningItemDetail = {
  item: LearningItem;
  latestLookup?: LookupDetail;
};

export type LearningItemGroup = {
  id: string;
  userId: string;
  name: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type LearningItemMasteryGroup = {
  id: string;
  name: string;
  itemCount: number;
  activeItemCount: number;
  learnedItemCount: number;
};

export type LearningItemMasterySummary = {
  activeItemCount: number;
  learnedItemCount: number;
  totalItemCount: number;
  weeklyStudiedItemCount: number;
  weeklyLearnedItemCount: number;
  topGroups: LearningItemMasteryGroup[];
};

export type LearningItemIssueReportStatus = "open" | "resolved" | "dismissed";

export type LearningItemIssueReport = {
  id: string;
  userId: string;
  itemId: string;
  lookupId?: string;
  message: string;
  status: LearningItemIssueReportStatus;
  createdAt: string;
  updatedAt: string;
};

export interface WordInsightUsageRepo {
  getOrCreateBalances(userId: string): Promise<CreditBalances>;
  recordSuccessfulLookup(input: RecordLookupInput): Promise<RecordLookupResult | null>;
  listLearningItems(input: {
    userId: string;
    status: LearningItemListStatus;
    limit: number;
    offset: number;
    isFavorite?: boolean;
    query?: string;
    groupIds?: string[];
  }): Promise<LearningItem[]>;
  getLearningItemMasterySummary(input: {
    userId: string;
    topGroupLimit: number;
  }): Promise<LearningItemMasterySummary>;
  getLearningItemDetail(input: {
    userId: string;
    itemId: string;
  }): Promise<LearningItemDetail | null>;
  createLearningItemGroup(input: { userId: string; name: string }): Promise<LearningItemGroup>;
  listLearningItemGroups(input: { userId: string }): Promise<LearningItemGroup[]>;
  listLearningItemGroupsForItem(input: {
    userId: string;
    itemId: string;
  }): Promise<LearningItemGroup[] | null>;
  updateLearningItemGroup(input: {
    userId: string;
    groupId: string;
    name: string;
  }): Promise<LearningItemGroup | null>;
  deleteLearningItemGroup(input: { userId: string; groupId: string }): Promise<boolean>;
  addLearningItemToGroup(input: {
    userId: string;
    groupId: string;
    itemId: string;
  }): Promise<LearningItemGroup | null>;
  addLearningItemsToGroup(input: {
    userId: string;
    groupId: string;
    itemIds: string[];
  }): Promise<LearningItemGroup | null>;
  removeLearningItemFromGroup(input: {
    userId: string;
    groupId: string;
    itemId: string;
  }): Promise<LearningItemGroup | null>;
  listLearningItemsByGroup(input: {
    userId: string;
    groupId: string;
    limit: number;
    offset: number;
  }): Promise<LearningItem[] | null>;
  markLearningItemLearned(input: { userId: string; itemId: string }): Promise<LearningItem | null>;
  reopenLearningItem(input: { userId: string; itemId: string }): Promise<LearningItem | null>;
  softDeleteLearningItem(input: { userId: string; itemId: string }): Promise<LearningItem | null>;
  markLearningItemFavorite(input: { userId: string; itemId: string }): Promise<LearningItem | null>;
  unmarkLearningItemFavorite(input: {
    userId: string;
    itemId: string;
  }): Promise<LearningItem | null>;
  reportLearningItemIssue(input: {
    userId: string;
    itemId: string;
    message: string;
  }): Promise<LearningItemIssueReport | null>;
}

export function remainingCreditsForMode(balances: CreditBalances, mode: LookupMode): number {
  if (mode === "advanced") {
    return balances.freeAdvanced + balances.paidAdvanced;
  }
  return balances.freeBasic + balances.paidBasic;
}
