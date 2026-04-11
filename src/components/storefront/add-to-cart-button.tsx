"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useAuthCart } from "@/components/storefront/use-auth-cart";
import { LoginRequiredModal } from "@/components/storefront/login-required-modal";
import { cn } from "@/lib/utils/cn";

interface Variant {
  id:     string;
  label:  string;
  price:  number;
  stock:  number;
}

interface Product {
  id:          string;
  name:        string;
  slug:        string;
  basePrice:   number;
  images?:     string[];
  stock?:      number;
  variants?:   Variant[];
  vendor?:     { id: string; shopName: string };
  vendorId?:   string;
}

interface Props {
  product:  Product;
  variant?: Variant;
  /** Afficher le sélecteur de quantité */
  showQty?: boolean;
  className?: string;
}

export function AddToCartButton({ product, variant, showQty = false, className }: Props) {
  const [qty,     setQty]     = useState(1);
  const [added,   setAdded]   = useState(false);
  const [loading, setLoading] = useState(false);

  const addItem = useCartStore(s => s.addItem);

  // ✅ Hook auth — affiche LoginRequiredModal si non connecté
  const { requireAuth, showLoginModal, setShowLoginModal } = useAuthCart();

  const maxStock = variant?.stock ?? product.stock ?? 99;
  const price    = variant?.price ?? product.basePrice;
  const outOfStock = maxStock <= 0;

  const doAdd = requireAuth(() => {
    setLoading(true);

    addItem({
      productId:    product.id,
      name:         product.name,
      slug:         product.slug,
      unitPrice:    price,
      image:        product.images?.[0] ?? null,
      vendorId:     product.vendorId ?? product.vendor?.id ?? "",
      variantId:    variant?.id ?? null,
      variantLabel: variant?.label ?? null,
      quantity:     qty,
    });

    setAdded(true);
    setTimeout(() => { setAdded(false); setLoading(false); }, 1500);
  });

  return (
    <>
      {/* ✅ Popup connexion requise */}
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Connectez-vous pour ajouter ce produit à votre panier et passer commande."
      />

      <div className={cn("flex items-center gap-3", className)}>
        {/* Sélecteur quantité */}
        {showQty && (
          <div className="flex items-center gap-2 h-11 px-3 rounded-2xl border border-border bg-cream-50">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white transition-colors disabled:opacity-30">
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-sm font-poppins font-bold text-foreground">
              {qty}
            </span>
            <button
              onClick={() => setQty(q => Math.min(maxStock, q + 1))}
              disabled={qty >= maxStock}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white transition-colors disabled:opacity-30">
              <Plus size={12} />
            </button>
          </div>
        )}

        {/* Bouton ajouter */}
        <button
          onClick={doAdd}
          disabled={outOfStock || loading || added}
          className={cn(
            "flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold font-poppins text-white transition-all disabled:cursor-not-allowed",
            outOfStock
              ? "bg-muted text-muted-foreground"
              : added
                ? "bg-green-500"
                : "hover:opacity-90 active:scale-[0.98]"
          )}
          style={!outOfStock && !added ? { background: "linear-gradient(135deg,#F6861A,#E5750D)" } : {}}>
          {loading && !added && <Loader2 size={15} className="animate-spin" />}
          {added    && <Check size={15} />}
          {!loading && !added && <ShoppingCart size={15} />}
          {outOfStock ? "Rupture de stock" : added ? "Ajouté !" : "Ajouter au panier"}
        </button>
      </div>
    </>
  );
}
