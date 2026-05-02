/**
 * Seed initial Bee
 *   — Admin pré-créé (jamais via formulaire)
 *   — Plans d'abonnement (vendeur + livreur)
 *   — Catégories racine
 *   — Site settings par défaut
 *   — Documents légaux (CGU / privacy / cookies)
 *
 * Idempotent : ne casse rien en cas de re-run.
 */
import { PrismaClient, UserRole } from '@prisma/client';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

function generateReferralCode(): string {
  return randomBytes(6).toString('base64url').toUpperCase().slice(0, 8);
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@bee.cm';
  const password = process.env.ADMIN_INITIAL_PASSWORD ?? 'ChangeMe_At_First_Login!2026';

  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: hash,
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      isKycVerified: true,
      referralCode: generateReferralCode(),
      profile: { create: { firstName: 'Admin', lastName: 'Bee', displayName: 'Admin Bee' } },
      wallet: { create: { type: 'CLIENT' } },
    },
  });
  console.log(`✅ Admin seeded: ${admin.email}`);
}

async function seedPlans() {
  const plans = [
    {
      slug: 'vendor_start',
      roleTarget: UserRole.VENDOR,
      name: 'Start',
      description: 'Gratuit 3 mois — idéal pour débuter',
      priceMonthlyXaf: 5000n,
      priceYearlyXaf: null,
      trialDays: 90,
      features: {
        max_products: 10,
        photos_max: 1,
        coupons_max: 1,
        stats: 'basic',
        delivery: 'self_service',
      },
      displayOrder: 1,
    },
    {
      slug: 'vendor_pro',
      roleTarget: UserRole.VENDOR,
      name: 'Pro',
      description: 'Pour les vendeurs actifs qui scalent',
      priceMonthlyXaf: 15000n,
      priceYearlyXaf: 144000n,
      trialDays: 0,
      features: {
        max_products: -1,
        photos_max: 2,
        coupons_max: 5,
        auctions: true,
        live_shopping: true,
        delivery: 'illimited_included',
        stats: 'advanced',
        referral: true,
        job_offers: true,
      },
      displayOrder: 2,
    },
    {
      slug: 'vendor_elite',
      roleTarget: UserRole.VENDOR,
      name: 'Elite',
      description: 'Le plan ultime pour dominer',
      priceMonthlyXaf: 30000n,
      priceYearlyXaf: 252000n,
      trialDays: 0,
      features: {
        max_products: -1,
        photos_max: -1,
        coupons_max: -1,
        stories: true,
        catalog_premium: true,
        ar_360: true,
        delivery: 'express_included',
        affiliation: 'unlimited',
        auto_coupons: 20,
        badge: 'ELITE',
        flash_priority: true,
      },
      displayOrder: 3,
    },
    {
      slug: 'delivery_freelance',
      roleTarget: UserRole.DELIVERY,
      name: 'Freelance',
      description: 'Plan gratuit pour livreurs',
      priceMonthlyXaf: 0n,
      features: { base_fee_xaf: 500, badge_threshold: 50 },
      displayOrder: 1,
    },
    {
      slug: 'delivery_premium',
      roleTarget: UserRole.DELIVERY,
      name: 'Premium',
      description: 'Bonus de livraison et priorité',
      priceMonthlyXaf: 10000n,
      features: { base_fee_xaf: 500, bonus_per_delivery: 100, priority: true, min_rating: 4.8 },
      displayOrder: 2,
    },
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log(`✅ ${plans.length} subscription plans seeded`);
}

async function seedCategories() {
  const roots = [
    { slug: 'electronics', nameFr: 'Électronique', nameEn: 'Electronics' },
    { slug: 'fashion', nameFr: 'Mode & Accessoires', nameEn: 'Fashion' },
    { slug: 'home', nameFr: 'Maison & Déco', nameEn: 'Home' },
    { slug: 'beauty', nameFr: 'Beauté & Santé', nameEn: 'Beauty' },
    { slug: 'food', nameFr: 'Alimentation', nameEn: 'Food' },
    { slug: 'sports', nameFr: 'Sports & Loisirs', nameEn: 'Sports' },
    { slug: 'kids', nameFr: 'Enfants & Bébés', nameEn: 'Kids' },
    { slug: 'services', nameFr: 'Services', nameEn: 'Services' },
  ];
  for (const [i, c] of roots.entries()) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, displayOrder: i },
    });
  }
  console.log(`✅ ${roots.length} root categories seeded`);
}

