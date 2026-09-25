import { Elysia } from "elysia";
import { ok } from "../../../../packages/core/src/http/response";
import type { UsersPublicContract } from "../public-contract";
import { type UsersRouteContext, type UsersRouteOptions, resolveAuthz } from "./route-shared";
import { languagePreferencesBodySchema, userIdParamsSchema } from "./schemas";

export function createUsersPreferenceRoutes(
  users: UsersPublicContract,
  options: UsersRouteOptions,
) {
  return new Elysia({ name: "users-preference-routes" })
    .get(
      "/users/:id/preferences/language",
      async (context) => {
        const { params } = context;
        const authz = resolveAuthz(options, context as UsersRouteContext);
        authz?.requireSelfOrAdminOr404(params.id);

        const preferences = await users.getLanguagePreferences(params.id);
        return ok(preferences);
      },
      { params: userIdParamsSchema },
    )
    .put(
      "/users/:id/preferences/language",
      async (context) => {
        const { params, body } = context;
        const authz = resolveAuthz(options, context as UsersRouteContext);
        authz?.requireSelfOrAdminOr404(params.id);

        const preferences = await users.setLanguagePreferences({
          userId: params.id,
          l1Language: body.l1Language,
          l2Language: body.l2Language,
        });
        return ok(preferences);
      },
      { params: userIdParamsSchema, body: languagePreferencesBodySchema },
    );
}
