"use client";

import { useState, useCallback } from "react";
import { authClient } from "@/lib/auth/client";

/**
 * Hook useAuthCart
 *
 * Vérifie si l'utilisateur est connecté AVANT d'exécuter une action panier.
 * Si non connecté → affiche le popup LoginRequiredModal.
 *
 * Usage dans AddToCartButton, CartPage, etc. :
 *
 *   const { requireAuth, showLoginModal, setShowLoginModal } = useAuthCart();
 *
 *   const handleAddToCart = requireAuth(() => {
 *     cartStore.addItem(product);
 *     toast.success("Ajouté au panier !");
 *   });
 */
export function useAuthCart() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const requireAuth = useCallback(
    (action: (...args: any[]) => void) =>
      async (...args: any[]) => {
        // Vérifier la session côté client
        const session = await authClient.getSession();
        if (!session?.data?.user) {
          setShowLoginModal(true);
          return;
        }
        action(...args);
      },
    []
  );

  return { requireAuth, showLoginModal, setShowLoginModal };
}
