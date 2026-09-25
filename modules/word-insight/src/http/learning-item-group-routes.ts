import { Elysia } from "elysia";
import { ok } from "../../../../packages/core/src/http/response";
import type { WordInsightPublicContract } from "../public-contract";
import {
  type WordInsightRouteOptions,
  resolveGroupId,
  resolveGroupItemId,
  resolveListLimit,
  resolveListOffset,
  resolveRequestUser,
  resolveRouteDetail,
} from "./route-shared";
import {
  learningItemGroupBodySchema,
  learningItemGroupItemParamsSchema,
  learningItemGroupItemsBodySchema,
  learningItemGroupParamsSchema,
  listLearningItemGroupItemsQuerySchema,
} from "./schemas";

export function createWordInsightLearningItemGroupRoutes(
  wordInsight: WordInsightPublicContract,
  options: WordInsightRouteOptions = {},
) {
  return new Elysia({
    name: "word-insight-learning-item-group-routes",
    detail: resolveRouteDetail(options),
  })
    .get(
      "/word-insight/groups",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const groups = await wordInsight.listLearningItemGroups({
          userId: user.id,
        });
        return ok(groups);
      },
      {
        detail: {
          summary: "List current user's learning item groups",
        },
      },
    )
    .post(
      "/word-insight/groups",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const group = await wordInsight.createLearningItemGroup({
          userId: user.id,
          name: context.body.name,
        });
        return ok(group);
      },
      {
        body: learningItemGroupBodySchema,
        detail: {
          summary: "Create a learning item group",
        },
      },
    )
    .patch(
      "/word-insight/groups/:id",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const group = await wordInsight.updateLearningItemGroup({
          userId: user.id,
          groupId: resolveGroupId(context),
          name: context.body.name,
        });
        return ok(group);
      },
      {
        params: learningItemGroupParamsSchema,
        body: learningItemGroupBodySchema,
        detail: {
          summary: "Rename a learning item group",
        },
      },
    )
    .delete(
      "/word-insight/groups/:id",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const result = await wordInsight.deleteLearningItemGroup({
          userId: user.id,
          groupId: resolveGroupId(context),
        });
        return ok(result);
      },
      {
        params: learningItemGroupParamsSchema,
        detail: {
          summary: "Delete a learning item group",
        },
      },
    )
    .get(
      "/word-insight/groups/:id/items",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const items = await wordInsight.listLearningItemsByGroup({
          userId: user.id,
          groupId: resolveGroupId(context),
          limit: resolveListLimit(context),
          offset: resolveListOffset(context),
        });
        return ok(items);
      },
      {
        params: learningItemGroupParamsSchema,
        query: listLearningItemGroupItemsQuerySchema,
        detail: {
          summary: "List learning items in a group",
        },
      },
    )
    .put(
      "/word-insight/groups/:id/items",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const group = await wordInsight.addLearningItemsToGroup({
          userId: user.id,
          groupId: resolveGroupId(context),
          itemIds: context.body.itemIds,
        });
        return ok(group);
      },
      {
        params: learningItemGroupParamsSchema,
        body: learningItemGroupItemsBodySchema,
        detail: {
          summary: "Add multiple learning items to a group",
        },
      },
    )
    .post(
      "/word-insight/groups/:id/items/:itemId",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const group = await wordInsight.addLearningItemToGroup({
          userId: user.id,
          groupId: resolveGroupId(context),
          itemId: resolveGroupItemId(context),
        });
        return ok(group);
      },
      {
        params: learningItemGroupItemParamsSchema,
        detail: {
          summary: "Add a learning item to a group",
        },
      },
    )
    .delete(
      "/word-insight/groups/:id/items/:itemId",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const group = await wordInsight.removeLearningItemFromGroup({
          userId: user.id,
          groupId: resolveGroupId(context),
          itemId: resolveGroupItemId(context),
        });
        return ok(group);
      },
      {
        params: learningItemGroupItemParamsSchema,
        detail: {
          summary: "Remove a learning item from a group",
        },
      },
    );
}
