"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, ArrowUpRight } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils/cn";

interface Withdrawal {
  id: string; status: string; amount: number; method: string | null;
  accountDetails: string | null; accountName: string | null;
  createdAt: string; processedAt: string | null;
  // ✅ FIX — processingNote (nom correct dans le schéma)
  processingNote: string | null;
  vendorName: string | null; vendorEmail: string | null;
}

const STATUS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "En attente",  color: "bg-[#fbbf24]/15 text-[#fbbf24]" },
  APPROVED:  { label: "Approuvé",    color: "bg-[#22d3a5]/15 text-[#22d3a5]" },
  FAILED:    { label: "Rejeté",      color: "bg-[#f87171]/15 text-[#f87171]" },
  COMPLETED: { label: "Traité",      color: "bg-[#9b7fff]/15 text-[#9b7fff]" },
  PROCESSING:{ label: "En cours",    color: "bg-[#f97316]/15 text-[#f97316]" },
};

interface Props { withdrawals: Withdrawal[]; }

export function AdminWithdrawalsClient({ withdrawals: initial }: Props) {
  const [list,    setList]    = useState(initial);
  // ✅ FIX — renommé note → processingNote pour cohérence
  const [processingNote, setProcessingNote] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const act = async (id: string, action: "approve" | "reject" | "process") => {
    setLoading(id + action);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        // ✅ FIX — envoie processingNote
        body: JSON.stringify({ action, processingNote: processingNote[id] ?? "" }),
      });
      if (res.ok) {
        const statusMap = { approve: "APPROVED", reject: "FAILED", process: "COMPLETED" };
        setList(prev => prev.map(w => w.id === id ? { ...w, status: statusMap[action] } : w));
      }
    } finally { setLoading(null); }
  };

  const pending   = list.filter(w => w.status === "PENDING");
  const approved  = list.filter(w => w.status === "APPROVED");
  const done      = list.filter(w => ["FAILED","COMPLETED","PROCESSING"].includes(w.status));

  const renderRow = (w: Withdrawal) => {
    const s = STATUS[w.status] ?? STATUS.PENDING;
    return (
      <div key={w.id} className="p-4 rounded-2xl space-y-3"
        style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-poppins ${s.color}`}>
                {s.label}
              </span>
              <span className="font-poppins font-bold text-sm text-white">
                {formatPrice(w.amount)}
              </span>
            </div>
            <p className="text-sm font-inter font-semibold text-white/80">{w.vendorName}</p>
            <p className="text-xs font-inter" style={{ color:"rgba(232,234,240,0.4)" }}>
              {w.vendorEmail} · {new Date(w.createdAt).toLocaleDateString("fr-CM")}
            </p>
            <div className="mt-2 p-2.5 rounded-xl text-xs font-inter space-y-0.5"
              style={{ background:"var(--adm-surface2)" }}>
              <p><span style={{ color:"rgba(232,234,240,0.4)" }}>Méthode :</span>{" "}
                <span className="text-white">{w.method === "mobile_money" ? "Mobile Money" : "Virement"}</span></p>
              <p><span style={{ color:"rgba(232,234,240,0.4)" }}>Compte :</span>{" "}
                <span className="text-white font-mono">{w.accountDetails}</span></p>
              <p><span style={{ color:"rgba(232,234,240,0.4)" }}>Bénéficiaire :</span>{" "}
                <span className="text-white">{w.accountName}</span></p>
            </div>
          </div>
        </div>

        {w.status === "PENDING" && (
          <div className="flex flex-col gap-2">
            <input
              // ✅ FIX — processingNote
              value={processingNote[w.id] ?? ""}
              onChange={e => setProcessingNote(n => ({ ...n, [w.id]: e.target.value }))}
              placeholder="Note optionnelle (ex: référence de transaction)"
              className="w-full h-8 px-3 rounded-lg text-xs font-inter text-white focus:outline-none"
              style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }} />
            <div className="flex gap-2">
              <button onClick={() => act(w.id, "approve")}
                disabled={loading === w.id + "approve"}
                className="flex-1 h-8 rounded-lg text-xs font-bold font-poppins flex items-center justify-center gap-1.5 disabled:opacity-50"
                style={{ background:"rgba(34,211,165,0.15)", color:"#22d3a5" }}>
                {loading === w.id + "approve" ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                Approuver
              </button>
              <button onClick={() => act(w.id, "reject")}
                disabled={loading === w.id + "reject"}
                className="flex-1 h-8 rounded-lg text-xs font-bold font-poppins flex items-center justify-center gap-1.5 disabled:opacity-50"
                style={{ background:"rgba(248,113,113,0.15)", color:"#f87171" }}>
                {loading === w.id + "reject" ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
                Rejeter
              </button>
            </div>
          </div>
        )}

        {w.status === "APPROVED" && (
          <button onClick={() => act(w.id, "process")}
            disabled={loading === w.id + "process"}
            className="w-full h-8 rounded-lg text-xs font-bold font-poppins flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ background:"rgba(155,127,255,0.15)", color:"#9b7fff" }}>
            {loading === w.id + "process" ? <Loader2 size={11} className="animate-spin" /> : <ArrowUpRight size={11} />}
            Marquer comme traité (paiement envoyé)
          </button>
        )}

        {/* ✅ FIX — processingNote */}
        {w.processingNote && (
          <p className="text-xs font-inter" style={{ color:"rgba(232,234,240,0.4)" }}>
            Note: {w.processingNote}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="font-poppins font-black text-2xl text-white flex items-center gap-2">
          <ArrowUpRight size={22} className="text-[#fbbf24]" /> Retraits vendeurs
        </h1>
        <p className="text-sm font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>
          {pending.length} en attente · {approved.length} approuvés · {done.length} traités
        </p>
      </div>

      {pending.length > 0 && (
        <section>
          <h2 className="font-poppins font-bold text-sm mb-3" style={{ color:"rgba(232,234,240,0.5)" }}>
            EN ATTENTE ({pending.length})
          </h2>
          <div className="space-y-3">{pending.map(renderRow)}</div>
        </section>
      )}

      {approved.length > 0 && (
        <section>
          <h2 className="font-poppins font-bold text-sm mb-3" style={{ color:"rgba(232,234,240,0.5)" }}>
            APPROUVÉS — À ENVOYER ({approved.length})
          </h2>
          <div className="space-y-3">{approved.map(renderRow)}</div>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h2 className="font-poppins font-bold text-sm mb-3" style={{ color:"rgba(232,234,240,0.5)" }}>
            HISTORIQUE ({done.length})
          </h2>
          <div className="space-y-3">{done.map(renderRow)}</div>
        </section>
      )}

      {list.length === 0 && (
        <div className="text-center py-16 rounded-2xl"
          style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
          <p className="text-4xl mb-3">💸</p>
          <p className="text-sm font-inter" style={{ color:"rgba(232,234,240,0.3)" }}>Aucune demande</p>
        </div>
      )}
    </div>
  );
}
