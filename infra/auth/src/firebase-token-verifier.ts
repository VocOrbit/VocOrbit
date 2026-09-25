import type { App } from "firebase-admin/app";
import { applicationDefault, cert, getApp, initializeApp } from "firebase-admin/app";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getAuth } from "firebase-admin/auth";
import type {
  FirebaseIdTokenVerifier,
  VerifiedFirebaseToken,
} from "../../../modules/social-auth/src/ports/id-token-verifier";
import { UnauthorizedError } from "../../../packages/core/src/errors";

type FirebaseCredentialConfig = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  serviceAccountJson?: string;
};

const TOKEN_REJECT_ERROR_CODES = new Set([
  "auth/argument-error",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/invalid-id-token",
  "auth/user-disabled",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTokenRejectError(error: unknown): boolean {
  if (!isRecord(error)) return false;
  const code = error.code;
  return typeof code === "string" && TOKEN_REJECT_ERROR_CODES.has(code);
}

function sanitizePrivateKey(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/\\n/g, "\n");
}

function parseServiceAccountJson(
  value: string | undefined,
): { projectId?: string; clientEmail?: string; privateKey?: string } | undefined {
  if (!value) return undefined;

  const normalized = value.trim();
  if (!normalized) return undefined;

  const decoded = normalized.startsWith("{")
    ? normalized
    : Buffer.from(normalized, "base64").toString("utf8");

  const parsed = JSON.parse(decoded) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };

  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: sanitizePrivateKey(parsed.private_key),
  };
}

function resolveSignInProvider(decoded: DecodedIdToken): string {
  const firebase = decoded.firebase as { sign_in_provider?: string } | undefined;
  const provider = firebase?.sign_in_provider;
  if (!provider || typeof provider !== "string") {
    return "unknown";
  }
  return provider;
}

function ensureEmail(decoded: DecodedIdToken): string {
  if (!decoded.email || typeof decoded.email !== "string") {
    throw new UnauthorizedError("Firebase token does not include an email");
  }
  return decoded.email;
}

function resolveFirebaseConfig(config: FirebaseCredentialConfig): {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
} {
  const fromJson = parseServiceAccountJson(config.serviceAccountJson);
  const projectId = fromJson?.projectId ?? config.projectId;
  const clientEmail = fromJson?.clientEmail ?? config.clientEmail;
  const privateKey = fromJson?.privateKey ?? sanitizePrivateKey(config.privateKey);
  return { projectId, clientEmail, privateKey };
}

export function createFirebaseIdTokenVerifier(
  config: FirebaseCredentialConfig,
): FirebaseIdTokenVerifier {
  const { projectId, clientEmail, privateKey } = resolveFirebaseConfig(config);

  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID (or FIREBASE_SERVICE_ACCOUNT_JSON) is required");
  }

  const appName = "firebase-auth-verifier";
  let app: App;
  try {
    app = getApp(appName);
  } catch {
    if (clientEmail && privateKey) {
      app = initializeApp(
        {
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          projectId,
        },
        appName,
      );
    } else {
      app = initializeApp(
        {
          credential: applicationDefault(),
          projectId,
        },
        appName,
      );
    }
  }

  const auth = getAuth(app);

  return {
    async verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseToken> {
      let decoded: DecodedIdToken;
      try {
        decoded = await auth.verifyIdToken(idToken, true);
      } catch (error) {
        if (isTokenRejectError(error)) {
          throw new UnauthorizedError("Invalid firebase token");
        }
        throw error;
      }

      return {
        subject: decoded.uid,
        email: ensureEmail(decoded),
        name: typeof decoded.name === "string" ? decoded.name : undefined,
        emailVerified: decoded.email_verified === true,
        signInProvider: resolveSignInProvider(decoded),
        claims: decoded as Record<string, unknown>,
      };
    },
  };
}
