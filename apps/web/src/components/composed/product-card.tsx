'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Price } from '@/components/composed/price';
import { ShopTierBadge, type ShopTier } from '@/components/composed/tier-badge';

export interface ProductCardData {
  slug: string;
  name: string;
  imageUrl: string;
  imageAlt?: string;
  priceXaf: number;
  comparedAtXaf?: number;
  cashbackXaf?: number;
  shopName?: string;
  shopTier?: ShopTier;
  rating?: number;
  reviewsCount?: number;
  badge?: { label: string; tone?: 'primary' | 'secondary' | 'error' };
  inStock?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  /** URL des détails. Défaut : `/products/{slug}`. */
  href?: string;
  onAddToCart?: (product: ProductCardData) => void;
  onToggleFavorite?: (product: ProductCardData) => void;
  isFavorite?: boolean;
  loading?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  href,
  className,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  loading,
}: ProductCardProps) {
  const {
    slug,
    name,
    imageUrl,
    imageAlt,
    priceXaf,
    comparedAtXaf,
    cashbackXaf,
    shopName,
    shopTier,
    rating,
    reviewsCount,
    badge,
    inStock = true,
  } = product;

  const detailsHref = href ?? `/products/${slug}`;
  const favoriteDisabled = !inStock;

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (favoriteDisabled || !onToggleFavorite) return;
    onToggleFavorite(product);
  };

  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onAddToCart || !inStock || loading) return;
    onAddToCart(product);
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm',
        'cursor-pointer transition-shadow focus-within:ring-2 focus-within:ring-primary-500/40 hover:shadow-md',
        !inStock && 'cursor-default',
        className,
      )}
    >
      {/* Stretched link : couvre toute la card. Reste sous les boutons (z-0). */}
      <Link
        href={detailsHref}
        aria-label={`Voir les détails de ${name}`}
        className="absolute inset-0 z-0 focus:outline-none"
      />

      <div className="relative aspect-square w-full overflow-hidden bg-surface-muted">
        <Image
          src={imageUrl}
          alt={imageAlt ?? name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />
        {badge && (
          <Badge variant={badge.tone ?? 'primary'} className="absolute left-2 top-2 shadow-sm">
            {badge.label}
          </Badge>
        )}
        {!inStock && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-md bg-error px-3 py-1 text-xs font-semibold text-white">
              Rupture
            </span>
          </div>
        )}
        {onToggleFavorite && (
          <button
            type="button"
            aria-label={
              favoriteDisabled
                ? 'Favori indisponible (rupture de stock)'
                : isFavorite
                  ? 'Retirer des favoris'
                  : 'Ajouter aux favoris'
            }
            aria-pressed={isFavorite}
            disabled={favoriteDisabled}
            onClick={handleFavoriteClick}
            className={cn(
              'absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-text-secondary backdrop-blur transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
              !favoriteDisabled && 'hover:text-error',
              favoriteDisabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <Heart
              className={cn(
                'size-4',
                isFavorite && !favoriteDisabled && 'fill-error text-error',
              )}
            />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          {shopTier && <ShopTierBadge tier={shopTier} />}
          {shopName && <span className="truncate">{shopName}</span>}
        </div>

        <h3 className="line-clamp-2 font-medium text-text">{name}</h3>

        {typeof rating === 'number' && (
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <span className="text-warning">★</span>
            <span className="font-medium text-text">{rating.toFixed(1)}</span>
            {reviewsCount != null && <span>({reviewsCount})</span>}
          </div>
        )}

        <Price
          amountXaf={priceXaf}
          comparedAtXaf={comparedAtXaf}
          cashbackXaf={cashbackXaf}
          size="md"
          className="mt-auto"
        />

        {onAddToCart && (
          <Button
            size="sm"
            className="relative z-10 mt-2 w-full"
            disabled={!inStock || loading}
            loading={loading}
            onClick={handleAddToCartClick}
            leftIcon={<ShoppingCart />}
          >
            {inStock ? 'Ajouter' : 'Indisponible'}
          </Button>
        )}
      </div>
    </div>
  );
}
