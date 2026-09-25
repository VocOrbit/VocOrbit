import type {
  BillingApplyResult,
  BillingSkuPlan,
  BillingStore,
  BillingSubscriptionState,
} from "./domain/billing";
import type { BillingPurchaseRepo } from "./ports/purchase-repo";
import type { BillingReceiptVerifier } from "./ports/receipt-verifier";
import type { BillingSkuCatalog } from "./ports/sku-catalog";
import type { BillingWebhookVerifier } from "./ports/webhook-verifier";
import { getSkuCatalog } from "./use-cases/get-sku-catalog";
import { getSubscriptionState } from "./use-cases/get-subscription-state";
import { handleWebhook } from "./use-cases/handle-webhook";
import { verifyReceipt } from "./use-cases/verify-receipt";

type BillingDeps = {
  verifier: BillingReceiptVerifier;
  webhookVerifier: BillingWebhookVerifier;
  skuCatalog: BillingSkuCatalog;
  purchases: BillingPurchaseRepo;
};

export interface BillingPublicContract {
  getSkuCatalog(): BillingSkuPlan[];
  getUserSubscription(userId: string): Promise<BillingSubscriptionState>;
  verifyReceipt(input: {
    userId: string;
    store: BillingStore;
    receipt: string;
  }): Promise<BillingApplyResult>;
  handleWebhook(input: {
    store: BillingStore;
    headers: Record<string, string | undefined>;
    body: unknown;
  }): Promise<BillingApplyResult>;
}

export function createBillingPublicContract(deps: BillingDeps): BillingPublicContract {
  return {
    getSkuCatalog() {
      return getSkuCatalog(deps.skuCatalog);
    },
    getUserSubscription(userId) {
      return getSubscriptionState(deps.purchases, userId);
    },
    verifyReceipt(input) {
      return verifyReceipt(deps, input);
    },
    handleWebhook(input) {
      return handleWebhook(deps, input);
    },
  };
}
