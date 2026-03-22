import Link from "next/link";
import { ArrowRight, Target, Heart, Zap, Users } from "lucide-react";

export const metadata = { title: "À propos de BEE" };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-900 py-20 md:py-28">
        <div className="absolute inset-0 bg-dots-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="container-bee relative text-center max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-honey-gradient shadow-honey mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">🐝</span>
          </div>
          <h1 className="font-poppins font-black text-4xl md:text-5xl text-white mb-5 leading-tight">
            Le marché qui bourdonne
          </h1>
          <p className="text-white/60 font-inter text-lg leading-relaxed">
            BEE est né d'une conviction simple : le commerce camerounais mérite une plateforme moderne,
            locale, et pensée pour ses acteurs — vendeurs, acheteurs, livreurs.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="container-bee section-bee">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest font-poppins mb-3">Notre mission</p>
            <h2 className="font-poppins font-black text-3xl text-foreground mb-5 leading-tight">
              Connecter chaque coin du Cameroun
            </h2>
            <p className="text-foreground-secondary font-inter leading-relaxed mb-4">
              Nous croyons que chaque entrepreneur, artisan et commerçant camerounais mérite les outils
              pour développer son activité en ligne — sans barrière technique, sans frais cachés.
            </p>
            <p className="text-foreground-secondary font-inter leading-relaxed">
              BEE met en relation des milliers d'acheteurs avec les meilleurs vendeurs du pays,
              tout en créant des opportunités pour nos livreurs partenaires.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Target, title: "Notre vision",    desc: "Devenir le premier marketplace d'Afrique centrale d'ici 2027." },
              { icon: Heart,  title: "Nos valeurs",     desc: "Confiance, transparence, impact local et innovation continue." },
              { icon: Zap,    title: "Notre vitesse",   desc: "Livraison en 24h, réponse vendeur en 2h, support 7j/7." },
              { icon: Users,  title: "Notre communauté",desc: "500+ vendeurs, des milliers de clients, 100+ livreurs actifs." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-border p-5 hover:border-honey-300 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon size={18} className="text-primary" />
                </div>
                <p className="font-poppins font-bold text-sm text-foreground mb-1">{title}</p>
                <p className="text-xs text-muted-foreground font-inter leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-cream-100 py-16">
        <div className="container-bee max-w-3xl mx-auto">
          <p className="text-xs font-bold text-primary uppercase tracking-widest font-poppins mb-2 text-center">Notre histoire</p>
          <h2 className="font-poppins font-black text-3xl text-foreground mb-10 text-center">Comment tout a commencé</h2>
          <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {[
              { year: "2023", title: "L'idée naît", desc: "Constat simple : le commerce au Cameroun manque d'une plateforme locale pensée pour ses réalités." },
              { year: "2024", title: "Les fondations", desc: "Développement de la plateforme, premiers partenariats avec des vendeurs pionniers à Yaoundé et Douala." },
              { year: "2025", title: "Le lancement", desc: "BEE ouvre ses portes avec 50 vendeurs, des centaines de produits et un système de livraison local." },
              { year: "2026", title: "La croissance", desc: "Expansion dans toutes les régions du Cameroun, lancement de l'application mobile, 500+ vendeurs actifs." },
            ].map(({ year, title, desc }) => (
              <div key={year} className="flex gap-6 pl-10 relative">
                <div className="absolute left-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold font-poppins shrink-0">
                  {year.slice(2)}
                </div>
                <div className="bg-white rounded-2xl border border-border p-5 flex-1">
                  <p className="font-poppins font-bold text-sm text-primary mb-0.5">{year}</p>
                  <p className="font-poppins font-semibold text-base text-foreground mb-1">{title}</p>
                  <p className="text-sm text-muted-foreground font-inter">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-bee section-bee">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: "500+",   label: "Vendeurs actifs"   },
            { value: "5 000+", label: "Produits en ligne" },
            { value: "10 000+",label: "Clients satisfaits"},
            { value: "24h",    label: "Livraison max"     },
          ].map(({ value, label }) => (
            <div key={label} className="text-center p-6 rounded-2xl bg-white border border-border hover:border-honey-300 transition-colors">
              <p className="font-poppins font-black text-3xl text-primary mb-1">{value}</p>
              <p className="text-sm text-muted-foreground font-inter">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink-gradient py-16">
        <div className="container-bee text-center max-w-2xl mx-auto">
          <h2 className="font-poppins font-black text-3xl text-white mb-4">Rejoignez l'aventure BEE</h2>
          <p className="text-white/60 font-inter mb-8">Que vous soyez acheteur, vendeur ou livreur, il y a une place pour vous dans la ruche.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/sign-up" className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl bg-primary text-white font-poppins font-bold text-sm hover:bg-primary-hover transition-all shadow-honey">
              Créer un compte <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl bg-white/10 text-white border border-white/20 font-poppins font-semibold text-sm hover:bg-white/20 transition-all">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
