"use server";

import { db } from "@/lib/db";
import { pointsAccounts, pointsTransactions, orders } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq } from "drizzle-orm";

// 1 point = 10 FCFA commandés (arrondi à l'unité)
const POINTS_PER_FCFA = 0.1;
// Seuil min pour une rédemption (100 points = 1 000 FCFA de réduction)
export const POINTS_TO_FCFA = 10;
export const MIN_REDEEM = 100;

async function getOrCreateAccount(userId: string) {
  const rows = await db.select().from(pointsAccounts)
    .where(eq(pointsAccounts.userId, userId)).limit(1);
  if (rows[0]) return rows[0];

  const [acc] = await db.insert(pointsAccounts).values({
    id: createId(), userId, total: 0, lifetime: 0,
  }).returning();
  return acc;
}

// ── Créditer des points après commande ────────────────────────────────────────
export async function awardPoints(userId: string, orderTotal: number, orderId: string) {
  try {
    const earned = Math.floor(orderTotal * POINTS_PER_FCFA);
    if (earned <= 0) return;

    const acc = await getOrCreateAccount(userId);
    await db.update(pointsAccounts).set({
      total:    acc.total + earned,
      lifetime: acc.lifetime + earned,
      updatedAt: new Date(),
    }).where(eq(pointsAccounts.id, acc.id));

    await db.insert(pointsTransactions).values({
      id:          createId(),
      accountId:   acc.id,
      amount:      earned,
      reason:      "COMMANDE",
      referenceId: orderId,
    });

    console.log(`[points] +${earned} pts → ${userId}`);
  } catch (err) {
    console.error("[points] awardPoints error:", err);
  }
}

// ── Vérifier si l'utilisateur peut racheter des points ───────────────────────
export async function canRedeem(userId: string, pointsToRedeem: number): Promise<boolean> {
  if (pointsToRedeem < MIN_REDEEM) return false;
  const acc = await db.select().from(pointsAccounts)
    .where(eq(pointsAccounts.userId, userId)).limit(1);
  return (acc[0]?.total ?? 0) >= pointsToRedeem;
}

// ── Débiter des points (rachat) ───────────────────────────────────────────────
export async function redeemPoints(
  userId: string,
  pointsToRedeem: number,
  orderId: string,
): Promise<{ success: boolean; discountFcfa: number; error?: string }> {
  try {
    if (pointsToRedeem < MIN_REDEEM) {
      return { success: false, discountFcfa: 0, error: `Minimum ${MIN_REDEEM} points.` };
    }

    const acc = await getOrCreateAccount(userId);
    if (acc.total < pointsToRedeem) {
      return { success: false, discountFcfa: 0, error: "Points insuffisants." };
    }

    const discountFcfa = pointsToRedeem * POINTS_TO_FCFA;
    await db.update(pointsAccounts).set({
      total:    acc.total - pointsToRedeem,
      updatedAt: new Date(),
    }).where(eq(pointsAccounts.id, acc.id));

    await db.insert(pointsTransactions).values({
      id:          createId(),
      accountId:   acc.id,
      amount:      -pointsToRedeem,
      reason:      "RACHAT",
      referenceId: orderId,
    });

    return { success: true, discountFcfa };
  } catch (err) {
    console.error("[points] redeemPoints error:", err);
    return { success: false, discountFcfa: 0, error: "Erreur serveur." };
  }
}

// ── Lire le solde + historique ────────────────────────────────────────────────
export async function getPointsData(userId: string) {
  const acc = await getOrCreateAccount(userId);
  const history = await db.select().from(pointsTransactions)
    .where(eq(pointsTransactions.accountId, acc.id))
    .orderBy(pointsTransactions.createdAt)
    .limit(20);

  return {
    total:    acc.total,
    lifetime: acc.lifetime,
    fcfaValue: acc.total * POINTS_TO_FCFA,
    canRedeem: acc.total >= MIN_REDEEM,
    history:  history.reverse(),
  };
}
