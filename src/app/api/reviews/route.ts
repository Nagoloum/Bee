import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, orders, orderItems, products, vendors } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq, and, avg, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST — create a review
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { targetId, targetType, orderId, rating, comment, images } = await req.json();

    if (!targetId || !targetType || !rating) {
      return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Note entre 1 et 5." }, { status: 400 });
    }
    if (rating < 3 && !comment?.trim()) {
      return NextResponse.json({ error: "Un commentaire est obligatoire pour une note inférieure à 3." }, { status: 400 });
    }

    // Verify orderId belongs to this client and is delivered
    if (orderId) {
      const order = await db.select().from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.clientId, session.user.id)))
        .limit(1);
      if (!order[0] || order[0].status !== "DELIVERED") {
        return NextResponse.json({ error: "Commande non livrée ou introuvable." }, { status: 403 });
      }
    }

    const [review] = await db.insert(reviews).values({
      id:         createId(),
      clientId:   session.user.id,
      targetId,
      targetType: targetType as any,
      orderId:    orderId ?? null,
      rating:     Number(rating),
      comment:    comment?.trim() || null,
      images:     images ?? [],
      isVerified: !!orderId,
    }).returning();

    // Update product/vendor rating aggregate
    if (targetType === "PRODUCT") {
      const agg = await db
        .select({ avg: avg(reviews.rating), cnt: count() })
        .from(reviews)
        .where(and(eq(reviews.targetId, targetId), eq(reviews.targetType, "PRODUCT")));
      if (agg[0]) {
        await db.update(products).set({
          rating:       Number(Number(agg[0].avg).toFixed(1)),
          totalReviews: Number(agg[0].cnt),
          updatedAt:    new Date(),
        }).where(eq(products.id, targetId));
      }
    }
    if (targetType === "VENDOR") {
      const agg = await db
        .select({ avg: avg(reviews.rating), cnt: count() })
        .from(reviews)
        .where(and(eq(reviews.targetId, targetId), eq(reviews.targetType, "VENDOR")));
      if (agg[0]) {
        await db.update(vendors).set({
          rating:       Number(Number(agg[0].avg).toFixed(1)),
          totalReviews: Number(agg[0].cnt),
          updatedAt:    new Date(),
        }).where(eq(vendors.id, targetId));
      }
    }

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error("[reviews POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// GET — list reviews for a target
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetId   = searchParams.get("targetId");
  const targetType = searchParams.get("targetType");

  if (!targetId || !targetType) {
    return NextResponse.json([], { status: 400 });
  }

  const rows = await db
    .select()
    .from(reviews)
    .where(and(
      eq(reviews.targetId,   targetId),
      eq(reviews.targetType, targetType as any),
      eq(reviews.isHidden,   false),
    ))
    .limit(20);

  return NextResponse.json(rows);
}
