# Bee — Structure du projet & Justification des choix

> **Projet :** Marketplace multi-vendeurs Cameroun
> **Cible :** 3M+ utilisateurs
> **Stack :** Monorepo Turborepo — NestJS + PostgreSQL + Next.js + Expo

---

## 🗂️ Vue d'ensemble du monorepo

```
bee/
├── apps/
│   ├── api/                        # Backend NestJS (business logic, API REST + WS)
│   ├── web/                        # Next.js 15 (storefront + dashboards)
│   └── mobile/                     # Expo (iOS + Android)
│
├── packages/
│   ├── ui/                         # Composants partagés web+mobile
│   ├── types/                      # Types TS partagés (DTOs, enums)
│   ├── validators/                 # Schémas Zod partagés
│   ├── sdk/                        # Client API auto-généré
│   ├── i18n/                       # Traductions FR / EN
│   └── config/                     # ESLint, TS, Tailwind, Prettier
│
├── infra/                          # Terraform, Docker, scripts ops
│
├── .github/
│   └── workflows/                  # CI/CD (lint, test, build, deploy)
│
├── .env.example
├── docker-compose.yml              # Dev local (PG, Redis, Meili, Mailhog)
├── turbo.json                      # Config Turborepo
├── (workspaces dans package.json racine)
├── package.json
└── README.md
```

### Pourquoi un monorepo Turborepo + npm workspaces ?

| Raison | Gain concret |
|---|---|
| **Atomicité** | Un PR peut modifier API + Web + Mobile ensemble, cohérence garantie |
| **Types partagés** | Changement de DTO dans l'API → erreur TS immédiate dans Web/Mobile |
| **Cache de build** | CI 5–10× plus rapide grâce au cache Turborepo (local + remote) |
| **DX** | `npm install` unique à la racine, scripts `turbo run dev` parallèles |
| **Zéro install supplémentaire** | npm est inclus avec Node.js, pas d'outil tiers à installer |
| **Déploiement indépendant** | `turbo build --filter=@bee/web` ne rebuild que le web modifié |

---

## 🔧 `apps/api/` — Backend NestJS

