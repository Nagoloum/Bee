import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { flashSales, vendorSubscriptions, subscriptionPlans } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq, and, gte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getVendorByUserId } from "@/lib/actions/vendor";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const vendor = await getVendorByUserId(session.user.id);
    if (!vendor)  return NextResponse.json({ error: "Vendeur introuvable" }, { status: 403 });

    const body = await req.json();
    const { productId, discountPercent, originalPrice, flashPrice, stock, startAt, endAt } = body;

    if (!productId || !discountPercent || !originalPrice || !stock) {
      return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
    }

    // Check plan flash limit
    const sub = await db
      .select({ maxFlash: subscriptionPlans.maxFlashSalesPerDay })
      .from(vendorSubscriptions)
      .leftJoin(subscriptionPlans, eq(vendorSubscriptions.planId, subscriptionPlans.id))
      .where(eq(vendorSubscriptions.vendorId, vendor.id))
      .limit(1);

    const maxFlash = sub[0]?.maxFlash ?? 0;
    if (maxFlash === 0) {
      return NextResponse.json({ error: "Votre plan ne permet pas les flash sales." }, { status: 403 });
    }

    // Count today's flash sales
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todaySales = await db
      .select({ id: flashSales.id })
      .from(flashSales)
      .where(and(
        eq(flashSales.vendorId, vendor.id),
        gte(flashSales.createdAt, todayStart),
      ));

    if (todaySales.length >= maxFlash) {
      return NextResponse.json({
        error: `Limite de ${maxFlash} flash sale${maxFlash > 1 ? "s" : ""} par jour atteinte.`
      }, { status: 403 });
    }

    const [sale] = await db.insert(flashSales).values({
      id:              createId(),
      vendorId:        vendor.id,
      productId,
      discountPercent: Number(discountPercent),
      originalPrice:   Number(originalPrice),
      flashPrice:      Number(flashPrice),
      stock:           Number(stock),
      startAt:         new Date(startAt),
      endAt:           new Date(endAt),
      isActive:        true,
    }).returning();

    return NextResponse.json(sale, { status: 201 });
  } catch (err) {
    console.error("[flash-sales POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
