"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ArrowLeft, Lock, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { formatPrice } from "@/lib/utils/cn";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PLAN_DETAILS: Record<string, {
  name: string; emoji: string; price: number;
  features: string[];
}> = {
  Pro: {
    name: "Plan Pro",
    emoji: "⭐",
    price: 5000,
    features: [
      "100 produits maximum",
      "5 photos par produit",
      "2 flash sales / jour",
      "5 coupons (-15% max)",
      "Statistiques avancées",
    ],
  },
  Elite: {
    name: "Plan Elite",
    emoji: "👑",
    price: 15000,
    features: [
      "Produits illimités",
      "10 photos par produit",
      "5 flash sales / jour",
      "20 coupons (-20% max)",
      "Support prioritaire 24/7",
      "Boost de visibilité garanti",
    ],
  },
};

// ─── Payment form ─────────────────────────────────────────────────────────────

function CheckoutForm({ planKey, onSuccess }: { planKey: string; onSuccess: () => void }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error,  setError]  = useState("");

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true); setError("");

    const { error: submitErr } = await elements.submit();
    if (submitErr) { setError(submitErr.message ?? "Erreur."); setPaying(false); return; }

    // Confirm payment client-side only (return_url handles subscription creation)
    const { error: stripeErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/vendor/subscription?success=1&plan=${planKey}`,
      },
    });

    if (stripeErr) {
      setError(stripeErr.message ?? "Paiement échoué.");
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <div className="bg-white rounded-2xl border border-border p-5">
        <PaymentElement />
      </div>
      {error && <Alert variant="error" onClose={() => setError("")}>{error}</Alert>}
      <Button type="submit" fullWidth size="lg" isLoading={paying}
        leftIcon={<Lock size={16} />}
        loadingText="Traitement…">
        Payer et activer le plan
      </Button>
      <p className="text-xs text-center text-muted-foreground font-inter flex items-center justify-center gap-1">
        <Lock size={11} /> Paiement chiffré SSL — sécurisé par Stripe
      </p>
    </form>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function SubscriptionCheckoutPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const planKey      = searchParams.get("plan") ?? "Pro";

  const [clientSecret,  setClientSecret]  = useState("");
  const [loadingSecret, setLoadingSecret] = useState(true);
  const [error,         setError]         = useState("");

  const plan = PLAN_DETAILS[planKey];

  useEffect(() => {
    if (!plan) { router.replace("/vendor/subscription"); return; }

    fetch("/api/stripe/payment-intent", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ amount: plan.price }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setClientSecret(data.clientSecret);
      })
      .catch(() => setError("Erreur réseau."))
      .finally(() => setLoadingSecret(false));
  }, [plan, router]);

  if (!plan) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/vendor/subscription"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-inter mb-4">
          <ArrowLeft size={14} /> Retour aux abonnements
        </Link>
        <h1 className="font-poppins font-black text-2xl text-foreground">
          Passer au {plan.name}
        </h1>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">
          Facturation mensuelle · Sans engagement
        </p>
      </div>

      {/* Plan recap */}
      <div className="bg-white rounded-2xl border-2 border-primary p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{plan.emoji}</span>
          <div>
            <p className="font-poppins font-bold text-lg text-foreground">{plan.name}</p>
            <p className="font-poppins font-black text-2xl text-primary">
              {formatPrice(plan.price)}
              <span className="text-sm font-normal text-muted-foreground">/mois</span>
            </p>
          </div>
        </div>
        <ul className="space-y-2">
          {plan.features.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm font-inter text-foreground">
              <Check size={14} className="text-success shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Payment */}
      {error && <Alert variant="error">{error}</Alert>}

      {loadingSecret ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground font-inter mt-3">Initialisation du paiement…</p>
        </div>
      ) : clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret, locale: "fr" }}>
          <CheckoutForm planKey={planKey} onSuccess={() => router.push("/vendor/subscription?success=1")} />
        </Elements>
      ) : null}
    </div>
  );
}
