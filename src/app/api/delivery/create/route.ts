import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deliveryAgents } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId, region, vehicleType, vehiclePlate, phone } = await req.json();

    if (!userId || !region) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    await db.insert(deliveryAgents).values({
      id:           createId(),
      userId,
      region,
      vehicleType:  vehicleType  || null,
      vehiclePlate: vehiclePlate || null,
      status:       "OFFLINE",
      plan:         "FREELANCE",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delivery/create]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
