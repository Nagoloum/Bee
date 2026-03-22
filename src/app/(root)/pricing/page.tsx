import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils/cn";

export const metadata = { title: "Nos tarifs & tarifs — BEE" };

const VENDOR_PLANS = [
  {
    key:"Start", emoji:"🐝", price:0, tag:null,
    desc:"Idéal pour débuter votre activité en ligne.",
    features:[
      { text:"10 produits maximum",         ok:true  },
      { text:"2 photos par produit",         ok:true  },
      { text:"Page boutique publique",       ok:true  },
      { text:"Commissions standard",         ok:true  },
      { text:"Flash sales",                  ok:false },
      { text:"Coupons promotionnels",        ok:false },
      { text:"Statistiques avancées",        ok:false },
      { text:"Support prioritaire",          ok:false },
      { text:"Boost de visibilité",          ok:false },
      { text:"Offres de recrutement",        ok:false },
    ],
  },
  {
    key:"Pro", emoji:"⭐", price:5000, tag:"Populaire",
    desc:"Pour les vendeurs qui veulent scaler leur activité.",
    features:[
      { text:"100 produits maximum",         ok:true  },
      { text:"5 photos par produit",         ok:true  },
      { text:"Page boutique publique",       ok:true  },
      { text:"Commissions standard",         ok:true  },
      { text:"2 flash sales par jour",       ok:true  },
      { text:"5 coupons (-15% max)",         ok:true  },
      { text:"Statistiques avancées",        ok:true  },
      { text:"Support prioritaire",          ok:false },
      { text:"Boost de visibilité",          ok:false },
      { text:"Offres de recrutement",        ok:false },
    ],
  },
  {
    key:"Elite", emoji:"👑", price:15000, tag:"Meilleur",
    desc:"Pour les boutiques ambitieuses qui veulent dominer.",
    features:[
      { text:"Produits illimités",           ok:true  },
      { text:"10 photos par produit",        ok:true  },
      { text:"Page boutique publique",       ok:true  },
      { text:"Commissions réduites",         ok:true  },
      { text:"5 flash sales par jour",       ok:true  },
      { text:"20 coupons (-20% max)",        ok:true  },
      { text:"Statistiques avancées",        ok:true  },
      { text:"Support prioritaire 24/7",     ok:true  },
      { text:"Boost de visibilité garanti",  ok:true  },
      { text:"Offres de recrutement",        ok:true  },
    ],
  },
];

const DELIVERY_PLANS = [
  {
    key:"Freelance", emoji:"🛵", price:0, tag:null,
    desc:"Livrez quand vous voulez, sans engagement.",
    features:[
      { text:"500 FCFA par livraison",       ok:true  },
      { text:"Accès toutes les commandes",   ok:true  },
      { text:"Badge Fiable (50 livraisons)", ok:true  },
      { text:"Commandes prioritaires",       ok:false },
      { text:"Bonus de performance",         ok:false },
      { text:"Statistiques revenus",         ok:false },
      { text:"Support dédié",                ok:false },
    ],
  },
  {
    key:"Premium", emoji:"🏆", price:3000, tag:"Recommandé",
    desc:"Maximisez vos revenus avec plus de commandes.",
    features:[
      { text:"500 FCFA par livraison",       ok:true  },
      { text:"Accès toutes les commandes",   ok:true  },
      { text:"Badge Fiable (50 livraisons)", ok:true  },
      { text:"Commandes prioritaires",       ok:true  },
      { text:"Bonus de performance",         ok:true  },
      { text:"Statistiques revenus",         ok:true  },
      { text:"Support dédié",                ok:true  },
    ],
  },
];

