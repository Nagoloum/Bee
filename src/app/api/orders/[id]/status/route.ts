import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendOrderStatusUpdate } from "@/lib/email/order-emails";
import { pushToUser } from "@/lib/pusher";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING:    ["CONFIRMED", "CANCELLED"],
  CONFIRMED:  ["PREPARING", "CANCELLED"],
  PREPARING:  ["READY"],
  READY:      ["PICKED_UP"],
  PICKED_UP:  ["IN_TRANSIT"],
  IN_TRANSIT: ["DELIVERED", "FAILED"],
  DELIVERED:  ["DISPUTED"],
};

// Statuts que le livreur peut mettre à jour
const DELIVERY_ALLOWED = ["PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED"];
// Statuts qui déclenchent un email
const EMAIL_STATUSES   = ["CONFIRMED","PREPARING","READY","IN_TRANSIT","DELIVERED","CANCELLED"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { status, note } = await req.json();
    if (!status) return NextResponse.json({ error: "Statut requis." }, { status: 400 });

    // Récupérer commande + email client
    const orderRows = await db
      .select({
        id:          orders.id,
        orderNumber: orders.orderNumber,
        status:      orders.status,
        clientId:    orders.clientId,
        vendorId:    orders.vendorId,
        clientEmail: users.email,
        clientName:  users.name,
      })
      .from(orders)
      .leftJoin(users, eq(orders.clientId, users.id))
      .where(eq(orders.id, params.id))
      .limit(1);

    if (!orderRows[0]) {
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }
    const order  = orderRows[0];
    const role   = (session.user as any).role;
    const userId = (session.user as any).id;

    // Vérification permissions
    const canUpdate =
      role === "ADMIN" ||
      userId === order.vendorId ||
      (role === "DELIVERY" && DELIVERY_ALLOWED.includes(status));

    if (!canUpdate) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
    }

    // Valider la transition
    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json({
        error: `Transition invalide : ${order.status} → ${status}`,
      }, { status: 400 });
    }

    // Mettre à jour
    const updateData: any = { status, updatedAt: new Date() };
    if (status === "CONFIRMED")  updateData.confirmedAt  = new Date();
    if (status === "READY")      updateData.readyAt      = new Date();
    if (status === "DELIVERED")  updateData.deliveredAt  = new Date();
    if (status === "CANCELLED") { updateData.cancelledAt = new Date(); updateData.cancelReason = note ?? null; }
    if (note && status !== "CANCELLED") updateData.vendorNote = note;

    await db.update(orders).set(updateData).where(eq(orders.id, params.id));

    // ✅ Email statut (non-bloquant)
    if (EMAIL_STATUSES.includes(status) && order.clientEmail) {
      sendOrderStatusUpdate({
        clientName:  order.clientName  ?? "Client",
        clientEmail: order.clientEmail,
        orderNumber: order.orderNumber,
        status,
        orderId:     order.id,
      }).catch(console.error);
    }

    // ✅ Pusher → notification temps réel au client
    pushToUser(order.clientId, "order-status", {
      orderId:     order.id,
      orderNumber: order.orderNumber,
      status,
    }).catch(console.error);

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error("[orders/status PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
