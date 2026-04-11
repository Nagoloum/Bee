import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderDeliveries, deliveryAgents } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "DELIVERY") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId requis." }, { status: 400 });
    }

    // Récupérer l'agent
    const agentRows = await db
      .select()
      .from(deliveryAgents)
      .where(eq(deliveryAgents.userId, (session.user as any).id))
      .limit(1);
    if (!agentRows[0]) {
      return NextResponse.json({ error: "Profil livreur introuvable." }, { status: 404 });
    }
    const agent = agentRows[0];

    // Vérifier que la commande est disponible
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order[0] || order[0].status !== "READY") {
      return NextResponse.json({ error: "Commande non disponible." }, { status: 409 });
    }

    // Créer l'assignation
    const deliveryId = createId();
    const [delivery] = await db.insert(orderDeliveries).values({
      id:              deliveryId,
      orderId,
      deliveryAgentId: agent.id,
      status:          "ASSIGNED",
      fee:             500,
      assignedAt:      new Date(),
    }).returning();

    // ✅ FIX — passer en PICKED_UP (pas IN_TRANSIT) à l'acceptation
    // Le livreur doit d'abord aller chercher le colis avant d'être "en transit"
    await db.update(orders)
      .set({ status: "PICKED_UP", updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    // ✅ FIX — générer le code de livraison à partir de l'ID (pas stocké en DB)
    const deliveryCode = deliveryId.slice(-6).toUpperCase();

    return NextResponse.json({
      ...delivery,
      deliveryCode,             // ✅ retourné pour affichage côté client
      orderNumber:      order[0].orderNumber,
      deliveryAddress:  order[0].deliveryAddress,
    }, { status: 201 });
  } catch (err) {
    console.error("[delivery/accept]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
