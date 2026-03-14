import { db } from "./index";
import {
  categories, subscriptionPlans, cashbackRules,
  users, vendors, products,
} from "./schema";
import { createId } from "./utils";
import { eq } from "drizzle-orm";

// ─── Use better-auth API to create users (handles hashing correctly) ─────────
const BASE_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

async function createUserViaAPI(data: {
  name: string; email: string; password: string; role: string;
}): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": BASE_URL },
      body: JSON.stringify({
        name:     data.name,
        email:    data.email,
        password: data.password,
        role:     data.role,
      }),
    });

    if (res.status === 422 || res.status === 409) {
      // User already exists — fetch the ID from DB
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);
      if (existing.length > 0) {
        console.log(`    ⏭️  ${data.email} (exists)`);
        return existing[0].id;
      }
    }

    if (!res.ok) {
      const body = await res.text();
      console.error(`    ❌ Failed to create ${data.email}: ${res.status} ${body}`);
      return null;
    }

    // Fix role (better-auth defaults to CLIENT, update manually)
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      const { users: usersTable } = await import("./schema");
      await db.update(usersTable)
        .set({ role: data.role as any, emailVerified: true })
        .where(eq(usersTable.id, existing[0].id));
      console.log(`    ✅ ${data.email}`);
      return existing[0].id;
    }

    return null;
  } catch (err) {
    console.error(`    ❌ ${data.email}:`, err);
    return null;
  }
}

