"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, ChefHat } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  status:  string;
}

export function VendorOrderActions({ orderId, status }: Props) {
  const router  = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const updateOrder = async (newStatus: string) => {
    setLoading(newStatus);
    try {
      await fetch(`/api/vendor/orders/${orderId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch {}
    finally { setLoading(null); }
  };

  if (status === "PENDING") return (
    <div className="flex gap-2 shrink-0">
      <Button
        size="xs"
        variant="success"
        isLoading={loading === "CONFIRMED"}
        onClick={() => updateOrder("CONFIRMED")}
        leftIcon={<Check size={12} />}
      >
        Accepter
      </Button>
      <Button
        size="xs"
        variant="destructive"
        isLoading={loading === "CANCELLED"}
        onClick={() => updateOrder("CANCELLED")}
        leftIcon={<X size={12} />}
      >
        Refuser
      </Button>
    </div>
  );

  if (status === "CONFIRMED") return (
    <Button
      size="xs"
      variant="outline"
      isLoading={loading === "PREPARING"}
      onClick={() => updateOrder("PREPARING")}
      leftIcon={<ChefHat size={12} />}
    >
      En préparation
    </Button>
  );

  if (status === "PREPARING") return (
    <Button
      size="xs"
      variant="outline"
      isLoading={loading === "READY"}
      onClick={() => updateOrder("READY")}
    >
      Prête ✓
    </Button>
  );

  return null;
}
