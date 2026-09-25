import type { BillingWebhookVerifier } from "../../../modules/billing/src/ports/webhook-verifier";
import { assertWebhookSecret, parseWebhookPayload } from "../../../modules/billing/src/use-cases/webhook-shared";

type TestWebhookVerifierConfig = {
  webhookSecret?: string;
};

function normalizeHeaders(
  headers: Record<string, string | undefined>,
): Record<string, string | undefined> {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

export function createTestWebhookVerifier(
  config: TestWebhookVerifierConfig = {},
): BillingWebhookVerifier {
  return {
    async verifyWebhook(input) {
      const normalizedHeaders = normalizeHeaders(input.headers);
      assertWebhookSecret(normalizedHeaders, config.webhookSecret);
      const parsed = parseWebhookPayload(input.body);
      return {
        store: input.store,
        eventId: parsed.eventId,
        userId: parsed.userId,
        purchaseToken: parsed.purchaseToken,
        originalTransactionId: parsed.originalTransactionId,
        sku: parsed.sku,
        status: parsed.status,
        startsAt: parsed.startsAt,
        expiresAt: parsed.expiresAt,
        rawPayload: parsed.rawPayload,
      };
    },
  };
}
