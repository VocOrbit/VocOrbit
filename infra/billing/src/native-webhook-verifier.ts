import { X509Certificate } from "node:crypto";
import { createRemoteJWKSet, decodeProtectedHeader, importX509, jwtVerify } from "jose";
import type { BillingSubscriptionStatus } from "../../../modules/billing/src/domain/billing";
import type {
  BillingWebhookVerifier,
  VerifiedWebhookEvent,
} from "../../../modules/billing/src/ports/webhook-verifier";
import { UnauthorizedError, ValidationError } from "../../../packages/core/src/errors";

const DEFAULT_APPLE_JWKS_URL =
  "https://api.storekit.itunes.apple.com/inApps/v1/notifications/jwsPublicKeys";
const DEFAULT_APPLE_SANDBOX_JWKS_URL =
  "https://api.storekit-sandbox.itunes.apple.com/inApps/v1/notifications/jwsPublicKeys";
const APPLE_ROOT_CERT_SHA256_FINGERPRINTS = new Set([
  "B0B1730ECBC7FF4505142C49F1295E6EDA6BCAED7E2C68C5BE91B5A11001F024", // Apple Root CA
  "C2B9B042DD57830E7D117DAC55AC8AE19407D38E41D88F3215BC3A890444A050", // Apple Root CA - G2
  "63343ABFB89A6A03EBB57E9B3F5FA7BE7C4F5C756F3017B3A8C488C3653E9179", // Apple Root CA - G3
  "0D83B611B648A1A75EB8558400795375CAD92E264ED8E9D7A757C1F5EE2BB22D", // Apple Root Certificate Authority (legacy)
]);
const APPLE_TRUSTED_ROOT_CERTIFICATES = [
  // Apple Root CA
  `-----BEGIN CERTIFICATE-----
MIIEuzCCA6OgAwIBAgIBAjANBgkqhkiG9w0BAQUFADBiMQswCQYDVQQGEwJVUzET
MBEGA1UEChMKQXBwbGUgSW5jLjEmMCQGA1UECxMdQXBwbGUgQ2VydGlmaWNhdGlv
biBBdXRob3JpdHkxFjAUBgNVBAMTDUFwcGxlIFJvb3QgQ0EwHhcNMDYwNDI1MjE0
MDM2WhcNMzUwMjA5MjE0MDM2WjBiMQswCQYDVQQGEwJVUzETMBEGA1UEChMKQXBw
bGUgSW5jLjEmMCQGA1UECxMdQXBwbGUgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkx
FjAUBgNVBAMTDUFwcGxlIFJvb3QgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
ggEKAoIBAQDkkakJH5HbHkdQ6wXtXnmELes2oldMVeyLGYne+Uts9QerIjAC6Bg+
+FAJ039BqJj50cpmnCRrEdCju+QbKsMflZ56DKRHi1vUFjczy8QPTc4UadHJGXL1
XQ7Vf1+b8iUDulWPTV0N8WQ1IxVLFVkds5T39pyez1C6wVhQZ48ItCD3y6wsIG9w
tj8BMIy3Q88PnT3zK0koGsj+zrW5DtleHNbLPbU6rfQPDgCSC7EhFi501TwN22IW
q6NxkkdTVcGvL0Gz+PvjcM3mo0xFfh9Ma1CWQYnEdGILEINBhzOKgbEwWOxaBDKM
aLOPHd5lc/9nXmW8Sdh2nzMUZaF3lMktAgMBAAGjggF6MIIBdjAOBgNVHQ8BAf8E
BAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUK9BpR5R2Cf70a40uQKb3
R01/CF4wHwYDVR0jBBgwFoAUK9BpR5R2Cf70a40uQKb3R01/CF4wggERBgNVHSAE
ggEIMIIBBDCCAQAGCSqGSIb3Y2QFATCB8jAqBggrBgEFBQcCARYeaHR0cHM6Ly93
d3cuYXBwbGUuY29tL2FwcGxlY2EvMIHDBggrBgEFBQcCAjCBthqBs1JlbGlhbmNl
IG9uIHRoaXMgY2VydGlmaWNhdGUgYnkgYW55IHBhcnR5IGFzc3VtZXMgYWNjZXB0
YW5jZSBvZiB0aGUgdGhlbiBhcHBsaWNhYmxlIHN0YW5kYXJkIHRlcm1zIGFuZCBj
b25kaXRpb25zIG9mIHVzZSwgY2VydGlmaWNhdGUgcG9saWN5IGFuZCBjZXJ0aWZp
Y2F0aW9uIHByYWN0aWNlIHN0YXRlbWVudHMuMA0GCSqGSIb3DQEBBQUAA4IBAQBc
NplMLXi37Yyb3PN3m/J20ncwT8EfhYOFG5k9RzfyqZtAjizUsZAS2L70c5vu0mQP
y3lPNNiiPvl4/2vIB+x9OYOLUyDTOMSxv5pPCmv/K/xZpwUJfBdAVhEedNO3iyM7
R6PVbyTi69G3cN8PReEnyvFteO3ntRcXqNx+IjXKJdXZD9Zr1KIkIxH3oayPc4Fg
xhtbCS+SsvhESPBgOJ4V9T0mZyCKM2r3DYLP3uujL/lTaltkwGMzd/c6ByxW69oP
IQ7aunMZT7XZNn/Bh1XZp5m5MkL72NVxnn6hUrcbvZNCJBIqxw8dtk2cXmPIS4AX
UKqK1drk/NAJBzewdXUh
-----END CERTIFICATE-----`,
  // Apple Root CA - G2
  `-----BEGIN CERTIFICATE-----
MIIFkjCCA3qgAwIBAgIIAeDltYNno+AwDQYJKoZIhvcNAQEMBQAwZzEbMBkGA1UE
AwwSQXBwbGUgUm9vdCBDQSAtIEcyMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0
aW9uIEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMw
HhcNMTQwNDMwMTgxMDA5WhcNMzkwNDMwMTgxMDA5WjBnMRswGQYDVQQDDBJBcHBs
ZSBSb290IENBIC0gRzIxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0
aG9yaXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzCCAiIwDQYJ
KoZIhvcNAQEBBQADggIPADCCAgoCggIBANgREkhI2imKScUcx+xuM23+TfvgHN6s
XuI2pyT5f1BrTM65MFQn5bPW7SXmMLYFN14UIhHF6Kob0vuy0gmVOKTvKkmMXT5x
ZgM4+xb1hYjkWpIMBDLyyED7Ul+f9sDx47pFoFDVEovy3d6RhiPw9bZyLgHaC/Yu
OQhfGaFjQQscp5TBhsRTL3b2CtcM0YM/GlMZ81fVJ3/8E7j4ko380yhDPLVoACVd
J2LT3VXdRCCQgzWTxb+4Gftr49wIQuavbfqeQMpOhYV4SbHXw8EwOTKrfl+q04tv
ny0aIWhwZ7Oj8ZhBbZF8+NfbqOdfIRqMM78xdLe40fTgIvS/cjTf94FNcX1RoeKz
8NMoFnNvzcytN31O661A4T+B/fc9Cj6i8b0xlilZ3MIZgIxbdMYs0xBTJh0UT8TU
gWY8h2czJxQI6bR3hDRSj4n4aJgXv8O7qhOTH11UL6jHfPsNFL4VPSQ08prcdUFm
IrQB1guvkJ4M6mL4m1k8COKWNORj3rw31OsMiANDC1CvoDTdUE0V+1ok2Az6DGOe
HwOx4e7hqkP0ZmUoNwIx7wHHHtHMn23KVDpA287PT0aLSmWaasZobNfMmRtHsHLD
d4/E92GcdB/O/WuhwpyUgquUoue9G7q5cDmVF8Up8zlYNPXEpMZ7YLlmQ1A/bmH8
DvmGqmAMQ0uVAgMBAAGjQjBAMB0GA1UdDgQWBBTEmRNsGAPCe8CjoA1/coB6HHcm
jTAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIBBjANBgkqhkiG9w0BAQwF
AAOCAgEAUabz4vS4PZO/Lc4Pu1vhVRROTtHlznldgX/+tvCHM/jvlOV+3Gp5pxy+
8JS3ptEwnMgNCnWefZKVfhidfsJxaXwU6s+DDuQUQp50DhDNqxq6EWGBeNjxtUVA
eKuowM77fWM3aPbn+6/Gw0vsHzYmE1SGlHKy6gLti23kDKaQwFd1z4xCfVzmMX3z
ybKSaUYOiPjjLUKyOKimGY3xn83uamW8GrAlvacp/fQ+onVJv57byfenHmOZ4VxG
/5IFjPoeIPmGlFYl5bRXOJ3riGQUIUkhOb9iZqmxospvPyFgxYnURTbImHy99v6Z
SYA7LNKmp4gDBDEZt7Y6YUX6yfIjyGNzv1aJMbDZfGKnexWoiIqrOEDCzBL/FePw
N983csvMmOa/orz6JopxVtfnJBtIRD6e/J/JzBrsQzwBvDR4yGn1xuZW7AYJNpDr
FEobXsmII9oDMJELuDY++ee1KG++P+w8j2Ud5cAeh6Squpj9kuNsJnfdBrRkBof0
Tta6SqoWqPQFZ2aWuuJVecMsXUmPgEkrihLHdoBR37q9ZV0+N0djMenl9MU/S60E
inpxLK8JQzcPqOMyT/RFtm2XNuyE9QoB6he7hY1Ck3DDUOUUi78/w0EP3SIEIwiK
um1xRKtzCTrJ+VKACd+66eYWyi4uTLLT3OUEVLLUNIAytbwPF+E=
-----END CERTIFICATE-----`,
  // Apple Root CA - G3
  `-----BEGIN CERTIFICATE-----
MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwS
QXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9u
IEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcN
MTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBS
b290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9y
aXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49
AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtf
TjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyxNB0cTddqXl5dvMVztK517
IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySr
MA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gA
MGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxnS4
at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkLF1vLUagM
6BgD56KyKA==
-----END CERTIFICATE-----`,
]
  .map((pem) => {
    try {
      return new X509Certificate(pem);
    } catch {
      return null;
    }
  })
  .filter((cert): cert is X509Certificate => cert !== null);
