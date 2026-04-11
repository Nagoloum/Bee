import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cashbackRules } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  try {
    const rows = await db.select().from(cashbackRules).limit(1);
    if (rows[0]) return NextResponse.json(rows[0]);

    // Créer la règle par défaut si elle n'existe pas
    const [created] = await db.insert(cashbackRules).values({
      id:              createId(),
      minOrderAmount:  50000,
      cashbackPercent: 5,
      maxCashback:     null,
      isActive:        true,
    }).returning();
    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { minOrderAmount, cashbackPercent, maxCashback, isActive } = await req.json();

    if (cashbackPercent < 0 || cashbackPercent > 50) {
      return NextResponse.json({ error: "Pourcentage entre 0 et 50." }, { status: 400 });
    }
    if (minOrderAmount < 0) {
      return NextResponse.json({ error: "Montant minimum invalide." }, { status: 400 });
    }

    const existing = await db.select().from(cashbackRules).limit(1);

    if (existing[0]) {
      const [updated] = await db.update(cashbackRules)
        .set({
          minOrderAmount:  Number(minOrderAmount),
          cashbackPercent: Number(cashbackPercent),
          maxCashback:     maxCashback ? Number(maxCashback) : null,
          isActive:        isActive ?? true,
        })
        .returning();
      return NextResponse.json(updated);
    }

    const [created] = await db.insert(cashbackRules).values({
      id:              createId(),
      minOrderAmount:  Number(minOrderAmount),
      cashbackPercent: Number(cashbackPercent),
      maxCashback:     maxCashback ? Number(maxCashback) : null,
      isActive:        isActive ?? true,
    }).returning();
    return NextResponse.json(created);
  } catch (err) {
    console.error("[cashback-rules PUT]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
