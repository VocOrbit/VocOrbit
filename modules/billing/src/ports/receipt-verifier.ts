import type { BillingStore, BillingSubscriptionStatus } from "../domain/billing";

export type VerifiedReceipt = {
  store: BillingStore;
  sku: string;
  status: Exclude<BillingSubscriptionStatus, "none">;
  purchaseToken: string;
  originalTransactionId?: string;
  startsAt: string;
  expiresAt?: string;
  rawPayload: Record<string, unknown>;
};

export interface BillingReceiptVerifier {
  verifyReceipt(input: { store: BillingStore; receipt: string }): Promise<VerifiedReceipt>;
}
