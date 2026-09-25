import { createHash } from "node:crypto";
import { UnauthorizedError } from "../../../../packages/core/src/errors";

export function parseBearerToken(authorizationHeader: string | undefined): string {
  if (!authorizationHeader) {
    throw new UnauthorizedError("Missing authorization header");
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new UnauthorizedError("Invalid authorization header");
  }

  const normalized = token.trim();
  if (!normalized) {
    throw new UnauthorizedError("Invalid authorization header");
  }
  return normalized;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isExpired(isoDate: string): boolean {
  return Date.parse(isoDate) <= Date.now();
}
