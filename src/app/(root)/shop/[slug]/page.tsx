import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, MapPin, Star, ShieldCheck, Package } from "lucide-react";
import { getVendorBySlug, getVendorProducts } from "@/lib/actions/products";
import { ProductCard } from "@/components/storefront/product-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils/cn";

export const revalidate = 60;

const REGION_LABELS: Record<string, string> = {
  "CM-CE": "Centre (Yaoundé)",
  "CM-LT": "Littoral (Douala)",
  "CM-OU": "Ouest",
  "CM-NO": "Nord",
  "CM-EN": "Extrême-Nord",
  "CM-NW": "Nord-Ouest",
  "CM-SW": "Sud-Ouest",
  "CM-AD": "Adamaoua",
  "CM-ES": "Est",
  "CM-SU": "Sud",
};

export default async function ShopPage({ params }: { params: { slug: string } }) {
  const vendor = await getVendorBySlug(params.slug);
  if (!vendor) notFound();

  const vendorProducts = await getVendorProducts(vendor.id, 20);

  return (
    <div className="min-h-screen bg-background">

      {/* Breadcrumb */}
      <div className="border-b border-border bg-white">
        <div className="container-bee py-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-inter">
            <Link href="/" className="hover:text-foreground">Accueil</Link>
            <ChevronRight size={12} />
            <Link href="/shops" className="hover:text-foreground">Boutiques</Link>
            <ChevronRight size={12} />
            <span className="text-foreground font-medium">{vendor.shopName}</span>
          </nav>
        </div>
      </div>

      {/* Banner */}
      <div className="relative bg-ink-gradient h-40 md:h-52 overflow-hidden">
        {vendor.banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vendor.banner} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-dots-pattern opacity-20" />
        )}
      </div>

      {/* Vendor header */}
      <div className="container-bee">
        <div className="relative -mt-12 mb-8">
          <div className="bg-white rounded-3xl border border-border shadow-soft-md p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Logo / Avatar */}
              <div className="relative shrink-0">
                {vendor.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vendor.logo} alt={vendor.shopName}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-soft" />
                ) : (
                  <Avatar name={vendor.shopName} size="2xl" color="random" ring />
                )}
                {vendor.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white">
                    <ShieldCheck size={12} className="text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="font-poppins font-black text-2xl text-foreground">{vendor.shopName}</h1>
                  {vendor.isVerified && <Badge variant="info" size="sm">✓ Vérifié</Badge>}
                </div>

                {vendor.description && (
                  <p className="text-sm text-muted-foreground font-inter mb-3 max-w-xl">{vendor.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {vendor.region && (
                    <span className="flex items-center gap-1.5 text-muted-foreground font-inter">
                      <MapPin size={13} />
                      {REGION_LABELS[vendor.region] ?? vendor.region}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={13}
                        className={cn(s <= Math.round(vendor.rating) ? "fill-honey-400 text-honey-400" : "text-muted-foreground/30")}
                        strokeWidth={0} fill="currentColor" />
                    ))}
                    <span className="font-semibold text-foreground font-inter ml-1">{vendor.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground font-inter">({vendor.totalReviews} avis)</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-muted-foreground font-inter">
                    <Package size={13} />
                    {vendor.totalSales} ventes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-poppins font-bold text-xl text-foreground">
              Produits ({vendorProducts.length})
            </h2>
          </div>

          {vendorProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {vendorProducts.map(p => (
                <ProductCard key={p.id} product={{ ...p, vendorName: vendor.shopName, vendorSlug: vendor.slug } as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="font-poppins font-bold text-lg text-foreground mb-2">Aucun produit</h3>
              <p className="text-muted-foreground font-inter text-sm">Cette boutique n'a pas encore publié de produits.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
