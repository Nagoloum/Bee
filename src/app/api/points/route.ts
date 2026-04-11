import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pointsAccounts, pointsTransactions } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Règles de points (configurables plus tard via admin)
const POINTS_PER_ORDER    = 10;  // 10 pts par commande
const POINTS_PER_REVIEW   = 5;   // 5 pts par avis laissé
const POINTS_PER_REFERRAL = 50;  // 50 pts par filleul inscrit
const FCFA_PER_POINT      = 10;  // 1 pt = 10 FCFA à la rédemption
const MIN_REDEEM          = 100; // minimum 100 pts pour échanger

async function getOrCreateAccount(userId: string) {
  const rows = await db.select().from(pointsAccounts)
    .where(eq(pointsAccounts.userId, userId)).limit(1);
  if (rows[0]) return rows[0];

  const [created] = await db.insert(pointsAccounts).values({
    id:       createId(),
    userId,
    total:    0,
    lifetime: 0,
  }).returning();
  return created;
}

// GET — solde + historique
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const account = await getOrCreateAccount(session.user.id);

  const transactions = await db.select().from(pointsTransactions)
    .where(eq(pointsTransactions.accountId, account.id))
    .orderBy(desc(pointsTransactions.createdAt))
    .limit(30);

  return NextResponse.json({
    total:        account.total,
    lifetime:     account.lifetime,
    fcfaValue:    account.total * FCFA_PER_POINT,
    minRedeem:    MIN_REDEEM,
    fcfaPerPoint: FCFA_PER_POINT,
    transactions,
  });
}

// POST — ajouter ou retirer des points
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { action, referenceId } = await req.json();

  if (!["earn_order", "earn_review", "earn_referral", "redeem"].includes(action)) {
    return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  }

  const account = await getOrCreateAccount(session.user.id);

  let amount = 0;
  let reason = "";

  if (action === "earn_order")    { amount = POINTS_PER_ORDER;    reason = "Achat validé"; }
  if (action === "earn_review")   { amount = POINTS_PER_REVIEW;   reason = "Avis laissé"; }
  if (action === "earn_referral") { amount = POINTS_PER_REFERRAL; reason = "Parrainage réussi"; }
  if (action === "redeem") {
    if (account.total < MIN_REDEEM) {
      return NextResponse.json({ error: `Minimum ${MIN_REDEEM} points requis.` }, { status: 400 });
    }
    amount = -account.total; // utiliser tous les points
    reason = "Échange contre réduction";
  }

  const newTotal = Math.max(0, account.total + amount);

  await db.update(pointsAccounts).set({
    total:    newTotal,
    lifetime: action !== "redeem" ? account.lifetime + amount : account.lifetime,
    updatedAt: new Date(),
  }).where(eq(pointsAccounts.id, account.id));

  await db.insert(pointsTransactions).values({
    id:          createId(),
    accountId:   account.id,
    amount,
    reason,
    referenceId: referenceId ?? null,
  });

  return NextResponse.json({
    success:   true,
    newTotal,
    fcfaValue: newTotal * FCFA_PER_POINT,
    earned:    action !== "redeem" ? amount : 0,
    redeemed:  action === "redeem" ? Math.abs(amount) : 0,
  });
}
