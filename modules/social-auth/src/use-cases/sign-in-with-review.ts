import { createHash, timingSafeEqual } from "node:crypto";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../../packages/core/src/errors";
import { normalizeEmail } from "../../../users/src/domain/email";
import type { SocialAuthSignInResult } from "../domain/session";
import { createSignedSession } from "./create-signed-session";
import type { SignInWithFirebaseDeps } from "./sign-in-with-firebase";

export type ReviewLoginConfig = {
  enabled: boolean;
  email?: string;
  password?: string;
};

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function safeEquals(left: string, right: string): boolean {
  return timingSafeEqual(digest(left), digest(right));
}

async function resolveReviewUser(deps: SignInWithFirebaseDeps, email: string) {
  const existing = await deps.users.getUserByEmail(email);
  if (existing) return existing;

  try {
    return await deps.users.createUser({
      email,
      name: "App Review",
    });
  } catch (error) {
    if (!(error instanceof ConflictError)) throw error;
    const conflicted = await deps.users.getUserByEmail(email);
    if (!conflicted) throw error;
    return conflicted;
  }
}

export async function signInWithReview(
  deps: SignInWithFirebaseDeps,
  config: ReviewLoginConfig,
  input: { email: string; password: string },
): Promise<SocialAuthSignInResult> {
  if (!config.enabled) {
    throw new NotFoundError("Not found");
  }

  const emailInputRaw = input.email.trim();
  if (!emailInputRaw) {
    throw new ValidationError("email is required");
  }

  if (!input.password) {
    throw new ValidationError("password is required");
  }

  const configuredEmailRaw = config.email?.trim();
  const configuredPassword = config.password;
  if (!configuredEmailRaw || !configuredPassword) {
    throw new NotFoundError("Not found");
  }

  const providedEmail = normalizeEmail(emailInputRaw);
  const configuredEmail = normalizeEmail(configuredEmailRaw);
  const isEmailValid = safeEquals(providedEmail, configuredEmail);
  const isPasswordValid = safeEquals(input.password, configuredPassword);
  if (!isEmailValid || !isPasswordValid) {
    throw new UnauthorizedError("Invalid review credentials");
  }

  const user = await resolveReviewUser(deps, providedEmail);
  return await createSignedSession(deps, {
    user,
    identity: {
      provider: "review",
      subject: providedEmail,
      signInProvider: "review-email-password",
      emailVerified: true,
    },
  });
}
