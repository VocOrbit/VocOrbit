import { createVerify, X509Certificate } from "node:crypto";
import { createRemoteJWKSet, decodeJwt, decodeProtectedHeader, importX509, jwtVerify } from "jose";
import type {
  BillingStore,
  BillingSubscriptionStatus,
} from "../../../modules/billing/src/domain/billing";
import type {
  BillingReceiptVerifier,
  VerifiedReceipt,
} from "../../../modules/billing/src/ports/receipt-verifier";
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

type NativeReceiptVerifierConfig = {
  appleJwksUrl?: string;
  appleBundleId?: string;
  googlePlayPublicKey?: string;
  googlePackageName?: string;
  googleRequireSignature?: boolean;
};

type AppleReceiptPayload = {
  signedTransactionInfo?: unknown;
  signedPayload?: unknown;
  transactionJws?: unknown;
};

type GoogleReceiptPayload = {
  sku?: unknown;
  subscriptionId?: unknown;
  productId?: unknown;
  purchaseToken?: unknown;
  token?: unknown;
  originalTransactionId?: unknown;
  orderId?: unknown;
  purchaseState?: unknown;
  paymentState?: unknown;
  cancelReason?: unknown;
  startsAt?: unknown;
  purchaseDate?: unknown;
  purchaseTimeMillis?: unknown;
  startTimeMillis?: unknown;
  expiresAt?: unknown;
  expiryDate?: unknown;
  expiryTimeMillis?: unknown;
  signedData?: unknown;
  signature?: unknown;
  packageName?: unknown;
  status?: unknown;
};

