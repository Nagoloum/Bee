"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils/cn";

interface Props {
  open:     boolean;
  onClose:  () => void;
}

export function CartDrawer({ open, onClose }: Props) {
  const items      = useCartStore(s => s.items);
  const removeItem = useCartStore(s => s.removeItem);
  const updateQty  = useCartStore(s => s.updateQty);
  const getSubtotal= useCartStore(s => s.getSubtotal);
  const getTotal   = useCartStore(s => s.getTotal);
  const couponDiscount = useCartStore(s => s.couponDiscount);
  const clearCart  = useCartStore(s => s.clearCart);

  const subtotal = getSubtotal();
  const total    = getTotal();
  const DELIVERY_FEE = 500;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col",
        "shadow-2xl transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-foreground" />
            <h2 className="font-poppins font-bold text-lg text-foreground">Mon panier</h2>
            {items.length > 0 && (
              <Badge variant="solid" size="sm">{items.length}</Badge>
            )}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-10">
              <div className="text-5xl mb-4">🛒</div>
              <h3 className="font-poppins font-bold text-lg text-foreground mb-2">Votre panier est vide</h3>
              <p className="text-sm text-muted-foreground font-inter mb-6">
                Découvrez nos produits et commencez vos achats
              </p>
              <Button asChild onClick={onClose}>
                <Link href="/products">Explorer les produits</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`}
                className="flex gap-3 p-3 bg-muted/40 rounded-2xl">
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl opacity-20">📦</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-poppins font-semibold text-sm text-foreground truncate mb-0.5">
                    {item.name}
                  </p>
                  {item.variantLabel && (
                    <p className="text-xs text-muted-foreground font-inter mb-1">{item.variantLabel}</p>
                  )}
                  <p className="text-xs text-muted-foreground font-inter mb-2">{item.vendorName}</p>

                  <div className="flex items-center justify-between">
                    {/* Qty controls */}
                    <div className="flex items-center gap-1 bg-white border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold font-poppins text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40">
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="font-poppins font-bold text-sm text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-error transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — totals + CTA */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-border px-5 py-4 space-y-3 bg-white">
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-inter">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm font-inter">
                  <span className="text-success-dark">Coupon appliqué</span>
                  <span className="text-success-dark font-semibold">-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-inter">
                <span className="text-muted-foreground">Livraison estimée</span>
                <span className="font-semibold text-foreground">{formatPrice(DELIVERY_FEE)}</span>
              </div>
              <div className="flex justify-between font-poppins font-black border-t border-border pt-2">
                <span className="text-foreground">Total</span>
                <span className="text-primary text-lg">{formatPrice(total + DELIVERY_FEE)}</span>
              </div>
            </div>

            <Button fullWidth asChild onClick={onClose}>
              <Link href="/checkout" className="flex items-center justify-center gap-2">
                Passer la commande <ArrowRight size={16} />
              </Link>
            </Button>

            <button
              onClick={() => { clearCart(); }}
              className="w-full text-xs text-muted-foreground hover:text-error transition-colors font-inter text-center py-1">
              Vider le panier
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Cart Icon Button (for navbar) ────────────────────────────────────────────

export function CartIconButton({ onClick }: { onClick: () => void }) {
  const count = useCartStore(s => s.getCount());

  return (
    <button onClick={onClick}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-colors"
      aria-label="Panier">
      <ShoppingCart size={20} className="text-foreground" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold font-poppins flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
