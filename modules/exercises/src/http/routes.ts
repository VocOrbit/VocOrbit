import { Elysia } from "elysia";
import { ok } from "../../../../packages/core/src/http/response";
import type { ExercisesPublicContract } from "../public-contract";
import {
  type ExercisesRouteOptions,
  resolveRequestUser,
  resolveRouteDetail,
  resolveTimezoneOffsetMinutesQuery,
} from "./route-shared";
import {
  createExerciseSessionBodySchema,
  exerciseAnswerBodySchema,
  exerciseCatalogQuerySchema,
  exerciseSessionParamsSchema,
  exerciseTodayPlanQuerySchema,
  exerciseWeeklyAnalyticsQuerySchema,
} from "./schemas";

function resolveGroupIdsQuery(input: unknown): string[] | undefined {
  if (Array.isArray(input)) {
    const ids = input.flatMap((value) =>
      typeof value === "string" ? value.split(",") : [],
    );
    const normalized = ids.map((id) => id.trim()).filter((id) => id.length > 0);
    return normalized.length > 0 ? normalized : undefined;
  }

  if (typeof input !== "string") return undefined;

  const normalized = input
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
  return normalized.length > 0 ? normalized : undefined;
}

export function createExercisesRoutes(
  exercises: ExercisesPublicContract,
  options: ExercisesRouteOptions = {},
) {
  return new Elysia({
    name: "exercises-routes",
    detail: resolveRouteDetail(options),
  })
    .get(
      "/exercises/catalog",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const result = await exercises.getCatalog({
          userId: user.id,
          mode: context.query.mode,
          timezoneOffsetMinutes: resolveTimezoneOffsetMinutesQuery(context),
          groupIds: resolveGroupIdsQuery(context.query.groupIds),
        });
        return ok(result);
      },
      {
        query: exerciseCatalogQuerySchema,
        detail: {
          summary: "Get exercise question catalog and availability",
        },
      },
    )
    .get(
      "/exercises/today-plan",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const result = await exercises.getTodayPlan({
          userId: user.id,
          mode: context.query.mode,
          timezoneOffsetMinutes: resolveTimezoneOffsetMinutesQuery(context),
        });
        return ok(result);
      },
      {
        query: exerciseTodayPlanQuerySchema,
        detail: {
          summary: "Get exercise plan metrics for today's words",
        },
      },
    )
    .get(
      "/exercises/analytics/weekly",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const result = await exercises.getWeeklyAnalytics({
          userId: user.id,
          mode: context.query.mode,
          timezoneOffsetMinutes: resolveTimezoneOffsetMinutesQuery(context),
        });
        return ok(result);
      },
      {
        query: exerciseWeeklyAnalyticsQuerySchema,
        detail: {
          summary: "Get weekly exercise analytics",
        },
      },
    )
    .post(
      "/exercises/sessions",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const detail = await exercises.createSession(
          {
            mode: context.body.mode,
            totalQuestions: context.body.totalQuestions,
            todayMinimum: context.body.todayMinimum,
            timezoneOffsetMinutes: context.body.timezoneOffsetMinutes,
            promptLanguage: context.body.promptLanguage,
            questionTypes: context.body.questionTypes,
            groupIds: context.body.groupIds,
          },
          {
            user: {
              id: user.id,
            },
          },
        );
        return ok(detail);
      },
      {
        body: createExerciseSessionBodySchema,
        detail: {
          summary: "Create an exercise session from user's learning items",
        },
      },
    )
    .get(
      "/exercises/sessions/:id",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const detail = await exercises.getSession({
          sessionId: context.params.id,
          userId: user.id,
        });
        return ok(detail);
      },
      {
        params: exerciseSessionParamsSchema,
        detail: {
          summary: "Get exercise session detail",
        },
      },
    )
    .post(
      "/exercises/sessions/:id/answers",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const result = await exercises.submitAnswer({
          sessionId: context.params.id,
          questionId: context.body.questionId,
          userId: user.id,
          answer: context.body.answer,
        });
        return ok(result);
      },
      {
        params: exerciseSessionParamsSchema,
        body: exerciseAnswerBodySchema,
        detail: {
          summary: "Submit answer for an exercise question",
        },
      },
    )
    .post(
      "/exercises/sessions/:id/complete",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const completed = await exercises.completeSession({
          sessionId: context.params.id,
          userId: user.id,
        });
        return ok(completed);
      },
      {
        params: exerciseSessionParamsSchema,
        detail: {
          summary: "Complete an exercise session",
        },
      },
    );
}
