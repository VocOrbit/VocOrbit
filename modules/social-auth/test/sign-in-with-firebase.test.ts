import { describe, expect, it } from "bun:test";
import { ForbiddenError, NotFoundError } from "../../../packages/core/src/errors";
import type { User } from "../../users/src/domain/user";
import type { UsersPublicContract } from "../../users/src/public-contract";
import type { AuthSessionRepo } from "../src/ports/auth-session-repo";
import type { VerifiedFirebaseToken } from "../src/ports/id-token-verifier";
import type { SocialIdentity, SocialIdentityRepo } from "../src/ports/social-identity-repo";
import type { AuthTokenService } from "../src/ports/token-service";
import {
  type SignInWithFirebaseDeps,
  signInWithFirebase,
} from "../src/use-cases/sign-in-with-firebase";

function buildUser(id: string, email: string): User {
  const now = new Date().toISOString();
  return { id, email, name: id, role: "user", createdAt: now, updatedAt: now };
}

function createDeps(input: {
  token: Omit<VerifiedFirebaseToken, "signInProvider" | "claims">;
  users?: User[];
  identities?: SocialIdentity[];
}) {
  const users = new Map((input.users ?? []).map((user) => [user.id, user]));
  const identities = new Map(
    (input.identities ?? []).map((identity) => [
      `${identity.provider}:${identity.subject}`,
      identity,
    ]),
  );
  const notUsed = async (): Promise<never> => {
    throw new Error("not used by sign-in");
  };

  const usersContract: UsersPublicContract = {
    async createUser(created) {
      const user = buildUser(`user-${users.size + 1}`, created.email);
      users.set(user.id, user);
      return user;
    },
    async getUser(id) {
      const user = users.get(id);
      if (!user) throw new NotFoundError();
      return user;
    },
    async getUserByEmail(email) {
      return [...users.values()].find((user) => user.email === email) ?? null;
    },
    async getUserByReferralCode() {
      return null;
    },
    getLanguagePreferences: notUsed,
    setLanguagePreferences: notUsed,
    listUsers: notUsed,
    updateUser: notUsed,
    deleteUser: notUsed,
  };

  const identityRepo: SocialIdentityRepo = {
    async findByProviderAndSubject(provider, subject) {
      return identities.get(`${provider}:${subject}`) ?? null;
    },
    async upsert(identity) {
      const stored: SocialIdentity = {
        provider: identity.provider,
        subject: identity.subject,
        userId: identity.userId,
        email: identity.email,
        emailVerified: identity.emailVerified,
        signInProvider: identity.signInProvider,
      };
      identities.set(`${identity.provider}:${identity.subject}`, stored);
      return stored;
    },
  };

  const sessions: AuthSessionRepo = {
    async create(session) {
      return { ...session, lastUsedAt: new Date().toISOString() };
    },
    findById: notUsed,
    rotateRefreshToken: notUsed,
    revoke: notUsed,
  };

  const tokens: AuthTokenService = {
    async createTokenPair() {
      return {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        accessTokenExpiresInSec: 900,
        refreshTokenExpiresInSec: 3600,
      };
    },
    verifyAccessToken: notUsed,
    verifyRefreshToken: notUsed,
  };

  const deps: SignInWithFirebaseDeps = {
    users: usersContract,
    identities: identityRepo,
    sessions,
    tokens,
    verifier: {
      async verifyFirebaseIdToken() {
        return { ...input.token, signInProvider: "password", claims: {} };
      },
    },
  };

  return { deps, users, identities };
}

describe("signInWithFirebase", () => {
  it("does not link an unverified email to an existing account", async () => {
    const victim = buildUser("victim", "victim@example.com");
    const { deps, identities } = createDeps({
      users: [victim],
      token: { subject: "attacker-uid", email: "victim@example.com", emailVerified: false },
    });

    await expect(signInWithFirebase(deps, { idToken: "token" })).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    expect(identities.size).toBe(0);
  });

  it("does not create an account from an unverified email", async () => {
    const { deps, users } = createDeps({
      token: { subject: "new-uid", email: "someone@example.com", emailVerified: false },
    });

    await expect(signInWithFirebase(deps, { idToken: "token" })).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    expect(users.size).toBe(0);
  });

  it("links a verified email to the existing account", async () => {
    const owner = buildUser("owner", "owner@example.com");
    const { deps, identities } = createDeps({
      users: [owner],
      token: { subject: "owner-uid", email: "owner@example.com", emailVerified: true },
    });

    const result = await signInWithFirebase(deps, { idToken: "token" });

    expect(result.session.user.id).toBe("owner");
    expect(identities.get("firebase:owner-uid")?.userId).toBe("owner");
  });

  it("keeps signing in an identity that is already linked", async () => {
    const owner = buildUser("owner", "owner@example.com");
    const { deps } = createDeps({
      users: [owner],
      identities: [
        {
          provider: "firebase",
          subject: "owner-uid",
          userId: "owner",
          email: "owner@example.com",
          emailVerified: true,
          signInProvider: "google.com",
        },
      ],
      token: { subject: "owner-uid", email: "owner@example.com", emailVerified: false },
    });

    const result = await signInWithFirebase(deps, { idToken: "token" });

    expect(result.session.user.id).toBe("owner");
  });
});
