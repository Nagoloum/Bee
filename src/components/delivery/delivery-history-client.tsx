"use client";

import { useState } from "react";
import {
  CheckCircle2, XCircle, Clock, Star,
  Filter, Package, TrendingUp, ChevronDown, ChevronUp,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils/cn";

interface HistoryItem {
  deliveryId:     string;
  status:         string;
  fee:            number;
  assignedAt:     string | null;
  deliveredAt:    string | null;
  failedAt:       string | null;
  failReason:     string | null;
  ratingByClient: number | null;
  reviewByClient: string | null;
  orderId:        string;
  orderNumber:    string;
  orderTotal:     number;
  deliveryAddress:any;
  vendorName:     string | null;
}

interface Props {
  history:          HistoryItem[];
  totalDeliveries:  number;
  successDeliveries:number;
  failedDeliveries: number;
}

type Filter = "all" | "delivered" | "failed";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={10}
          className={s <= rating ? "text-[#fbbf24]" : "text-white/15"}
          fill="currentColor" />
      ))}
    </div>
  );
}

function duration(from: string | null, to: string | null): string {
  if (!from || !to) return "—";
  const ms = new Date(to).getTime() - new Date(from).getTime();
  const m  = Math.floor(ms / 60000);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h${m % 60 > 0 ? String(m % 60).padStart(2, "0") : ""}`;
}

export function DeliveryHistoryClient({
  history, totalDeliveries, successDeliveries, failedDeliveries,
}: Props) {
  const [filter,   setFilter]   = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const successRate = totalDeliveries > 0
    ? Math.round((successDeliveries / totalDeliveries) * 100)
    : 0;

  const totalEarned = history
    .filter(h => h.status === "DELIVERED")
    .reduce((s, h) => s + (h.fee ?? 0), 0);

  const filtered = filter === "all"
    ? history
    : history.filter(h => h.status === filter.toUpperCase());

  return (
    <div className="space-y-5 pb-20 lg:pb-5">
      <h1 className="font-poppins font-black text-xl text-white">Historique</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",    value: String(totalDeliveries),   color: "#9b7fff", icon: Package },
          { label: "Succès",   value: String(successDeliveries), color: "#22d3a5", icon: CheckCircle2 },
          { label: "Échecs",   value: String(failedDeliveries),  color: "#f87171", icon: XCircle },
          { label: "Gains",    value: formatPrice(totalEarned),  color: "#fbbf24", icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
              style={{ background: `${color}15` }}>
              <Icon size={13} style={{ color }} />
            </div>
            <p className="font-poppins font-black text-lg text-white">{value}</p>
            <p className="text-[10px] font-poppins font-bold uppercase tracking-wider mt-0.5"
              style={{ color: "rgba(232,234,240,0.35)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Success rate bar */}
      <div className="rounded-2xl p-4"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold font-poppins text-white">Taux de succès</p>
          <p className="font-poppins font-black text-sm"
            style={{ color: successRate >= 90 ? "#22d3a5" : successRate >= 70 ? "#fbbf24" : "#f87171" }}>
            {successRate}%
          </p>
        </div>
        <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all"
            style={{
              width: `${successRate}%`,
              background: successRate >= 90
                ? "linear-gradient(90deg,#22d3a5,#0ea572)"
                : successRate >= 70
                ? "linear-gradient(90deg,#fbbf24,#d97706)"
                : "linear-gradient(90deg,#f87171,#dc2626)",
            }} />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {([
          { key: "all",       label: `Tout (${history.length})` },
          { key: "delivered", label: `✓ Livrées (${successDeliveries})` },
          { key: "failed",    label: `✗ Échecs (${failedDeliveries})` },
        ] as { key: Filter; label: string }[]).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={cn(
              "flex-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs font-bold font-poppins transition-all",
              filter === f.key ? "text-white" : "text-white/35"
            )}
            style={filter === f.key ? { background: "rgba(155,127,255,0.2)", color: "#9b7fff" } : {}}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        // ── Empty state ─────────────────────────────────────────────────
        <div className="rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.06)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: "rgba(155,127,255,0.08)" }}>
            {filter === "failed" ? "😓" : filter === "delivered" ? "🎉" : "📋"}
          </div>
          <div>
            <p className="font-poppins font-bold text-base text-white mb-1">
              {filter === "all"
                ? "Aucune livraison terminée"
                : filter === "delivered"
                ? "Aucune livraison réussie"
                : "Aucun échec enregistré"}
            </p>
            <p className="text-xs font-inter" style={{ color: "rgba(232,234,240,0.35)" }}>
              {filter === "all"
                ? "Vos livraisons terminées apparaîtront ici"
                : filter === "delivered"
                ? "Continuez à livrer pour voir votre historique ici"
                : "Bravo, pas d'échec à signaler !"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const isExpanded  = expanded === item.deliveryId;
            const isDelivered = item.status === "DELIVERED";
            const addr        = (item.deliveryAddress as any) ?? {};
            const date        = item.deliveredAt ?? item.failedAt ?? item.assignedAt;
            const dur         = duration(item.assignedAt, item.deliveredAt ?? item.failedAt);

            return (
              <div key={item.deliveryId} className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

                {/* Row header */}
                <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  onClick={() => setExpanded(isExpanded ? null : item.deliveryId)}>

                  {/* Status icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: isDelivered ? "rgba(34,211,165,0.12)" : "rgba(248,113,113,0.12)" }}>
                    {isDelivered
                      ? <CheckCircle2 size={16} className="text-[#22d3a5]" />
                      : <XCircle     size={16} className="text-[#f87171]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-poppins font-bold text-sm text-white">{item.orderNumber}</p>
                      {item.ratingByClient && (
                        <StarRow rating={item.ratingByClient} />
                      )}
                    </div>
                    <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.4)" }}>
                      {addr.city ?? addr.fullName ?? "—"} ·{" "}
                      {date ? new Date(date).toLocaleDateString("fr-CM", {
                        day: "2-digit", month: "short", year: "numeric",
                      }) : "—"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`font-poppins font-bold text-sm ${isDelivered ? "text-[#22d3a5]" : "text-[#f87171]"}`}>
                      {isDelivered ? `+${formatPrice(item.fee ?? 500)}` : "—"}
                    </p>
                    <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.35)" }}>
                      {dur}
                    </p>
                  </div>

                  {isExpanded
                    ? <ChevronUp  size={13} style={{ color: "rgba(232,234,240,0.2)" }} className="shrink-0" />
                    : <ChevronDown size={13} style={{ color: "rgba(232,234,240,0.2)" }} className="shrink-0" />}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}>

                    <div className="pt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-xl p-3"
                        style={{ background: "rgba(255,255,255,0.03)" }}>
                        <p className="text-[10px] font-poppins font-bold uppercase tracking-wider mb-1"
                          style={{ color: "rgba(232,234,240,0.3)" }}>Boutique</p>
                        <p className="text-xs font-inter text-white">{item.vendorName ?? "—"}</p>
                      </div>
                      <div className="rounded-xl p-3"
                        style={{ background: "rgba(255,255,255,0.03)" }}>
                        <p className="text-[10px] font-poppins font-bold uppercase tracking-wider mb-1"
                          style={{ color: "rgba(232,234,240,0.3)" }}>Destination</p>
                        <p className="text-xs font-inter text-white">
                          {[addr.street, addr.city].filter(Boolean).join(", ") || "—"}
                        </p>
                      </div>
                      <div className="rounded-xl p-3"
                        style={{ background: "rgba(255,255,255,0.03)" }}>
                        <p className="text-[10px] font-poppins font-bold uppercase tracking-wider mb-1"
                          style={{ color: "rgba(232,234,240,0.3)" }}>Durée</p>
                        <p className="text-xs font-inter text-white flex items-center gap-1">
                          <Clock size={10} /> {dur}
                        </p>
                      </div>
                      <div className="rounded-xl p-3"
                        style={{ background: "rgba(255,255,255,0.03)" }}>
                        <p className="text-[10px] font-poppins font-bold uppercase tracking-wider mb-1"
                          style={{ color: "rgba(232,234,240,0.3)" }}>Gain</p>
                        <p className={`text-xs font-bold font-poppins ${isDelivered ? "text-[#22d3a5]" : "text-white/30"}`}>
                          {isDelivered ? formatPrice(item.fee ?? 500) : "Non perçu"}
                        </p>
                      </div>
                    </div>

                    {/* Client review */}
                    {item.ratingByClient && (
                      <div className="rounded-xl p-3"
                        style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
                        <div className="flex items-center gap-2 mb-1">
                          <StarRow rating={item.ratingByClient} />
                          <p className="text-[10px] font-poppins font-bold text-[#fbbf24]">
                            Avis client
                          </p>
                        </div>
                        {item.reviewByClient && (
                          <p className="text-xs font-inter" style={{ color: "rgba(232,234,240,0.6)" }}>
                            "{item.reviewByClient}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Fail reason */}
                    {!isDelivered && item.failReason && (
                      <div className="rounded-xl p-3"
                        style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)" }}>
                        <p className="text-[10px] font-poppins font-bold text-[#f87171] mb-1">
                          Raison de l'échec
                        </p>
                        <p className="text-xs font-inter" style={{ color: "rgba(232,234,240,0.6)" }}>
                          {item.failReason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
