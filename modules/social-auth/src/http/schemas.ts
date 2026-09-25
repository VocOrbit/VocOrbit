import { t } from "elysia";

export const firebaseSignInBodySchema = t.Object(
  {
    idToken: t.String({ minLength: 1 }),
    referralCode: t.Optional(t.String({ minLength: 1, maxLength: 128 })),
  },
  { additionalProperties: false },
);

export const reviewSignInBodySchema = t.Object(
  {
    email: t.String({ minLength: 1, maxLength: 320 }),
    password: t.String({ minLength: 1, maxLength: 512 }),
  },
  { additionalProperties: false },
);

export const refreshSessionBodySchema = t.Object(
  {
    refreshToken: t.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);
