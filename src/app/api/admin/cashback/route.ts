import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cashbackRules } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  try {
    const rules = await db.select().from(cashbackRules).limit(1);
    return NextResponse.json(rules[0] ?? null);
  } catch (err) {
    return NextResponse.json(null, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { minOrderAmount, cashbackPercent, maxCashback, isActive } = await req.json();

  try {
    const existing = await db.select().from(cashbackRules).limit(1);

    if (existing[0]) {
      await db.update(cashbackRules).set({
        minOrderAmount: Number(minOrderAmount) || 50000,
        cashbackPercent: Number(cashbackPercent) || 5,
        maxCashback: maxCashback ? Number(maxCashback) : null,
        isActive: Boolean(isActive),
      }).where(eq(cashbackRules.id, existing[0].id));
    } else {
      await db.insert(cashbackRules).values({
        id: createId(),
        minOrderAmount: Number(minOrderAmount) || 50000,
        cashbackPercent: Number(cashbackPercent) || 5,
        maxCashback: maxCashback ? Number(maxCashback) : null,
        isActive: Boolean(isActive),
      });
    }

    const updated = await db.select().from(cashbackRules).limit(1);
    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error("[admin/cashback PUT]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
