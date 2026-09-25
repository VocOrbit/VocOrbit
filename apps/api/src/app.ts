import { Elysia } from "elysia";
import { bodyLimitConfig } from "../../../packages/core/src/http/middleware/body-limit";
import { createCorsPlugin } from "../../../packages/core/src/http/middleware/cors";
import { createErrorHandlerPlugin } from "../../../packages/core/src/http/middleware/error-handler";
import { createLoggerPlugin } from "../../../packages/core/src/http/middleware/logger";
import { createMetricsPlugin } from "../../../packages/core/src/http/middleware/metrics";
import { createOpenApiPlugin } from "../../../packages/core/src/http/middleware/openapi";
import { createOpenTelemetryPlugin } from "../../../packages/core/src/http/middleware/opentelemetry";
import { createRateLimitPlugin } from "../../../packages/core/src/http/middleware/rate-limit";
import { requestIdPlugin } from "../../../packages/core/src/http/middleware/request-id";
import { createSecurityHeadersPlugin } from "../../../packages/core/src/http/middleware/security-headers";
import { buildComposition } from "./composition";
import { createRoutes } from "./routes";
import {
  createWordInsightJobHub,
  createWordInsightJobRunner,
  createWordInsightJobStatusPublisher,
  subscribeWordInsightJobStatusEvents,
} from "./word-insight-jobs";

export async function createApp() {
  const deps = await buildComposition();
  const isWordInsightJobRunnerEnabled = deps.env.WORD_INSIGHT_JOB_RUNNER_ENABLED;
  const wordInsightNodeId = `api-${process.pid}`;
  const wordInsightJobHub = createWordInsightJobHub(deps.logger);
  const publishWordInsightJobStatus = createWordInsightJobStatusPublisher({
    eventBus: deps.eventBus,
    logger: deps.logger,
    sourceNodeId: wordInsightNodeId,
  });
  const stopWordInsightJobStatusSubscription = await subscribeWordInsightJobStatusEvents({
    eventBus: deps.eventBus,
    hub: wordInsightJobHub,
    logger: deps.logger,
    nodeId: wordInsightNodeId,
  });
  deps.logger.info({
    msg: "word_insight_job_status_subscription_started",
    nodeId: wordInsightNodeId,
  });
  const wordInsightJobRunner = createWordInsightJobRunner(
    {
      wordInsight: deps.wordInsight,
      logger: deps.logger,
      hub: wordInsightJobHub,
      publishStatusEvent: publishWordInsightJobStatus,
    },
    {
      concurrency: deps.env.WORD_INSIGHT_JOB_CONCURRENCY,
      tickMs: deps.env.WORD_INSIGHT_JOB_TICK_MS,
      homeRegion: deps.env.APP_REGION,
      workerId: wordInsightNodeId,
    },
  );

  const app = new Elysia({
    serve: bodyLimitConfig(deps.env.MAX_BODY_BYTES),
  })
    .use(createOpenTelemetryPlugin())
    .use(requestIdPlugin)
    .use(createLoggerPlugin(deps.logger))
    .use(createSecurityHeadersPlugin(deps.env.NODE_ENV))
    .use(createCorsPlugin(deps.env.CORS_ORIGIN))
    .use(createOpenApiPlugin())
    .use(
      createRateLimitPlugin({
        windowMs: deps.env.RATE_LIMIT_WINDOW_MS,
        max: deps.env.RATE_LIMIT_MAX,
        trustProxy: deps.env.TRUST_PROXY,
        metrics: deps.metrics,
        store: deps.rateLimitStore,
        resolveUserId: async (request) => {
          const authorization = request.headers.get("authorization");
          if (!authorization) return undefined;
          try {
            const session = await deps.socialAuth.authenticateBearerToken(authorization);
            return session.user.id;
          } catch {
            return undefined;
          }
        },
      }),
    )
    .use(createMetricsPlugin(deps.metrics))
    .use(
      createRoutes({
        metrics: deps.metrics,
        metricsEnabled: deps.env.METRICS_ENABLED,
        logger: deps.logger,
        appMeta: deps.appMeta,
        usersContract: deps.usersContract,
        billing: deps.billing,
        wordInsight: deps.wordInsight,
        exercises: deps.exercises,
        socialAuth: deps.socialAuth,
        wordInsightJobHub,
        onExplainJobQueued: () => {
          if (!isWordInsightJobRunnerEnabled) return;
          wordInsightJobRunner.kick();
        },
        checkReadiness: deps.checkReadiness,
        getWordInsightQueueMetrics: deps.getWordInsightQueueMetrics,
        cache: deps.cache,
        cacheTtlMs: deps.env.CACHE_TTL_MS,
        requestLockStore: deps.requestLockStore,
        requestLockTtlMs: deps.env.REQUEST_LOCK_TTL_MS,
        wsWordInsightIdleTimeoutMs: deps.env.WS_WORD_INSIGHT_IDLE_TIMEOUT_MS,
        wsWordInsightHeartbeatIntervalMs: deps.env.WS_WORD_INSIGHT_HEARTBEAT_INTERVAL_MS,
        wsWordInsightMaxConnectionsPerUser: deps.env.WS_WORD_INSIGHT_MAX_CONNECTIONS_PER_USER,
        wordInsightMaxSentenceChars: deps.env.WORD_INSIGHT_MAX_SENTENCE_CHARS,
        wordInsightMaxSelectedWordChars: deps.env.WORD_INSIGHT_MAX_SELECTED_WORD_CHARS,
      }),
    )
    .use(createErrorHandlerPlugin());

  return {
    app,
    deps: {
      ...deps,
      wordInsightJobHub,
      wordInsightJobRunner,
      stopWordInsightJobStatusSubscription,
    },
  };
}
