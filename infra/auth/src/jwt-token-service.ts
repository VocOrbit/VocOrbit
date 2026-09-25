import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type {
  AccessTokenClaims,
  AuthTokenService,
  RefreshTokenClaims,
} from "../../../modules/social-auth/src/ports/token-service";
import { UnauthorizedError } from "../../../packages/core/src/errors";

type JwtTokenServiceConfig = {
  secret: string;
  issuer: string;
  audience: string;
  accessTokenTtlSec: number;
  refreshTokenTtlSec: number;
};

type TokenType = "access" | "refresh";

type SignPayload = {
  userId: string;
  sessionId: string;
  identity: {
    provider: string;
    subject: string;
    signInProvider: string;
    emailVerified: boolean;
  };
  tokenType: TokenType;
};

type ParsedClaims = {
  tokenType: TokenType;
  userId: string;
  sessionId: string;
  identity: {
    provider: "firebase" | "review";
    subject: string;
    signInProvider: string;
    emailVerified: boolean;
  };
};

function assertString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new UnauthorizedError(`Invalid token ${field}`);
  }
  return value;
}

function assertTokenType(value: unknown): TokenType {
  if (value === "access" || value === "refresh") {
    return value;
  }
  throw new UnauthorizedError("Invalid token type");
}

function assertProvider(value: unknown): "firebase" | "review" {
  if (value === "firebase" || value === "review") {
    return value;
  }
  throw new UnauthorizedError("Invalid token provider");
}

function parseClaims(payload: Record<string, unknown>): ParsedClaims {
  const tokenType = assertTokenType(payload.token_type);
  const userId = assertString(payload.sub, "sub");
  const sessionId = assertString(payload.session_id, "session_id");
  const provider = assertProvider(payload.identity_provider);
  const subject = assertString(payload.identity_subject, "identity_subject");
  const signInProvider = assertString(
    payload.identity_sign_in_provider,
    "identity_sign_in_provider",
  );
  const emailVerified = payload.identity_email_verified === true;

  return {
    tokenType,
    userId,
    sessionId,
    identity: {
      provider,
      subject,
      signInProvider,
      emailVerified,
    },
  };
}

function expInSeconds(ttlSec: number): string {
  return `${ttlSec}s`;
}

export function createJwtTokenService(config: JwtTokenServiceConfig): AuthTokenService {
  const key = new TextEncoder().encode(config.secret);

  async function signToken(input: SignPayload, ttlSec: number): Promise<string> {
    return await new SignJWT({
      token_type: input.tokenType,
      session_id: input.sessionId,
      identity_provider: input.identity.provider,
      identity_subject: input.identity.subject,
      identity_sign_in_provider: input.identity.signInProvider,
      identity_email_verified: input.identity.emailVerified,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer(config.issuer)
      .setAudience(config.audience)
      .setSubject(input.userId)
      .setIssuedAt()
      .setJti(randomUUID())
      .setExpirationTime(expInSeconds(ttlSec))
      .sign(key);
  }

  async function verifyToken(token: string, expectedType: "access"): Promise<AccessTokenClaims>;
  async function verifyToken(token: string, expectedType: "refresh"): Promise<RefreshTokenClaims>;
  async function verifyToken(token: string, expectedType: TokenType): Promise<ParsedClaims> {
    const verified = await (async () => {
      try {
        return await jwtVerify(token, key, {
          issuer: config.issuer,
          audience: config.audience,
        });
      } catch {
        throw new UnauthorizedError("Invalid token");
      }
    })();

    const claims = parseClaims(verified.payload as Record<string, unknown>);
    if (claims.tokenType !== expectedType) {
      throw new UnauthorizedError("Unexpected token type");
    }
    return claims;
  }

  return {
    async createTokenPair(input) {
      const accessToken = await signToken(
        {
          tokenType: "access",
          userId: input.userId,
          sessionId: input.sessionId,
          identity: input.identity,
        },
        config.accessTokenTtlSec,
      );
      const refreshToken = await signToken(
        {
          tokenType: "refresh",
          userId: input.userId,
          sessionId: input.sessionId,
          identity: input.identity,
        },
        config.refreshTokenTtlSec,
      );
      return {
        accessToken,
        refreshToken,
        accessTokenExpiresInSec: config.accessTokenTtlSec,
        refreshTokenExpiresInSec: config.refreshTokenTtlSec,
      };
    },

    async verifyAccessToken(token) {
      return await verifyToken(token, "access");
    },

    async verifyRefreshToken(token) {
      return await verifyToken(token, "refresh");
    },
  };
}
