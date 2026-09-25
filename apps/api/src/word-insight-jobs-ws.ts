import { Elysia, t } from "elysia";
import type { SocialAuthPublicContract } from "../../../modules/social-auth/src/public-contract";
import type { WordInsightPublicContract } from "../../../modules/word-insight/src/public-contract";
import { UnauthorizedError, ValidationError } from "../../../packages/core/src/errors";
import type { Logger } from "../../../packages/core/src/logger";
import type { createWordInsightJobHub } from "./word-insight-jobs";

type WsQuery = {
  token: string;
};

type WsContext = {
  query: WsQuery;
  headers?: Record<string, string | undefined>;
};

type SubscribeMessage = {
  type: "subscribe";
  jobId: string;
  token?: string;
};

type UnsubscribeMessage = {
  type: "unsubscribe";
  jobId: string;
};

type PingMessage = {
  type: "ping";
};

type WsMessage = SubscribeMessage | UnsubscribeMessage | PingMessage;
type WsRouteOptions = {
  idleTimeoutMs?: number;
  heartbeatIntervalMs?: number;
  maxConnectionsPerUser?: number;
};

const DEFAULT_IDLE_TIMEOUT_MS = 120_000;
const DEFAULT_HEARTBEAT_INTERVAL_MS = 30_000;
const DEFAULT_MAX_CONNECTIONS_PER_USER = 3;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMessage(raw: unknown): WsMessage {
  const value = (() => {
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) throw new ValidationError("WebSocket message is empty");
      try {
        return JSON.parse(trimmed) as unknown;
      } catch {
        throw new ValidationError("WebSocket message must be valid JSON");
      }
    }
    return raw;
  })();

  if (!isObject(value)) {
    throw new ValidationError("WebSocket message must be an object");
  }

  const type = value.type;
  if (type === "subscribe") {
    if (typeof value.jobId !== "string" || value.jobId.trim().length === 0) {
      throw new ValidationError("jobId is required for subscribe");
    }
    return {
      type: "subscribe",
      jobId: value.jobId,
      token: typeof value.token === "string" ? value.token : undefined,
    };
  }

  if (type === "unsubscribe") {
    if (typeof value.jobId !== "string" || value.jobId.trim().length === 0) {
      throw new ValidationError("jobId is required for unsubscribe");
    }
    return {
      type: "unsubscribe",
      jobId: value.jobId,
    };
  }

  if (type === "ping") {
    return { type: "ping" };
  }

  throw new ValidationError("Unsupported WebSocket message type");
}

function toBearerToken(token: string): string {
  const trimmed = token.trim();
  if (!trimmed) throw new UnauthorizedError("Missing access token");
  if (/^bearer\s+/i.test(trimmed)) return trimmed;
  return `Bearer ${trimmed}`;
}

function sendJson(
  socket: {
    send(data: string): unknown;
    close(code?: number, reason?: string): unknown;
  },
  payload: Record<string, unknown>,
) {
  try {
    socket.send(JSON.stringify(payload));
  } catch {
    socket.close(1011, "ws_send_failed");
  }
}

type RouteWsSocket = {
  id: string;
  raw: {
    send(data: string): unknown;
    close(code?: number, reason?: string): unknown;
  };
  data: WsContext;
  close(code?: number, reason?: string): unknown;
};

