import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { db } from "@/lib/db";
import { orders, wallets, walletTransactions } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const payload   = await req.arrayBuffer();
  const signature = req.headers.get("stripe-signature");

  if (!signature) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event;
  try {
    event = constructWebhookEvent(Buffer.from(payload), signature);
  } catch (err: any) {
    console.error("[webhook] Invalid signature:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {

      case "payment_intent.succeeded": {
        const pi      = event.data.object as any;
        const orderId = pi.metadata?.orderId;
        if (!orderId || orderId.startsWith("pending-")) break;

        await db.update(orders)
          .set({ paymentStatus: "PAID", stripeChargeId: pi.latest_charge })
          .where(eq(orders.id, orderId));
        break;
      }

      case "payment_intent.payment_failed": {
        const pi      = event.data.object as any;
        const orderId = pi.metadata?.orderId;
        if (orderId && !orderId.startsWith("pending-")) {
          await db.update(orders)
            .set({ paymentStatus: "FAILED", status: "CANCELLED" })
            .where(eq(orders.id, orderId));
        }
        break;
      }

      // Triggered after client confirms delivery → release escrow
      case "charge.refunded": {
        // Handled via manual admin action
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}

export const config = {
  api: { bodyParser: false },
};
