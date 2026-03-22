"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props { orderId: string; currentStatus: string }

const TRANSITIONS: Record<string, { label: string; next: string; color: string }> = {
  PENDING:    { label: "Confirmer",    next: "CONFIRMED",  color: "bg-success/15 text-success-dark hover:bg-success/25" },
  CONFIRMED:  { label: "En préparat.", next: "PREPARING",  color: "bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" },
  PREPARING:  { label: "Prête",        next: "READY",      color: "bg-primary/15 text-primary hover:bg-primary/25" },
  READY:      { label: "En transit",   next: "IN_TRANSIT", color: "bg-purple-500/15 text-purple-400 hover:bg-purple-500/25" },
  IN_TRANSIT: { label: "Livrée",       next: "DELIVERED",  color: "bg-success/15 text-success-dark hover:bg-success/25" },
};

export function AdminOrderActions({ orderId, currentStatus }: Props) {
  const router    = useRouter();
  const [loading, setLoading] = useState(false);

  const t = TRANSITIONS[currentStatus];
  if (!t) return <span className="text-xs text-white/20 font-inter">—</span>;

  const advance = async () => {
    setLoading(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: t.next }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button onClick={advance} disabled={loading}
      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold font-poppins transition-colors disabled:opacity-50 ${t.color}`}>
      {loading ? "…" : t.label}
    </button>
  );
}
