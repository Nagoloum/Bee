import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
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

  const { status } = await req.json();

  const validStatuses = [
    "PENDING", "CONFIRMED", "PREPARING", "READY",
    "IN_TRANSIT", "DELIVERED", "CANCELLED", "REFUNDED",
  ];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  await db.update(orders)
    .set({
      status:    status as any,
      updatedAt: new Date(),
      ...(status === "CONFIRMED"  && { confirmedAt:  new Date() }),
      ...(status === "READY"      && { readyAt:       new Date() }),
      ...(status === "DELIVERED"  && { deliveredAt:   new Date() }),
      ...(status === "CANCELLED"  && { cancelledAt:   new Date() }),
    })
    .where(eq(orders.id, params.id));

  return NextResponse.json({ success: true });
}
