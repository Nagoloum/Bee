import { NextRequest, NextResponse } from "next/server";
import { processReferral } from "@/lib/actions/referral";

/**
 * POST /api/referral/process
 * Appelé côté client après signup réussi.
 * Lit le refCode de sessionStorage (transmis dans le body) et déclenche
 * processReferral() côté serveur.
 *
 * Destination : src/app/api/referral/process/route.ts
 */
export async function POST(req: NextRequest) {
  try {
    const { newUserId, refCode } = await req.json();

    if (!newUserId || !refCode) {
      return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
    }

    await processReferral(newUserId, refCode);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[referral/process]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
