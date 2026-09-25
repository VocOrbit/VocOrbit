import { t } from "elysia";

export function createExplainWordBodySchema(input?: {
  maxSentenceChars?: number;
  maxSelectedWordChars?: number;
}) {
  const maxSentenceChars =
    typeof input?.maxSentenceChars === "number" && input.maxSentenceChars > 0
      ? Math.floor(input.maxSentenceChars)
      : 280;
  const maxSelectedWordChars =
    typeof input?.maxSelectedWordChars === "number" && input.maxSelectedWordChars > 0
      ? Math.floor(input.maxSelectedWordChars)
      : 120;

  return t.Object(
    {
      mode: t.Optional(t.Union([t.Literal("basic"), t.Literal("advanced")])),
      sentence: t.String({ minLength: 1, maxLength: maxSentenceChars }),
      selectedWord: t.String({ minLength: 1, maxLength: maxSelectedWordChars }),
      sourceLang: t.Optional(t.String({ minLength: 2, maxLength: 16 })),
      targetLang: t.Optional(t.String({ minLength: 2, maxLength: 16 })),
    },
    { additionalProperties: false },
  );
}

export const listLearningItemsQuerySchema = t.Object(
  {
    status: t.Optional(
      t.Union([t.Literal("active"), t.Literal("learned"), t.Literal("deleted"), t.Literal("all")]),
    ),
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
    favorite: t.Optional(t.Union([t.Literal("true"), t.Literal("false")])),
    q: t.Optional(t.String({ minLength: 1, maxLength: 120 })),
  },
  { additionalProperties: false },
);

export const learningItemParamsSchema = t.Object({
  id: t.String({ minLength: 1 }),
});

export const learningItemGroupParamsSchema = t.Object({
  id: t.String({ minLength: 1 }),
});

export const learningItemGroupItemParamsSchema = t.Object({
  id: t.String({ minLength: 1 }),
  itemId: t.String({ minLength: 1 }),
});

export const learningItemGroupBodySchema = t.Object(
  {
    name: t.String({ minLength: 1, maxLength: 80 }),
  },
  { additionalProperties: false },
);

export const learningItemGroupItemsBodySchema = t.Object(
  {
    itemIds: t.Array(t.String({ minLength: 1 }), { minItems: 1, maxItems: 100 }),
  },
  { additionalProperties: false },
);

export const listLearningItemGroupItemsQuerySchema = t.Object(
  {
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
  },
  { additionalProperties: false },
);

export const reportLearningItemIssueBodySchema = t.Object(
  {
    message: t.String({ minLength: 8, maxLength: 1_000 }),
  },
  { additionalProperties: false },
);

export const wordInsightJobParamsSchema = t.Object({
  id: t.String({ minLength: 1 }),
});

export const wordInsightJobQuerySchema = t.Object(
  {
    includeInsight: t.Optional(t.Union([t.Literal("true"), t.Literal("false")])),
  },
  { additionalProperties: false },
);
