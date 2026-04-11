import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderDeliveries, wallets, walletTransactions, deliveryAgents } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { pushToUser } from "@/lib/pusher";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "DELIVERY") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { status, failReason, proofImage } = await req.json();

    if (!["PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    // Récupérer l'agent
    const agentRows = await db
      .select()
      .from(deliveryAgents)
      .where(eq(deliveryAgents.userId, (session.user as any).id))
      .limit(1);
    if (!agentRows[0]) return NextResponse.json({ error: "Profil livreur introuvable." }, { status: 404 });
    const agent = agentRows[0];

    // Récupérer la livraison
    const deliveryRows = await db
      .select()
      .from(orderDeliveries)
      .where(and(
        eq(orderDeliveries.orderId, params.id),
        eq(orderDeliveries.deliveryAgentId, agent.id),
      ))
      .limit(1);
    if (!deliveryRows[0]) return NextResponse.json({ error: "Livraison introuvable." }, { status: 404 });
    const delivery = deliveryRows[0];

    // Mettre à jour le statut de livraison
    const deliveryUpdate: any = {
      status: status as any,
      updatedAt: new Date(),
    };
    if (status === "PICKED_UP")  deliveryUpdate.pickedUpAt  = new Date();
    if (status === "DELIVERED") {
      deliveryUpdate.deliveredAt = new Date();
      if (proofImage) deliveryUpdate.proofImage = proofImage;
    }
    if (status === "FAILED") {
      deliveryUpdate.failedAt  = new Date();
      deliveryUpdate.failReason = failReason ?? "Échec de livraison";
    }

    await db.update(orderDeliveries)
      .set(deliveryUpdate)
      .where(eq(orderDeliveries.id, delivery.id));

    // Mettre à jour le statut commande
    const orderStatusMap: Record<string, string> = {
      PICKED_UP:  "PICKED_UP",
      IN_TRANSIT: "IN_TRANSIT",
      DELIVERED:  "DELIVERED",
      FAILED:     "READY", // remet disponible pour un autre livreur
    };
    const orderUpdate: any = {
      status:    orderStatusMap[status],
      updatedAt: new Date(),
    };
    if (status === "DELIVERED") orderUpdate.deliveredAt = new Date();

    await db.update(orders)
      .set(orderUpdate)
      .where(eq(orders.id, params.id));

    // ── DELIVERED : créditer wallet livreur + incrémenter compteurs ──────────
    if (status === "DELIVERED") {
      const fee = delivery.fee ?? 500;

      // Wallet livreur
      const walletRows = await db.select().from(wallets)
        .where(eq(wallets.userId, (session.user as any).id)).limit(1);

      if (walletRows[0]) {
        const w    = walletRows[0];
        const prev = w.balance ?? 0;
        const next = prev + fee;
        await db.update(wallets)
          .set({ balance: next, updatedAt: new Date() })
          .where(eq(wallets.id, w.id));
        await db.insert(walletTransactions).values({
          id:            createId(),
          walletId:      w.id,
          type:          "CREDIT",
          amount:        fee,
          reason:        "DELIVERY_FEE",
          referenceId:   params.id,
          balanceBefore: prev,
          balanceAfter:  next,
          description:   `Livraison commande`,
        });
      }

      // Compteurs agent
      const newTotal   = (agent.totalDeliveries   ?? 0) + 1;
      const newSuccess = (agent.successDeliveries ?? 0) + 1;
      const hasBadge   = newTotal >= 50 || agent.hasBadge;
      await db.update(deliveryAgents).set({
        totalDeliveries:   newTotal,
        successDeliveries: newSuccess,
        hasBadge,
        updatedAt:         new Date(),
      }).where(eq(deliveryAgents.id, agent.id));

      // Notifier client
      const orderRow = await db.select({ clientId: orders.clientId, orderNumber: orders.orderNumber })
        .from(orders).where(eq(orders.id, params.id)).limit(1);
      if (orderRow[0]) {
        pushToUser(orderRow[0].clientId, "order-status", {
          orderId:     params.id,
          orderNumber: orderRow[0].orderNumber,
          status:      "DELIVERED",
        }).catch(console.error);
      }
    }

    // ── FAILED : incrémenter échecs ───────────────────────────────────────────
    if (status === "FAILED") {
      await db.update(deliveryAgents).set({
        totalDeliveries:  (agent.totalDeliveries  ?? 0) + 1,
        failedDeliveries: (agent.failedDeliveries ?? 0) + 1,
        updatedAt:        new Date(),
      }).where(eq(deliveryAgents.id, agent.id));
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error("[delivery/status PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
