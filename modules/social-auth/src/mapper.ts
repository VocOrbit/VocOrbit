import { toUserResponse } from "../../users/src/mapper";
import type { SocialAuthSession, SocialAuthSignInResult } from "./domain/session";

export function toSocialAuthSessionResponse(session: SocialAuthSession) {
  return {
    sessionId: session.sessionId,
    user: toUserResponse(session.user),
    identity: {
      provider: session.identity.provider,
      subject: session.identity.subject,
      signInProvider: session.identity.signInProvider,
      emailVerified: session.identity.emailVerified,
    },
  };
}

export function toSocialAuthSignInResponse(result: SocialAuthSignInResult) {
  return {
    ...toSocialAuthSessionResponse(result.session),
    tokens: {
      tokenType: result.tokens.tokenType,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      accessTokenExpiresInSec: result.tokens.accessTokenExpiresInSec,
      refreshTokenExpiresInSec: result.tokens.refreshTokenExpiresInSec,
    },
  };
}
