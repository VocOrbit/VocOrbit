import { Elysia } from "elysia";
import { UnauthorizedError } from "../../../../packages/core/src/errors";
import { ok } from "../../../../packages/core/src/http/response";
import type { BillingPublicContract } from "../public-contract";
import {
  billingVerifyReceiptBodySchema,
  billingWebhookRawBodySchema,
  billingWebhookParamsSchema,
} from "./schemas";

type BillingRouteOptions = {
  requiresAuth?: boolean;
};

type AuthContext = {
  auth?: {
    user?: {
      id?: string;
    };
  };
};

function resolveUserId(context: AuthContext, requiresAuth: boolean): string {
  if (!requiresAuth) return "anonymous";
  const userId = context.auth?.user?.id;
  if (!userId) throw new UnauthorizedError("Missing authenticated user");
  return userId;
}

export function createBillingProtectedRoutes(
  billing: BillingPublicContract,
  options: BillingRouteOptions = {},
) {
  const detail = options.requiresAuth
    ? {
        tags: ["Billing"],
        security: [{ bearerAuth: [] }],
      }
    : { tags: ["Billing"] };

  return new Elysia({
    name: "billing-protected-routes",
    detail,
  })
    .get(
      "/billing/skus",
      () => {
        return ok(billing.getSkuCatalog());
      },
      {
        detail: {
          summary: "List billable SKUs and credit plans",
        },
      },
    )
    .get(
      "/billing/subscription",
      async (context) => {
        const userId = resolveUserId(context as AuthContext, options.requiresAuth === true);
        const subscription = await billing.getUserSubscription(userId);
        return ok(subscription);
      },
      {
        detail: {
          summary: "Get current user subscription state",
        },
      },
    )
    .post(
      "/billing/receipts/verify",
      async (context) => {
        const userId = resolveUserId(context as AuthContext, options.requiresAuth === true);
        const result = await billing.verifyReceipt({
          userId,
          store: context.body.store,
          receipt: context.body.receipt,
        });
        return ok(result);
      },
      {
        body: billingVerifyReceiptBodySchema,
        detail: {
          summary: "Verify store receipt and apply SKU mapped subscription plan",
        },
      },
    );
}

export function createBillingPublicRoutes(billing: BillingPublicContract) {
  return new Elysia({
    name: "billing-public-routes",
    detail: {
      tags: ["Billing"],
    },
  }).post(
    "/billing/webhooks/:store",
    async (context) => {
      const result = await billing.handleWebhook({
        store: context.params.store,
        headers: context.headers,
        body: context.body,
      });
      return ok(result);
    },
    {
      params: billingWebhookParamsSchema,
      body: billingWebhookRawBodySchema,
      detail: {
        summary: "Handle billing webhooks and update subscription state",
      },
    },
  );
}
