"use client";

import { useState } from "react";
import { User, Truck, CreditCard, BarChart2, Save, Loader2, Star, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils/cn";
import { BadgeChip } from "@/components/ui/badge-chip";

interface AgentStats {
  totalDeliveries:   number;
  successDeliveries: number;
  failedDeliveries:  number;
  rating:            number;
  balance:           number;
  hasBadge:          boolean;
  vehicleType:       string | null;
  vehiclePlate:      string | null;
  paymentMethod:     string | null;
  paymentDetails:    string | null;
  paymentName:       string | null;
  bio:               string | null;
}

interface Props {
  agentId:  string;
  userId:   string;
  userName: string;
  email:    string;
  stats:    AgentStats;
}

export function DeliverySettingsClient({ agentId, userId, userName, email, stats }: Props) {
  const [tab, setTab] = useState<"profile" | "vehicle" | "payment" | "stats">("profile");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    vehicleType:    stats.vehicleType  ?? "moto",
    vehiclePlate:   stats.vehiclePlate ?? "",
    paymentMethod:  stats.paymentMethod ?? "mobile_money",
    paymentDetails: stats.paymentDetails ?? "",
    paymentName:    stats.paymentName  ?? "",
    bio:            stats.bio          ?? "",
  });

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/delivery/settings`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ agentId, ...form }),
      });
      setSuccess("Paramètres enregistrés ✓");
      setTimeout(() => setSuccess(""), 3000);
    } finally { setSaving(false); }
  };

  const successRate = stats.totalDeliveries > 0
    ? Math.round((stats.successDeliveries / stats.totalDeliveries) * 100)
    : 0;

  const TABS = [
    { id:"profile",  icon:User,     label:"Profil"    },
    { id:"vehicle",  icon:Truck,    label:"Véhicule"  },
    { id:"payment",  icon:CreditCard,label:"Paiement" },
    { id:"stats",    icon:BarChart2, label:"Stats"    },
  ] as const;

  return (
    <div className="space-y-5 max-w-xl pb-20 lg:pb-5">
      <h1 className="font-poppins font-black text-xl text-white">Paramètres</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl"
        style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[10px] sm:text-xs font-bold font-poppins transition-all",
              tab === id ? "text-white" : "text-white/40"
            )}
            style={tab === id ? { background:"rgba(34,211,165,0.15)", color:"#22d3a5" } : {}}>
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === "profile" && (
        <div className="space-y-4 rounded-2xl p-5"
          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
              style={{ background:"linear-gradient(135deg,#22d3a5,#0ea572)" }}>
              {userName.slice(0,1).toUpperCase()}
            </div>
            <div>
              <p className="font-poppins font-bold text-base text-white">{userName}</p>
              <p className="text-xs font-inter" style={{ color:"rgba(232,234,240,0.4)" }}>{email}</p>
              <div className="flex gap-1 mt-1.5">
                {stats.hasBadge && <BadgeChip type="RELIABLE_DELIVERY" size="xs" />}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold font-poppins mb-1.5"
              style={{ color:"rgba(232,234,240,0.4)" }}>Bio / Description</label>
            <textarea value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Ex: Livreur rapide sur Douala, disponible 7j/7…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm font-inter text-white resize-none focus:outline-none"
              style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }} />
          </div>
          <SaveBtn saving={saving} success={success} onSave={save} />
        </div>
      )}

      {/* Vehicle */}
      {tab === "vehicle" && (
        <div className="space-y-4 rounded-2xl p-5"
          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <label className="block text-xs font-bold font-poppins mb-1.5"
              style={{ color:"rgba(232,234,240,0.4)" }}>Type de véhicule</label>
            <select value={form.vehicleType}
              onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
              style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}>
              <option value="moto">🛵 Moto</option>
              <option value="voiture">🚗 Voiture</option>
              <option value="velo">🚲 Vélo</option>
              <option value="pieton">🚶 À pied</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold font-poppins mb-1.5"
              style={{ color:"rgba(232,234,240,0.4)" }}>Plaque d'immatriculation</label>
            <input type="text" value={form.vehiclePlate}
              onChange={e => setForm(f => ({ ...f, vehiclePlate: e.target.value }))}
              placeholder="LT 1234 A"
              className="w-full h-10 px-3 rounded-xl text-sm font-inter text-white focus:outline-none font-mono"
              style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }} />
          </div>
          <SaveBtn saving={saving} success={success} onSave={save} />
        </div>
      )}

      {/* Payment */}
      {tab === "payment" && (
        <div className="space-y-4 rounded-2xl p-5"
          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-xs font-inter" style={{ color:"rgba(232,234,240,0.4)" }}>
            Compte utilisé pour recevoir vos gains de livraison.
          </p>
          <div>
            <label className="block text-xs font-bold font-poppins mb-1.5"
              style={{ color:"rgba(232,234,240,0.4)" }}>Méthode</label>
            <select value={form.paymentMethod}
              onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
              style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}>
              <option value="mobile_money">MTN MoMo / Orange Money</option>
              <option value="bank">Virement bancaire</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold font-poppins mb-1.5"
              style={{ color:"rgba(232,234,240,0.4)" }}>Numéro / IBAN</label>
            <input type="text" value={form.paymentDetails}
              onChange={e => setForm(f => ({ ...f, paymentDetails: e.target.value }))}
              placeholder="6XX XXX XXX"
              className="w-full h-10 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
              style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-xs font-bold font-poppins mb-1.5"
              style={{ color:"rgba(232,234,240,0.4)" }}>Nom du bénéficiaire</label>
            <input type="text" value={form.paymentName}
              onChange={e => setForm(f => ({ ...f, paymentName: e.target.value }))}
              placeholder="Jean Dupont"
              className="w-full h-10 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
              style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }} />
          </div>
          <SaveBtn saving={saving} success={success} onSave={save} />
        </div>
      )}

      {/* Stats */}
      {tab === "stats" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon:TrendingUp,  label:"Total livraisons",  value:String(stats.totalDeliveries)   },
              { icon:CheckCircle2,label:"Succès",            value:String(stats.successDeliveries)  },
              { icon:XCircle,     label:"Échecs",            value:String(stats.failedDeliveries)   },
              { icon:Star,        label:"Note moyenne",      value:`${stats.rating.toFixed(1)}/5`   },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl p-4"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <Icon size={16} className="text-[#22d3a5] mb-2" />
                <p className="font-poppins font-black text-xl text-white">{value}</p>
                <p className="text-xs font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Success rate bar */}
          <div className="rounded-2xl p-4"
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold font-poppins text-white">Taux de succès</p>
              <p className="text-sm font-black font-poppins text-[#22d3a5]">{successRate}%</p>
            </div>
            <div className="h-2 rounded-full" style={{ background:"rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full"
                style={{ width:`${successRate}%`, background:`linear-gradient(90deg,${successRate >= 90 ? "#22d3a5" : successRate >= 70 ? "#fbbf24" : "#f87171"},${successRate >= 90 ? "#0ea572" : successRate >= 70 ? "#d97706" : "#dc2626"})` }} />
            </div>
          </div>

          {/* Badge progress */}
          <div className="rounded-2xl p-4"
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-bold font-poppins text-white mb-3">Progression badges</p>
            <div className="space-y-3">
              <BadgeProgress label="Livreur Fiable" current={stats.totalDeliveries} target={50} earned={stats.hasBadge} />
              <BadgeProgress label="Top Livreur"    current={stats.successDeliveries} target={200} earned={false} />
            </div>
          </div>

          <div className="rounded-2xl p-4"
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-bold font-poppins text-white mb-1">Gains disponibles</p>
            <p className="font-poppins font-black text-2xl text-[#22d3a5]">{formatPrice(stats.balance ?? 0)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeProgress({ label, current, target, earned }: {
  label: string; current: number; target: number; earned: boolean;
}) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-inter" style={{ color:"rgba(232,234,240,0.6)" }}>{label}</p>
        <span className={`text-[10px] font-bold font-poppins px-1.5 py-0.5 rounded-md ${
          earned ? "bg-[#22d3a5]/12 text-[#22d3a5]" : "bg-white/5 text-white/25"
        }`}>{earned ? "✓ Obtenu" : `${current}/${target}`}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background:"rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full" style={{ width:`${pct}%`, background:"linear-gradient(90deg,#22d3a5,#0ea572)" }} />
      </div>
    </div>
  );
}

function SaveBtn({ saving, success, onSave }: { saving: boolean; success: string; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onSave} disabled={saving}
        className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold font-poppins text-white disabled:opacity-50"
        style={{ background:"linear-gradient(135deg,#22d3a5,#0ea572)" }}>
        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
        Enregistrer
      </button>
      {success && <p className="text-xs text-[#22d3a5] font-inter">{success}</p>}
    </div>
  );
}
