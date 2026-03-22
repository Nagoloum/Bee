"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Tag, X, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/cn";

const DELIVERY_FEE = 500;

export default function CartPage() {
  const [mounted, setMounted]           = useState(false);
  const [couponInput, setCouponInput]   = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError]   = useState("");

  const items          = useCartStore(s => s.items);
  const updateQty      = useCartStore(s => s.updateQty);
  const removeItem     = useCartStore(s => s.removeItem);
  const clearCart      = useCartStore(s => s.clearCart);
  const getSubtotal    = useCartStore(s => s.getSubtotal);
  const getTotal       = useCartStore(s => s.getTotal);
  const applyCoupon    = useCartStore(s => s.applyCoupon);
  const removeCoupon   = useCartStore(s => s.removeCoupon);
  const couponCode     = useCartStore(s => s.couponCode);
  const couponDiscount = useCartStore(s => s.couponDiscount);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const total    = getTotal();

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true); setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error ?? "Coupon invalide."); return; }
      applyCoupon(data.code, data.discount);
      setCouponInput("");
    } catch { setCouponError("Erreur réseau."); }
    finally { setCouponLoading(false); }
  };

  /* ── Panier vide ──────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-muted-foreground/40" />
        </div>
        <h1 className="font-poppins font-black text-2xl text-foreground mb-3">
          Votre panier est vide
        </h1>
        <p className="text-muted-foreground font-inter max-w-sm mb-8 leading-relaxed">
          Vous n'avez encore rien ajouté à votre panier.
          Explorez nos produits et faites vos emplettes !
        </p>
        <Button asChild size="lg" leftIcon={<ArrowRight size={16} />}>
          <Link href="/products">Découvrir les produits</Link>
        </Button>
      </div>
    );
  }

  /* ── Panier avec articles ─────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="container-bee py-5">
          <div className="flex items-center gap-4">
            <Link href="/products"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-inter">
              <ArrowLeft size={15} /> Continuer mes achats
            </Link>
            <span className="text-border">|</span>
            <h1 className="font-poppins font-black text-xl text-foreground">
              Mon panier
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({items.length} article{items.length > 1 ? "s" : ""})
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div className="container-bee py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Liste des articles ── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`}
                className="bg-white rounded-2xl border border-border p-4 sm:p-5 flex gap-4">

                {/* Image */}
                <Link href={`/products/${item.productId}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                  {item.image
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">📦</div>
                  }
                </Link>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <Link href={`/products/${item.productId}`}
                        className="font-poppins font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-2 block">
                        {item.name}
                      </Link>
                      {item.variantLabel && (
                        <Badge variant="muted" size="xs" className="mt-1">{item.variantLabel}</Badge>
                      )}
                      <p className="text-xs text-muted-foreground font-inter mt-0.5">
                        Par <span className="font-medium text-foreground">{item.vendorName}</span>
                      </p>
                    </div>
                    <button onClick={() => removeItem(item.productId, item.variantId)}
                      className="shrink-0 p-1.5 text-muted-foreground hover:text-error hover:bg-error/5 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    {/* Contrôle quantité */}
                    <div className="flex items-center rounded-xl border border-border overflow-hidden bg-white">
                      <button onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="w-9 h-9 flex items-center justify-center text-sm font-bold font-poppins text-foreground border-x border-border">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Prix */}
                    <div className="text-right">
                      <p className="font-poppins font-black text-base text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground font-inter">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Vider le panier */}
            <button onClick={clearCart}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-error transition-colors font-inter px-1">
              <Trash2 size={12} /> Vider le panier
            </button>
          </div>

          {/* ── Résumé commande ── */}
          <div className="space-y-4">

            {/* Code promo */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <p className="font-poppins font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <Tag size={15} className="text-primary" /> Code promo
              </p>
              {couponCode ? (
                <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-xl px-3 py-2.5">
                  <div>
                    <span className="text-xs font-bold font-poppins text-success-dark uppercase tracking-wider">
                      {couponCode}
                    </span>
                    <p className="text-xs text-success-dark font-inter mt-0.5">
                      -{formatPrice(couponDiscount)} de réduction
                    </p>
                  </div>
                  <button onClick={removeCoupon}
                    className="text-muted-foreground hover:text-error transition-colors p-1">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {couponError && (
                    <Alert variant="error" className="text-xs" onClose={() => setCouponError("")}>
                      {couponError}
                    </Alert>
                  )}
                  <div className="flex gap-2">
                    <Input
                      label="Code promo"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      containerClassName="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={couponLoading}
                      onClick={handleApplyCoupon}
                      className="self-end h-11 shrink-0"
                    >
                      OK
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Récapitulatif */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <p className="font-poppins font-semibold text-sm text-foreground mb-1">Récapitulatif</p>

              <div className="space-y-2 text-sm font-inter">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Sous-total ({items.length} article{items.length > 1 ? "s" : ""})
                  </span>
                  <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-success-dark">
                    <span>Réduction coupon</span>
                    <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frais de livraison</span>
                  <span className="font-semibold text-foreground">{formatPrice(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between font-poppins font-black text-base border-t border-border pt-2 mt-1">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">{formatPrice(total + DELIVERY_FEE)}</span>
                </div>
              </div>

              <Button fullWidth size="lg" asChild rightIcon={<ArrowRight size={16} />}>
                <Link href="/checkout">Passer la commande</Link>
              </Button>

              <Link href="/products"
                className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors font-inter py-1">
                ← Continuer mes achats
              </Link>

              <div className="pt-1 space-y-1.5 border-t border-border">
                {[
                  { emoji: "🔒", text: "Paiement sécurisé Stripe" },
                  { emoji: "📦", text: "Livraison en 24h à Yaoundé & Douala" },
                  { emoji: "↩️", text: "Retour facile sous 7 jours" },
                ].map(({ emoji, text }) => (
                  <p key={text} className="flex items-center gap-2 text-xs text-muted-foreground font-inter">
                    <span>{emoji}</span> {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
