import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { disputes, orders } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { orderId, reason, description } = await req.json();
    if (!orderId || !reason) {
      return NextResponse.json({ error: "Commande et motif requis." }, { status: 400 });
    }

    // Verify order belongs to client
    const order = await db.select().from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.clientId, session.user.id)))
      .limit(1);

    if (!order[0]) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

    const statuses = ["DELIVERED", "IN_TRANSIT", "CONFIRMED", "PREPARING"];
    if (!statuses.includes(order[0].status)) {
      return NextResponse.json({ error: "Impossible d'ouvrir un litige sur cette commande." }, { status: 400 });
    }

    const [dispute] = await db.insert(disputes).values({
      id:          createId(),
      orderId,
      clientId:    session.user.id,
      vendorId:    order[0].vendorId,
      status:      "OPEN",
      reason,
      description: description?.trim() || null,
    }).returning();

    return NextResponse.json(dispute, { status: 201 });
  } catch (err) {
    console.error("[disputes POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
