"use client";

import { useState, useEffect } from "react";
import { Gift, Star, Save, Loader2, ToggleLeft, ToggleRight, Info } from "lucide-react";
import { formatPrice } from "@/lib/utils/cn";

interface CashbackRule {
  id:              string;
  minOrderAmount:  number;
  cashbackPercent: number;
  maxCashback:     number | null;
  isActive:        boolean;
}

const POINTS_CONFIG = [
  { key:"earn_order",    label:"Par commande validée",  pts:10, icon:"🛍️" },
  { key:"earn_review",   label:"Par avis laissé",       pts:5,  icon:"💬" },
  { key:"earn_referral", label:"Par parrainage réussi",  pts:50, icon:"🎁" },
  { key:"fcfa_per_point",label:"Valeur d'un point",     pts:10, icon:"💰", suffix:"FCFA" },
  { key:"min_redeem",    label:"Minimum pour échanger",  pts:100,icon:"⭐" },
];

export default function AdminCashbackPage() {
  const [rule,    setRule]    = useState<CashbackRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");
  const [form,    setForm]    = useState({
    minOrderAmount:  50000,
    cashbackPercent: 5,
    maxCashback:     "",
    isActive:        true,
  });

  useEffect(() => {
    fetch("/api/admin/cashback-rules")
      .then(r => r.json())
      .then(d => {
        setRule(d);
        setForm({
          minOrderAmount:  d.minOrderAmount,
          cashbackPercent: d.cashbackPercent,
          maxCashback:     d.maxCashback ? String(d.maxCashback) : "",
          isActive:        d.isActive,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setSuccess("");
    try {
      const res = await fetch("/api/admin/cashback-rules", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          minOrderAmount:  Number(form.minOrderAmount),
          cashbackPercent: Number(form.cashbackPercent),
          maxCashback:     form.maxCashback ? Number(form.maxCashback) : null,
          isActive:        form.isActive,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setRule(d);
        setSuccess("Règles enregistrées ✓");
        setTimeout(() => setSuccess(""), 3000);
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-poppins font-black text-2xl text-white flex items-center gap-2">
          <Gift size={22} className="text-[#fbbf24]" /> Cashback & Points
        </h1>
        <p className="text-sm font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>
          Configurez les règles du programme de fidélité
        </p>
      </div>

      {/* ── Cashback ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor:"var(--adm-border)" }}>
          <div>
            <p className="font-poppins font-bold text-base text-white">Règles Cashback</p>
            <p className="text-xs font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>
              Remboursement automatique après chaque commande éligible
            </p>
          </div>
          <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
            className="flex items-center gap-2">
            {form.isActive
              ? <ToggleRight size={32} className="text-[#22d3a5]" />
              : <ToggleLeft  size={32} style={{ color:"rgba(232,234,240,0.3)" }} />}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-[#9b7fff]" />
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold font-poppins mb-1.5"
                  style={{ color:"rgba(232,234,240,0.4)" }}>
                  Montant minimum de commande (FCFA)
                </label>
                <input
                  type="number"
                  value={form.minOrderAmount}
                  onChange={e => setForm(f => ({ ...f, minOrderAmount: Number(e.target.value) }))}
                  className="w-full h-10 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
                  style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }}
                />
                <p className="text-[10px] font-inter mt-1" style={{ color:"rgba(232,234,240,0.3)" }}>
                  Actuellement : {formatPrice(form.minOrderAmount)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold font-poppins mb-1.5"
                  style={{ color:"rgba(232,234,240,0.4)" }}>
                  Pourcentage cashback (%)
                </label>
                <input
                  type="number"
                  min="0" max="50"
                  value={form.cashbackPercent}
                  onChange={e => setForm(f => ({ ...f, cashbackPercent: Number(e.target.value) }))}
                  className="w-full h-10 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
                  style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-poppins mb-1.5"
                  style={{ color:"rgba(232,234,240,0.4)" }}>
                  Cashback maximum (FCFA) — optionnel
                </label>
                <input
                  type="number"
                  value={form.maxCashback}
                  onChange={e => setForm(f => ({ ...f, maxCashback: e.target.value }))}
                  placeholder="Illimité"
                  className="w-full h-10 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
                  style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }}
                />
              </div>

              <div className="flex flex-col justify-end pb-1">
                <div className="rounded-xl p-3 text-xs font-inter"
                  style={{ background:"rgba(34,211,165,0.08)", border:"1px solid rgba(34,211,165,0.15)" }}>
                  <p className="text-[#22d3a5] font-bold mb-1">Exemple avec ces règles :</p>
                  <p style={{ color:"rgba(232,234,240,0.6)" }}>
                    Commande de {formatPrice(100000)} →{" "}
                    <span className="text-[#22d3a5] font-bold">
                      {formatPrice(Math.min(
                        Math.floor(100000 * (form.cashbackPercent / 100)),
                        form.maxCashback ? Number(form.maxCashback) : Infinity
                      ))} cashback
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {success && (
              <p className="text-sm font-inter text-[#22d3a5]">{success}</p>
            )}

            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold font-poppins text-white disabled:opacity-50"
              style={{ background:"linear-gradient(135deg,#7c5cfc,#9b7fff)" }}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Enregistrer
            </button>
          </div>
        )}
      </div>

      {/* ── Points (affichage seul, configurables dans le code) ─────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor:"var(--adm-border)" }}>
          <p className="font-poppins font-bold text-base text-white flex items-center gap-2">
            <Star size={16} className="text-[#fbbf24]" fill="currentColor" />
            Programme de points
          </p>
          <p className="text-xs font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>
            Règles actuelles (modifiables dans <code className="text-[#9b7fff]">/api/points/route.ts</code>)
          </p>
        </div>
        <div className="p-5">
          <div className="space-y-2">
            {POINTS_CONFIG.map(cfg => (
              <div key={cfg.key} className="flex items-center justify-between py-2.5 border-b"
                style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{cfg.icon}</span>
                  <span className="text-sm font-inter" style={{ color:"rgba(232,234,240,0.7)" }}>
                    {cfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={11} className="text-[#fbbf24]" fill="currentColor" />
                  <span className="font-poppins font-bold text-sm text-white">
                    {cfg.pts} {cfg.suffix ?? "pts"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 mt-4 p-3 rounded-xl"
            style={{ background:"rgba(155,127,255,0.08)", border:"1px solid rgba(155,127,255,0.15)" }}>
            <Info size={13} className="text-[#9b7fff] mt-0.5 shrink-0" />
            <p className="text-xs font-inter" style={{ color:"rgba(232,234,240,0.5)" }}>
              Les règles de points seront configurables depuis cette interface dans une prochaine version.
              Pour l'instant, modifiez les constantes dans <code className="text-[#9b7fff]">src/app/api/points/route.ts</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
