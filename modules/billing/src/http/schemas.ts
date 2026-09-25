import { t } from "elysia";

export const billingStoreSchema = t.Union([t.Literal("apple"), t.Literal("google")]);

export const billingWebhookParamsSchema = t.Object({
  store: billingStoreSchema,
});

export const billingVerifyReceiptBodySchema = t.Object(
  {
    store: billingStoreSchema,
    receipt: t.String({ minLength: 1, maxLength: 20_000 }),
  },
  { additionalProperties: false },
);

export const billingWebhookBodySchema = t.Object(
  {
    eventId: t.String({ minLength: 1, maxLength: 255 }),
    userId: t.Optional(t.String({ minLength: 1 })),
    purchaseToken: t.String({ minLength: 1, maxLength: 500 }),
    originalTransactionId: t.Optional(t.String({ minLength: 1, maxLength: 500 })),
    sku: t.String({ minLength: 1, maxLength: 255 }),
    status: t.Union([
      t.Literal("pending"),
      t.Literal("active"),
      t.Literal("expired"),
      t.Literal("canceled"),
      t.Literal("refunded"),
    ]),
    startsAt: t.Optional(t.String({ minLength: 1, maxLength: 64 })),
    expiresAt: t.Optional(t.String({ minLength: 1, maxLength: 64 })),
    rawPayload: t.Optional(t.Record(t.String(), t.Unknown())),
  },
  { additionalProperties: false },
);

export const billingWebhookRawBodySchema = t.Unknown();
