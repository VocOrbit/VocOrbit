import { describe, expect, it } from "bun:test";
import { ValidationError } from "../../../packages/core/src/errors";
import type { UserLanguagePreferences } from "../src/domain/language-preferences";
import type { User } from "../src/domain/user";
import type { Cursor, UserRepo } from "../src/ports/user-repo";
import { createUser } from "../src/use-cases/create-user";
import { deleteUser } from "../src/use-cases/delete-user";
import { getLanguagePreferences } from "../src/use-cases/get-language-preferences";
import { getUser } from "../src/use-cases/get-user";
import { listUsers } from "../src/use-cases/list-users";
import { setLanguagePreferences } from "../src/use-cases/set-language-preferences";
import { updateUser } from "../src/use-cases/update-user";

function createMemoryRepo(): UserRepo {
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

    async list({ limit, cursor }) {
      const users = [...store.values()].sort((a, b) => {
        if (a.createdAt === b.createdAt) return a.id.localeCompare(b.id);
        return a.createdAt.localeCompare(b.createdAt);
      });

      const startIndex = cursor
        ? users.findIndex((u) => u.createdAt === cursor.createdAt && u.id === cursor.id) + 1
        : 0;
      const slice = users.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < users.length;
      const last = slice[slice.length - 1];
      const nextCursor: Cursor | undefined =
        hasMore && last ? { createdAt: last.createdAt, id: last.id } : undefined;

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
      store.set(id, updated);
      return updated;
    },

    async delete(id) {
      preferences.delete(id);
      return store.delete(id);
    },
  };
}

describe("users use-cases", () => {
  it("creates and gets a user", async () => {
    const repo = createMemoryRepo();
    const created = await createUser(repo, { email: "a@b.com", name: "Alice" });
    const fetched = await getUser(repo, created.id);
    expect(fetched.email).toBe("a@b.com");
  });

  it("normalizes email in create", async () => {
    const repo = createMemoryRepo();
    const created = await createUser(repo, { email: "  A@B.COM ", name: "Alice" });
    expect(created.email).toBe("a@b.com");
  });

  it("rejects invalid email in create", async () => {
    const repo = createMemoryRepo();
    await expect(createUser(repo, { email: "not-an-email", name: "Alice" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("updates a user", async () => {
    const repo = createMemoryRepo();
    const created = await createUser(repo, { email: "a@b.com", name: "Alice" });
    const updated = await updateUser(repo, { id: created.id, name: "Ally" });
    expect(updated.name).toBe("Ally");
  });

  it("normalizes email in update", async () => {
    const repo = createMemoryRepo();
    const created = await createUser(repo, { email: "a@b.com", name: "Alice" });
    const updated = await updateUser(repo, { id: created.id, email: "  NEW@B.COM " });
    expect(updated.email).toBe("new@b.com");
  });

  it("rejects invalid email in update", async () => {
    const repo = createMemoryRepo();
    const created = await createUser(repo, { email: "a@b.com", name: "Alice" });
    await expect(updateUser(repo, { id: created.id, email: "bad-email" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("sanitizes html in name", async () => {
    const repo = createMemoryRepo();
    const created = await createUser(repo, {
      email: "a@b.com",
      name: "<img src=x onerror=alert(1)>Bob",
    });
    expect(created.name.includes("<")).toBe(false);
    expect(created.name.includes(">")).toBe(false);
  });

  it("rejects empty update", async () => {
    const repo = createMemoryRepo();
    const created = await createUser(repo, { email: "a@b.com", name: "Alice" });
    expect(updateUser(repo, { id: created.id })).rejects.toBeInstanceOf(ValidationError);
  });

  it("deletes a user", async () => {
    const repo = createMemoryRepo();
    const created = await createUser(repo, { email: "a@b.com", name: "Alice" });
    await deleteUser(repo, created.id);
    await expect(getUser(repo, created.id)).rejects.toBeDefined();
  });

  it("lists users with cursor", async () => {
    const repo = createMemoryRepo();
    const u1 = await createUser(repo, { email: "a@b.com", name: "A" });
    await new Promise((resolve) => setTimeout(resolve, 1));
    const u2 = await createUser(repo, { email: "b@b.com", name: "B" });
    const first = await listUsers(repo, { limit: 1 });
    expect(first.items.length).toBe(1);
    expect(first.items[0]?.id).toBe(u1.id);
    expect(first.nextCursor).toBeDefined();
    const second = await listUsers(repo, { limit: 1, cursor: first.nextCursor });
    expect(second.items[0]?.id).toBe(u2.id);
  });

  it("gets and sets language preferences", async () => {
    const repo = createMemoryRepo();
    const created = await createUser(repo, { email: "prefs@example.com", name: "Prefs" });

    const before = await getLanguagePreferences(repo, created.id);
    expect(before.l1Language).toBe("tr");
    expect(before.l2Language).toBe("en");

    const after = await setLanguagePreferences(repo, {
      userId: created.id,
      l1Language: "de",
      l2Language: "en",
    });
    expect(after.l1Language).toBe("de");
    expect(after.l2Language).toBe("en");
  });

  it("normalizes regional language preferences and keeps supported english variants", async () => {
    const repo = createMemoryRepo();
    const created = await createUser(repo, { email: "prefs-3@example.com", name: "Prefs3" });

    const after = await setLanguagePreferences(repo, {
      userId: created.id,
      l1Language: "tr-tr",
      l2Language: "en-us",
    });

    expect(after.l1Language).toBe("tr");
    expect(after.l2Language).toBe("en-us");
  });

  it("normalizes persisted regional preferences when reading", async () => {
    const repo = createMemoryRepo();
    const created = await createUser(repo, { email: "prefs-4@example.com", name: "Prefs4" });

    await repo.upsertLanguagePreferences({
      userId: created.id,
      l1Language: "tr-tr",
      l2Language: "en-gb",
    });

    const preferences = await getLanguagePreferences(repo, created.id);

    expect(preferences.l1Language).toBe("tr");
    expect(preferences.l2Language).toBe("en-gb");
  });

  it("normalizes unsupported english regional tags to base english", async () => {
    const repo = createMemoryRepo();
    const created = await createUser(repo, { email: "prefs-5@example.com", name: "Prefs5" });

    const after = await setLanguagePreferences(repo, {
      userId: created.id,
      l1Language: "tr",
      l2Language: "en-en",
    });

    expect(after.l2Language).toBe("en");
  });

  it("validates language preferences input", async () => {
    const repo = createMemoryRepo();
    const created = await createUser(repo, { email: "prefs-2@example.com", name: "Prefs2" });

    await expect(
      setLanguagePreferences(repo, {
        userId: created.id,
        l1Language: "???",
        l2Language: "en",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
