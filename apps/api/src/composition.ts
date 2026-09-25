import {
  createDeepSeekWordInsightProvider,
  createOpenAiWordInsightProvider,
} from "../../../infra/ai/src/word-insight-provider";
import { createFirebaseIdTokenVerifier } from "../../../infra/auth/src/firebase-token-verifier";
import { createJwtTokenService } from "../../../infra/auth/src/jwt-token-service";
import { createTestFirebaseTokenVerifier } from "../../../infra/auth/src/test-token-verifier";
import {
  createBillingSkuCatalog,
  createNativeReceiptVerifier,
  createNativeWebhookVerifier,
  createTestReceiptVerifier,
  createTestWebhookVerifier,
} from "../../../infra/billing/src";
import { createMemoryCache } from "../../../infra/cache/src/cache";
import { createRedisCache } from "../../../infra/cache/src/redis";
import { createDb } from "../../../infra/database/src/client";
import { createAppMetaRepo } from "../../../infra/database/src/repos/app-meta/app-meta.repo";
import { createBillingRepo } from "../../../infra/database/src/repos/billing/billing.repo";
import { createExercisesRepo } from "../../../infra/database/src/repos/exercises/exercises.repo";
import { createAuthSessionRepo } from "../../../infra/database/src/repos/social-auth/auth-sessions.repo";
import { createSocialIdentityRepo } from "../../../infra/database/src/repos/social-auth/social-identities.repo";
import { createUsersRepo } from "../../../infra/database/src/repos/users/users.repo";
import { createWordInsightExplainJobRepo } from "../../../infra/database/src/repos/word-insight/word-insight-jobs.repo";
import { createWordInsightUsageRepo } from "../../../infra/database/src/repos/word-insight/word-insight-usage.repo";
import {
  type EventBus,
  createInMemoryBus,
  createNatsJetStreamBus,
} from "../../../infra/events/src/bus";
import { createOutboxPublisher } from "../../../infra/events/src/outbox-publisher";
import { createLogger } from "../../../infra/logger/src/logger";
import { createRedisClient } from "../../../infra/redis/src/client";
import { createRedisRateLimitStore } from "../../../infra/redis/src/rate-limit-store";
import {
  createMemoryRequestLockStore,
  createRedisRequestLockStore,
} from "../../../infra/redis/src/request-lock-store";
import type { AppMetaPublicContract } from "../../../modules/app-meta/src/public-contract";
import { createAppMetaPublicContract } from "../../../modules/app-meta/src/public-contract";
import type { BillingPublicContract } from "../../../modules/billing/src/public-contract";
import { createBillingPublicContract } from "../../../modules/billing/src/public-contract";
import type { ExerciseWordSource } from "../../../modules/exercises/src/ports/word-source";
import type { ExercisesPublicContract } from "../../../modules/exercises/src/public-contract";
import { createExercisesPublicContract } from "../../../modules/exercises/src/public-contract";
import type { SocialAuthPublicContract } from "../../../modules/social-auth/src/public-contract";
import { createSocialAuthPublicContract } from "../../../modules/social-auth/src/public-contract";
import { createUsersPublicContract } from "../../../modules/users/src/public-contract";
import type { WordInsightPublicContract } from "../../../modules/word-insight/src/public-contract";
import { createWordInsightPublicContract } from "../../../modules/word-insight/src/public-contract";
import type { Cache } from "../../../packages/core/src/cache";
import { loadEnv } from "../../../packages/core/src/config/env";
import { createMetrics } from "../../../packages/core/src/http/middleware/metrics";

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function normalizeMetricValue(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function readNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const values: string[] = [];
  for (const item of value) {
    const parsed = readNonEmptyString(item);
    if (parsed) values.push(parsed);
  }
  return values;
}

