import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Commande confirmée — BEE" };

interface Props {
  searchParams: { orderId?: string };
}

export default function CheckoutSuccessPage({ searchParams }: Props) {
  const { orderId } = searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-success/10 border-4 border-success/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={36} className="text-success" />
        </div>

        <h1 className="font-poppins font-black text-3xl text-foreground mb-3">
          Commande confirmée ! 🎉
        </h1>
        <p className="text-muted-foreground font-inter leading-relaxed mb-2">
          Votre commande a bien été reçue et le paiement traité avec succès.
          Le vendeur va confirmer votre commande sous peu.
        </p>
        {orderId && (
          <p className="text-xs text-muted-foreground font-inter mb-8">
            Référence : <span className="font-mono font-semibold text-foreground">{orderId}</span>
          </p>
        )}

        {/* Steps */}
        <div className="bg-cream-100 rounded-2xl p-5 mb-8 text-left space-y-3">
          {[
            { icon:"📬", step:"Confirmation vendeur",  sub:"Vous recevrez un email dès acceptation" },
            { icon:"📦", step:"Préparation",            sub:"Le vendeur prépare votre commande"       },
            { icon:"🛵", step:"Livraison",              sub:"Un livreur BEE prend en charge"          },
            { icon:"🎁", step:"Réception",              sub:"À votre porte en 24h"                    },
          ].map(({ icon, step, sub }) => (
            <div key={step} className="flex items-start gap-3">
              <span className="text-xl shrink-0">{icon}</span>
              <div>
                <p className="font-poppins font-semibold text-sm text-foreground">{step}</p>
                <p className="text-xs text-muted-foreground font-inter">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {orderId && (
            <Button asChild leftIcon={<Package size={16} />}>
              <Link href={`/orders/${orderId}`}>Suivre ma commande</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/products" className="flex items-center justify-center gap-2">
              Continuer mes achats <ArrowRight size={15} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
