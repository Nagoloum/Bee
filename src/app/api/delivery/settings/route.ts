import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deliveryAgents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "DELIVERY") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { agentId, vehicleType, vehiclePlate, paymentMethod, paymentDetails, paymentName, bio } = await req.json();

    await db.update(deliveryAgents).set({
      vehicleType:    vehicleType    ?? undefined,
      vehiclePlate:   vehiclePlate   ?? undefined,
      paymentMethod:  paymentMethod  ?? undefined,
      paymentDetails: paymentDetails ?? undefined,
      paymentName:    paymentName    ?? undefined,
      bio:            bio            ?? undefined,
      updatedAt:      new Date(),
    }).where(eq(deliveryAgents.id, agentId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delivery/settings PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
