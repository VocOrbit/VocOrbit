import type { UsersPublicContract } from "../../users/src/public-contract";
import type { SocialAuthSession, SocialAuthSignInResult } from "./domain/session";
import type { AuthSessionRepo } from "./ports/auth-session-repo";
import type { FirebaseIdTokenVerifier } from "./ports/id-token-verifier";
import type { SocialIdentityRepo } from "./ports/social-identity-repo";
import type { AuthTokenService } from "./ports/token-service";
import { authenticateBearerToken } from "./use-cases/authenticate-bearer";
import { logout } from "./use-cases/logout";
import { refreshSession } from "./use-cases/refresh-session";
import { signInWithFirebase } from "./use-cases/sign-in-with-firebase";
import { type ReviewLoginConfig, signInWithReview } from "./use-cases/sign-in-with-review";

export type SignInWithFirebaseInput = {
  idToken: string;
  referralCode?: string;
};

export type SignInWithReviewInput = {
  email: string;
  password: string;
};

export type RefreshSessionInput = {
  refreshToken: string;
};

export interface SocialAuthPublicContract {
  getReviewSignInStatus(): { enabled: boolean };
  signInWithReview(input: SignInWithReviewInput): Promise<SocialAuthSignInResult>;
  signInWithFirebase(input: SignInWithFirebaseInput): Promise<SocialAuthSignInResult>;
  authenticateBearerToken(authorizationHeader: string | undefined): Promise<SocialAuthSession>;
  refreshSession(input: RefreshSessionInput): Promise<SocialAuthSignInResult>;
  logout(authorizationHeader: string | undefined): Promise<void>;
}

export function createSocialAuthPublicContract(deps: {
  users: UsersPublicContract;
  identities: SocialIdentityRepo;
  sessions: AuthSessionRepo;
  tokens: AuthTokenService;
  verifier: FirebaseIdTokenVerifier;
  reviewLogin: ReviewLoginConfig;
}): SocialAuthPublicContract {
  return {
    getReviewSignInStatus() {
      return { enabled: deps.reviewLogin.enabled };
    },
    signInWithReview(input) {
      return signInWithReview(deps, deps.reviewLogin, input);
    },
    signInWithFirebase(input) {
      return signInWithFirebase(deps, input);
    },
    authenticateBearerToken(authorizationHeader) {
      return authenticateBearerToken(deps, authorizationHeader);
    },
    refreshSession(input) {
      return refreshSession(deps, input);
    },
    logout(authorizationHeader) {
      return logout(deps, { authorizationHeader });
    },
  };
}
