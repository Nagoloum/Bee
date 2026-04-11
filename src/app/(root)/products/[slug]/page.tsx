import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Star, ShieldCheck, Truck, Package } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/actions/products";
// ✅ PATCH — session + avis
import { getServerSession } from "@/lib/auth/helpers";
import { ReviewsSection } from "@/components/storefront/reviews-section";
import { ProductCard } from "@/components/storefront/product-card";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils/cn";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title:       `${product.name} — BEE Marketplace`,
    description: product.description?.slice(0, 155),
    openGraph:   { images: [product.images?.[0]] },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  // ✅ PATCH — session en parallèle
  const [product, session, related] = await Promise.all([
    getProductBySlug(params.slug),
    getServerSession(),
    getRelatedProducts(params.slug, 4).catch(() => []),
  ]);

  if (!product) notFound();

  const images     = product.images ?? [];
  const mainImage  = images[0] ?? "/placeholder-product.jpg";
  const discount   = product.comparePrice && product.comparePrice > product.basePrice
    ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
    : null;

  return (
    <div className="min-h-screen bg-background">

      {/* Breadcrumb */}
      <div className="container-bee py-3">
        <nav className="flex items-center gap-1.5 text-xs font-inter text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Accueil</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-foreground">Produits</Link>
          <ChevronRight size={12} />
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>
      </div>

      {/* Produit */}
      <section className="container-bee pb-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square rounded-3xl overflow-hidden border border-border bg-cream-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mainImage} alt={product.name}
                className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.slice(0, 5).map((img: string, i: number) => (
                  <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-border flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`${product.name} ${i+1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            {product.category && (
              <Badge variant="outline" size="sm">{product.category.name}</Badge>
            )}

            <div>
              <h1 className="font-poppins font-black text-2xl md:text-3xl text-foreground leading-tight">
                {product.name}
              </h1>
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14}
                        className={s <= Math.round(product.rating) ? "text-honey-400" : "text-cream-300"}
                        fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-sm font-inter text-muted-foreground">
                    {product.rating.toFixed(1)} ({product.totalReviews} avis)
                  </span>
                </div>
              )}
            </div>

            {/* Prix */}
            <div className="flex items-baseline gap-3">
              <span className="font-poppins font-black text-3xl text-primary">
                {formatPrice(product.basePrice)}
              </span>
              {product.comparePrice && (
                <span className="font-inter text-lg text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
              {discount && (
                <Badge variant="default" className="bg-red-500 text-white border-0">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Stock */}
            <p className={cn(
              "text-sm font-inter font-semibold",
              (product.stock ?? 0) > 5 ? "text-success-dark" :
              (product.stock ?? 0) > 0 ? "text-amber-600" : "text-red-600"
            )}>
              {(product.stock ?? 0) > 5 ? `✓ En stock (${product.stock} disponibles)` :
               (product.stock ?? 0) > 0 ? `⚠️ Plus que ${product.stock} en stock !` : "✗ Rupture de stock"}
            </p>

            {/* Description courte */}
            {product.description && (
              <p className="text-sm font-inter text-foreground-secondary leading-relaxed">
                {product.description.slice(0, 200)}{product.description.length > 200 ? "…" : ""}
              </p>
            )}

            {/* CTA */}
            <div className="space-y-3">
              <AddToCartButton product={product} />
            </div>

            {/* Trust */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck,       text: "Livraison rapide" },
                { icon: ShieldCheck, text: "Paiement sécurisé" },
                { icon: Package,     text: "Retour sous 7j" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-cream-50 text-center">
                  <Icon size={16} className="text-primary" />
                  <span className="text-[10px] font-poppins font-semibold text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            {/* Vendeur */}
            {product.vendor && (
              <Link href={`/shops/${product.vendor.slug}`}
                className="flex items-center gap-3 p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-cream-50 transition-all">
                <Avatar name={product.vendor.shopName} size="md" color="honey" />
                <div>
                  <p className="font-poppins font-semibold text-sm text-foreground">{product.vendor.shopName}</p>
                  <p className="text-xs font-inter text-muted-foreground">Voir la boutique →</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ✅ PATCH — Section avis */}
      <section className="border-t border-border">
        <div className="container-bee py-10">
          <ReviewsSection
            targetId={product.id}
            targetType="PRODUCT"
            isLoggedIn={!!session}
            avgRating={product.rating ?? 0}
            totalReviews={product.totalReviews ?? 0}
          />
        </div>
      </section>

      {/* Produits similaires */}
      {related.length > 0 && (
        <section className="bg-cream-100">
          <div className="container-bee py-10">
            <h2 className="font-poppins font-black text-xl text-foreground mb-6">
              Vous aimerez aussi
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
