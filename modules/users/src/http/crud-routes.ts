import { Elysia } from "elysia";
import { cursorMeta, ok } from "../../../../packages/core/src/http/response";
import { decodeCursor, encodeCursor, toUserResponse } from "../mapper";
import type { UsersPublicContract } from "../public-contract";
import {
  type UsersRouteContext,
  type UsersRouteOptions,
  parseLimit,
  resolveAuthz,
  safeDelete,
  safeGet,
  safeSet,
  userCacheKey,
} from "./route-shared";
import {
  createUserBodySchema,
  listUsersQuerySchema,
  updateUserBodySchema,
  userIdParamsSchema,
} from "./schemas";

export function createUsersCrudRoutes(users: UsersPublicContract, options: UsersRouteOptions) {
  return new Elysia({ name: "users-crud-routes" })
    .get(
      "/users",
      async (context) => {
        const authz = resolveAuthz(options, context as UsersRouteContext);
        authz?.requireAdminOr404();
        const { query } = context;

        const limit = parseLimit(query.limit);
        const cursor = query.cursor ? decodeCursor(query.cursor) : undefined;

        const result = await users.listUsers({ limit, cursor });
        const data = result.items.map(toUserResponse);
        const meta = cursorMeta(result.nextCursor ? encodeCursor(result.nextCursor) : undefined);

        return ok(data, meta);
      },
      { query: listUsersQuerySchema },
    )
    .post(
      "/users",
      async (context) => {
        const authz = resolveAuthz(options, context as UsersRouteContext);
        authz?.requireAdminOr404();
        const { body } = context;

        const user = await users.createUser(body);
        const response = toUserResponse(user);
        await safeSet(options.cache, userCacheKey(user.id), response, options.cacheTtlMs);
        return ok(response);
      },
      { body: createUserBodySchema },
    )
    .get(
      "/users/:id",
      async (context) => {
        const { params } = context;
        const authz = resolveAuthz(options, context as UsersRouteContext);
        authz?.requireSelfOrAdminOr404(params.id);

        const key = userCacheKey(params.id);
        const cached = await safeGet<ReturnType<typeof toUserResponse>>(options.cache, key);
        if (cached) return ok(cached);

        const user = await users.getUser(params.id);
        const response = toUserResponse(user);
        await safeSet(options.cache, key, response, options.cacheTtlMs);
        return ok(response);
      },
      { params: userIdParamsSchema },
    )
    .patch(
      "/users/:id",
      async (context) => {
        const { params, body } = context;
        const authz = resolveAuthz(options, context as UsersRouteContext);
        authz?.requireSelfOrAdminOr404(params.id);

        const user = await users.updateUser({ id: params.id, ...body });
        const response = toUserResponse(user);
        await safeDelete(options.cache, userCacheKey(params.id));
        return ok(response);
      },
      { params: userIdParamsSchema, body: updateUserBodySchema },
    )
    .delete(
      "/users/:id",
      async (context) => {
        const { params } = context;
        const authz = resolveAuthz(options, context as UsersRouteContext);
        authz?.requireSelfOrAdminOr404(params.id);

        await users.deleteUser(params.id);
        await safeDelete(options.cache, userCacheKey(params.id));
        return ok({ id: params.id });
      },
      { params: userIdParamsSchema },
    );
}
