import { and, desc, eq, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  BillingApplyResult,
  BillingStore,
  BillingSubscriptionState,
} from "../../../../../modules/billing/src/domain/billing";
import type { BillingPurchaseRepo } from "../../../../../modules/billing/src/ports/purchase-repo";
import type { VerifiedReceipt } from "../../../../../modules/billing/src/ports/receipt-verifier";
import { ValidationError } from "../../../../../packages/core/src/errors";
import { newId } from "../../../../../packages/core/src/ids";
import {
  billingCreditCycles,
  billingEvents,
  creditLedger,
  purchases,
  userCredits,
} from "../../schema";

type BillingRepoConfig = {
  defaultFreeBasic: number;
  defaultFreeAdvanced: number;
  defaultPaidBasicCap: number;
  defaultPaidAdvancedCap: number;
  monthlyTopupIntervalDays: number;
};

type CreditTx = Pick<PostgresJsDatabase, "insert" | "update" | "select">;

const MS_PER_DAY = 24 * 60 * 60 * 1_000;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function parseTimestamp(value: string | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed;
}

function buildCycleKey(startsAt: Date, expiresAt: Date | null): string {
  return `${startsAt.toISOString()}|${expiresAt ? expiresAt.toISOString() : "open"}`;
}

function effectiveStatus(row: typeof purchases.$inferSelect): BillingSubscriptionState["status"] {
  if (row.status !== "active") return row.status as BillingSubscriptionState["status"];
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return "expired";
  return "active";
}

function mapSubscription(row: typeof purchases.$inferSelect): BillingSubscriptionState {
  return {
    userId: row.userId,
    status: effectiveStatus(row),
    store: row.store as BillingStore,
    sku: row.sku,
    purchaseToken: row.purchaseToken,
    originalTransactionId: row.originalTransactionId ?? undefined,
    startsAt: row.startsAt.toISOString(),
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : undefined,
    lastEventId: row.lastEventId ?? undefined,
    updatedAt: row.updatedAt.toISOString(),
    plan: {
      store: row.store as BillingStore,
      sku: row.sku,
      monthlyPaidBasicTopup: row.monthlyPaidBasicTopup,
      monthlyPaidAdvancedTopup: row.monthlyPaidAdvancedTopup,
      paidBasicCap: row.paidBasicCap,
      paidAdvancedCap: row.paidAdvancedCap,
    },
  };
}

async function ensureCreditRow(tx: CreditTx, userId: string, config: BillingRepoConfig, now: Date) {
  await tx
    .insert(userCredits)
    .values({
      userId,
      freeBasic: config.defaultFreeBasic,
      freeAdvanced: config.defaultFreeAdvanced,
      paidBasicCap: config.defaultPaidBasicCap,
      paidAdvancedCap: config.defaultPaidAdvancedCap,
      monthlyPaidBasicTopup: 0,
      monthlyPaidAdvancedTopup: 0,
      nextMonthlyTopupAt: addDays(now, config.monthlyTopupIntervalDays),
      updatedAt: now,
    })
    .onConflictDoNothing({ target: userCredits.userId });
}

async function upsertPurchase(
  tx: CreditTx,
  userId: string,
  eventId: string,
  receipt: VerifiedReceipt,
  startsAt: Date,
  expiresAt: Date | null,
  plan: {
    monthlyPaidBasicTopup: number;
    monthlyPaidAdvancedTopup: number;
    paidBasicCap: number;
    paidAdvancedCap: number;
  },
  now: Date,
) {
  const rows = await tx
    .insert(purchases)
    .values({
      id: newId(),
      userId,
      store: receipt.store,
      sku: receipt.sku,
      status: receipt.status,
      purchaseToken: receipt.purchaseToken,
      originalTransactionId: receipt.originalTransactionId,
      startsAt,
      expiresAt,
      lastEventId: eventId,
      monthlyPaidBasicTopup: plan.monthlyPaidBasicTopup,
      monthlyPaidAdvancedTopup: plan.monthlyPaidAdvancedTopup,
      paidBasicCap: plan.paidBasicCap,
      paidAdvancedCap: plan.paidAdvancedCap,
      rawPayload: receipt.rawPayload,
      updatedAt: now,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: [purchases.store, purchases.purchaseToken],
      set: {
        userId,
        sku: receipt.sku,
        status: receipt.status,
        originalTransactionId: receipt.originalTransactionId,
        startsAt,
        expiresAt,
        lastEventId: eventId,
        monthlyPaidBasicTopup: plan.monthlyPaidBasicTopup,
        monthlyPaidAdvancedTopup: plan.monthlyPaidAdvancedTopup,
        paidBasicCap: plan.paidBasicCap,
        paidAdvancedCap: plan.paidAdvancedCap,
        rawPayload: receipt.rawPayload,
        updatedAt: now,
      },
    })
    .returning();

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to upsert purchase");
  }
  return row;
}

