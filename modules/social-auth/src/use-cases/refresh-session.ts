import { UnauthorizedError, ValidationError } from "../../../../packages/core/src/errors";
import type { SocialAuthSignInResult } from "../domain/session";
import type { SignInWithFirebaseDeps } from "./sign-in-with-firebase";
import { hashToken, isExpired } from "./token-utils";

type SessionLookupResult = Awaited<ReturnType<SignInWithFirebaseDeps["sessions"]["findById"]>>;

function assertSessionMatchesClaims(
  session: SessionLookupResult,
  claims: Awaited<ReturnType<SignInWithFirebaseDeps["tokens"]["verifyRefreshToken"]>>,
): asserts session is Exclude<SessionLookupResult, null> {
  if (!session) {
    throw new UnauthorizedError("Session not found");
  }

  if (session.revokedAt) {
    throw new UnauthorizedError("Session revoked");
  }

  if (isExpired(session.expiresAt)) {
    throw new UnauthorizedError("Session expired");
  }

  if (session.userId !== claims.userId) {
    throw new UnauthorizedError("Invalid session user");
  }

  if (
    session.provider !== claims.identity.provider ||
    session.subject !== claims.identity.subject ||
    session.signInProvider !== claims.identity.signInProvider
  ) {
    throw new UnauthorizedError("Invalid session identity");
  }
}

async function resolveSessionUser(deps: SignInWithFirebaseDeps, userId: string) {
  try {
    return await deps.users.getUser(userId);
  } catch {
    throw new UnauthorizedError("Session user not found");
  }
}

export async function refreshSession(
  deps: SignInWithFirebaseDeps,
  input: { refreshToken: string },
): Promise<SocialAuthSignInResult> {
  const refreshToken = input.refreshToken.trim();
  if (!refreshToken) {
    throw new ValidationError("refreshToken is required");
  }

  const claims = await deps.tokens.verifyRefreshToken(refreshToken);
  const session = await deps.sessions.findById(claims.sessionId);
  assertSessionMatchesClaims(session, claims);

  const providedHash = hashToken(refreshToken);
  if (session.refreshTokenHash !== providedHash) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const tokenPair = await deps.tokens.createTokenPair({
    userId: claims.userId,
    sessionId: claims.sessionId,
    identity: claims.identity,
  });

  const now = Date.now();
  const refreshExpiresAt = new Date(now + tokenPair.refreshTokenExpiresInSec * 1_000).toISOString();
  const rotated = await deps.sessions.rotateRefreshToken(claims.sessionId, {
    currentRefreshTokenHash: providedHash,
    nextRefreshTokenHash: hashToken(tokenPair.refreshToken),
    expiresAt: refreshExpiresAt,
    lastUsedAt: new Date(now).toISOString(),
  });

  if (!rotated) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const user = await resolveSessionUser(deps, claims.userId);

  return {
    session: {
      sessionId: claims.sessionId,
      user,
      identity: claims.identity,
    },
    tokens: {
      tokenType: "Bearer",
      ...tokenPair,
    },
  };
}
