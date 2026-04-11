"use server";

import { db } from "@/lib/db";
import { pointsAccounts, pointsTransactions } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq } from "drizzle-orm";

const POINTS = {
  earn_order:    10,
  earn_review:   5,
  earn_referral: 50,
};

async function getOrCreateAccount(userId: string) {
  const rows = await db.select().from(pointsAccounts)
    .where(eq(pointsAccounts.userId, userId)).limit(1);
  if (rows[0]) return rows[0];

  const [created] = await db.insert(pointsAccounts).values({
    id: createId(), userId, total: 0, lifetime: 0,
  }).returning();
  return created;
}

export async function awardPoints(
  userId:      string,
  action:      keyof typeof POINTS,
  referenceId: string,
) {
  try {
    const pts     = POINTS[action];
    const account = await getOrCreateAccount(userId);

    await db.update(pointsAccounts).set({
      total:    account.total    + pts,
      lifetime: account.lifetime + pts,
      updatedAt: new Date(),
    }).where(eq(pointsAccounts.id, account.id));

    const reasonMap: Record<string, string> = {
      earn_order:    "Achat validé",
      earn_review:   "Avis laissé",
      earn_referral: "Parrainage réussi",
    };

    await db.insert(pointsTransactions).values({
      id:          createId(),
      accountId:   account.id,
      amount:      pts,
      reason:      reasonMap[action],
      referenceId,
    });

    console.log(`[points] +${pts} pour ${userId} (${action})`);
  } catch (err) {
    console.error("[points] Error:", err);
  }
}
