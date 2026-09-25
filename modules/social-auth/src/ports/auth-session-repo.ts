import type { SocialAuthProvider } from "../domain/session";

export type AuthSessionRecord = {
  id: string;
  userId: string;
  provider: SocialAuthProvider;
  subject: string;
  signInProvider: string;
  emailVerified: boolean;
  refreshTokenHash: string;
  expiresAt: string;
  lastUsedAt: string;
  revokedAt?: string;
};

export type CreateAuthSessionInput = {
  id: string;
  userId: string;
  provider: SocialAuthProvider;
  subject: string;
  signInProvider: string;
  emailVerified: boolean;
  refreshTokenHash: string;
  expiresAt: string;
};

export interface AuthSessionRepo {
  create(input: CreateAuthSessionInput): Promise<AuthSessionRecord>;
  findById(id: string): Promise<AuthSessionRecord | null>;
  rotateRefreshToken(
    sessionId: string,
    input: {
      currentRefreshTokenHash: string;
      nextRefreshTokenHash: string;
      expiresAt: string;
      lastUsedAt: string;
    },
  ): Promise<AuthSessionRecord | null>;
  revoke(sessionId: string): Promise<void>;
}
