import { and, desc, eq, gt, ilike, inArray, lte, ne, or, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  CreditBalances,
  LearningItem,
  LearningItemDetail,
  LearningItemGroup,
  LearningItemIssueReport,
  LearningItemMasteryGroup,
  LearningItemStatus,
  LookupDetail,
  LookupMode,
  RecordLookupInput,
  RecordLookupResult,
  WordInsightUsageRepo,
} from "../../../../../modules/word-insight/src/ports/usage-repo";
import { newId } from "../../../../../packages/core/src/ids";
import { sanitizePlainText } from "../../../../../packages/core/src/security/sanitize";
import {
  creditLedger,
  learningItemGroupMembers,
  learningItemGroups,
  learningItems,
  lookups,
  userCredits,
  wordInsightReports,
} from "../../schema";

type CreditTx = Pick<PostgresJsDatabase, "insert" | "update" | "select">;

export type WordInsightUsageRepoConfig = {
  defaultFreeBasic: number;
  defaultFreeAdvanced: number;
  paidBasicCap: number;
  paidAdvancedCap: number;
  monthlyPaidBasicTopup: number;
  monthlyPaidAdvancedTopup: number;
  monthlyTopupIntervalDays: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1_000;
const PROVIDER_METADATA_PATTERN = /\(provider=[^)]+\)/gi;
const PROVIDER_ASSIGNMENT_PATTERN = /\bprovider=[\w.-]+\b/gi;
const TRANSLATED_NOT_AVAILABLE_PATTERN = /^translated example is not available\.?$/i;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function mapBalances(row: typeof userCredits.$inferSelect): CreditBalances {
  return {
    freeBasic: row.freeBasic,
    freeAdvanced: row.freeAdvanced,
    paidBasic: row.paidBasic,
    paidAdvanced: row.paidAdvanced,
  };
}

function readNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = sanitizePlainText(value)
    .replace(PROVIDER_METADATA_PATTERN, "")
    .replace(PROVIDER_ASSIGNMENT_PATTERN, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!trimmed || TRANSLATED_NOT_AVAILABLE_PATTERN.test(trimmed)) return undefined;
  return trimmed;
}

function sanitizeLookupResponsePayload(payload: unknown): Record<string, unknown> | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const clonedPayload = { ...(payload as Record<string, unknown>) };
  const maybeInsight = clonedPayload.insight;
  if (!maybeInsight || typeof maybeInsight !== "object") return clonedPayload;

  const insight = { ...(maybeInsight as Record<string, unknown>) };
  const translatedExample = readNonEmptyString(insight.translatedExample);
  if (typeof insight.translatedExample === "string") {
    insight.translatedExample = translatedExample ?? "";
  }
  const whyThisSense = readNonEmptyString(insight.whyThisSense);
  if (typeof insight.whyThisSense === "string") {
    insight.whyThisSense = whyThisSense ?? "";
  }
  const shortExplanation = readNonEmptyString(insight.shortExplanation);
  if (typeof insight.shortExplanation === "string") {
    insight.shortExplanation = shortExplanation ?? "";
  }

  clonedPayload.insight = insight;
  return clonedPayload;
}

function sanitizeLookupResponseSummary(summary: unknown): LookupDetail["responseSummary"] {
  if (!summary || typeof summary !== "object") return undefined;
  const value = summary as Record<string, unknown>;
  const meaning = readNonEmptyString(value.meaning);
  const shortExplanation = readNonEmptyString(value.shortExplanation);
  const confidence =
    typeof value.confidence === "number" && Number.isFinite(value.confidence)
      ? value.confidence
      : undefined;
  if (!meaning || !shortExplanation || confidence === undefined) return undefined;
  return {
    meaning,
    shortExplanation,
    confidence,
  };
}

function readInsightPayload(payload: unknown): Record<string, unknown> | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const maybeInsight = (payload as Record<string, unknown>).insight;
  if (!maybeInsight || typeof maybeInsight !== "object") return undefined;
  return maybeInsight as Record<string, unknown>;
}

function resolveDefinitionL2(
  row: typeof learningItems.$inferSelect,
  lookup?: typeof lookups.$inferSelect,
): string {
  const insight = readInsightPayload(lookup?.responsePayload);
  return (
    readNonEmptyString(insight?.definitionL2) ??
    readNonEmptyString(insight?.sourceMeaning) ??
    row.definitionL2
  );
}

function resolveTranslationL1(
  row: typeof learningItems.$inferSelect,
  lookup?: typeof lookups.$inferSelect,
): string {
  const insight = readInsightPayload(lookup?.responsePayload);
  return readNonEmptyString(insight?.translationL1) ?? row.targetMeaning;
}

