import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, wallets, walletTransactions } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const order = await db.select().from(orders)
      .where(and(eq(orders.id, params.id), eq(orders.clientId, session.user.id)))
      .limit(1);

    if (!order[0]) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    if (order[0].status !== "IN_TRANSIT") {
      return NextResponse.json({ error: "Statut invalide pour cette action." }, { status: 400 });
    }
    if (order[0].escrowReleased) {
      return NextResponse.json({ error: "Escrow déjà libéré." }, { status: 400 });
    }

    const o = order[0];

    // Mark as delivered + release escrow
    await db.update(orders)
      .set({
        status:           "DELIVERED",
        deliveredAt:      new Date(),
        escrowReleased:   true,
        escrowReleasedAt: new Date(),
        updatedAt:        new Date(),
      })
      .where(eq(orders.id, o.id));

    // Move funds escrow → balance in vendor wallet
    const vendorWallet = await db.select().from(wallets)
      .where(eq(wallets.userId, o.vendorId))
      .limit(1);

    if (vendorWallet[0]) {
      const w = vendorWallet[0];
      const prevBalance = w.balance ?? 0;
      const prevEscrow  = w.escrow  ?? 0;
      const newBalance  = prevBalance + o.total;
      const newEscrow   = Math.max(0, prevEscrow - o.total);

      await db.update(wallets)
        .set({
          balance:   newBalance,
          escrow:    newEscrow,
          updatedAt: new Date(),
        })
        .where(eq(wallets.id, w.id));

      // ✅ FIX: referenceId (not orderId) + required balanceBefore/balanceAfter
      await db.insert(walletTransactions).values({
        id:            createId(),
        walletId:      w.id,
        type:          "CREDIT",
        amount:        o.total,
        reason:        "ESCROW_RELEASE",
        referenceId:   o.id,        // ← was incorrectly "orderId"
        balanceBefore: prevBalance,  // ← was missing (required field)
        balanceAfter:  newBalance,   // ← was missing (required field)
        description:   `Libération escrow commande ${o.orderNumber}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[confirm-delivery]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
