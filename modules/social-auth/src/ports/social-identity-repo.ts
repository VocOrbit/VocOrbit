import type { SocialAuthProvider } from "../domain/session";

export type SocialIdentity = {
  provider: SocialAuthProvider;
  subject: string;
  userId: string;
  email: string;
  emailVerified: boolean;
  signInProvider: string;
};

export type UpsertSocialIdentityInput = {
  provider: SocialAuthProvider;
  subject: string;
  userId: string;
  email: string;
  emailVerified: boolean;
  signInProvider: string;
  claims: Record<string, unknown>;
};

export interface SocialIdentityRepo {
  findByProviderAndSubject(
    provider: SocialAuthProvider,
    subject: string,
  ): Promise<SocialIdentity | null>;
  upsert(input: UpsertSocialIdentityInput): Promise<SocialIdentity>;
}
