import {
  CACHE_TTL_MS,
  MAX_BODY_BYTES,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from "./constants";

export type LogLevel = "debug" | "info" | "warn" | "error";
export type AuthMode = "firebase";
export type WordInsightProviderMode = "openai" | "deepseek";

export type Env = {
  NODE_ENV: string;
  PORT: number;
  LOG_LEVEL: LogLevel;
  AUTH_MODE: AuthMode;
  REVIEW_LOGIN_ENABLED: boolean;
  REVIEW_LOGIN_EMAIL?: string;
  REVIEW_LOGIN_PASSWORD?: string;
  APP_REGION: string;
  HOME_REGION_DEFAULT: string;
  REGION_SHARD_COUNT: number;
  JWT_SECRET?: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  JWT_ACCESS_TOKEN_TTL_SEC: number;
  JWT_REFRESH_TOKEN_TTL_SEC: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  NATS_URL?: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  CORS_ORIGIN: string[];
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_PREFIX: string;
  REQUEST_LOCK_TTL_MS: number;
  REQUEST_LOCK_PREFIX: string;
  WS_WORD_INSIGHT_IDLE_TIMEOUT_MS: number;
  WS_WORD_INSIGHT_HEARTBEAT_INTERVAL_MS: number;
  WS_WORD_INSIGHT_MAX_CONNECTIONS_PER_USER: number;
  WORD_INSIGHT_JOB_RUNNER_ENABLED: boolean;
  WORD_INSIGHT_JOB_CONCURRENCY: number;
  WORD_INSIGHT_JOB_TICK_MS: number;
  WORD_INSIGHT_PROVIDER: WordInsightProviderMode;
  WORD_INSIGHT_DEFAULT_SOURCE_LANG: string;
  WORD_INSIGHT_DEFAULT_TARGET_LANG: string;
  WORD_INSIGHT_MAX_SENTENCE_CHARS: number;
  WORD_INSIGHT_MAX_SELECTED_WORD_CHARS: number;
  EXERCISES_DEFAULT_TOTAL_QUESTIONS: number;
  EXERCISES_MAX_TOTAL_QUESTIONS: number;
  EXERCISES_DEFAULT_TODAY_MINIMUM: number;
  EXERCISES_MAX_TODAY_MINIMUM: number;
  EXERCISES_MAX_LEARNING_ITEMS_SCAN: number;
  CREDITS_DEFAULT_FREE_BASIC: number;
  CREDITS_DEFAULT_FREE_ADVANCED: number;
  CREDITS_PAID_BASIC_CAP: number;
  CREDITS_PAID_ADVANCED_CAP: number;
  CREDITS_MONTHLY_PAID_BASIC_TOPUP: number;
  CREDITS_MONTHLY_PAID_ADVANCED_TOPUP: number;
  CREDITS_MONTHLY_TOPUP_INTERVAL_DAYS: number;
  BILLING_WEBHOOK_SECRET?: string;
  BILLING_ALLOW_TEST_RECEIPTS: boolean;
  BILLING_SKU_CATALOG_JSON?: string;
  BILLING_APPLE_JWKS_URL?: string;
  BILLING_APPLE_BUNDLE_ID?: string;
  BILLING_GOOGLE_PLAY_PUBLIC_KEY?: string;
  BILLING_GOOGLE_PACKAGE_NAME?: string;
  BILLING_GOOGLE_REQUIRE_SIGNATURE: boolean;
  BILLING_GOOGLE_PUBSUB_JWKS_URL?: string;
  BILLING_GOOGLE_PUBSUB_AUDIENCE?: string;
  BILLING_GOOGLE_PUBSUB_SERVICE_ACCOUNT_EMAIL?: string;
  BILLING_GOOGLE_PUBSUB_ISSUERS: string[];
  OPENAI_API_KEY?: string;
  OPENAI_MODEL: string;
  OPENAI_BASIC_MODEL: string;
  OPENAI_BASE_URL: string;
  OPENAI_TIMEOUT_MS: number;
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL: string;
  DEEPSEEK_BASE_URL: string;
  DEEPSEEK_TIMEOUT_MS: number;
  CACHE_TTL_MS: number;
  CACHE_PREFIX: string;
  TRUST_PROXY: boolean;
  METRICS_ENABLED: boolean;
  MAX_BODY_BYTES: number;
  PAGINATION_DEFAULT_LIMIT: number;
  PAGINATION_MAX_LIMIT: number;
  MOBILE_UPDATE_TITLE: string;
  MOBILE_UPDATE_MESSAGE: string;
  MOBILE_MIN_VERSION_IOS?: string;
  MOBILE_LATEST_VERSION_IOS?: string;
  MOBILE_STORE_URL_IOS?: string;
  MOBILE_MIN_VERSION_ANDROID?: string;
  MOBILE_LATEST_VERSION_ANDROID?: string;
  MOBILE_STORE_URL_ANDROID?: string;
};

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env: ${key}`);
  return value;
}

function optional(key: string): string | undefined {
  const value = process.env[key];
  if (!value) return undefined;
  return value;
}

function parseIntEnv(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid number env: ${value}`);
  return parsed;
}

