#!/usr/bin/env node
/**
 * Applique les SQL annexes (partitions, triggers, RLS, vues matérialisées).
 * Remplace le chainage `psql ... -f` qui ne fonctionne pas sur Windows sans psql client.
 *
 * Usage : node scripts/apply-sql.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQL_DIR = join(__dirname, '..', 'prisma', 'sql');

const ORDER = [
  'triggers.sql',
  'rls.sql',
  'materialized_views.sql',
  // partitions.sql est destructif (DROP TABLE) : à exécuter manuellement
];

const prisma = new PrismaClient();

async function main() {
  const available = readdirSync(SQL_DIR);
  console.log(`📂 SQL dir: ${SQL_DIR}`);
  console.log(`   Files : ${available.join(', ')}`);

  for (const file of ORDER) {
    if (!available.includes(file)) {
      console.warn(`⚠️  ${file} introuvable, skip`);
      continue;
    }
    const sql = readFileSync(join(SQL_DIR, file), 'utf8');
    console.log(`\n▶️  Applying ${file} (${sql.length} chars)`);
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`✅ ${file} applied`);
    } catch (err) {
      console.error(`❌ ${file} failed:`, err.message);
      process.exitCode = 1;
    }
  }

  console.log('\nℹ️  Pour appliquer partitions.sql (destructif) : psql $DATABASE_URL -f prisma/sql/partitions.sql');
}

main().finally(() => prisma.$disconnect());
