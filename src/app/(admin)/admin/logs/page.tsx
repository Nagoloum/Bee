import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { users, orders, vendors, products } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const revalidate = 0;

export default async function AdminLogsPage() {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in");

  // Aggregate recent activity as pseudo-logs from real tables
  const [recentUsers, recentOrders, recentVendors, recentProducts] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
      .from(users).orderBy(desc(users.createdAt)).limit(10),
    db.select({ id: orders.id, orderNumber: orders.orderNumber, status: orders.status, total: orders.total, createdAt: orders.createdAt })
      .from(orders).orderBy(desc(orders.createdAt)).limit(10),
    db.select({ id: vendors.id, shopName: vendors.shopName, status: vendors.status, createdAt: vendors.createdAt })
      .from(vendors).orderBy(desc(vendors.createdAt)).limit(5),
    db.select({ id: products.id, name: products.name, status: products.status, createdAt: products.createdAt })
      .from(products).orderBy(desc(products.createdAt)).limit(5),
  ]);

  // Build unified event log
  const events = [
    ...recentUsers.map(u => ({
      id:      u.id,
      time:    u.createdAt,
      type:    "user",
      emoji:   u.role === "VENDOR" ? "🏪" : u.role === "DELIVERY" ? "🛵" : "👤",
      label:   `Nouvelle inscription — ${u.name}`,
      sub:     `${u.role} · ${u.email}`,
      color:   "text-blue-400",
    })),
    ...recentOrders.map(o => ({
      id:      o.id,
      time:    o.createdAt,
      type:    "order",
      emoji:   o.status === "DELIVERED" ? "✅" : o.status === "CANCELLED" ? "❌" : "📦",
      label:   `Commande ${o.orderNumber}`,
      sub:     `${o.status} · ${o.total.toLocaleString()} FCFA`,
      color:   "text-primary",
    })),
    ...recentVendors.map(v => ({
      id:      v.id,
      time:    v.createdAt,
      type:    "vendor",
      emoji:   "🏪",
      label:   `Nouvelle boutique — ${v.shopName}`,
      sub:     `Statut: ${v.status}`,
      color:   "text-honey-400",
    })),
    ...recentProducts.map(p => ({
      id:      p.id,
      time:    p.createdAt,
      type:    "product",
      emoji:   "📦",
      label:   `Produit ajouté — ${p.name}`,
      sub:     `Statut: ${p.status}`,
      color:   "text-purple-400",
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="font-poppins font-black text-2xl text-white">Journal d'activité</h1>
        <p className="text-sm font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>
          Dernières actions sur la plateforme
        </p>
      </div>

      <div className="bg-ink-900 rounded-2xl border border-white/8 divide-y divide-white/5">
        {events.length === 0 ? (
          <p className="text-center py-12 text-sm font-inter" style={{ color:"rgba(232,234,240,0.25)" }}>Aucune activité</p>
        ) : (
          events.map((event, i) => (
            <div key={`${event.id}-${i}`} className="flex items-start gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
              {/* Dot + line */}
              <div className="flex flex-col items-center shrink-0 pt-1">
                <span className="text-lg">{event.emoji}</span>
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`font-poppins font-semibold text-sm ${event.color}`}>{event.label}</p>
                <p className="text-xs text-white/30 font-inter mt-0.5">{event.sub}</p>
              </div>
              {/* Time */}
              <p className="text-xs text-white/20 font-inter shrink-0">
                {new Date(event.time).toLocaleDateString("fr-CM", {
                  day: "2-digit", month: "short",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
