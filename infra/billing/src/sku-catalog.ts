import type { BillingSkuPlan, BillingStore } from "../../../modules/billing/src/domain/billing";
import type { BillingSkuCatalog } from "../../../modules/billing/src/ports/sku-catalog";

type CatalogConfig = {
  catalogJson?: string;
};

type RawCatalogItem = {
  store?: unknown;
  sku?: unknown;
  monthlyPaidBasicTopup?: unknown;
  monthlyPaidAdvancedTopup?: unknown;
  paidBasicCap?: unknown;
  paidAdvancedCap?: unknown;
};

const DEFAULT_CATALOG: BillingSkuPlan[] = [
  {
    store: "google",
    sku: "premium.monthly",
    monthlyPaidBasicTopup: 300,
    monthlyPaidAdvancedTopup: 100,
    paidBasicCap: 1200,
    paidAdvancedCap: 600,
  },
  {
    store: "apple",
    sku: "premium.monthly",
    monthlyPaidBasicTopup: 300,
    monthlyPaidAdvancedTopup: 100,
    paidBasicCap: 1200,
    paidAdvancedCap: 600,
  },
  {
    store: "google",
    sku: "premium_plus.monthly",
    monthlyPaidBasicTopup: 900,
    monthlyPaidAdvancedTopup: 250,
    paidBasicCap: 3600,
    paidAdvancedCap: 1500,
  },
  {
    store: "apple",
    sku: "premium_plus.monthly",
    monthlyPaidBasicTopup: 900,
    monthlyPaidAdvancedTopup: 250,
    paidBasicCap: 3600,
    paidAdvancedCap: 1500,
  },
];

function parseStore(value: unknown): BillingStore | null {
  if (value === "apple" || value === "google") return value;
  return null;
}

function parseNonNegativeInteger(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.floor(parsed);
}

function parseCatalogJson(catalogJson: string): BillingSkuPlan[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(catalogJson);
  } catch {
    throw new Error("Invalid BILLING_SKU_CATALOG_JSON (must be valid JSON)");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Invalid BILLING_SKU_CATALOG_JSON (must be an array)");
  }

  const items: BillingSkuPlan[] = [];
  for (const item of parsed as RawCatalogItem[]) {
    const store = parseStore(item.store);
    const sku = typeof item.sku === "string" ? item.sku.trim() : "";
    const monthlyPaidBasicTopup = parseNonNegativeInteger(item.monthlyPaidBasicTopup);
    const monthlyPaidAdvancedTopup = parseNonNegativeInteger(item.monthlyPaidAdvancedTopup);
    const paidBasicCap = parseNonNegativeInteger(item.paidBasicCap);
    const paidAdvancedCap = parseNonNegativeInteger(item.paidAdvancedCap);

    if (
      !store ||
      !sku ||
      monthlyPaidBasicTopup === null ||
      monthlyPaidAdvancedTopup === null ||
      paidBasicCap === null ||
      paidAdvancedCap === null
    ) {
      throw new Error("Invalid BILLING_SKU_CATALOG_JSON item");
    }

    items.push({
      store,
      sku,
      monthlyPaidBasicTopup,
      monthlyPaidAdvancedTopup,
      paidBasicCap,
      paidAdvancedCap,
    });
  }

  return items;
}

export function createBillingSkuCatalog(config: CatalogConfig = {}): BillingSkuCatalog {
  const plans = config.catalogJson?.trim()
    ? parseCatalogJson(config.catalogJson)
    : [...DEFAULT_CATALOG];

  const map = new Map<string, BillingSkuPlan>();
  for (const plan of plans) {
    map.set(`${plan.store}:${plan.sku}`, plan);
  }

  return {
    list() {
      return [...plans];
    },
    find(store, sku) {
      return map.get(`${store}:${sku}`) ?? null;
    },
  };
}