```
apps/api/
├── src/
│   ├── main.ts                          # Bootstrap (helmet, CORS, Swagger, validation)
│   ├── app.module.ts                    # Module racine (imports globaux)
│   │
│   ├── common/
│   │   ├── decorators/                  # @CurrentUser, @Roles, @IdempotencyKey
│   │   ├── guards/                      # JwtAuthGuard, RolesGuard, TwoFactorGuard
│   │   ├── interceptors/                # LoggingInterceptor, TransformInterceptor
│   │   ├── filters/                     # AllExceptionsFilter, PrismaExceptionFilter
│   │   ├── pipes/                       # ZodValidationPipe
│   │   └── middleware/                  # RequestContextMiddleware (cls)
│   │
│   ├── config/
│   │   ├── env.validation.ts            # Zod schema pour env vars
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── providers.config.ts          # CinetPay, Smile ID, Nexah, etc.
│   │
│   ├── modules/
│   │   ├── auth/                        # Login, register, OTP, 2FA, refresh
│   │   ├── users/                       # Profils, adresses, paramètres
│   │   ├── kyc/                         # Smile Identity integration
│   │   ├── shops/                       # CRUD boutiques, settings
│   │   ├── catalog/                     # Catégories, brands, official products
│   │   ├── products/                    # CRUD produits, variants, images
│   │   ├── search/                      # Meilisearch integration + re-index
│   │   ├── carts/                       # Panier, price negotiation
│   │   ├── orders/                      # Création, checkout, statuts
│   │   ├── payments/                    # CinetPay, wallet, installments
│   │   ├── escrow/                      # Hold, release auto, refund
│   │   ├── deliveries/                  # Assignation, tracking, preuve
│   │   ├── wallets/                     # Balance, transactions, retraits
│   │   ├── subscriptions/               # Plans, upgrade, billing
│   │   ├── promotions/                  # Coupons, flash sales
│   │   ├── auctions/                    # Enchères, bids, résolution
│   │   ├── live-shopping/               # Sessions live, produits featured
│   │   ├── stories/                     # CRUD stories 24h
│   │   ├── reviews/                     # Avis produit/shop/delivery
│   │   ├── disputes/                    # Litiges, AI arbitrage
│   │   ├── referrals/                   # Parrainage, affiliation
│   │   ├── gamification/                # Points, badges, tiers
│   │   ├── job-offers/                  # Offres d'emploi + candidatures
│   │   ├── notifications/               # Push, SMS, email, in-app
│   │   ├── messaging/                   # Conversations, IA, support
│   │   ├── admin/                       # Dashboard, CMS, audit
│   │   ├── cms/                         # Banners, legal, footer, pages
│   │   ├── feature-flags/               # Gestion flags runtime
│   │   └── webhooks/                    # Réception CinetPay, Smile ID
│   │
│   ├── queues/
│   │   ├── processors/                  # BullMQ workers
│   │   │   ├── email.processor.ts
│   │   │   ├── sms.processor.ts
│   │   │   ├── escrow-release.processor.ts
│   │   │   ├── search-index.processor.ts
│   │   │   ├── csv-export.processor.ts
│   │   │   └── anti-fraud.processor.ts
│   │   └── queue.module.ts
│   │
│   ├── realtime/
│   │   ├── gateways/                    # Socket.io gateways
│   │   │   ├── delivery-tracking.gateway.ts
│   │   │   ├── live-shopping.gateway.ts
│   │   │   └── notifications.gateway.ts
│   │   └── realtime.module.ts
│   │
│   ├── prisma/
│   │   ├── prisma.service.ts            # Injectable Prisma client
│   │   └── prisma.module.ts
│   │
│   └── integrations/
│       ├── cinetpay/
│       ├── notchpay/
│       ├── smile-identity/
│       ├── nexah/
│       ├── twilio/
│       ├── resend/
│       ├── cloudflare-r2/
│       ├── cloudflare-stream/
│       └── google-maps/
│
├── prisma/
│   ├── schema.prisma                    # Schéma unique
│   ├── migrations/                      # Migrations Prisma
│   ├── seed.ts                          # Seed admin + plans + categories
│   └── sql/
│       ├── partitions.sql               # CREATE TABLE ... PARTITION BY
│       ├── triggers.sql                 # updated_at, search_vector
│       ├── rls.sql                      # Row Level Security
│       └── materialized_views.sql
│
├── test/
│   ├── e2e/
│   └── unit/
│
├── Dockerfile
├── tsconfig.json
├── nest-cli.json
└── package.json
```

### Anatomie d'un module (exemple `orders`)

```
modules/orders/
├── orders.module.ts                     # Déclare controllers, providers, imports
├── orders.controller.ts                 # Routes REST + OpenAPI decorators
├── orders.service.ts                    # Logique métier (create, cancel, etc.)
├── orders.repository.ts                 # Queries Prisma isolées
├── orders.gateway.ts                    # WS (si applicable)
├── dto/
│   ├── create-order.dto.ts
│   ├── update-order-status.dto.ts
│   └── list-orders.query.ts
├── entities/                            # Types business (si différents DTO)
├── events/                              # order.created, order.paid, order.delivered
├── guards/                              # OrderOwnerGuard
└── specs/                               # Tests unit
```

### Pourquoi NestJS ?

| Raison | Bénéfice |
|---|---|
| **Architecture modulaire** | Chaque domaine (orders, payments…) isolé → équipes parallèles sans conflits |
| **Injection de dépendances** | Testabilité, mock facile des services externes |
| **Guards / Interceptors / Pipes** | Auth, validation, logging déclaratifs |
| **OpenAPI auto-généré** | Le SDK client est toujours à jour → zéro divergence front/back |
| **Ecosystem Node** | Réutilise tout l'écosystème npm (BullMQ, Prisma, etc.) |
| **TypeScript first** | Même langage que le front → partage de types trivial |

