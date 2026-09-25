import { Elysia } from "elysia";
import { createAppMetaRoutes } from "../../../modules/app-meta/src/http/routes";
import type { AppMetaPublicContract } from "../../../modules/app-meta/src/public-contract";
import type { RequestLockStore } from "../../../infra/redis/src/request-lock-store";
import {
  createBillingProtectedRoutes,
  createBillingPublicRoutes,
} from "../../../modules/billing/src/http/routes";
import type { BillingPublicContract } from "../../../modules/billing/src/public-contract";
import { createExercisesRoutes } from "../../../modules/exercises/src/http/routes";
import type { ExercisesPublicContract } from "../../../modules/exercises/src/public-contract";
import { createSocialAuthRoutes } from "../../../modules/social-auth/src/http/routes";
import type { SocialAuthPublicContract } from "../../../modules/social-auth/src/public-contract";
import { createUsersRoutes } from "../../../modules/users/src/http/routes";
import type { UsersPublicContract } from "../../../modules/users/src/public-contract";
import { createWordInsightRoutes } from "../../../modules/word-insight/src/http/routes";
import type { WordInsightPublicContract } from "../../../modules/word-insight/src/public-contract";
import type { Cache } from "../../../packages/core/src/cache";
import { NotFoundError } from "../../../packages/core/src/errors";
import type { MetricsRegistry } from "../../../packages/core/src/http/middleware/metrics";
import { ok } from "../../../packages/core/src/http/response";
import type { Logger } from "../../../packages/core/src/logger";
import { createAuthorizePlugin } from "./middleware/authorize";
import { createRequestLockPlugin } from "./middleware/request-lock";
import { createRequireAuthPlugin } from "./middleware/require-auth";
import type { createWordInsightJobHub } from "./word-insight-jobs";
import { createWordInsightJobWsRoutes } from "./word-insight-jobs-ws";

type WordInsightQueueMetrics = {
  queuedCount: number;
  processingCount: number;
  oldestQueuedAgeSeconds: number;
  waitP50Seconds: number;
  waitP95Seconds: number;
  waitSampleCount: number;
  processingP95Seconds: number;
  totalP95Seconds: number;
  processingSampleCount: number;
  completed5m: number;
  failed5m: number;
  oldestProcessingAgeSeconds: number;
};

function renderWordInsightQueueMetrics(input: WordInsightQueueMetrics): string {
  const lines: string[] = [];
  lines.push("# HELP word_insight_jobs_queued Current queued word insight jobs");
  lines.push("# TYPE word_insight_jobs_queued gauge");
  lines.push(`word_insight_jobs_queued ${input.queuedCount}`);

  lines.push("# HELP word_insight_jobs_processing Current processing word insight jobs");
  lines.push("# TYPE word_insight_jobs_processing gauge");
  lines.push(`word_insight_jobs_processing ${input.processingCount}`);

  lines.push("# HELP word_insight_queue_oldest_age_seconds Age of oldest queued word insight job");
  lines.push("# TYPE word_insight_queue_oldest_age_seconds gauge");
  lines.push(`word_insight_queue_oldest_age_seconds ${input.oldestQueuedAgeSeconds}`);

  lines.push("# HELP word_insight_queue_wait_p50_seconds P50 queue wait for jobs started in last 30m");
  lines.push("# TYPE word_insight_queue_wait_p50_seconds gauge");
  lines.push(`word_insight_queue_wait_p50_seconds ${input.waitP50Seconds}`);

  lines.push("# HELP word_insight_queue_wait_p95_seconds P95 queue wait for jobs started in last 30m");
  lines.push("# TYPE word_insight_queue_wait_p95_seconds gauge");
  lines.push(`word_insight_queue_wait_p95_seconds ${input.waitP95Seconds}`);

  lines.push("# HELP word_insight_queue_wait_samples_30m Number of jobs sampled for queue wait in last 30m");
  lines.push("# TYPE word_insight_queue_wait_samples_30m gauge");
  lines.push(`word_insight_queue_wait_samples_30m ${input.waitSampleCount}`);

  lines.push(
    "# HELP word_insight_processing_p95_seconds P95 processing time (started->finished) for jobs finished in last 30m",
  );
  lines.push("# TYPE word_insight_processing_p95_seconds gauge");
  lines.push(`word_insight_processing_p95_seconds ${input.processingP95Seconds}`);

  lines.push(
    "# HELP word_insight_total_p95_seconds P95 total job time (created->finished) for jobs finished in last 30m",
  );
  lines.push("# TYPE word_insight_total_p95_seconds gauge");
  lines.push(`word_insight_total_p95_seconds ${input.totalP95Seconds}`);

  lines.push("# HELP word_insight_processing_samples_30m Number of finished jobs sampled in last 30m");
  lines.push("# TYPE word_insight_processing_samples_30m gauge");
  lines.push(`word_insight_processing_samples_30m ${input.processingSampleCount}`);

  lines.push("# HELP word_insight_jobs_completed_5m Completed jobs in last 5 minutes");
  lines.push("# TYPE word_insight_jobs_completed_5m gauge");
  lines.push(`word_insight_jobs_completed_5m ${input.completed5m}`);

  lines.push("# HELP word_insight_jobs_failed_5m Failed jobs in last 5 minutes");
  lines.push("# TYPE word_insight_jobs_failed_5m gauge");
  lines.push(`word_insight_jobs_failed_5m ${input.failed5m}`);

  lines.push("# HELP word_insight_processing_oldest_age_seconds Age of oldest currently processing job");
  lines.push("# TYPE word_insight_processing_oldest_age_seconds gauge");
  lines.push(`word_insight_processing_oldest_age_seconds ${input.oldestProcessingAgeSeconds}`);

  return `${lines.join("\n")}\n`;
}

