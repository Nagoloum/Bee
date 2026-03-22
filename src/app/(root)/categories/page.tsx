import Link from "next/link";
import { getAllCategories } from "@/lib/actions/products";
import * as LucideIcons from "lucide-react";

export const revalidate = 120;
export const metadata = { title: "Catégories — BEE" };

// Placeholder images per category slug (until vendors upload real ones)
const PLACEHOLDER_IMAGES: Record<string, string> = {
  electronique:  "https://picsum.photos/seed/electronique/400/300",
  mode:          "https://picsum.photos/seed/mode-fashion/400/300",
  maison:        "https://picsum.photos/seed/maison-cuisine/400/300",
  beaute:        "https://picsum.photos/seed/beaute-sante/400/300",
  alimentation:  "https://picsum.photos/seed/alimentation-cm/400/300",
  sport:         "https://picsum.photos/seed/sport-loisirs/400/300",
  bebe:          "https://picsum.photos/seed/bebe-enfants/400/300",
  auto:          "https://picsum.photos/seed/auto-moto/400/300",
  informatique:  "https://picsum.photos/seed/informatique/400/300",
  telephonie:    "https://picsum.photos/seed/telephonie/400/300",
  livres:        "https://picsum.photos/seed/livres-papeterie/400/300",
  agriculture:   "https://picsum.photos/seed/agriculture-cm/400/300",
  services:      "https://picsum.photos/seed/services-pro/400/300",
  artisanat:     "https://picsum.photos/seed/artisanat-cm/400/300",
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="container-bee py-8">
          <p className="text-xs font-bold text-primary uppercase tracking-widest font-poppins mb-2">
            🗂️ Catalogue BEE
          </p>
          <h1 className="font-poppins font-black text-3xl text-foreground mb-1">
            Toutes les catégories
          </h1>
          <p className="text-muted-foreground font-inter text-sm">
            {categories.length} catégorie{categories.length !== 1 ? "s" : ""} disponibles
          </p>
        </div>
      </div>

      <div className="container-bee py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const IconComp = (LucideIcons as any)[cat.icon ?? "Package"];
            const image    = cat.image ?? PLACEHOLDER_IMAGES[cat.slug];

            return (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-white hover:border-honey-300 hover:shadow-soft-md transition-all aspect-[4/3] flex flex-col justify-end">

                {/* Background image */}
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color ?? "#f59e0b"}18` }}>
                    {IconComp
                      ? <IconComp size={40} style={{ color: cat.color ?? "#f59e0b" }} />
                      : <span className="text-4xl opacity-30">📦</span>
                    }
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className="relative px-3 pb-3 pt-8">
                  {image && IconComp && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1"
                      style={{ backgroundColor: `${cat.color ?? "#f59e0b"}30` }}>
                      <IconComp size={14} style={{ color: cat.color ?? "#f59e0b" }} />
                    </div>
                  )}
                  <p className="font-poppins font-bold text-sm text-white leading-tight">
                    {cat.name}
                  </p>
                  {cat.isFeatured && (
                    <span className="text-[10px] text-white/60 font-inter">Populaire</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
