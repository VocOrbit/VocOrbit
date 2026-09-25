import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
} from "../../../../packages/core/src/config/constants";
import { UnauthorizedError, ValidationError } from "../../../../packages/core/src/errors";
import type { ExplainWordPublicInput } from "../public-contract";

export type WordInsightRouteOptions = {
  requiresAuth?: boolean;
  onExplainJobQueued?: (jobId: string) => void;
  maxSentenceChars?: number;
  maxSelectedWordChars?: number;
};

export type RequestUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  homeRegion?: string;
  shardId?: number;
};

type RouteContext = {
  auth?: {
    user?: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
      homeRegion?: unknown;
      shardId?: unknown;
    };
  };
  headers?: Record<string, string | undefined>;
  requestId?: string;
  body?: unknown;
  query?: {
    status?: string;
    limit?: string;
    offset?: string;
    favorite?: string;
    q?: string;
    includeInsight?: string;
  };
  params?: {
    id?: string;
    itemId?: string;
  };
  set?: {
    status?: number;
  };
};

export function resolveRouteDetail(options: WordInsightRouteOptions) {
  return options.requiresAuth
    ? {
        tags: ["AI"],
        security: [{ bearerAuth: [] }],
      }
    : { tags: ["AI"] };
}

function toContext(context: unknown): RouteContext {
  return context as RouteContext;
}

export function resolveRequestUser(context: unknown, requiresAuth: boolean): RequestUser {
  const typed = toContext(context);

  if (!requiresAuth) {
    return {
      id: "anonymous",
      name: "anonymous",
      email: "anonymous@example.com",
      role: "user",
    };
  }

  const user = typed.auth?.user;
  if (!user?.id) {
    throw new UnauthorizedError("Missing authenticated user");
  }

  const fallbackName = user.email ?? user.id;
  const homeRegion =
    typeof user.homeRegion === "string" && user.homeRegion.trim().length > 0
      ? user.homeRegion.trim().toLowerCase()
      : undefined;
  const shardId =
    typeof user.shardId === "number" && Number.isInteger(user.shardId) && user.shardId >= 0
      ? user.shardId
      : undefined;
  return {
    id: user.id,
    name: user.name ?? fallbackName,
    email: user.email ?? `${user.id}@example.com`,
    role: user.role === "admin" ? "admin" : "user",
    homeRegion,
    shardId,
  };
}

export function resolveRequestId(context: unknown): string | undefined {
  return toContext(context).requestId;
}

export function resolveExplainBody(context: unknown): ExplainWordPublicInput {
  const body = toContext(context).body as ExplainWordPublicInput | undefined;
  if (!body) throw new ValidationError("Missing request body");
  return body;
}

export function resolveReportMessage(context: unknown): string {
  const body = toContext(context).body as { message?: unknown } | undefined;
  if (!body || typeof body.message !== "string") {
    throw new ValidationError("Missing report message");
  }
  const message = body.message.trim();
  if (!message) {
    throw new ValidationError("Missing report message");
  }
  return message;
}

export function resolveItemId(context: unknown): string {
  const itemId = toContext(context).params?.id;
  if (!itemId) throw new ValidationError("Invalid item id");
  return itemId;
}

export function resolveGroupId(context: unknown): string {
  const groupId = toContext(context).params?.id;
  if (!groupId) throw new ValidationError("Invalid group id");
  return groupId;
}

export function resolveGroupItemId(context: unknown): string {
  const itemId = toContext(context).params?.itemId;
  if (!itemId) throw new ValidationError("Invalid item id");
  return itemId;
}

export function resolveJobId(context: unknown): string {
  const jobId = toContext(context).params?.id;
  if (!jobId) throw new ValidationError("Invalid job id");
  return jobId;
}

export function setAccepted(context: unknown) {
  const typed = toContext(context);
  if (!typed.set) return;
  typed.set.status = 202;
}

export function resolveListStatus(context: unknown): string | undefined {
  return toContext(context).query?.status;
}

export function resolveListLimit(context: unknown): number {
  const value = toContext(context).query?.limit;
  if (!value) return PAGINATION_DEFAULT_LIMIT;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ValidationError("Invalid limit");
  }
  return Math.min(Math.floor(parsed), PAGINATION_MAX_LIMIT);
}

export function resolveListOffset(context: unknown): number {
  const value = toContext(context).query?.offset;
  if (!value) return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ValidationError("Invalid offset");
  }
  return Math.floor(parsed);
}

export function resolveListFavorite(context: unknown): string | undefined {
  return toContext(context).query?.favorite;
}

export function resolveListQuery(context: unknown): string | undefined {
  const raw = toContext(context).query?.q;
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > 120) {
    throw new ValidationError("Search query is too long");
  }
  return trimmed;
}

export function resolvePreferredTargetLanguage(context: unknown): string | undefined {
  const acceptLanguage = toContext(context).headers?.["accept-language"];
  if (!acceptLanguage) return undefined;
  const [head] = acceptLanguage.split(",");
  if (!head) return undefined;
  const base = head.split(";")[0]?.trim();
  if (!base) return undefined;
  return base.toLowerCase();
}

export function resolveIncludeInsight(context: unknown): boolean {
  const raw = toContext(context).query?.includeInsight;
  if (!raw) return true;
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw new ValidationError("includeInsight must be 'true' or 'false'");
}
