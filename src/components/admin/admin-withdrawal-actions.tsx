"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

export function AdminWithdrawalActions({ txId, currentStatus }: { txId: string; currentStatus: string }) {
  const router  = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  if (currentStatus !== "PENDING") return <span className="text-xs font-inter" style={{ color: "rgba(232,234,240,0.2)" }}>—</span>;

  const act = async (status: string) => {
    setLoading(status);
    await fetch(`/api/admin/withdrawals/${txId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="flex gap-1.5">
      <button onClick={() => act("COMPLETED")} disabled={!!loading}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold font-poppins transition-colors disabled:opacity-50"
        style={{ background: "rgba(34,211,165,0.12)", color: "#22d3a5" }}>
        {loading === "COMPLETED" ? "…" : <><CheckCircle2 size={11} /> Approuver</>}
      </button>
      <button onClick={() => act("REJECTED")} disabled={!!loading}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold font-poppins transition-colors disabled:opacity-50"
        style={{ background: "rgba(248,113,113,0.12)", color: "#f87171" }}>
        {loading === "REJECTED" ? "…" : <><XCircle size={11} /> Rejeter</>}
      </button>
    </div>
  );
}
