import { UnauthorizedError, ValidationError } from "../../../../packages/core/src/errors";

export type ExercisesRouteOptions = {
  requiresAuth?: boolean;
};

type RouteContext = {
  auth?: {
    user?: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    };
  };
  query?: {
    mode?: string;
    timezoneOffsetMinutes?: string;
  };
};

export function resolveRouteDetail(options: ExercisesRouteOptions) {
  return options.requiresAuth
    ? {
        tags: ["Exercises"],
        security: [{ bearerAuth: [] }],
      }
    : { tags: ["Exercises"] };
}

export function resolveRequestUser(context: unknown, requiresAuth: boolean) {
  const typed = context as RouteContext;
  if (!requiresAuth) {
    return {
      id: "anonymous",
      name: "anonymous",
      email: "anonymous@example.com",
      role: "user" as const,
    };
  }

  const user = typed.auth?.user;
  if (!user?.id) {
    throw new UnauthorizedError("Missing authenticated user");
  }
  return {
    id: user.id,
    name: user.name ?? user.email ?? user.id,
    email: user.email ?? `${user.id}@example.com`,
    role: user.role === "admin" ? ("admin" as const) : ("user" as const),
  };
}

export function resolveTimezoneOffsetMinutesQuery(context: unknown): number | undefined {
  const typed = context as RouteContext;
  const raw = typed.query?.timezoneOffsetMinutes;
  if (!raw) return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new ValidationError("timezoneOffsetMinutes must be a number");
  }
  return Math.floor(value);
}
