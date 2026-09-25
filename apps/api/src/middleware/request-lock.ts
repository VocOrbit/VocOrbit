import { randomUUID } from "node:crypto";
import { Elysia } from "elysia";
import type { RequestLockStore } from "../../../../infra/redis/src/request-lock-store";
import { ConflictError, UnauthorizedError } from "../../../../packages/core/src/errors";
import type { Logger } from "../../../../packages/core/src/logger";

type RequestLockContext = {
  request: Request;
  path?: string;
  auth?: {
    user?: {
      id?: string;
    };
  };
};

type RequestLockState = {
  key: string;
  ownerToken: string;
  renewTimer: ReturnType<typeof setInterval>;
};

export type RequestLockPluginOptions = {
  store: RequestLockStore;
  ttlMs: number;
  scope?: string | ((context: RequestLockContext) => string);
  methods?: string[];
  paths?: string[];
  shouldLock?: (context: RequestLockContext) => boolean;
  logger?: Logger;
};

function resolvePath(context: RequestLockContext): string {
  if (context.path) return context.path;
  return new URL(context.request.url).pathname;
}

function resolveScope(
  context: RequestLockContext,
  scope: RequestLockPluginOptions["scope"],
): string {
  if (!scope) return "default";
  return typeof scope === "function" ? scope(context) : scope;
}

function resolveUserId(context: RequestLockContext): string {
  const userId = context.auth?.user?.id;
  if (!userId) {
    throw new UnauthorizedError("Auth context is missing for request lock");
  }
  return userId;
}

function normalizeMethods(methods: string[] | undefined): Set<string> {
  return new Set((methods ?? ["POST", "PUT", "PATCH", "DELETE"]).map((item) => item.toUpperCase()));
}

function escapeRegexSegment(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compilePathPattern(pattern: string): RegExp {
  const normalized = pattern.startsWith("/") ? pattern : `/${pattern}`;
  if (normalized === "/") return /^\/$/;

  const body = normalized
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      if (segment.startsWith(":")) return "[^/]+";
      if (segment === "*") return ".*";
      return escapeRegexSegment(segment);
    })
    .join("/");

  return new RegExp(`^/${body}$`);
}

export function createRequestLockPlugin(options: RequestLockPluginOptions) {
  const methods = normalizeMethods(options.methods);
  const pathMatchers = (options.paths ?? []).map(compilePathPattern);
  const activeLocks = new WeakMap<Request, RequestLockState>();

  async function release(request: Request) {
    const active = activeLocks.get(request);
    if (!active) return;
    activeLocks.delete(request);
    clearInterval(active.renewTimer);

    try {
      await options.store.release(active.key, active.ownerToken);
    } catch (error) {
      options.logger?.error({
        msg: "request_lock_release_failed",
        key: active.key,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return new Elysia({ name: "request-lock" })
    .onBeforeHandle(async (context: RequestLockContext) => {
      const method = context.request.method.toUpperCase();
      if (!methods.has(method)) return;
      if (
        pathMatchers.length > 0 &&
        !pathMatchers.some((matcher) => matcher.test(resolvePath(context)))
      ) {
        return;
      }
      if (options.shouldLock && !options.shouldLock(context)) return;

      const userId = resolveUserId(context);
      const scope = resolveScope(context, options.scope);
      const key = `${scope}:${userId}`;
      const ownerToken = randomUUID();

      const acquired = await options.store.acquire(key, ownerToken, options.ttlMs);
      if (!acquired) {
        throw new ConflictError("A request for this user is already in progress");
      }

      const renewEveryMs = Math.max(1_000, Math.floor(options.ttlMs / 2));
      const renewTimer = setInterval(async () => {
        try {
          const renewed = await options.store.renew(key, ownerToken, options.ttlMs);
          if (!renewed) {
            clearInterval(renewTimer);
            options.logger?.warn({
              msg: "request_lock_lost",
              key,
              method,
              path: resolvePath(context),
            });
          }
        } catch (error) {
          options.logger?.error({
            msg: "request_lock_renew_failed",
            key,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }, renewEveryMs);

      activeLocks.set(context.request, {
        key,
        ownerToken,
        renewTimer,
      });
    })
    .onAfterHandle(async ({ request }) => {
      await release(request);
    })
    .onError(async ({ request }) => {
      await release(request);
    })
    .as("global");
}
