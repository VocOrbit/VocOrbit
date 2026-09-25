import type { WordInsight } from "../domain/word-insight";
import type { CreditBalances, CreditSpend, LookupMode } from "./usage-repo";

export type ExplainJobStatus = "queued" | "processing" | "completed" | "failed";

export type ExplainJobInput = {
  mode?: LookupMode;
  sentence: string;
  selectedWord: string;
  sourceLang?: string;
  targetLang?: string;
};

export type ExplainJobContext = {
  requestId: string;
  preferredTargetLang?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    homeRegion?: string;
    shardId?: number;
  };
};

export type ExplainJobResult = {
  mode: LookupMode;
  lookupId: string;
  insight: WordInsight;
  spend: CreditSpend;
  credits: CreditBalances;
};

export type ExplainJobRecord = {
  id: string;
  userId: string;
  requestId: string;
  status: ExplainJobStatus;
  homeRegion?: string;
  shardId?: number;
  claimedByRegion?: string;
  claimedByWorker?: string;
  input: ExplainJobInput;
  context: ExplainJobContext;
  result?: ExplainJobResult;
  errorCode?: string;
  errorMessage?: string;
  attempt: number;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ExplainJobClaimFilter = {
  homeRegion?: string;
  claimedByRegion?: string;
  claimedByWorker?: string;
};

export interface WordInsightExplainJobRepo {
  enqueue(input: { input: ExplainJobInput; context: ExplainJobContext }): Promise<ExplainJobRecord>;
  getByIdForUser(input: { jobId: string; userId: string }): Promise<ExplainJobRecord | null>;
  claimNextQueued(filter?: ExplainJobClaimFilter): Promise<ExplainJobRecord | null>;
  markCompleted(input: {
    jobId: string;
    result: ExplainJobResult;
  }): Promise<ExplainJobRecord | null>;
  markFailed(input: {
    jobId: string;
    errorCode: string;
    errorMessage: string;
  }): Promise<ExplainJobRecord | null>;
}
