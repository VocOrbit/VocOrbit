import { createSign, generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "bun:test";
import { createNativeReceiptVerifier } from "../src/native-receipt-verifier";
import { UnauthorizedError } from "../../../packages/core/src/errors";

function buildSignedGoogleReceiptPayload(payload: Record<string, unknown>) {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });
  const signedData = JSON.stringify(payload);
  const signer = createSign("RSA-SHA1");
  signer.update(signedData);
  signer.end();
  const signature = signer.sign(privateKey).toString("base64");
  const googlePlayPublicKey = publicKey.export({
    type: "spki",
    format: "pem",
  });

  return {
    signedData,
    signature,
    googlePlayPublicKey: String(googlePlayPublicKey),
  };
}

describe("native google receipt verifier", () => {
  it("derives critical fields from signedData when signature verification is enabled", async () => {
    const signedPayload = {
      packageName: "com.vocorbit.app",
      purchaseToken: "signed-token-123",
      subscriptionId: "premium.monthly",
      orderId: "order-123",
      purchaseTimeMillis: "1738368000000",
      expiryTimeMillis: "1769904000000",
      purchaseState: 0,
    };
    const { signedData, signature, googlePlayPublicKey } =
      buildSignedGoogleReceiptPayload(signedPayload);

    const verifier = createNativeReceiptVerifier({
      googlePlayPublicKey,
      googlePackageName: "com.vocorbit.app",
      googleRequireSignature: true,
    });

    const receipt = JSON.stringify({
      signedData,
      signature,
    });

    const result = await verifier.verifyReceipt({
      store: "google",
      receipt,
    });

    expect(result.purchaseToken).toBe("signed-token-123");
    expect(result.sku).toBe("premium.monthly");
    expect(result.originalTransactionId).toBe("order-123");
  });

  it("rejects envelope tampering when signedData and envelope fields mismatch", async () => {
    const signedPayload = {
      packageName: "com.vocorbit.app",
      purchaseToken: "signed-token-abc",
      subscriptionId: "premium.monthly",
      orderId: "order-abc",
      purchaseTimeMillis: "1738368000000",
      expiryTimeMillis: "1769904000000",
      purchaseState: 0,
    };
    const { signedData, signature, googlePlayPublicKey } =
      buildSignedGoogleReceiptPayload(signedPayload);

    const verifier = createNativeReceiptVerifier({
      googlePlayPublicKey,
      googlePackageName: "com.vocorbit.app",
      googleRequireSignature: true,
    });

    const tamperedReceipt = JSON.stringify({
      signedData,
      signature,
      purchaseToken: "tampered-token",
      subscriptionId: "tampered.sku",
    });

    await expect(
      verifier.verifyReceipt({
        store: "google",
        receipt: tamperedReceipt,
      }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
