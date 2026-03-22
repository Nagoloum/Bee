import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { getAdminSubscriptions } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/cn";

export const revalidate = 0;

export default async function AdminSubscriptionsPage() {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in");

  const subs = await getAdminSubscriptions();

  const revenue = subs
    .filter(s => s.status === "ACTIVE")
    .reduce((sum, s) => sum + (s.planPrice ?? 0), 0);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-poppins font-black text-2xl text-white">Abonnements</h1>
          <p className="text-sm font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>{subs.length} abonnement{subs.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="bg-ink-900 border border-white/8 rounded-2xl px-5 py-3 text-right">
          <p className="text-xs text-white/40 font-inter">MRR actuel</p>
          <p className="font-poppins font-black text-xl text-primary">{formatPrice(revenue)}</p>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:"1px solid var(--adm-border)" }}>
                {["Vendeur", "Plan", "Tarif / mois", "Statut", "Renouvellement"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold font-poppins uppercase tracking-wider" style={{ color:"rgba(232,234,240,0.3)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
              {subs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm font-inter" style={{ color:"rgba(232,234,240,0.25)" }}>
                    Aucun abonnement
                  </td>
                </tr>
              ) : (
                subs.map(sub => (
                  <tr key={sub.id} className="adm-tr-hover transition-colors">
                    <td className="px-5 py-3 text-sm font-inter text-white/60 font-mono text-xs">
                      {sub.vendorId.slice(0, 12)}…
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span>
                          {sub.planName === "Elite" ? "👑" : sub.planName === "Pro" ? "⭐" : "🐝"}
                        </span>
                        <span className="font-poppins font-semibold text-sm text-white">
                          {sub.planName ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-poppins font-bold text-sm text-white">
                      {sub.planPrice ? formatPrice(sub.planPrice) : "Gratuit"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={sub.status === "ACTIVE" ? "success" : sub.status === "PAST_DUE" ? "warning" : "error"}
                        size="xs">
                        {sub.status ?? "—"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-white/40 font-inter">
                      {sub.periodEnd
                        ? new Date(sub.periodEnd).toLocaleDateString("fr-CM")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
