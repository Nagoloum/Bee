
import { db } from "./index";
import { categories } from "./schema";
import { eq } from "drizzle-orm";

const CATEGORIES = [
  {
    id:         "cat_electronique",
    name:       "Électronique",
    nameEn:     "Electronics",
    slug:       "electronique",
    description:"Smartphones, TV, audio, accessoires…",
    icon:       "Laptop",
    color:      "#3B82F6",
    order:      1,
    isFeatured: true,
  },
  {
    id:         "cat_mode",
    name:       "Mode & Vêtements",
    nameEn:     "Fashion",
    slug:       "mode-vetements",
    description:"Prêt-à-porter homme, femme, enfant…",
    icon:       "Shirt",
    color:      "#EC4899",
    order:      2,
    isFeatured: true,
  },
  {
    id:         "cat_alimentation",
    name:       "Alimentation",
    nameEn:     "Food & Groceries",
    slug:       "alimentation",
    description:"Épicerie, produits locaux, boissons…",
    icon:       "ShoppingBag",
    color:      "#22C55E",
    order:      3,
    isFeatured: true,
  },
  {
    id:         "cat_maison",
    name:       "Maison & Déco",
    nameEn:     "Home & Decor",
    slug:       "maison-deco",
    description:"Meubles, décoration, ustensiles…",
    icon:       "Home",
    color:      "#F97316",
    order:      4,
    isFeatured: true,
  },
  {
    id:         "cat_beaute",
    name:       "Beauté & Santé",
    nameEn:     "Beauty & Health",
    slug:       "beaute-sante",
    description:"Cosmétiques, soins, bien-être…",
    icon:       "Sparkles",
    color:      "#A855F7",
    order:      5,
    isFeatured: false,
  },
  {
    id:         "cat_sport",
    name:       "Sport & Loisirs",
    nameEn:     "Sports & Leisure",
    slug:       "sport-loisirs",
    description:"Équipements sportifs, jeux, outdoor…",
    icon:       "Dumbbell",
    color:      "#EAB308",
    order:      6,
    isFeatured: false,
  },
  {
    id:         "cat_bebe",
    name:       "Bébé & Enfant",
    nameEn:     "Baby & Kids",
    slug:       "bebe-enfant",
    description:"Puériculture, jouets, vêtements enfant…",
    icon:       "Baby",
    color:      "#06B6D4",
    order:      7,
    isFeatured: false,
  },
  {
    id:         "cat_informatique",
    name:       "Informatique",
    nameEn:     "Computers & IT",
    slug:       "informatique",
    description:"Ordinateurs, pièces, logiciels…",
    icon:       "Monitor",
    color:      "#64748B",
    order:      8,
    isFeatured: false,
  },
];

async function main() {
  console.log("🌱 Seed catégories...\n");

  for (const cat of CATEGORIES) {
    const existing = await db.select().from(categories)
      .where(eq(categories.slug, cat.slug)).limit(1);

    if (existing[0]) {
      console.log(`  ~ Déjà existante : ${cat.name}`);
      continue;
    }

    await db.insert(categories).values({
      ...cat,
      isActive: true,
      image:    null, // à uploader depuis l'admin
    });

    console.log(`  ✅ Créée : ${cat.name}`);
  }

  console.log("\n✅ Seed catégories terminé !");
  console.log("📸 N'oubliez pas d'uploader les images depuis /admin/catalog/categories\n");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
