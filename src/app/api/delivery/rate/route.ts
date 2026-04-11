import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderDeliveries, deliveryAgents, orders, reviews } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq, and, avg, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/delivery/rate
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { orderId, rating, comment } = await req.json();

    if (!orderId || !rating) {
      return NextResponse.json({ error: "orderId et rating requis." }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Note entre 1 et 5." }, { status: 400 });
    }

    // Vérifier que la commande appartient au client et est livrée
    const orderRows = await db.select()
      .from(orders)
      .where(and(
        eq(orders.id, orderId),
        eq(orders.clientId, session.user.id),
        eq(orders.status, "DELIVERED"),
      ))
      .limit(1);

    if (!orderRows[0]) {
      return NextResponse.json({ error: "Commande introuvable ou non livrée." }, { status: 404 });
    }

    // Récupérer la livraison
    const deliveryRows = await db.select()
      .from(orderDeliveries)
      .where(eq(orderDeliveries.orderId, orderId))
      .limit(1);

    if (!deliveryRows[0]) {
      return NextResponse.json({ error: "Livraison introuvable." }, { status: 404 });
    }
    const delivery = deliveryRows[0];

    // Vérifier qu'il n'y a pas déjà une note
    if (delivery.ratingByClient) {
      return NextResponse.json({ error: "Vous avez déjà noté ce livreur." }, { status: 409 });
    }

    // Sauvegarder la note sur la livraison
    await db.update(orderDeliveries).set({
      ratingByClient: rating,
      reviewByClient: comment?.trim() || null,
      ratedAt:        new Date(),
      updatedAt:      new Date(),
    }).where(eq(orderDeliveries.id, delivery.id));

    // Recalculer la note moyenne du livreur
    const allRatings = await db
      .select({
        avgRating: avg(orderDeliveries.ratingByClient),
        cnt:       count(),
      })
      .from(orderDeliveries)
      .where(and(
        eq(orderDeliveries.deliveryAgentId, delivery.deliveryAgentId),
        eq(orderDeliveries.status, "DELIVERED"),
      ));

    if (allRatings[0]?.avgRating) {
      await db.update(deliveryAgents).set({
        rating:       Number(Number(allRatings[0].avgRating).toFixed(1)),
        totalReviews: Number(allRatings[0].cnt),
        updatedAt:    new Date(),
      }).where(eq(deliveryAgents.id, delivery.deliveryAgentId));
    }

    // Créer aussi un avis dans la table reviews pour cohérence
    await db.insert(reviews).values({
      id:         createId(),
      clientId:   session.user.id,
      targetId:   delivery.deliveryAgentId,
      targetType: "DELIVERY",
      orderId,
      rating,
      comment:    comment?.trim() || null,
      isVerified: true,
    }).onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delivery/rate POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