async function pingRedis(
  redis: { ping: () => Promise<unknown> },
  timeoutMs = 300,
): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      redis.ping(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("redis_ping_timeout")), timeoutMs);
      }),
    ]);
    return true;
  } catch {
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function buildComposition() {
  const env = loadEnv();
  const isProduction = env.NODE_ENV === "production";
  const isDevelopment = env.NODE_ENV === "development";
  const logger = createLogger(env.LOG_LEVEL);
  const metrics = createMetrics();
  const dbClient = createDb(env.DATABASE_URL);
  const db = dbClient.db;
  const sql = dbClient.sql;
  const usersRepo = createUsersRepo(dbClient.db, {
    defaultHomeRegion: env.HOME_REGION_DEFAULT,
    regionShardCount: env.REGION_SHARD_COUNT,
  });
  const appMetaRepo = createAppMetaRepo(dbClient.db);
  const billingRepo = createBillingRepo(dbClient.db, {
    defaultFreeBasic: env.CREDITS_DEFAULT_FREE_BASIC,
    defaultFreeAdvanced: env.CREDITS_DEFAULT_FREE_ADVANCED,
    defaultPaidBasicCap: env.CREDITS_PAID_BASIC_CAP,
    defaultPaidAdvancedCap: env.CREDITS_PAID_ADVANCED_CAP,
    monthlyTopupIntervalDays: env.CREDITS_MONTHLY_TOPUP_INTERVAL_DAYS,
  });
  const wordInsightUsageRepo = createWordInsightUsageRepo(dbClient.db, {
    defaultFreeBasic: env.CREDITS_DEFAULT_FREE_BASIC,
    defaultFreeAdvanced: env.CREDITS_DEFAULT_FREE_ADVANCED,
    paidBasicCap: env.CREDITS_PAID_BASIC_CAP,
    paidAdvancedCap: env.CREDITS_PAID_ADVANCED_CAP,
    monthlyPaidBasicTopup: env.CREDITS_MONTHLY_PAID_BASIC_TOPUP,
    monthlyPaidAdvancedTopup: env.CREDITS_MONTHLY_PAID_ADVANCED_TOPUP,
    monthlyTopupIntervalDays: env.CREDITS_MONTHLY_TOPUP_INTERVAL_DAYS,
  });
  const wordInsightJobRepo = createWordInsightExplainJobRepo(dbClient.db, {
    defaultHomeRegion: env.HOME_REGION_DEFAULT,
    regionShardCount: env.REGION_SHARD_COUNT,
  });

  let redis: ReturnType<typeof createRedisClient> | undefined;
  let redisAvailable = false;

  const useRedisInTest = process.env.TEST_USE_REDIS === "true";
  if (env.NODE_ENV === "test" && !useRedisInTest) {
    logger.warn({ msg: "redis_disabled_in_test_using_memory_fallback" });
  } else {
    redis = createRedisClient(env.REDIS_URL);
    redisAvailable = await pingRedis(redis);

    if (!redisAvailable && (isProduction || isDevelopment)) {
      throw new Error("REDIS_URL is configured but Redis is not reachable");
    }

    if (!redisAvailable) {
      logger.warn({ msg: "redis_unavailable_using_memory_fallback" });
      const maybeRedis = redis as { close?: () => void };
      if (typeof maybeRedis?.close === "function") {
        maybeRedis.close();
      }
      redis = undefined;
    }
  }

  const rateLimitStore =
    redisAvailable && redis ? createRedisRateLimitStore(redis, env.RATE_LIMIT_PREFIX) : undefined;
  const requestLockStore =
    redisAvailable && redis
      ? createRedisRequestLockStore(redis, env.REQUEST_LOCK_PREFIX)
      : createMemoryRequestLockStore();

  if (!redisAvailable) {
    logger.warn({ msg: "request_lock_using_memory_store" });
  }

  const cache: Cache =
    redisAvailable && redis
      ? createRedisCache(redis, env.CACHE_PREFIX)
      : (() => {
          const memory = createMemoryCache<unknown>();
          return {
            get<T>(key: string) {
              return memory.get(key) as Promise<T | undefined>;
            },
            set<T>(key: string, value: T, ttlMs?: number) {
              return memory.set(key, value, ttlMs);
            },
            delete(key: string) {
              return memory.delete(key);
            },
          };
        })();

  let eventBus: EventBus = createInMemoryBus();
  let eventBusProvider: "in-memory" | "nats-jetstream" = "in-memory";

  if (!env.NATS_URL) {
    if (isProduction) {
      throw new Error("NATS_URL is required in production");
    }
    logger.warn({ msg: "NATS_URL missing, using in-memory event bus" });
  } else {
    try {
      eventBus = await createNatsJetStreamBus(env.NATS_URL, {
        streamName: "APP_EVENTS",
        subjectPrefix: "events",
        onError(error, context) {
          logger.error({
            msg: "event_bus_error",
            phase: context.phase,
            event: context.event,
            error: formatError(error),
          });
        },
      });
      eventBusProvider = "nats-jetstream";
      logger.info({
        msg: "event_bus_ready",
        provider: "nats-jetstream",
        streamName: "APP_EVENTS",
        servers: env.NATS_URL,
      });
    } catch (error) {
      if (isProduction) {
        throw new Error(`event_bus_init_failed: ${formatError(error)}`);
      }
      logger.error({
        msg: "event_bus_init_failed_using_inmemory",
        error: formatError(error),
      });
    }
  }

  const outboxPublisher = createOutboxPublisher({
    sql,
    eventBus,
    logger,
  });

  if (isProduction && !env.BILLING_WEBHOOK_SECRET) {
    throw new Error("BILLING_WEBHOOK_SECRET is required in production");
  }
  if (isProduction && env.BILLING_ALLOW_TEST_RECEIPTS) {
    throw new Error("BILLING_ALLOW_TEST_RECEIPTS must be false in production");
  }

  const usersContract = createUsersPublicContract(usersRepo);
  const appMeta: AppMetaPublicContract = createAppMetaPublicContract({
    repo: appMetaRepo,
    bootstrapConfig: {
      ios: {
        minimumSupportedVersion: env.MOBILE_MIN_VERSION_IOS,
        latestVersion: env.MOBILE_LATEST_VERSION_IOS,
        storeUrl: env.MOBILE_STORE_URL_IOS,
      },
      android: {
        minimumSupportedVersion: env.MOBILE_MIN_VERSION_ANDROID,
        latestVersion: env.MOBILE_LATEST_VERSION_ANDROID,
        storeUrl: env.MOBILE_STORE_URL_ANDROID,
      },
      updateTitle: env.MOBILE_UPDATE_TITLE,
      updateMessage: env.MOBILE_UPDATE_MESSAGE,
    },
  });
  const billingSkuCatalog = createBillingSkuCatalog({
    catalogJson: env.BILLING_SKU_CATALOG_JSON,
  });
  const billingVerifier = env.BILLING_ALLOW_TEST_RECEIPTS
    ? createTestReceiptVerifier({
        allowTestReceipts: true,
      })
    : createNativeReceiptVerifier({
        appleJwksUrl: env.BILLING_APPLE_JWKS_URL,
        appleBundleId: env.BILLING_APPLE_BUNDLE_ID,
        googlePlayPublicKey: env.BILLING_GOOGLE_PLAY_PUBLIC_KEY,
        googlePackageName: env.BILLING_GOOGLE_PACKAGE_NAME,
        googleRequireSignature: env.BILLING_GOOGLE_REQUIRE_SIGNATURE,
      });
  const billingWebhookVerifier = env.BILLING_ALLOW_TEST_RECEIPTS
    ? createTestWebhookVerifier({
        webhookSecret: env.BILLING_WEBHOOK_SECRET,
      })
    : createNativeWebhookVerifier({
        appleJwksUrl: env.BILLING_APPLE_JWKS_URL,
        appleBundleId: env.BILLING_APPLE_BUNDLE_ID,
        googlePubSubJwksUrl: env.BILLING_GOOGLE_PUBSUB_JWKS_URL,
        googlePubSubAudience: env.BILLING_GOOGLE_PUBSUB_AUDIENCE,
        googlePubSubServiceAccountEmail: env.BILLING_GOOGLE_PUBSUB_SERVICE_ACCOUNT_EMAIL,
        googlePubSubIssuers: env.BILLING_GOOGLE_PUBSUB_ISSUERS,
      });
  if (
    !env.BILLING_ALLOW_TEST_RECEIPTS &&
    (!env.BILLING_GOOGLE_PUBSUB_AUDIENCE || !env.BILLING_GOOGLE_PUBSUB_SERVICE_ACCOUNT_EMAIL)
  ) {
    logger.warn({
      msg: "billing_google_webhook_auth_not_configured",
      required: ["BILLING_GOOGLE_PUBSUB_AUDIENCE", "BILLING_GOOGLE_PUBSUB_SERVICE_ACCOUNT_EMAIL"],
    });
  }
  const billing: BillingPublicContract = createBillingPublicContract({
    verifier: billingVerifier,
    webhookVerifier: billingWebhookVerifier,
    skuCatalog: billingSkuCatalog,
    purchases: billingRepo,
  });
  const wordInsightLanguagePreferences = {
    async getByUserId(userId: string) {
      try {
        const preferences = await usersContract.getLanguagePreferences(userId);
        return {
          l1Language: preferences.l1Language,
          l2Language: preferences.l2Language,
        };
      } catch {
        return null;
      }
    },
  };
  const wordInsightProvider =
    env.WORD_INSIGHT_PROVIDER === "openai"
      ? (() => {
          if (!env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is required when WORD_INSIGHT_PROVIDER=openai");
          }
          logger.info({
            msg: "word_insight_provider_configured",
            provider: "openai",
            model: env.OPENAI_MODEL,
            basicModel: env.OPENAI_BASIC_MODEL,
          });
          return createOpenAiWordInsightProvider({
            apiKey: env.OPENAI_API_KEY,
            model: env.OPENAI_MODEL,
            basicModel: env.OPENAI_BASIC_MODEL,
            baseUrl: env.OPENAI_BASE_URL,
            timeoutMs: env.OPENAI_TIMEOUT_MS,
            logger,
          });
        })()
      : (() => {
          if (!env.DEEPSEEK_API_KEY) {
            throw new Error("DEEPSEEK_API_KEY is required when WORD_INSIGHT_PROVIDER=deepseek");
          }
          logger.info({
            msg: "word_insight_provider_configured",
            provider: "deepseek",
            model: env.DEEPSEEK_MODEL,
          });
          return createDeepSeekWordInsightProvider({
            apiKey: env.DEEPSEEK_API_KEY,
            model: env.DEEPSEEK_MODEL,
            baseUrl: env.DEEPSEEK_BASE_URL,
            timeoutMs: env.DEEPSEEK_TIMEOUT_MS,
            logger,
          });
        })();

  const wordInsight: WordInsightPublicContract = createWordInsightPublicContract({
    languagePreferences: wordInsightLanguagePreferences,
    provider: wordInsightProvider,
    usageRepo: wordInsightUsageRepo,
    jobs: wordInsightJobRepo,
    defaults: {
      sourceLang: env.WORD_INSIGHT_DEFAULT_SOURCE_LANG,
      targetLang: env.WORD_INSIGHT_DEFAULT_TARGET_LANG,
      maxSentenceChars: env.WORD_INSIGHT_MAX_SENTENCE_CHARS,
      maxSelectedWordChars: env.WORD_INSIGHT_MAX_SELECTED_WORD_CHARS,
    },
  });
  const exercisesRepo = createExercisesRepo(dbClient.db);
  const exerciseWordSource: ExerciseWordSource = {
    async listActiveLearningItems(input) {
      const items = await wordInsight.listLearningItems({
        userId: input.userId,
        status: "active",
        limit: input.limit,
        groupIds: input.groupIds,
      });
      return items.map((item) => ({
        id: item.id,
        lemma: item.lemma,
        vocab: item.vocab,
        targetMeaning: item.targetMeaning,
        lastMeaning: item.lastMeaning,
        definitionL2: item.definitionL2,
        lastSeenMode: item.lastSeenMode,
        createdAt: item.createdAt,
      }));
    },
    async getLearningItemDetail(input) {
      const detail = await wordInsight.getLearningItemDetail({
        userId: input.userId,
        itemId: input.itemId,
      });
      const responsePayload = detail.latestLookup?.responsePayload;
      const insight =
        responsePayload &&
        typeof responsePayload === "object" &&
        "insight" in responsePayload &&
        responsePayload.insight &&
        typeof responsePayload.insight === "object"
          ? (responsePayload.insight as Record<string, unknown>)
          : undefined;

      return {
        id: detail.item.id,
        sentence:
          readNonEmptyString(detail.latestLookup?.sentence) ??
          readNonEmptyString(insight?.exampleSentence),
        translatedExample: readNonEmptyString(insight?.translatedExample),
        synonyms: readStringArray(insight?.synonyms),
        meaning:
          readNonEmptyString(detail.latestLookup?.responseSummary?.meaning) ??
          readNonEmptyString(insight?.meaning),
        shortExplanation:
          readNonEmptyString(detail.latestLookup?.responseSummary?.shortExplanation) ??
          readNonEmptyString(insight?.shortExplanation),
      };
    },
  };
  const exercises: ExercisesPublicContract = createExercisesPublicContract({
    repo: exercisesRepo,
    wordSource: exerciseWordSource,
    languagePreferences: wordInsightLanguagePreferences,
    defaults: {
      totalQuestions: env.EXERCISES_DEFAULT_TOTAL_QUESTIONS,
      maxTotalQuestions: env.EXERCISES_MAX_TOTAL_QUESTIONS,
      todayMinimum: env.EXERCISES_DEFAULT_TODAY_MINIMUM,
      maxTodayMinimum: env.EXERCISES_MAX_TODAY_MINIMUM,
      maxLearningItemsScan: env.EXERCISES_MAX_LEARNING_ITEMS_SCAN,
    },
  });

  const identities = createSocialIdentityRepo(db);
  const sessions = createAuthSessionRepo(db);

  const jwtSecret =
    env.JWT_SECRET ?? (env.NODE_ENV === "test" ? "test-jwt-secret-dev-only" : undefined);
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required when AUTH_MODE=firebase");
  }

  const tokens = createJwtTokenService({
    secret: jwtSecret,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    accessTokenTtlSec: env.JWT_ACCESS_TOKEN_TTL_SEC,
    refreshTokenTtlSec: env.JWT_REFRESH_TOKEN_TTL_SEC,
  });

  const verifier =
    env.NODE_ENV === "test"
      ? createTestFirebaseTokenVerifier()
      : createFirebaseIdTokenVerifier({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY,
          serviceAccountJson: env.FIREBASE_SERVICE_ACCOUNT_JSON,
        });

  const socialAuth: SocialAuthPublicContract = createSocialAuthPublicContract({
    users: usersContract,
    identities,
    sessions,
    tokens,
    verifier,
    reviewLogin: {
      enabled: env.REVIEW_LOGIN_ENABLED,
      email: env.REVIEW_LOGIN_EMAIL,
      password: env.REVIEW_LOGIN_PASSWORD,
    },
  });

  logger.info({
    msg: "auth_mode_enabled",
    mode: "firebase",
    identityStore: "postgres",
    sessionStore: "postgres",
  });

  async function checkReadiness() {
    let ready = true;
    let redisStatus: "up" | "down" | "skipped" = "skipped";
    let databaseStatus: "up" | "down" | "skipped" = "down";
    let eventBusStatus: "up" | "down" | "skipped" = "skipped";

    if (redis) {
      try {
        await redis.ping();
        redisStatus = "up";
      } catch {
        redisStatus = "down";
        ready = false;
      }
    } else {
      redisStatus = "down";
      ready = false;
    }

    try {
      await sql`SELECT 1`;
      databaseStatus = "up";
    } catch {
      databaseStatus = "down";
      ready = false;
    }

    if (env.NATS_URL) {
      eventBusStatus = eventBusProvider === "nats-jetstream" ? "up" : "down";
      if (eventBusStatus === "down") {
        ready = false;
      }
    }

    return {
      ready,
      checks: {
        redis: redisStatus,
        database: databaseStatus,
        eventBus: eventBusStatus,
      },
    };
  }

  async function getWordInsightQueueMetrics() {
    const queueRows = await sql<
      Array<{
        queued_count: number | string;
        processing_count: number | string;
        oldest_queued_age_seconds: number | string | null;
      }>
    >`
      SELECT
        COUNT(*) FILTER (WHERE status = 'queued')::int AS queued_count,
        COUNT(*) FILTER (WHERE status = 'processing')::int AS processing_count,
        COALESCE(
          EXTRACT(
            EPOCH FROM (
              NOW() - (MIN(created_at) FILTER (WHERE status = 'queued'))
            )
          ),
          0
        )::double precision AS oldest_queued_age_seconds
      FROM word_insight_jobs
    `;
    const queueRow = queueRows[0];

    const waitRows = await sql<
      Array<{
        wait_p50_seconds: number | string | null;
        wait_p95_seconds: number | string | null;
        wait_sample_count: number | string;
      }>
    >`
      SELECT
        COALESCE(
          percentile_cont(0.5) WITHIN GROUP (
            ORDER BY EXTRACT(EPOCH FROM (started_at - created_at))
          ),
          0
        )::double precision AS wait_p50_seconds,
        COALESCE(
          percentile_cont(0.95) WITHIN GROUP (
            ORDER BY EXTRACT(EPOCH FROM (started_at - created_at))
          ),
          0
        )::double precision AS wait_p95_seconds,
        COUNT(*)::int AS wait_sample_count
      FROM word_insight_jobs
      WHERE started_at IS NOT NULL
        AND started_at >= NOW() - INTERVAL '30 minutes'
    `;
    const waitRow = waitRows[0];

    const processingRows = await sql<
      Array<{
        processing_p95_seconds: number | string | null;
        total_p95_seconds: number | string | null;
        processing_sample_count: number | string;
      }>
    >`
      SELECT
        COALESCE(
          percentile_cont(0.95) WITHIN GROUP (
            ORDER BY EXTRACT(EPOCH FROM (finished_at - started_at))
          ),
          0
        )::double precision AS processing_p95_seconds,
        COALESCE(
          percentile_cont(0.95) WITHIN GROUP (
            ORDER BY EXTRACT(EPOCH FROM (finished_at - created_at))
          ),
          0
        )::double precision AS total_p95_seconds,
        COUNT(*)::int AS processing_sample_count
      FROM word_insight_jobs
      WHERE finished_at IS NOT NULL
        AND started_at IS NOT NULL
        AND finished_at >= NOW() - INTERVAL '30 minutes'
    `;
    const processingRow = processingRows[0];

    const throughputRows = await sql<
      Array<{
        completed_5m: number | string;
        failed_5m: number | string;
        oldest_processing_age_seconds: number | string | null;
      }>
    >`
      SELECT
        COUNT(*) FILTER (
          WHERE status = 'completed'
            AND finished_at >= NOW() - INTERVAL '5 minutes'
        )::int AS completed_5m,
        COUNT(*) FILTER (
          WHERE status = 'failed'
            AND finished_at >= NOW() - INTERVAL '5 minutes'
        )::int AS failed_5m,
        COALESCE(
          EXTRACT(
            EPOCH FROM (
              NOW() - (MIN(started_at) FILTER (WHERE status = 'processing'))
            )
          ),
          0
        )::double precision AS oldest_processing_age_seconds
      FROM word_insight_jobs
    `;
    const throughputRow = throughputRows[0];

    return {
      queuedCount: normalizeMetricValue(queueRow?.queued_count),
      processingCount: normalizeMetricValue(queueRow?.processing_count),
      oldestQueuedAgeSeconds: normalizeMetricValue(queueRow?.oldest_queued_age_seconds),
      waitP50Seconds: normalizeMetricValue(waitRow?.wait_p50_seconds),
      waitP95Seconds: normalizeMetricValue(waitRow?.wait_p95_seconds),
      waitSampleCount: normalizeMetricValue(waitRow?.wait_sample_count),
      processingP95Seconds: normalizeMetricValue(processingRow?.processing_p95_seconds),
      totalP95Seconds: normalizeMetricValue(processingRow?.total_p95_seconds),
      processingSampleCount: normalizeMetricValue(processingRow?.processing_sample_count),
      completed5m: normalizeMetricValue(throughputRow?.completed_5m),
      failed5m: normalizeMetricValue(throughputRow?.failed_5m),
      oldestProcessingAgeSeconds: normalizeMetricValue(
        throughputRow?.oldest_processing_age_seconds,
      ),
    };
  }

  return {
    env,
    logger,
    metrics,
    redis,
    usersRepo,
    usersContract,
    appMeta,
    billing,
    wordInsight,
    exercises,
    socialAuth,
    checkReadiness,
    getWordInsightQueueMetrics,
    sql,
    rateLimitStore,
    requestLockStore,
    cache,
    eventBus,
    outboxPublisher,
  };
}
