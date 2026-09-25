import type { BillingSkuPlan, BillingStore } from "../domain/billing";

export interface BillingSkuCatalog {
  list(): BillingSkuPlan[];
  find(store: BillingStore, sku: string): BillingSkuPlan | null;
}
