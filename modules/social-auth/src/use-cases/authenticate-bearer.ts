import { UnauthorizedError } from "../../../../packages/core/src/errors";
import type { SocialAuthSession } from "../domain/session";
import type { SignInWithFirebaseDeps } from "./sign-in-with-firebase";
import { isExpired, parseBearerToken } from "./token-utils";

async function resolveActiveSession(deps: SignInWithFirebaseDeps, sessionId: string) {
  const session = await deps.sessions.findById(sessionId);
  if (!session) {
    throw new UnauthorizedError("Session not found");
  }
  if (session.revokedAt) {
    throw new UnauthorizedError("Session revoked");
  }
  if (isExpired(session.expiresAt)) {
    throw new UnauthorizedError("Session expired");
  }
  return session;
}

async function resolveSessionUser(deps: SignInWithFirebaseDeps, userId: string) {
  try {
    return await deps.users.getUser(userId);
  } catch {
    throw new UnauthorizedError("Session user not found");
  }
}

export async function authenticateBearerToken(
  deps: SignInWithFirebaseDeps,
  authorizationHeader: string | undefined,
): Promise<SocialAuthSession> {
  const accessToken = parseBearerToken(authorizationHeader);
  const claims = await deps.tokens.verifyAccessToken(accessToken);
  const session = await resolveActiveSession(deps, claims.sessionId);

  if (session.userId !== claims.userId) {
    throw new UnauthorizedError("Invalid session user");
  }

  const user = await resolveSessionUser(deps, claims.userId);

  return {
    sessionId: claims.sessionId,
    user,
    identity: claims.identity,
  };
}
