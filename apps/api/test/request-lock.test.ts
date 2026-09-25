import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { createMemoryRequestLockStore } from "../../../infra/redis/src/request-lock-store";
import { createErrorHandlerPlugin } from "../../../packages/core/src/http/middleware/error-handler";
import { createRequestLockPlugin } from "../src/middleware/request-lock";
import { createRequireAuthPlugin } from "../src/middleware/require-auth";

function authHeader(userId: string) {
  return { authorization: `Bearer ${userId}` };
}

function createApp(options?: { methods?: string[]; paths?: string[]; scope?: string }) {
  const store = createMemoryRequestLockStore();

  const auth = createRequireAuthPlugin({
    async authenticateBearerToken(authorizationHeader) {
      const userId = authorizationHeader?.replace(/^Bearer\s+/i, "").trim();
      if (!userId) {
        throw new Error("Missing user id");
      }
      return {
        user: {
          id: userId,
        },
      };
    },
  });

  return new Elysia().use(createErrorHandlerPlugin()).use(
    new Elysia()
      .use(auth)
      .use(
        createRequestLockPlugin({
          store,
          ttlMs: 5_000,
          scope: options?.scope ?? "credit-ops",
          methods: options?.methods,
          paths: options?.paths,
        }),
      )
      .post("/credit", async () => {
        await Bun.sleep(120);
        return { ok: true };
      })
      .get("/users", async () => {
        await Bun.sleep(120);
        return { ok: true };
      })
      .get("/users/:id", async () => {
        await Bun.sleep(120);
        return { ok: true };
      }),
  );
}

describe("request lock middleware", () => {
  it("blocks concurrent write requests for same user", async () => {
    const app = createApp();

    const firstPromise = app.handle(
      new Request("http://localhost/credit", {
        method: "POST",
        headers: authHeader("user-a"),
      }),
    );

    await Bun.sleep(10);

    const second = await app.handle(
      new Request("http://localhost/credit", {
        method: "POST",
        headers: authHeader("user-a"),
      }),
    );

    expect(second.status).toBe(409);

    const first = await firstPromise;
    expect(first.status).toBe(200);

    const third = await app.handle(
      new Request("http://localhost/credit", {
        method: "POST",
        headers: authHeader("user-a"),
      }),
    );

    expect(third.status).toBe(200);
  });

  it("does not block different users", async () => {
    const app = createApp();

    const firstPromise = app.handle(
      new Request("http://localhost/credit", {
        method: "POST",
        headers: authHeader("user-a"),
      }),
    );

    await Bun.sleep(10);

    const secondPromise = app.handle(
      new Request("http://localhost/credit", {
        method: "POST",
        headers: authHeader("user-b"),
      }),
    );

    const [first, second] = await Promise.all([firstPromise, secondPromise]);
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });

  it("locks only configured paths", async () => {
    const app = createApp({
      methods: ["GET"],
      paths: ["/users/:id"],
      scope: "users-get",
    });

    const firstPathPromise = app.handle(
      new Request("http://localhost/users/42", {
        method: "GET",
        headers: authHeader("user-a"),
      }),
    );

    await Bun.sleep(10);

    const secondPath = await app.handle(
      new Request("http://localhost/users/42", {
        method: "GET",
        headers: authHeader("user-a"),
      }),
    );

    expect(secondPath.status).toBe(409);
    const firstPath = await firstPathPromise;
    expect(firstPath.status).toBe(200);

    const firstListPromise = app.handle(
      new Request("http://localhost/users", {
        method: "GET",
        headers: authHeader("user-a"),
      }),
    );

    await Bun.sleep(10);

    const secondList = await app.handle(
      new Request("http://localhost/users", {
        method: "GET",
        headers: authHeader("user-a"),
      }),
    );

    expect(secondList.status).toBe(200);
    const firstList = await firstListPromise;
    expect(firstList.status).toBe(200);
  });
});
