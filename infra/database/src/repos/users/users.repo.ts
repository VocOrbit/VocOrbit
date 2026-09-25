import { createHash } from "node:crypto";
import { and, asc, eq, gt, or } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { UserLanguagePreferences } from "../../../../../modules/users/src/domain/language-preferences";
import type { User } from "../../../../../modules/users/src/domain/user";
import type {
  Cursor,
  ListUsersResult,
  UserRepo,
} from "../../../../../modules/users/src/ports/user-repo";
import { ConflictError } from "../../../../../packages/core/src/errors";
import { newId } from "../../../../../packages/core/src/ids";
import { outboxEvents, userLanguagePreferences, users } from "../../schema";

const USER_CREATED_EVENT = "users.created";
const USER_UPDATED_EVENT = "users.updated";
const USER_DELETED_EVENT = "users.deleted";

function normalizeRegion(value: string | undefined, fallback = "eu"): string {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return fallback;
  return normalized;
}

function resolveShardCount(value: number | undefined, fallback = 16): number {
  const candidate = value ?? fallback;
  if (!Number.isFinite(candidate) || candidate <= 0) {
    return fallback;
  }
  return Math.floor(candidate);
}

function computeShardId(userId: string, shardCount: number): number {
  const digest = createHash("sha256").update(userId).digest();
  const hash = digest.readUInt32BE(0);
  return hash % shardCount;
}

function mapUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role === "admin" ? "admin" : "user",
    homeRegion: row.homeRegion,
    shardId: row.shardId,
    referralCode: row.referralCode,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapLanguagePreferences(
  row: typeof userLanguagePreferences.$inferSelect,
): UserLanguagePreferences {
  return {
    userId: row.userId,
    l1Language: row.l1Language,
    l2Language: row.l2Language,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function createUsersRepo(
  db: PostgresJsDatabase,
  options: {
    defaultHomeRegion?: string;
    regionShardCount?: number;
  } = {},
): UserRepo {
  const defaultHomeRegion = normalizeRegion(options.defaultHomeRegion, "eu");
  const regionShardCount = resolveShardCount(options.regionShardCount, 16);

  return {
    async create(input) {
      try {
        return await db.transaction(async (tx) => {
          const homeRegion = defaultHomeRegion;
          const shardId = computeShardId(input.id, regionShardCount);
          const result = await tx
            .insert(users)
            .values({
              id: input.id,
              email: input.email,
              name: input.name,
              homeRegion,
              shardId,
              homeRegionAssignedAt: new Date(),
              referralCode: input.referralCode,
              referredByUserId: input.referredByUserId ?? null,
              referredAt: input.referredAt ? new Date(input.referredAt) : null,
            })
            .returning();

          const row = result[0];
          if (!row) throw new Error("Insert failed");
          const user = mapUser(row);

          await tx.insert(userLanguagePreferences).values({
            userId: user.id,
          });

          await tx.insert(outboxEvents).values({
            id: newId(),
            eventName: USER_CREATED_EVENT,
            aggregateType: "users",
            aggregateId: user.id,
            payload: { user },
          });

          return user;
        });
      } catch (error) {
        if ((error as { code?: string })?.code === "23505") {
          throw new ConflictError("Email already exists");
        }
        throw error;
      }
    },

    async findById(id: string) {
      const result = await db.select().from(users).where(eq(users.id, id));
      const row = result[0];
      return row ? mapUser(row) : null;
    },

    async findByEmail(email: string) {
      const result = await db.select().from(users).where(eq(users.email, email));
      const row = result[0];
      return row ? mapUser(row) : null;
    },

    async findByReferralCode(referralCode: string) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, referralCode))
        .limit(1);
      const row = result[0];
      return row ? mapUser(row) : null;
    },

    async getLanguagePreferences(userId) {
      return await db.transaction(async (tx) => {
        const userRows = await tx
          .select({ id: users.id })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        if (!userRows[0]) return null;

        await tx
          .insert(userLanguagePreferences)
          .values({ userId })
          .onConflictDoNothing({ target: userLanguagePreferences.userId });

        const rows = await tx
          .select()
          .from(userLanguagePreferences)
          .where(eq(userLanguagePreferences.userId, userId))
          .limit(1);
        const row = rows[0];
        if (!row) {
          throw new Error("Language preferences row missing");
        }
        return mapLanguagePreferences(row);
      });
    },

    async upsertLanguagePreferences(input) {
      return await db.transaction(async (tx) => {
        const userRows = await tx
          .select({ id: users.id })
          .from(users)
          .where(eq(users.id, input.userId))
          .limit(1);
        if (!userRows[0]) return null;

        const rows = await tx
          .insert(userLanguagePreferences)
          .values({
            userId: input.userId,
            l1Language: input.l1Language,
            l2Language: input.l2Language,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: userLanguagePreferences.userId,
            set: {
              l1Language: input.l1Language,
              l2Language: input.l2Language,
              updatedAt: new Date(),
            },
          })
          .returning();

        const row = rows[0];
        if (!row) {
          throw new Error("Failed to upsert language preferences");
        }
        return mapLanguagePreferences(row);
      });
    },

    async list(input): Promise<ListUsersResult> {
      const limit = input.limit;
      const cursor = input.cursor;
      let whereClause = undefined;

      if (cursor) {
        const cursorDate = new Date(cursor.createdAt);
        whereClause = or(
          gt(users.createdAt, cursorDate),
          and(eq(users.createdAt, cursorDate), gt(users.id, cursor.id)),
        );
      }

      const baseQuery = db.select().from(users);
      const filteredQuery = whereClause ? baseQuery.where(whereClause) : baseQuery;

      const rows = await filteredQuery
        .orderBy(asc(users.createdAt), asc(users.id))
        .limit(limit + 1);

      const hasMore = rows.length > limit;
      const items = rows.slice(0, limit).map(mapUser);

      let nextCursor: Cursor | undefined;
      if (hasMore && items.length > 0) {
        const last = items[items.length - 1] as User;
        nextCursor = { createdAt: last.createdAt, id: last.id };
      }

      return { items, nextCursor };
    },

    async update(id: string, input) {
      try {
        return await db.transaction(async (tx) => {
          const updateValues: Partial<typeof users.$inferInsert> = {
            updatedAt: new Date(),
          };
          if (input.email !== undefined) updateValues.email = input.email;
          if (input.name !== undefined) updateValues.name = input.name;

          const result = await tx
            .update(users)
            .set(updateValues)
            .where(eq(users.id, id))
            .returning();

          const row = result[0];
          if (!row) return null;
          const user = mapUser(row);

          await tx.insert(outboxEvents).values({
            id: newId(),
            eventName: USER_UPDATED_EVENT,
            aggregateType: "users",
            aggregateId: user.id,
            payload: { user },
          });

          return user;
        });
      } catch (error) {
        if ((error as { code?: string })?.code === "23505") {
          throw new ConflictError("Email already exists");
        }
        throw error;
      }
    },

    async delete(id: string) {
      return await db.transaction(async (tx) => {
        const result = await tx.delete(users).where(eq(users.id, id)).returning({ id: users.id });
        const row = result[0];
        if (!row) return false;

        await tx.insert(outboxEvents).values({
          id: newId(),
          eventName: USER_DELETED_EVENT,
          aggregateType: "users",
          aggregateId: row.id,
          payload: { id: row.id },
        });

        return true;
      });
    },
  };
}