function parsePositiveIntEnv(value: string | undefined, fallback: number, key: string): number {
  const parsed = parseIntEnv(value, fallback);
  if (parsed <= 0) {
    throw new Error(`${key} must be greater than 0`);
  }
  return Math.floor(parsed);
}

function parseNonNegativeIntEnv(value: string | undefined, fallback: number, key: string): number {
  const parsed = parseIntEnv(value, fallback);
  if (parsed < 0) {
    throw new Error(`${key} must be greater than or equal to 0`);
  }
  return Math.floor(parsed);
}

function parseBoolEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "yes";
}

function parseListEnv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseAuthMode(value: string): AuthMode {
  if (value !== "firebase") {
    throw new Error("AUTH_MODE must be 'firebase'");
  }
  return value;
}

function parseWordInsightProviderMode(value: string | undefined): WordInsightProviderMode {
  if (!value) return "openai";
  if (value === "openai" || value === "deepseek") return value;
  throw new Error("WORD_INSIGHT_PROVIDER must be 'openai' or 'deepseek'");
}

function parseRegionEnv(value: string | undefined, fallback: string, key: string): string {
  const resolved = (value ?? fallback).trim().toLowerCase();
  if (resolved.length === 0) {
    throw new Error(`${key} must be a non-empty string`);
  }
  if (!/^[a-z0-9-]{2,32}$/.test(resolved)) {
    throw new Error(`${key} has invalid format`);
  }
  return resolved;
}

let cached: Env | undefined;

