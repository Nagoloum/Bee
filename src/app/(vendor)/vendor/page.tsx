import { redirect } from "next/navigation";
import Link from "next/link";
import { TrendingUp, ShoppingBag, Package, Clock, ArrowRight, Plus, AlertCircle } from "lucide-react";
import { getServerSession } from "@/lib/auth/helpers";
import { getVendorByUserId, getVendorStats, getVendorOrders, getVendorSubscription } from "@/lib/actions/vendor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils/cn";

export const revalidate = 30;

const STATUS_LABEL: Record<string, { label: string; variant: any }> = {
  PENDING:    { label: "En attente",     variant: "warning" },
  CONFIRMED:  { label: "Confirmée",      variant: "info"    },
  PREPARING:  { label: "En préparation", variant: "info"    },
  READY:      { label: "Prête",          variant: "success" },
  IN_TRANSIT: { label: "En livraison",   variant: "default" },
  DELIVERED:  { label: "Livrée",         variant: "success" },
  CANCELLED:  { label: "Annulée",        variant: "error"   },
};

export default async function VendorDashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");
  const user   = session.user as any;
  const vendor = await getVendorByUserId(user.id);
  if (!vendor)  redirect("/sign-up/vendor");

  const [stats, recentOrders, subscription] = await Promise.all([
    getVendorStats(vendor.id),
    getVendorOrders(vendor.id),
    getVendorSubscription(vendor.id),
  ]);

  const latest = recentOrders.slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins font-black text-2xl text-foreground">
            Bonjour {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground font-inter mt-0.5">
            Voici un aperçu de votre boutique aujourd'hui
          </p>
        </div>
        <Button asChild leftIcon={<Plus size={16} />}>
          <Link href="/vendor/products/new">Nouveau produit</Link>
        </Button>
      </div>

      {/* Alert commandes en attente */}
      {stats.pendingOrders > 0 && (
        <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/30 rounded-2xl">
          <AlertCircle size={18} className="text-warning-dark shrink-0" />
          <p className="text-sm font-inter text-warning-dark flex-1">
            <span className="font-semibold">{stats.pendingOrders} commande{stats.pendingOrders > 1 ? "s" : ""}</span> en attente de confirmation.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/vendor/orders?status=PENDING">Voir</Link>
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"Revenus du mois",     value:formatPrice(stats.monthRevenue),    sub:`Total: ${formatPrice(stats.totalRevenue)}`, icon:TrendingUp, color:"text-success",           bg:"bg-success/10" },
          { label:"Commandes ce mois",   value:stats.monthOrders.toString(),        sub:`Total: ${stats.totalOrders}`,              icon:ShoppingBag,color:"text-primary",           bg:"bg-primary/10" },
          { label:"Produits publiés",    value:stats.totalProducts.toString(),      sub:`Plan ${subscription?.planName ?? "Start"}`,icon:Package,    color:"text-info",              bg:"bg-info/10"    },
          { label:"En attente",          value:stats.pendingOrders.toString(),      sub:"À traiter maintenant",                     icon:Clock,      color:stats.pendingOrders > 0 ? "text-warning-dark" : "text-muted-foreground", bg:stats.pendingOrders > 0 ? "bg-warning/10" : "bg-muted" },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label} variant="default" hover="lift" padding="md">
            <CardContent>
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground font-poppins uppercase tracking-wider leading-tight">{label}</p>
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", bg)}>
                  <Icon size={16} className={color} />
                </div>
              </div>
              <p className="font-poppins font-black text-xl text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground font-inter mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent orders + plan */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dernières commandes</CardTitle>
                <Link href="/vendor/orders" className="text-xs text-primary font-semibold hover:underline font-poppins flex items-center gap-1">
                  Tout voir <ArrowRight size={12} />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {latest.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-inter">Aucune commande pour le moment</p>
                  <p className="text-xs text-muted-foreground font-inter mt-1">Commencez par ajouter des produits à votre boutique</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {latest.map((order) => {
                    const s = STATUS_LABEL[order.status] ?? { label: order.status, variant: "muted" };
                    const addr = order.deliveryAddress as any;
                    return (
                      <Link key={order.id} href={`/vendor/orders/${order.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <ShoppingBag size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold font-poppins text-foreground truncate">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground font-inter">{addr?.city ?? "—"} · {new Date(order.createdAt).toLocaleDateString("fr-CM")}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <p className="text-sm font-bold font-poppins">{formatPrice(order.total)}</p>
                          <Badge variant={s.variant} size="xs">{s.label}</Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Subscription */}
          <Card variant={subscription?.planName === "Elite" ? "ink" : "default"}>
            <CardHeader>
              <CardTitle className={subscription?.planName === "Elite" ? "text-white" : ""}>Mon abonnement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-honey-gradient flex items-center justify-center shadow-honey shrink-0">
                  <span className="text-lg">{subscription?.planName === "Elite" ? "👑" : subscription?.planName === "Pro" ? "⭐" : "🐝"}</span>
                </div>
                <div>
                  <p className={cn("font-poppins font-bold", subscription?.planName === "Elite" ? "text-white" : "text-foreground")}>
                    Plan {subscription?.planName ?? "Start"}
                  </p>
                  {subscription?.periodEnd && (
                    <p className={cn("text-xs font-inter", subscription?.planName === "Elite" ? "text-white/50" : "text-muted-foreground")}>
                      Renouvellement {new Date(subscription.periodEnd).toLocaleDateString("fr-CM")}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  { label:"Produits max",    value:subscription?.maxProducts  ?? 10, unlimited:!subscription?.maxProducts  },
                  { label:"Photos/produit",  value:subscription?.maxPhotos    ?? 2  },
                  { label:"Flash/jour",      value:subscription?.flashPerDay  ?? 0  },
                  { label:"Coupons",         value:subscription?.maxCoupons   ?? 0  },
                ].map(({ label, value, unlimited }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className={cn("font-inter", subscription?.planName === "Elite" ? "text-white/50" : "text-muted-foreground")}>{label}</span>
                    <span className={cn("font-semibold font-poppins", subscription?.planName === "Elite" ? "text-white" : "text-foreground")}>
                      {unlimited ? "∞" : value}
                    </span>
                  </div>
                ))}
              </div>
              {subscription?.planName !== "Elite" && (
                <Button size="sm" fullWidth asChild>
                  <Link href="/vendor/subscription">Upgrader →</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card padding="md">
            <CardContent>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-poppins mb-3">Actions rapides</p>
              <div className="space-y-1">
                {[
                  { href:"/vendor/products/new", label:"➕ Ajouter un produit" },
                  { href:"/vendor/orders",        label:"📦 Commandes"         },
                  { href:"/vendor/wallet",        label:"💰 Portefeuille"       },
                  { href:"/vendor/settings",      label:"⚙️ Paramètres"        },
                ].map(({ href, label }) => (
                  <Link key={href} href={href}
                    className="block px-3 py-2 rounded-xl text-sm font-inter text-foreground hover:bg-muted transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