export function createRoutes(deps: {
  metrics: MetricsRegistry;
  metricsEnabled: boolean;
  logger: Logger;
  appMeta: AppMetaPublicContract;
  usersContract: UsersPublicContract;
  billing: BillingPublicContract;
  wordInsight: WordInsightPublicContract;
  exercises: ExercisesPublicContract;
  socialAuth: SocialAuthPublicContract;
  wordInsightJobHub: ReturnType<typeof createWordInsightJobHub>;
  onExplainJobQueued: (jobId: string) => void;
  checkReadiness: () => Promise<{
    ready: boolean;
    checks: {
      redis: "up" | "down" | "skipped";
      database: "up" | "down" | "skipped";
      eventBus: "up" | "down" | "skipped";
    };
  }>;
  getWordInsightQueueMetrics: () => Promise<WordInsightQueueMetrics>;
  cache: Cache;
  cacheTtlMs: number;
  requestLockStore: RequestLockStore;
  requestLockTtlMs: number;
  wsWordInsightIdleTimeoutMs: number;
  wsWordInsightHeartbeatIntervalMs: number;
  wsWordInsightMaxConnectionsPerUser: number;
  wordInsightMaxSentenceChars: number;
  wordInsightMaxSelectedWordChars: number;
}) {
  const publicV1Routes = new Elysia({ name: "v1-public-routes" })
    .use(createSocialAuthRoutes(deps.socialAuth))
    .use(
      createWordInsightJobWsRoutes(
        {
          auth: deps.socialAuth,
          wordInsight: deps.wordInsight,
          hub: deps.wordInsightJobHub,
          logger: deps.logger,
        },
        {
          idleTimeoutMs: deps.wsWordInsightIdleTimeoutMs,
          heartbeatIntervalMs: deps.wsWordInsightHeartbeatIntervalMs,
          maxConnectionsPerUser: deps.wsWordInsightMaxConnectionsPerUser,
        },
      ),
    )
    .use(createBillingPublicRoutes(deps.billing));

  const protectedV1Routes = new Elysia({ name: "v1-protected-routes" })
    .use(createRequireAuthPlugin(deps.socialAuth))
    .use(createAuthorizePlugin())
    .use(
      createRequestLockPlugin({
        store: deps.requestLockStore,
        ttlMs: deps.requestLockTtlMs,
        methods: ["POST"],
        paths: ["/v1/word-insight/explain", "/word-insight/explain"],
        scope: "word-insight-lookup",
      }),
    )
    .use(
      createBillingProtectedRoutes(deps.billing, {
        requiresAuth: true,
      }),
    )
    .use(
      createWordInsightRoutes(deps.wordInsight, {
        requiresAuth: true,
        onExplainJobQueued: deps.onExplainJobQueued,
        maxSentenceChars: deps.wordInsightMaxSentenceChars,
        maxSelectedWordChars: deps.wordInsightMaxSelectedWordChars,
      }),
    )
    .use(
      createExercisesRoutes(deps.exercises, {
        requiresAuth: true,
      }),
    )
    .use(
      createAppMetaRoutes(deps.appMeta, {
        requiresAuth: true,
      }),
    )
    .use(
      createUsersRoutes(deps.usersContract, {
        cache: deps.cache,
        cacheTtlMs: deps.cacheTtlMs,
        requiresAuth: true,
      }),
    );

  return new Elysia({ name: "routes" })
    .get("/health", () => ok({ status: "ok" }), {
      detail: {
        tags: ["System"],
        summary: "Health check",
      },
    })
    .get(
      "/ready",
      async ({ set }) => {
        const result = await deps.checkReadiness();
        set.status = result.ready ? 200 : 503;
        return ok({
          status: result.ready ? "ready" : "not_ready",
          checks: result.checks,
        });
      },
      {
        detail: {
          tags: ["System"],
          summary: "Readiness check",
        },
      },
    )
    .get(
      "/metrics",
      async ({ set }) => {
        if (!deps.metricsEnabled) throw new NotFoundError();
        set.headers["content-type"] = "text/plain; version=0.0.4";
        const baseMetrics = deps.metrics.renderPrometheus();
        try {
          const queueMetrics = await deps.getWordInsightQueueMetrics();
          return `${baseMetrics}${renderWordInsightQueueMetrics(queueMetrics)}`;
        } catch (error) {
          deps.logger.warn({
            msg: "word_insight_queue_metrics_render_failed",
            error: error instanceof Error ? error.message : String(error),
          });
          return baseMetrics;
        }
      },
      {
        detail: {
          tags: ["System"],
          summary: "Prometheus metrics",
        },
      },
    )
    .group("/v1", (app) => app.use(publicV1Routes).use(protectedV1Routes));
}
