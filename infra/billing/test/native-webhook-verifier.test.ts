import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { SignJWT, exportJWK, generateKeyPair } from "jose";
import { UnauthorizedError } from "../../../packages/core/src/errors";
import { createNativeWebhookVerifier } from "../src/native-webhook-verifier";

const AUDIENCE = "https://api.example.com/v1/billing/webhooks/google";
const PUSH_SERVICE_ACCOUNT = "rtdn-push@example-project.iam.gserviceaccount.com";

type TestKey = Awaited<ReturnType<typeof generateKeyPair>>["privateKey"];

let privateKey: TestKey;
let jwksServer: ReturnType<typeof Bun.serve>;
let jwksUrl: string;

beforeAll(async () => {
  const keyPair = await generateKeyPair("RS256");
  privateKey = keyPair.privateKey;
  const jwk = { ...(await exportJWK(keyPair.publicKey)), kid: "test-key", alg: "RS256" };
  jwksServer = Bun.serve({ port: 0, fetch: () => Response.json({ keys: [jwk] }) });
  jwksUrl = `http://localhost:${jwksServer.port}/certs`;
});

afterAll(() => {
  jwksServer.stop(true);
});

async function signPushToken(claims: { audience: string; email: string; emailVerified?: boolean }) {
  return await new SignJWT({ email: claims.email, email_verified: claims.emailVerified ?? true })
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuer("https://accounts.google.com")
    .setAudience(claims.audience)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
}

function buildPushBody(attributes?: Record<string, string>) {
  const notification = {
    version: "1.0",
    packageName: "com.vocorbit",
    eventTimeMillis: "1767225600000",
    subscriptionNotification: {
      version: "1.0",
      notificationType: 4,
      purchaseToken: "purchase-token-1",
      subscriptionId: "premium.monthly",
    },
  };
  return {
    message: {
      messageId: "message-1",
      attributes,
      data: Buffer.from(JSON.stringify(notification)).toString("base64"),
    },
    subscription: "projects/example-project/subscriptions/rtdn",
  };
}

function createVerifier(overrides: { audience?: string; serviceAccountEmail?: string } = {}) {
  return createNativeWebhookVerifier({
    googlePubSubJwksUrl: jwksUrl,
    googlePubSubAudience: "audience" in overrides ? overrides.audience : AUDIENCE,
    googlePubSubServiceAccountEmail:
      "serviceAccountEmail" in overrides ? overrides.serviceAccountEmail : PUSH_SERVICE_ACCOUNT,
  });
}

describe("native google webhook verifier", () => {
  it("accepts a push from the configured service account and ignores user ids in attributes", async () => {
    const token = await signPushToken({ audience: AUDIENCE, email: PUSH_SERVICE_ACCOUNT });

    const event = await createVerifier().verifyWebhook({
      store: "google",
      headers: { Authorization: `Bearer ${token}` },
      body: buildPushBody({ userId: "victim-user-id" }),
    });

    expect(event).toMatchObject({
      store: "google",
      eventId: "message-1",
      purchaseToken: "purchase-token-1",
      sku: "premium.monthly",
      status: "active",
    });
    expect(event.userId).toBeUndefined();
  });

  it("rejects a Google-signed token minted by another service account", async () => {
    const token = await signPushToken({
      audience: AUDIENCE,
      email: "attacker@other-project.iam.gserviceaccount.com",
    });

    await expect(
      createVerifier().verifyWebhook({
        store: "google",
        headers: { authorization: `Bearer ${token}` },
        body: buildPushBody(),
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejects a token whose service account email is not verified", async () => {
    const token = await signPushToken({
      audience: AUDIENCE,
      email: PUSH_SERVICE_ACCOUNT,
      emailVerified: false,
    });

    await expect(
      createVerifier().verifyWebhook({
        store: "google",
        headers: { authorization: `Bearer ${token}` },
        body: buildPushBody(),
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejects a token issued for another audience", async () => {
    const token = await signPushToken({
      audience: "https://attacker.example.com/push",
      email: PUSH_SERVICE_ACCOUNT,
    });

    await expect(
      createVerifier().verifyWebhook({
        store: "google",
        headers: { authorization: `Bearer ${token}` },
        body: buildPushBody(),
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejects every push while audience or service account is not configured", async () => {
    const token = await signPushToken({ audience: AUDIENCE, email: PUSH_SERVICE_ACCOUNT });

    for (const verifier of [
      createVerifier({ audience: undefined }),
      createVerifier({ serviceAccountEmail: undefined }),
    ]) {
      await expect(
        verifier.verifyWebhook({
          store: "google",
          headers: { authorization: `Bearer ${token}` },
          body: buildPushBody(),
        }),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    }
  });
});
