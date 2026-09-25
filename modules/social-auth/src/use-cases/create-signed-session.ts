import { newId } from "../../../../packages/core/src/ids";
import type { SocialAuthSession, SocialAuthSignInResult } from "../domain/session";
import type { SignInWithFirebaseDeps } from "./sign-in-with-firebase";
import { hashToken } from "./token-utils";

export async function createSignedSession(
  deps: SignInWithFirebaseDeps,
  input: Omit<SocialAuthSession, "sessionId">,
): Promise<SocialAuthSignInResult> {
  const sessionId = newId();
  const tokenPair = await deps.tokens.createTokenPair({
    userId: input.user.id,
    sessionId,
    identity: input.identity,
  });
  const now = Date.now();
  const refreshExpiresAt = new Date(now + tokenPair.refreshTokenExpiresInSec * 1_000).toISOString();

  await deps.sessions.create({
    id: sessionId,
    userId: input.user.id,
    provider: input.identity.provider,
    subject: input.identity.subject,
    signInProvider: input.identity.signInProvider,
    emailVerified: input.identity.emailVerified,
    refreshTokenHash: hashToken(tokenPair.refreshToken),
    expiresAt: refreshExpiresAt,
  });

  return {
    session: {
      sessionId,
      user: input.user,
      identity: input.identity,
    },
    tokens: {
      tokenType: "Bearer",
      ...tokenPair,
    },
  };
}
