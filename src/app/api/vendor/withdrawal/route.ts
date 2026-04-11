import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withdrawalRequests, wallets, walletTransactions } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { amount, method, accountDetails, accountName } = await req.json();

    if (!amount || amount < 1000) {
      return NextResponse.json({ error: "Montant minimum : 1 000 FCFA." }, { status: 400 });
    }
    if (!method || !accountDetails || !accountName) {
      return NextResponse.json({ error: "Méthode, numéro de compte et nom requis." }, { status: 400 });
    }

    // Get vendor wallet
    const walletRows = await db.select().from(wallets)
      .where(eq(wallets.userId, session.user.id)).limit(1);

    if (!walletRows[0]) return NextResponse.json({ error: "Portefeuille introuvable." }, { status: 404 });
    const w = walletRows[0];

    if ((w.balance ?? 0) < amount) {
      return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });
    }

    // Create withdrawal request (PENDING admin approval)
    const [withdrawal] = await db.insert(withdrawalRequests).values({
      id:             createId(),
      userId:         session.user.id,
      walletId:       w.id,
      amount:         Number(amount),
      status:         "PENDING",
      method,
      accountDetails,
      accountName,
    }).returning();

    return NextResponse.json(withdrawal, { status: 201 });
  } catch (err) {
    console.error("[vendor/withdrawal POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
