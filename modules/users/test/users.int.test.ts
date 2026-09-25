import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { resetEnv } from "../../../packages/core/src/config/env";
import type { UserLanguagePreferences } from "../src/domain/language-preferences";
import type { User } from "../src/domain/user";
import { createUsersRoutes } from "../src/http/routes";
import type { Cursor, ListUsersResult, UserRepo } from "../src/ports/user-repo";
import { createUsersPublicContract } from "../src/public-contract";

function setupEnv() {
  process.env.NODE_ENV = "test";
  process.env.PORT = "0";
  process.env.LOG_LEVEL = "error";
  process.env.REDIS_URL = "redis://localhost:6379";
}

function createMemoryUsersRepo(): UserRepo {
  const store = new Map<string, User>();
  const preferences = new Map<string, UserLanguagePreferences>();

  return {
    async create(input) {
      const now = new Date().toISOString();
      const user: User = {
        id: input.id,
        email: input.email,
        name: input.name,
        role: "user",
        referralCode: input.referralCode,
        createdAt: now,
        updatedAt: now,
      };
      store.set(user.id, user);
      preferences.set(user.id, {
        userId: user.id,
        l1Language: "tr",
        l2Language: "en",
        updatedAt: now,
      });
      return user;
    },

    async findById(id) {
      return store.get(id) ?? null;
    },

    async findByEmail(email) {
      for (const user of store.values()) {
        if (user.email === email) return user;
      }
      return null;
    },

    async findByReferralCode(referralCode) {
      for (const user of store.values()) {
        if (user.referralCode === referralCode) return user;
      }
      return null;
    },

    async getLanguagePreferences(userId) {
      if (!store.get(userId)) return null;
      const existing = preferences.get(userId);
      if (existing) return existing;
      const fallback: UserLanguagePreferences = {
        userId,
        l1Language: "tr",
        l2Language: "en",
        updatedAt: new Date().toISOString(),
      };
      preferences.set(userId, fallback);
      return fallback;
    },

    async upsertLanguagePreferences(input) {
      if (!store.get(input.userId)) return null;
      const next: UserLanguagePreferences = {
        userId: input.userId,
        l1Language: input.l1Language,
        l2Language: input.l2Language,
        updatedAt: new Date().toISOString(),
      };
      preferences.set(input.userId, next);
      return next;
    },

    async list({ limit, cursor }: { limit: number; cursor?: Cursor }): Promise<ListUsersResult> {
      const users = [...store.values()].sort((a, b) => {
        if (a.createdAt === b.createdAt) return a.id.localeCompare(b.id);
        return a.createdAt.localeCompare(b.createdAt);
      });

      const startIndex = cursor
        ? users.findIndex((user) => user.createdAt === cursor.createdAt && user.id === cursor.id) +
          1
        : 0;
      const slice = users.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < users.length;
      const last = slice[slice.length - 1];
      const nextCursor = hasMore && last ? { createdAt: last.createdAt, id: last.id } : undefined;

      return { items: slice, nextCursor };
    },

    async update(id, input) {
      const user = store.get(id);
      if (!user) return null;
      const updated: User = {
        ...user,
        email: input.email ?? user.email,
        name: input.name ?? user.name,
        updatedAt: new Date().toISOString(),
      };
      store.set(updated.id, updated);
      return updated;
    },

    async delete(id) {
      preferences.delete(id);
      return store.delete(id);
    },
  };
}

describe("users module integration", () => {
  it("lists users with envelope", async () => {
    setupEnv();
    resetEnv();
    const repo = createMemoryUsersRepo();
    const users = createUsersPublicContract(repo);
    const app = new Elysia().use(createUsersRoutes(users));

    const res = await app.handle(new Request("http://localhost/users"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });
});
