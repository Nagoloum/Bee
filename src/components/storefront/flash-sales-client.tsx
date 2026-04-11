"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Clock, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { formatPrice, cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

interface Sale {
  id: string; productId: string;
  discountPercent: number; originalPrice: number; flashPrice: number;
  stock: number; sold: number; endAt: string;
  productName: string; productSlug: string; productImages: string[];
  vendorName: string; vendorSlug: string;
}

function Countdown({ endAt }: { endAt: string }) {
  const calc = () => {
    const diff = Math.max(0, new Date(endAt).getTime() - Date.now());
    const h    = Math.floor(diff / 3600000);
    const m    = Math.floor((diff % 3600000) / 60000);
    const s    = Math.floor((diff % 60000)   / 1000);
    return { h, m, s, done: diff === 0 };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [endAt]);

  if (time.done) return <span className="text-error text-xs font-inter">Terminée</span>;

  return (
    <div className="flex items-center gap-1 text-sm font-mono font-bold">
      {[
        { v: time.h, u: "h"  },
        { v: time.m, u: "min"},
        { v: time.s, u: "s"  },
      ].map(({ v, u }, i) => (
        <span key={u} className="flex items-center gap-0.5">
          {i > 0 && <span className="text-muted-foreground font-normal text-xs">:</span>}
          <span className="bg-secondary text-white px-1.5 py-0.5 rounded-md text-xs">
            {String(v).padStart(2, "0")}
          </span>
          <span className="text-muted-foreground text-[10px] font-inter font-normal">{u}</span>
        </span>
      ))}
    </div>
  );
}

export function FlashSalesClient({ sales }: { sales: Sale[] }) {
  const addItem = useCartStore(s => s.addItem);
  const [added, setAdded] = useState<string | null>(null);

  const handleAdd = (sale: Sale) => {
    const remaining = sale.stock - sale.sold;
    if (remaining <= 0) return;
    addItem({
      productId:  sale.productId,
      name:       sale.productName,
      image:      (sale.productImages as string[])[0],
      price:      sale.flashPrice,
      quantity:   1,
      vendorId:   "",
      vendorName: sale.vendorName,
      stock:      remaining,
    });
    setAdded(sale.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {sales.map(sale => {
        const remaining   = sale.stock - sale.sold;
        const soldPercent = Math.round((sale.sold / sale.stock) * 100);
        const images      = sale.productImages as string[];

        return (
          <div key={sale.id}
            className="bg-white rounded-2xl border border-border overflow-hidden hover:border-red-300 hover:shadow-soft-lg transition-all group">
            {/* Image */}
            <Link href={`/products/${sale.productSlug}`} className="block relative">
              <div className="aspect-square overflow-hidden bg-cream-100">
                {images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={images[0]} alt={sale.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">📦</div>
                )}
              </div>
              {/* Discount badge */}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-500 text-white text-xs font-bold font-poppins">
                  <Zap size={11} className="fill-white" /> -{sale.discountPercent}%
                </span>
              </div>
              {remaining <= 3 && remaining > 0 && (
                <div className="absolute top-3 right-3">
                  <Badge variant="warning" size="xs">⚡ Plus que {remaining}</Badge>
                </div>
              )}
            </Link>

            <div className="p-4">
              {/* Product name */}
              <Link href={`/products/${sale.productSlug}`}
                className="font-poppins font-semibold text-sm text-foreground line-clamp-2 leading-snug mb-1 hover:text-primary transition-colors block">
                {sale.productName}
              </Link>
              <p className="text-xs text-muted-foreground font-inter mb-3">
                par {sale.vendorName}
              </p>

              {/* Price */}
              <div className="flex items-end gap-2 mb-3">
                <p className="font-poppins font-black text-lg text-red-500">
                  {formatPrice(sale.flashPrice)}
                </p>
                <p className="text-sm text-muted-foreground line-through font-inter mb-0.5">
                  {formatPrice(sale.originalPrice)}
                </p>
              </div>

              {/* Stock bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs font-inter text-muted-foreground mb-1">
                  <span>{sale.sold} vendus</span>
                  <span>{remaining} restants</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all",
                      soldPercent >= 80 ? "bg-red-500" :
                      soldPercent >= 50 ? "bg-warning"  : "bg-success")}
                    style={{ width: `${soldPercent}%` }}
                  />
                </div>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 mb-3">
                <Clock size={12} className="text-muted-foreground shrink-0" />
                <Countdown endAt={sale.endAt} />
              </div>

              {/* Add to cart */}
              <button
                onClick={() => handleAdd(sale)}
                disabled={remaining === 0}
                className={cn(
                  "w-full h-10 rounded-xl text-sm font-bold font-poppins flex items-center justify-center gap-2 transition-all",
                  remaining === 0
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : added === sale.id
                    ? "bg-success text-white"
                    : "bg-red-500 text-white hover:bg-red-600"
                )}>
                {remaining === 0
                  ? "Épuisé"
                  : added === sale.id
                  ? "✓ Ajouté !"
                  : <><ShoppingCart size={15} /> Ajouter au panier</>
                }
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
