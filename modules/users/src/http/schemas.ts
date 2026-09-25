import { t } from "elysia";

export const userIdParamsSchema = t.Object({
  id: t.String({ minLength: 1 }),
});

export const createUserBodySchema = t.Object(
  {
    email: t.String({ format: "email" }),
    name: t.String({ minLength: 1, maxLength: 200 }),
  },
  { additionalProperties: false },
);

export const updateUserBodySchema = t.Partial(
  t.Object(
    {
      email: t.String({ format: "email" }),
      name: t.String({ minLength: 1, maxLength: 200 }),
    },
    { additionalProperties: false },
  ),
);

export const listUsersQuerySchema = t.Object(
  {
    limit: t.Optional(t.String()),
    cursor: t.Optional(t.String()),
  },
  { additionalProperties: false },
);

export const languagePreferencesBodySchema = t.Object(
  {
    l1Language: t.String({ minLength: 2, maxLength: 16 }),
    l2Language: t.String({ minLength: 2, maxLength: 16 }),
  },
  { additionalProperties: false },
);