export function loadEnv(): Env {
  if (cached) return cached;

  const NODE_ENV = required("NODE_ENV");
  const PORT = parseIntEnv(required("PORT"), 3000);
  const LOG_LEVEL = required("LOG_LEVEL") as LogLevel;
  const allowedLevels: LogLevel[] = ["debug", "info", "warn", "error"];
  if (!allowedLevels.includes(LOG_LEVEL)) {
    throw new Error(`Invalid LOG_LEVEL: ${LOG_LEVEL}`);
  }

  const env: Env = {
    NODE_ENV,
    PORT,
    LOG_LEVEL,
    AUTH_MODE: parseAuthMode(required("AUTH_MODE")),
    REVIEW_LOGIN_ENABLED: parseBoolEnv(optional("REVIEW_LOGIN_ENABLED"), false),
    REVIEW_LOGIN_EMAIL: optional("REVIEW_LOGIN_EMAIL"),
    REVIEW_LOGIN_PASSWORD: optional("REVIEW_LOGIN_PASSWORD"),
    APP_REGION: parseRegionEnv(optional("APP_REGION"), "eu", "APP_REGION"),
    HOME_REGION_DEFAULT: parseRegionEnv(
      optional("HOME_REGION_DEFAULT"),
      "eu",
      "HOME_REGION_DEFAULT",
    ),
    REGION_SHARD_COUNT: parsePositiveIntEnv(
      optional("REGION_SHARD_COUNT"),
      16,
      "REGION_SHARD_COUNT",
    ),
    JWT_SECRET: optional("JWT_SECRET"),
    JWT_ISSUER: optional("JWT_ISSUER") ?? "vocorbit-server",
    JWT_AUDIENCE: optional("JWT_AUDIENCE") ?? "elysia-api",
    JWT_ACCESS_TOKEN_TTL_SEC: parsePositiveIntEnv(
      optional("JWT_ACCESS_TOKEN_TTL_SEC"),
      900,
      "JWT_ACCESS_TOKEN_TTL_SEC",
    ),
    JWT_REFRESH_TOKEN_TTL_SEC: parsePositiveIntEnv(
      optional("JWT_REFRESH_TOKEN_TTL_SEC"),
      2_592_000,
      "JWT_REFRESH_TOKEN_TTL_SEC",
    ),
    DATABASE_URL: required("DATABASE_URL"),
    REDIS_URL: required("REDIS_URL"),
    NATS_URL: optional("NATS_URL"),
    FIREBASE_PROJECT_ID: optional("FIREBASE_PROJECT_ID"),
    FIREBASE_CLIENT_EMAIL: optional("FIREBASE_CLIENT_EMAIL"),
    FIREBASE_PRIVATE_KEY: optional("FIREBASE_PRIVATE_KEY"),
    FIREBASE_SERVICE_ACCOUNT_JSON: optional("FIREBASE_SERVICE_ACCOUNT_JSON"),
    CORS_ORIGIN: parseListEnv(optional("CORS_ORIGIN")),
    RATE_LIMIT_WINDOW_MS: parseIntEnv(optional("RATE_LIMIT_WINDOW_MS"), RATE_LIMIT_WINDOW_MS),
    RATE_LIMIT_MAX: parseIntEnv(optional("RATE_LIMIT_MAX"), RATE_LIMIT_MAX),
    RATE_LIMIT_PREFIX: optional("RATE_LIMIT_PREFIX") ?? "rate",
    REQUEST_LOCK_TTL_MS: parsePositiveIntEnv(
      optional("REQUEST_LOCK_TTL_MS"),
      30_000,
      "REQUEST_LOCK_TTL_MS",
    ),
    REQUEST_LOCK_PREFIX: optional("REQUEST_LOCK_PREFIX") ?? "request-lock",
    WS_WORD_INSIGHT_IDLE_TIMEOUT_MS: parsePositiveIntEnv(
      optional("WS_WORD_INSIGHT_IDLE_TIMEOUT_MS"),
      120_000,
      "WS_WORD_INSIGHT_IDLE_TIMEOUT_MS",
    ),
    WS_WORD_INSIGHT_HEARTBEAT_INTERVAL_MS: parsePositiveIntEnv(
      optional("WS_WORD_INSIGHT_HEARTBEAT_INTERVAL_MS"),
      30_000,
      "WS_WORD_INSIGHT_HEARTBEAT_INTERVAL_MS",
    ),
    WS_WORD_INSIGHT_MAX_CONNECTIONS_PER_USER: parsePositiveIntEnv(
      optional("WS_WORD_INSIGHT_MAX_CONNECTIONS_PER_USER"),
      3,
      "WS_WORD_INSIGHT_MAX_CONNECTIONS_PER_USER",
    ),
    WORD_INSIGHT_JOB_RUNNER_ENABLED: parseBoolEnv(
      optional("WORD_INSIGHT_JOB_RUNNER_ENABLED"),
      true,
    ),
    WORD_INSIGHT_JOB_CONCURRENCY: parsePositiveIntEnv(
      optional("WORD_INSIGHT_JOB_CONCURRENCY"),
      4,
      "WORD_INSIGHT_JOB_CONCURRENCY",
    ),
    WORD_INSIGHT_JOB_TICK_MS: parsePositiveIntEnv(
      optional("WORD_INSIGHT_JOB_TICK_MS"),
      500,
      "WORD_INSIGHT_JOB_TICK_MS",
    ),
    WORD_INSIGHT_PROVIDER: parseWordInsightProviderMode(optional("WORD_INSIGHT_PROVIDER")),
    WORD_INSIGHT_DEFAULT_SOURCE_LANG: optional("WORD_INSIGHT_DEFAULT_SOURCE_LANG") ?? "en",
    WORD_INSIGHT_DEFAULT_TARGET_LANG: optional("WORD_INSIGHT_DEFAULT_TARGET_LANG") ?? "tr",
    WORD_INSIGHT_MAX_SENTENCE_CHARS: parsePositiveIntEnv(
      optional("WORD_INSIGHT_MAX_SENTENCE_CHARS"),
      280,
      "WORD_INSIGHT_MAX_SENTENCE_CHARS",
    ),
    WORD_INSIGHT_MAX_SELECTED_WORD_CHARS: parsePositiveIntEnv(
      optional("WORD_INSIGHT_MAX_SELECTED_WORD_CHARS"),
      120,
      "WORD_INSIGHT_MAX_SELECTED_WORD_CHARS",
    ),
    EXERCISES_DEFAULT_TOTAL_QUESTIONS: parsePositiveIntEnv(
      optional("EXERCISES_DEFAULT_TOTAL_QUESTIONS"),
      10,
      "EXERCISES_DEFAULT_TOTAL_QUESTIONS",
    ),
    EXERCISES_MAX_TOTAL_QUESTIONS: parsePositiveIntEnv(
      optional("EXERCISES_MAX_TOTAL_QUESTIONS"),
      30,
      "EXERCISES_MAX_TOTAL_QUESTIONS",
    ),
    EXERCISES_DEFAULT_TODAY_MINIMUM: parseNonNegativeIntEnv(
      optional("EXERCISES_DEFAULT_TODAY_MINIMUM"),
      5,
      "EXERCISES_DEFAULT_TODAY_MINIMUM",
    ),
    EXERCISES_MAX_TODAY_MINIMUM: parseNonNegativeIntEnv(
      optional("EXERCISES_MAX_TODAY_MINIMUM"),
      20,
      "EXERCISES_MAX_TODAY_MINIMUM",
    ),
    EXERCISES_MAX_LEARNING_ITEMS_SCAN: parsePositiveIntEnv(
      optional("EXERCISES_MAX_LEARNING_ITEMS_SCAN"),
      300,
      "EXERCISES_MAX_LEARNING_ITEMS_SCAN",
    ),
    CREDITS_DEFAULT_FREE_BASIC: parseNonNegativeIntEnv(
      optional("CREDITS_DEFAULT_FREE_BASIC"),
      10,
      "CREDITS_DEFAULT_FREE_BASIC",
    ),
    CREDITS_DEFAULT_FREE_ADVANCED: parseNonNegativeIntEnv(
      optional("CREDITS_DEFAULT_FREE_ADVANCED"),
      3,
      "CREDITS_DEFAULT_FREE_ADVANCED",
    ),
    CREDITS_PAID_BASIC_CAP: parseNonNegativeIntEnv(
      optional("CREDITS_PAID_BASIC_CAP"),
      200,
      "CREDITS_PAID_BASIC_CAP",
    ),
    CREDITS_PAID_ADVANCED_CAP: parseNonNegativeIntEnv(
      optional("CREDITS_PAID_ADVANCED_CAP"),
      100,
      "CREDITS_PAID_ADVANCED_CAP",
    ),
    CREDITS_MONTHLY_PAID_BASIC_TOPUP: parseNonNegativeIntEnv(
      optional("CREDITS_MONTHLY_PAID_BASIC_TOPUP"),
      0,
      "CREDITS_MONTHLY_PAID_BASIC_TOPUP",
    ),
    CREDITS_MONTHLY_PAID_ADVANCED_TOPUP: parseNonNegativeIntEnv(
      optional("CREDITS_MONTHLY_PAID_ADVANCED_TOPUP"),
      0,
      "CREDITS_MONTHLY_PAID_ADVANCED_TOPUP",
    ),
    CREDITS_MONTHLY_TOPUP_INTERVAL_DAYS: parsePositiveIntEnv(
      optional("CREDITS_MONTHLY_TOPUP_INTERVAL_DAYS"),
      30,
      "CREDITS_MONTHLY_TOPUP_INTERVAL_DAYS",
    ),
    BILLING_WEBHOOK_SECRET: optional("BILLING_WEBHOOK_SECRET"),
    BILLING_ALLOW_TEST_RECEIPTS: parseBoolEnv(
      optional("BILLING_ALLOW_TEST_RECEIPTS"),
      NODE_ENV !== "production",
    ),
    BILLING_SKU_CATALOG_JSON: optional("BILLING_SKU_CATALOG_JSON"),
    BILLING_APPLE_JWKS_URL: optional("BILLING_APPLE_JWKS_URL"),
    BILLING_APPLE_BUNDLE_ID: optional("BILLING_APPLE_BUNDLE_ID"),
    BILLING_GOOGLE_PLAY_PUBLIC_KEY: optional("BILLING_GOOGLE_PLAY_PUBLIC_KEY"),
    BILLING_GOOGLE_PACKAGE_NAME: optional("BILLING_GOOGLE_PACKAGE_NAME"),
    BILLING_GOOGLE_REQUIRE_SIGNATURE: parseBoolEnv(
      optional("BILLING_GOOGLE_REQUIRE_SIGNATURE"),
      true,
    ),
    BILLING_GOOGLE_PUBSUB_JWKS_URL: optional("BILLING_GOOGLE_PUBSUB_JWKS_URL"),
    BILLING_GOOGLE_PUBSUB_AUDIENCE: optional("BILLING_GOOGLE_PUBSUB_AUDIENCE"),
    BILLING_GOOGLE_PUBSUB_SERVICE_ACCOUNT_EMAIL: optional(
      "BILLING_GOOGLE_PUBSUB_SERVICE_ACCOUNT_EMAIL",
    ),
    BILLING_GOOGLE_PUBSUB_ISSUERS: parseListEnv(optional("BILLING_GOOGLE_PUBSUB_ISSUERS")),
    OPENAI_API_KEY: optional("OPENAI_API_KEY"),
    OPENAI_MODEL: optional("OPENAI_MODEL") ?? "gpt-4o-mini",
    OPENAI_BASIC_MODEL: optional("OPENAI_BASIC_MODEL") ?? (optional("OPENAI_MODEL") ?? "gpt-4o-mini"),
    OPENAI_BASE_URL: optional("OPENAI_BASE_URL") ?? "https://api.openai.com/v1",
    OPENAI_TIMEOUT_MS: parsePositiveIntEnv(
      optional("OPENAI_TIMEOUT_MS"),
      15_000,
      "OPENAI_TIMEOUT_MS",
    ),
    DEEPSEEK_API_KEY: optional("DEEPSEEK_API_KEY"),
    DEEPSEEK_MODEL: optional("DEEPSEEK_MODEL") ?? "deepseek-chat",
    DEEPSEEK_BASE_URL: optional("DEEPSEEK_BASE_URL") ?? "https://api.deepseek.com/v1",
    DEEPSEEK_TIMEOUT_MS: parsePositiveIntEnv(
      optional("DEEPSEEK_TIMEOUT_MS"),
      15_000,
      "DEEPSEEK_TIMEOUT_MS",
    ),
    CACHE_TTL_MS: parseIntEnv(optional("CACHE_TTL_MS"), CACHE_TTL_MS),
    CACHE_PREFIX: optional("CACHE_PREFIX") ?? "cache",
    TRUST_PROXY: parseBoolEnv(optional("TRUST_PROXY"), false),
    METRICS_ENABLED: parseBoolEnv(optional("METRICS_ENABLED"), true),
    MAX_BODY_BYTES: parseIntEnv(optional("MAX_BODY_BYTES"), MAX_BODY_BYTES),
    PAGINATION_DEFAULT_LIMIT,
    PAGINATION_MAX_LIMIT,
    MOBILE_UPDATE_TITLE: optional("MOBILE_UPDATE_TITLE") ?? "New update available",
    MOBILE_UPDATE_MESSAGE:
      optional("MOBILE_UPDATE_MESSAGE") ??
      "Please update to the latest version for the best experience.",
    MOBILE_MIN_VERSION_IOS: optional("MOBILE_MIN_VERSION_IOS"),
    MOBILE_LATEST_VERSION_IOS: optional("MOBILE_LATEST_VERSION_IOS"),
    MOBILE_STORE_URL_IOS: optional("MOBILE_STORE_URL_IOS"),
    MOBILE_MIN_VERSION_ANDROID: optional("MOBILE_MIN_VERSION_ANDROID"),
    MOBILE_LATEST_VERSION_ANDROID: optional("MOBILE_LATEST_VERSION_ANDROID"),
    MOBILE_STORE_URL_ANDROID: optional("MOBILE_STORE_URL_ANDROID"),
  };

  if (env.EXERCISES_MAX_TOTAL_QUESTIONS < env.EXERCISES_DEFAULT_TOTAL_QUESTIONS) {
    throw new Error("EXERCISES_MAX_TOTAL_QUESTIONS must be >= EXERCISES_DEFAULT_TOTAL_QUESTIONS");
  }
  if (env.EXERCISES_MAX_TODAY_MINIMUM < env.EXERCISES_DEFAULT_TODAY_MINIMUM) {
    throw new Error("EXERCISES_MAX_TODAY_MINIMUM must be >= EXERCISES_DEFAULT_TODAY_MINIMUM");
  }
  if (
    env.REVIEW_LOGIN_ENABLED &&
    (!env.REVIEW_LOGIN_EMAIL?.trim() || !env.REVIEW_LOGIN_PASSWORD?.trim())
  ) {
    throw new Error(
      "REVIEW_LOGIN_EMAIL and REVIEW_LOGIN_PASSWORD are required when REVIEW_LOGIN_ENABLED=true",
    );
  }

  cached = env;
  return env;
}

export function resetEnv() {
  cached = undefined;
}
