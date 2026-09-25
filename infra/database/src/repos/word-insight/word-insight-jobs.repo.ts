import { createHash } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  ExplainJobClaimFilter,
  ExplainJobContext,
  ExplainJobInput,
  ExplainJobRecord,
  ExplainJobResult,
  WordInsightExplainJobRepo,
} from "../../../../../modules/word-insight/src/ports/explain-job-repo";
import { newId } from "../../../../../packages/core/src/ids";
import { wordInsightJobs } from "../../schema";

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function normalizeRegion(value: string | undefined, fallback = "eu"): string {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return fallback;
  return normalized;
}

function resolveShardCount(value: number | undefined, fallback = 16): number {
  const candidate = value ?? fallback;
  if (!Number.isFinite(candidate) || candidate <= 0) {
    return fallback;
  }
  return Math.floor(candidate);
}

function normalizeShardId(value: number | undefined, shardCount: number): number | undefined {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value === undefined) {
    return undefined;
  }
  if (value < 0 || value >= shardCount) return undefined;
  return value;
}

function computeShardId(userId: string, shardCount: number): number {
  const digest = createHash("sha256").update(userId).digest();
  const hash = digest.readUInt32BE(0);
  return hash % shardCount;
}

function normalizeClaimFilter(
  filter: ExplainJobClaimFilter | undefined,
): ExplainJobClaimFilter {
  const homeRegion = normalizeRegion(filter?.homeRegion, "");

  return {
    homeRegion: homeRegion.length > 0 ? homeRegion : undefined,
    claimedByRegion: filter?.claimedByRegion,
    claimedByWorker: filter?.claimedByWorker,
  };
}

function mapJob(row: typeof wordInsightJobs.$inferSelect): ExplainJobRecord {
  const input = asObject(row.inputPayload) as ExplainJobInput;
  const context = asObject(row.contextPayload) as ExplainJobContext;
  const result = row.resultPayload ? (asObject(row.resultPayload) as ExplainJobResult) : undefined;

  return {
    id: row.id,
    userId: row.userId,
    requestId: row.requestId,
    status: row.status as ExplainJobRecord["status"],
    homeRegion: row.homeRegion,
    shardId: row.shardId,
    claimedByRegion: row.claimedByRegion ?? undefined,
    claimedByWorker: row.claimedByWorker ?? undefined,
    input,
    context: {
      ...context,
      requestId: row.requestId,
    },
    result,
    errorCode: row.errorCode ?? undefined,
    errorMessage: row.errorMessage ?? undefined,
    attempt: row.attempt,
    startedAt: row.startedAt?.toISOString(),
    finishedAt: row.finishedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function createWordInsightExplainJobRepo(
  db: PostgresJsDatabase,
  options: {
    defaultHomeRegion?: string;
    regionShardCount?: number;
  } = {},
): WordInsightExplainJobRepo {
  const defaultHomeRegion = normalizeRegion(options.defaultHomeRegion, "eu");
  const regionShardCount = resolveShardCount(options.regionShardCount, 16);

  return {
    async enqueue(input) {
      const now = new Date();
      const jobId = newId();
      const homeRegion = normalizeRegion(input.context.user.homeRegion, defaultHomeRegion);
      const shardId =
        normalizeShardId(input.context.user.shardId, regionShardCount) ??
        computeShardId(input.context.user.id, regionShardCount);
      const contextPayload: ExplainJobContext = {
        ...input.context,
        user: {
          ...input.context.user,
          homeRegion,
          shardId,
        },
      };
      const rows = await db
        .insert(wordInsightJobs)
        .values({
          id: jobId,
          userId: input.context.user.id,
          requestId: input.context.requestId,
          status: "queued",
          homeRegion,
          shardId,
          inputPayload: input.input as Record<string, unknown>,
          contextPayload: contextPayload as unknown as Record<string, unknown>,
          attempt: 0,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing({ target: [wordInsightJobs.userId, wordInsightJobs.requestId] })
        .returning();

      const row = rows[0];
      if (row) return mapJob(row);

      const existing = await db
        .select()
        .from(wordInsightJobs)
        .where(
          and(
            eq(wordInsightJobs.userId, input.context.user.id),
            eq(wordInsightJobs.requestId, input.context.requestId),
          ),
        )
        .limit(1);
      const existingRow = existing[0];
      if (!existingRow) {
        throw new Error("Failed to enqueue word insight job");
      }
      return mapJob(existingRow);
    },

    async getByIdForUser(input) {
      const rows = await db
        .select()
        .from(wordInsightJobs)
        .where(and(eq(wordInsightJobs.id, input.jobId), eq(wordInsightJobs.userId, input.userId)))
        .limit(1);
      const row = rows[0];
      return row ? mapJob(row) : null;
    },

    async claimNextQueued(filter) {
      return await db.transaction(async (tx) => {
        const normalizedFilter = normalizeClaimFilter(filter);
        const whereParts = [sql`status = 'queued'`];
        if (normalizedFilter.homeRegion) {
          whereParts.push(sql`home_region = ${normalizedFilter.homeRegion}`);
        }
        const whereSql = sql.join(whereParts, sql` AND `);

        // Lock one queued row per transaction and skip rows already locked by other workers.
        const claimRows = await tx.execute(sql`
          WITH picked AS (
            SELECT id
            FROM word_insight_jobs
            WHERE ${whereSql}
            ORDER BY created_at
            FOR UPDATE SKIP LOCKED
            LIMIT 1
          )
          UPDATE word_insight_jobs j
          SET
            status = 'processing',
            attempt = j.attempt + 1,
            claimed_by_region = ${normalizedFilter.claimedByRegion ?? null},
            claimed_by_worker = ${normalizedFilter.claimedByWorker ?? null},
            started_at = COALESCE(j.started_at, now()),
            updated_at = now()
          FROM picked
          WHERE j.id = picked.id
          RETURNING j.id
        `);
        const claimedId = (claimRows as unknown as Array<{ id: string }>)[0]?.id;
        if (!claimedId) return null;

        const claimedRows = await tx
          .select()
          .from(wordInsightJobs)
          .where(eq(wordInsightJobs.id, claimedId))
          .limit(1);
        const claimed = claimedRows[0];
        return claimed ? mapJob(claimed) : null;
      });
    },

    async markCompleted(input) {
      const now = new Date();
      const rows = await db
        .update(wordInsightJobs)
        .set({
          status: "completed",
          resultPayload: input.result as unknown as Record<string, unknown>,
          errorCode: null,
          errorMessage: null,
          finishedAt: now,
          updatedAt: now,
        })
        .where(eq(wordInsightJobs.id, input.jobId))
        .returning();

      const row = rows[0];
      return row ? mapJob(row) : null;
    },

    async markFailed(input) {
      const now = new Date();
      const rows = await db
        .update(wordInsightJobs)
        .set({
          status: "failed",
          errorCode: input.errorCode,
          errorMessage: input.errorMessage,
          finishedAt: now,
          updatedAt: now,
        })
        .where(eq(wordInsightJobs.id, input.jobId))
        .returning();

      const row = rows[0];
      return row ? mapJob(row) : null;
    },
  };
}
