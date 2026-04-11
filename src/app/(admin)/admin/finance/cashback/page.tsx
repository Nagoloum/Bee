"use client";

import { useState, useEffect } from "react";
import { Gift, Loader2, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { formatPrice } from "@/lib/utils/cn";

export default function AdminCashbackPage() {
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    minOrderAmount:  50000,
    cashbackPercent: 5,
    maxCashback:     "" as string | number,
    isActive:        true,
  });

  useEffect(() => {
    fetch("/api/admin/cashback").then(r => r.json()).then(data => {
      if (data) setForm({
        minOrderAmount:  data.minOrderAmount,
        cashbackPercent: data.cashbackPercent,
        maxCashback:     data.maxCashback ?? "",
        isActive:        data.isActive,
      });
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cashback", {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...form, maxCashback: form.maxCashback === "" ? null : Number(form.maxCashback) }),
      });
      if (res.ok) { setSuccess("Enregistré !"); setTimeout(() => setSuccess(""), 3000); }
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-[#9b7fff]"/></div>;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Gift size={22} className="text-[#22d3a5]"/>
        <h1 className="font-poppins font-black text-2xl text-white">Règles Cashback</h1>
      </div>
      {success && <div className="px-4 py-3 rounded-xl text-sm text-[#22d3a5]" style={{background:"rgba(34,211,165,0.1)",border:"1px solid rgba(34,211,165,0.2)"}}>{success}</div>}
      <div className="rounded-2xl p-6 space-y-5" style={{background:"var(--adm-surface)",border:"1px solid var(--adm-border)"}}>
        <div className="flex items-center justify-between pb-4 border-b" style={{borderColor:"var(--adm-border)"}}>
          <div>
            <p className="font-poppins font-bold text-sm text-white">Cashback actif</p>
            <p className="text-xs font-inter mt-0.5" style={{color:"rgba(232,234,240,0.4)"}}>
              {form.isActive ? "Accordé automatiquement après livraison" : "Désactivé"}
            </p>
          </div>
          <button onClick={() => setForm(f => ({...f, isActive: !f.isActive}))}>
            {form.isActive ? <ToggleRight size={32} className="text-[#22d3a5]"/> : <ToggleLeft size={32} className="text-white/30"/>}
          </button>
        </div>
        {[
          { key:"minOrderAmount",  label:"Commande minimum (FCFA)", type:"number", hint:`Actuel : ${formatPrice(form.minOrderAmount)}` },
          { key:"cashbackPercent", label:"Pourcentage (%)",          type:"number" },
          { key:"maxCashback",     label:"Plafond max / commande (FCFA) — vide = illimité", type:"number", placeholder:"Ex: 5000" },
        ].map(({key, label, type, hint, placeholder}) => (
          <div key={key}>
            <label className="block text-xs font-bold font-poppins mb-1.5" style={{color:"rgba(232,234,240,0.4)"}}>{label}</label>
            <input type={type} value={(form as any)[key]} placeholder={placeholder}
              onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
              className="w-full h-10 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
              style={{background:"var(--adm-surface2)",border:"1px solid var(--adm-border)"}}/>
            {hint && <p className="text-[10px] font-inter mt-1" style={{color:"rgba(232,234,240,0.3)"}}>{hint}</p>}
          </div>
        ))}
        <div className="rounded-xl p-4" style={{background:"rgba(34,211,165,0.06)",border:"1px solid rgba(34,211,165,0.15)"}}>
          <p className="text-xs font-bold text-[#22d3a5] mb-1">Aperçu — commande 100 000 FCFA</p>
          <p className="text-xs font-inter" style={{color:"rgba(232,234,240,0.6)"}}>
            Cashback :{" "}
            <span className="font-bold text-[#22d3a5]">
              {formatPrice(Math.min(
                Math.floor(100000 * Number(form.cashbackPercent || 0) / 100),
                form.maxCashback !== "" ? Number(form.maxCashback) : Infinity
              ))}
            </span>
          </p>
        </div>
        <button onClick={save} disabled={saving}
          className="w-full h-11 rounded-xl text-sm font-bold font-poppins text-white flex items-center justify-center gap-2 disabled:opacity-50"
          style={{background:"linear-gradient(135deg,#7c5cfc,#9b7fff)"}}>
          {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
          Enregistrer
        </button>
      </div>
    </div>
  );
}
