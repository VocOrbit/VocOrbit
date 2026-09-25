import { ValidationError } from "../../../../packages/core/src/errors";
import type { BillingApplyResult, BillingStore } from "../domain/billing";
import type { BillingPurchaseRepo } from "../ports/purchase-repo";
import type { BillingReceiptVerifier } from "../ports/receipt-verifier";
import type { BillingSkuCatalog } from "../ports/sku-catalog";

type VerifyReceiptDeps = {
  verifier: BillingReceiptVerifier;
  skuCatalog: BillingSkuCatalog;
  purchases: BillingPurchaseRepo;
};

export async function verifyReceipt(
  deps: VerifyReceiptDeps,
  input: {
    userId: string;
    store: BillingStore;
    receipt: string;
  },
): Promise<BillingApplyResult> {
  const verified = await deps.verifier.verifyReceipt({
    store: input.store,
    receipt: input.receipt,
  });

  if (verified.store !== input.store) {
    throw new ValidationError("Receipt store mismatch");
  }

  const skuPlan = deps.skuCatalog.find(input.store, verified.sku);
  if (!skuPlan) {
    throw new ValidationError(`Unsupported SKU for ${input.store}: ${verified.sku}`);
  }

  const eventId = [
    "receipt",
    input.store,
    verified.purchaseToken,
    verified.sku,
    verified.status,
    verified.startsAt,
    verified.expiresAt ?? "",
  ].join(":");

  return await deps.purchases.applyReceipt({
    userId: input.userId,
    eventId,
    source: "receipt",
    receipt: verified,
    skuPlan,
  });
}
