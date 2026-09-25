import type { BillingSkuPlan } from "../domain/billing";
import type { BillingSkuCatalog } from "../ports/sku-catalog";

export function getSkuCatalog(skuCatalog: BillingSkuCatalog): BillingSkuPlan[] {
  return skuCatalog.list();
}
