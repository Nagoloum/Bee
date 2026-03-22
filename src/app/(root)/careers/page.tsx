import Link from "next/link";
import { MapPin, Clock, ArrowRight, Briefcase } from "lucide-react";

export const metadata = { title: "Carrières — BEE" };

const JOBS = [
  { id:"1", title:"Développeur Full-Stack Next.js",      dept:"Tech",        location:"Remote / Yaoundé", type:"CDI",      desc:"Rejoignez notre équipe tech pour construire la future application mobile BEE et améliorer la plateforme web." },
  { id:"2", title:"Responsable Partenariats Vendeurs",   dept:"Business",    location:"Douala",           type:"CDI",      desc:"Développer notre réseau de vendeurs dans le Littoral, former et accompagner les nouveaux partenaires." },
  { id:"3", title:"Community Manager",                   dept:"Marketing",   location:"Yaoundé",          type:"CDI",      desc:"Animer nos réseaux sociaux, créer du contenu et développer la communauté BEE au Cameroun." },
  { id:"4", title:"Responsable Opérations Livraison",    dept:"Opérations",  location:"Douala",           type:"CDI",      desc:"Gérer et optimiser notre réseau de livreurs, améliorer les délais et la satisfaction client." },
  { id:"5", title:"Stage — Développeur Mobile React Native", dept:"Tech",   location:"Remote",           type:"Stage 6 mois", desc:"Participer au développement de l'application mobile BEE sur iOS et Android." },
  { id:"6", title:"Stage — Designer UX/UI",             dept:"Design",      location:"Yaoundé",          type:"Stage 6 mois", desc:"Concevoir les nouvelles interfaces et améliorer l'expérience utilisateur de la plateforme." },
];

const DEPT_COLORS: Record<string, string> = {
  Tech:       "bg-blue-100 text-blue-700",
  Business:   "bg-success/10 text-success-dark",
  Marketing:  "bg-pink-100 text-pink-700",
  Opérations: "bg-warning/10 text-warning-dark",
  Design:     "bg-purple-100 text-purple-700",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-ink-900 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="container-bee relative max-w-3xl mx-auto text-center">
          <span className="text-4xl mb-4 block">🚀</span>
          <h1 className="font-poppins font-black text-4xl md:text-5xl text-white mb-5">
            Construisez le futur du commerce camerounais avec nous
          </h1>
          <p className="text-white/60 font-inter text-lg leading-relaxed">
            BEE grandit vite. Nous cherchons des talents passionnés, ambitieux et ancrés dans les réalités africaines.
          </p>
        </div>
      </section>

      {/* Why BEE */}
      <section className="container-bee section-bee">
        <div className="text-center mb-12">
          <h2 className="font-poppins font-black text-3xl text-foreground mb-4">Pourquoi rejoindre BEE ?</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {[
            { emoji:"🌍", title:"Impact réel",        desc:"Votre travail touche directement des milliers de camerounais chaque jour." },
            { emoji:"📈", title:"Croissance rapide",  desc:"Startup en forte croissance avec des opportunités d'évolution rapide." },
            { emoji:"🏠", title:"Télétravail friendly",desc:"Travail hybride ou full remote selon les postes." },
            { emoji:"💰", title:"Rémunération juste", desc:"Salaires compétitifs sur le marché camerounais + primes sur résultats." },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-border p-6 text-center hover:border-honey-300 transition-colors">
              <div className="text-3xl mb-3">{emoji}</div>
              <p className="font-poppins font-bold text-sm text-foreground mb-2">{title}</p>
              <p className="text-xs text-muted-foreground font-inter leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Jobs */}
      <section className="bg-cream-100 py-16">
        <div className="container-bee max-w-4xl mx-auto">
          <h2 className="font-poppins font-black text-3xl text-foreground mb-8 text-center">Postes ouverts</h2>
          <div className="space-y-4">
            {JOBS.map(job => (
              <div key={job.id}
                className="bg-white rounded-2xl border border-border p-6 hover:border-honey-300 hover:shadow-soft-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-poppins ${DEPT_COLORS[job.dept] ?? "bg-muted text-foreground"}`}>
                        {job.dept}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold font-poppins bg-muted text-muted-foreground">
                        {job.type}
                      </span>
                    </div>
                    <h3 className="font-poppins font-bold text-lg text-foreground mb-1">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-inter mb-3">
                      <span className="flex items-center gap-1"><MapPin size={11}/> {job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase size={11}/> {job.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-inter leading-relaxed">{job.desc}</p>
                  </div>
                  <Link href={`mailto:jobs@bee.cm?subject=Candidature — ${job.title}`}
                    className="shrink-0 inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-white font-poppins font-bold text-sm hover:bg-primary-hover transition-all shadow-honey self-start">
                    Postuler <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-muted-foreground font-inter text-sm mb-4">
              Vous ne trouvez pas le poste idéal ? Envoyez une candidature spontanée.
            </p>
            <Link href="mailto:jobs@bee.cm"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl border-2 border-foreground text-foreground font-poppins font-bold text-sm hover:bg-foreground hover:text-white transition-all">
              Candidature spontanée
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
