import { db } from "./index";
import { users, accounts, vendors, products } from "./schema";
import { inArray } from "drizzle-orm";

const DEMO_EMAILS = [
  "admin@bee.cm",
  "amina@demo.com",
  "jean@demo.com",
  "fatima@demo.com",
];

async function reset() {
  console.log("🗑️  Resetting demo accounts...\n");

  // Get user IDs
  const demoUsers = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(inArray(users.email, DEMO_EMAILS));

  if (demoUsers.length === 0) {
    console.log("  ℹ️  No demo users found — nothing to reset.");
    process.exit(0);
  }

  const ids = demoUsers.map((u) => u.id);

  // Delete accounts (FK cascade should handle, but explicit is safer)
  await db.delete(accounts).where(inArray(accounts.userId, ids));
  console.log(`  ✅ Deleted accounts for ${ids.length} users`);

  // Delete vendors linked to these users
  // (products will cascade from vendors)
  const { vendors: vendorsTable } = await import("./schema");
  await db.delete(vendorsTable).where(inArray(vendorsTable.userId, ids));
  console.log("  ✅ Deleted vendor profiles");

  // Delete users
  await db.delete(users).where(inArray(users.id, ids));
  console.log(`  ✅ Deleted users: ${demoUsers.map((u) => u.email).join(", ")}`);

  // Delete seeded products (by known slugs)
  const DEMO_SLUGS = [
    "samsung-galaxy-a54", "ecouteurs-jbl-tune", "laptop-lenovo-ideapad",
    "robe-wax-kente", "sac-main-cuir", "chemise-batik-homme",
    "marmite-fonte-10l", "ventilateur-binatone", "huile-coco-naturelle",
    "creme-karite-pur", "cafe-arabica-cameroun", "miel-naturel-pur",
    "ballon-football-adidas", "sculpture-bois-ebene", "masque-bamileke",
  ];
  await db.delete(products).where(inArray(products.slug, DEMO_SLUGS));
  console.log("  ✅ Deleted demo products");

  console.log("\n✅ Reset complete — run npm run db:seed to re-seed.");
  process.exit(0);
}

reset().catch((err) => { console.error("❌", err); process.exit(1); });