type AppleTransactionClaims = {
  productId?: unknown;
  transactionId?: unknown;
  originalTransactionId?: unknown;
  appAccountToken?: unknown;
  bundleId?: unknown;
  purchaseDate?: unknown;
  expiresDate?: unknown;
  revocationDate?: unknown;
  rawPayload: Record<string, unknown>;
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

function parseJsonRecord(input: string, field: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new ValidationError(`${field} must be valid JSON`);
  }
  return asRecord(parsed, field);
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

function truncateForReason(value: string, maxLength = 420): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
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

function toAppleJwsDebugInfo(signedJws: string): string {
  const parts = signedJws.split(".");
  const segmentInfo = `segments=${parts.length},len=${parts.map((part) => part.length).join("/")}`;

  try {
    const header = decodeProtectedHeader(signedJws) as Record<string, unknown>;
    const payload = decodeJwt(signedJws) as Record<string, unknown>;
    const x5c = Array.isArray(header.x5c) ? header.x5c : [];
    const headerAlg = asOptionalString(header.alg) ?? "unknown";
    const headerKid = asOptionalString(header.kid) ?? "none";
    const payloadBundle = asOptionalString(payload.bundleId) ? "bundleId:1" : "bundleId:0";
    const payloadProduct = asOptionalString(payload.productId) ? "productId:1" : "productId:0";
    const payloadTx = asOptionalString(payload.transactionId) ? "transactionId:1" : "transactionId:0";
    const payloadOrigTx = asOptionalString(payload.originalTransactionId)
      ? "originalTransactionId:1"
      : "originalTransactionId:0";

    return truncateForReason(
      [
        segmentInfo,
        `alg=${headerAlg}`,
        `kid=${headerKid}`,
        `x5c=${x5c.length}`,
        payloadBundle,
        payloadProduct,
        payloadTx,
        payloadOrigTx,
      ].join(","),
    );
  } catch {
    return truncateForReason(`${segmentInfo},decode=failed`);
  }
}

function normalizeGooglePublicKey(publicKey: string): string {
  const trimmed = publicKey.trim();
  if (trimmed.includes("BEGIN PUBLIC KEY")) return trimmed;
  const wrapped = trimmed.match(/.{1,64}/g)?.join("\n") ?? trimmed;
  return `-----BEGIN PUBLIC KEY-----\n${wrapped}\n-----END PUBLIC KEY-----`;
}

function mapGoogleStatus(payload: GoogleReceiptPayload, now: Date): Exclude<BillingSubscriptionStatus, "none"> {
  const explicitStatus = asOptionalString(payload.status)?.toLowerCase();
  if (
    explicitStatus === "pending" ||
    explicitStatus === "active" ||
    explicitStatus === "expired" ||
    explicitStatus === "canceled" ||
    explicitStatus === "refunded"
  ) {
    return explicitStatus;
  }

  const expiryDate = parseDateLike(payload.expiresAt ?? payload.expiryDate ?? payload.expiryTimeMillis);
  if (expiryDate && expiryDate.getTime() <= now.getTime()) return "expired";

  const cancelReason = payload.cancelReason;
  if (cancelReason !== undefined && cancelReason !== null) return "canceled";

  const purchaseStateRaw = payload.purchaseState;
  const purchaseState =
    typeof purchaseStateRaw === "number"
      ? purchaseStateRaw
      : typeof purchaseStateRaw === "string" && purchaseStateRaw.trim()
        ? Number(purchaseStateRaw)
        : Number.NaN;
  if (Number.isFinite(purchaseState)) {
    if (purchaseState === 2) return "pending";
    if (purchaseState === 1) return "canceled";
    if (purchaseState === 0) return "active";
  }

  const paymentStateRaw = payload.paymentState;
  const paymentState =
    typeof paymentStateRaw === "number"
      ? paymentStateRaw
      : typeof paymentStateRaw === "string" && paymentStateRaw.trim()
        ? Number(paymentStateRaw)
        : Number.NaN;
  if (Number.isFinite(paymentState) && paymentState === 0) return "pending";

  if (expiryDate && expiryDate.getTime() > now.getTime()) return "active";
  return "active";
}

function assertSignedStringFieldMatches(input: {
  field: string;
  receiptPayloadValue: string | undefined;
  signedPayloadValue: string | undefined;
}) {
  if (!input.receiptPayloadValue || !input.signedPayloadValue) return;
  if (input.receiptPayloadValue === input.signedPayloadValue) return;
  throw new UnauthorizedError(`Google receipt ${input.field} mismatch with signedData`);
}

function assertGoogleSignedPayloadMatchesReceipt(
  receiptPayload: GoogleReceiptPayload,
  signedPayload: GoogleReceiptPayload,
) {
  assertSignedStringFieldMatches({
    field: "purchaseToken",
    receiptPayloadValue:
      asOptionalString(receiptPayload.purchaseToken) ?? asOptionalString(receiptPayload.token),
    signedPayloadValue:
      asOptionalString(signedPayload.purchaseToken) ?? asOptionalString(signedPayload.token),
  });
  assertSignedStringFieldMatches({
    field: "sku",
    receiptPayloadValue:
      asOptionalString(receiptPayload.sku) ??
      asOptionalString(receiptPayload.subscriptionId) ??
      asOptionalString(receiptPayload.productId),
    signedPayloadValue:
      asOptionalString(signedPayload.sku) ??
      asOptionalString(signedPayload.subscriptionId) ??
      asOptionalString(signedPayload.productId),
  });
  assertSignedStringFieldMatches({
    field: "packageName",
    receiptPayloadValue: asOptionalString(receiptPayload.packageName),
    signedPayloadValue: asOptionalString(signedPayload.packageName),
  });
  assertSignedStringFieldMatches({
    field: "orderId",
    receiptPayloadValue: asOptionalString(receiptPayload.orderId),
    signedPayloadValue: asOptionalString(signedPayload.orderId),
  });
}

function mapAppleStatus(
  transaction: AppleTransactionClaims,
  now: Date,
): Exclude<BillingSubscriptionStatus, "none"> {
  const revocationDate = parseDateLike(transaction.revocationDate);
  if (revocationDate) return "refunded";

  const expiresDate = parseDateLike(transaction.expiresDate);
  if (expiresDate && expiresDate.getTime() <= now.getTime()) return "expired";

  return "active";
}

function resolveAppleJwksUrls(configuredUrl?: string): string[] {
  const normalized = [configuredUrl, DEFAULT_APPLE_JWKS_URL, DEFAULT_APPLE_SANDBOX_JWKS_URL]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim());

  return [...new Set(normalized)];
}