---

## 🌐 `apps/web/` — Next.js 15

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (public)/                    # Storefront SEO (SSG + ISR)
│   │   │   ├── page.tsx                 # Accueil
│   │   │   ├── products/
│   │   │   │   ├── page.tsx             # Catalogue + filtres
│   │   │   │   └── [slug]/page.tsx      # Fiche produit
│   │   │   ├── shops/
│   │   │   │   └── [slug]/page.tsx      # Boutique vendeur
│   │   │   ├── categories/[slug]/page.tsx
│   │   │   ├── flash-sales/page.tsx
│   │   │   ├── live/[id]/page.tsx       # Live shopping
│   │   │   ├── careers/page.tsx         # Offres d'emploi (CMS)
│   │   │   ├── legal/[slug]/page.tsx    # Pages légales (CMS)
│   │   │   └── layout.tsx               # Navbar + Footer public
│   │   │
│   │   ├── (auth)/                      # Login / register / OTP
│   │   │   ├── sign-in/page.tsx
│   │   │   ├── sign-up/
│   │   │   │   ├── page.tsx             # Client par défaut
│   │   │   │   ├── vendor/page.tsx
│   │   │   │   └── delivery/page.tsx
│   │   │   ├── verify-otp/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (client)/                    # Espace client auth
│   │   │   ├── orders/
│   │   │   ├── wallet/
│   │   │   ├── addresses/
│   │   │   ├── reviews/
│   │   │   ├── kyc/                     # Upload CNI
│   │   │   └── settings/
│   │   │
│   │   ├── (vendor)/                    # Dashboard vendeur
│   │   │   ├── dashboard/               # Stats ventes, clients, géo
│   │   │   ├── products/                # CRUD + variants
│   │   │   ├── orders/
│   │   │   ├── wallet/
│   │   │   ├── subscriptions/           # Start / Pro / Elite
│   │   │   ├── coupons/
│   │   │   ├── flash-sales/
│   │   │   ├── auctions/
│   │   │   ├── live/                    # Créer live
│   │   │   ├── stories/                 # (Elite)
│   │   │   ├── job-offers/
│   │   │   ├── affiliations/            # Livreurs affiliés
│   │   │   └── settings/
│   │   │
│   │   ├── (delivery)/                  # Dashboard livreur
│   │   │   ├── jobs/                    # Courses dispo
│   │   │   ├── active/                  # Course en cours (GPS)
│   │   │   ├── history/
│   │   │   ├── wallet/
│   │   │   └── settings/
│   │   │
│   │   ├── (admin)/                     # Panel admin
│   │   │   ├── dashboard/               # KPIs globaux
│   │   │   ├── users/                   # Clients / vendeurs / livreurs
│   │   │   ├── shops/
│   │   │   ├── products/                # Approuver / rejeter
│   │   │   ├── orders/
│   │   │   ├── disputes/                # Arbitrage
│   │   │   ├── wallets/                 # Validation retraits
│   │   │   ├── subscriptions/           # Modifier prix plans
│   │   │   ├── kyc/                     # Review manuel
│   │   │   ├── cms/                     # Banners, legal, footer
│   │   │   │   ├── banners/
│   │   │   │   ├── legal-docs/
│   │   │   │   ├── footer-links/
│   │   │   │   ├── homepage/
│   │   │   │   ├── announcements/
│   │   │   │   └── email-templates/
│   │   │   ├── catalog/                 # Catalogue officiel
│   │   │   ├── feature-flags/
│   │   │   ├── audit-logs/
│   │   │   └── settings/                # Site settings
│   │   │
│   │   ├── api/                         # Routes API (webhooks, uploads)
│   │   │   ├── webhooks/
│   │   │   └── uploads/
│   │   │
│   │   ├── layout.tsx                   # Racine (fonts, providers)
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   │
│   ├── components/
│   │   ├── ui/                          # Primitives shadcn
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown.tsx
│   │   │   └── ...
│   │   ├── composed/                    # Composés métier
│   │   │   ├── product-card.tsx
│   │   │   ├── order-row.tsx
│   │   │   ├── wallet-badge.tsx
│   │   │   ├── rating-stars.tsx
│   │   │   └── price-xaf.tsx
│   │   ├── features/                    # Features complètes
│   │   │   ├── checkout-flow/
│   │   │   ├── product-form/
│   │   │   ├── wallet-panel/
│   │   │   ├── flash-sale-grid/
│   │   │   ├── negotiation-modal/
│   │   │   └── dispute-timeline/
│   │   └── layouts/                     # Layouts par rôle
│   │       ├── public-shell.tsx
│   │       ├── client-shell.tsx
│   │       ├── vendor-shell.tsx
│   │       ├── delivery-shell.tsx
│   │       └── admin-shell.tsx
│   │
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-cart.ts
│   │   ├── use-wallet.ts
│   │   ├── use-realtime.ts              # Socket.io wrapper
│   │   ├── use-flash-sales.ts
│   │   ├── use-infinite-products.ts
│   │   └── use-debounced-search.ts
│   │
│   ├── services/                        # Wrappers SDK
│   │   ├── api-client.ts                # Instance SDK configurée
│   │   ├── analytics.ts                 # PostHog wrapper
│   │   ├── storage.ts                   # Upload R2 signed URL
│   │   └── payments.ts                  # CinetPay SDK web
│   │
│   ├── contexts/
│   │   ├── auth-context.tsx
│   │   ├── theme-context.tsx            # Light/dark + mode éco
│   │   └── locale-context.tsx
│   │
│   ├── stores/                          # Zustand
│   │   ├── cart.store.ts
│   │   ├── ui.store.ts                  # Modales, sidebars
│   │   └── filters.store.ts             # Filtres catalogue persistés
│   │
│   ├── lib/
│   │   ├── utils.ts                     # cn(), formatXaf(), etc.
│   │   ├── currency.ts                  # Format FCFA
│   │   ├── date.ts
│   │   ├── a11y.ts
│   │   └── guards.ts                    # Middleware rôles
│   │
│   ├── messages/
│   │   ├── fr.json
│   │   └── en.json
│   │
│   ├── middleware.ts                    # i18n routing + auth redirect
│   └── types/
│
├── public/
│   ├── fonts/                           # Poppins + Inter (si self-host)
│   ├── images/
│   └── favicons/
│
├── tests/
│   ├── e2e/                             # Playwright
│   └── unit/                            # Vitest
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Pourquoi cette organisation ?

