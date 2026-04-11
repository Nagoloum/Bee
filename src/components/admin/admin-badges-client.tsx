"use client";

import { useState } from "react";
import { Award, Search, Plus, Trash2, Loader2 } from "lucide-react";
import { BadgeChip, BADGE_META, BadgeType } from "@/components/ui/badge-chip";

const USER_BADGE_TYPES: BadgeType[] = [
  "CERTIFIED","TRUSTED_BUYER","VIP_BUYER","TOP_SELLER",
  "BEST_VENDOR_WEEK","VERIFIED_VENDOR","FAST_SHIPPER","PREMIUM_VENDOR",
  "RELIABLE_DELIVERY","TOP_DELIVERY",
];
const PRODUCT_BADGE_TYPES: BadgeType[] = [
  "BEST_PRODUCT_WEEK","TRENDING","EDITORS_CHOICE","TOP_RATED",
];

interface ExistingBadge {
  id: string; type: string; awardedAt: string; expiresAt: string | null;
  isActive: boolean; targetName?: string; targetId: string;
}

interface Props {
  userBadges:    ExistingBadge[];
  productBadges: ExistingBadge[];
}

export function AdminBadgesClient({ userBadges: initUB, productBadges: initPB }: Props) {
  const [userBadges,    setUserBadges]    = useState(initUB);
  const [productBadges, setProductBadges] = useState(initPB);
  const [tab, setTab]   = useState<"users" | "products">("users");
  const [form, setForm] = useState({
    targetId: "", type: USER_BADGE_TYPES[0] as string,
    note: "", expiresAt: "",
  });
  const [saving,  setSaving]  = useState(false);
  const [revoking,setRevoking]= useState<string | null>(null);
  const [error,   setError]   = useState("");

  const award = async () => {
    if (!form.targetId || !form.type) return;
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/badges", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          targetId:   form.targetId,
          targetType: tab === "users" ? "USER" : "PRODUCT",
          type:       form.type,
          note:       form.note || null,
          expiresAt:  form.expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur."); return; }
      if (tab === "users") {
        setUserBadges(p => [{ ...data, targetId: form.targetId }, ...p]);
      } else {
        setProductBadges(p => [{ ...data, targetId: form.targetId }, ...p]);
      }
      setForm(f => ({ ...f, targetId: "", note: "", expiresAt: "" }));
    } finally { setSaving(false); }
  };

  const revoke = async (badgeId: string, targetType: "USER" | "PRODUCT") => {
    setRevoking(badgeId);
    try {
      await fetch(`/api/admin/badges/${badgeId}`, {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ targetType }),
      });
      if (targetType === "USER") {
        setUserBadges(p => p.filter(b => b.id !== badgeId));
      } else {
        setProductBadges(p => p.filter(b => b.id !== badgeId));
      }
    } finally { setRevoking(null); }
  };

  const badgeTypes = tab === "users" ? USER_BADGE_TYPES : PRODUCT_BADGE_TYPES;
  const displayBadges = tab === "users" ? userBadges : productBadges;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Award size={22} className="text-[#fbbf24]" />
        <h1 className="font-poppins font-black text-2xl text-white">Gestion des badges</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
        {(["users","products"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold font-poppins transition-all",
              tab === t ? "text-white" : "text-white/40"
            )}
            style={tab === t ? { background:"linear-gradient(135deg,#7c5cfc,#9b7fff)" } : {}}>
            {t === "users" ? "Utilisateurs" : "Produits"}
          </button>
        ))}
      </div>

      {/* Award form */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
        <p className="font-poppins font-bold text-sm text-white">Attribuer un badge</p>
        {error && (
          <p className="text-xs text-[#f87171] font-inter bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold font-poppins mb-1.5"
              style={{ color:"rgba(232,234,240,0.4)" }}>
              {tab === "users" ? "ID Utilisateur" : "ID Produit"}
            </label>
            <input value={form.targetId} onChange={e => setForm(f => ({ ...f, targetId: e.target.value }))}
              placeholder={tab === "users" ? "user_xxxx" : "prod_xxxx"}
              className="w-full h-9 px-3 rounded-xl text-sm font-mono text-white focus:outline-none"
              style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }} />
          </div>
          <div>
            <label className="block text-xs font-bold font-poppins mb-1.5"
              style={{ color:"rgba(232,234,240,0.4)" }}>Type de badge</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
              style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }}>
              {badgeTypes.map(t => (
                <option key={t} value={t}>{BADGE_META[t]?.emoji} {BADGE_META[t]?.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold font-poppins mb-1.5"
              style={{ color:"rgba(232,234,240,0.4)" }}>Note (optionnel)</label>
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Ex: Meilleur vendeur Jan 2026"
              className="w-full h-9 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
              style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }} />
          </div>
          <div>
            <label className="block text-xs font-bold font-poppins mb-1.5"
              style={{ color:"rgba(232,234,240,0.4)" }}>Expire le (optionnel)</label>
            <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
              style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border)" }} />
          </div>
        </div>
        <button onClick={award} disabled={saving || !form.targetId}
          className="flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-bold font-poppins text-white disabled:opacity-50"
          style={{ background:"linear-gradient(135deg,#7c5cfc,#9b7fff)" }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          Attribuer le badge
        </button>
      </div>

      {/* Badge list */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom:"1px solid var(--adm-border)" }}>
              {["Badge","Cible","Attribué le","Expire","Actif","Action"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold font-poppins"
                  style={{ color:"rgba(232,234,240,0.3)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayBadges.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm font-inter"
                style={{ color:"rgba(232,234,240,0.3)" }}>Aucun badge attribué</td></tr>
            )}
            {displayBadges.map(b => (
              <tr key={b.id} style={{ borderBottom:"1px solid var(--adm-border)" }}
                className="hover:bg-white/3">
                <td className="px-4 py-3">
                  <BadgeChip type={b.type as BadgeType} size="sm" />
                </td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color:"rgba(232,234,240,0.5)" }}>
                  {b.targetId.slice(0, 16)}…
                </td>
                <td className="px-4 py-3 text-xs font-inter" style={{ color:"rgba(232,234,240,0.5)" }}>
                  {new Date(b.awardedAt).toLocaleDateString("fr-CM")}
                </td>
                <td className="px-4 py-3 text-xs font-inter" style={{ color:"rgba(232,234,240,0.5)" }}>
                  {b.expiresAt ? new Date(b.expiresAt).toLocaleDateString("fr-CM") : "Permanent"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-poppins ${
                    b.isActive ? "bg-[#22d3a5]/15 text-[#22d3a5]" : "bg-white/5 text-white/25"
                  }`}>{b.isActive ? "Actif" : "Inactif"}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => revoke(b.id, tab === "users" ? "USER" : "PRODUCT")}
                    disabled={revoking === b.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background:"rgba(248,113,113,0.12)", color:"#f87171" }}>
                    {revoking === b.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
