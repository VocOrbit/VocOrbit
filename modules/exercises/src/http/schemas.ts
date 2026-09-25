import { t } from "elysia";

export const exerciseSessionParamsSchema = t.Object({
  id: t.String({ minLength: 1 }),
});

export const createExerciseSessionBodySchema = t.Object(
  {
    mode: t.Optional(t.Union([t.Literal("basic"), t.Literal("advanced")])),
    totalQuestions: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
    todayMinimum: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
    timezoneOffsetMinutes: t.Optional(t.Number({ minimum: -840, maximum: 840 })),
    promptLanguage: t.Optional(t.String({ minLength: 2, maxLength: 16 })),
    questionTypes: t.Optional(
      t.Array(
        t.Union([
          t.Literal("meaning_match"),
          t.Literal("fill_in_gap"),
          t.Literal("guess_word"),
          t.Literal("match_synonym"),
        ]),
        { minItems: 1, maxItems: 4 },
      ),
    ),
    groupIds: t.Optional(t.Array(t.String({ minLength: 1 }), { minItems: 1, maxItems: 20 })),
  },
  { additionalProperties: false },
);

export const exerciseAnswerBodySchema = t.Object(
  {
    questionId: t.String({ minLength: 1 }),
    answer: t.String({ minLength: 1, maxLength: 500 }),
  },
  { additionalProperties: false },
);

export const exerciseTodayPlanQuerySchema = t.Object(
  {
    mode: t.Optional(t.Union([t.Literal("basic"), t.Literal("advanced")])),
    timezoneOffsetMinutes: t.Optional(t.String()),
  },
  { additionalProperties: false },
);

export const exerciseCatalogQuerySchema = t.Object(
  {
    mode: t.Optional(t.Union([t.Literal("basic"), t.Literal("advanced")])),
    timezoneOffsetMinutes: t.Optional(t.String()),
    groupIds: t.Optional(t.Union([t.String(), t.Array(t.String({ minLength: 1 }))])),
  },
  { additionalProperties: false },
);

export const exerciseWeeklyAnalyticsQuerySchema = t.Object(
  {
    mode: t.Optional(t.Union([t.Literal("basic"), t.Literal("advanced")])),
    timezoneOffsetMinutes: t.Optional(t.String()),
  },
  { additionalProperties: false },
);