| Choix | Justification |
|---|---|
| **Route groups `(public)` / `(admin)` / etc.** | Un layout par rôle, permissions middleware claires, pas de fuite de composants admin dans le bundle public |
| **`components/` en 3 niveaux** | `ui/` = primitives (copiées de shadcn) · `composed/` = combinaisons métier · `features/` = flows entiers |
| **`hooks/` séparé de `services/`** | Les hooks encapsulent la logique React ; les services sont utilisables côté server (RSC, server actions) |
| **Zustand pour client state** | Panier, filtres, UI — pas besoin de Provider partout, API minimale |
| **TanStack Query pour server state** | Cache, invalidation, optimistic — ne pas mélanger avec Zustand |

---

## 📱 `apps/mobile/` — Expo

```
apps/mobile/
├── app/                                 # Expo Router (file-based)
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── verify-otp.tsx
│   ├── (client)/
│   │   ├── _layout.tsx                  # Tabs (Home / Search / Cart / Orders / Profile)
│   │   ├── index.tsx
│   │   ├── search.tsx
│   │   ├── cart.tsx
│   │   ├── orders/
│   │   ├── wallet.tsx
│   │   └── profile.tsx
│   ├── (vendor)/
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   ├── products/
│   │   ├── orders.tsx
│   │   └── wallet.tsx
│   ├── (delivery)/
│   │   ├── _layout.tsx
│   │   ├── jobs.tsx
│   │   ├── active.tsx                   # Map GPS
│   │   └── wallet.tsx
│   ├── product/[id].tsx
│   ├── shop/[slug].tsx
│   ├── checkout.tsx
│   ├── live/[id].tsx
│   ├── _layout.tsx                      # Root (providers, fonts)
│   └── +not-found.tsx
│
├── src/
│   ├── components/
│   │   ├── ui/                          # Primitives mobile (NativeWind)
│   │   ├── composed/
│   │   └── features/
│   │
│   ├── hooks/                           # Réutilise @bee/hooks partagés
│   ├── services/
│   │   ├── push-notifications.ts        # Expo Notifications
│   │   ├── location-tracking.ts         # Background GPS (livreur)
│   │   ├── offline-sync.ts              # Sync quand reconnexion
│   │   ├── biometric-auth.ts
│   │   └── battery-monitor.ts           # Mode éco auto
│   │
│   ├── storage/
│   │   └── mmkv.ts                      # Cache ultra-rapide
│   │
│   └── lib/
│
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── splash/
│
├── app.json                             # Config Expo (permissions, plugins)
├── eas.json                             # Build profiles (dev, preview, prod)
├── babel.config.js
├── metro.config.js
└── package.json
```

