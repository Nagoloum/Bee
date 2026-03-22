"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Ban, CheckCircle } from "lucide-react";

interface Props {
  vendorId:      string;
  isVerified:    boolean;
  currentStatus: string;
}

export function AdminVendorActions({ vendorId, isVerified, currentStatus }: Props) {
  const router  = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const action = async (type: "verify" | "status", value: any) => {
    setLoading(type);
    await fetch(`/api/admin/vendors/${vendorId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(type === "verify" ? { isVerified: value } : { status: value }),
    });
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1.5">
      {!isVerified ? (
        <button onClick={() => action("verify", true)} disabled={!!loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 text-xs font-semibold font-poppins transition-colors disabled:opacity-50">
          {loading === "verify" ? "…" : <><BadgeCheck size={11} /> Vérifier</>}
        </button>
      ) : (
        <button onClick={() => action("verify", false)} disabled={!!loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/8 text-white/40 hover:bg-white/12 text-xs font-semibold font-poppins transition-colors disabled:opacity-50">
          {loading === "verify" ? "…" : <><CheckCircle size={11} /> Vérifié</>}
        </button>
      )}
      {currentStatus === "ACTIVE" ? (
        <button onClick={() => action("status", "SUSPENDED")} disabled={!!loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-error/15 text-error hover:bg-error/25 text-xs font-semibold font-poppins transition-colors disabled:opacity-50">
          {loading === "status" ? "…" : <><Ban size={11} /> Suspendre</>}
        </button>
      ) : (
        <button onClick={() => action("status", "ACTIVE")} disabled={!!loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-success/15 text-success-dark hover:bg-success/25 text-xs font-semibold font-poppins transition-colors disabled:opacity-50">
          {loading === "status" ? "…" : "Activer"}
        </button>
      )}
    </div>
  );
}