export function createNativeReceiptVerifier(
  config: NativeReceiptVerifierConfig = {},
): BillingReceiptVerifier {
  const appleJwksList = resolveAppleJwksUrls(config.appleJwksUrl).map((url) =>
    createRemoteJWKSet(new URL(url)),
  );
  const googleRequireSignature = config.googleRequireSignature ?? true;
  const googlePublicKey = config.googlePlayPublicKey
    ? normalizeGooglePublicKey(config.googlePlayPublicKey)
    : undefined;

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

  async function parseAppleReceipt(receipt: string): Promise<VerifiedReceipt> {
    const trimmed = receipt.trim();
    const payload = trimmed.startsWith("{")
      ? (parseJsonRecord(trimmed, "receipt") as AppleReceiptPayload)
      : undefined;
    const signedTransactionInfo =
      asOptionalString(payload?.signedTransactionInfo) ??
      asOptionalString(payload?.signedPayload) ??
      asOptionalString(payload?.transactionJws) ??
      trimmed;

    if (!signedTransactionInfo) {
      throw new ValidationError("Apple receipt must include signed transaction info");
    }

    const appleVerify = await verifyAppleJws(signedTransactionInfo, "apple transaction payload");
    const claimsRaw = appleVerify.claims;
    if (!claimsRaw) {
      if (appleVerify.reason) {
        const debugInfo = toAppleJwsDebugInfo(signedTransactionInfo);
        throw new UnauthorizedError(
          `Invalid Apple signed transaction payload (${appleVerify.reason}; ${debugInfo})`,
        );
      }
      throw new UnauthorizedError("Invalid Apple signed transaction payload");
    }

    const claims: AppleTransactionClaims = {
      productId: claimsRaw.productId,
      transactionId: claimsRaw.transactionId,
      originalTransactionId: claimsRaw.originalTransactionId,
      appAccountToken: claimsRaw.appAccountToken,
      bundleId: claimsRaw.bundleId,
      purchaseDate: claimsRaw.purchaseDate,
      expiresDate: claimsRaw.expiresDate,
      revocationDate: claimsRaw.revocationDate,
      rawPayload: claimsRaw,
    };

    if (config.appleBundleId) {
      const bundleId = asOptionalString(claims.bundleId);
      if (!bundleId || bundleId !== config.appleBundleId) {
        throw new UnauthorizedError("Apple receipt bundle mismatch");
      }
    }

    const sku = asNonEmptyString(claims.productId, "productId");
    const transactionId = asOptionalString(claims.transactionId);
    const originalTransactionId = asOptionalString(claims.originalTransactionId);
    const purchaseToken = originalTransactionId ?? transactionId;
    if (!purchaseToken) {
      throw new ValidationError("Apple receipt is missing transaction identifiers");
    }

    const now = new Date();
    return {
      store: "apple",
      sku,
      status: mapAppleStatus(claims, now),
      purchaseToken,
      originalTransactionId,
      startsAt: toIsoString(claims.purchaseDate, now),
      expiresAt: toOptionalIsoString(claims.expiresDate),
      rawPayload: {
        signedTransactionInfo,
        claims: claims.rawPayload,
      },
    };
  }

  async function parseGoogleReceipt(receipt: string): Promise<VerifiedReceipt> {
    const payload = parseJsonRecord(receipt, "receipt") as GoogleReceiptPayload;
    const signature = asOptionalString(payload.signature);
    const signedData = asOptionalString(payload.signedData);
    let trustedPayload = payload;
    let signedPayload: GoogleReceiptPayload | undefined;

    if (googleRequireSignature) {
      if (!signature || !signedData || !googlePublicKey) {
        throw new ValidationError("Google receipt signature verification is not configured");
      }
      const verifier = createVerify("RSA-SHA1");
      verifier.update(signedData);
      verifier.end();
      const isValid = verifier.verify(googlePublicKey, Buffer.from(signature, "base64"));
      if (!isValid) {
        throw new UnauthorizedError("Invalid Google receipt signature");
      }

      signedPayload = parseJsonRecord(signedData, "receipt.signedData") as GoogleReceiptPayload;
      assertGoogleSignedPayloadMatchesReceipt(payload, signedPayload);
      trustedPayload = signedPayload;
    }

    const purchaseToken =
      asOptionalString(trustedPayload.purchaseToken) ?? asOptionalString(trustedPayload.token);
    if (!purchaseToken) {
      throw new ValidationError("Google receipt purchaseToken is required");
    }

    const sku =
      asOptionalString(trustedPayload.sku) ??
      asOptionalString(trustedPayload.subscriptionId) ??
      asOptionalString(trustedPayload.productId);
    if (!sku) {
      throw new ValidationError("Google receipt sku is required");
    }

    if (config.googlePackageName) {
      const packageName = asOptionalString(trustedPayload.packageName);
      if (!packageName || packageName !== config.googlePackageName) {
        throw new UnauthorizedError("Google receipt package mismatch");
      }
    }

    const now = new Date();
    return {
      store: "google",
      sku,
      status: mapGoogleStatus(trustedPayload, now),
      purchaseToken,
      originalTransactionId:
        asOptionalString(trustedPayload.originalTransactionId) ??
        asOptionalString(trustedPayload.orderId),
      startsAt: toIsoString(
        trustedPayload.startsAt ??
          trustedPayload.startTimeMillis ??
          trustedPayload.purchaseDate ??
          trustedPayload.purchaseTimeMillis,
        now,
      ),
      expiresAt: toOptionalIsoString(
        trustedPayload.expiresAt ?? trustedPayload.expiryDate ?? trustedPayload.expiryTimeMillis,
      ),
      rawPayload: {
        receiptPayload: payload as Record<string, unknown>,
        ...(signedPayload ? { signedDataPayload: signedPayload as Record<string, unknown> } : {}),
      },
    };
  }

  return {
    async verifyReceipt(input) {
      const receipt = input.receipt.trim();
      if (!receipt) {
        throw new ValidationError("receipt is required");
      }

      if (input.store === "apple") {
        return await parseAppleReceipt(receipt);
      }

      return await parseGoogleReceipt(receipt);
    },
  };
}
