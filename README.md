# 🐝 BEE — Marketplace Multi-Vendeurs Cameroun

> Le marché qui bourdonne — plateforme e-commerce complète pour le Cameroun

## Stack Technique

| Couche       | Technologie                          |
|:-------------|:-------------------------------------|
| Framework    | Next.js 14 App Router (TypeScript)   |
| Base de données | PostgreSQL via Neon                |
| ORM          | Drizzle ORM                          |
| Auth         | better-auth (multi-rôles)            |
| Paiements    | Stripe                               |
| Storage      | Cloudflare R2                        |
| Email        | Resend                               |
| SMS/OTP      | Twilio                               |
| Realtime     | Pusher                               |
| i18n         | next-intl (FR/EN)                    |
| UI           | Tailwind CSS — Poppins + Inter       |
| State        | Zustand                              |
| Mobile       | Expo (Phase 11)                      |

## Rôles

| Rôle       | Accès                                    |
|:-----------|:-----------------------------------------|
| `CLIENT`   | Storefront, commandes, wallet            |
| `VENDOR`   | Dashboard boutique, produits, stats      |
| `DELIVERY` | Dashboard livreur, GPS, wallet           |
| `ADMIN`    | Panel admin complet, arbitrage           |

## Démarrage

```bash
# 1. Cloner et installer
git clone <repo>
cd nagoshop
npm install

# 2. Variables d'environnement
cp .env.local .env.local
# Remplir DATABASE_URL, BETTER_AUTH_SECRET, etc.

# 3. Base de données
npm run db:push      # Créer les tables
npm run db:seed      # Seed initial

# 4. Lancer
npm run dev
```

Ouvrir [http://localhost:3000/ui-kit](http://localhost:3000/ui-kit) pour voir le design system.

## Planning des Phases

| Phase | Contenu                      | Durée   |
|:------|:-----------------------------|:--------|
| 1     | ✅ Fondations + DB + UI Kit  | 1 sem   |
| 2     | Auth multi-rôles             | 1 sem   |
| 3     | Catalogue + Storefront       | 1 sem   |
| 4     | Dashboard Vendeur            | 1 sem   |
| 5     | Panier + Paiement Stripe     | 1 sem   |
| 6     | Livraison + Wallet livreur   | 1 sem   |
| 7     | Wallet + Cashback + Promos   | 1 sem   |
| 8     | Admin Panel                  | 1 sem   |
| 9     | Parrainage + Recrutement     | 4 jours |
| 10    | Avis + Litiges + Finitions   | 4 jours |
| 11    | App Mobile Expo              | 3-4 sem |

## Structure DB (Phase 1)

- `users` + `sessions` + `accounts` + `verifications` (better-auth)
- `vendors` + `delivery_agents` + `vendor_delivery_affiliations`
- `categories` + `products` + `product_variants` + `product_variant_combinations`
- `orders` + `order_items` + `order_deliveries` + `order_status_history`
- `subscription_plans` + `vendor_subscriptions` + `delivery_subscriptions`
- `wallets` + `wallet_transactions` + `withdrawal_requests`
- `coupons` + `flash_sales` + `referrals` + `points_accounts` + `job_listings`
- `reviews` + `disputes` + `dispute_messages` + `notifications` + `admin_logs`

---

Made with 🐝 by the BEE team
