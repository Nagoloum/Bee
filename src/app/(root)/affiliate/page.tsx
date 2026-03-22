import Link from "next/link";
import { Gift, Users, Truck, Store, Star, ArrowRight, Check } from "lucide-react";

export const metadata = { title: "Programme de parrainage & parrainage — BEE" };

export default function AffiliationPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-honey-gradient py-20 md:py-28">
        <div className="absolute inset-0 bg-dots-pattern opacity-10" />
        <div className="container-bee relative text-center max-w-3xl mx-auto">
          <div className="text-5xl mb-5">🎁</div>
          <h1 className="font-poppins font-black text-4xl md:text-5xl text-white mb-5 leading-tight">
            Parrainez, gagnez, profitez
          </h1>
          <p className="text-white/80 font-inter text-lg leading-relaxed mb-8">
            Chaque parrainage réussi vous rapporte des récompenses exclusives. Invitez vos proches et gagnez ensemble.
          </p>
          <Link href="/sign-up"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-2xl bg-white text-primary font-poppins font-bold transition-all shadow-xl">
            Rejoindre et parrainer <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Programs */}
      <section className="container-bee section-bee">
        <h2 className="font-poppins font-black text-3xl text-foreground text-center mb-10">
          Nos programmes de parrainage
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">

          {/* Client program */}
          <div className="bg-white rounded-3xl border-2 border-border hover:border-primary p-7 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Users size={22} className="text-primary" />
            </div>
            <h3 className="font-poppins font-black text-xl text-foreground mb-2">Parrainage Client</h3>
            <p className="text-muted-foreground font-inter text-sm mb-5 leading-relaxed">
              Invitez vos amis à créer un compte client sur BEE.
            </p>
            <div className="space-y-3 mb-6">
              {[
                { label:"Vous recevez",    value:"1 livraison gratuite" },
                { label:"Votre filleul",   value:"1 livraison gratuite" },
                { label:"Max par mois",    value:"5 parrainages"        },
                { label:"Validité récompense","value":"30 jours"      },
              ].map(({label, value}) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-inter">{label}</span>
                  <span className="font-semibold font-poppins text-foreground">{value}</span>
                </div>
              ))}
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs font-inter text-primary">
              🎉 Badge Famille — débloqué dès 5 parrainages réussis
            </div>
          </div>

          {/* Vendor program */}
          <div className="bg-white rounded-3xl border-2 border-primary shadow-honey p-7 transition-all relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold font-poppins">⭐ MEILLEUR</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Store size={22} className="text-primary" />
            </div>
            <h3 className="font-poppins font-black text-xl text-foreground mb-2">Parrainage Vendeur</h3>
            <p className="text-muted-foreground font-inter text-sm mb-5 leading-relaxed">
              Invitez d'autres entrepreneurs à ouvrir leur boutique sur BEE.
            </p>
            <div className="space-y-3 mb-6">
              {[
                { label:"Abonnement filleul", value:"50% de réduction 1er mois" },
                { label:"Bonus parrain",       value:"1 mois gratuit si 3 filleuls/mois" },
                { label:"Visibilité",          value:"Boost boutique +30%" },
                { label:"Badge",               value:"Badge Parrain 🏅"     },
              ].map(({label, value}) => (
                <div key={label} className="flex items-start justify-between text-sm gap-3">
                  <span className="text-muted-foreground font-inter">{label}</span>
                  <span className="font-semibold font-poppins text-foreground text-right">{value}</span>
                </div>
              ))}
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs font-inter text-primary">
              💰 Lien unique de parrainage disponible dans votre dashboard
            </div>
          </div>

          {/* Delivery program */}
          <div className="bg-white rounded-3xl border-2 border-border hover:border-secondary p-7 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-5">
              <Truck size={22} className="text-secondary" />
            </div>
            <h3 className="font-poppins font-black text-xl text-foreground mb-2">Parrainage Livreur</h3>
            <p className="text-muted-foreground font-inter text-sm mb-5 leading-relaxed">
              Recrutez des livreurs et gagnez sur leurs premières livraisons.
            </p>
            <div className="space-y-3 mb-6">
              {[
                { label:"Bonus par livraison",   value:"50 FCFA / livraison filleul" },
                { label:"Durée du bonus",         value:"Les 3 premiers mois"         },
                { label:"Bonus d'activation",     value:"500 FCFA à la 1ère livraison"},
                { label:"Max filleuls actifs",    value:"Illimité"                    },
              ].map(({label, value}) => (
                <div key={label} className="flex items-start justify-between text-sm gap-3">
                  <span className="text-muted-foreground font-inter">{label}</span>
                  <span className="font-semibold font-poppins text-foreground text-right">{value}</span>
                </div>
              ))}
            </div>
            <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-3 text-xs font-inter text-secondary">
              🛵 Disponible dès votre inscription comme livreur
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-cream-100 py-16">
        <div className="container-bee max-w-4xl mx-auto">
          <h2 className="font-poppins font-black text-3xl text-foreground text-center mb-10">Comment ça marche ?</h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step:"1", emoji:"📝", title:"Inscrivez-vous",   desc:"Créez votre compte BEE en 2 minutes" },
              { step:"2", emoji:"🔗", title:"Copiez votre lien",desc:"Généré automatiquement dans vos paramètres" },
              { step:"3", emoji:"📱", title:"Partagez",         desc:"WhatsApp, réseaux sociaux, bouche-à-oreille" },
              { step:"4", emoji:"🎁", title:"Recevez vos bonus",desc:"Crédités automatiquement dès validation" },
            ].map(({ step, emoji, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white font-poppins font-black text-lg flex items-center justify-center mx-auto mb-3">
                  {step}
                </div>
                <div className="text-2xl mb-2">{emoji}</div>
                <p className="font-poppins font-bold text-sm text-foreground mb-1">{title}</p>
                <p className="text-xs text-muted-foreground font-inter">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program affiliate (externe) */}
      <section className="container-bee section-bee">
        <div className="bg-ink-gradient rounded-3xl p-10 md:p-14 text-center max-w-4xl mx-auto">
          <div className="text-4xl mb-5">🤝</div>
          <h2 className="font-poppins font-black text-3xl text-white mb-4">Programme Affiliés Avancé</h2>
          <p className="text-white/60 font-inter mb-6 max-w-xl mx-auto leading-relaxed">
            Pour les influenceurs, blogueurs et partenaires avec une audience significative.
            Commission sur chaque vente générée via votre lien d'affiliation personnalisé.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left max-w-2xl mx-auto">
            {[
              "Commission jusqu'à 5% sur chaque vente",
              "Tableau de bord statistiques dédié",
              "Paiement mensuel automatique",
            ].map(t => (
              <div key={t} className="flex items-start gap-2.5 text-sm text-white/80 font-inter">
                <Check size={14} className="text-primary mt-0.5 shrink-0" /> {t}
              </div>
            ))}
          </div>
          <Link href="mailto:partners@bee.cm"
            className="inline-flex items-center gap-2 h-11 px-7 rounded-2xl bg-primary text-white font-poppins font-bold text-sm hover:bg-primary-hover transition-all shadow-honey">
            Devenir affilié <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
