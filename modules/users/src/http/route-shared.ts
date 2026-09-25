import type { Cache } from "../../../../packages/core/src/cache";
import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
} from "../../../../packages/core/src/config/constants";
import { UnauthorizedError, ValidationError } from "../../../../packages/core/src/errors";
import type { AuthzPolicy } from "../../../../packages/core/src/http/authz";

export type UsersRouteOptions = {
  cache?: Cache;
  cacheTtlMs?: number;
  requiresAuth?: boolean;
};

export type UsersRouteContext = {
  authz?: AuthzPolicy;
};

export function resolveUsersRouteDetail(options: UsersRouteOptions) {
  return options.requiresAuth
    ? {
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
      }
    : {
        tags: ["Users"],
      };
}

export function parseLimit(value: string | undefined): number {
  if (!value) return PAGINATION_DEFAULT_LIMIT;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ValidationError("Invalid limit");
  }
  return Math.min(Math.floor(parsed), PAGINATION_MAX_LIMIT);
}

export function resolveAuthz(
  options: UsersRouteOptions,
  context: UsersRouteContext,
): AuthzPolicy | undefined {
  if (!options.requiresAuth) return undefined;
  const authz = context.authz;
  if (!authz) {
    throw new UnauthorizedError("Missing authorization context");
  }
  return authz;
}

export function userCacheKey(id: string) {
  return `users:${id}`;
}

export async function safeGet<T>(cache: Cache | undefined, key: string): Promise<T | undefined> {
  if (!cache) return undefined;
  try {
    return await cache.get<T>(key);
  } catch {
    return undefined;
  }
}

export async function safeSet<T>(cache: Cache | undefined, key: string, value: T, ttlMs?: number) {
  if (!cache) return;
  try {
    await cache.set<T>(key, value, ttlMs);
  } catch {}
}

export async function safeDelete(cache: Cache | undefined, key: string) {
  if (!cache) return;
  try {
    await cache.delete(key);
  } catch {}
}