function PlanCard({
  plan, cta, ctaHref, popular,
}: { plan: typeof VENDOR_PLANS[0]; cta: string; ctaHref: string; popular?: boolean }) {
  return (
    <div className={cn(
      "relative bg-white rounded-3xl border-2 p-7 flex flex-col",
      popular ? "border-primary shadow-honey" : "border-border hover:border-honey-300 transition-colors"
    )}>
      {plan.tag && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className={cn("px-3 py-1 rounded-full text-xs font-bold font-poppins",
            popular ? "bg-primary text-white" : "bg-secondary text-white")}>
            {plan.tag}
          </span>
        </div>
      )}
      <div className="text-3xl mb-3">{plan.emoji}</div>
      <h3 className="font-poppins font-black text-xl text-foreground mb-1">Plan {plan.key}</h3>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="font-poppins font-black text-3xl text-foreground">
          {plan.price === 0 ? "Gratuit" : formatPrice(plan.price)}
        </span>
        {plan.price > 0 && <span className="text-muted-foreground font-inter text-sm">/mois</span>}
      </div>
      <p className="text-sm text-muted-foreground font-inter mb-5 leading-relaxed">{plan.desc}</p>
      <ul className="space-y-2.5 mb-7 flex-1">
        {plan.features.map(({ text, ok }) => (
          <li key={text} className="flex items-center gap-2.5 text-sm font-inter">
            {ok ? <Check size={14} className="text-success shrink-0" /> : <X size={14} className="text-muted-foreground/40 shrink-0" />}
            <span className={ok ? "text-foreground" : "text-muted-foreground/50 line-through"}>{text}</span>
          </li>
        ))}
      </ul>
      <Link href={ctaHref}
        className={cn("flex items-center justify-center gap-2 h-11 rounded-2xl font-poppins font-bold text-sm transition-all",
          popular
            ? "bg-primary text-white shadow-honey hover:bg-primary-hover hover:shadow-honey-lg"
            : "border-2 border-foreground text-foreground hover:bg-foreground hover:text-white"
        )}>
        {cta} <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export default function OffresPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-ink-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern opacity-10" />
        <div className="container-bee relative text-center max-w-2xl mx-auto">
          <h1 className="font-poppins font-black text-4xl md:text-5xl text-white mb-4">Nos offres</h1>
          <p className="text-white/50 font-inter text-lg">
            Des plans adaptés à chaque profil — vendeur, livreur, ou client.
          </p>
        </div>
      </section>

      {/* Vendor plans */}
      <section className="container-bee section-bee">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-primary uppercase tracking-widest font-poppins mb-2">🏪 Vendeurs</p>
          <h2 className="font-poppins font-black text-3xl text-foreground">Abonnements vendeurs</h2>
          <p className="text-muted-foreground font-inter mt-2">Choisissez le plan qui correspond à votre niveau d'activité.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {VENDOR_PLANS.map((plan) => (
            <PlanCard key={plan.key} plan={plan}
              cta={plan.price === 0 ? "Commencer gratuitement" : `Choisir ${plan.key}`}
              ctaHref="/sign-up/vendor"
              popular={plan.key === "Pro"} />
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground font-inter mt-6">
          Tous les plans incluent : page boutique, gestion commandes, wallet, assistance de base.
          <br />Paiement mensuel ou annuel (2 mois offerts).
        </p>
      </section>

      {/* Delivery plans */}
      <section className="bg-cream-100 py-16">
        <div className="container-bee">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest font-poppins mb-2">🛵 Livreurs</p>
            <h2 className="font-poppins font-black text-3xl text-foreground">Abonnements livreurs</h2>
            <p className="text-muted-foreground font-inter mt-2">Adaptez votre plan à votre rythme de livraison.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {DELIVERY_PLANS.map((plan) => (
              <PlanCard key={plan.key} plan={plan as any}
                cta={plan.price === 0 ? "Rejoindre gratuitement" : "Passer Premium"}
                ctaHref="/sign-up/delivery"
                popular={plan.key === "Premium"} />
            ))}
          </div>
        </div>
      </section>

      {/* Client - free */}
      <section className="container-bee section-bee">
        <div className="bg-ink-gradient rounded-3xl p-10 md:p-14 max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">🛍️</div>
          <h2 className="font-poppins font-black text-3xl text-white mb-3">Compte Client — 100% Gratuit</h2>
          <p className="text-white/60 font-inter mb-7 leading-relaxed">
            Créez votre compte acheteur gratuitement. Accédez à des milliers de produits,
            suivez vos commandes, cumulez des cashbacks et parrainez vos amis.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              "5% cashback sur commandes > 50 000 FCFA",
              "Programme de points sur chaque achat",
              "1 livraison gratuite par parrainage réussi",
            ].map(t => (
              <div key={t} className="bg-white/10 rounded-2xl p-4 text-sm text-white/80 font-inter leading-relaxed">
                {t}
              </div>
            ))}
          </div>
          <Link href="/sign-up"
            className="inline-flex items-center gap-2 h-11 px-7 rounded-2xl bg-primary text-white font-poppins font-bold text-sm hover:bg-primary-hover transition-all shadow-honey">
            Créer un compte gratuit <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cream-100 py-16">
        <div className="container-bee max-w-3xl mx-auto">
          <h2 className="font-poppins font-black text-2xl text-foreground text-center mb-8">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              { q:"Comment payer mon abonnement ?",             a:"Le paiement par carte bancaire via Stripe sera disponible dès la Phase 5 de la plateforme. En attendant, contactez-nous pour un règlement manuel." },
              { q:"Puis-je changer de plan en cours de mois ?", a:"Oui, vous pouvez upgrader à tout moment. La facturation sera au prorata. Pour un downgrade, le changement prend effet au prochain cycle." },
              { q:"Y a-t-il une commission sur les ventes ?",   a:"BEE prélève une commission sur chaque vente. Le taux varie selon votre plan : standard pour Start et Pro, réduit pour Elite." },
              { q:"Comment fonctionne l'escrow ?",              a:"Les fonds de chaque commande sont bloqués jusqu'à confirmation de livraison par le client, puis libérés dans votre wallet sous 48h." },
            ].map(({ q, a }) => (
              <details key={q} className="bg-white rounded-2xl border border-border group">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-poppins font-semibold text-sm text-foreground list-none">
                  {q}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="px-5 pb-5 text-sm text-muted-foreground font-inter leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
