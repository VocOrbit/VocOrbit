import { ValidationError } from "../../../../packages/core/src/errors";

const EMAIL_MAX_LENGTH = 320;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function normalizeEmail(input: string): string {
  const email = input.trim().toLowerCase();

  if (!email) {
    throw new ValidationError("Email is required");
  }

  if (email.length > EMAIL_MAX_LENGTH) {
    throw new ValidationError("Email is too long");
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError("Invalid email");
  }

  return email;
}
