import { Elysia } from "elysia";
import { ok } from "../../../../packages/core/src/http/response";
import type { WordInsightPublicContract } from "../public-contract";
import {
  type WordInsightRouteOptions,
  resolveItemId,
  resolveListFavorite,
  resolveListLimit,
  resolveListOffset,
  resolveListQuery,
  resolveListStatus,
  resolveReportMessage,
  resolveRequestUser,
  resolveRouteDetail,
} from "./route-shared";
import {
  learningItemParamsSchema,
  listLearningItemsQuerySchema,
  reportLearningItemIssueBodySchema,
} from "./schemas";

export function createWordInsightLearningItemRoutes(
  wordInsight: WordInsightPublicContract,
  options: WordInsightRouteOptions = {},
) {
  return new Elysia({
    name: "word-insight-learning-item-routes",
    detail: resolveRouteDetail(options),
  })
    .get(
      "/word-insight/credits",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const credits = await wordInsight.getCreditBalances({ userId: user.id });
        return ok(credits);
      },
      {
        detail: {
          summary: "Get current user credit balances",
        },
      },
    )
    .get(
      "/word-insight/items",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const items = await wordInsight.listLearningItems({
          userId: user.id,
          status: resolveListStatus(context),
          limit: resolveListLimit(context),
          offset: resolveListOffset(context),
          favorite: resolveListFavorite(context),
          q: resolveListQuery(context),
        });
        return ok(items);
      },
      {
        query: listLearningItemsQuerySchema,
        detail: {
          summary: "List user learning items (default: active)",
        },
      },
    )
    .get(
      "/word-insight/mastery-summary",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const summary = await wordInsight.getLearningItemMasterySummary({
          userId: user.id,
        });
        return ok(summary);
      },
      {
        detail: {
          summary: "Get current user's learning item mastery summary",
        },
      },
    )
    .get(
      "/word-insight/items/mastery-summary",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const summary = await wordInsight.getLearningItemMasterySummary({
          userId: user.id,
        });
        return ok(summary);
      },
      {
        detail: {
          summary: "Get current user's learning item mastery summary",
        },
      },
    )
    .get(
      "/word-insight/items/:id/groups",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const groups = await wordInsight.listLearningItemGroupsForItem({
          userId: user.id,
          itemId: resolveItemId(context),
        });
        return ok(groups);
      },
      {
        params: learningItemParamsSchema,
        detail: {
          summary: "List groups containing a learning item",
        },
      },
    )
    .get(
      "/word-insight/items/:id",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const itemId = resolveItemId(context);
        if (itemId === "mastery-summary") {
          const summary = await wordInsight.getLearningItemMasterySummary({
            userId: user.id,
          });
          return ok(summary);
        }
        const detailResult = await wordInsight.getLearningItemDetail({
          userId: user.id,
          itemId,
        });
        return ok(detailResult);
      },
      {
        params: learningItemParamsSchema,
        detail: {
          summary: "Get learning item detail with latest lookup payload",
        },
      },
    )
    .post(
      "/word-insight/items/:id/favorite",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const item = await wordInsight.markLearningItemFavorite({
          userId: user.id,
          itemId: resolveItemId(context),
        });
        return ok(item);
      },
      {
        params: learningItemParamsSchema,
        detail: {
          summary: "Mark learning item as favorite",
        },
      },
    )
    .post(
      "/word-insight/items/:id/unfavorite",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const item = await wordInsight.unmarkLearningItemFavorite({
          userId: user.id,
          itemId: resolveItemId(context),
        });
        return ok(item);
      },
      {
        params: learningItemParamsSchema,
        detail: {
          summary: "Remove learning item from favorites",
        },
      },
    )
    .post(
      "/word-insight/items/:id/learned",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const item = await wordInsight.markLearningItemLearned({
          userId: user.id,
          itemId: resolveItemId(context),
        });
        return ok(item);
      },
      {
        params: learningItemParamsSchema,
        detail: {
          summary: "Mark learning item as learned",
        },
      },
    )
    .post(
      "/word-insight/items/:id/reopen",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const item = await wordInsight.reopenLearningItem({
          userId: user.id,
          itemId: resolveItemId(context),
        });
        return ok(item);
      },
      {
        params: learningItemParamsSchema,
        detail: {
          summary: "Move learned item back to active list",
        },
      },
    )
    .post(
      "/word-insight/items/:id/delete",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const item = await wordInsight.softDeleteLearningItem({
          userId: user.id,
          itemId: resolveItemId(context),
        });
        return ok(item);
      },
      {
        params: learningItemParamsSchema,
        detail: {
          summary: "Soft delete learning item for current user",
        },
      },
    )
    .post(
      "/word-insight/items/:id/report",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const report = await wordInsight.reportLearningItemIssue({
          userId: user.id,
          itemId: resolveItemId(context),
          message: resolveReportMessage(context),
        });
        return ok(report);
      },
      {
        params: learningItemParamsSchema,
        body: reportLearningItemIssueBodySchema,
        detail: {
          summary: "Report wrong translation or explanation for a learning item",
        },
      },
    );
}
