import { describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import { resetEnv } from "../../../packages/core/src/config/env";
import { createApp } from "../src/app";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

function setupEnv() {
  process.env.NODE_ENV = "test";
  process.env.PORT = "0";
  process.env.LOG_LEVEL = "error";
  process.env.AUTH_MODE = "firebase";
  process.env.REVIEW_LOGIN_ENABLED = "false";
  process.env.REVIEW_LOGIN_EMAIL = "";
  process.env.REVIEW_LOGIN_PASSWORD = "";
  process.env.DATABASE_URL = TEST_DATABASE_URL || "postgres://postgres:postgres@localhost:5432/app";
  process.env.CORS_ORIGIN = "http://allowed.local";
  process.env.RATE_LIMIT_WINDOW_MS = "60000";
  process.env.RATE_LIMIT_MAX = "100";
  process.env.RATE_LIMIT_PREFIX = randomUUID();
  process.env.TRUST_PROXY = "false";
  process.env.METRICS_ENABLED = "false";
  process.env.REDIS_URL = "redis://localhost:6379";
  process.env.NATS_URL = "";
  process.env.WORD_INSIGHT_PROVIDER = "openai";
  process.env.WORD_INSIGHT_DEFAULT_SOURCE_LANG = "en";
  process.env.WORD_INSIGHT_DEFAULT_TARGET_LANG = "tr";
  process.env.WORD_INSIGHT_MAX_SENTENCE_CHARS = "4000";
  process.env.WORD_INSIGHT_MAX_SELECTED_WORD_CHARS = "120";
  process.env.CREDITS_DEFAULT_FREE_BASIC = "10";
  process.env.CREDITS_DEFAULT_FREE_ADVANCED = "3";
  process.env.CREDITS_PAID_BASIC_CAP = "200";
  process.env.CREDITS_PAID_ADVANCED_CAP = "100";
  process.env.CREDITS_MONTHLY_PAID_BASIC_TOPUP = "0";
  process.env.CREDITS_MONTHLY_PAID_ADVANCED_TOPUP = "0";
  process.env.CREDITS_MONTHLY_TOPUP_INTERVAL_DAYS = "30";
  process.env.BILLING_WEBHOOK_SECRET = "test-webhook-secret";
  process.env.BILLING_ALLOW_TEST_RECEIPTS = "true";
  process.env.BILLING_SKU_CATALOG_JSON = "";
  process.env.OPENAI_API_KEY = "test-openai-key";
  process.env.OPENAI_MODEL = "gpt-4o-mini";
  process.env.OPENAI_BASE_URL = "https://api.openai.com/v1";
  process.env.OPENAI_TIMEOUT_MS = "15000";
}

describe("smoke", () => {
  it("boots app", async () => {
    setupEnv();
    resetEnv();
    const { app } = await createApp();
    const res = await app.handle(new Request("http://localhost/health"));
    expect(res.status).toBe(200);
  });
});