export function createWordInsightJobWsRoutes(
  deps: {
    auth: SocialAuthPublicContract;
    wordInsight: Pick<WordInsightPublicContract, "getExplainJob">;
    hub: ReturnType<typeof createWordInsightJobHub>;
    logger: Logger;
  },
  options: WsRouteOptions = {},
) {
  const authBySocket = new Map<string, { userId: string }>();
  const socketIdsByUser = new Map<string, Set<string>>();
  const socketStateById = new Map<
    string,
    {
      lastActivityAt: number;
      heartbeatTimer: ReturnType<typeof setInterval>;
    }
  >();
  const idleTimeoutMs = Math.max(
    5_000,
    Math.floor(options.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS),
  );
  const heartbeatIntervalMs = Math.max(
    1_000,
    Math.floor(options.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_INTERVAL_MS),
  );
  const maxConnectionsPerUser = Math.max(
    1,
    Math.floor(options.maxConnectionsPerUser ?? DEFAULT_MAX_CONNECTIONS_PER_USER),
  );

  const touchSocket = (socketId: string) => {
    const state = socketStateById.get(socketId);
    if (!state) return;
    state.lastActivityAt = Date.now();
  };

  const removeSocket = (socketId: string) => {
    deps.hub.removeSocket(socketId);

    const auth = authBySocket.get(socketId);
    if (auth) {
      const userSockets = socketIdsByUser.get(auth.userId);
      if (userSockets) {
        userSockets.delete(socketId);
        if (userSockets.size === 0) {
          socketIdsByUser.delete(auth.userId);
        }
      }
    }
    authBySocket.delete(socketId);

    const state = socketStateById.get(socketId);
    if (state) {
      clearInterval(state.heartbeatTimer);
      socketStateById.delete(socketId);
    }
  };

  const startHeartbeat = (ws: RouteWsSocket) => {
    const socketId = ws.id;
    const heartbeatTimer = setInterval(() => {
      const state = socketStateById.get(socketId);
      if (!state) return;

      const idleForMs = Date.now() - state.lastActivityAt;
      if (idleForMs >= idleTimeoutMs) {
        sendJson(ws.raw, {
          type: "error",
          code: "IDLE_TIMEOUT",
          message: "WebSocket idle timeout",
        });
        ws.close(4408, "idle_timeout");
        return;
      }

      sendJson(ws.raw, {
        type: "server_ping",
        ts: new Date().toISOString(),
      });
    }, heartbeatIntervalMs);

    socketStateById.set(socketId, {
      lastActivityAt: Date.now(),
      heartbeatTimer,
    });
  };

  const wsOptions = {
    query: t.Object(
      {
        token: t.String({ minLength: 1 }),
      },
      { additionalProperties: false },
    ),
    async open(ws: RouteWsSocket) {
      const socketId = ws.id;
      try {
        const context = ws.data as WsContext;
        const authHeader = toBearerToken(context.query.token);
        const userId = (await deps.auth.authenticateBearerToken(authHeader)).user.id;

        const userSockets = socketIdsByUser.get(userId) ?? new Set<string>();
        if (userSockets.size >= maxConnectionsPerUser) {
          sendJson(ws.raw, {
            type: "error",
            code: "TOO_MANY_CONNECTIONS",
            message: `Max ${maxConnectionsPerUser} websocket connections allowed per user`,
          });
          ws.close(4429, "too_many_connections");
          return;
        }

        userSockets.add(socketId);
        socketIdsByUser.set(userId, userSockets);
        authBySocket.set(socketId, { userId });

        startHeartbeat(ws);
        sendJson(ws.raw, {
          type: "ready",
          idleTimeoutMs,
          heartbeatIntervalMs,
          maxConnectionsPerUser,
        });
      } catch (error) {
        const code = error instanceof UnauthorizedError ? "UNAUTHORIZED" : "INTERNAL_ERROR";
        const message = error instanceof Error ? error.message : String(error);
        deps.logger.warn({
          msg: "word_insight_ws_open_failed",
          socketId,
          code,
          error: message,
        });
        sendJson(ws.raw, {
          type: "error",
          code,
          message,
        });
        ws.close(code === "UNAUTHORIZED" ? 4401 : 1011, "ws_open_failed");
      }
    },
    async message(ws: RouteWsSocket, rawMessage: unknown) {
      const socketId = ws.id;
      touchSocket(socketId);
      try {
        const message = parseMessage(rawMessage);

        if (message.type === "ping") {
          sendJson(ws.raw, { type: "pong" });
          return;
        }

        if (message.type === "unsubscribe") {
          deps.hub.unsubscribe({
            socketKey: socketId,
            jobId: message.jobId,
          });
          sendJson(ws.raw, {
            type: "unsubscribed",
            jobId: message.jobId,
          });
          return;
        }

        const existingAuth = authBySocket.get(socketId);
        if (!existingAuth) {
          throw new UnauthorizedError("WebSocket connection is not authenticated");
        }

        if (message.token !== undefined) {
          const messageUserId = (
            await deps.auth.authenticateBearerToken(toBearerToken(message.token))
          ).user.id;
          if (existingAuth.userId !== messageUserId) {
            throw new UnauthorizedError("WebSocket identity mismatch");
          }
        }

        const userId = existingAuth.userId;
        const job = await deps.wordInsight.getExplainJob({
          userId,
          jobId: message.jobId,
        });

        deps.hub.subscribe({
          socketKey: socketId,
          socket: ws.raw,
          userId,
          jobId: message.jobId,
        });

        sendJson(ws.raw, {
          type: "subscribed",
          jobId: message.jobId,
        });
        deps.hub.publish(job);
      } catch (error) {
        const code =
          error instanceof ValidationError
            ? "VALIDATION_ERROR"
            : error instanceof UnauthorizedError
              ? "UNAUTHORIZED"
              : "INTERNAL_ERROR";
        const message = error instanceof Error ? error.message : String(error);

        deps.logger.warn({
          msg: "word_insight_ws_message_failed",
          socketId,
          code,
          error: message,
        });
        sendJson(ws.raw, {
          type: "error",
          code,
          message,
        });

        if (code === "UNAUTHORIZED") {
          ws.close(4401, "unauthorized");
        }
      }
    },
    close(ws: RouteWsSocket) {
      removeSocket(ws.id);
    },
  } as const;

  return new Elysia({ name: "word-insight-jobs-ws-routes" })
    .ws("/word-insight/ws/jobs", wsOptions)
    .onStop(() => {
      for (const state of socketStateById.values()) {
        clearInterval(state.heartbeatTimer);
      }
      socketStateById.clear();
      authBySocket.clear();
      socketIdsByUser.clear();
    });
}
