import Link from "next/link";
import { MapPin, Star, ShoppingBag, BadgeCheck } from "lucide-react";
import { getAllVendors } from "@/lib/actions/products";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export const revalidate = 60;
export const metadata = { title: "Boutiques — BEE" };

const REGION_LABELS: Record<string, string> = {
  "CM-CE": "Yaoundé",   "CM-LT": "Douala",    "CM-OU": "Ouest",
  "CM-NO": "Nord",      "CM-EN": "Extrême-Nord","CM-NW": "Nord-Ouest",
  "CM-SW": "Sud-Ouest", "CM-AD": "Adamaoua",   "CM-ES": "Est",
  "CM-SU": "Sud",
};

// Random gradient based on shop name for missing banners
function shopGradient(name: string) {
  const hue = (name.charCodeAt(0) * 137) % 360;
  return `linear-gradient(135deg, hsl(${hue},60%,30%) 0%, hsl(${(hue+60)%360},50%,20%) 100%)`;
}

export default async function ShopsPage() {
  const vendors = await getAllVendors();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-ink-900 py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern opacity-10" />
        <div className="container-bee relative text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold text-primary uppercase tracking-widest font-poppins mb-3">
            🏪 Marketplace BEE
          </p>
          <h1 className="font-poppins font-black text-4xl text-white mb-4">
            Toutes les boutiques
          </h1>
          <p className="text-white/50 font-inter">
            {vendors.length} boutique{vendors.length !== 1 ? "s" : ""} vérifiée{vendors.length !== 1 ? "s" : ""} sur BEE
          </p>
        </div>
      </div>

      <div className="container-bee py-10">
        {vendors.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏪</div>
            <h3 className="font-poppins font-bold text-lg text-foreground mb-2">
              Aucune boutique disponible
            </h3>
            <p className="text-muted-foreground font-inter text-sm">
              Revenez bientôt, de nouveaux vendeurs arrivent !
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {vendors.map((vendor) => (
              <Link key={vendor.id} href={`/shop/${vendor.slug}`}
                className="group bg-white rounded-2xl border border-border overflow-hidden hover:border-honey-300 hover:shadow-soft-lg transition-all">

                {/* Banner */}
                <div className="h-28 relative overflow-hidden">
                  {vendor.banner ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={vendor.banner} alt={vendor.shopName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full"
                      style={{ background: shopGradient(vendor.shopName) }} />
                  )}

                  {/* Logo overlay */}
                  <div className="absolute -bottom-6 left-4">
                    {vendor.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={vendor.logo} alt={`Logo ${vendor.shopName}`}
                        className="w-14 h-14 rounded-2xl border-3 border-white shadow-soft object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl border-[3px] border-white shadow-soft bg-honey-gradient flex items-center justify-center">
                        <span className="text-xl">🐝</span>
                      </div>
                    )}
                  </div>

                  {/* Featured badge */}
                  {vendor.isFeatured && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="solid" size="xs">⭐ Vedette</Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="pt-9 px-4 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-poppins font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {vendor.shopName}
                    </h3>
                    {vendor.isVerified && (
                      <BadgeCheck size={16} className="text-blue-500 shrink-0" />
                    )}
                  </div>

                  {/* Description */}
                  {vendor.description && (
                    <p className="text-xs text-muted-foreground font-inter line-clamp-2 leading-relaxed mb-2">
                      {vendor.description}
                    </p>
                  )}

                  {/* Location + rating */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-inter mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-primary shrink-0" />
                      {vendor.city || REGION_LABELS[vendor.region] || vendor.region}
                    </span>
                    {vendor.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={11} className="text-honey-400 fill-honey-400" />
                        <span className="font-semibold text-foreground">{vendor.rating.toFixed(1)}</span>
                        <span>({vendor.totalReviews})</span>
                      </span>
                    )}
                  </div>

                  {/* Sales */}
                  {vendor.totalSales > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-inter mt-1">
                      <ShoppingBag size={10} />
                      <span>{vendor.totalSales} vente{vendor.totalSales > 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
