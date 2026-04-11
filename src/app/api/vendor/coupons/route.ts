import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coupons, vendorSubscriptions, subscriptionPlans } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getVendorByUserId } from "@/lib/actions/vendor";

// POST — create coupon
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const vendor = await getVendorByUserId(session.user.id);
    if (!vendor)  return NextResponse.json({ error: "Vendeur introuvable" }, { status: 403 });

    const body = await req.json();
    const { code, type, value, minOrderAmount, maxDiscount, usageLimit, expiresAt } = body;

    if (!code || !type || !value) {
      return NextResponse.json({ error: "Code, type et valeur sont requis." }, { status: 400 });
    }

    // Check plan limits
    const sub = await db
      .select({ maxCoupons: subscriptionPlans.maxCoupons, maxDiscount: subscriptionPlans.couponMaxDiscount })
      .from(vendorSubscriptions)
      .leftJoin(subscriptionPlans, eq(vendorSubscriptions.planId, subscriptionPlans.id))
      .where(eq(vendorSubscriptions.vendorId, vendor.id))
      .limit(1);

    const limits = sub[0] ?? { maxCoupons: 0, maxDiscount: 0 };

    if (limits.maxCoupons === 0) {
      return NextResponse.json({ error: "Votre plan ne permet pas de créer des coupons." }, { status: 403 });
    }

    // Count existing coupons
    const existing = await db.select({ id: coupons.id }).from(coupons).where(eq(coupons.vendorId, vendor.id));
    if (existing.length >= (limits.maxCoupons ?? 0)) {
      return NextResponse.json({ error: `Limite de ${limits.maxCoupons} coupons atteinte.` }, { status: 403 });
    }

    if (type === "PERCENT" && value > (limits.maxDiscount ?? 15)) {
      return NextResponse.json({
        error: `Votre plan limite les coupons à ${limits.maxDiscount ?? 15}% max.`
      }, { status: 403 });
    }

    const [coupon] = await db.insert(coupons).values({
      id:             createId(),
      vendorId:       vendor.id,
      code:           code.toUpperCase(),
      type:           type as any,
      value:          Number(value),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
      maxDiscount:    maxDiscount    ? Number(maxDiscount)    : null,
      usageLimit:     usageLimit     ? Number(usageLimit)     : null,
      expiresAt:      expiresAt      ? new Date(expiresAt)    : null,
      isActive:       true,
    }).returning();

    return NextResponse.json(coupon, { status: 201 });
  } catch (err: any) {
    if (err.code === "23505") return NextResponse.json({ error: "Ce code existe déjà." }, { status: 409 });
    console.error("[vendor/coupons POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
