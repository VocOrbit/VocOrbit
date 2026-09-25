import type { SignInWithFirebaseDeps } from "./sign-in-with-firebase";
import { parseBearerToken } from "./token-utils";

export async function logout(
  deps: SignInWithFirebaseDeps,
  input: { authorizationHeader: string | undefined },
): Promise<void> {
  const accessToken = parseBearerToken(input.authorizationHeader);
  const claims = await deps.tokens.verifyAccessToken(accessToken);
  await deps.sessions.revoke(claims.sessionId);
}
