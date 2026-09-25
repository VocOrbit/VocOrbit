import type { User } from "../../../users/src/domain/user";

export type SocialAuthProvider = "firebase" | "review";

export type SocialAuthSession = {
  sessionId: string;
  user: User;
  identity: {
    provider: SocialAuthProvider;
    subject: string;
    signInProvider: string;
    emailVerified: boolean;
  };
};

export type AuthTokenPair = {
  tokenType: "Bearer";
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSec: number;
  refreshTokenExpiresInSec: number;
};

export type SocialAuthSignInResult = {
  session: SocialAuthSession;
  tokens: AuthTokenPair;
};
