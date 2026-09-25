import type { SocialAuthProvider } from "../domain/session";

export type AccessTokenClaims = {
  tokenType: "access";
  userId: string;
  sessionId: string;
  identity: {
    provider: SocialAuthProvider;
    subject: string;
    signInProvider: string;
    emailVerified: boolean;
  };
};

export type RefreshTokenClaims = {
  tokenType: "refresh";
  userId: string;
  sessionId: string;
  identity: {
    provider: SocialAuthProvider;
    subject: string;
    signInProvider: string;
    emailVerified: boolean;
  };
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSec: number;
  refreshTokenExpiresInSec: number;
};

export interface AuthTokenService {
  createTokenPair(input: Omit<AccessTokenClaims, "tokenType">): Promise<TokenPair>;
  verifyAccessToken(token: string): Promise<AccessTokenClaims>;
  verifyRefreshToken(token: string): Promise<RefreshTokenClaims>;
}