const DEFAULT_GOOGLE_PUBSUB_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const DEFAULT_GOOGLE_PUBSUB_ISSUERS = ["accounts.google.com", "https://accounts.google.com"];

type NativeWebhookVerifierConfig = {
  appleJwksUrl?: string;
  appleBundleId?: string;
  googlePubSubJwksUrl?: string;
  googlePubSubAudience?: string;
  googlePubSubServiceAccountEmail?: string;
  googlePubSubIssuers?: string[];
};

type AppleNotificationPayload = {
  signedPayload?: unknown;
  notificationUUID?: unknown;
  notificationType?: unknown;
  subtype?: unknown;
  signedDate?: unknown;
  data?: unknown;
};

type AppleTransactionPayload = {
  productId?: unknown;
  transactionId?: unknown;
  originalTransactionId?: unknown;
  appAccountToken?: unknown;
  purchaseDate?: unknown;
  expiresDate?: unknown;
  revocationDate?: unknown;
  bundleId?: unknown;
};

type GooglePubSubPushMessage = {
  message?: unknown;
};

type GooglePubSubMessageEnvelope = {
  messageId?: unknown;
  publishTime?: unknown;
  attributes?: unknown;
  data?: unknown;
};

type GoogleRtdnPayload = {
  eventTimeMillis?: unknown;
  subscriptionNotification?: unknown;
};

