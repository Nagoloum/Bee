import { redirect } from "next/navigation";
import { Check, X } from "lucide-react";
import { getServerSession } from "@/lib/auth/helpers";
import { getVendorByUserId, getVendorSubscription } from "@/lib/actions/vendor";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils/cn";
import { SubscriptionPlanButton } from "@/components/vendor/subscription-plan-button";

const PLANS = [
  {
    key: "Start", price: 0, popular: false, emoji: "🐝",
    features: [
      { label: "10 produits max",         included: true  },
      { label: "2 photos / produit",       included: true  },
      { label: "Page boutique",            included: true  },
      { label: "Flash sales",              included: false },
      { label: "Coupons promotionnels",    included: false },
      { label: "Statistiques avancées",    included: false },
      { label: "Support prioritaire",      included: false },
    ],
  },
  {
    key: "Pro", price: 5000, popular: true, emoji: "⭐",
    features: [
      { label: "100 produits max",         included: true  },
      { label: "5 photos / produit",       included: true  },
      { label: "Page boutique",            included: true  },
      { label: "2 flash sales / jour",     included: true  },
      { label: "5 coupons (-15% max)",     included: true  },
      { label: "Statistiques avancées",    included: true  },
      { label: "Support prioritaire",      included: false },
    ],
  },
  {
    key: "Elite", price: 15000, popular: false, emoji: "👑",
    features: [
      { label: "Produits illimités",       included: true  },
      { label: "10 photos / produit",      included: true  },
      { label: "Page boutique",            included: true  },
      { label: "5 flash sales / jour",     included: true  },
      { label: "20 coupons (-20% max)",    included: true  },
      { label: "Statistiques avancées",    included: true  },
      { label: "Support prioritaire 24/7", included: true  },
    ],
  },
];

export default async function VendorSubscriptionPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");
  const vendor = await getVendorByUserId((session.user as any).id);
  if (!vendor)  redirect("/sign-up/vendor");

  const subscription = await getVendorSubscription(vendor.id);
  const currentPlan  = subscription?.planName ?? "Start";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-poppins font-black text-2xl text-foreground">Mon abonnement</h1>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">
          Plan actuel : <span className="font-semibold text-foreground">Plan {currentPlan}</span>
          {subscription?.periodEnd && (
            <span> · Renouvellement le {new Date(subscription.periodEnd).toLocaleDateString("fr-CM")}</span>
          )}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key;
          return (
            <div key={plan.key} className={cn(
              "relative rounded-3xl border-2 p-6 bg-white",
              plan.popular    ? "border-primary shadow-honey"
                : isCurrent  ? "border-success bg-success/5"
                : "border-border hover:border-honey-300 transition-colors"
            )}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="solid" size="sm">⭐ Le plus populaire</Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="success" size="sm">✓ Plan actuel</Badge>
                </div>
              )}

              <div className="text-3xl mb-3">{plan.emoji}</div>
              <h3 className="font-poppins font-black text-xl text-foreground mb-1">Plan {plan.key}</h3>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="font-poppins font-black text-3xl text-foreground">
                  {plan.price === 0 ? "Gratuit" : formatPrice(plan.price)}
                </span>
                {plan.price > 0 && <span className="text-muted-foreground font-inter text-sm">/mois</span>}
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map(({ label, included }) => (
                  <li key={label} className="flex items-center gap-2.5 text-sm font-inter">
                    {included
                      ? <Check size={15} className="text-success shrink-0" />
                      : <X     size={15} className="text-muted-foreground/40 shrink-0" />
                    }
                    <span className={included ? "text-foreground" : "text-muted-foreground/50 line-through"}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>

              <SubscriptionPlanButton planKey={plan.key} isCurrent={isCurrent} popular={plan.popular} />
            </div>
          );
        })}
      </div>

      <p className="text-xs text-center text-muted-foreground font-inter">
        Le paiement Stripe sera activé en Phase 5. Pour toute question : contact@bee.cm
      </p>
    </div>
  );
}
