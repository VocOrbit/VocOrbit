import { UnauthorizedError, ValidationError } from "../../../../packages/core/src/errors";
import type { AuthzPolicy } from "../../../../packages/core/src/http/authz";
import type { AppPlatform } from "../domain/app-meta";

export type AppMetaRouteOptions = {
  requiresAuth?: boolean;
};

type RouteContext = {
  auth?: {
    user?: {
      id?: string;
      role?: string;
    };
  };
  authz?: AuthzPolicy;
  query?: {
    platform?: string;
  };
};

export function resolveRouteDetail(options: AppMetaRouteOptions) {
  return options.requiresAuth
    ? {
        tags: ["App Meta"],
        security: [{ bearerAuth: [] }],
      }
    : {
        tags: ["App Meta"],
      };
}

export function resolveRequestUser(context: unknown, requiresAuth: boolean) {
  const typed = context as RouteContext;
  if (!requiresAuth) {
    return {
      id: "anonymous",
      role: "user" as const,
    };
  }
  const userId = typed.auth?.user?.id;
  if (!userId) {
    throw new UnauthorizedError("Missing authenticated user");
  }
  return {
    id: userId,
    role: typed.auth?.user?.role === "admin" ? ("admin" as const) : ("user" as const),
  };
}

export function resolveAuthz(context: unknown, requiresAuth: boolean): AuthzPolicy | undefined {
  if (!requiresAuth) return undefined;
  const typed = context as RouteContext;
  const authz = typed.authz;
  if (!authz) {
    throw new UnauthorizedError("Missing authorization context");
  }
  return authz;
}

export function parseLimit(value: string | undefined, fallback = 30, max = 100): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ValidationError("limit must be a positive number");
  }
  return Math.min(Math.floor(parsed), max);
}

export function resolvePlatform(context: unknown): AppPlatform {
  const typed = context as RouteContext;
  const raw = typed.query?.platform?.trim().toLowerCase();
  if (!raw || raw === "ios") return "ios";
  if (raw === "android") return "android";
  throw new ValidationError("platform must be ios or android");
}
