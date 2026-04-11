import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Pusher from "pusher";

// Init Pusher server SDK
const pusher = new Pusher({
  appId:   process.env.PUSHER_APP_ID!,
  key:     process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret:  process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS:  true,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { lat, lng, agentId } = await req.json();

    if (!lat || !lng || !agentId) {
      return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
    }

    // Broadcast to channel: orders watching this delivery agent
    // Channel: delivery-agent-{agentId}
    // Clients (order detail pages) subscribe to this channel to get live position
    await pusher.trigger(`delivery-agent-${agentId}`, "location-update", {
      lat,
      lng,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delivery/location]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
