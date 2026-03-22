import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/auth/helpers";
import { getVendorByUserId, getVendorOrders } from "@/lib/actions/vendor";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, cn } from "@/lib/utils/cn";
import { ShoppingBag } from "lucide-react";
import { VendorOrderActions } from "@/components/vendor/vendor-order-actions";

export const revalidate = 0;

const STATUSES = [
  { value: "ALL",       label: "Toutes"         },
  { value: "PENDING",   label: "En attente"     },
  { value: "CONFIRMED", label: "Confirmées"     },
  { value: "PREPARING", label: "En préparation" },
  { value: "DELIVERED", label: "Livrées"        },
  { value: "CANCELLED", label: "Annulées"       },
];

const STATUS_BADGE: Record<string, { label: string; variant: any }> = {
  PENDING:    { label: "En attente",     variant: "warning" },
  CONFIRMED:  { label: "Confirmée",      variant: "info"    },
  PREPARING:  { label: "En préparation", variant: "info"    },
  READY:      { label: "Prête",          variant: "success" },
  IN_TRANSIT: { label: "En livraison",   variant: "default" },
  DELIVERED:  { label: "Livrée",         variant: "success" },
  CANCELLED:  { label: "Annulée",        variant: "error"   },
};

interface Props {
  searchParams: { status?: string };
}

export default async function VendorOrdersPage({ searchParams }: Props) {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");
  const vendor = await getVendorByUserId((session.user as any).id);
  if (!vendor)  redirect("/sign-up/vendor");

  const status  = searchParams.status ?? "ALL";
  const orders  = await getVendorOrders(vendor.id, status === "ALL" ? undefined : status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-poppins font-black text-2xl text-foreground">Commandes</h1>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">{orders.length} commande{orders.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUSES.map(({ value, label }) => (
          <Link
            key={value}
            href={`/vendor/orders${value !== "ALL" ? `?status=${value}` : ""}`}
            className={cn(
              "shrink-0 px-4 py-2 rounded-xl text-sm font-semibold font-poppins transition-colors",
              status === value
                ? "bg-secondary text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <Card padding="lg" className="text-center py-16">
          <CardContent>
            <ShoppingBag size={40} className="text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-poppins font-bold text-lg text-foreground mb-2">Aucune commande</h3>
            <p className="text-sm text-muted-foreground font-inter">
              {status === "ALL" ? "Vous n'avez pas encore reçu de commandes." : `Aucune commande avec ce statut.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const s    = STATUS_BADGE[order.status] ?? { label: order.status, variant: "muted" };
            const addr = order.deliveryAddress as any;
            return (
              <Card key={order.id} padding="none" hover="border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <ShoppingBag size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-poppins font-bold text-sm text-foreground">{order.orderNumber}</p>
                        <Badge variant={s.variant} size="xs">{s.label}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-inter">
                        <span>📍 {addr?.city ?? "—"}, {addr?.region ?? "—"}</span>
                        <span>📅 {new Date(order.createdAt).toLocaleDateString("fr-CM", { day:"2-digit", month:"short", year:"numeric" })}</span>
                        <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                    {/* Actions */}
                    <VendorOrderActions orderId={order.id} status={order.status} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
