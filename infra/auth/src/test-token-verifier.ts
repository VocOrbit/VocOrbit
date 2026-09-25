import type {
  FirebaseIdTokenVerifier,
  VerifiedFirebaseToken,
} from "../../../modules/social-auth/src/ports/id-token-verifier";
import { UnauthorizedError } from "../../../packages/core/src/errors";

function fromToken(idToken: string): VerifiedFirebaseToken {
  if (idToken === "test-token") {
    return {
      subject: "firebase-test-user",
      email: "firebase.test@example.com",
      name: "Firebase Test User",
      emailVerified: true,
      signInProvider: "test",
      claims: {
        sub: "firebase-test-user",
        email: "firebase.test@example.com",
      },
    };
  }

  if (idToken.startsWith("test-token:")) {
    const email = idToken.slice("test-token:".length).trim().toLowerCase();
    if (!email || !email.includes("@")) {
      throw new UnauthorizedError("Invalid test firebase token");
    }
    const subject = `firebase-${email.replace(/[^a-z0-9]+/g, "-")}`;
    return {
      subject,
      email,
      name: email.split("@")[0],
      emailVerified: true,
      signInProvider: "test",
      claims: {
        sub: subject,
        email,
      },
    };
  }

  throw new UnauthorizedError("Invalid firebase token");
}

export function createTestFirebaseTokenVerifier(): FirebaseIdTokenVerifier {
  return {
    async verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseToken> {
      return fromToken(idToken);
    },
  };
}
