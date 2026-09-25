import { UnauthorizedError, ValidationError } from "../../../../packages/core/src/errors";
import type { BillingStore, BillingSubscriptionStatus } from "../domain/billing";
import type { BillingPurchaseRepo } from "../ports/purchase-repo";

type WebhookBody = {
  eventId?: unknown;
  userId?: unknown;
  purchaseToken?: unknown;
  originalTransactionId?: unknown;
  sku?: unknown;
  status?: unknown;
  startsAt?: unknown;
  expiresAt?: unknown;
  rawPayload?: unknown;
};

export type ParsedWebhookPayload = {
  eventId: string;
  userId?: string;
  purchaseToken: string;
  originalTransactionId?: string;
  sku: string;
  status: Exclude<BillingSubscriptionStatus, "none">;
  startsAt: string;
  expiresAt?: string;
  rawPayload: Record<string, unknown>;
};

function parseStatus(value: unknown): Exclude<BillingSubscriptionStatus, "none"> {
  if (
    value === "pending" ||
    value === "active" ||
    value === "expired" ||
    value === "canceled" ||
    value === "refunded"
  ) {
    return value;
  }
  throw new ValidationError("Invalid billing webhook status");
}

function asNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${field} is required`);
  }
  return value.trim();
}

function asOptionalNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseRawPayload(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function assertWebhookSecret(
  headers: Record<string, string | undefined>,
  webhookSecret?: string,
) {
  if (webhookSecret && headers["x-billing-webhook-secret"] !== webhookSecret) {
    throw new UnauthorizedError("Invalid billing webhook secret");
  }
}

export function parseWebhookPayload(body: unknown): ParsedWebhookPayload {
  const raw = (body ?? {}) as WebhookBody;
  const eventId = asNonEmptyString(raw.eventId, "eventId");
  const purchaseToken = asNonEmptyString(raw.purchaseToken, "purchaseToken");
  const sku = asNonEmptyString(raw.sku, "sku");
  const status = parseStatus(raw.status);
  const startsAt = asOptionalNonEmptyString(raw.startsAt) ?? new Date().toISOString();
  const expiresAt = asOptionalNonEmptyString(raw.expiresAt);
  const userId = asOptionalNonEmptyString(raw.userId);
  const originalTransactionId = asOptionalNonEmptyString(raw.originalTransactionId);

  return {
    eventId,
    userId,
    purchaseToken,
    originalTransactionId,
    sku,
    status,
    startsAt,
    expiresAt,
    rawPayload: parseRawPayload(raw.rawPayload),
  };
}

export async function resolveWebhookUserId(input: {
  purchases: BillingPurchaseRepo;
  store: BillingStore;
  purchaseToken: string;
  userId?: string;
}): Promise<string> {
  if (input.userId) return input.userId;
  const resolvedUserId = await input.purchases.resolveUserIdByPurchase(
    input.store,
    input.purchaseToken,
  );
  if (resolvedUserId) return resolvedUserId;
  throw new ValidationError("userId is required for unknown purchase token");
}
