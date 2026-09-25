import { describe, expect, it } from "bun:test";
import { NotFoundError, UnauthorizedError } from "../src/errors";
import { createAuthz } from "../src/http/authz";

describe("authz", () => {
  it("allows admin for admin-only policy", () => {
    const authz = createAuthz({
      auth: {
        user: {
          id: "u1",
          role: "admin",
        },
      },
    });

    expect(() => authz.requireAdminOr404()).not.toThrow();
  });

  it("returns 404 policy result for non-admin admin-only policy", () => {
    const authz = createAuthz({
      auth: {
        user: {
          id: "u1",
          role: "user",
        },
      },
    });

    expect(() => authz.requireAdminOr404()).toThrow(NotFoundError);
  });

  it("allows self for self-or-admin policy", () => {
    const authz = createAuthz({
      auth: {
        user: {
          id: "u1",
          role: "user",
        },
      },
    });

    expect(() => authz.requireSelfOrAdminOr404("u1")).not.toThrow();
  });

  it("returns 404 policy result for non-owner in self-or-admin policy", () => {
    const authz = createAuthz({
      auth: {
        user: {
          id: "u1",
          role: "user",
        },
      },
    });

    expect(() => authz.requireSelfOrAdminOr404("u2")).toThrow(NotFoundError);
  });

  it("throws unauthorized when auth user is missing", () => {
    expect(() => createAuthz({})).toThrow(UnauthorizedError);
  });
});
