import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Package, MapPin, Clock } from "lucide-react";
import { getServerSession } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { orders, orderItems, orderDeliveries, vendors } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { formatPrice, cn } from "@/lib/utils/cn";
// ✅ PATCH — tracking + litige + notation livreur
import { OrderDetailActions } from "@/components/storefront/order-detail-actions";
import { OpenDisputeButton } from "@/components/storefront/open-dispute-button";
import { RateDeliveryButton } from "@/components/storefront/rate-delivery-button";

export const revalidate = 0;

const STATUS_CONFIG: Record<string, { label: string; color: string; step: number }> = {
  PENDING:    { label: "En attente",      color: "text-amber-600",   step: 1 },
  CONFIRMED:  { label: "Confirmée",       color: "text-blue-600",    step: 2 },
  PREPARING:  { label: "En préparation",  color: "text-purple-600",  step: 3 },
  READY:      { label: "Prête",           color: "text-indigo-600",  step: 4 },
  PICKED_UP:  { label: "Colis récupéré", color: "text-orange-500",  step: 5 },
  IN_TRANSIT: { label: "En livraison",   color: "text-orange-600",  step: 6 },
  DELIVERED:  { label: "Livrée",         color: "text-green-600",   step: 7 },
  CANCELLED:  { label: "Annulée",        color: "text-red-600",     step: 0 },
  DISPUTED:   { label: "En litige",      color: "text-red-700",     step: 0 },
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = (session.user as any).id;

  // Récupérer la commande
  const orderRows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, params.id), eq(orders.clientId, userId)))
    .limit(1);

  if (!orderRows[0]) notFound();
  const order = orderRows[0];

  // Items
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  // Livraison (pour deliveryAgentId)
  const deliveryRows = await db.select().from(orderDeliveries)
    .where(eq(orderDeliveries.orderId, order.id)).limit(1);
  const delivery = deliveryRows[0];

  // Vendeur
  const vendorRows = await db.select({ shopName: vendors.shopName, slug: vendors.slug })
    .from(vendors).where(eq(vendors.id, order.vendorId)).limit(1);
  const vendor = vendorRows[0];

  const statusConf = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const addr       = order.deliveryAddress as any ?? {};

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container-bee py-3">
        <nav className="flex items-center gap-1.5 text-xs font-inter text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Accueil</Link>
          <ChevronRight size={12} />
          <Link href="/orders" className="hover:text-foreground">Mes commandes</Link>
          <ChevronRight size={12} />
          <span className="text-foreground">{order.orderNumber}</span>
        </nav>
      </div>

      <div className="container-bee max-w-2xl pb-12 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-poppins font-black text-2xl text-foreground">
              {order.orderNumber}
            </h1>
            <p className="text-sm font-inter text-muted-foreground mt-0.5">
              Passée le {new Date(order.createdAt).toLocaleDateString("fr-CM", {
                day: "2-digit", month: "long", year: "numeric"
              })}
            </p>
          </div>
          <span className={cn("text-sm font-poppins font-bold", statusConf.color)}>
            {statusConf.label}
          </span>
        </div>

        {/* Timeline statut */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-poppins font-bold text-base text-foreground mb-4">Suivi</h2>
          <div className="flex items-center gap-0">
            {["CONFIRMED", "PREPARING", "READY", "IN_TRANSIT", "DELIVERED"].map((s, i, arr) => {
              const conf    = STATUS_CONFIG[s];
              const current = STATUS_CONFIG[order.status]?.step ?? 0;
              const done    = conf.step <= current && current > 0;
              const active  = s === order.status;
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold",
                      done || active ? "border-primary bg-primary text-white" : "border-border bg-white text-muted-foreground"
                    )}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span className="text-[9px] font-inter text-muted-foreground mt-1 text-center w-12 leading-tight">
                      {conf.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mb-4",
                      STATUS_CONFIG[order.status]?.step > conf.step ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ✅ PATCH — Tracking live + litige + notation livreur */}
        <OrderDetailActions
          orderId={order.id}
          orderStatus={order.status}
          deliveryAgentId={delivery?.deliveryAgentId ?? null}
        />

        <div className="flex flex-wrap gap-3">
          <OpenDisputeButton orderId={order.id} orderStatus={order.status} />
          <RateDeliveryButton
            orderId={order.id}
            orderStatus={order.status}
            alreadyRated={!!delivery?.ratingByClient}
          />
        </div>

        {/* Articles */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-poppins font-bold text-base text-foreground mb-4">
            Articles ({items.length})
          </h2>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl border border-border bg-cream-50 overflow-hidden shrink-0">
                  {item.productImage
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-muted-foreground/30" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-poppins font-semibold text-sm text-foreground line-clamp-1">
                    {item.productName}
                  </p>
                  {item.variantLabel && (
                    <p className="text-xs font-inter text-muted-foreground">{item.variantLabel}</p>
                  )}
                  <p className="text-xs font-inter text-muted-foreground">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p className="font-poppins font-bold text-sm text-foreground shrink-0">
                  {formatPrice(item.totalPrice)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Récap financier */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-2">
          <h2 className="font-poppins font-bold text-base text-foreground mb-3">Récapitulatif</h2>
          {[
            { label: "Sous-total",        value: formatPrice(order.subtotal) },
            { label: "Livraison",         value: order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : "Gratuite" },
            ...(order.discount > 0 ? [{ label: "Réduction", value: `-${formatPrice(order.discount)}` }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm font-inter">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground">{value}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex items-center justify-between">
            <span className="font-poppins font-bold text-base text-foreground">Total</span>
            <span className="font-poppins font-black text-lg text-primary">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Adresse */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-poppins font-bold text-base text-foreground mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-muted-foreground" /> Adresse de livraison
          </h2>
          <p className="font-poppins font-semibold text-sm text-foreground">{addr.fullName}</p>
          <p className="text-sm font-inter text-muted-foreground">{addr.street}</p>
          <p className="text-sm font-inter text-muted-foreground">{addr.city}, {addr.region}</p>
          {addr.phone && <p className="text-sm font-inter text-muted-foreground mt-1">{addr.phone}</p>}
        </div>

        {/* Vendeur */}
        {vendor && (
          <div className="bg-white rounded-2xl border border-border p-5">
            <p className="text-xs font-inter text-muted-foreground mb-1">Vendu par</p>
            <Link href={`/shops/${vendor.slug}`}
              className="font-poppins font-bold text-sm text-primary hover:underline">
              {vendor.shopName}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
