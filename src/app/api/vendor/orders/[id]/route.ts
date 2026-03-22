import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { status } = await req.json();
    const validStatuses = ["CONFIRMED", "PREPARING", "READY", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    await db.update(orders)
      .set({
        status: status as any,
        ...(status === "CONFIRMED" && { confirmedAt: new Date() }),
        ...(status === "READY"     && { readyAt:     new Date() }),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, params.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[vendor/orders PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
