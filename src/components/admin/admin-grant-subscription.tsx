"use client";

import { useState } from "react";
import { Gift, Search, Loader2, CheckCircle2, X } from "lucide-react";

const PLANS = [
  { type:"VENDOR_PRO",   label:"Pro",   price:"5 000 FCFA/mois" },
  { type:"VENDOR_ELITE", label:"Elite", price:"15 000 FCFA/mois" },
];

interface Result {
  vendorName: string;
  planName:   string;
  expiresAt:  string;
}

export function AdminGrantSubscription() {
  const [vendorId,  setVendorId]  = useState("");
  const [planType,  setPlanType]  = useState("VENDOR_PRO");
  const [duration,  setDuration]  = useState(1);
  const [reason,    setReason]    = useState("");
  const [saving,    setSaving]    = useState(false);
  const [result,    setResult]    = useState<Result | null>(null);
  const [error,     setError]     = useState("");

  const grant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId.trim()) { setError("ID vendeur requis."); return; }
    setSaving(true);
    setError("");
    setResult(null);

    const res  = await fetch("/api/admin/subscriptions/grant", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ vendorId: vendorId.trim(), planType, durationMonths: duration, reason }),
    });
    const data = await res.json();

    if (!res.ok) { setError(data.error ?? "Erreur."); }
    else {
      setResult({
        vendorName: data.vendorName,
        planName:   data.planName,
        expiresAt:  data.expiresAt,
      });
      setVendorId(""); setReason("");
    }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl p-6 space-y-5"
      style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
      <div className="flex items-center gap-2">
        <Gift size={18} className="text-[#fbbf24]" />
        <h3 className="font-poppins font-bold text-base text-white">
          Offrir un abonnement gratuit
        </h3>
      </div>

      {result && (
        <div className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background:"rgba(34,211,165,0.08)", border:"1px solid rgba(34,211,165,0.2)" }}>
          <CheckCircle2 size={16} className="text-[#22d3a5] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-poppins font-bold text-[#22d3a5]">Abonnement accordé !</p>
            <p className="text-xs font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.6)" }}>
              <strong className="text-white">{result.vendorName}</strong> → Plan{" "}
              <strong className="text-white">{result.planName}</strong> jusqu'au{" "}
              {new Date(result.expiresAt).toLocaleDateString("fr-CM")}
            </p>
          </div>
          <button onClick={() => setResult(null)}>
            <X size={14} className="text-white/30" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-[#f87171] font-inter px-3 py-2 rounded-xl"
          style={{ background:"rgba(248,113,113,0.08)" }}>
          {error}
        </p>
      )}

      <form onSubmit={grant} className="space-y-4">
        <div>
          <label className="block text-xs font-bold font-poppins mb-1.5"
            style={{ color:"rgba(232,234,240,0.4)" }}>
            ID du vendeur
          </label>
          <div className="flex items-center gap-2">
            <Search size={14} className="shrink-0" style={{ color:"rgba(232,234,240,0.3)" }} />
            <input
              type="text"
              value={vendorId}
              onChange={e => setVendorId(e.target.value)}
              placeholder="Collez l'ID depuis la liste des vendeurs"
              className="flex-1 h-9 bg-transparent text-sm font-mono text-white focus:outline-none"
            />
          </div>
          <div className="mt-1 h-px" style={{ background:"rgba(255,255,255,0.08)" }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold font-poppins mb-1.5"
              style={{ color:"rgba(232,234,240,0.4)" }}>
              Plan
            </label>
            <select value={planType} onChange={e => setPlanType(e.target.value)}
              className="w-full h-9 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
              style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }}>
              {PLANS.map(p => (
                <option key={p.type} value={p.type}>{p.label} ({p.price})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold font-poppins mb-1.5"
              style={{ color:"rgba(232,234,240,0.4)" }}>
              Durée (mois)
            </label>
            <select value={duration} onChange={e => setDuration(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
              style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }}>
              {[1,2,3,6,12].map(d => (
                <option key={d} value={d}>{d} mois</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold font-poppins mb-1.5"
            style={{ color:"rgba(232,234,240,0.4)" }}>
            Raison (optionnel)
          </label>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Ex: partenariat, compensation, test…"
            className="w-full h-9 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
            style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }}
          />
        </div>

        <button type="submit" disabled={saving || !vendorId.trim()}
          className="w-full h-10 rounded-xl text-sm font-bold font-poppins text-white flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background:"linear-gradient(135deg,#fbbf24,#f59e0b)" }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Gift size={14} />}
          Accorder l'abonnement gratuit
        </button>
      </form>

      <p className="text-[10px] font-inter text-center" style={{ color:"rgba(232,234,240,0.25)" }}>
        L'abonnement expire automatiquement. Le vendeur peut ensuite souscrire normalement.
      </p>
    </div>
  );
}
