import { ValidationError } from "../../../../packages/core/src/errors";
import type { BillingApplyResult, BillingStore } from "../domain/billing";
import type { BillingPurchaseRepo } from "../ports/purchase-repo";
import type { BillingSkuCatalog } from "../ports/sku-catalog";
import type { BillingWebhookVerifier } from "../ports/webhook-verifier";
import { resolveWebhookUserId } from "./webhook-shared";

type WebhookDeps = {
  purchases: BillingPurchaseRepo;
  skuCatalog: BillingSkuCatalog;
  webhookVerifier: BillingWebhookVerifier;
};

export async function handleWebhook(
  deps: WebhookDeps,
  input: {
    store: BillingStore;
    headers: Record<string, string | undefined>;
    body: unknown;
  },
): Promise<BillingApplyResult> {
  const payload = await deps.webhookVerifier.verifyWebhook({
    store: input.store,
    headers: input.headers,
    body: input.body,
  });

  if (payload.store !== input.store) {
    throw new ValidationError("Webhook store mismatch");
  }

  const skuPlan = deps.skuCatalog.find(input.store, payload.sku);
  if (!skuPlan) {
    throw new ValidationError(`Unsupported SKU for ${input.store}: ${payload.sku}`);
  }

  const userId = await resolveWebhookUserId({
    purchases: deps.purchases,
    store: input.store,
    purchaseToken: payload.purchaseToken,
    userId: payload.userId,
  });

  return await deps.purchases.applyReceipt({
    userId,
    eventId: payload.eventId,
    source: "webhook",
    receipt: {
      store: input.store,
      sku: payload.sku,
      status: payload.status,
      purchaseToken: payload.purchaseToken,
      originalTransactionId: payload.originalTransactionId,
      startsAt: payload.startsAt,
      expiresAt: payload.expiresAt,
      rawPayload: payload.rawPayload,
    },
    skuPlan,
  });
}
