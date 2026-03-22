import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { code, subtotal } = await req.json();
    if (!code) return NextResponse.json({ error: "Code requis." }, { status: 400 });

    const coupon = await db.select().from(coupons)
      .where(eq(coupons.code, code.toUpperCase()))
      .limit(1);

    const c = coupon[0];
    if (!c) return NextResponse.json({ error: "Code promo invalide." }, { status: 404 });
    if (!c.isActive) return NextResponse.json({ error: "Ce coupon est désactivé." }, { status: 400 });
    if (c.expiresAt && c.expiresAt < new Date()) {
      return NextResponse.json({ error: "Ce coupon a expiré." }, { status: 400 });
    }
    if (c.usageLimit && c.usedCount >= c.usageLimit) {
      return NextResponse.json({ error: "Ce coupon a atteint sa limite d'utilisation." }, { status: 400 });
    }
    if (c.minOrderAmount && subtotal < c.minOrderAmount) {
      return NextResponse.json({
        error: `Montant minimum requis : ${c.minOrderAmount} FCFA.`,
      }, { status: 400 });
    }

    // Calculate discount
    let discount = 0;
    if (c.type === "PERCENT") {
      discount = Math.round(subtotal * c.value / 100);
      if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
    } else {
      discount = c.value;
    }

    return NextResponse.json({ code: c.code, discount, type: c.type, value: c.value });
  } catch (err) {
    console.error("[coupons/validate]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
