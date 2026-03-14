import { notFound } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Heart, Star, ChevronRight, Truck, ShieldCheck, RefreshCw, Store, MapPin } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/actions/products";
import { ProductCard } from "@/components/storefront/product-card";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn, formatPrice } from "@/lib/utils/cn";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = product.categoryId
    ? await getRelatedProducts(product.categoryId, params.slug, 4)
    : [];

  const discount = product.comparePrice
    ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
    : 0;

  const images = (product.images as string[]) ?? [];

  return (
    <div className="min-h-screen bg-background">

      {/* Breadcrumb */}
      <div className="border-b border-border bg-white">
        <div className="container-bee py-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-inter">
            <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <ChevronRight size={12} />
            <Link href="/products" className="hover:text-foreground transition-colors">Catalogue</Link>
            <ChevronRight size={12} />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-bee py-8">
        <div className="grid lg:grid-cols-2 gap-10 mb-16">

          {/* ── IMAGES ────────────────────────────────────────────────────────── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="aspect-square rounded-3xl overflow-hidden bg-cream-100 border border-border">
              {images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">🛍️</div>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <div key={i} className={cn(
                    "shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-colors",
                    i === 0 ? "border-primary" : "border-border hover:border-honey-300"
                  )}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── INFO ──────────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Vendor */}
            {product.vendorName && (
              <Link href={`/shop/${product.vendorSlug}`}
                className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                <Store size={14} className="text-muted-foreground" />
                <span className="text-sm font-semibold font-poppins text-muted-foreground hover:text-primary">
                  {product.vendorName}
                </span>
                {product.isVerified && <Badge variant="info" size="xs">✓ Vérifié</Badge>}
              </Link>
            )}

            {/* Name */}
            <h1 className="font-poppins font-black text-2xl md:text-3xl text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16}
                    className={cn(s <= Math.round(product.rating) ? "fill-honey-400 text-honey-400" : "text-muted-foreground/30")}
                    strokeWidth={0} fill="currentColor" />
                ))}
              </div>
              <span className="text-sm font-semibold text-foreground font-inter">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground font-inter">({product.totalReviews} avis)</span>
              <span className="text-sm text-muted-foreground font-inter">· {product.totalSales} vendus</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <p className="font-poppins font-black text-3xl text-foreground">
                {formatPrice(product.basePrice)}
              </p>
              {product.comparePrice && (
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-lg text-muted-foreground line-through font-inter">
                    {formatPrice(product.comparePrice)}
                  </p>
                  <Badge variant="solid" size="md">-{discount}%</Badge>
                </div>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", product.stock > 0 ? "bg-success" : "bg-error")} />
              <span className={cn("text-sm font-inter font-medium", product.stock > 0 ? "text-success-dark" : "text-error")}>
                {product.stock > 0
                  ? product.stock < 10 ? `Plus que ${product.stock} en stock !` : "En stock"
                  : "Rupture de stock"}
              </span>
            </div>

            {/* Short desc */}
            {product.shortDesc && (
              <p className="text-foreground-secondary font-inter text-sm leading-relaxed border-l-2 border-honey-300 pl-4">
                {product.shortDesc}
              </p>
            )}

            {/* Add to cart */}
            <AddToCartButton product={product as any} />

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck,       text:"Livraison rapide",  sub:"1-48h"       },
                { icon: ShieldCheck, text:"Paiement sécurisé", sub:"100% protégé" },
                { icon: RefreshCw,   text:"Retour facile",     sub:"7 jours"     },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} className="flex flex-col items-center text-center p-3 rounded-2xl bg-muted gap-1.5">
                  <Icon size={18} className="text-primary" />
                  <p className="text-xs font-semibold font-poppins text-foreground">{text}</p>
                  <p className="text-xs text-muted-foreground font-inter">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── DESCRIPTION ───────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h2 className="font-poppins font-bold text-xl text-foreground mb-4">Description</h2>
            <div className="prose-bee">
              <p>{product.description}</p>
            </div>
          </div>

          {/* Vendor card */}
          {product.vendorName && (
            <div>
              <h2 className="font-poppins font-bold text-xl text-foreground mb-4">La boutique</h2>
              <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar name={product.vendorName} size="lg" color="random" ring />
                  <div>
                    <p className="font-poppins font-bold text-base text-foreground">{product.vendorName}</p>
                    {product.vendorRegion && (
                      <p className="text-xs text-muted-foreground font-inter flex items-center gap-1 mt-0.5">
                        <MapPin size={11} />{product.vendorRegion}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12}
                        className={cn(s <= Math.round(product.vendorRating ?? 0) ? "fill-honey-400 text-honey-400" : "text-muted-foreground/30")}
                        strokeWidth={0} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold font-inter">{(product.vendorRating ?? 0).toFixed(1)}</span>
                </div>
                <Link href={`/shop/${product.vendorSlug}`}
                  className="flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-secondary text-secondary font-poppins font-semibold text-sm hover:bg-secondary hover:text-white transition-all w-full">
                  <Store size={14} /> Voir la boutique
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── RELATED ───────────────────────────────────────────────────────── */}
        {related.length > 0 && (
          <div>
            <h2 className="font-poppins font-bold text-xl text-foreground mb-6">Produits similaires</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p as any} size="sm" />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