async function recordBillingEvent(
  tx: CreditTx,
  input: {
    userId: string;
    source: BillingApplyResult["source"];
    eventId: string;
    receipt: VerifiedReceipt;
    now: Date;
  },
): Promise<boolean> {
  const rows = await tx
    .insert(billingEvents)
    .values({
      id: newId(),
      userId: input.userId,
      store: input.receipt.store,
      eventId: input.eventId,
      source: input.source,
      purchaseToken: input.receipt.purchaseToken,
      status: input.receipt.status,
      rawPayload: input.receipt.rawPayload,
      createdAt: input.now,
    })
    .onConflictDoNothing({
      target: [billingEvents.store, billingEvents.eventId],
    })
    .returning({ id: billingEvents.id });

  return rows.length > 0;
}

async function recordCreditCycle(
  tx: CreditTx,
  input: {
    userId: string;
    eventId: string;
    receipt: VerifiedReceipt;
    creditType: "basic" | "advanced";
    cycleKey: string;
    amount: number;
    now: Date;
  },
): Promise<number> {
  if (input.amount <= 0) return 0;

  const insertedRows = await tx
    .insert(billingCreditCycles)
    .values({
      id: newId(),
      userId: input.userId,
      store: input.receipt.store,
      purchaseToken: input.receipt.purchaseToken,
      creditType: input.creditType,
      cycleKey: input.cycleKey,
      eventId: input.eventId,
      amount: input.amount,
      createdAt: input.now,
    })
    .onConflictDoNothing({
      target: [
        billingCreditCycles.store,
        billingCreditCycles.purchaseToken,
        billingCreditCycles.creditType,
        billingCreditCycles.cycleKey,
      ],
    })
    .returning({ id: billingCreditCycles.id });

  if (insertedRows.length > 0) {
    return input.amount;
  }

  const existingRows = await tx
    .select({
      amount: billingCreditCycles.amount,
    })
    .from(billingCreditCycles)
    .where(
      and(
        eq(billingCreditCycles.store, input.receipt.store),
        eq(billingCreditCycles.purchaseToken, input.receipt.purchaseToken),
        eq(billingCreditCycles.creditType, input.creditType),
        eq(billingCreditCycles.cycleKey, input.cycleKey),
      ),
    )
    .limit(1);
  const existingAmount = existingRows[0]?.amount ?? 0;
  if (existingAmount >= input.amount) {
    return 0;
  }

  await tx
    .update(billingCreditCycles)
    .set({
      amount: input.amount,
      eventId: input.eventId,
    })
    .where(
      and(
        eq(billingCreditCycles.store, input.receipt.store),
        eq(billingCreditCycles.purchaseToken, input.receipt.purchaseToken),
        eq(billingCreditCycles.creditType, input.creditType),
        eq(billingCreditCycles.cycleKey, input.cycleKey),
      ),
    );

  return input.amount - existingAmount;
}