async function seedSiteSettings() {
  const settings = [
    {
      key: 'brand.name',
      value: 'Bee',
      category: 'BRANDING',
      isPublic: true,
      description: "Nom de la marque",
    },
    {
      key: 'brand.tagline',
      value: 'Marketplace Cameroun',
      category: 'BRANDING',
      isPublic: true,
      description: 'Slogan affiché sur le header',
    },
    {
      key: 'contact.email',
      value: 'contact@bee.cm',
      category: 'CONTACT',
      isPublic: true,
      description: 'Email public de contact',
    },
    {
      key: 'contact.phone',
      value: '+237670000000',
      category: 'CONTACT',
      isPublic: true,
      description: 'Numéro de téléphone',
    },
    {
      key: 'commerce.commission_default_bps',
      value: 500,
      category: 'COMMERCE',
      isPublic: false,
      description: 'Commission par défaut (basis points, 500=5%)',
    },
    {
      key: 'commerce.escrow_auto_release_hours',
      value: 48,
      category: 'COMMERCE',
      isPublic: false,
      description: "Libération automatique de l'escrow après livraison (heures)",
    },
    {
      key: 'commerce.cashback_rate_bps',
      value: 500,
      category: 'COMMERCE',
      isPublic: true,
      description: 'Cashback (basis points, 500=5%)',
    },
    {
      key: 'commerce.cashback_min_order_xaf',
      value: 50000,
      category: 'COMMERCE',
      isPublic: true,
      description: 'Montant minimum pour cashback',
    },
    {
      key: 'fraud.max_disputes_7d',
      value: 3,
      category: 'SECURITY',
      isPublic: false,
      description: 'Seuil auto-suspension',
    },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`✅ ${settings.length} site settings seeded`);
}

async function seedLegalDocuments() {
  const docs = [
    {
      slug: 'terms',
      title: "Conditions Générales d'Utilisation",
      body: "# CGU\n\nVeuillez rédiger vos CGU depuis le dashboard admin.",
    },
    {
      slug: 'privacy',
      title: 'Politique de confidentialité',
      body: "# Confidentialité\n\nVeuillez rédiger votre politique depuis le dashboard admin.",
    },
    {
      slug: 'cookies',
      title: 'Politique des cookies',
      body: '# Cookies\n\nVeuillez rédiger votre politique cookies depuis le dashboard admin.',
    },
  ];
  for (const d of docs) {
    await prisma.legalDocument.upsert({
      where: {
        slug_language_version: { slug: d.slug, language: 'fr', version: 'v1.0' },
      },
      update: {},
      create: {
        slug: d.slug,
        language: 'fr',
        version: 'v1.0',
        title: d.title,
        contentMd: d.body,
        publishedAt: new Date(),
        isCurrent: true,
        requiresAcceptance: d.slug === 'terms',
      },
    });
  }
  console.log(`✅ ${docs.length} legal documents seeded`);
}

async function seedBadges() {
  const badges = [
    {
      slug: 'delivery_fiable',
      name: 'Livreur Fiable',
      description: '50 livraisons réussies sans incident',
      criteria: { type: 'deliveries', count: 50, clean_ratio: 0.98 },
      targetRole: UserRole.DELIVERY,
    },
    {
      slug: 'vendor_top',
      name: 'Top Vendeur',
      description: '100 ventes + note ≥ 4.5',
      criteria: { type: 'sales', count: 100, min_rating: 4.5 },
      targetRole: UserRole.VENDOR,
    },
  ];
  for (const b of badges) {
    await prisma.badge.upsert({ where: { slug: b.slug }, update: {}, create: b });
  }
  console.log(`✅ ${badges.length} badges seeded`);
}

async function main() {
  console.log('🌱 Seeding Bee database...');
  await seedAdmin();
  await seedPlans();
  await seedCategories();
  await seedSiteSettings();
  await seedLegalDocuments();
  await seedBadges();
  console.log('✨ Seed done');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
