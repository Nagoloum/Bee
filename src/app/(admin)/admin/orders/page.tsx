import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { getAdminOrders } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { AdminOrderActions } from "@/components/admin/admin-order-actions";
import { formatPrice, cn } from "@/lib/utils/cn";

export const revalidate = 0;

const STATUS_FILTER = ["ALL", "PENDING", "CONFIRMED", "PREPARING", "READY", "IN_TRANSIT", "DELIVERED", "CANCELLED"];
const STATUS_BADGE: Record<string, any> = {
  PENDING:    "warning",
  CONFIRMED:  "info",
  PREPARING:  "info",
  READY:      "success",
  IN_TRANSIT: "default",
  DELIVERED:  "success",
  CANCELLED:  "error",
  REFUNDED:   "muted",
};

interface Props { searchParams: { status?: string } }

export default async function AdminOrdersPage({ searchParams }: Props) {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in");

  const orders = await getAdminOrders(searchParams.status, 100);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h1 className="font-poppins font-black text-2xl text-white">Commandes</h1>
        <p className="text-sm font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>{orders.length} commande{orders.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Status filters */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_FILTER.map(s => (
          <a key={s} href={`/admin/orders${s !== "ALL" ? `?status=${s}` : ""}`}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-semibold font-poppins transition-colors",
              (searchParams.status ?? "ALL") === s
                ? "bg-primary text-white"
                : "bg-white/8 text-white/50 hover:bg-white/12 hover:text-white"
            )}>
            {s}
          </a>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:"1px solid var(--adm-border)" }}>
                {["Commande", "Montant", "Statut", "Paiement", "Date", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold font-poppins uppercase tracking-wider" style={{ color:"rgba(232,234,240,0.3)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm font-inter" style={{ color:"rgba(232,234,240,0.25)" }}>
                    Aucune commande
                  </td>
                </tr>
              ) : (
                orders.map(order => {
                  const addr = order.deliveryAddress as any;
                  return (
                    <tr key={order.id} className="adm-tr-hover transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-poppins font-semibold text-sm text-white">{order.orderNumber}</p>
                        <p className="text-xs text-white/30 font-inter">{addr?.city ?? "—"}</p>
                      </td>
                      <td className="px-5 py-3 font-poppins font-bold text-sm text-white">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={STATUS_BADGE[order.status] ?? "muted"} size="xs">
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"} size="xs">
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-xs text-white/40 font-inter">
                        {new Date(order.createdAt).toLocaleDateString("fr-CM", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <AdminOrderActions orderId={order.id} currentStatus={order.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
