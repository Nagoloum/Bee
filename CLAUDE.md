# Instructions pour Claude — Projet Bee

> Fichier chargé automatiquement à chaque nouvelle discussion Claude Code dans ce projet.
> À mettre à jour quand les décisions ou l'état du projet changent.

## Qui et quoi

- **Développeur :** Adam Mehdi (adam.mehdi@datalia.app), travaille seul sur le projet.
- **Projet :** Bee Marketplace — marketplace e-commerce multi-vendeurs pour le Cameroun, cible 3M+ utilisateurs.
- **Langue de travail :** français — toutes les réponses en français.

## Règles absolues

1. **Budget très serré.** Ne jamais recommander un service payant sans proposer d'abord l'alternative gratuite ou self-hosted. Voir section "Stack budget" plus bas.
2. **Planifier avant de coder.** Pour toute nouvelle feature/module : d'abord proposer les micro-tâches, attendre validation, puis implémenter.
3. **Ne pas rebrancher les APIs du front sur le backend** tant que l'utilisateur n'a pas explicitement demandé la Phase 6. Les fichiers `apps/web/src/lib/api-client.ts` et `apps/web/src/hooks/use-auth.ts` doivent rester en mode mock.

## Ordre d'exécution du projet

1. **Phase 0** — Design System + UI Kit (`packages/ui` + `apps/web/src/components/ui`)
2. **Phase 1** — Frontend Web (`apps/web`)
3. **Phase 2** — Frontend Mobile (`apps/mobile`)
4. **Phase 3-4** — Backend NestJS (`apps/api`) + modules métier
5. **Phase 5** — Intégrations externes (CinetPay, R2, Resend…)
6. **Phase 6** — Rebrancher front/mobile sur le vrai backend
7. **Phase 7** — Déploiement production (1 VPS)

## Stack budget minimal choisie

Au lancement, viser ~$6-8/mois total (vs ~$130-480 en stack managée).

| Remplacé | Par |
|---|---|
| Neon + Upstash + Vercel + Railway | **1 VPS** (Hetzner/Contabo ~$5-7/mois) avec Docker Compose |
| Smile Identity (KYC) | **KYC manuel** (upload + review admin) |
| Nexah/Twilio (SMS) | **Email OTP** (Resend free) + Push Expo (gratuit) |
| Google Maps | **Leaflet + OpenStreetMap + Nominatim + OSRM** |
| Meilisearch Cloud | Meilisearch **self-hosted** (Docker, gratuit) |
| Cloudflare Stream | **Reporté** (pas de live shopping au lancement) |

Incontournables gratuits/commission : CinetPay (commission only), R2 (10GB free), Resend (3000 emails/mois free).

## Stack technique

- **Monorepo** Turborepo + npm workspaces
- **Backend** NestJS 10 + Prisma + PostgreSQL 16 + Redis + BullMQ + Meilisearch + Socket.io
- **Web** Next.js 15 (App Router) + React 19 + Tailwind + shadcn/ui + TanStack Query + Zustand
- **Mobile** Expo SDK 52 + Expo Router + NativeWind + MMKV
- **DB** 75 tables (schéma dans `schema.prisma` à la racine, à déplacer dans `apps/api/prisma/`)

## État actuel du code (à vérifier en début de session)

- `apps/web` se lance avec `npm run web:dev` sur http://localhost:3000.
- Page d'accueil `apps/web/src/app/page.tsx` statique, fonctionne.
- Dossiers `(public)`, `(auth)`, `(admin)` **vides**.
- `apps/web/src/components/ui` **vide** — aucune primitive shadcn copiée.
- `apps/api` : squelette NestJS présent mais modules non codés.
- `apps/mobile` : structure Expo présente mais écrans non codés.
- **Notes de config** : `experimental.typedRoutes` retiré de `next.config.ts` (incompatible Turbopack). Flag Turbopack = `--turbo` (pas `--turbopack`) sur Next 15.0.0.

## Commandes clés

```bash
cd d:/Projets/Bee
npm install                        # install depuis la racine uniquement
npm run web:dev                    # Next.js sur :3000
npm run mobile:dev                 # Expo
npm run api:dev                    # NestJS sur :3001 (plus tard)
npm run docker:up                  # PG + Redis + Meili + Mailhog locaux
```

## Documents de référence

- `README.md` — setup et commandes
- `STRUCTURE.md` — architecture complète (636 lignes, très détaillé)
- `Bee_Architecture_Technique.pdf` — PDF technique
- `schema.prisma` — schéma 75 tables

## Phrase d'activation rapide

Si l'utilisateur écrit "continue le projet Bee", relire ce fichier, vérifier l'état du code, puis demander sur quelle phase continuer.
