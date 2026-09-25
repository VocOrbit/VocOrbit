import type {
  BillingApplyResult,
  BillingSkuPlan,
  BillingStore,
  BillingSubscriptionState,
} from "../domain/billing";
import type { VerifiedReceipt } from "./receipt-verifier";

export type ApplyBillingReceiptInput = {
  userId: string;
  eventId: string;
  source: "receipt" | "webhook";
  receipt: VerifiedReceipt;
  skuPlan: BillingSkuPlan;
};

export interface BillingPurchaseRepo {
  applyReceipt(input: ApplyBillingReceiptInput): Promise<BillingApplyResult>;
  getUserSubscription(userId: string): Promise<BillingSubscriptionState>;
  resolveUserIdByPurchase(store: BillingStore, purchaseToken: string): Promise<string | null>;
}
