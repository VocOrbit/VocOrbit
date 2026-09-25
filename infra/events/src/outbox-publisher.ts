import type { Sql } from "postgres";
import type { Logger } from "../../../packages/core/src/logger";
import type { EventBus } from "./bus";

type OutboxPublisherOptions = {
  intervalMs?: number;
  batchSize?: number;
  leaseMs?: number;
  maxAttempts?: number;
  baseBackoffMs?: number;
  maxBackoffMs?: number;
};

type OutboxPublisherDeps = {
  sql: Sql;
  eventBus: EventBus;
  logger: Logger;
};

type OutboxEventRow = {
  id: string;
  eventName: string;
  payload: unknown;
  attempt: number;
};

function nextBackoff(attempt: number, baseMs: number, maxMs: number): number {
  const delay = baseMs * 2 ** Math.max(0, attempt - 1);
  return Math.min(delay, maxMs);
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function claimBatch(sql: Sql, batchSize: number, leaseMs: number): Promise<OutboxEventRow[]> {
  return await sql<OutboxEventRow[]>`
    WITH picked AS (
      SELECT id
      FROM outbox_events
      WHERE published_at IS NULL
        AND available_at <= NOW()
      ORDER BY created_at ASC
      LIMIT ${batchSize}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE outbox_events AS oe
    SET available_at = NOW() + (${leaseMs} * interval '1 millisecond')
    FROM picked
    WHERE oe.id = picked.id
    RETURNING
      oe.id,
      oe.event_name AS "eventName",
      oe.payload,
      oe.attempt
  `;
}

export function createOutboxPublisher(
  deps: OutboxPublisherDeps,
  options: OutboxPublisherOptions = {},
) {
  const intervalMs = options.intervalMs ?? 1_000;
  const batchSize = options.batchSize ?? 100;
  const leaseMs = options.leaseMs ?? 30_000;
  const maxAttempts = options.maxAttempts ?? 25;
  const baseBackoffMs = options.baseBackoffMs ?? 500;
  const maxBackoffMs = options.maxBackoffMs ?? 60_000;

  let stopped = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let resolveSleep: (() => void) | undefined;
  let loopPromise: Promise<void> | undefined;
  let consecutiveTickFailures = 0;

  async function sleep(ms: number) {
    await new Promise<void>((resolve) => {
      resolveSleep = resolve;
      timer = setTimeout(resolve, ms);
    });
    timer = undefined;
    resolveSleep = undefined;
  }

  async function markPublished(id: string) {
    await deps.sql`
      UPDATE outbox_events
      SET published_at = NOW(),
          last_error = NULL
      WHERE id = ${id}
    `;
  }

  async function markFailure(row: OutboxEventRow, error: unknown) {
    const attempt = row.attempt + 1;
    const lastError = formatError(error);

    if (attempt >= maxAttempts) {
      await deps.sql`
        UPDATE outbox_events
        SET attempt = ${attempt},
            published_at = NOW(),
            last_error = ${`dropped after ${attempt} attempts: ${lastError}`}
        WHERE id = ${row.id}
      `;
      deps.logger.error({
        msg: "outbox_event_dropped",
        eventId: row.id,
        eventName: row.eventName,
        attempt,
        error: lastError,
      });
      return;
    }

    const delayMs = nextBackoff(attempt, baseBackoffMs, maxBackoffMs);
    await deps.sql`
      UPDATE outbox_events
      SET attempt = ${attempt},
          available_at = NOW() + (${delayMs} * interval '1 millisecond'),
          last_error = ${lastError}
      WHERE id = ${row.id}
    `;
    deps.logger.error({
      msg: "outbox_event_publish_failed",
      eventId: row.id,
      eventName: row.eventName,
      attempt,
      retryInMs: delayMs,
      error: lastError,
    });
  }

  async function flushOnce() {
    const batch = await claimBatch(deps.sql, batchSize, leaseMs);
    for (const row of batch) {
      try {
        await deps.eventBus.emit(row.eventName, row.payload as Record<string, unknown>);
        await markPublished(row.id);
      } catch (error) {
        await markFailure(row, error);
      }
    }
  }

  async function run() {
    while (!stopped) {
      let waitMs = intervalMs;
      try {
        await flushOnce();
        if (consecutiveTickFailures > 0) {
          deps.logger.info({
            msg: "outbox_publisher_recovered",
            failures: consecutiveTickFailures,
          });
        }
        consecutiveTickFailures = 0;
      } catch (error) {
        if (stopped) break;
        consecutiveTickFailures += 1;
        waitMs = nextBackoff(consecutiveTickFailures, intervalMs, maxBackoffMs);

        if (consecutiveTickFailures === 1 || consecutiveTickFailures % 10 === 0) {
          deps.logger.error({
            msg: "outbox_publisher_tick_failed",
            failures: consecutiveTickFailures,
            retryInMs: waitMs,
            error: formatError(error),
          });
        }
      }

      if (!stopped) {
        await sleep(waitMs);
      }
    }
  }

  return {
    start() {
      if (loopPromise) return;
      stopped = false;
      loopPromise = run();
      deps.logger.info({
        msg: "outbox_publisher_started",
        intervalMs,
        batchSize,
      });
    },
    async stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      timer = undefined;
      resolveSleep?.();
      resolveSleep = undefined;
      await loopPromise;
      loopPromise = undefined;
      deps.logger.info({ msg: "outbox_publisher_stopped" });
    },
    async flushOnce() {
      await flushOnce();
    },
  };
}
