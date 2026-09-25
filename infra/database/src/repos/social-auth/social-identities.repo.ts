import { and, eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  SocialIdentity,
  SocialIdentityRepo,
} from "../../../../../modules/social-auth/src/ports/social-identity-repo";
import { newId } from "../../../../../packages/core/src/ids";
import { authIdentities } from "../../schema";

function mapIdentity(row: typeof authIdentities.$inferSelect): SocialIdentity {
  return {
    provider: row.provider as SocialIdentity["provider"],
    subject: row.subject,
    userId: row.userId,
    email: row.email,
    emailVerified: row.emailVerified,
    signInProvider: row.signInProvider,
  };
}

export function createSocialIdentityRepo(db: PostgresJsDatabase): SocialIdentityRepo {
  return {
    async findByProviderAndSubject(provider, subject) {
      const result = await db
        .select()
        .from(authIdentities)
        .where(and(eq(authIdentities.provider, provider), eq(authIdentities.subject, subject)));
      const row = result[0];
      return row ? mapIdentity(row) : null;
    },

    async upsert(input) {
      const now = new Date();
      const result = await db
        .insert(authIdentities)
        .values({
          id: newId(),
          provider: input.provider,
          subject: input.subject,
          userId: input.userId,
          email: input.email,
          emailVerified: input.emailVerified,
          signInProvider: input.signInProvider,
          rawClaims: input.claims,
          lastSignInAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [authIdentities.provider, authIdentities.subject],
          set: {
            userId: input.userId,
            email: input.email,
            emailVerified: input.emailVerified,
            signInProvider: input.signInProvider,
            rawClaims: input.claims,
            lastSignInAt: now,
            updatedAt: now,
          },
        })
        .returning();

      const row = result[0];
      if (!row) {
        throw new Error("Failed to upsert auth identity");
      }
      return mapIdentity(row);
    },
  };
}
