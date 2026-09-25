import type { BillingStore, BillingSubscriptionStatus } from "../domain/billing";

export type VerifiedWebhookEvent = {
  store: BillingStore;
  eventId: string;
  userId?: string;
  purchaseToken: string;
  originalTransactionId?: string;
  sku: string;
  status: Exclude<BillingSubscriptionStatus, "none">;
  startsAt: string;
  expiresAt?: string;
  rawPayload: Record<string, unknown>;
};

export interface BillingWebhookVerifier {
  verifyWebhook(input: {
    store: BillingStore;
    headers: Record<string, string | undefined>;
    body: unknown;
  }): Promise<VerifiedWebhookEvent>;
}
