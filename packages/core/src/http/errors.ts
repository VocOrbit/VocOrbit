import { AppError, NotFoundError, ValidationError } from "../errors";

export function mapError(error: unknown, code?: string): AppError {
  if (error instanceof AppError) return error;

  if (code === "NOT_FOUND") {
    return new NotFoundError();
  }

  if (code === "VALIDATION" || code === "PARSE") {
    const details =
      (error as { all?: unknown; errors?: unknown })?.all ??
      (error as { errors?: unknown })?.errors;
    return new ValidationError("Validation failed", details);
  }

  return new AppError("INTERNAL_ERROR", 500, "Internal server error");
}
