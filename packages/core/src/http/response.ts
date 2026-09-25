import type { ErrorCode } from "../errors";

export type ResponseMeta = Record<string, unknown>;

export type CursorPaginationMeta = {
  nextCursor: string;
};

export type SuccessResponse<T, TMeta extends ResponseMeta = ResponseMeta> = {
  data: T;
  meta?: TMeta;
};

export type ErrorResponse = {
  error: { code: ErrorCode; message: string; requestId: string; details?: unknown };
};

export function ok<T>(data: T, meta?: Record<string, unknown>): SuccessResponse<T> {
  if (meta) return { data, meta };
  return { data };
}

export function cursorMeta(nextCursor?: string): CursorPaginationMeta | undefined {
  if (!nextCursor) return undefined;
  return { nextCursor };
}

export function fail(
  code: ErrorCode,
  message: string,
  requestId: string,
  details?: unknown,
): ErrorResponse {
  return { error: { code, message, requestId, details } };
}
