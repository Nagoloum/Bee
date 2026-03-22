import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { wallets, walletTransactions, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/cn";
import { AdminWithdrawalActions } from "@/components/admin/admin-withdrawal-actions";

export const revalidate = 0;

export default async function AdminWithdrawalsPage() {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in");

  // Get recent withdrawal transactions
  const withdrawals = await db
    .select({
      id:        walletTransactions.id,
      walletId:  walletTransactions.walletId,
      amount:    walletTransactions.amount,
      reason:    walletTransactions.reason,
      status:    walletTransactions.status,
      createdAt: walletTransactions.createdAt,
    })
    .from(walletTransactions)
    .where(eq(walletTransactions.reason, "WITHDRAWAL"))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(50);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="font-poppins font-black text-2xl text-white">Demandes de retrait</h1>
        <p className="text-sm font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.4)" }}>
          Validez ou rejetez les virements vers Mobile Money
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}>
        {withdrawals.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💸</div>
            <p className="font-poppins font-bold text-sm text-white mb-1">Aucune demande en attente</p>
            <p className="text-xs font-inter" style={{ color: "rgba(232,234,240,0.3)" }}>
              Les demandes de retrait apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--adm-border)" }}>
                  {["ID Transaction", "Montant", "Statut", "Date", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold font-poppins tracking-wider"
                      style={{ color: "rgba(232,234,240,0.3)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id} style={{ borderBottom: "1px solid var(--adm-border)" }}
                    className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-white/40">{w.id.slice(0, 14)}…</td>
                    <td className="px-5 py-3 font-poppins font-bold text-sm text-white">
                      {formatPrice(w.amount)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-poppins ${
                        w.status === "COMPLETED" ? "bg-[#22d3a5]/15 text-[#22d3a5]" :
                        w.status === "PENDING"   ? "bg-[#fbbf24]/15 text-[#fbbf24]" :
                        "bg-[#f87171]/15 text-[#f87171]"
                      }`}>
                        {w.status ?? "PENDING"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs font-inter" style={{ color: "rgba(232,234,240,0.4)" }}>
                      {new Date(w.createdAt).toLocaleDateString("fr-CM", { day:"2-digit", month:"short" })}
                    </td>
                    <td className="px-5 py-3">
                      <AdminWithdrawalActions txId={w.id} currentStatus={w.status ?? "PENDING"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
