import { Elysia } from "elysia";
import { ok } from "../../../../packages/core/src/http/response";
import { withSpan } from "../../../../packages/core/src/observability/tracing";
import { toSocialAuthSessionResponse, toSocialAuthSignInResponse } from "../mapper";
import type { SocialAuthPublicContract } from "../public-contract";
import { firebaseSignInBodySchema, refreshSessionBodySchema, reviewSignInBodySchema } from "./schemas";

export function createSocialAuthRoutes(auth: SocialAuthPublicContract) {
  return new Elysia({
    name: "social-auth-routes",
    detail: {
      tags: ["Auth"],
    },
  })
    .get(
      "/auth/review/status",
      () => {
        return ok(auth.getReviewSignInStatus());
      },
      {
        detail: {
          summary: "Get review email/password sign-in availability",
        },
      },
    )
    .post(
      "/auth/review/sign-in",
      async ({ body }) => {
        return await withSpan(
          "auth.review_sign_in",
          async (span) => {
            const result = await auth.signInWithReview(body);
            span.setAttribute("auth.provider", "review");
            return ok(toSocialAuthSignInResponse(result));
          },
          {
            attributes: {
              "auth.operation": "review_sign_in",
            },
          },
        );
      },
      {
        body: reviewSignInBodySchema,
        detail: {
          summary: "Sign in with configured review email/password and issue local JWT pair",
        },
      },
    )
    .post(
      "/auth/firebase/sign-in",
      async ({ body }) => {
        return await withSpan(
          "auth.firebase_sign_in",
          async (span) => {
            const result = await auth.signInWithFirebase(body);
            span.setAttribute("auth.provider", "firebase");
            return ok(toSocialAuthSignInResponse(result));
          },
          {
            attributes: {
              "auth.operation": "firebase_sign_in",
            },
          },
        );
      },
      {
        body: firebaseSignInBodySchema,
        detail: {
          summary: "Sign in with Firebase ID token and issue local JWT pair",
        },
      },
    )
    .post(
      "/auth/refresh",
      async ({ body }) => {
        return await withSpan(
          "auth.refresh_session",
          async (span) => {
            const result = await auth.refreshSession(body);
            span.setAttribute("auth.operation", "refresh_session");
            return ok(toSocialAuthSignInResponse(result));
          },
          {
            attributes: {
              "auth.route": "/v1/auth/refresh",
            },
          },
        );
      },
      {
        body: refreshSessionBodySchema,
        detail: {
          summary: "Rotate refresh token and issue a new local JWT pair",
        },
      },
    )
    .get(
      "/auth/me",
      async ({ headers }) => {
        const session = await auth.authenticateBearerToken(headers.authorization);
        return ok(toSocialAuthSessionResponse(session));
      },
      {
        detail: {
          summary: "Resolve current user from local access token",
          security: [{ bearerAuth: [] }],
        },
      },
    )
    .post(
      "/auth/logout",
      async ({ headers }) => {
        await auth.logout(headers.authorization);
        return ok({ loggedOut: true });
      },
      {
        detail: {
          summary: "Revoke current auth session",
          security: [{ bearerAuth: [] }],
        },
      },
    );
}
