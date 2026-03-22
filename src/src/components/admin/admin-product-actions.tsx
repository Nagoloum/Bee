"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  productId:     string;
  currentStatus: string;
}

const ACTIONS: Record<string, { label: string; next: string; color: string }[]> = {
  PENDING_REVIEW: [
    { label: "✓ Approuver", next: "PUBLISHED", color: "bg-success/15 text-success-dark hover:bg-success/25" },
    { label: "✗ Rejeter",   next: "REJECTED",  color: "bg-error/15 text-error hover:bg-error/25" },
  ],
  PUBLISHED: [
    { label: "Archiver", next: "ARCHIVED", color: "bg-white/8 text-white/40 hover:bg-white/12" },
    { label: "Rejeter",  next: "REJECTED", color: "bg-error/15 text-error hover:bg-error/25" },
  ],
  DRAFT: [
    { label: "Publier", next: "PUBLISHED", color: "bg-success/15 text-success-dark hover:bg-success/25" },
  ],
  REJECTED: [
    { label: "Republier", next: "PUBLISHED", color: "bg-success/15 text-success-dark hover:bg-success/25" },
  ],
  ARCHIVED: [
    { label: "Republier", next: "PUBLISHED", color: "bg-success/15 text-success-dark hover:bg-success/25" },
  ],
};

export function AdminProductActions({ productId, currentStatus }: Props) {
  const router  = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const actions = ACTIONS[currentStatus] ?? [];

  const doAction = async (next: string) => {
    setLoading(next);
    await fetch(`/api/admin/products/${productId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: next }),
    });
    setLoading(null);
    router.refresh();
  };

  if (actions.length === 0) return <span className="text-xs text-white/20 font-inter">—</span>;

  return (
    <div className="flex items-center gap-1.5">
      {actions.map(a => (
        <button key={a.next} onClick={() => doAction(a.next)} disabled={!!loading}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold font-poppins transition-colors disabled:opacity-50 ${a.color}`}>
          {loading === a.next ? "…" : a.label}
        </button>
      ))}
    </div>
  );
}
