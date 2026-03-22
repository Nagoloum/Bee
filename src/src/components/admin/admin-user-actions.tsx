"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldOff } from "lucide-react";

interface Props {
  userId:        string;
  currentStatus: string;
}

export function AdminUserActions({ userId, currentStatus }: Props) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await fetch(`/api/admin/users/${userId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button onClick={toggle} disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-poppins transition-colors disabled:opacity-50 ${
        currentStatus === "ACTIVE"
          ? "bg-error/15 text-error hover:bg-error/25"
          : "bg-success/15 text-success-dark hover:bg-success/25"
      }`}>
      {loading ? "…" : currentStatus === "ACTIVE"
        ? <><ShieldOff size={12} /> Suspendre</>
        : <><Shield size={12} /> Réactiver</>
      }
    </button>
  );
}
