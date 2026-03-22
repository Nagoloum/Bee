import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Package, Truck, CheckCircle2 } from "lucide-react";
import { getServerSession } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { orders, orderItems, vendors } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils/cn";
import { ConfirmDeliveryButton } from "@/components/storefront/confirm-delivery-button";

export const revalidate = 0;

const STATUS: Record<string, { label: string; variant: any; icon: string }> = {
  PENDING:    { label:"En attente de confirmation", variant:"warning", icon:"⏳" },
  CONFIRMED:  { label:"Confirmée par le vendeur",   variant:"info",    icon:"✅" },
  PREPARING:  { label:"En cours de préparation",    variant:"info",    icon:"📦" },
  READY:      { label:"Prête pour livraison",        variant:"success", icon:"🚀" },
  IN_TRANSIT: { label:"En route vers vous",          variant:"default", icon:"🛵" },
  DELIVERED:  { label:"Livrée avec succès",          variant:"success", icon:"🎉" },
  CANCELLED:  { label:"Annulée",                     variant:"error",   icon:"❌" },
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const order = await db.select().from(orders)
    .where(and(eq(orders.id, params.id), eq(orders.clientId, (session.user as any).id)))
    .limit(1);

  if (!order[0]) notFound();
  const o    = order[0];
  const addr = o.deliveryAddress as any;
  const s    = STATUS[o.status] ?? { label: o.status, variant: "muted", icon: "📋" };

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
  const vendor = await db.select({ shopName: vendors.shopName, slug: vendors.slug })
    .from(vendors).where(eq(vendors.id, o.vendorId)).limit(1);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-white">
        <div className="container-bee py-4">
          <Link href="/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-inter mb-3">
            <ArrowLeft size={14} /> Mes commandes
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-poppins font-black text-xl text-foreground">{o.orderNumber}</h1>
              <p className="text-sm text-muted-foreground font-inter">
                Passée le {new Date(o.createdAt).toLocaleDateString("fr-CM", { day:"2-digit", month:"long", year:"numeric" })}
              </p>
            </div>
            <Badge variant={s.variant} size="md">{s.icon} {s.label}</Badge>
          </div>
        </div>
      </div>

      <div className="container-bee py-8 max-w-3xl space-y-5">
        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package size={16} className="text-primary" />
              Articles ({items.length})
              {vendor[0] && (
                <Link href={`/shop/${vendor[0].slug}`}
                  className="ml-auto text-xs text-primary hover:underline font-inter font-normal">
                  Boutique {vendor[0].shopName}
                </Link>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                  {item.productImage
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl opacity-20">📦</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-poppins font-semibold text-sm text-foreground truncate">{item.productName}</p>
                  {item.variantLabel && <p className="text-xs text-muted-foreground font-inter">{item.variantLabel}</p>}
                  <p className="text-xs text-muted-foreground font-inter">Qté : {item.quantity}</p>
                </div>
                <p className="font-poppins font-bold text-sm shrink-0">{formatPrice(item.totalPrice)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" /> Adresse de livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-inter space-y-1">
            <p className="font-semibold text-foreground">{addr?.fullName}</p>
            <p className="text-muted-foreground">{addr?.street}</p>
            <p className="text-muted-foreground">{addr?.city}{addr?.region && `, ${addr.region}`}</p>
            <p className="text-muted-foreground">{addr?.phone}</p>
            {addr?.notes && <p className="text-muted-foreground italic">{addr.notes}</p>}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader><CardTitle>Récapitulatif de paiement</CardTitle></CardHeader>
          <CardContent className="text-sm font-inter space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="font-semibold">{formatPrice(o.subtotal)}</span>
            </div>
            {o.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-success-dark">Réduction</span>
                <span className="font-semibold text-success-dark">-{formatPrice(o.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livraison</span>
              <span className="font-semibold">{formatPrice(o.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-poppins font-black text-base border-t border-border pt-2">
              <span>Total payé</span>
              <span className="text-primary">{formatPrice(o.total)}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Méthode : {o.paymentMethod} · Statut : {o.paymentStatus}
            </p>
          </CardContent>
        </Card>

        {/* Confirm delivery button (if IN_TRANSIT) */}
        {o.status === "IN_TRANSIT" && (
          <ConfirmDeliveryButton orderId={o.id} />
        )}
      </div>
    </div>
  );
}
