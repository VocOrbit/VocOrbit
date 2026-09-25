import type { BillingSubscriptionState } from "../domain/billing";
import type { BillingPurchaseRepo } from "../ports/purchase-repo";

export async function getSubscriptionState(
  purchases: BillingPurchaseRepo,
  userId: string,
): Promise<BillingSubscriptionState> {
  return await purchases.getUserSubscription(userId);
}
