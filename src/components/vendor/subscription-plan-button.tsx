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

  return (
    <Button
      fullWidth
      variant={popular ? "default" : "outline"}
      asChild
    >
      <Link href="/vendor/subscription/checkout">
        {planKey === "Start" ? "Rétrograder" : `Passer au ${planKey}`}
      </Link>
    </Button>
  );
}