### Choix clés mobile

| Choix | Raison |
|---|---|
| **Expo Router (file-based)** | Même mental model que Next.js App Router → transférable |
| **NativeWind** | Les classes Tailwind du web marchent tel quel sur mobile |
| **MMKV** | 200× plus rapide qu'AsyncStorage, synchrone (simplifie le code) |
| **TanStack Query + persist** | Hors-ligne automatique, re-sync transparent |
| **EAS Build + OTA** | Push correctifs sans passer par les stores |

---

## 📦 `packages/` — Code partagé

### `packages/types/`

```
packages/types/
├── src/
│   ├── enums/
│   │   ├── user-role.ts
│   │   ├── order-status.ts
│   │   ├── payment-method.ts
│   │   └── ...
│   ├── dtos/
│   │   ├── auth/
│   │   ├── orders/
│   │   ├── products/
│   │   └── ...
│   └── api/
│       └── openapi.generated.ts         # Généré depuis OpenAPI (orval/openapi-typescript)
```

### `packages/validators/`

```
packages/validators/
├── src/
│   ├── auth.schema.ts
│   ├── order.schema.ts
│   ├── product.schema.ts
│   └── ...
```

**Un seul schéma Zod** utilisé :
- Dans le backend NestJS (via `ZodValidationPipe`)
- Dans les formulaires React Hook Form web
- Dans les formulaires mobiles

### `packages/ui/`

```
packages/ui/
├── src/
│   ├── web/                             # shadcn/ui (copié)
│   └── mobile/                          # NativeWind equivalents
├── tailwind.preset.ts                   # Partagé web + mobile
└── package.json
```

### `packages/sdk/`

```
packages/sdk/
└── src/
    ├── generated/                       # Auto-généré depuis /api/docs
    ├── client.ts                        # Configuration instance
    └── hooks/                           # Wrappers TanStack Query
```

Le SDK est **régénéré automatiquement** à chaque changement OpenAPI côté API. Pipeline CI :
1. API NestJS expose `/api/docs-json`
2. Job CI télécharge le JSON
3. `orval` génère clients + hooks TanStack Query
4. PR auto créé si le SDK change

### `packages/i18n/`

```
packages/i18n/
└── src/
    ├── fr/
    │   ├── common.json
    │   ├── auth.json
    │   ├── products.json
    │   └── ...
    └── en/
```

---

## 🏗️ `infra/` — Infrastructure as Code

```
infra/
├── terraform/
│   ├── modules/
│   │   ├── neon/                        # Postgres
│   │   ├── upstash/                     # Redis
│   │   ├── cloudflare/                  # CDN, DNS, R2, Stream
│   │   ├── vercel/                      # Next.js deployment
│   │   └── railway/                     # NestJS deployment
│   ├── environments/
│   │   ├── prod/
│   │   ├── staging/
│   │   └── dev/
│   └── main.tf
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── compose/
│       ├── docker-compose.dev.yml       # PG + Redis + Meili + Mailhog
│       └── docker-compose.test.yml
│
└── scripts/
    ├── backup-db.sh
    ├── restore-db.sh
    └── rotate-secrets.sh
```

