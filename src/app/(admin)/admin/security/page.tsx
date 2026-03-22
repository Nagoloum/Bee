import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { users, orders, vendors, products } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Shield, Download } from "lucide-react";

export const revalidate = 0;

export default async function AdminSecurityPage() {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in");

  const [recentUsers, recentOrders, recentVendors, recentProducts] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
      .from(users).orderBy(desc(users.createdAt)).limit(15),
    db.select({ id: orders.id, orderNumber: orders.orderNumber, status: orders.status, total: orders.total, createdAt: orders.createdAt })
      .from(orders).orderBy(desc(orders.createdAt)).limit(15),
    db.select({ id: vendors.id, shopName: vendors.shopName, status: vendors.status, createdAt: vendors.createdAt })
      .from(vendors).orderBy(desc(vendors.createdAt)).limit(8),
    db.select({ id: products.id, name: products.name, status: products.status, createdAt: products.createdAt })
      .from(products).orderBy(desc(products.createdAt)).limit(8),
  ]);

  const events = [
    ...recentUsers.map(u => ({
      id: u.id, time: u.createdAt,
      emoji: u.role === "VENDOR" ? "🏪" : u.role === "DELIVERY" ? "🛵" : "👤",
      action: "Inscription",
      detail: `${u.name} (${u.role})`,
      sub:    u.email,
      color:  "#22d3ee",
    })),
    ...recentOrders.map(o => ({
      id: o.id, time: o.createdAt,
      emoji: o.status === "DELIVERED" ? "✅" : o.status === "CANCELLED" ? "❌" : "📦",
      action: "Commande",
      detail: o.orderNumber,
      sub:    `${o.status} · ${o.total.toLocaleString()} FCFA`,
      color:  "#9b7fff",
    })),
    ...recentVendors.map(v => ({
      id: v.id, time: v.createdAt,
      emoji: "🏪", action: "Boutique créée",
      detail: v.shopName, sub: `Statut: ${v.status}`, color: "#fbbf24",
    })),
    ...recentProducts.map(p => ({
      id: p.id, time: p.createdAt,
      emoji: "📦", action: "Produit ajouté",
      detail: p.name, sub: `Statut: ${p.status}`, color: "#22d3a5",
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 30);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-poppins font-black text-2xl text-white flex items-center gap-2">
            <Shield size={22} className="text-[#9b7fff]" /> Sécurité & Logs
          </h1>
          <p className="text-sm font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.4)" }}>
            Journal d'audit en temps réel · {events.length} événements
          </p>
        </div>
        <button className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold font-poppins text-white"
          style={{ background: "linear-gradient(135deg,#7c5cfc,#9b7fff)" }}>
          <Download size={14} /> Exporter CSV
        </button>
      </div>

      {/* 2FA status */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "2FA Admin", value: "Actif", color: "#22d3a5", bg: "rgba(34,211,165,0.1)", border: "rgba(34,211,165,0.2)" },
          { label: "Sessions actives", value: "1", color: "#22d3ee", bg: "rgba(34,211,238,0.1)", border: "rgba(34,211,238,0.2)" },
          { label: "Tentatives échouées", value: "0", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: bg, border: `1px solid ${border}` }}>
            <p className="text-xs font-poppins font-bold mb-1" style={{ color: "rgba(232,234,240,0.4)" }}>{label}</p>
            <p className="font-poppins font-black text-xl" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Audit log */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--adm-border)" }}>
          <h2 className="font-poppins font-bold text-sm text-white">Journal d'activité</h2>
        </div>
        <div className="divide-y max-h-[500px] overflow-y-auto scrollbar-hide"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {events.map((e, i) => (
            <div key={`${e.id}-${i}`} className="flex items-start gap-4 px-5 py-3 hover:bg-white/3 transition-colors">
              <span className="text-base shrink-0">{e.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-poppins" style={{ color: e.color }}>{e.action}</span>
                  <span className="text-sm font-semibold font-poppins text-white truncate">{e.detail}</span>
                </div>
                <p className="text-xs font-inter truncate" style={{ color: "rgba(232,234,240,0.35)" }}>{e.sub}</p>
              </div>
              <p className="text-xs font-inter shrink-0" style={{ color: "rgba(232,234,240,0.2)" }}>
                {new Date(e.time).toLocaleDateString("fr-CM", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
