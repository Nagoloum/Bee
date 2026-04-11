/**
 * src/lib/db/resetadmin.ts
 * Usage : npm run db:resetadmin
 *
 * Utilise le hashing natif de Better-Auth (scrypt) — pas bcrypt
 */

import { db } from "./index";
import { users, accounts } from "./schema";
import { eq } from "drizzle-orm";
import { auth } from "../auth"; // votre instance Better-Auth

const ADMIN_EMAIL    = "admin@bee.cm";
const ADMIN_PASSWORD = "Admin@BEE2026!";
const ADMIN_NAME     = "Admin BEE";

async function main() {
  console.log("🐝 Création du compte admin...\n");

  // Vérifier si l'admin existe déjà
  const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

  if (existing[0]) {
    // Mettre à jour le rôle uniquement
    await db.update(users)
        .set({ role: "ADMIN", status: "ACTIVE", emailVerified: true })
        .where(eq(users.id, existing[0].id));

    console.log("✅ Admin existant — rôle mis à jour.");
    console.log(`   Email    : ${ADMIN_EMAIL}`);
    console.log(`   Password : ${ADMIN_PASSWORD}\n`);
    process.exit(0);
  }

  // Utiliser l'API Better-Auth pour créer le compte correctement
  // (gère le hashing scrypt automatiquement)
  const result = await auth.api.signUpEmail({
    body: {
      name:     ADMIN_NAME,
      email:    ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  });

  if (!result?.user?.id) {
    console.error("❌ Échec de la création via Better-Auth.");
    process.exit(1);
  }

  // Mettre à jour le rôle en ADMIN (Better-Auth crée CLIENT par défaut)
  await db.update(users)
      .set({ role: "ADMIN", status: "ACTIVE", emailVerified: true })
      .where(eq(users.id, result.user.id));

  console.log("✅ Admin créé !\n");
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);
  console.log("\n⚠️  Changez le mot de passe après la première connexion.\n");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});