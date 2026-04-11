"use server";

import { db } from "@/lib/db";
import { wallets, walletTransactions, cashbackRules } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq } from "drizzle-orm";

/**
 * Award cashback to a client after a confirmed order.
 * Called from the order creation flow.
 * Rules: 5% on orders > 50 000 FCFA (stored in cashbackRules table).
 */
export async function awardCashback(clientId: string, orderTotal: number, orderId: string) {
  try {
    // Fetch active cashback rules
    const rules = await db.select().from(cashbackRules).limit(1);
    const rule = rules[0];
    if (!rule || !rule.isActive) return;
    if (orderTotal < (rule.minOrderAmount ?? 50000)) return;

    const cashbackAmount = Math.floor(orderTotal * (rule.cashbackPercent / 100));
    if (cashbackAmount <= 0) return;
    if (rule.maxCashback && cashbackAmount > rule.maxCashback) return;

    // Get or create client wallet
    let walletRows = await db.select().from(wallets).where(eq(wallets.userId, clientId)).limit(1);

    if (walletRows.length === 0) {
      await db.insert(wallets).values({
        id:       createId(),
        userId:   clientId,
        type:     "CLIENT",
        balance:  0,
        escrow:   0,
      });
      walletRows = await db.select().from(wallets).where(eq(wallets.userId, clientId)).limit(1);
    }

    const w = walletRows[0];
    if (!w) return;

    const prevBalance = w.balance ?? 0;
    const newBalance  = prevBalance + cashbackAmount;

    await db.update(wallets)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(wallets.id, w.id));

    await db.insert(walletTransactions).values({
      id:            createId(),
      walletId:      w.id,
      type:          "CREDIT",
      amount:        cashbackAmount,
      reason:        "CASHBACK",
      referenceId:   orderId,
      balanceBefore: prevBalance,
      balanceAfter:  newBalance,
      description:   `Cashback ${rule.cashbackPercent}% sur commande`,
    });

    console.log(`[cashback] Awarded ${cashbackAmount} FCFA to ${clientId} for order ${orderId}`);
  } catch (err) {
    // Non-blocking — cashback failure should not break the order flow
    console.error("[cashback] Error:", err);
  }
}
