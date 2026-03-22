import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { amount } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
    }

    const pi = await createPaymentIntent({
      amount,
      orderId: `pending-${session.user.id}-${Date.now()}`,
      metadata: { userId: session.user.id },
    });

    return NextResponse.json({ clientSecret: pi.client_secret });
  } catch (err: any) {
    console.error("[stripe/payment-intent]", err);
    return NextResponse.json({ error: err.message ?? "Erreur Stripe." }, { status: 500 });
  }
}
