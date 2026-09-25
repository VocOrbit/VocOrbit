import { and, eq, isNull } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  AuthSessionRecord,
  AuthSessionRepo,
} from "../../../../../modules/social-auth/src/ports/auth-session-repo";
import { authSessions } from "../../schema";

function mapSession(row: typeof authSessions.$inferSelect): AuthSessionRecord {
  return {
    id: row.id,
    userId: row.userId,
    provider: row.provider as AuthSessionRecord["provider"],
    subject: row.subject,
    signInProvider: row.signInProvider,
    emailVerified: row.emailVerified,
    refreshTokenHash: row.refreshTokenHash,
    expiresAt: row.expiresAt.toISOString(),
    revokedAt: row.revokedAt ? row.revokedAt.toISOString() : undefined,
    lastUsedAt: row.lastUsedAt.toISOString(),
  };
}

export function createAuthSessionRepo(db: PostgresJsDatabase): AuthSessionRepo {
  return {
    async create(input) {
      const now = new Date();
      const result = await db
        .insert(authSessions)
        .values({
          id: input.id,
          userId: input.userId,
          provider: input.provider,
          subject: input.subject,
          signInProvider: input.signInProvider,
          emailVerified: input.emailVerified,
          refreshTokenHash: input.refreshTokenHash,
          expiresAt: new Date(input.expiresAt),
          lastUsedAt: now,
          updatedAt: now,
        })
        .returning();
      const row = result[0];
      if (!row) {
        throw new Error("Failed to create auth session");
      }
      return mapSession(row);
    },

    async findById(id) {
      const result = await db.select().from(authSessions).where(eq(authSessions.id, id));
      const row = result[0];
      return row ? mapSession(row) : null;
    },

    async rotateRefreshToken(sessionId, input) {
      const now = new Date();
      const result = await db
        .update(authSessions)
        .set({
          refreshTokenHash: input.nextRefreshTokenHash,
          expiresAt: new Date(input.expiresAt),
          lastUsedAt: new Date(input.lastUsedAt),
          updatedAt: now,
        })
        .where(
          and(
            eq(authSessions.id, sessionId),
            isNull(authSessions.revokedAt),
            eq(authSessions.refreshTokenHash, input.currentRefreshTokenHash),
          ),
        )
        .returning();
      const row = result[0];
      return row ? mapSession(row) : null;
    },

    async revoke(sessionId) {
      const now = new Date();
      await db
        .update(authSessions)
        .set({
          revokedAt: now,
          updatedAt: now,
        })
        .where(eq(authSessions.id, sessionId));
    },
  };
}
