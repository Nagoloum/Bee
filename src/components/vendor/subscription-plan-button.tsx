"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  planKey:   string;
  isCurrent: boolean;
  popular?:  boolean;
}

export function SubscriptionPlanButton({ planKey, isCurrent, popular }: Props) {
  if (isCurrent) {
    return (
      <Button fullWidth variant="outline-ink" disabled>
        Plan actuel
      </Button>
    );
  }

  if (planKey === "Start") {
    // Downgrade: pas de paiement requis, contact support
    return (
      <Button fullWidth variant="outline" asChild>
        <Link href="mailto:contact@bee.cm?subject=Downgrade plan Start">
          Rétrograder
        </Link>
      </Button>
    );
  }

  return (
    // ✅ FIX: pass planKey as query param so checkout page knows which plan
    <Button fullWidth variant={popular ? "default" : "outline"} asChild>
      <Link href={`/vendor/subscription/checkout?plan=${planKey}`}>
        Passer au {planKey}
      </Link>
    </Button>
  );
}
