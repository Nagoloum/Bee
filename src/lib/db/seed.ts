import { db } from "./index";
import {
  categories,
  subscriptionPlans,
  cashbackRules,
  users,
  accounts,
} from "./schema";
import { createId } from "./utils";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Starting seed...\n");

  // ─── Categories ──────────────────────────────────────────────────────────────
  console.log("📁 Seeding categories...");

  const categoryData = [
    { name: "Électronique",       nameEn: "Electronics",       slug: "electronique",  icon: "Laptop",         color: "#3B82F6" },
    { name: "Mode & Vêtements",   nameEn: "Fashion",           slug: "mode",          icon: "Shirt",          color: "#EC4899" },
    { name: "Maison & Cuisine",   nameEn: "Home & Kitchen",    slug: "maison",        icon: "Home",           color: "#10B981" },
    { name: "Beauté & Santé",     nameEn: "Beauty & Health",   slug: "beaute",        icon: "Sparkles",       color: "#8B5CF6" },
    { name: "Alimentation",       nameEn: "Food & Grocery",    slug: "alimentation",  icon: "ShoppingBasket", color: "#F59E0B" },
    { name: "Sport & Loisirs",    nameEn: "Sports & Leisure",  slug: "sport",         icon: "Dumbbell",       color: "#EF4444" },
    { name: "Bébé & Enfants",     nameEn: "Baby & Kids",       slug: "bebe",          icon: "Baby",           color: "#06B6D4" },
    { name: "Auto & Moto",        nameEn: "Auto & Moto",       slug: "auto",          icon: "Car",            color: "#64748B" },
    { name: "Informatique",       nameEn: "Computers",         slug: "informatique",  icon: "Monitor",        color: "#6366F1" },
    { name: "Téléphonie",         nameEn: "Mobile Phones",     slug: "telephonie",    icon: "Smartphone",     color: "#14B8A6" },
    { name: "Livres & Papeterie", nameEn: "Books & Stationery",slug: "livres",        icon: "BookOpen",       color: "#A78BFA" },
    { name: "Agriculture",        nameEn: "Agriculture",       slug: "agriculture",   icon: "Wheat",          color: "#84CC16" },
    { name: "Services",           nameEn: "Services",          slug: "services",      icon: "Briefcase",      color: "#F97316" },
    { name: "Artisanat",          nameEn: "Crafts",            slug: "artisanat",     icon: "Palette",        color: "#FB7185" },
  ];

  for (const cat of categoryData) {
    await db.insert(categories).values({
      id:         createId(),
      name:       cat.name,
      nameEn:     cat.nameEn,
      slug:       cat.slug,
      icon:       cat.icon,
      color:      cat.color,
      order:      categoryData.indexOf(cat),
      isActive:   true,
      isFeatured: categoryData.indexOf(cat) < 6,
    }).onConflictDoNothing();
  }
  console.log(`  ✅ ${categoryData.length} categories created\n`);

  // ─── Subscription Plans ───────────────────────────────────────────────────────
  console.log("💎 Seeding subscription plans...");

  const plans = [
    {
      type: "VENDOR_START" as const,
      name: "Start",
      nameEn: "Start",
      description: "Pour débuter votre activité sur BEE",
      priceMonthly: 0,
      priceYearly: 0,
      maxProducts: 10,
      maxPhotosPerProduct: 2,
      maxFlashSalesPerDay: 0,
      maxCoupons: 0,
      couponMaxDiscount: 0,
      hasPrioritySupport: false,
      hasAnalytics: false,
      hasRecruitment: false,
      hasBoostedVisibility: false,
      isPopular: false,
      features: [
        { label: "10 produits maximum",    included: true  },
        { label: "2 photos par produit",    included: true  },
        { label: "Page boutique",           included: true  },
        { label: "Flash sales",             included: false },
        { label: "Coupons promotionnels",   included: false },
        { label: "Statistiques avancées",   included: false },
        { label: "Support prioritaire",     included: false },
        { label: "Boost de visibilité",     included: false },
      ],
    },
    {
      type: "VENDOR_PRO" as const,
      name: "Pro",
      nameEn: "Pro",
      description: "Pour développer votre boutique",
      priceMonthly: 5000,
      priceYearly: 50000,
      maxProducts: 100,
      maxPhotosPerProduct: 5,
      maxFlashSalesPerDay: 2,
      maxCoupons: 5,
      couponMaxDiscount: 15,
      hasPrioritySupport: false,
      hasAnalytics: true,
      hasRecruitment: false,
      hasBoostedVisibility: false,
      isPopular: true,
      features: [
        { label: "100 produits maximum",    included: true  },
        { label: "5 photos par produit",    included: true  },
        { label: "2 flash sales/jour",      included: true  },
        { label: "5 coupons (-15% max)",    included: true  },
        { label: "Statistiques avancées",   included: true  },
        { label: "Support prioritaire",     included: false },
        { label: "Boost de visibilité",     included: false },
        { label: "Recrutement",             included: false },
      ],
    },
    {
      type: "VENDOR_ELITE" as const,
      name: "Elite",
      nameEn: "Elite",
      description: "Pour les vendeurs ambitieux",
      priceMonthly: 15000,
      priceYearly: 150000,
      maxProducts: null,
      maxPhotosPerProduct: 10,
      maxFlashSalesPerDay: 5,
      maxCoupons: 20,
      couponMaxDiscount: 20,
      hasPrioritySupport: true,
      hasAnalytics: true,
      hasRecruitment: true,
      hasBoostedVisibility: true,
      isPopular: false,
      features: [
        { label: "Produits illimités",        included: true },
        { label: "10 photos par produit",     included: true },
        { label: "5 flash sales/jour",        included: true },
        { label: "20 coupons (-20% max)",     included: true },
        { label: "Statistiques avancées",     included: true },
        { label: "Support prioritaire 24/7",  included: true },
        { label: "Boost de visibilité",       included: true },
        { label: "Offres de recrutement",     included: true },
      ],
    },
    {
      type: "DELIVERY_FREELANCE" as const,
      name: "Freelance",
      nameEn: "Freelance",
      description: "Livrez quand vous voulez",
      priceMonthly: 0,
      priceYearly: 0,
      maxProducts: 0,
      maxPhotosPerProduct: 0,
      maxFlashSalesPerDay: 0,
      maxCoupons: 0,
      couponMaxDiscount: 0,
      hasPrioritySupport: false,
      hasAnalytics: false,
      hasRecruitment: false,
      hasBoostedVisibility: false,
      isPopular: false,
      features: [
        { label: "500 FCFA / livraison",        included: true  },
        { label: "Toutes les commandes",        included: true  },
        { label: "Badge Fiable (50 livraisons)",included: true  },
        { label: "Commandes prioritaires",      included: false },
        { label: "Bonus performance",           included: false },
      ],
    },
    {
      type: "DELIVERY_PREMIUM" as const,
      name: "Premium",
      nameEn: "Premium",
      description: "Plus de commandes, plus de revenus",
      priceMonthly: 3000,
      priceYearly: 30000,
      maxProducts: 0,
      maxPhotosPerProduct: 0,
      maxFlashSalesPerDay: 0,
      maxCoupons: 0,
      couponMaxDiscount: 0,
      hasPrioritySupport: true,
      hasAnalytics: true,
      hasRecruitment: false,
      hasBoostedVisibility: true,
      isPopular: true,
      features: [
        { label: "500 FCFA / livraison",   included: true },
        { label: "Commandes prioritaires", included: true },
        { label: "Bonus performance",      included: true },
        { label: "Statistiques revenus",   included: true },
        { label: "Support dédié",          included: true },
      ],
    },
  ];

  for (const plan of plans) {
    await db.insert(subscriptionPlans).values({
      id: createId(),
      ...plan,
    }).onConflictDoNothing();
  }
  console.log(`  ✅ ${plans.length} subscription plans created\n`);

  // ─── Cashback Rule ────────────────────────────────────────────────────────────
  console.log("💰 Seeding cashback rules...");
  await db.insert(cashbackRules).values({
    id: createId(),
    minOrderAmount: 50000,
    cashbackPercent: 5,
    isActive: true,
  }).onConflictDoNothing();
  console.log("  ✅ Cashback rule created\n");

  // ─── Admin User ───────────────────────────────────────────────────────────────
  console.log("👑 Seeding admin user...");
  const adminId = createId();
  const hashedPassword = await bcrypt.hash("Admin@BEE2024!", 12);

  const existing = await db
      .select()
      .from(users)
      .limit(1);

  const adminExists = existing.some((u: any) => u.email === "admin@bee.cm");

  if (!adminExists) {
    await db.insert(users).values({
      id:            adminId,
      name:          "Super Admin",
      email:         "admin@bee.cm",
      emailVerified: true,
      role:          "ADMIN",
      status:        "ACTIVE",
    });

    await db.insert(accounts).values({
      id:         createId(),
      accountId:  adminId,
      providerId: "credential",
      userId:     adminId,
      password:   hashedPassword,
    });

    console.log("  ✅ Admin: admin@bee.cm / Admin@BEE2024!\n");
  } else {
    console.log("  ⏭️  Admin already exists\n");
  }

  console.log("🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});