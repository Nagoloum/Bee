"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { authClient } from "@/lib/auth/client";
import { LoginRequiredModal } from "@/components/storefront/login-required-modal";
import { formatPrice, cn } from "@/lib/utils/cn";

export default function CartPage() {
  const items      = useCartStore(s => s.items);
  const removeItem = useCartStore(s => s.removeItem);
  const updateQty  = useCartStore(s => s.updateQuantity);
  const total      = useCartStore(s => s.total?.() ?? items.reduce((a, i) => a + i.unitPrice * i.quantity, 0));

  // ✅ Auth guard
  const [authChecked,   setAuthChecked]   = useState(false);
  const [isLoggedIn,    setIsLoggedIn]    = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    authClient.getSession().then(session => {
      const logged = !!session?.data?.user;
      setIsLoggedIn(logged);
      setAuthChecked(true);
      // ✅ Si pas connecté → ouvrir le popup immédiatement
      if (!logged) setShowLoginModal(true);
    });
  }, []);

  // Loader pendant la vérification
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const itemCount = items.reduce((a, i) => a + i.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* ✅ Popup connexion — s'affiche automatiquement si non connecté */}
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Connectez-vous pour accéder à votre panier et finaliser votre commande."
      />

      <div className="container-bee max-w-3xl py-8">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart size={22} className="text-primary" />
          <h1 className="font-poppins font-black text-2xl text-foreground">
            Mon panier
          </h1>
          {itemCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-poppins bg-primary/10 text-primary">
              {itemCount} article{itemCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Panier vide ── */}
        {items.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="text-6xl">🛒</div>
            <h2 className="font-poppins font-bold text-xl text-foreground">
              Votre panier est vide
            </h2>
            <p className="text-muted-foreground font-inter text-sm">
              Ajoutez des produits depuis le catalogue pour les retrouver ici.
            </p>
            <Link href="/products"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl text-sm font-bold font-poppins text-white"
              style={{ background: "linear-gradient(135deg,#F6861A,#E5750D)" }}>
              Voir le catalogue <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Articles */}
            <div className="md:col-span-2 space-y-3">
              {items.map(item => (
                <div key={`${item.productId}-${item.variantId ?? "default"}`}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-border">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl border border-border bg-cream-50 overflow-hidden shrink-0">
                    {item.image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-poppins font-bold text-sm text-foreground line-clamp-2">
                      {item.name}
                    </p>
                    {item.variantLabel && (
                      <p className="text-xs font-inter text-muted-foreground mt-0.5">
                        {item.variantLabel}
                      </p>
                    )}
                    <p className="font-poppins font-bold text-sm text-primary mt-1">
                      {formatPrice(item.unitPrice)}
                    </p>
                  </div>

                  {/* Qty + supprimer */}
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <button onClick={() => removeItem(item.productId, item.variantId ?? undefined)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={13} />
                    </button>
                    <div className="flex items-center gap-2 h-8 px-2 rounded-xl border border-border">
                      <button
                        onClick={() => item.quantity > 1
                          ? updateQty(item.productId, item.quantity - 1, item.variantId ?? undefined)
                          : removeItem(item.productId, item.variantId ?? undefined)}
                        className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Minus size={11} />
                      </button>
                      <span className="w-5 text-center text-xs font-bold font-poppins text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1, item.variantId ?? undefined)}
                        className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Récap */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-border p-5 space-y-3 sticky top-20">
                <h3 className="font-poppins font-bold text-base text-foreground">Récapitulatif</h3>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={`${item.productId}-${item.variantId}`}
                      className="flex justify-between text-xs font-inter text-muted-foreground">
                      <span className="line-clamp-1 flex-1 mr-2">{item.name} ×{item.quantity}</span>
                      <span className="shrink-0 font-semibold">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="font-poppins font-bold text-sm text-foreground">Total</span>
                  <span className="font-poppins font-black text-lg text-primary">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* ✅ Si non connecté → le bouton checkout ouvre le modal */}
                {isLoggedIn ? (
                  <Link href="/checkout"
                    className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold font-poppins text-white"
                    style={{ background: "linear-gradient(135deg,#F6861A,#E5750D)" }}>
                    Commander <ArrowRight size={15} />
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold font-poppins text-white"
                    style={{ background: "linear-gradient(135deg,#F6861A,#E5750D)" }}>
                    Se connecter pour commander
                  </button>
                )}

                <Link href="/products"
                  className="w-full h-9 rounded-2xl flex items-center justify-center text-xs font-semibold font-poppins border border-border text-muted-foreground hover:bg-cream-50 transition-colors">
                  Continuer mes achats
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
