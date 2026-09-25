export type BillingStore = "apple" | "google";

export type BillingSubscriptionStatus =
  | "none"
  | "pending"
  | "active"
  | "expired"
  | "canceled"
  | "refunded";

export type BillingSkuPlan = {
  store: BillingStore;
  sku: string;
  monthlyPaidBasicTopup: number;
  monthlyPaidAdvancedTopup: number;
  paidBasicCap: number;
  paidAdvancedCap: number;
};

export type BillingSubscriptionState = {
  userId: string;
  status: BillingSubscriptionStatus;
  store?: BillingStore;
  sku?: string;
  purchaseToken?: string;
  originalTransactionId?: string;
  startsAt?: string;
  expiresAt?: string;
  lastEventId?: string;
  updatedAt?: string;
  plan?: BillingSkuPlan;
};

export type BillingApplyResult = {
  applied: boolean;
  source: "receipt" | "webhook";
  eventId: string;
  purchaseId?: string;
  subscription: BillingSubscriptionState;
};
