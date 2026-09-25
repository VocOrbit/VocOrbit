import { writeFileSync } from "node:fs";
import { buildComposition } from "./composition";
import {
  createWordInsightJobHub,
  createWordInsightJobRunner,
  createWordInsightJobStatusPublisher,
} from "./word-insight-jobs";

const deps = await buildComposition();
const workerId = `word-insight-worker-${process.pid}`;
const hub = createWordInsightJobHub(deps.logger);
const publishWordInsightJobStatus = createWordInsightJobStatusPublisher({
  eventBus: deps.eventBus,
  logger: deps.logger,
  sourceNodeId: workerId,
});
const runner = createWordInsightJobRunner(
  {
    wordInsight: deps.wordInsight,
    logger: deps.logger,
    hub,
    publishStatusEvent: publishWordInsightJobStatus,
  },
  {
    concurrency: deps.env.WORD_INSIGHT_JOB_CONCURRENCY,
    tickMs: deps.env.WORD_INSIGHT_JOB_TICK_MS,
    homeRegion: deps.env.APP_REGION,
    workerId,
  },
);

runner.start();

const HEARTBEAT_FILE_PATH = "/tmp/word-insight-worker-heartbeat";
const HEARTBEAT_INTERVAL_MS = 10_000;

function writeHeartbeat() {
  writeFileSync(HEARTBEAT_FILE_PATH, `${Date.now()}\n`);
}

writeHeartbeat();
const heartbeatTimer = setInterval(writeHeartbeat, HEARTBEAT_INTERVAL_MS);

deps.logger.info({
  msg: "word_insight_worker_started",
  env: deps.env.NODE_ENV,
  concurrency: deps.env.WORD_INSIGHT_JOB_CONCURRENCY,
  tickMs: deps.env.WORD_INSIGHT_JOB_TICK_MS,
  homeRegion: deps.env.APP_REGION,
});

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function closeRedisClient(redis: unknown) {
  const maybeRedis = redis as { close?: () => void };
  if (typeof maybeRedis?.close === "function") {
    maybeRedis.close();
  }
}

let shuttingDown = false;

const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  deps.logger.info({ msg: "word_insight_worker_stopping", signal });

  const errors: Array<{ step: string; error: string }> = [];
  const runStep = async (step: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
    } catch (error) {
      errors.push({ step, error: formatError(error) });
    }
  };

  await runStep("word_insight_job_runner_stop", async () => {
    await runner.stop();
  });
  await runStep("heartbeat_stop", () => {
    clearInterval(heartbeatTimer);
  });
  await runStep("event_bus_close", async () => {
    await deps.eventBus.close();
  });
  await runStep("postgres_close", async () => {
    await deps.sql?.end({ timeout: 5 });
  });
  await runStep("redis_close", () => {
    closeRedisClient(deps.redis);
  });

  if (errors.length > 0) {
    deps.logger.error({
      msg: "word_insight_worker_stop_failed",
      signal,
      errors,
    });
    process.exit(1);
    return;
  }

  deps.logger.info({ msg: "word_insight_worker_stopped", signal });
  process.exit(0);
};

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});
