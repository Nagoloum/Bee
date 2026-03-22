import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { getAdminWallets } from "@/lib/actions/admin";
import { formatPrice } from "@/lib/utils/cn";

export const revalidate = 0;

export default async function AdminWalletsPage() {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in");

  const wallets = await getAdminWallets();

  const totalBalance = wallets.reduce((s, w) => s + (w.balance ?? 0), 0);
  const totalEscrow  = wallets.reduce((s, w) => s + (w.escrow  ?? 0), 0);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <h1 className="font-poppins font-black text-2xl text-white">Portefeuilles</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Total en soldes",  value: formatPrice(totalBalance), color: "text-green-400" },
          { label: "Total en escrow",  value: formatPrice(totalEscrow),  color: "text-warning"   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-ink-900 border border-white/8 rounded-2xl p-5">
            <p className="text-xs text-white/40 font-poppins uppercase tracking-wider mb-1">{label}</p>
            <p className={`font-poppins font-black text-2xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:"1px solid var(--adm-border)" }}>
                {["Wallet ID", "Solde disponible", "En escrow", "Dernière mise à jour"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold font-poppins uppercase tracking-wider" style={{ color:"rgba(232,234,240,0.3)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
              {wallets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-sm font-inter" style={{ color:"rgba(232,234,240,0.25)" }}>
                    Aucun portefeuille
                  </td>
                </tr>
              ) : (
                wallets.map(wallet => (
                  <tr key={wallet.id} className="adm-tr-hover transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-white/40">{wallet.id.slice(0, 16)}…</td>
                    <td className="px-5 py-3 font-poppins font-bold text-sm text-green-400">
                      {formatPrice(wallet.balance ?? 0)}
                    </td>
                    <td className="px-5 py-3 font-poppins font-bold text-sm text-warning">
                      {formatPrice(wallet.escrow ?? 0)}
                    </td>
                    <td className="px-5 py-3 text-xs text-white/40 font-inter">
                      {wallet.updatedAt
                        ? new Date(wallet.updatedAt).toLocaleDateString("fr-CM", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                        })
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
