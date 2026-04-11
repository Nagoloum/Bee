"use server";

import { db } from "@/lib/db";
import { referrals, users, wallets, walletTransactions } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq, and } from "drizzle-orm";

const REFERRER_BONUS = 2000;
const REFEREE_BONUS  = 1000;

export async function processReferral(newUserId: string, refCode: string) {
  if (!refCode?.trim()) return;

  try {
    // ✅ FIX — référence users.referralCode (colonne ajoutée dans users.ts)
    const referrerRows = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.referralCode, refCode.trim()))
      .limit(1);

    if (!referrerRows[0]) return;
    const referrer = referrerRows[0];

    if (referrer.id === newUserId) return; // pas d'auto-parrainage

    // ✅ FIX — utilise referredId (nom correct dans le schéma promotions.ts)
    const existing = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referredId, newUserId))
      .limit(1);
    if (existing[0]) return;

    const [referral] = await db.insert(referrals).values({
      id:            createId(),
      referrerId:    referrer.id,
      // ✅ FIX — referredId (pas refereeId)
      referredId:    newUserId,
      type:          "CLIENT_TO_CLIENT",
      rewardGiven:   false,
      rewardType:    "wallet_bonus",
      rewardValue:   REFERRER_BONUS,
    }).returning();

    await creditWallet(newUserId, REFEREE_BONUS, "REFERRAL_BONUS", referral.id,
      "Bonus parrainage — Bienvenue sur BEE !");

    await creditWallet(referrer.id, REFERRER_BONUS, "REFERRAL_BONUS", referral.id,
      "Bonus parrainage — Vous avez invité un nouvel utilisateur");

    await db.update(referrals)
      .set({ rewardGiven: true, updatedAt: new Date() } as any)
      .where(eq(referrals.id, referral.id));

    console.log(`[referral] ${referrer.id} → ${newUserId}`);
  } catch (err) {
    console.error("[referral] Error:", err);
  }
}

async function creditWallet(
  userId:      string,
  amount:      number,
  reason:      string,
  referenceId: string,
  description: string,
) {
  let walletRows = await db.select().from(wallets)
    .where(eq(wallets.userId, userId)).limit(1);

  if (walletRows.length === 0) {
    await db.insert(wallets).values({
      id: createId(), userId, type: "CLIENT", balance: 0, escrow: 0,
    });
    walletRows = await db.select().from(wallets)
      .where(eq(wallets.userId, userId)).limit(1);
  }

  const w    = walletRows[0];
  const prev = w.balance ?? 0;
  const next = prev + amount;

  await db.update(wallets)
    .set({ balance: next, updatedAt: new Date() })
    .where(eq(wallets.id, w.id));

  await db.insert(walletTransactions).values({
    id:            createId(),
    walletId:      w.id,
    type:          "CREDIT",
    amount,
    reason:        reason as any,
    referenceId,
    balanceBefore: prev,
    balanceAfter:  next,
    description,
  });
}
