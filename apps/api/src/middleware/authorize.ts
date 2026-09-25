import { Elysia } from "elysia";
import { createAuthz } from "../../../../packages/core/src/http/authz";

type AuthorizationContext = {
  auth?: {
    user?: {
      id?: string;
      role?: string;
    };
  };
};

export function createAuthorizePlugin() {
  return new Elysia({ name: "api-authorize" })
    .derive((context) => ({
      authz: createAuthz(context as AuthorizationContext),
    }))
    .as("global");
}
