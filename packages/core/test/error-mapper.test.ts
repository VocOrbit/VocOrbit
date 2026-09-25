import { describe, expect, it } from "bun:test";
import { AppError, NotFoundError, ValidationError } from "../src/errors";
import { mapError } from "../src/http/errors";

describe("mapError", () => {
  it("returns AppError unchanged", () => {
    const err = new ValidationError("bad");
    const mapped = mapError(err);
    expect(mapped).toBe(err);
  });

  it("maps VALIDATION code", () => {
    const mapped = mapError(new Error("oops"), "VALIDATION");
    expect(mapped).toBeInstanceOf(ValidationError);
  });

  it("maps NOT_FOUND code", () => {
    const mapped = mapError(new Error("oops"), "NOT_FOUND");
    expect(mapped).toBeInstanceOf(NotFoundError);
  });

  it("maps unknown to internal", () => {
    const mapped = mapError(new Error("oops"));
    expect(mapped).toBeInstanceOf(AppError);
    expect(mapped.code).toBe("INTERNAL_ERROR");
  });
});
