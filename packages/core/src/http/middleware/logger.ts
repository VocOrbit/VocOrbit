import { Elysia } from "elysia";
import type { Logger } from "../../logger";
import { getActiveTraceContext } from "../../observability/tracing";

type RequestLogLevel = "debug" | "info" | "warn" | "error";

const SLOW_REQUEST_WARN_MS = 1200;
const LOW_SIGNAL_PATHS = new Set(["/health", "/healthz", "/metrics"]);

function writeWithLevel(
  logger: Logger,
  level: RequestLogLevel,
  record: Record<string, unknown> & { msg: string },
) {
  if (level === "debug") {
    logger.debug(record);
    return;
  }
  if (level === "info") {
    logger.info(record);
    return;
  }
  if (level === "warn") {
    logger.warn(record);
    return;
  }
  logger.error(record);
}

function resolveRequestLogLevel(path: string, status: number, durationMs: number): RequestLogLevel {
  if (status >= 500) return "error";
  if (durationMs >= SLOW_REQUEST_WARN_MS) return "warn";
  if (status === 401 || status === 403 || status === 429) return "warn";
  if (LOW_SIGNAL_PATHS.has(path)) return "debug";
  if (status >= 400) return "info";
  return "debug";
}

export function createLoggerPlugin(logger: Logger) {
  return new Elysia({ name: "logger" })
    .derive(() => ({ startAt: Date.now() }))
    .onAfterHandle(({ request, set, startAt }) => {
      const durationMs = Date.now() - (startAt ?? Date.now());
      const url = new URL(request.url);
      const status = Number(set.status ?? 200);
      const requestId =
        (set.headers["x-request-id"] as string | undefined) ??
        request.headers.get("x-request-id") ??
        "unknown";

      const level = resolveRequestLogLevel(url.pathname, status, durationMs);
      const traceContext = getActiveTraceContext();
      const msg =
        status >= 500
          ? "request_error"
          : durationMs >= SLOW_REQUEST_WARN_MS
            ? "request_slow"
            : status >= 400
              ? "request_client_error"
              : "request";

      writeWithLevel(logger, level, {
        msg,
        requestId,
        method: request.method,
        path: url.pathname,
        status,
        durationMs,
        trace_id: traceContext.traceId,
        span_id: traceContext.spanId,
      });
    })
    .onError(({ request, set, startAt, error }) => {
      const durationMs = Date.now() - (startAt ?? Date.now());
      const url = new URL(request.url);
      const status = Number(set.status ?? 500);
      const traceContext = getActiveTraceContext();
      const requestId =
        (set.headers["x-request-id"] as string | undefined) ??
        request.headers.get("x-request-id") ??
        "unknown";

      logger.error({
        msg: "request_error",
        requestId,
        method: request.method,
        path: url.pathname,
        status,
        durationMs,
        trace_id: traceContext.traceId,
        span_id: traceContext.spanId,
        error: error instanceof Error ? error.message : String(error),
      });
    })
    .as("global");
}
