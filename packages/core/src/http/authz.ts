import { NotFoundError, UnauthorizedError } from "../errors";

type AuthContext = {
  auth?: {
    user?: {
      id?: string;
      role?: string;
    };
  };
};

export type AuthRole = "user" | "admin";

export type AuthUser = {
  id: string;
  role: AuthRole;
};

export type AuthzPolicy = {
  user: AuthUser;
  requireAdminOr404(): void;
  requireSelfOrAdminOr404(resourceUserId: string): void;
};

export function resolveAuthUser(context: AuthContext): AuthUser {
  const id = context.auth?.user?.id;
  if (!id) {
    throw new UnauthorizedError("Missing authenticated user");
  }

  return {
    id,
    role: context.auth?.user?.role === "admin" ? "admin" : "user",
  };
}

export function createAuthz(context: AuthContext): AuthzPolicy {
  const user = resolveAuthUser(context);

  return {
    user,
    requireAdminOr404() {
      if (user.role !== "admin") {
        throw new NotFoundError();
      }
    },
    requireSelfOrAdminOr404(resourceUserId: string) {
      if (user.role === "admin") return;
      if (user.id === resourceUserId) return;
      throw new NotFoundError();
    },
  };
}
