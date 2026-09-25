import { createApp } from "./app";

const { app, deps } = await createApp();

app.listen(deps.env.PORT);
deps.outboxPublisher?.start();
if (deps.env.WORD_INSIGHT_JOB_RUNNER_ENABLED) {
  deps.wordInsightJobRunner?.start();
}

deps.logger.info({
  msg: "server_started",
  port: deps.env.PORT,
  env: deps.env.NODE_ENV,
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
  deps.logger.info({ msg: "server_stopping", signal });

  const errors: Array<{ step: string; error: string }> = [];
  const runStep = async (step: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
    } catch (error) {
      errors.push({ step, error: formatError(error) });
    }
  };

  await runStep("http_server_stop", async () => {
    await app.stop();
  });
  await runStep("outbox_publisher_stop", async () => {
    await deps.outboxPublisher?.stop();
  });
  await runStep("word_insight_job_runner_stop", async () => {
    if (deps.env.WORD_INSIGHT_JOB_RUNNER_ENABLED) {
      await deps.wordInsightJobRunner?.stop();
    }
  });
  await runStep("word_insight_job_status_subscription_stop", async () => {
    await deps.stopWordInsightJobStatusSubscription?.();
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
      msg: "server_stop_failed",
      signal,
      errors,
    });
    process.exit(1);
    return;
  }

  deps.logger.info({ msg: "server_stopped", signal });
  process.exit(0);
};

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});
