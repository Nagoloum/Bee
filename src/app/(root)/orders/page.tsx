import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { getServerSession } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils/cn";

export const revalidate = 0;
export const metadata = { title: "Mes commandes — BEE" };

const STATUS: Record<string, { label: string; variant: any }> = {
  PENDING:    { label: "En attente",     variant: "warning" },
  CONFIRMED:  { label: "Confirmée",      variant: "info"    },
  PREPARING:  { label: "En préparation", variant: "info"    },
  READY:      { label: "Prête",          variant: "success" },
  IN_TRANSIT: { label: "En livraison",   variant: "default" },
  DELIVERED:  { label: "Livrée ✓",       variant: "success" },
  CANCELLED:  { label: "Annulée",        variant: "error"   },
  REFUNDED:   { label: "Remboursée",     variant: "muted"   },
};

export default async function OrdersPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in?callbackUrl=/orders");

  const clientOrders = await db.select().from(orders)
    .where(eq(orders.clientId, (session.user as any).id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-white">
        <div className="container-bee py-6">
          <h1 className="font-poppins font-black text-2xl text-foreground">Mes commandes</h1>
          <p className="text-sm text-muted-foreground font-inter mt-0.5">
            {clientOrders.length} commande{clientOrders.length !== 1 ? "s" : ""} au total
          </p>
        </div>
      </div>

      <div className="container-bee py-8 max-w-3xl">
        {clientOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-poppins font-bold text-lg text-foreground mb-2">Aucune commande</h3>
            <p className="text-muted-foreground font-inter text-sm mb-6">
              Vous n'avez pas encore passé de commande sur BEE.
            </p>
            <Link href="/products"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl bg-primary text-white font-poppins font-bold text-sm">
              Explorer les produits
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {clientOrders.map((order) => {
              const s    = STATUS[order.status] ?? { label: order.status, variant: "muted" };
              const addr = order.deliveryAddress as any;
              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <Card padding="none" hover="border" className="cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Package size={18} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="font-poppins font-bold text-sm text-foreground">
                              {order.orderNumber}
                            </p>
                            <Badge variant={s.variant} size="xs">{s.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-inter">
                            {addr?.city && `${addr.city} · `}
                            {new Date(order.createdAt).toLocaleDateString("fr-CM", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <p className="font-poppins font-bold text-base text-foreground">
                            {formatPrice(order.total)}
                          </p>
                          <ChevronRight size={16} className="text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
