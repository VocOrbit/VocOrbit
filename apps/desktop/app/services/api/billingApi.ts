import { GeneralApiProblem } from "./apiProblem"
import { backendApiClient } from "./backendClient"

type ApiResult<T> = { kind: "ok"; data: T } | GeneralApiProblem

export type BillingStore = "apple" | "google"
export type BillingSubscriptionStatus =
  | "none"
  | "pending"
  | "active"
  | "expired"
  | "canceled"
  | "refunded"

export type BillingSkuPlan = {
  store: BillingStore
  sku: string
  monthlyPaidBasicTopup: number
  monthlyPaidAdvancedTopup: number
  paidBasicCap: number
  paidAdvancedCap: number
}

export type BillingSubscriptionState = {
  userId: string
  status: BillingSubscriptionStatus
  store?: BillingStore
  sku?: string
  purchaseToken?: string
  originalTransactionId?: string
  startsAt?: string
  expiresAt?: string
  lastEventId?: string
  updatedAt?: string
  plan?: BillingSkuPlan
}

export type BillingApplyResult = {
  applied: boolean
  source: "receipt" | "webhook"
  eventId: string
  purchaseId?: string
  subscription: BillingSubscriptionState
}

type VerifyBillingReceiptInput = {
  store: BillingStore
  receipt: string
}

class BillingApi {
  async listSkus(): Promise<ApiResult<BillingSkuPlan[]>> {
    return backendApiClient.get<BillingSkuPlan[]>("/v1/billing/skus")
  }

  async getSubscription(): Promise<ApiResult<BillingSubscriptionState>> {
    return backendApiClient.get<BillingSubscriptionState>("/v1/billing/subscription")
  }

  async verifyReceipt(input: VerifyBillingReceiptInput): Promise<ApiResult<BillingApplyResult>> {
    return backendApiClient.post<BillingApplyResult>("/v1/billing/receipts/verify", input)
  }
}

export const billingApi = new BillingApi()
