"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, Star, Zap } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";

export interface ProductCardData {
  id:           string;
  name:         string;
  slug:         string;
  images:       string[];
  basePrice:    number;
  comparePrice?: number | null;
  rating:       number;
  totalReviews: number;
  totalSales?:  number;
  stock:        number;
  vendorName?:  string | null;
  vendorSlug?:  string | null;
  isFeatured?:  boolean;
  isFlash?:     boolean;
  flashDiscount?: number;
}

interface ProductCardProps {
  product:   ProductCardData;
  className?: string;
  size?:     "sm" | "md";
}

export function ProductCard({ product, className, size = "md" }: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const discount = product.comparePrice
    ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
    : product.flashDiscount ?? 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    setAdding(true);
    addItem({
      productId:   product.id,
      name:        product.name,
      image:       product.images[0],
      price:       product.basePrice,
      quantity:    1,
      vendorId:    "",
      vendorName:  product.vendorName ?? "",
      stock:       product.stock,
    });
    setTimeout(() => setAdding(false), 600);
  };

  const imgHeight = size === "sm" ? "h-40" : "h-52";

  return (
    <Link href={`/products/${product.slug}`} className={cn("group block", className)}>
      <div className={cn(
        "bg-white rounded-2xl border border-border overflow-hidden",
        "transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-soft-lg hover:border-honey-200",
        "shadow-soft"
      )}>
        {/* Image */}
        <div className={cn("relative overflow-hidden bg-cream-100", imgHeight)}>
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-20">🛍️</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {product.isFlash && (
              <Badge variant="solid" size="xs" className="bg-red-500 flex items-center gap-1">
                <Zap size={10} /> Flash -{discount}%
              </Badge>
            )}
            {!product.isFlash && discount > 0 && (
              <Badge variant="solid" size="xs">-{discount}%</Badge>
            )}
            {product.isFeatured && !discount && (
              <Badge variant="info" size="xs">Vedette</Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="muted" size="xs">Rupture</Badge>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
            className={cn(
              "absolute top-2.5 right-2.5",
              "w-8 h-8 rounded-xl flex items-center justify-center",
              "transition-all duration-200",
              liked
                ? "bg-red-50 text-red-500"
                : "bg-white/80 text-muted-foreground hover:bg-white hover:text-red-400"
            )}
          >
            <Heart size={15} className={cn(liked && "fill-current")} />
          </button>
        </div>

        {/* Info */}
        <div className="p-3.5">
          {/* Vendor */}
          {product.vendorName && (
            <p className="text-xs text-muted-foreground font-inter mb-1 truncate">
              {product.vendorName}
            </p>
          )}

          {/* Name */}
          <p className="font-poppins font-semibold text-sm text-foreground line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
            {product.name}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star
                  key={s}
                  size={11}
                  className={cn(
                    s <= Math.round(product.rating)
                      ? "fill-honey-400 text-honey-400"
                      : "text-muted-foreground/30"
                  )}
                  strokeWidth={0}
                  fill="currentColor"
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-inter">
              ({product.totalReviews})
            </span>
          </div>

          {/* Price + Add */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-poppins font-bold text-base text-foreground leading-none">
                {formatPrice(product.basePrice)}
              </p>
              {product.comparePrice && (
                <p className="text-xs text-muted-foreground line-through font-inter mt-0.5">
                  {formatPrice(product.comparePrice)}
                </p>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={cn(
                "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center",
                "transition-all duration-200 font-poppins",
                product.stock === 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : adding
                  ? "bg-success text-white scale-90"
                  : "bg-primary text-white hover:bg-primary-hover hover:shadow-honey active:scale-95"
              )}
            >
              {adding ? "✓" : <ShoppingCart size={15} />}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function ProductCardSkeleton({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-soft">
      <div className={cn("bg-muted animate-pulse", size === "sm" ? "h-40" : "h-52")} />
      <div className="p-3.5 space-y-2">
        <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
        <div className="h-4 bg-muted rounded animate-pulse w-4/5" />
        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-muted rounded animate-pulse w-1/3" />
          <div className="h-9 w-9 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
