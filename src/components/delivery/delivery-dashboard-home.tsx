"use client";

import { useState } from "react";
import {
  Package, CheckCircle2, TrendingUp, Wallet,
  MapPin, Phone, Copy, Check, ChevronRight,
  Loader2, Star,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils/cn";
import Link from "next/link";

interface Agent {
  id: string; rating: number; totalDeliveries: number;
  successDeliveries: number; hasBadge: boolean;
  balance?: number;
}

interface ActiveDelivery {
  deliveryId: string; status: string; fee: number;
  deliveryCode: string; assignedAt: string | null;
  orderId: string; orderNumber: string; orderTotal: number;
  deliveryAddress: any;
  vendorName: string | null; vendorAddress: string | null;
  clientName: string | null; clientPhone: string | null;
}

interface Props {
  agent:            Agent;
  activeDeliveries: ActiveDelivery[];
  weeklyDeliveries: number;
}

// ── Single CopyButton definition ──────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
      style={{ background: copied ? "rgba(34,211,165,0.15)" : "rgba(255,255,255,0.08)" }}
    >
      {copied
        ? <Check size={10} className="text-[#22d3a5]" />
        : <Copy  size={10} className="text-[#fbbf24]" />}
    </button>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="rounded-2xl p-4 space-y-3"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold font-poppins uppercase tracking-wider"
          style={{ color: "rgba(232,234,240,0.4)" }}>{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="font-poppins font-black text-2xl text-white">{value}</p>
        {sub && <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.4)" }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── DeliveryCard ──────────────────────────────────────────────────────────
function DeliveryCard({ delivery: d, isUpdating, onUpdateStatus }: {
  delivery: ActiveDelivery;
  isUpdating: boolean;
  onUpdateStatus: (s: string) => void;
}) {
  const addr = (d.deliveryAddress as any) ?? {};
  const phone = d.clientPhone ?? addr.phone ?? null;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div>
          <p className="font-poppins font-bold text-sm text-white">{d.orderNumber}</p>
          <p className="text-xs font-inter" style={{ color: "rgba(232,234,240,0.4)" }}>
            {d.clientName} · {formatPrice(d.fee ?? 500)} gain
          </p>
        </div>
        {/* Code livraison — généré depuis orderId, pas stocké en DB */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)" }}>
          <span className="font-mono text-xs font-black text-[#fbbf24] tracking-widest">
            {d.deliveryCode}
          </span>
          <CopyButton text={d.deliveryCode} />
        </div>
      </div>

      {/* Route */}
      <div className="px-4 py-3 space-y-2.5">
        {/* Pickup */}
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "rgba(34,211,165,0.15)" }}>
            <div className="w-2 h-2 rounded-full bg-[#22d3a5]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold font-poppins uppercase tracking-wider mb-0.5"
              style={{ color: "rgba(34,211,165,0.7)" }}>Récupération (Boutique)</p>
            <p className="text-sm font-semibold font-inter text-white">{d.vendorName ?? "Boutique"}</p>
            {d.vendorAddress && (
              <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.4)" }}>
                {d.vendorAddress}
              </p>
            )}
          </div>
        </div>

        <div className="ml-2.5 w-px h-4" style={{ background: "rgba(255,255,255,0.1)" }} />

        {/* Delivery */}
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "rgba(249,115,22,0.15)" }}>
            <MapPin size={10} className="text-[#f97316]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold font-poppins uppercase tracking-wider mb-0.5"
              style={{ color: "rgba(249,115,22,0.7)" }}>Livraison</p>
            <p className="text-sm font-semibold font-inter text-white">
              {addr.fullName ?? d.clientName}
            </p>
            <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.4)" }}>
              {[addr.street, addr.city, addr.region].filter(Boolean).join(", ")}
            </p>
            {phone && (
              <a href={`tel:${phone}`}
                className="flex items-center gap-1 mt-1 text-xs font-inter text-[#22d3a5]">
                <Phone size={10} /> {phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <Link href={`/delivery/map?orderId=${d.orderId}`}
          className="flex-1 h-9 rounded-xl text-xs font-bold font-poppins flex items-center justify-center gap-1.5"
          style={{ background: "rgba(34,211,165,0.12)", color: "#22d3a5", border: "1px solid rgba(34,211,165,0.2)" }}>
          <MapPin size={12} /> Voir sur la carte
        </Link>
        <button
          onClick={() => onUpdateStatus("PICKED_UP")}
          disabled={isUpdating}
          className="flex-1 h-9 rounded-xl text-xs font-bold font-poppins flex items-center justify-center gap-1.5 disabled:opacity-50 text-white"
          style={{ background: "linear-gradient(135deg,#22d3a5,#0ea572)" }}>
          {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
          Colis récupéré
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export function DeliveryDashboardHome({ agent, activeDeliveries, weeklyDeliveries }: Props) {
  const [updating,   setUpdating]   = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState(activeDeliveries);

  const successRate = agent.totalDeliveries > 0
    ? Math.round((agent.successDeliveries / agent.totalDeliveries) * 100)
    : 0;

  const updateStatus = async (deliveryId: string, orderId: string, status: string) => {
    setUpdating(deliveryId);
    try {
      await fetch(`/api/delivery/status/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (status === "DELIVERED" || status === "FAILED") {
        setDeliveries(p => p.filter(d => d.deliveryId !== deliveryId));
      }
    } finally { setUpdating(null); }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins font-black text-xl text-white">Bonjour 🛵</h1>
          <p className="text-sm font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.4)" }}>
            {deliveries.length > 0
              ? `${deliveries.length} livraison${deliveries.length > 1 ? "s" : ""} en cours`
              : "Aucune livraison assignée"}
          </p>
        </div>
        {agent.hasBadge && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(34,211,165,0.12)", border: "1px solid rgba(34,211,165,0.25)" }}>
            <Star size={12} className="text-[#22d3a5]" fill="currentColor" />
            <span className="text-xs font-bold font-poppins text-[#22d3a5]">Livreur Fiable</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Package}      label="Cette semaine" value={String(weeklyDeliveries)}        sub="livraisons"              color="#22d3a5" />
        <StatCard icon={CheckCircle2} label="Total"         value={String(agent.totalDeliveries)}   sub={`${successRate}% succès`} color="#9b7fff" />
        <StatCard icon={TrendingUp}   label="Note"          value={`${agent.rating.toFixed(1)}/5`}  sub="évaluation"              color="#fbbf24" />
        <StatCard icon={Wallet}       label="Gains"         value={formatPrice(agent.balance ?? 0)} sub="disponible"              color="#f97316" />
      </div>

      {/* Badge progress */}
      {!agent.hasBadge && (
        <div className="rounded-2xl p-4"
          style={{ background: "rgba(34,211,165,0.06)", border: "1px solid rgba(34,211,165,0.15)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold font-poppins text-[#22d3a5]">Badge Livreur Fiable</p>
            <p className="text-xs font-mono text-white/50">{agent.totalDeliveries}/50</p>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (agent.totalDeliveries / 50) * 100)}%`,
                background: "linear-gradient(90deg,#22d3a5,#0ea572)",
              }} />
          </div>
          <p className="text-xs font-inter mt-1.5" style={{ color: "rgba(232,234,240,0.35)" }}>
            Encore {Math.max(0, 50 - agent.totalDeliveries)} livraisons pour obtenir le badge
          </p>
        </div>
      )}

      {/* Active deliveries */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-poppins font-bold text-base text-white">Livraisons en cours</h2>
          <Link href="/delivery/orders"
            className="text-xs font-inter flex items-center gap-0.5 hover:text-white transition-colors"
            style={{ color: "rgba(232,234,240,0.4)" }}>
            Toutes les courses <ChevronRight size={12} />
          </Link>
        </div>

        {deliveries.length === 0 ? (
          <div className="rounded-2xl p-8 text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.08)" }}>
            <div className="text-3xl mb-3">🛵</div>
            <p className="text-sm font-inter" style={{ color: "rgba(232,234,240,0.3)" }}>
              Aucune livraison assignée pour le moment
            </p>
            <Link href="/delivery/orders"
              className="inline-block mt-3 text-xs font-bold font-poppins px-4 py-2 rounded-xl"
              style={{ background: "rgba(34,211,165,0.12)", color: "#22d3a5" }}>
              Voir les courses disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map(d => (
              <DeliveryCard
                key={d.deliveryId}
                delivery={d}
                isUpdating={updating === d.deliveryId}
                onUpdateStatus={(status) => updateStatus(d.deliveryId, d.orderId, status)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
