import { createHash } from "node:crypto";
import type {
  BillingStore,
  BillingSubscriptionStatus,
} from "../../../modules/billing/src/domain/billing";
import type {
  BillingReceiptVerifier,
  VerifiedReceipt,
} from "../../../modules/billing/src/ports/receipt-verifier";
import { ValidationError } from "../../../packages/core/src/errors";

type TestReceiptVerifierConfig = {
  allowTestReceipts: boolean;
};

type JsonReceiptPayload = {
  sku?: unknown;
  status?: unknown;
  purchaseToken?: unknown;
  originalTransactionId?: unknown;
  startsAt?: unknown;
  expiresAt?: unknown;
  rawPayload?: unknown;
};

const ALLOWED_STATUSES = new Set<BillingSubscriptionStatus>([
  "pending",
  "active",
  "expired",
  "canceled",
  "refunded",
]);

function parseStatus(value: unknown): Exclude<BillingSubscriptionStatus, "none"> {
  if (typeof value !== "string" || !ALLOWED_STATUSES.has(value as BillingSubscriptionStatus)) {
    throw new ValidationError("Invalid test receipt status");
  }
  return value as Exclude<BillingSubscriptionStatus, "none">;
}

function parseDate(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError("Invalid date in test receipt");
  }
  return parsed.toISOString();
}

function defaultPurchaseToken(store: BillingStore, receipt: string): string {
  const digest = createHash("sha256").update(receipt).digest("hex").slice(0, 24);
  return `${store}:${digest}`;
}

function parseColonFormatReceipt(store: BillingStore, receipt: string): VerifiedReceipt {
  const parts = receipt.split(":");
  const sku = parts[1]?.trim();
  const status = parseStatus(parts[2]);
  const durationRaw = parts[3];
  const purchaseToken = parts[4]?.trim() || defaultPurchaseToken(store, receipt);
  if (!sku) {
    throw new ValidationError("Invalid test receipt format");
  }

  const now = new Date();
  const startsAt = now.toISOString();
  const durationDays = durationRaw ? Number(durationRaw) : 30;
  const expiresAt =
    status === "active" && Number.isFinite(durationDays)
      ? new Date(now.getTime() + Math.max(1, durationDays) * 24 * 60 * 60 * 1_000).toISOString()
      : undefined;

  return {
    store,
    sku,
    status,
    purchaseToken,
    startsAt,
    expiresAt,
    rawPayload: {
      format: "test-receipt",
      receipt,
    },
  };
}

function parseJsonFormatReceipt(store: BillingStore, receipt: string): VerifiedReceipt {
  let parsed: unknown;
  try {
    parsed = JSON.parse(receipt) as JsonReceiptPayload;
  } catch {
    throw new ValidationError("Invalid test receipt JSON");
  }

  const body = parsed as JsonReceiptPayload;
  const sku = typeof body.sku === "string" ? body.sku.trim() : "";
  if (!sku) throw new ValidationError("Test receipt sku is required");

  const status = parseStatus(body.status ?? "active");
  const startsAt = parseDate(body.startsAt) ?? new Date().toISOString();
  const expiresAt = parseDate(body.expiresAt);
  const purchaseToken =
    typeof body.purchaseToken === "string" && body.purchaseToken.trim().length > 0
      ? body.purchaseToken.trim()
      : defaultPurchaseToken(store, receipt);

  return {
    store,
    sku,
    status,
    purchaseToken,
    originalTransactionId:
      typeof body.originalTransactionId === "string" ? body.originalTransactionId : undefined,
    startsAt,
    expiresAt,
    rawPayload:
      body.rawPayload && typeof body.rawPayload === "object" && !Array.isArray(body.rawPayload)
        ? (body.rawPayload as Record<string, unknown>)
        : { format: "json", receipt },
  };
}

export function createTestReceiptVerifier(
  config: TestReceiptVerifierConfig,
): BillingReceiptVerifier {
  return {
    async verifyReceipt(input) {
      if (!config.allowTestReceipts) {
        throw new ValidationError("Receipt verification provider is not configured");
      }

      const receipt = input.receipt.trim();
      if (!receipt) {
        throw new ValidationError("receipt is required");
      }

      if (receipt.startsWith("test-receipt:")) {
        return parseColonFormatReceipt(input.store, receipt);
      }

      if (receipt.startsWith("{")) {
        return parseJsonFormatReceipt(input.store, receipt);
      }

      throw new ValidationError("Unsupported test receipt format");
    },
  };
}