async function seed() {
  console.log("🌱 Starting seed...\n");
  console.log(`📡 Using API at: ${BASE_URL}\n`);
  console.log("⚠️  Make sure 'npm run dev' is running in another terminal!\n");

  // ─── Categories ──────────────────────────────────────────────────────────────
  console.log("📁 Categories...");
  const catDefs = [
    { name:"Électronique",       slug:"electronique",  icon:"Laptop",         color:"#3B82F6", featured:true  },
    { name:"Mode & Vêtements",   slug:"mode",          icon:"Shirt",          color:"#EC4899", featured:true  },
    { name:"Maison & Cuisine",   slug:"maison",        icon:"Home",           color:"#10B981", featured:true  },
    { name:"Beauté & Santé",     slug:"beaute",        icon:"Sparkles",       color:"#8B5CF6", featured:true  },
    { name:"Alimentation",       slug:"alimentation",  icon:"ShoppingBasket", color:"#F59E0B", featured:true  },
    { name:"Sport & Loisirs",    slug:"sport",         icon:"Dumbbell",       color:"#EF4444", featured:true  },
    { name:"Bébé & Enfants",     slug:"bebe",          icon:"Baby",           color:"#06B6D4", featured:false },
    { name:"Auto & Moto",        slug:"auto",          icon:"Car",            color:"#64748B", featured:false },
    { name:"Informatique",       slug:"informatique",  icon:"Monitor",        color:"#6366F1", featured:false },
    { name:"Téléphonie",         slug:"telephonie",    icon:"Smartphone",     color:"#14B8A6", featured:false },
    { name:"Livres & Papeterie", slug:"livres",        icon:"BookOpen",       color:"#A78BFA", featured:false },
    { name:"Agriculture",        slug:"agriculture",   icon:"Wheat",          color:"#84CC16", featured:false },
    { name:"Services",           slug:"services",      icon:"Briefcase",      color:"#F97316", featured:false },
    { name:"Artisanat",          slug:"artisanat",     icon:"Palette",        color:"#FB7185", featured:false },
  ];
  const catIds: Record<string, string> = {};
  for (const [i, cat] of catDefs.entries()) {
    const ex = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, cat.slug)).limit(1);
    if (ex.length > 0) { catIds[cat.slug] = ex[0].id; continue; }
    const id = createId(); catIds[cat.slug] = id;
    await db.insert(categories).values({
      id, name: cat.name, slug: cat.slug, icon: cat.icon,
      color: cat.color, order: i, isActive: true, isFeatured: cat.featured,
    });
  }
  console.log(`  ✅ ${catDefs.length} categories\n`);

  // ─── Plans ────────────────────────────────────────────────────────────────────
  console.log("💎 Plans...");
  const planDefs = [
    { type:"VENDOR_START"      as const, name:"Start",     pm:0,     mp:10,   mpp:2,  fpd:0, mc:0,  mcd:0,  ps:false, a:false, r:false, b:false, pop:false },
    { type:"VENDOR_PRO"        as const, name:"Pro",       pm:5000,  mp:100,  mpp:5,  fpd:2, mc:5,  mcd:15, ps:false, a:true,  r:false, b:false, pop:true  },
    { type:"VENDOR_ELITE"      as const, name:"Elite",     pm:15000, mp:null, mpp:10, fpd:5, mc:20, mcd:20, ps:true,  a:true,  r:true,  b:true,  pop:false },
    { type:"DELIVERY_FREELANCE"as const, name:"Freelance", pm:0,     mp:0,    mpp:0,  fpd:0, mc:0,  mcd:0,  ps:false, a:false, r:false, b:false, pop:false },
    { type:"DELIVERY_PREMIUM"  as const, name:"Premium",   pm:3000,  mp:0,    mpp:0,  fpd:0, mc:0,  mcd:0,  ps:true,  a:true,  r:false, b:true,  pop:true  },
  ];
  for (const p of planDefs) {
    await db.insert(subscriptionPlans).values({
      id: createId(), type: p.type, name: p.name,
      priceMonthly: p.pm, priceYearly: p.pm * 10,
      maxProducts: p.mp, maxPhotosPerProduct: p.mpp,
      maxFlashSalesPerDay: p.fpd, maxCoupons: p.mc, couponMaxDiscount: p.mcd,
      hasPrioritySupport: p.ps, hasAnalytics: p.a,
      hasRecruitment: p.r, hasBoostedVisibility: p.b,
      isPopular: p.pop, features: [],
    }).onConflictDoNothing();
  }
  console.log(`  ✅ ${planDefs.length} plans\n`);

  await db.insert(cashbackRules).values({
    id: createId(), minOrderAmount: 50000, cashbackPercent: 5, isActive: true,
  }).onConflictDoNothing();

  // ─── Admin ────────────────────────────────────────────────────────────────────
  console.log("👑 Admin...");
  await createUserViaAPI({ name:"Super Admin", email:"admin@bee.cm", role:"ADMIN", password:"Admin@BEE2024!" });
  console.log();

  // ─── Vendors ─────────────────────────────────────────────────────────────────
  console.log("🏪 Vendors...");
  const vendorDefs = [
    { name:"Amina Kolo",     email:"amina@demo.com",  shop:"Amina Tech Shop",    slug:"amina-tech",     region:"CM-LT" },
    { name:"Jean Mvondo",    email:"jean@demo.com",   shop:"Jean Électro Store", slug:"jean-electro",   region:"CM-CE" },
    { name:"Fatima Alhadji", email:"fatima@demo.com", shop:"Fatima Fashion",     slug:"fatima-fashion", region:"CM-OU" },
  ];
  const vendorIds: string[] = [];
  for (const v of vendorDefs) {
    const uid = await createUserViaAPI({ name:v.name, email:v.email, role:"VENDOR", password:"Demo@1234!" });
    if (!uid) { vendorIds.push(""); continue; }

    const ex = await db.select({ id: vendors.id }).from(vendors).where(eq(vendors.slug, v.slug)).limit(1);
    if (ex.length > 0) { vendorIds.push(ex[0].id); continue; }
    const vid = createId(); vendorIds.push(vid);
    await db.insert(vendors).values({
      id:vid, userId:uid, shopName:v.shop, slug:v.slug, region:v.region,
      status:"ACTIVE", isVerified:true, referralCode:createId().slice(0,8).toUpperCase(),
    });
  }
  console.log();

  // ─── Products ─────────────────────────────────────────────────────────────────
  console.log("🛍️ Products...");
  const productDefs = [
    { vi:0, cat:"electronique",  name:"Samsung Galaxy A54 5G",        slug:"samsung-galaxy-a54",    price:125000, compare:145000, stock:15, rating:4.5, sales:128, featured:true  },
    { vi:1, cat:"electronique",  name:"Écouteurs Bluetooth JBL Tune", slug:"ecouteurs-jbl-tune",    price:18500,  compare:25000,  stock:30, rating:4.2, sales:234, featured:false },
    { vi:1, cat:"informatique",  name:"Laptop Lenovo IdeaPad 3",      slug:"laptop-lenovo-ideapad", price:285000, compare:320000, stock:5,  rating:4.3, sales:45,  featured:true  },
    { vi:2, cat:"mode",          name:"Robe en wax Kente colorée",    slug:"robe-wax-kente",        price:22000,  compare:null,   stock:20, rating:5.0, sales:89,  featured:true  },
    { vi:2, cat:"mode",          name:"Sac à main en cuir artisanal", slug:"sac-main-cuir",         price:35000,  compare:null,   stock:12, rating:4.8, sales:67,  featured:false },
    { vi:2, cat:"mode",          name:"Chemise batik homme",          slug:"chemise-batik-homme",   price:15000,  compare:18000,  stock:25, rating:4.1, sales:112, featured:false },
    { vi:0, cat:"maison",        name:"Marmite en fonte 10L",         slug:"marmite-fonte-10l",     price:28000,  compare:35000,  stock:18, rating:4.6, sales:203, featured:false },
    { vi:1, cat:"maison",        name:"Ventilateur sur pied Binatone",slug:"ventilateur-binatone",  price:32000,  compare:38000,  stock:8,  rating:4.4, sales:156, featured:true  },
    { vi:2, cat:"beaute",        name:"Huile de coco naturelle 500ml",slug:"huile-coco-naturelle",  price:4500,   compare:null,   stock:50, rating:4.9, sales:445, featured:true  },
    { vi:0, cat:"beaute",        name:"Crème karité pur 250g",        slug:"creme-karite-pur",      price:6000,   compare:7500,   stock:35, rating:4.7, sales:321, featured:false },
    { vi:1, cat:"alimentation",  name:"Café arabica du Cameroun 1kg", slug:"cafe-arabica-cameroun", price:8500,   compare:null,   stock:40, rating:4.8, sales:287, featured:true  },
    { vi:2, cat:"alimentation",  name:"Miel naturel pur 500g",        slug:"miel-naturel-pur",      price:5000,   compare:null,   stock:25, rating:5.0, sales:178, featured:false },
    { vi:0, cat:"sport",         name:"Ballon de football Adidas",    slug:"ballon-football-adidas",price:12000,  compare:15000,  stock:20, rating:4.3, sales:94,  featured:false },
    { vi:2, cat:"artisanat",     name:"Sculpture bois ébène",         slug:"sculpture-bois-ebene",  price:45000,  compare:null,   stock:5,  rating:4.9, sales:23,  featured:true  },
    { vi:1, cat:"artisanat",     name:"Masque traditionnel Bamiléké", slug:"masque-bamileke",       price:38000,  compare:null,   stock:8,  rating:4.7, sales:31,  featured:false },
  ];
  let inserted = 0;
  for (const p of productDefs) {
    if (!vendorIds[p.vi]) continue;
    const ex = await db.select({ id: products.id }).from(products).where(eq(products.slug, p.slug)).limit(1);
    if (ex.length > 0) continue;
    await db.insert(products).values({
      id:createId(), vendorId:vendorIds[p.vi], categoryId:catIds[p.cat]??null,
      name:p.name, slug:p.slug,
      description:`${p.name} — produit de qualité sur BEE. Livraison rapide partout au Cameroun.`,
      shortDesc:`${p.name} à prix compétitif`,
      images:[`https://picsum.photos/seed/${p.slug}/400/400`,`https://picsum.photos/seed/${p.slug}-2/400/400`],
      basePrice:p.price, comparePrice:p.compare??null, stock:p.stock,
      status:"PUBLISHED", isFeatured:p.featured,
      rating:p.rating, totalSales:p.sales, totalReviews:Math.floor(p.sales*0.3),
    });
    inserted++;
  }
  console.log(`  ✅ ${inserted} products\n`);

  console.log("🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => { console.error("❌", err); process.exit(1); });