type GoogleSubscriptionNotification = {
  notificationType?: unknown;
  purchaseToken?: unknown;
  subscriptionId?: unknown;
};

function asRecord(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError(`${field} must be an object`);
  }
  return value as Record<string, unknown>;
}

function asNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${field} is required`);
  }
  return value.trim();
}

function asOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseDateLike(value: unknown): Date | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value > 10_000_000_000 ? value : value * 1_000;
    const parsed = new Date(ms);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d+$/.test(trimmed)) {
      const numeric = Number(trimmed);
      if (Number.isFinite(numeric)) {
        const ms = numeric > 10_000_000_000 ? numeric : numeric * 1_000;
        const parsedNumeric = new Date(ms);
        if (!Number.isNaN(parsedNumeric.getTime())) return parsedNumeric;
      }
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function toIsoString(value: unknown, fallback: Date): string {
  const parsed = parseDateLike(value);
  return (parsed ?? fallback).toISOString();
}

function toOptionalIsoString(value: unknown): string | undefined {
  const parsed = parseDateLike(value);
  return parsed ? parsed.toISOString() : undefined;
}

function normalizeHex(value: string): string {
  return value.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
}

function isCertificateValidAt(cert: X509Certificate, now: Date): boolean {
  const validFrom = new Date(cert.validFrom);
  const validTo = new Date(cert.validTo);
  return !(
    Number.isNaN(validFrom.getTime()) ||
    Number.isNaN(validTo.getTime()) ||
    now.getTime() < validFrom.getTime() ||
    now.getTime() > validTo.getTime()
  );
}

function toPemCertificate(base64Der: string): string {
  const wrapped = base64Der.match(/.{1,64}/g)?.join("\n") ?? base64Der;
  return `-----BEGIN CERTIFICATE-----\n${wrapped}\n-----END CERTIFICATE-----`;
}

function parseAppleX5cCertificates(signedJws: string): {
  certificates: X509Certificate[];
  leafPem?: string;
} {
  try {
    const header = decodeProtectedHeader(signedJws) as Record<string, unknown>;
    const x5c = Array.isArray(header.x5c) ? header.x5c : [];
    const chain = x5c
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .map((value) => value.trim());
    if (chain.length === 0) return { certificates: [] };

    const pemChain = chain.map((item) => toPemCertificate(item));
    return {
      certificates: pemChain.map((pem) => new X509Certificate(pem)),
      leafPem: pemChain[0],
    };
  } catch {
    return { certificates: [] };
  }
}

function verifyAppleCertificateChain(certificates: X509Certificate[], now: Date): boolean {
  if (certificates.length === 0) return false;

  for (const cert of certificates) {
    if (!isCertificateValidAt(cert, now)) {
      return false;
    }
  }

  for (let index = 0; index < certificates.length - 1; index += 1) {
    const child = certificates[index];
    const parent = certificates[index + 1];
    if (!child || !parent || !child.verify(parent.publicKey)) {
      return false;
    }
  }

  const chainAnchor = certificates[certificates.length - 1];
  if (!chainAnchor) return false;

  const chainAnchorFingerprint = normalizeHex(chainAnchor.fingerprint256 ?? "");
  if (APPLE_ROOT_CERT_SHA256_FINGERPRINTS.has(chainAnchorFingerprint)) {
    return chainAnchor.verify(chainAnchor.publicKey);
  }

  for (const trustedRoot of APPLE_TRUSTED_ROOT_CERTIFICATES) {
    const trustedRootFingerprint = normalizeHex(trustedRoot.fingerprint256 ?? "");
    if (!APPLE_ROOT_CERT_SHA256_FINGERPRINTS.has(trustedRootFingerprint)) {
      continue;
    }
    if (!isCertificateValidAt(trustedRoot, now)) {
      continue;
    }
    if (chainAnchor.verify(trustedRoot.publicKey)) {
      return true;
    }
  }

  return false;
}

function mapGoogleNotificationStatus(
  type: number,
): Exclude<BillingSubscriptionStatus, "none"> {
  switch (type) {
    case 1: // RECOVERED
    case 2: // RENEWED
    case 4: // PURCHASED
    case 7: // RESTARTED
    case 8: // PRICE_CHANGE_CONFIRMED
      return "active";
    case 3: // CANCELED
    case 20: // PENDING_PURCHASE_CANCELED
      return "canceled";
    case 12: // REVOKED
      return "refunded";
    case 13: // EXPIRED
      return "expired";
    case 5: // ON_HOLD
    case 6: // IN_GRACE_PERIOD
    case 9: // DEFERRED
    case 10: // PAUSED
    case 11: // PAUSE_SCHEDULE_CHANGED
    default:
      return "pending";
  }
}

function mapAppleNotificationStatus(input: {
  notificationType?: string;
  subtype?: string;
  revocationDate?: unknown;
  expiresDate?: unknown;
  now: Date;
}): Exclude<BillingSubscriptionStatus, "none"> {
  if (parseDateLike(input.revocationDate)) return "refunded";
  if (input.notificationType === "REFUND" || input.notificationType === "REVOKE") return "refunded";
  if (input.notificationType === "EXPIRED") return "expired";
  if (input.notificationType === "DID_FAIL_TO_RENEW") return "pending";
  if (
    input.notificationType === "DID_CHANGE_RENEWAL_STATUS" &&
    input.subtype === "AUTO_RENEW_DISABLED"
  ) {
    return "canceled";
  }
  const expiresAt = parseDateLike(input.expiresDate);
  if (expiresAt && expiresAt.getTime() <= input.now.getTime()) return "expired";
  return "active";
}

function normalizeHeaders(
  headers: Record<string, string | undefined>,
): Record<string, string | undefined> {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

function normalizeIssuerList(input: string[] | undefined): string[] {
  const items = input?.map((item) => item.trim()).filter((item) => item.length > 0) ?? [];
  return items.length > 0 ? items : [...DEFAULT_GOOGLE_PUBSUB_ISSUERS];
}

function parseGoogleEventTimeIso(
  notification: GoogleRtdnPayload,
  messageEnvelope: GooglePubSubMessageEnvelope,
): string {
  const fromNotification = parseDateLike(notification.eventTimeMillis);
  if (fromNotification) return fromNotification.toISOString();
  const fromPublishTime = parseDateLike(messageEnvelope.publishTime);
  if (fromPublishTime) return fromPublishTime.toISOString();
  return new Date().toISOString();
}

function resolveAppleJwksUrls(configuredUrl?: string): string[] {
  const normalized = [configuredUrl, DEFAULT_APPLE_JWKS_URL, DEFAULT_APPLE_SANDBOX_JWKS_URL]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim());

  return [...new Set(normalized)];
}

export function createNativeWebhookVerifier(
  config: NativeWebhookVerifierConfig = {},
): BillingWebhookVerifier {
  const appleJwksList = resolveAppleJwksUrls(config.appleJwksUrl).map((url) =>
    createRemoteJWKSet(new URL(url)),
  );
  const googleJwks = createRemoteJWKSet(
    new URL(config.googlePubSubJwksUrl ?? DEFAULT_GOOGLE_PUBSUB_JWKS_URL),
  );
  const googleIssuers = normalizeIssuerList(config.googlePubSubIssuers);

  async function verifyAppleJws(
    signedJws: string,
    payloadField: string,
  ): Promise<{ claims: Record<string, unknown> | null; reason?: string }> {
    for (const appleJwks of appleJwksList) {
      try {
        const verified = await jwtVerify(signedJws, appleJwks);
        return { claims: asRecord(verified.payload, payloadField) };
      } catch {
        // Continue with next JWKS endpoint (production/sandbox).
      }
    }

    const now = new Date();
    const x5c = parseAppleX5cCertificates(signedJws);
    if (!x5c.leafPem || !verifyAppleCertificateChain(x5c.certificates, now)) {
      return {
        claims: null,
        reason: x5c.leafPem ? "apple_x5c_chain_invalid" : "apple_jwks_failed_and_x5c_missing",
      };
    }

    try {
      const leafKey = await importX509(x5c.leafPem, "ES256");
      const verified = await jwtVerify(signedJws, leafKey, { algorithms: ["ES256"] });
      return { claims: asRecord(verified.payload, payloadField) };
    } catch {
      return { claims: null, reason: "apple_x5c_signature_invalid" };
    }
  }

  async function verifyAppleWebhook(input: {
    body: unknown;
  }): Promise<VerifiedWebhookEvent> {
    const body = asRecord(input.body, "body") as AppleNotificationPayload;
    const signedPayload = asNonEmptyString(body.signedPayload, "signedPayload");

    const verifiedNotification = await verifyAppleJws(signedPayload, "apple notification payload");
    const notificationClaimsRaw = verifiedNotification.claims;
    if (!notificationClaimsRaw) {
      if (verifiedNotification.reason) {
        throw new UnauthorizedError(`Invalid Apple notification signature (${verifiedNotification.reason})`);
      }
      throw new UnauthorizedError("Invalid Apple notification signature");
    }

    const notification = notificationClaimsRaw as AppleNotificationPayload;
    const data = asRecord(notification.data, "apple notification data");
    const signedTransactionInfo = asOptionalString(data.signedTransactionInfo);
    if (!signedTransactionInfo) {
      throw new ValidationError("Apple notification missing signedTransactionInfo");
    }

    const verifiedTransaction = await verifyAppleJws(
      signedTransactionInfo,
      "apple transaction payload",
    );
    const txClaimsRaw = verifiedTransaction.claims;
    if (!txClaimsRaw) {
      if (verifiedTransaction.reason) {
        throw new UnauthorizedError(
          `Invalid Apple signed transaction payload (${verifiedTransaction.reason})`,
        );
      }
      throw new UnauthorizedError("Invalid Apple signed transaction payload");
    }

    const tx = txClaimsRaw as AppleTransactionPayload;
    if (config.appleBundleId) {
      const bundleId = asOptionalString(tx.bundleId);
      if (!bundleId || bundleId !== config.appleBundleId) {
        throw new UnauthorizedError("Apple notification bundle mismatch");
      }
    }

    const now = new Date();
    const sku = asNonEmptyString(tx.productId, "productId");
    const transactionId = asOptionalString(tx.transactionId);
    const originalTransactionId = asOptionalString(tx.originalTransactionId);
    const purchaseToken = originalTransactionId ?? transactionId;
    if (!purchaseToken) {
      throw new ValidationError("Apple notification missing transaction identifiers");
    }

    const notificationUUID = asOptionalString(notification.notificationUUID);
    const notificationType = asOptionalString(notification.notificationType);
    const subtype = asOptionalString(notification.subtype);
    const eventId =
      notificationUUID ??
      [
        "apple",
        purchaseToken,
        notificationType ?? "unknown",
        subtype ?? "",
        toIsoString(notification.signedDate, now),
      ].join(":");

    return {
      store: "apple",
      eventId,
      userId: asOptionalString(tx.appAccountToken),
      purchaseToken,
      originalTransactionId,
      sku,
      status: mapAppleNotificationStatus({
        notificationType,
        subtype,
        revocationDate: tx.revocationDate,
        expiresDate: tx.expiresDate,
        now,
      }),
      startsAt: toIsoString(tx.purchaseDate ?? notification.signedDate, now),
      expiresAt: toOptionalIsoString(tx.expiresDate),
      rawPayload: {
        signedPayload,
        notificationClaims: notificationClaimsRaw,
        transactionClaims: txClaimsRaw,
      },
    };
  }

  async function verifyGoogleWebhook(input: {
    headers: Record<string, string | undefined>;
    body: unknown;
  }): Promise<VerifiedWebhookEvent> {
    // Any Google service account can mint a Google-signed token for any audience, so a push is
    // only trusted when both the audience and the subscription's service account match.
    const expectedAudience = config.googlePubSubAudience?.trim();
    const expectedServiceAccountEmail = config.googlePubSubServiceAccountEmail
      ?.trim()
      .toLowerCase();
    if (!expectedAudience || !expectedServiceAccountEmail) {
      throw new UnauthorizedError("Google Pub/Sub push authentication is not configured");
    }

    const normalizedHeaders = normalizeHeaders(input.headers);
    const authHeader = normalizedHeaders.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing Google Pub/Sub bearer token");
    }
    const bearerToken = authHeader.slice("Bearer ".length).trim();
    if (!bearerToken) {
      throw new UnauthorizedError("Missing Google Pub/Sub bearer token");
    }

    let tokenClaims: Record<string, unknown>;
    try {
      const verified = await jwtVerify(bearerToken, googleJwks, {
        issuer: googleIssuers,
        audience: expectedAudience,
      });
      tokenClaims = verified.payload;
    } catch {
      throw new UnauthorizedError("Invalid Google Pub/Sub bearer token");
    }
    const tokenEmail = asOptionalString(tokenClaims.email)?.toLowerCase();
    if (tokenEmail !== expectedServiceAccountEmail || tokenClaims.email_verified !== true) {
      throw new UnauthorizedError("Invalid Google Pub/Sub bearer token");
    }

    const body = asRecord(input.body, "body") as GooglePubSubPushMessage;
    const messageEnvelopeRaw = asRecord(body.message, "message");
    const messageEnvelope = messageEnvelopeRaw as GooglePubSubMessageEnvelope;
    const messageData = asNonEmptyString(messageEnvelope.data, "message.data");

    let decodedPayload: unknown;
    try {
      decodedPayload = JSON.parse(Buffer.from(messageData, "base64").toString("utf8"));
    } catch {
      throw new ValidationError("message.data must be a valid base64 JSON payload");
    }

    const notification = asRecord(decodedPayload, "google RTDN payload") as GoogleRtdnPayload;
    const subscriptionNotification = asRecord(
      notification.subscriptionNotification,
      "subscriptionNotification",
    ) as GoogleSubscriptionNotification;

    const purchaseToken = asNonEmptyString(subscriptionNotification.purchaseToken, "purchaseToken");
    const sku = asNonEmptyString(subscriptionNotification.subscriptionId, "subscriptionId");
    const notificationTypeRaw = subscriptionNotification.notificationType;
    const notificationType =
      typeof notificationTypeRaw === "number"
        ? notificationTypeRaw
        : typeof notificationTypeRaw === "string" && notificationTypeRaw.trim()
          ? Number(notificationTypeRaw)
          : Number.NaN;
    if (!Number.isFinite(notificationType)) {
      throw new ValidationError("notificationType must be a number");
    }

    const eventTimeIso = parseGoogleEventTimeIso(notification, messageEnvelope);
    const eventId =
      asOptionalString(messageEnvelope.messageId) ??
      ["google", purchaseToken, String(notificationType), eventTimeIso].join(":");

    // RTDN messages carry no user identity. Pub/Sub attributes are not signed by Google Play, so
    // the owner is always resolved from a purchase token the user already verified in the app.
    return {
      store: "google",
      eventId,
      purchaseToken,
      sku,
      status: mapGoogleNotificationStatus(notificationType),
      startsAt: eventTimeIso,
      rawPayload: {
        pubsubMessage: messageEnvelopeRaw,
        decodedNotification: notification,
      },
    };
  }

  return {
    async verifyWebhook(input) {
      if (input.store === "apple") {
        return await verifyAppleWebhook({ body: input.body });
      }
      return await verifyGoogleWebhook({
        headers: input.headers,
        body: input.body,
      });
    },
  };
}