---

## 🔁 `.github/workflows/` — CI/CD

```
.github/workflows/
├── ci.yml                               # Lint + typecheck + tests (toutes PR)
├── deploy-api.yml                       # Deploy NestJS (merge main)
├── deploy-web.yml                       # Deploy Next.js
├── build-mobile.yml                     # EAS build sur tag v*
├── db-migrate.yml                       # Prisma migrate deploy
├── backup.yml                           # Cron backup quotidien
└── e2e.yml                              # Playwright nightly
```

---

## 🧭 Résumé des décisions clés

| Décision | Alternative rejetée | Pourquoi ce choix |
|---|---|---|
| **Monorepo Turborepo** | Multi-repos | Cohérence atomique API+Web+Mobile, cache de build |
| **NestJS** | Next.js API routes seules | Logique marketplace complexe → besoin de modules et DI |
| **Prisma** | Drizzle, TypeORM | Meilleur DX sur schémas complexes, migrations robustes |
| **PostgreSQL** | MongoDB, MySQL | Relationnel + JSONB + PostGIS + FTS + partitioning |
| **Next.js App Router** | Pages Router, Remix | RSC + Server Actions + écosystème React mature |
| **Expo** | React Native bare | OTA updates, builds managés, vitesse de dev |
| **Tailwind + shadcn/ui** | Material UI, Chakra | 100% customisable, bundle minimal, design maison |
| **TanStack Query** | SWR, Redux Toolkit Query | Leader, perf, écosystème, devtools |
| **Zustand** | Redux, Jotai | API minimale, pas de Provider hell |
| **CinetPay** | Stripe | Orange Money + MTN MoMo natifs (90% des paiements CM) |
| **Smile Identity** | Veriff, Sumsub | Leader africain, reconnaît CNI camerounaise |
| **Nexah** | Twilio seul | 5× moins cher pour SMS Cameroun |
| **Cloudflare R2** | AWS S3 | Egress gratuit → économies massives sur contenu imagé |
| **Neon** | RDS, Supabase | Branches par PR, serverless, autoscaling |
| **Redis (Upstash)** | Memcached | Pub/sub + BullMQ + rate limit + cache unifiés |
| **Meilisearch** | Elasticsearch, Algolia | Léger, simple, typo-tolérant, prix raisonnable |
| **Socket.io** | WebSockets natifs, Pusher | Mature, fallback longpolling, namespaces, rooms |
| **BullMQ** | Agenda, Bree | Backed by Redis, UI de monitoring, priorités |
| **Sentry + PostHog + Better Stack** | Datadog | Coût, séparation crash/produit/logs |
| **Argon2id** | bcrypt | Résistant aux GPU (2026) |
| **UUID v7** | UUID v4, int auto | Time-sortable, sharding-ready, pas de hot-spot d'index |
| **Monnaie en BIGINT XAF** | NUMERIC, float | Zéro arrondi, perf, simplicité |

---

## 📚 Pour démarrer

```powershell
# 1. Cloner et installer (npm inclus avec Node 20+)
git clone https://github.com/bee/marketplace.git
cd marketplace
npm install

# 2. Démarrer les services locaux
npm run docker:up

# 3. Copier l'env et configurer
copy .env.example .env
# (renseigner JWT_*_SECRET, ADMIN_*, DATABASE_URL, etc.)

# 4. Migrations + seed
npm run prisma:generate -w @bee/api
npm run prisma:migrate -w @bee/api
npm run db:seed

# 5. Tout lancer (api:3001 + web:3000 via turbo)
npm run dev

# 6. Mobile (dans un autre terminal)
npm run mobile:dev
```

---

*Document vivant — mis à jour à chaque évolution architecturale majeure.*
