import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { createErrorHandlerPlugin } from "../src/http/middleware/error-handler";
import { createRateLimitPlugin } from "../src/http/middleware/rate-limit";

function createApp(options: {
  trustProxy: boolean;
  max: number;
  resolveUserId?: (request: Request) => Promise<string | undefined>;
}) {
  return new Elysia()
    .use(createErrorHandlerPlugin())
    .use(
      createRateLimitPlugin({
        windowMs: 60_000,
        max: options.max,
        trustProxy: options.trustProxy,
        resolveUserId: options.resolveUserId,
      }),
    )
    .get("/health", () => ({ ok: true }));
}

describe("rate limit middleware", () => {
  it("does not trust forwarded headers when trustProxy=false", async () => {
    const app = createApp({
      trustProxy: false,
      max: 2,
    });

    const first = await app.handle(
      new Request("http://localhost/health", {
        headers: { "x-forwarded-for": "1.1.1.1" },
      }),
    );
    const second = await app.handle(
      new Request("http://localhost/health", {
        headers: { "x-forwarded-for": "8.8.8.8" },
      }),
    );
    const third = await app.handle(
      new Request("http://localhost/health", {
        headers: { "x-real-ip": "9.9.9.9", "x-forwarded-for": "4.4.4.4" },
      }),
    );

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(third.status).toBe(429);
  });

  it("applies separate buckets per authenticated user on same trusted IP", async () => {
    const app = createApp({
      trustProxy: true,
      max: 2,
      async resolveUserId(request) {
        const raw = request.headers.get("authorization");
        if (!raw) return undefined;
        return raw.replace(/^Bearer\s+/i, "").trim() || undefined;
      },
    });

    const ipHeaders = { "x-real-ip": "203.0.113.55" };

    const userA1 = await app.handle(
      new Request("http://localhost/health", {
        headers: { ...ipHeaders, authorization: "Bearer user-a" },
      }),
    );
    const userA2 = await app.handle(
      new Request("http://localhost/health", {
        headers: { ...ipHeaders, authorization: "Bearer user-a" },
      }),
    );
    const userB1 = await app.handle(
      new Request("http://localhost/health", {
        headers: { ...ipHeaders, authorization: "Bearer user-b" },
      }),
    );
    const userA3 = await app.handle(
      new Request("http://localhost/health", {
        headers: { ...ipHeaders, authorization: "Bearer user-a" },
      }),
    );

    expect(userA1.status).toBe(200);
    expect(userA2.status).toBe(200);
    expect(userB1.status).toBe(200);
    expect(userA3.status).toBe(429);
  });
});
