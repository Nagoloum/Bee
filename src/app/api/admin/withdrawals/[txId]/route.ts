import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withdrawalRequests, wallets, walletTransactions } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { txId: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // ✅ FIX — renommé adminNote → processingNote (nom correct dans le schéma)
  const { action, processingNote } = await req.json();

  if (!["approve", "reject", "process"].includes(action)) {
    return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  }

  try {
    const wdRows = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, params.txId))
      .limit(1);

    if (!wdRows[0]) return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
    const wd = wdRows[0];

    if (action === "approve"  && wd.status !== "PENDING")  return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    if (action === "reject"   && wd.status !== "PENDING")  return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    if (action === "process"  && wd.status !== "APPROVED") return NextResponse.json({ error: "Statut invalide." }, { status: 400 });

    const statusMap: Record<string, string> = {
      approve: "APPROVED",
      reject:  "FAILED",      // schéma utilise FAILED pas REJECTED
      process: "COMPLETED",   // schéma utilise COMPLETED pas PROCESSED
    };

    await db.update(withdrawalRequests)
      .set({
        status:         statusMap[action] as any,
        // ✅ FIX — processingNote (nom dans le schéma wallet.ts)
        processingNote: processingNote || null,
        processedAt:    action === "process" ? new Date() : undefined,
        processedBy:    action !== "approve" ? (admin.user as any).id : undefined,
        updatedAt:      new Date(),
      })
      .where(eq(withdrawalRequests.id, params.txId));

    // Débit wallet uniquement quand traité (COMPLETED)
    if (action === "process") {
      const walletRows = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, wd.userId))
        .limit(1);

      if (walletRows[0]) {
        const w       = walletRows[0];
        const prevBal = w.balance ?? 0;
        const newBal  = Math.max(0, prevBal - wd.amount);

        await db.update(wallets)
          .set({ balance: newBal, updatedAt: new Date() })
          .where(eq(wallets.id, w.id));

        await db.insert(walletTransactions).values({
          id:            createId(),
          walletId:      w.id,
          type:          "DEBIT",
          amount:        wd.amount,
          reason:        "WITHDRAWAL",
          referenceId:   wd.id,
          balanceBefore: prevBal,
          balanceAfter:  newBal,
          description:   `Retrait ${wd.method === "mobile_money" ? "Mobile Money" : "Virement"} — ${wd.accountName}`,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/withdrawals PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
