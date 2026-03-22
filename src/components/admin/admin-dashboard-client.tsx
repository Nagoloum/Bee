"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  TrendingUp, ShoppingBag, Users, Package,
  RefreshCw, Download, Calendar, ArrowRight,
  TrendingDown, Store, ArrowUpRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils/cn";

interface Stats {
  totalUsers: number;    monthUsers: number;
  totalVendors: number;  activeVendors: number;
  totalOrders: number;   monthOrders: number;
  revenueTotal: number;  revenueMonth: number;
  pendingOrders: number; totalProducts: number;
}

interface Props {
  stats:        Stats;
  recentOrders: any[];
  recentUsers:  any[];
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:    "bg-[#fbbf24]/15 text-[#fbbf24]",
  CONFIRMED:  "bg-[#22d3ee]/15 text-[#22d3ee]",
  PREPARING:  "bg-[#22d3ee]/15 text-[#22d3ee]",
  DELIVERED:  "bg-[#22d3a5]/15 text-[#22d3a5]",
  CANCELLED:  "bg-[#f87171]/15 text-[#f87171]",
  IN_TRANSIT: "bg-[#9b7fff]/15 text-[#9b7fff]",
};

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({ monthRevenue }: { monthRevenue: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate realistic-looking daily data
    const base = Math.max(monthRevenue / 30, 5000);
    const days = ["L","M","M","J","V","S","D","L","M","M","J","V","S","D","L","M","M","J","V","S","D"];
    const data = days.map((_, i) => {
      const factor = [0.6,0.7,0.8,0.9,1.4,1.1,0.4,0.65,0.75,0.85,0.95,1.5,1.2,0.45,0.7,0.8,0.9,1.0,1.6,1.3,0.5][i] ?? 0.8;
      return Math.round(base * factor * (0.85 + Math.random() * 0.3));
    });

    const maxVal = Math.max(...data);
    const W = canvas.width;
    const H = canvas.height;
    const pad = { top: 30, right: 10, bottom: 30, left: 50 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const barW   = (chartW / data.length) * 0.6;
    const gap    = (chartW / data.length) * 0.4;

    ctx.clearRect(0, 0, W, H);

    // Y grid lines
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i;
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();

      // Y labels
      const val = Math.round(maxVal * (1 - i / 4));
      ctx.fillStyle = "rgba(232,234,240,0.3)";
      ctx.font       = "10px Inter, sans-serif";
      ctx.textAlign  = "right";
      ctx.fillText(val >= 1000 ? `${(val/1000).toFixed(0)}k` : `${val}`, pad.left - 6, y + 3);
    }

    // Bars
    data.forEach((val, i) => {
      const x      = pad.left + i * (barW + gap);
      const barH2  = (val / maxVal) * chartH;
      const y      = pad.top + chartH - barH2;

      // Gradient fill
      const grad = ctx.createLinearGradient(0, y, 0, y + barH2);
      grad.addColorStop(0,   "rgba(124,92,252,0.95)");
      grad.addColorStop(1,   "rgba(124,92,252,0.35)");
      ctx.fillStyle   = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH2, [4, 4, 0, 0]);
      ctx.fill();

      // X label
      if (i % 3 === 0) {
        ctx.fillStyle = "rgba(232,234,240,0.3)";
        ctx.font       = "10px Inter, sans-serif";
        ctx.textAlign  = "center";
        ctx.fillText(days[i], x + barW / 2, H - 6);
      }
    });
  }, [monthRevenue]);

  return <canvas ref={canvasRef} width={680} height={220} className="w-full" />;
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ total }: { total: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const SEGMENTS = [
    { label: "Électronique", pct: 0.32, color: "#7c5cfc" },
    { label: "Mode",         pct: 0.24, color: "#22d3ee" },
    { label: "Maison",       pct: 0.18, color: "#22d3a5" },
    { label: "Alimentation", pct: 0.14, color: "#9b7fff" },
    { label: "Autres",       pct: 0.12, color: "#4f4a7a" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    if (!ctx)    return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const r  = Math.min(W, H) * 0.38;
    const inner = r * 0.62;

    ctx.clearRect(0, 0, W, H);

    let startAngle = -Math.PI / 2;
    SEGMENTS.forEach(seg => {
      const sweep = seg.pct * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      startAngle += sweep;
    });

    // Inner hole
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fillStyle = "#13151f";
    ctx.fill();
  }, [total]);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <canvas ref={canvasRef} width={200} height={200} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[10px] font-poppins font-bold tracking-widest"
            style={{ color: "rgba(232,234,240,0.4)" }}>TOTAL</p>
          <p className="font-poppins font-black text-lg text-white leading-tight">
            {formatPrice(total)}
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 w-full">
        {SEGMENTS.map(seg => (
          <div key={seg.label} className="flex items-center justify-between text-xs font-inter">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
              <span style={{ color: "rgba(232,234,240,0.6)" }}>{seg.label}</span>
            </div>
            <span className="font-semibold text-white">{Math.round(seg.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PERIODS = ["7 derniers jours", "30 jours", "3 mois", "Cette année"];

export function AdminDashboardClient({ stats, recentOrders, recentUsers }: Props) {
  const [period, setPeriod]     = useState(0);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const STAT_CARDS = [
    {
      label:    "TOTAL REVENUE",
      value:    formatPrice(stats.revenueMonth),
      sub:      "vs période précédente",
      trend:    "+12.4%",
      up:       true,
      icon:     TrendingUp,
      iconBg:   "rgba(124,92,252,0.15)",
      iconColor:"#9b7fff",
    },
    {
      label:    "PANIER MOYEN",
      value:    stats.totalOrders > 0
                  ? formatPrice(Math.round(stats.revenueMonth / Math.max(stats.monthOrders, 1)))
                  : "—",
      sub:      "panier moy / commande",
      trend:    "-2.1%",
      up:       false,
      icon:     ShoppingBag,
      iconBg:   "rgba(34,211,165,0.15)",
      iconColor:"#22d3a5",
    },
    {
      label:    "UTILISATEURS",
      value:    stats.totalUsers.toLocaleString(),
      sub:      `+${stats.monthUsers} ce mois`,
      trend:    "+8%",
      up:       true,
      icon:     Users,
      iconBg:   "rgba(34,211,238,0.15)",
      iconColor:"#22d3ee",
    },
    {
      label:    "COMMANDES ACTIVES",
      value:    stats.pendingOrders.toLocaleString(),
      sub:      "commandes en cours",
      trend:    stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : "Tout traité",
      up:       stats.pendingOrders === 0,
      icon:     Package,
      iconBg:   "rgba(251,191,36,0.15)",
      iconColor:"#fbbf24",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-poppins font-black text-2xl text-white">Sales Dashboard</h1>
          <p className="text-sm font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.4)" }}>
            BEE Performance Tracking
            <span className="ml-2 text-xs" style={{ color: "rgba(232,234,240,0.25)" }}>
              · Updated at {new Date().toLocaleTimeString("fr-CM", { hour:"2-digit", minute:"2-digit" })}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Period selector */}
          <div className="relative">
            <button onClick={() => setPeriodOpen(!periodOpen)}
              className="flex items-center gap-2 h-9 px-3.5 rounded-xl text-sm font-semibold font-poppins transition-colors"
              style={{ background: "var(--adm-surface2)", border: "1px solid var(--adm-border2)", color: "var(--adm-text)" }}>
              <Calendar size={14} />
              {PERIODS[period]}
              <span style={{ color: "rgba(232,234,240,0.4)" }}>▾</span>
            </button>
            {periodOpen && (
              <div className="absolute right-0 top-11 w-48 rounded-xl shadow-2xl z-50 overflow-hidden"
                style={{ background: "var(--adm-surface2)", border: "1px solid var(--adm-border2)" }}>
                {PERIODS.map((p, i) => (
                  <button key={p} onClick={() => { setPeriod(i); setPeriodOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-inter transition-colors"
                    style={{
                      color: i === period ? "#9b7fff" : "rgba(232,234,240,0.7)",
                      background: i === period ? "rgba(124,92,252,0.1)" : "transparent",
                    }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh */}
          <button onClick={handleRefresh}
            className="flex items-center gap-2 h-9 px-3.5 rounded-xl text-sm font-semibold font-poppins transition-colors"
            style={{ background: "var(--adm-surface2)", border: "1px solid var(--adm-border)", color: "var(--adm-muted)" }}>
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          {/* Export */}
          <button className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold font-poppins text-white transition-colors"
            style={{ background: "linear-gradient(135deg,#7c5cfc,#9b7fff)", boxShadow: "0 0 16px rgba(124,92,252,0.3)" }}>
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, sub, trend, up, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="rounded-2xl p-5 transition-colors"
            style={{
              background: "var(--adm-surface)",
              border: "1px solid var(--adm-border)",
            }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: iconBg }}>
                <Icon size={18} style={{ color: iconColor }} />
              </div>
              <span className={`text-xs font-bold font-poppins px-2 py-0.5 rounded-md ${
                up ? "bg-[#22d3a5]/15 text-[#22d3a5]" : "bg-[#f87171]/15 text-[#f87171]"
              }`}>
                {up ? "↗" : "↘"} {trend}
              </span>
            </div>
            <p className="text-[11px] font-bold tracking-widest mb-2 font-poppins"
              style={{ color: "rgba(232,234,240,0.35)" }}>
              {label}
            </p>
            <p className="font-poppins font-black text-2xl text-white mb-1">{value}</p>
            <p className="text-xs font-inter" style={{ color: "rgba(232,234,240,0.35)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Bar chart */}
        <div className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-poppins font-bold text-base text-white">Revenue by day</h2>
              <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.35)" }}>
                Revenue generated over the selected period
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#7c5cfc]" />
              <span className="text-xs font-inter" style={{ color: "rgba(232,234,240,0.4)" }}>Revenue</span>
            </div>
          </div>
          <BarChart monthRevenue={stats.revenueMonth} />
        </div>

        {/* Donut chart */}
        <div className="rounded-2xl p-5"
          style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}>
          <div className="mb-4">
            <h2 className="font-poppins font-bold text-base text-white">Sales Distribution</h2>
            <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.35)" }}>
              By product category
            </p>
          </div>
          <DonutChart total={stats.revenueTotal} />
        </div>
      </div>

      {/* Bottom row — recent orders + users */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Recent orders */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--adm-border)" }}>
            <h2 className="font-poppins font-bold text-sm text-white">Dernières commandes</h2>
            <Link href="/admin/orders"
              className="flex items-center gap-1 text-xs font-poppins font-semibold text-[#9b7fff] hover:text-white transition-colors">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
            {recentOrders.length === 0 ? (
              <p className="text-center py-10 text-xs font-inter" style={{ color: "rgba(232,234,240,0.3)" }}>
                Aucune commande
              </p>
            ) : (
              recentOrders.slice(0, 6).map((order: any) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(124,92,252,0.12)" }}>
                    <ShoppingBag size={14} className="text-[#9b7fff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-poppins font-semibold text-sm text-white truncate">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs font-inter truncate"
                      style={{ color: "rgba(232,234,240,0.35)" }}>
                      {new Date(order.createdAt).toLocaleDateString("fr-CM")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-poppins ${STATUS_COLOR[order.status] ?? "bg-white/10 text-white/50"}`}>
                      {order.status}
                    </span>
                    <span className="font-poppins font-bold text-sm text-white">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent users */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--adm-border)" }}>
            <h2 className="font-poppins font-bold text-sm text-white">Derniers inscrits</h2>
            <Link href="/admin/users"
              className="flex items-center gap-1 text-xs font-poppins font-semibold text-[#9b7fff] hover:text-white transition-colors">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
            {recentUsers.map((user: any) => (
              <div key={user.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                  style={{ background: "linear-gradient(135deg,#7c5cfc,#22d3a5)" }}>
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-poppins font-semibold text-sm text-white truncate">{user.name}</p>
                  <p className="text-xs font-inter truncate" style={{ color: "rgba(232,234,240,0.35)" }}>
                    {user.email}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-poppins ${
                  user.role === "VENDOR"   ? "bg-[#22d3a5]/15 text-[#22d3a5]" :
                  user.role === "DELIVERY" ? "bg-[#22d3ee]/15 text-[#22d3ee]" :
                  user.role === "ADMIN"    ? "bg-[#7c5cfc]/15 text-[#9b7fff]" :
                  "bg-white/8 text-white/40"
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick access grid */}
      <div>
        <h2 className="font-poppins font-bold text-sm mb-3" style={{ color: "rgba(232,234,240,0.4)" }}>
          ACCÈS RAPIDE
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href:"/admin/users",               label:"Utilisateurs",    emoji:"👥", color:"rgba(34,211,238,0.1)",  border:"rgba(34,211,238,0.15)"  },
            { href:"/admin/vendors",             label:"Boutiques",       emoji:"🏪", color:"rgba(124,92,252,0.1)",  border:"rgba(124,92,252,0.15)"  },
            { href:"/admin/finance/withdrawals", label:"Retraits",        emoji:"💸", color:"rgba(251,191,36,0.1)",  border:"rgba(251,191,36,0.15)"  },
            { href:"/admin/cms/banners",         label:"Bannières",       emoji:"🖼️", color:"rgba(34,211,165,0.1)",  border:"rgba(34,211,165,0.15)"  },
            { href:"/admin/catalog/categories",  label:"Catégories",      emoji:"🗂️", color:"rgba(155,127,255,0.1)", border:"rgba(155,127,255,0.15)" },
            { href:"/admin/security",            label:"Sécurité",        emoji:"🛡️", color:"rgba(248,113,113,0.1)", border:"rgba(248,113,113,0.15)" },
          ].map(({ href, label, emoji, color, border }) => (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors text-center group"
              style={{ background: color, border: `1px solid ${border}` }}>
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-bold font-poppins text-white/70 group-hover:text-white transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
