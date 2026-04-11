import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendOTP } from "@/lib/otp-service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { channel, target } = await req.json();

    if (!channel || !target) {
      return NextResponse.json({ error: "Canal et cible requis." }, { status: 400 });
    }
    if (!["EMAIL", "PHONE"].includes(channel)) {
      return NextResponse.json({ error: "Canal invalide." }, { status: 400 });
    }

    // Basic format validation
    if (channel === "EMAIL" && !target.includes("@")) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }
    if (channel === "PHONE" && !/^\+?[0-9]{8,15}$/.test(target.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Numéro de téléphone invalide." }, { status: 400 });
    }

    const purpose = channel === "EMAIL" ? "VERIFY_EMAIL" : "VERIFY_PHONE";
    const result  = await sendOTP({
      userId:  (session.user as any).id,
      target:  target.trim(),
      channel: channel as "EMAIL" | "PHONE",
      purpose: purpose as any,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 429 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify/send-otp]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