export function createBillingRepo(
  db: PostgresJsDatabase,
  config: BillingRepoConfig,
): BillingPurchaseRepo {
  return {
    async applyReceipt(input): Promise<BillingApplyResult> {
      return await db.transaction(async (tx) => {
        const now = new Date();
        const startsAt = parseTimestamp(input.receipt.startsAt, now);
        const expiresAt = input.receipt.expiresAt ? parseTimestamp(input.receipt.expiresAt, now) : null;
        const cycleKey = buildCycleKey(startsAt, expiresAt);
        await ensureCreditRow(tx, input.userId, config, now);

        const existingRows = await tx
          .select()
          .from(purchases)
          .where(
            and(
              eq(purchases.store, input.receipt.store),
              eq(purchases.purchaseToken, input.receipt.purchaseToken),
            ),
          )
          .limit(1);
        const existing = existingRows[0];

        if (existing && existing.userId !== input.userId) {
          throw new ValidationError("purchase token is already linked to another user");
        }

        const eventInserted = await recordBillingEvent(tx, {
          userId: input.userId,
          source: input.source,
          eventId: input.eventId,
          receipt: input.receipt,
          now,
        });

        if (!eventInserted) {
          const latestRows = await tx
            .select()
            .from(purchases)
            .where(
              and(
                eq(purchases.store, input.receipt.store),
                eq(purchases.purchaseToken, input.receipt.purchaseToken),
              ),
            )
            .limit(1);
          const latest = latestRows[0];

          if (latest && latest.userId !== input.userId) {
            throw new ValidationError("purchase token is already linked to another user");
          }

          if (!latest) {
            return {
              applied: false,
              source: input.source,
              eventId: input.eventId,
              subscription: {
                userId: input.userId,
                status: "none",
              },
            };
          }

          return {
            applied: false,
            source: input.source,
            eventId: input.eventId,
            purchaseId: latest.id,
            subscription: mapSubscription(latest),
          };
        }

        const savedPurchase = await upsertPurchase(
          tx,
          input.userId,
          input.eventId,
          input.receipt,
          startsAt,
          expiresAt,
          {
            monthlyPaidBasicTopup: input.skuPlan.monthlyPaidBasicTopup,
            monthlyPaidAdvancedTopup: input.skuPlan.monthlyPaidAdvancedTopup,
            paidBasicCap: input.skuPlan.paidBasicCap,
            paidAdvancedCap: input.skuPlan.paidAdvancedCap,
          },
          now,
        );

        if (input.receipt.status === "active") {
          const basicDelta = await recordCreditCycle(tx, {
            userId: input.userId,
            eventId: input.eventId,
            receipt: input.receipt,
            creditType: "basic",
            cycleKey,
            amount: input.skuPlan.monthlyPaidBasicTopup,
            now,
          });
          const advancedDelta = await recordCreditCycle(tx, {
            userId: input.userId,
            eventId: input.eventId,
            receipt: input.receipt,
            creditType: "advanced",
            cycleKey,
            amount: input.skuPlan.monthlyPaidAdvancedTopup,
            now,
          });
          const nextTopupAt = addDays(
            startsAt,
            config.monthlyTopupIntervalDays,
          );

          await tx
            .update(userCredits)
            .set({
              paidBasic: sql`LEAST(${input.skuPlan.paidBasicCap}, ${userCredits.paidBasic} + ${basicDelta})`,
              paidAdvanced: sql`LEAST(${input.skuPlan.paidAdvancedCap}, ${userCredits.paidAdvanced} + ${advancedDelta})`,
              paidBasicCap: input.skuPlan.paidBasicCap,
              paidAdvancedCap: input.skuPlan.paidAdvancedCap,
              monthlyPaidBasicTopup: input.skuPlan.monthlyPaidBasicTopup,
              monthlyPaidAdvancedTopup: input.skuPlan.monthlyPaidAdvancedTopup,
              nextMonthlyTopupAt: nextTopupAt,
              updatedAt: now,
            })
            .where(eq(userCredits.userId, input.userId));

          if (basicDelta > 0) {
            await tx.insert(creditLedger).values({
              id: newId(),
              userId: input.userId,
              reason:
                input.source === "webhook" ? "billing_webhook_topup" : "billing_receipt_topup",
              creditType: "basic",
              amount: basicDelta,
              mode: "paid",
              requestId: `${input.eventId}:basic:${cycleKey}`,
              createdAt: now,
            });
          }

          if (advancedDelta > 0) {
            await tx.insert(creditLedger).values({
              id: newId(),
              userId: input.userId,
              reason:
                input.source === "webhook" ? "billing_webhook_topup" : "billing_receipt_topup",
              creditType: "advanced",
              amount: advancedDelta,
              mode: "paid",
              requestId: `${input.eventId}:advanced:${cycleKey}`,
              createdAt: now,
            });
          }
        } else {
          await tx
            .update(userCredits)
            .set({
              monthlyPaidBasicTopup: 0,
              monthlyPaidAdvancedTopup: 0,
              nextMonthlyTopupAt: addDays(now, config.monthlyTopupIntervalDays),
              updatedAt: now,
            })
            .where(eq(userCredits.userId, input.userId));
        }

        return {
          applied: true,
          source: input.source,
          eventId: input.eventId,
          purchaseId: savedPurchase.id,
          subscription: mapSubscription(savedPurchase),
        };
      });
    },

    async getUserSubscription(userId) {
      const rows = await db
        .select()
        .from(purchases)
        .where(eq(purchases.userId, userId))
        .orderBy(desc(purchases.updatedAt), desc(purchases.createdAt))
        .limit(1);
      const row = rows[0];
      if (!row) {
        return {
          userId,
          status: "none",
        };
      }
      return mapSubscription(row);
    },

    async resolveUserIdByPurchase(store, purchaseToken) {
      const rows = await db
        .select({ userId: purchases.userId })
        .from(purchases)
        .where(and(eq(purchases.store, store), eq(purchases.purchaseToken, purchaseToken)))
        .limit(1);
      return rows[0]?.userId ?? null;
    },
  };
}
