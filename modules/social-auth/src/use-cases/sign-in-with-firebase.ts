import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "../../../../packages/core/src/errors";
import { sanitizePlainText } from "../../../../packages/core/src/security/sanitize";
import { normalizeEmail } from "../../../users/src/domain/email";
import type { UsersPublicContract } from "../../../users/src/public-contract";
import type { SocialAuthSignInResult } from "../domain/session";
import type { AuthSessionRepo } from "../ports/auth-session-repo";
import type { FirebaseIdTokenVerifier } from "../ports/id-token-verifier";
import type { SocialIdentityRepo } from "../ports/social-identity-repo";
import type { AuthTokenService } from "../ports/token-service";
import { createSignedSession } from "./create-signed-session";

export type SignInWithFirebaseDeps = {
  users: UsersPublicContract;
  identities: SocialIdentityRepo;
  sessions: AuthSessionRepo;
  tokens: AuthTokenService;
  verifier: FirebaseIdTokenVerifier;
};

const FIREBASE_PROVIDER = "firebase";

function fallbackName(email: string): string {
  const [localPart] = email.split("@");
  const cleaned = sanitizePlainText(localPart ?? "").trim();
  if (cleaned) return cleaned;
  return "user";
}

function resolveDisplayName(value: string | undefined, email: string): string {
  if (!value) return fallbackName(email);
  const cleaned = sanitizePlainText(value).trim();
  if (cleaned) return cleaned;
  return fallbackName(email);
}

async function resolveUserByEmail(
  users: UsersPublicContract,
  email: string,
  name: string,
  referredByUserId?: string,
): Promise<{
  user: Awaited<ReturnType<UsersPublicContract["createUser"]>>;
}> {
  const existing = await users.getUserByEmail(email);
  if (existing) {
    return {
      user: existing,
    };
  }

  try {
    const user = await users.createUser({ email, name, referredByUserId });
    return {
      user,
    };
  } catch (error) {
    if (!(error instanceof ConflictError)) {
      throw error;
    }
    const conflicted = await users.getUserByEmail(email);
    if (!conflicted) throw error;
    return {
      user: conflicted,
    };
  }
}

function normalizeReferralCode(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (!normalized) return undefined;
  return normalized;
}

export async function signInWithFirebase(
  deps: SignInWithFirebaseDeps,
  input: { idToken: string; referralCode?: string },
): Promise<SocialAuthSignInResult> {
  const idToken = input.idToken.trim();
  if (!idToken) {
    throw new ValidationError("idToken is required");
  }

  const verified = await deps.verifier.verifyFirebaseIdToken(idToken);
  if (!verified.subject) {
    throw new UnauthorizedError("Invalid firebase token subject");
  }

  const normalizedEmail = normalizeEmail(verified.email);
  const name = resolveDisplayName(verified.name, normalizedEmail);

  const existingIdentity = await deps.identities.findByProviderAndSubject(
    FIREBASE_PROVIDER,
    verified.subject,
  );
  if (existingIdentity) {
    const user = await deps.users.getUser(existingIdentity.userId);
    return await createSignedSession(deps, {
      user,
      identity: {
        provider: FIREBASE_PROVIDER,
        subject: verified.subject,
        signInProvider: verified.signInProvider,
        emailVerified: verified.emailVerified,
      },
    });
  }

  // A new identity is matched to an account by email, so the provider must have verified the
  // address; otherwise a token for someone else's unverified address could take over the account.
  if (!verified.emailVerified) {
    throw new ForbiddenError("Email address is not verified");
  }

  const referralCode = normalizeReferralCode(input.referralCode);
  const referrer =
    referralCode !== undefined ? await deps.users.getUserByReferralCode(referralCode) : null;

  const createdOrExistingUser = await resolveUserByEmail(
    deps.users,
    normalizedEmail,
    name,
    referrer?.id,
  );
  const identity = await deps.identities.upsert({
    provider: FIREBASE_PROVIDER,
    subject: verified.subject,
    userId: createdOrExistingUser.user.id,
    email: normalizedEmail,
    emailVerified: verified.emailVerified,
    signInProvider: verified.signInProvider,
    claims: verified.claims,
  });

  const user =
    identity.userId === createdOrExistingUser.user.id
      ? createdOrExistingUser.user
      : await deps.users.getUser(identity.userId);

  return await createSignedSession(deps, {
    user,
    identity: {
      provider: FIREBASE_PROVIDER,
      subject: identity.subject,
      signInProvider: identity.signInProvider,
      emailVerified: identity.emailVerified,
    },
  });
}
