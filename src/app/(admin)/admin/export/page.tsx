"use client";

import { useState } from "react";
import { Download, FileText, Users, ArrowUpRight, RefreshCw, Loader2 } from "lucide-react";

const EXPORTS = [
  {
    type:        "orders",
    icon:        FileText,
    label:       "Commandes",
    description: "Toutes les commandes avec client, boutique, statuts et montants",
    color:       "#9b7fff",
    hasDates:    true,
  },
  {
    type:        "vendors",
    icon:        Users,
    label:       "Vendeurs",
    description: "Liste des boutiques avec soldes wallets, notes, nombre de ventes",
    color:       "#22d3a5",
    hasDates:    false,
  },
  {
    type:        "transactions",
    icon:        RefreshCw,
    label:       "Transactions wallet",
    description: "Toutes les transactions portefeuilles (crédit, débit, cashback, etc.)",
    color:       "#f97316",
    hasDates:    true,
  },
  {
    type:        "withdrawals",
    icon:        ArrowUpRight,
    label:       "Demandes de retrait",
    description: "Toutes les demandes de retrait vendeurs avec statuts",
    color:       "#fbbf24",
    hasDates:    true,
  },
];

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function AdminExportPage() {
  const today = new Date();
  const m30   = new Date(today.getTime() - 30 * 86400000);

  const [from,    setFrom]    = useState(fmt(m30));
  const [to,      setTo]      = useState(fmt(today));
  const [loading, setLoading] = useState<string | null>(null);

  const download = async (type: string) => {
    setLoading(type);
    try {
      const params = new URLSearchParams({ type, from, to });
      const res    = await fetch(`/api/admin/export?${params}`);
      if (!res.ok) { alert("Erreur lors de l'export."); return; }

      const blob     = await res.blob();
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement("a");
      const cd       = res.headers.get("Content-Disposition") ?? "";
      const match    = cd.match(/filename="([^"]+)"/);
      a.href         = url;
      a.download     = match?.[1] ?? `export-${type}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-poppins font-black text-2xl text-white flex items-center gap-2">
          <Download size={22} className="text-[#9b7fff]" /> Export CSV
        </h1>
        <p className="text-sm font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>
          Téléchargez vos données au format CSV pour analyse externe
        </p>
      </div>

      {/* Date range */}
      <div className="flex items-end gap-4 p-5 rounded-2xl"
        style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
        <div className="flex-1">
          <label className="block text-xs font-bold font-poppins mb-1.5"
            style={{ color:"rgba(232,234,240,0.4)" }}>DU</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="w-full h-9 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
            style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }} />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold font-poppins mb-1.5"
            style={{ color:"rgba(232,234,240,0.4)" }}>AU</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="w-full h-9 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
            style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }} />
        </div>
        <p className="text-xs font-inter pb-2.5" style={{ color:"rgba(232,234,240,0.3)" }}>
          (ignoré pour "Vendeurs")
        </p>
      </div>

      {/* Export cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {EXPORTS.map(({ type, icon: Icon, label, description, color }) => (
          <div key={type} className="rounded-2xl p-5"
            style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:`${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-poppins font-bold text-sm text-white">{label}</p>
                <p className="text-xs font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>
                  {description}
                </p>
              </div>
            </div>
            <button
              onClick={() => download(type)}
              disabled={!!loading}
              className="w-full h-9 rounded-xl text-xs font-bold font-poppins flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ background:`${color}18`, color }}>
              {loading === type
                ? <><Loader2 size={13} className="animate-spin" /> Export en cours…</>
                : <><Download size={13} /> Télécharger CSV</>
              }
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs font-inter text-center" style={{ color:"rgba(232,234,240,0.2)" }}>
        Les fichiers CSV sont encodés en UTF-8 (compatible Excel via import de données).
      </p>
    </div>
  );
}
