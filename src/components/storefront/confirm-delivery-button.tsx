"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function ConfirmDeliveryButton({ orderId }: { orderId: string }) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);

  const confirm = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm-delivery`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur."); return; }
      setDone(true);
      router.refresh();
    } catch { setError("Erreur réseau."); }
    finally { setLoading(false); }
  };

  if (done) return (
    <Alert variant="success">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={16} />
        <span className="font-semibold">Livraison confirmée !</span>
      </div>
      <p className="text-sm mt-1">Le paiement sera libéré au vendeur sous 48h.</p>
    </Alert>
  );

  return (
    <div className="bg-cream-100 rounded-2xl p-5 space-y-3">
      <p className="font-poppins font-bold text-sm text-foreground">
        📦 Votre commande est en route
      </p>
      <p className="text-sm text-muted-foreground font-inter leading-relaxed">
        Avez-vous bien reçu votre commande ? Confirmez la livraison pour libérer
        le paiement au vendeur.
      </p>
      {error && <Alert variant="error" onClose={() => setError("")}>{error}</Alert>}
      <Button
        fullWidth
        isLoading={loading}
        onClick={confirm}
        leftIcon={<CheckCircle2 size={16} />}
        loadingText="Confirmation en cours…"
      >
        Confirmer la réception
      </Button>
    </div>
  );
}
