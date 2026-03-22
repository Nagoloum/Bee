import Link from "next/link";
import { ArrowRight, Clock, User } from "lucide-react";

export const metadata = { title: "Blog BEE" };

const ARTICLES = [
  {
    id: "1",
    slug: "comment-vendre-en-ligne-cameroun",
    title: "Comment démarrer la vente en ligne au Cameroun en 2026",
    excerpt: "Découvrez les étapes clés pour lancer votre boutique en ligne, choisir vos produits et attirer vos premiers clients sur BEE.",
    category: "Guide vendeur",
    categoryColor: "bg-primary/10 text-primary",
    date: "10 mars 2026",
    author: "Équipe BEE",
    readTime: "5 min",
    image: "https://picsum.photos/seed/blog1/800/400",
  },
  {
    id: "2",
    slug: "livraison-yaoundé-douala",
    title: "Notre réseau de livraison s'étend à Bafoussam et Bamenda",
    excerpt: "BEE franchit une nouvelle étape en déployant son réseau de livreurs dans deux nouvelles villes du Cameroun.",
    category: "Actualités",
    categoryColor: "bg-success/10 text-success-dark",
    date: "5 mars 2026",
    author: "Équipe BEE",
    readTime: "3 min",
    image: "https://picsum.photos/seed/blog2/800/400",
  },
  {
    id: "3",
    slug: "tips-photos-produits",
    title: "5 conseils pour prendre de belles photos de vos produits avec un smartphone",
    excerpt: "Des photos de qualité augmentent vos ventes de 40%. Voici nos astuces simples pour des images professionnelles.",
    category: "Conseils",
    categoryColor: "bg-info/10 text-info-dark",
    date: "28 fév 2026",
    author: "Équipe BEE",
    readTime: "4 min",
    image: "https://picsum.photos/seed/blog3/800/400",
  },
  {
    id: "4",
    slug: "artisans-camerounais-success",
    title: "Comment Jean-Baptiste a multiplié ses ventes par 3 grâce à BEE",
    excerpt: "Artisan sculpteur à Bafoussam, Jean-Baptiste nous raconte comment la plateforme a transformé son activité.",
    category: "Témoignage",
    categoryColor: "bg-warning/10 text-warning-dark",
    date: "20 fév 2026",
    author: "Équipe BEE",
    readTime: "6 min",
    image: "https://picsum.photos/seed/blog4/800/400",
  },
  {
    id: "5",
    slug: "mobile-money-integration",
    title: "BEE intègre le Mobile Money pour des paiements encore plus simples",
    excerpt: "MTN MoMo et Orange Money bientôt disponibles sur BEE pour faciliter les transactions au quotidien.",
    category: "Produit",
    categoryColor: "bg-purple-100 text-purple-700",
    date: "14 fév 2026",
    author: "Équipe BEE",
    readTime: "2 min",
    image: "https://picsum.photos/seed/blog5/800/400",
  },
  {
    id: "6",
    slug: "guide-livreur-badge-fiable",
    title: "Comment obtenir le badge Fiable et doubler vos revenus",
    excerpt: "Le badge Fiable récompense les meilleurs livreurs BEE. Voici comment l'obtenir et les avantages qu'il offre.",
    category: "Guide livreur",
    categoryColor: "bg-secondary/10 text-secondary",
    date: "8 fév 2026",
    author: "Équipe BEE",
    readTime: "4 min",
    image: "https://picsum.photos/seed/blog6/800/400",
  },
];

export default function BlogPage() {
  const [featured, ...rest] = ARTICLES;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-ink-900 py-14">
        <div className="container-bee text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold text-primary uppercase tracking-widest font-poppins mb-3">Blog BEE</p>
          <h1 className="font-poppins font-black text-4xl text-white mb-4">Conseils, actualités et témoignages</h1>
          <p className="text-white/50 font-inter">
            Tout ce qu'il faut savoir pour vendre, acheter et livrer sur BEE.
          </p>
        </div>
      </div>

      <div className="container-bee py-12">
        {/* Featured */}
        <div className="mb-12">
          <Link href={`/blog/${featured.slug}`}
            className="group grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-border bg-white hover:border-honey-300 hover:shadow-soft-lg transition-all">
            <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold font-poppins mb-4 ${featured.categoryColor}`}>
                {featured.category}
              </span>
              <h2 className="font-poppins font-black text-2xl text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
                {featured.title}
              </h2>
              <p className="text-muted-foreground font-inter text-sm leading-relaxed mb-5">{featured.excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-inter">
                <span className="flex items-center gap-1"><User size={11} /> {featured.author}</span>
                <span className="flex items-center gap-1"><Clock size={11} /> {featured.readTime}</span>
                <span>{featured.date}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Grid */}
        <h2 className="font-poppins font-black text-xl text-foreground mb-6">Articles récents</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map(article => (
            <Link key={article.id} href={`/blog/${article.slug}`}
              className="group bg-white rounded-2xl border border-border overflow-hidden hover:border-honey-300 hover:shadow-soft-md transition-all">
              <div className="aspect-video overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold font-poppins mb-3 ${article.categoryColor}`}>
                  {article.category}
                </span>
                <h3 className="font-poppins font-bold text-base text-foreground mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground font-inter line-clamp-2 leading-relaxed mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground font-inter">
                  <span className="flex items-center gap-1"><Clock size={11}/> {article.readTime}</span>
                  <span>{article.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
