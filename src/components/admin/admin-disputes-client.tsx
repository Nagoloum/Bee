"use client";

import { useState } from "react";
import { Shield, MessageSquare, CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils/cn";

interface Dispute {
  id: string; status: string; reason: string; description: string | null;
  refundAmount: number | null; resolution: string | null;
  createdAt: string; orderId: string; orderNumber: string | null;
  orderTotal: number | null; clientName: string | null; clientEmail: string | null;
}

const STATUS: Record<string, { label: string; color: string }> = {
  OPEN:              { label: "Ouvert",         color: "bg-[#fbbf24]/15 text-[#fbbf24]" },
  UNDER_REVIEW:      { label: "En revue",       color: "bg-[#22d3ee]/15 text-[#22d3ee]" },
  RESOLVED_CLIENT:   { label: "→ Client",       color: "bg-[#22d3a5]/15 text-[#22d3a5]" },
  RESOLVED_VENDOR:   { label: "→ Vendeur",      color: "bg-[#9b7fff]/15 text-[#9b7fff]" },
  RESOLVED_PARTIAL:  { label: "Partiel",        color: "bg-[#f97316]/15 text-[#f97316]" },
  CLOSED:            { label: "Clôturé",        color: "bg-white/10 text-white/40" },
};

interface Props { disputes: Dispute[]; adminId: string; }

export function AdminDisputesClient({ disputes: initial, adminId }: Props) {
  const [disputes,  setDisputes]  = useState(initial);
  const [selected,  setSelected]  = useState<Dispute | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState("");
  const [refund,     setRefund]     = useState("");

  const resolve = async (outcome: string) => {
    if (!selected) return;
    setResolving(true);
    try {
      const res = await fetch(`/api/admin/disputes/${selected.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          status:       outcome,
          resolution,
          refundAmount: refund ? Number(refund) : null,
          resolvedBy:   adminId,
        }),
      });
      if (res.ok) {
        setDisputes(prev => prev.map(d =>
          d.id === selected.id
            ? { ...d, status: outcome, resolution, refundAmount: refund ? Number(refund) : null }
            : d
        ));
        setSelected(s => s ? { ...s, status: outcome } : null);
        setResolution(""); setRefund("");
      }
    } catch {}
    finally { setResolving(false); }
  };

  const openCount = disputes.filter(d => d.status === "OPEN" || d.status === "UNDER_REVIEW").length;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-poppins font-black text-2xl text-white flex items-center gap-2">
            <Shield size={22} className="text-[#9b7fff]" /> Litiges
          </h1>
          <p className="text-sm font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>
            {openCount} litige{openCount !== 1 ? "s" : ""} en attente · {disputes.length} au total
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-2">
          {disputes.length === 0 && (
            <div className="text-center py-12 rounded-2xl"
              style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
              <div className="text-4xl mb-3">⚖️</div>
              <p className="text-sm font-inter text-white/30">Aucun litige</p>
            </div>
          )}
          {disputes.map(d => {
            const s = STATUS[d.status] ?? STATUS.OPEN;
            const isOpen = d.status === "OPEN" || d.status === "UNDER_REVIEW";
            return (
              <button key={d.id} onClick={() => setSelected(d)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl transition-all",
                  selected?.id === d.id
                    ? "ring-1 ring-[#7c5cfc]"
                    : "hover:bg-white/3"
                )}
                style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-poppins ${s.color}`}>
                        {s.label}
                      </span>
                      {isOpen && (
                        <span className="w-2 h-2 rounded-full bg-[#fbbf24] shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-poppins font-semibold text-white truncate">
                      {d.orderNumber ?? d.orderId.slice(0, 14) + "…"}
                    </p>
                    <p className="text-xs font-inter truncate" style={{ color:"rgba(232,234,240,0.4)" }}>
                      {d.clientName} · {d.reason}
                    </p>
                  </div>
                  <ChevronRight size={14} style={{ color:"rgba(232,234,240,0.2)" }} className="shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl"
              style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
              <MessageSquare size={32} style={{ color:"rgba(232,234,240,0.2)" }} className="mb-3" />
              <p className="text-sm font-inter" style={{ color:"rgba(232,234,240,0.3)" }}>
                Sélectionnez un litige
              </p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden"
              style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
              {/* Header */}
              <div className="px-5 py-4" style={{ borderBottom:"1px solid var(--adm-border)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-poppins font-bold text-base text-white">{selected.orderNumber}</p>
                    <p className="text-xs font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>
                      {selected.clientName} — {new Date(selected.createdAt).toLocaleDateString("fr-CM")}
                    </p>
                  </div>
                  {selected.orderTotal && (
                    <p className="font-poppins font-bold text-sm text-white">
                      {formatPrice(selected.orderTotal)}
                    </p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-poppins font-bold mb-1" style={{ color:"rgba(232,234,240,0.4)" }}>MOTIF</p>
                  <p className="text-sm font-inter text-white">{selected.reason}</p>
                </div>
                {selected.description && (
                  <div>
                    <p className="text-xs font-poppins font-bold mb-1" style={{ color:"rgba(232,234,240,0.4)" }}>DESCRIPTION</p>
                    <p className="text-sm font-inter" style={{ color:"rgba(232,234,240,0.7)" }}>{selected.description}</p>
                  </div>
                )}
                {selected.resolution && (
                  <div className="rounded-xl p-3" style={{ background:"rgba(34,211,165,0.08)", border:"1px solid rgba(34,211,165,0.2)" }}>
                    <p className="text-xs font-poppins font-bold mb-1" style={{ color:"#22d3a5" }}>RÉSOLUTION</p>
                    <p className="text-sm font-inter text-white">{selected.resolution}</p>
                    {selected.refundAmount && (
                      <p className="text-xs font-inter mt-1" style={{ color:"rgba(232,234,240,0.5)" }}>
                        Remboursement : {formatPrice(selected.refundAmount)}
                      </p>
                    )}
                  </div>
                )}

                {/* Arbitration (only for open disputes) */}
                {(selected.status === "OPEN" || selected.status === "UNDER_REVIEW") && (
                  <div className="space-y-3 pt-2" style={{ borderTop:"1px solid var(--adm-border)" }}>
                    <p className="text-xs font-poppins font-bold text-white">ARBITRAGE ADMIN</p>
                    <textarea
                      value={resolution}
                      onChange={e => setResolution(e.target.value)}
                      placeholder="Décision et justification…"
                      rows={3}
                      className="w-full rounded-xl px-3 py-2 text-sm font-inter text-white resize-none focus:outline-none"
                      style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }}
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={refund}
                        onChange={e => setRefund(e.target.value)}
                        placeholder="Montant remboursé (FCFA)"
                        className="flex-1 h-9 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
                        style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => resolve("RESOLVED_CLIENT")} disabled={resolving || !resolution}
                        className="flex-1 h-9 rounded-xl text-xs font-bold font-poppins flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                        style={{ background:"rgba(34,211,165,0.15)", color:"#22d3a5" }}>
                        <CheckCircle2 size={13} /> En faveur du client
                      </button>
                      <button onClick={() => resolve("RESOLVED_VENDOR")} disabled={resolving || !resolution}
                        className="flex-1 h-9 rounded-xl text-xs font-bold font-poppins flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                        style={{ background:"rgba(155,127,255,0.15)", color:"#9b7fff" }}>
                        <CheckCircle2 size={13} /> En faveur du vendeur
                      </button>
                      <button onClick={() => resolve("CLOSED")} disabled={resolving}
                        className="h-9 px-4 rounded-xl text-xs font-bold font-poppins transition-colors disabled:opacity-40"
                        style={{ background:"rgba(255,255,255,0.06)", color:"rgba(232,234,240,0.4)" }}>
                        Clore
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
