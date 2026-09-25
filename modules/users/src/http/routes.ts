import { Elysia } from "elysia";
import type { UsersPublicContract } from "../public-contract";
import { createUsersCrudRoutes } from "./crud-routes";
import { createUsersPreferenceRoutes } from "./preferences-routes";
import { type UsersRouteOptions, resolveUsersRouteDetail } from "./route-shared";

export function createUsersRoutes(users: UsersPublicContract, options: UsersRouteOptions = {}) {
  return new Elysia({
    name: "users-routes",
    detail: resolveUsersRouteDetail(options),
  })
    .use(createUsersPreferenceRoutes(users, options))
    .use(createUsersCrudRoutes(users, options));
}
