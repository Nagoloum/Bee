import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { disputes, orders, wallets, walletTransactions } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { status, resolution, refundAmount, resolvedBy } = await req.json();

  const validStatuses = ["UNDER_REVIEW","RESOLVED_CLIENT","RESOLVED_VENDOR","RESOLVED_PARTIAL","CLOSED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  try {
    // Get dispute to find orderId
    const disputeRows = await db.select().from(disputes).where(eq(disputes.id, params.id)).limit(1);
    if (!disputeRows[0]) return NextResponse.json({ error: "Litige introuvable." }, { status: 404 });
    const dispute = disputeRows[0];

    await db.update(disputes)
      .set({
        status:       status as any,
        resolution:   resolution ?? null,
        refundAmount: refundAmount ?? null,
        resolvedBy:   resolvedBy  ?? null,
        resolvedAt:   new Date(),
        updatedAt:    new Date(),
      })
      .where(eq(disputes.id, params.id));

    // If resolved in client's favor with a refund amount → credit client wallet
    if (status === "RESOLVED_CLIENT" && refundAmount && refundAmount > 0) {
      const orderRows = await db.select().from(orders).where(eq(orders.id, dispute.orderId)).limit(1);
      if (orderRows[0]) {
        const clientId = orderRows[0].clientId;
        const clientWallet = await db.select().from(wallets).where(eq(wallets.userId, clientId)).limit(1);

        if (clientWallet[0]) {
          const w = clientWallet[0];
          const prev = w.balance ?? 0;
          const next = prev + refundAmount;
          await db.update(wallets).set({ balance: next, updatedAt: new Date() }).where(eq(wallets.id, w.id));
          await db.insert(walletTransactions).values({
            id:            createId(),
            walletId:      w.id,
            type:          "CREDIT",
            amount:        refundAmount,
            reason:        "REFUND",
            referenceId:   dispute.id,
            balanceBefore: prev,
            balanceAfter:  next,
            description:   `Remboursement litige ${orderRows[0].orderNumber}`,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/disputes PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
