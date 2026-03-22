import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in .env.local");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript:  true,
});

// ─── Create payment intent ─────────────────────────────────────────────────────

export async function createPaymentIntent({
  amount,        // in FCFA
  orderId,
  metadata = {},
}: {
  amount:   number;
  orderId:  string;
  metadata?: Record<string, string>;
}) {
  // Stripe amounts are in smallest currency unit
  // For XAF (FCFA) — zero decimal currency, amount is already in lowest unit
  const pi = await stripe.paymentIntents.create({
    amount:   Math.round(amount),
    currency: "xaf",          // West African CFA franc
    metadata: { orderId, ...metadata },
    automatic_payment_methods: { enabled: true },
  });
  return pi;
}

// ─── Retrieve payment intent ──────────────────────────────────────────────────

export async function getPaymentIntent(id: string) {
  return stripe.paymentIntents.retrieve(id);
}

// ─── Construct webhook event ──────────────────────────────────────────────────

export function constructWebhookEvent(payload: Buffer, sig: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return stripe.webhooks.constructEvent(payload, sig, secret);
}
