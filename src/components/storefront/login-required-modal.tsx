"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LogIn, X, ShoppingCart } from "lucide-react";

interface Props {
  open:     boolean;
  onClose:  () => void;
  /** Message contextuel affiché sous le titre */
  message?: string;
}

/**
 * Popup "Connexion requise" — affiché quand un visiteur non connecté
 * essaie d'ajouter au panier ou d'accéder à /cart.
 *
 * Usage :
 *   const [showLogin, setShowLogin] = useState(false);
 *   <LoginRequiredModal open={showLogin} onClose={() => setShowLogin(false)} />
 */
export function LoginRequiredModal({ open, onClose, message }: Props) {
  // Bloquer le scroll quand ouvert
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else      document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-3xl p-7 bg-white shadow-2xl flex flex-col items-center gap-4 text-center"
        onClick={e => e.stopPropagation()}>

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-cream-100 hover:bg-cream-200 transition-colors text-muted-foreground">
          <X size={15} />
        </button>

        {/* Icône */}
        <div className="w-16 h-16 rounded-2xl bg-honey-50 flex items-center justify-center">
          <ShoppingCart size={28} className="text-primary" />
        </div>

        {/* Texte */}
        <div>
          <h2 className="font-poppins font-black text-xl text-foreground">
            Connexion requise
          </h2>
          <p className="text-sm font-inter text-muted-foreground mt-2 leading-relaxed">
            {message ?? "Connectez-vous pour ajouter des produits à votre panier et passer commande."}
          </p>
        </div>

        {/* Boutons */}
        <div className="flex flex-col w-full gap-3 mt-1">
          <Link
            href="/sign-in"
            className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold font-poppins text-white transition-all"
            style={{ background: "linear-gradient(135deg,#F6861A,#E5750D)" }}>
            <LogIn size={16} />
            Se connecter
          </Link>
          <Link
            href="/sign-up"
            className="w-full h-12 rounded-2xl flex items-center justify-center text-sm font-semibold font-poppins border border-border text-foreground hover:bg-cream-50 transition-colors">
            Créer un compte gratuitement
          </Link>
          <button
            onClick={onClose}
            className="text-xs font-inter text-muted-foreground hover:text-foreground transition-colors">
            Continuer sans me connecter
          </button>
        </div>
      </div>
    </div>
  );
}