function resolveWhyThisSense(lookup?: typeof lookups.$inferSelect): string | undefined {
  const insight = readInsightPayload(lookup?.responsePayload);
  return (
    readNonEmptyString(insight?.whyThisSense) ??
    readNonEmptyString(lookup?.responseSummary?.shortExplanation) ??
    readNonEmptyString(insight?.shortExplanation)
  );
}

function mapLearningItem(
  row: typeof learningItems.$inferSelect,
  lookup?: typeof lookups.$inferSelect,
): LearningItem {
  const translationL1 = resolveTranslationL1(row, lookup);
  const whyThisSense = resolveWhyThisSense(lookup);
  const definitionL2 = resolveDefinitionL2(row, lookup);
  const contextSentence = readNonEmptyString(lookup?.sentence);

  return {
    id: row.id,
    userId: row.userId,
    lemma: row.lemma,
    vocab: row.vocab,
    sourceLang: row.sourceLang,
    targetLang: row.targetLang,
    status: row.status as LearningItemStatus,
    encounterCount: row.encounterCount,
    lastSeenMode: row.lastSeenMode as LookupMode,
    lastMeaning: translationL1,
    targetMeaning: translationL1,
    phonetic: row.phonetic ?? undefined,
    definitionL2,
    translationL1,
    whyThisSense,
    contextSentence,
    isFavorite: row.isFavorite,
    favoritedAt: row.favoritedAt ? row.favoritedAt.toISOString() : undefined,
    latestLookupId: row.latestLookupId ?? undefined,
    lastLookupAt: row.lastLookupAt.toISOString(),
    learnedAt: row.learnedAt ? row.learnedAt.toISOString() : undefined,
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapLearningItemGroup(row: {
  id: string;
  userId: string;
  name: string;
  itemCount: number | string | null;
  createdAt: Date;
  updatedAt: Date;
}): LearningItemGroup {
  const rawCount = Number(row.itemCount ?? 0);
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    itemCount: Number.isFinite(rawCount) ? rawCount : 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapLearningItemMasteryGroup(row: {
  id: string;
  name: string;
  itemCount: number | string | null;
  activeItemCount: number | string | null;
  learnedItemCount: number | string | null;
}): LearningItemMasteryGroup {
  const itemCount = Number(row.itemCount ?? 0);
  const activeItemCount = Number(row.activeItemCount ?? 0);
  const learnedItemCount = Number(row.learnedItemCount ?? 0);
  return {
    id: row.id,
    name: row.name,
    itemCount: Number.isFinite(itemCount) ? itemCount : 0,
    activeItemCount: Number.isFinite(activeItemCount) ? activeItemCount : 0,
    learnedItemCount: Number.isFinite(learnedItemCount) ? learnedItemCount : 0,
  };
}

async function loadLearningItemGroup(
  db: Pick<PostgresJsDatabase, "select">,
  input: { userId: string; groupId: string },
): Promise<LearningItemGroup | null> {
  const rows = await db
    .select({
      id: learningItemGroups.id,
      userId: learningItemGroups.userId,
      name: learningItemGroups.name,
      createdAt: learningItemGroups.createdAt,
      updatedAt: learningItemGroups.updatedAt,
      itemCount: sql<number>`count(distinct ${learningItems.id})::int`,
    })
    .from(learningItemGroups)
    .leftJoin(
      learningItemGroupMembers,
      and(
        eq(learningItemGroupMembers.groupId, learningItemGroups.id),
        eq(learningItemGroupMembers.userId, input.userId),
      ),
    )
    .leftJoin(
      learningItems,
      and(
        eq(learningItems.id, learningItemGroupMembers.itemId),
        eq(learningItems.userId, input.userId),
        ne(learningItems.status, "deleted"),
      ),
    )
    .where(
      and(eq(learningItemGroups.id, input.groupId), eq(learningItemGroups.userId, input.userId)),
    )
    .groupBy(
      learningItemGroups.id,
      learningItemGroups.userId,
      learningItemGroups.name,
      learningItemGroups.createdAt,
      learningItemGroups.updatedAt,
    )
    .limit(1);

  const row = rows[0];
  return row ? mapLearningItemGroup(row) : null;
}

async function listValidLearningItemIds(
  db: Pick<PostgresJsDatabase, "select">,
  input: { userId: string; itemIds: string[] },
): Promise<string[]> {
  if (input.itemIds.length === 0) return [];

  const rows = await db
    .select({ id: learningItems.id })
    .from(learningItems)
    .where(
      and(
        eq(learningItems.userId, input.userId),
        ne(learningItems.status, "deleted"),
        inArray(learningItems.id, input.itemIds),
      ),
    );

  return rows.map((row) => row.id);
}

function mapLookupDetail(row: typeof lookups.$inferSelect): LookupDetail {
  return {
    id: row.id,
    requestId: row.requestId,
    mode: row.mode as LookupMode,
    vocab: row.vocab,
    sentence: row.sentence,
    sourceLang: row.sourceLang,
    targetLang: row.targetLang,
    responseSummary: sanitizeLookupResponseSummary(row.responseSummary),
    responsePayload: sanitizeLookupResponsePayload(row.responsePayload),
    createdAt: row.createdAt.toISOString(),
  };
}

function mapLearningItemIssueReport(
  row: typeof wordInsightReports.$inferSelect,
): LearningItemIssueReport {
  return {
    id: row.id,
    userId: row.userId,
    itemId: row.itemId,
    lookupId: row.lookupId ?? undefined,
    message: row.message,
    status: row.status as LearningItemIssueReport["status"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function ensureCreditRow(
  tx: CreditTx,
  userId: string,
  now: Date,
  config: WordInsightUsageRepoConfig,
) {
  await tx
    .insert(userCredits)
    .values({
      userId,
      freeBasic: config.defaultFreeBasic,
      freeAdvanced: config.defaultFreeAdvanced,
      paidBasicCap: config.paidBasicCap,
      paidAdvancedCap: config.paidAdvancedCap,
      monthlyPaidBasicTopup: config.monthlyPaidBasicTopup,
      monthlyPaidAdvancedTopup: config.monthlyPaidAdvancedTopup,
      nextMonthlyTopupAt: addDays(now, config.monthlyTopupIntervalDays),
      updatedAt: now,
    })
    .onConflictDoNothing({ target: userCredits.userId });
}

async function applyMonthlyTopupIfDue(
  tx: CreditTx,
  userId: string,
  now: Date,
  config: WordInsightUsageRepoConfig,
) {
  if (config.monthlyPaidBasicTopup <= 0 && config.monthlyPaidAdvancedTopup <= 0) return;

  await tx
    .update(userCredits)
    .set({
      paidBasic: sql`LEAST(${userCredits.paidBasicCap}, ${userCredits.paidBasic} + ${userCredits.monthlyPaidBasicTopup})`,
      paidAdvanced: sql`LEAST(${userCredits.paidAdvancedCap}, ${userCredits.paidAdvanced} + ${userCredits.monthlyPaidAdvancedTopup})`,
      nextMonthlyTopupAt: addDays(now, config.monthlyTopupIntervalDays),
      updatedAt: now,
    })
    .where(
      and(
        eq(userCredits.userId, userId),
        lte(userCredits.nextMonthlyTopupAt, now),
        or(gt(userCredits.monthlyPaidBasicTopup, 0), gt(userCredits.monthlyPaidAdvancedTopup, 0)),
      ),
    );
}

async function consumeOneCredit(
  tx: CreditTx,
  userId: string,
  mode: LookupMode,
  now: Date,
): Promise<{ source: "free" | "paid"; balances: CreditBalances } | null> {
  if (mode === "advanced") {
    const free = await tx
      .update(userCredits)
      .set({
        freeAdvanced: sql`${userCredits.freeAdvanced} - 1`,
        updatedAt: now,
      })
      .where(and(eq(userCredits.userId, userId), gt(userCredits.freeAdvanced, 0)))
      .returning();
    const freeRow = free[0];
    if (freeRow) {
      return { source: "free", balances: mapBalances(freeRow) };
    }

    const paid = await tx
      .update(userCredits)
      .set({
        paidAdvanced: sql`${userCredits.paidAdvanced} - 1`,
        updatedAt: now,
      })
      .where(and(eq(userCredits.userId, userId), gt(userCredits.paidAdvanced, 0)))
      .returning();
    const paidRow = paid[0];
    if (paidRow) {
      return { source: "paid", balances: mapBalances(paidRow) };
    }

    return null;
  }

  const free = await tx
    .update(userCredits)
    .set({
      freeBasic: sql`${userCredits.freeBasic} - 1`,
      updatedAt: now,
    })
    .where(and(eq(userCredits.userId, userId), gt(userCredits.freeBasic, 0)))
    .returning();
  const freeRow = free[0];
  if (freeRow) {
    return { source: "free", balances: mapBalances(freeRow) };
  }

  const paid = await tx
    .update(userCredits)
    .set({
      paidBasic: sql`${userCredits.paidBasic} - 1`,
      updatedAt: now,
    })
    .where(and(eq(userCredits.userId, userId), gt(userCredits.paidBasic, 0)))
    .returning();
  const paidRow = paid[0];
  if (paidRow) {
    return { source: "paid", balances: mapBalances(paidRow) };
  }

  return null;
}

export function createWordInsightUsageRepo(
  db: PostgresJsDatabase,
  config: WordInsightUsageRepoConfig,
): WordInsightUsageRepo {
  return {
    async getOrCreateBalances(userId) {
      return await db.transaction(async (tx) => {
        const now = new Date();
        await ensureCreditRow(tx, userId, now, config);
        await applyMonthlyTopupIfDue(tx, userId, now, config);
        const rows = await tx
          .select()
          .from(userCredits)
          .where(eq(userCredits.userId, userId))
          .limit(1);
        const row = rows[0];
        if (!row) {
          throw new Error("Failed to load credits row");
        }
        return mapBalances(row);
      });
    },

    async recordSuccessfulLookup(input: RecordLookupInput): Promise<RecordLookupResult | null> {
      return await db.transaction(async (tx) => {
        const now = new Date();
        await ensureCreditRow(tx, input.userId, now, config);
        await applyMonthlyTopupIfDue(tx, input.userId, now, config);
        const consumed = await consumeOneCredit(tx, input.userId, input.mode, now);
        if (!consumed) {
          return null;
        }

        const insightPayload = readInsightPayload(input.responsePayload);
        const cachedDefinitionL2 =
          readNonEmptyString(insightPayload?.definitionL2) ??
          readNonEmptyString(insightPayload?.sourceMeaning) ??
          input.responseSummary.shortExplanation;
        const cachedPhonetic = readNonEmptyString(insightPayload?.phonetic) ?? null;

        const lookupId = newId();
        await tx.insert(creditLedger).values({
          id: newId(),
          userId: input.userId,
          reason: "lookup",
          creditType: input.mode,
          amount: -1,
          mode: consumed.source,
          requestId: input.requestId,
          createdAt: now,
        });

        await tx.insert(lookups).values({
          id: lookupId,
          userId: input.userId,
          requestId: input.requestId,
          mode: input.mode,
          vocab: input.selectedWord,
          sentence: input.sentence,
          sourceLang: input.sourceLang,
          targetLang: input.targetLang,
          aiProvider: input.aiProvider,
          aiModel: input.aiModel,
          responseSummary: input.responseSummary,
          responsePayload: input.responsePayload,
          latencyMs: input.latencyMs,
          createdAt: now,
        });

        await tx
          .insert(learningItems)
          .values({
            id: newId(),
            userId: input.userId,
            lemma: input.lemma,
            vocab: input.selectedWord,
            sourceLang: input.sourceLang,
            targetLang: input.targetLang,
            status: "active",
            encounterCount: 1,
            lastSeenMode: input.mode,
            lastMeaning: input.responseSummary.meaning,
            targetMeaning: input.responseSummary.meaning,
            phonetic: cachedPhonetic,
            definitionL2: cachedDefinitionL2,
            latestLookupId: lookupId,
            lastLookupAt: now,
            learnedAt: null,
            deletedAt: null,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [
              learningItems.userId,
              learningItems.lemma,
              learningItems.sourceLang,
              learningItems.targetLang,
            ],
            set: {
              vocab: input.selectedWord,
              status: "active",
              encounterCount: sql`${learningItems.encounterCount} + 1`,
              lastSeenMode: input.mode,
              lastMeaning: input.responseSummary.meaning,
              targetMeaning: input.responseSummary.meaning,
              phonetic: cachedPhonetic,
              definitionL2: cachedDefinitionL2,
              latestLookupId: lookupId,
              lastLookupAt: now,
              learnedAt: null,
              deletedAt: null,
              updatedAt: now,
            },
          });

        return {
          lookupId,
          credits: consumed.balances,
          spend: {
            mode: input.mode,
            source: consumed.source,
            amount: 1,
          },
        };
      });
    },

    async listLearningItems(input) {
      if (input.groupIds && input.groupIds.length === 0) {
        return [];
      }

      const groupItemSubquery = input.groupIds
        ? db
            .select({ itemId: learningItemGroupMembers.itemId })
            .from(learningItemGroupMembers)
            .where(
              and(
                eq(learningItemGroupMembers.userId, input.userId),
                inArray(learningItemGroupMembers.groupId, input.groupIds),
              ),
            )
        : undefined;
      const statusCondition =
        input.status === "all"
          ? or(eq(learningItems.status, "active"), eq(learningItems.status, "learned"))
          : eq(learningItems.status, input.status);
      const favoriteCondition =
        input.isFavorite === undefined ? undefined : eq(learningItems.isFavorite, input.isFavorite);
      const queryTerm = input.query?.trim();
      const searchPattern = queryTerm ? `%${queryTerm}%` : undefined;
      const searchCondition = searchPattern
        ? or(
            ilike(learningItems.vocab, searchPattern),
            ilike(learningItems.lemma, searchPattern),
            ilike(learningItems.targetMeaning, searchPattern),
            ilike(learningItems.definitionL2, searchPattern),
          )
        : undefined;
      const where = and(
        eq(learningItems.userId, input.userId),
        statusCondition,
        favoriteCondition,
        searchCondition,
        groupItemSubquery ? inArray(learningItems.id, groupItemSubquery) : undefined,
      );
      const offset = Math.max(0, Math.floor(input.offset ?? 0));

      const rows = await db
        .select({
          item: learningItems,
          latestLookup: lookups,
        })
        .from(learningItems)
        .leftJoin(
          lookups,
          and(eq(lookups.id, learningItems.latestLookupId), eq(lookups.userId, input.userId)),
        )
        .where(where)
        .orderBy(desc(learningItems.lastLookupAt), desc(learningItems.updatedAt))
        .offset(offset)
        .limit(input.limit);

      return rows.map((row) => mapLearningItem(row.item, row.latestLookup ?? undefined));
    },

    async getLearningItemMasterySummary(input) {
      const weeklyWindowStart = new Date(Date.now() - 7 * MS_PER_DAY).toISOString();
      const statusRows = await db
        .select({
          status: learningItems.status,
          itemCount: sql<number>`count(*)::int`,
          weeklyStudiedItemCount: sql<number>`(count(*) filter (where ${learningItems.lastLookupAt} >= ${weeklyWindowStart}))::int`,
          weeklyLearnedItemCount: sql<number>`(count(*) filter (where ${learningItems.learnedAt} >= ${weeklyWindowStart}))::int`,
        })
        .from(learningItems)
        .where(
          and(
            eq(learningItems.userId, input.userId),
            or(eq(learningItems.status, "active"), eq(learningItems.status, "learned")),
          ),
        )
        .groupBy(learningItems.status);

      const activeItemCount = Number(
        statusRows.find((row) => row.status === "active")?.itemCount ?? 0,
      );
      const learnedItemCount = Number(
        statusRows.find((row) => row.status === "learned")?.itemCount ?? 0,
      );
      const weeklyStudiedItemCount = Number(
        statusRows.reduce((sum, row) => sum + Number(row.weeklyStudiedItemCount ?? 0), 0),
      );
      const weeklyLearnedItemCount = Number(
        statusRows.reduce((sum, row) => sum + Number(row.weeklyLearnedItemCount ?? 0), 0),
      );

      const groupRows = await db
        .select({
          id: learningItemGroups.id,
          name: learningItemGroups.name,
          itemCount: sql<number>`(count(distinct ${learningItems.id}))::int`,
          activeItemCount: sql<number>`(count(distinct ${learningItems.id}) filter (where ${learningItems.status} = 'active'))::int`,
          learnedItemCount: sql<number>`(count(distinct ${learningItems.id}) filter (where ${learningItems.status} = 'learned'))::int`,
        })
        .from(learningItemGroups)
        .leftJoin(
          learningItemGroupMembers,
          and(
            eq(learningItemGroupMembers.groupId, learningItemGroups.id),
            eq(learningItemGroupMembers.userId, input.userId),
          ),
        )
        .leftJoin(
          learningItems,
          and(
            eq(learningItems.id, learningItemGroupMembers.itemId),
            eq(learningItems.userId, input.userId),
            or(eq(learningItems.status, "active"), eq(learningItems.status, "learned")),
          ),
        )
        .where(eq(learningItemGroups.userId, input.userId))
        .groupBy(learningItemGroups.id, learningItemGroups.name, learningItemGroups.updatedAt)
        .orderBy(
          desc(sql<number>`count(distinct ${learningItems.id})`),
          desc(learningItemGroups.updatedAt),
        )
        .limit(input.topGroupLimit);

      return {
        activeItemCount: Number.isFinite(activeItemCount) ? activeItemCount : 0,
        learnedItemCount: Number.isFinite(learnedItemCount) ? learnedItemCount : 0,
        totalItemCount:
          (Number.isFinite(activeItemCount) ? activeItemCount : 0) +
          (Number.isFinite(learnedItemCount) ? learnedItemCount : 0),
        weeklyStudiedItemCount: Number.isFinite(weeklyStudiedItemCount)
          ? weeklyStudiedItemCount
          : 0,
        weeklyLearnedItemCount: Number.isFinite(weeklyLearnedItemCount)
          ? weeklyLearnedItemCount
          : 0,
        topGroups: groupRows
          .map(mapLearningItemMasteryGroup)
          .filter((group) => group.itemCount > 0),
      };
    },

    async getLearningItemDetail(input): Promise<LearningItemDetail | null> {
      const itemRows = await db
        .select()
        .from(learningItems)
        .where(
          and(
            eq(learningItems.id, input.itemId),
            eq(learningItems.userId, input.userId),
            ne(learningItems.status, "deleted"),
          ),
        )
        .limit(1);

      const itemRow = itemRows[0];
      if (!itemRow) return null;

      if (!itemRow.latestLookupId) {
        const item = mapLearningItem(itemRow);
        return { item };
      }

      const lookupRows = await db
        .select()
        .from(lookups)
        .where(and(eq(lookups.id, itemRow.latestLookupId), eq(lookups.userId, input.userId)))
        .limit(1);
      const lookupRow = lookupRows[0];
      const item = mapLearningItem(itemRow, lookupRow);

      return {
        item,
        latestLookup: lookupRow ? mapLookupDetail(lookupRow) : undefined,
      };
    },

    async createLearningItemGroup(input): Promise<LearningItemGroup> {
      const now = new Date();
      const groupId = newId();
      await db.insert(learningItemGroups).values({
        id: groupId,
        userId: input.userId,
        name: input.name,
        createdAt: now,
        updatedAt: now,
      });

      const group = await loadLearningItemGroup(db, {
        userId: input.userId,
        groupId,
      });
      if (!group) {
        throw new Error("Failed to load created learning item group");
      }
      return group;
    },

    async listLearningItemGroups(input): Promise<LearningItemGroup[]> {
      const rows = await db
        .select({
          id: learningItemGroups.id,
          userId: learningItemGroups.userId,
          name: learningItemGroups.name,
          createdAt: learningItemGroups.createdAt,
          updatedAt: learningItemGroups.updatedAt,
          itemCount: sql<number>`count(distinct ${learningItems.id})::int`,
        })
        .from(learningItemGroups)
        .leftJoin(
          learningItemGroupMembers,
          and(
            eq(learningItemGroupMembers.groupId, learningItemGroups.id),
            eq(learningItemGroupMembers.userId, input.userId),
          ),
        )
        .leftJoin(
          learningItems,
          and(
            eq(learningItems.id, learningItemGroupMembers.itemId),
            eq(learningItems.userId, input.userId),
            ne(learningItems.status, "deleted"),
          ),
        )
        .where(eq(learningItemGroups.userId, input.userId))
        .groupBy(
          learningItemGroups.id,
          learningItemGroups.userId,
          learningItemGroups.name,
          learningItemGroups.createdAt,
          learningItemGroups.updatedAt,
        )
        .orderBy(desc(learningItemGroups.updatedAt), desc(learningItemGroups.createdAt));

      return rows.map(mapLearningItemGroup);
    },

    async listLearningItemGroupsForItem(input): Promise<LearningItemGroup[] | null> {
      const itemRows = await db
        .select({ id: learningItems.id })
        .from(learningItems)
        .where(
          and(
            eq(learningItems.id, input.itemId),
            eq(learningItems.userId, input.userId),
            ne(learningItems.status, "deleted"),
          ),
        )
        .limit(1);
      if (!itemRows[0]) return null;

      const membershipRows = await db
        .select({ groupId: learningItemGroupMembers.groupId })
        .from(learningItemGroupMembers)
        .where(
          and(
            eq(learningItemGroupMembers.userId, input.userId),
            eq(learningItemGroupMembers.itemId, input.itemId),
          ),
        );
      const groupIds = membershipRows.map((row) => row.groupId);
      if (groupIds.length === 0) return [];

      const rows = await db
        .select({
          id: learningItemGroups.id,
          userId: learningItemGroups.userId,
          name: learningItemGroups.name,
          createdAt: learningItemGroups.createdAt,
          updatedAt: learningItemGroups.updatedAt,
          itemCount: sql<number>`count(distinct ${learningItems.id})::int`,
        })
        .from(learningItemGroups)
        .leftJoin(
          learningItemGroupMembers,
          and(
            eq(learningItemGroupMembers.groupId, learningItemGroups.id),
            eq(learningItemGroupMembers.userId, input.userId),
          ),
        )
        .leftJoin(
          learningItems,
          and(
            eq(learningItems.id, learningItemGroupMembers.itemId),
            eq(learningItems.userId, input.userId),
            ne(learningItems.status, "deleted"),
          ),
        )
        .where(
          and(
            eq(learningItemGroups.userId, input.userId),
            inArray(learningItemGroups.id, groupIds),
          ),
        )
        .groupBy(
          learningItemGroups.id,
          learningItemGroups.userId,
          learningItemGroups.name,
          learningItemGroups.createdAt,
          learningItemGroups.updatedAt,
        )
        .orderBy(desc(learningItemGroups.updatedAt), desc(learningItemGroups.createdAt));

      return rows.map(mapLearningItemGroup);
    },

    async updateLearningItemGroup(input): Promise<LearningItemGroup | null> {
      const now = new Date();
      const rows = await db
        .update(learningItemGroups)
        .set({
          name: input.name,
          updatedAt: now,
        })
        .where(
          and(
            eq(learningItemGroups.id, input.groupId),
            eq(learningItemGroups.userId, input.userId),
          ),
        )
        .returning({ id: learningItemGroups.id });

      const row = rows[0];
      if (!row) return null;

      return await loadLearningItemGroup(db, {
        userId: input.userId,
        groupId: row.id,
      });
    },

    async deleteLearningItemGroup(input): Promise<boolean> {
      const rows = await db
        .delete(learningItemGroups)
        .where(
          and(
            eq(learningItemGroups.id, input.groupId),
            eq(learningItemGroups.userId, input.userId),
          ),
        )
        .returning({ id: learningItemGroups.id });

      return rows.length > 0;
    },

    async addLearningItemToGroup(input): Promise<LearningItemGroup | null> {
      return await db.transaction(async (tx) => {
        const group = await loadLearningItemGroup(tx, {
          userId: input.userId,
          groupId: input.groupId,
        });
        if (!group) return null;

        const validItemIds = await listValidLearningItemIds(tx, {
          userId: input.userId,
          itemIds: [input.itemId],
        });
        if (validItemIds.length !== 1) return null;

        await tx
          .insert(learningItemGroupMembers)
          .values({
            id: newId(),
            userId: input.userId,
            groupId: input.groupId,
            itemId: input.itemId,
            createdAt: new Date(),
          })
          .onConflictDoNothing({
            target: [learningItemGroupMembers.groupId, learningItemGroupMembers.itemId],
          });

        return await loadLearningItemGroup(tx, {
          userId: input.userId,
          groupId: input.groupId,
        });
      });
    },

    async addLearningItemsToGroup(input): Promise<LearningItemGroup | null> {
      return await db.transaction(async (tx) => {
        const group = await loadLearningItemGroup(tx, {
          userId: input.userId,
          groupId: input.groupId,
        });
        if (!group) return null;

        const uniqueItemIds = [...new Set(input.itemIds)];
        const validItemIds = await listValidLearningItemIds(tx, {
          userId: input.userId,
          itemIds: uniqueItemIds,
        });
        if (validItemIds.length !== uniqueItemIds.length) return null;

        if (validItemIds.length > 0) {
          const now = new Date();
          await tx
            .insert(learningItemGroupMembers)
            .values(
              validItemIds.map((itemId) => ({
                id: newId(),
                userId: input.userId,
                groupId: input.groupId,
                itemId,
                createdAt: now,
              })),
            )
            .onConflictDoNothing({
              target: [learningItemGroupMembers.groupId, learningItemGroupMembers.itemId],
            });
        }

        return await loadLearningItemGroup(tx, {
          userId: input.userId,
          groupId: input.groupId,
        });
      });
    },

    async removeLearningItemFromGroup(input): Promise<LearningItemGroup | null> {
      return await db.transaction(async (tx) => {
        const group = await loadLearningItemGroup(tx, {
          userId: input.userId,
          groupId: input.groupId,
        });
        if (!group) return null;

        const validItemIds = await listValidLearningItemIds(tx, {
          userId: input.userId,
          itemIds: [input.itemId],
        });
        if (validItemIds.length !== 1) return null;

        await tx
          .delete(learningItemGroupMembers)
          .where(
            and(
              eq(learningItemGroupMembers.userId, input.userId),
              eq(learningItemGroupMembers.groupId, input.groupId),
              eq(learningItemGroupMembers.itemId, input.itemId),
            ),
          );

        return await loadLearningItemGroup(tx, {
          userId: input.userId,
          groupId: input.groupId,
        });
      });
    },

    async listLearningItemsByGroup(input): Promise<LearningItem[] | null> {
      const group = await loadLearningItemGroup(db, {
        userId: input.userId,
        groupId: input.groupId,
      });
      if (!group) return null;

      const offset = Math.max(0, Math.floor(input.offset ?? 0));
      const rows = await db
        .select({
          item: learningItems,
          latestLookup: lookups,
        })
        .from(learningItemGroupMembers)
        .innerJoin(
          learningItems,
          and(
            eq(learningItems.id, learningItemGroupMembers.itemId),
            eq(learningItems.userId, input.userId),
            or(eq(learningItems.status, "active"), eq(learningItems.status, "learned")),
          ),
        )
        .leftJoin(
          lookups,
          and(eq(lookups.id, learningItems.latestLookupId), eq(lookups.userId, input.userId)),
        )
        .where(
          and(
            eq(learningItemGroupMembers.userId, input.userId),
            eq(learningItemGroupMembers.groupId, input.groupId),
          ),
        )
        .orderBy(desc(learningItems.lastLookupAt), desc(learningItems.updatedAt))
        .offset(offset)
        .limit(input.limit);

      return rows.map((row) => mapLearningItem(row.item, row.latestLookup ?? undefined));
    },

    async markLearningItemLearned(input) {
      const now = new Date();
      const rows = await db
        .update(learningItems)
        .set({
          status: "learned",
          learnedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(learningItems.id, input.itemId),
            eq(learningItems.userId, input.userId),
            ne(learningItems.status, "deleted"),
          ),
        )
        .returning();
      const row = rows[0];
      return row ? mapLearningItem(row) : null;
    },

    async reopenLearningItem(input) {
      const now = new Date();
      const rows = await db
        .update(learningItems)
        .set({
          status: "active",
          learnedAt: null,
          deletedAt: null,
          updatedAt: now,
        })
        .where(
          and(
            eq(learningItems.id, input.itemId),
            eq(learningItems.userId, input.userId),
            ne(learningItems.status, "deleted"),
          ),
        )
        .returning();
      const row = rows[0];
      return row ? mapLearningItem(row) : null;
    },

    async softDeleteLearningItem(input) {
      const now = new Date();
      const rows = await db
        .update(learningItems)
        .set({
          status: "deleted",
          learnedAt: null,
          isFavorite: false,
          favoritedAt: null,
          deletedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(learningItems.id, input.itemId),
            eq(learningItems.userId, input.userId),
            ne(learningItems.status, "deleted"),
          ),
        )
        .returning();
      const row = rows[0];
      return row ? mapLearningItem(row) : null;
    },

    async markLearningItemFavorite(input) {
      const now = new Date();
      const rows = await db
        .update(learningItems)
        .set({
          isFavorite: true,
          favoritedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(learningItems.id, input.itemId),
            eq(learningItems.userId, input.userId),
            ne(learningItems.status, "deleted"),
          ),
        )
        .returning();
      const row = rows[0];
      return row ? mapLearningItem(row) : null;
    },

    async unmarkLearningItemFavorite(input) {
      const now = new Date();
      const rows = await db
        .update(learningItems)
        .set({
          isFavorite: false,
          favoritedAt: null,
          updatedAt: now,
        })
        .where(
          and(
            eq(learningItems.id, input.itemId),
            eq(learningItems.userId, input.userId),
            ne(learningItems.status, "deleted"),
          ),
        )
        .returning();
      const row = rows[0];
      return row ? mapLearningItem(row) : null;
    },

    async reportLearningItemIssue(input) {
      const now = new Date();
      const rows = await db
        .select({
          item: learningItems,
          lookup: lookups,
        })
        .from(learningItems)
        .leftJoin(
          lookups,
          and(eq(lookups.id, learningItems.latestLookupId), eq(lookups.userId, input.userId)),
        )
        .where(
          and(
            eq(learningItems.id, input.itemId),
            eq(learningItems.userId, input.userId),
            ne(learningItems.status, "deleted"),
          ),
        )
        .limit(1);

      const row = rows[0];
      if (!row) return null;

      const reportId = newId();
      const snapshot: Record<string, unknown> = {
        vocab: row.item.vocab,
        lemma: row.item.lemma,
        sourceLang: row.item.sourceLang,
        targetLang: row.item.targetLang,
        targetMeaning: row.item.targetMeaning,
        definitionL2: row.item.definitionL2,
        contextSentence: readNonEmptyString(row.lookup?.sentence),
        latestLookupId: row.item.latestLookupId ?? undefined,
      };

      const inserted = await db
        .insert(wordInsightReports)
        .values({
          id: reportId,
          userId: input.userId,
          itemId: row.item.id,
          lookupId: row.item.latestLookupId ?? null,
          message: input.message,
          status: "open",
          snapshot,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const report = inserted[0];
      return report ? mapLearningItemIssueReport(report) : null;
    },
  };
}
