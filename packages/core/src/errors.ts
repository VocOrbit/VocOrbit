export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, status: number, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super("VALIDATION_ERROR", 400, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", details?: unknown) {
    super("NOT_FOUND", 404, message, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded", details?: unknown) {
    super("RATE_LIMITED", 429, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: unknown) {
    super("UNAUTHORIZED", 401, message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: unknown) {
    super("FORBIDDEN", 403, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super("CONFLICT", 409, message, details);
  }
}
