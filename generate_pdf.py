# -*- coding: utf-8 -*-
"""
Génère le PDF complet Bee - Architecture Technique & Base de Données
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, black, white, grey
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    Preformatted, KeepTogether, Image, NextPageTemplate, PageTemplate, Frame
)
from reportlab.pdfgen import canvas
from datetime import datetime

OUT = r"D:\Projets\Bee\Bee_Architecture_Technique.pdf"

# Palette Bee (miel / noir)
AMBER = HexColor("#F59E0B")
AMBER_DARK = HexColor("#B45309")
INK = HexColor("#111827")
SLATE = HexColor("#334155")
SLATE_LIGHT = HexColor("#F1F5F9")
LINE = HexColor("#E5E7EB")
BG_CODE = HexColor("#F8FAFC")
OK = HexColor("#059669")

styles = getSampleStyleSheet()

def s(name, parent="Normal", **kw):
    st = ParagraphStyle(name, parent=styles[parent], **kw)
    return st

H_COVER_TITLE = s("CoverTitle", "Title", fontSize=36, leading=42, textColor=INK, alignment=TA_CENTER, spaceAfter=8, fontName="Helvetica-Bold")
H_COVER_SUB = s("CoverSub", "Normal", fontSize=16, leading=22, textColor=SLATE, alignment=TA_CENTER, spaceAfter=6)
H_COVER_META = s("CoverMeta", "Normal", fontSize=11, leading=16, textColor=SLATE, alignment=TA_CENTER)

H1 = s("H1", "Heading1", fontSize=22, leading=28, textColor=AMBER_DARK, spaceBefore=10, spaceAfter=12, fontName="Helvetica-Bold")
H2 = s("H2", "Heading2", fontSize=16, leading=22, textColor=INK, spaceBefore=14, spaceAfter=8, fontName="Helvetica-Bold")
H3 = s("H3", "Heading3", fontSize=13, leading=18, textColor=AMBER_DARK, spaceBefore=10, spaceAfter=6, fontName="Helvetica-Bold")
H4 = s("H4", "Heading4", fontSize=11, leading=15, textColor=INK, spaceBefore=6, spaceAfter=4, fontName="Helvetica-Bold")

BODY = s("Body", "Normal", fontSize=10, leading=14, textColor=INK, spaceAfter=6, alignment=TA_JUSTIFY)
BODY_SM = s("BodySm", "Normal", fontSize=9, leading=12, textColor=SLATE)
BULLET = s("Bullet", "Normal", fontSize=10, leading=14, textColor=INK, leftIndent=16, bulletIndent=4, spaceAfter=3)
CODE = s("Code", "Code", fontSize=8, leading=10, textColor=INK, backColor=BG_CODE, borderPadding=6, borderColor=LINE, borderWidth=0.5, leftIndent=4, rightIndent=4)
TOC_ITEM = s("ToC", "Normal", fontSize=11, leading=18, textColor=INK)
TOC_SEC = s("ToCSec", "Normal", fontSize=12, leading=20, textColor=AMBER_DARK, fontName="Helvetica-Bold", spaceBefore=6)

def hr():
    from reportlab.platypus import HRFlowable
    return HRFlowable(width="100%", thickness=0.8, color=LINE, spaceBefore=4, spaceAfter=8)

def table_kv(rows, col_widths=None, header=None):
    """Table 2 cols : outil, rôle"""
    data = []
    if header:
        data.append(header)
    for r in rows:
        data.append([Paragraph(str(r[0]), s("tk","Normal",fontSize=9,leading=12,fontName="Helvetica-Bold",textColor=INK)),
                     Paragraph(str(r[1]), s("tv","Normal",fontSize=9,leading=12,textColor=SLATE))])
    cw = col_widths or [4.2*cm, 12*cm]
    t = Table(data, colWidths=cw, repeatRows=1 if header else 0)
    ts = [
        ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('LEFTPADDING',(0,0),(-1,-1),6),
        ('RIGHTPADDING',(0,0),(-1,-1),6),
        ('TOPPADDING',(0,0),(-1,-1),5),
        ('BOTTOMPADDING',(0,0),(-1,-1),5),
        ('GRID',(0,0),(-1,-1),0.4,LINE),
        ('ROWBACKGROUNDS',(0,0 if not header else 1),(-1,-1),[white, SLATE_LIGHT]),
    ]
    if header:
        ts += [
            ('BACKGROUND',(0,0),(-1,0), AMBER_DARK),
            ('TEXTCOLOR',(0,0),(-1,0), white),
            ('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),
            ('FONTSIZE',(0,0),(-1,0),10),
        ]
    t.setStyle(TableStyle(ts))
    return t

def table_cols(rows, col_widths, header):
    """Table multi cols (schéma BDD)"""
    data = [header]
    for r in rows:
        data.append([Paragraph(str(c), s(f"c","Normal",fontSize=8,leading=10,textColor=INK)) for c in r])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('LEFTPADDING',(0,0),(-1,-1),4),
        ('RIGHTPADDING',(0,0),(-1,-1),4),
        ('TOPPADDING',(0,0),(-1,-1),4),
        ('BOTTOMPADDING',(0,0),(-1,-1),4),
        ('GRID',(0,0),(-1,-1),0.3,LINE),
        ('BACKGROUND',(0,0),(-1,0), INK),
        ('TEXTCOLOR',(0,0),(-1,0), white),
        ('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),
        ('FONTSIZE',(0,0),(-1,0),9),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[white, SLATE_LIGHT]),
    ]))
    return t

def sql_block(code):
    return Preformatted(code, CODE)

def para(text):
    return Paragraph(text, BODY)

def bullets(items):
    from reportlab.platypus import ListFlowable, ListItem
    lis = [ListItem(Paragraph(x, BODY), leftIndent=10, bulletColor=AMBER_DARK) for x in items]
    return ListFlowable(lis, bulletType='bullet', start='•', leftIndent=16, bulletFontSize=10)

# ========= PAGE HEADER/FOOTER =========
def header_footer(canv, doc):
    canv.saveState()
    # Footer
    canv.setStrokeColor(LINE); canv.setLineWidth(0.5)
    canv.line(2*cm, 1.4*cm, A4[0]-2*cm, 1.4*cm)
    canv.setFont("Helvetica", 8); canv.setFillColor(SLATE)
    canv.drawString(2*cm, 1.0*cm, "Bee Marketplace — Architecture Technique & Base de Données")
    canv.drawRightString(A4[0]-2*cm, 1.0*cm, f"Page {doc.page}")
    # Header (sauf cover)
    if doc.page > 1:
        canv.setFillColor(AMBER_DARK)
        canv.rect(0, A4[1]-0.5*cm, A4[0], 0.5*cm, fill=1, stroke=0)
        canv.setFillColor(white); canv.setFont("Helvetica-Bold", 9)
        canv.drawString(2*cm, A4[1]-0.35*cm, "BEE")
        canv.setFont("Helvetica", 9)
        canv.drawRightString(A4[0]-2*cm, A4[1]-0.35*cm, "Marketplace Cameroun")
    canv.restoreState()

# ========= BUILD DOCUMENT =========
doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    leftMargin=2*cm, rightMargin=2*cm,
    topMargin=1.8*cm, bottomMargin=1.8*cm,
    title="Bee - Architecture Technique", author="Bee Team"
)

story = []

# ========== COVER ==========
story.append(Spacer(1, 4*cm))
story.append(Paragraph("🐝", s("Emoji","Normal",fontSize=64,alignment=TA_CENTER,textColor=AMBER)))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("BEE", H_COVER_TITLE))
story.append(Paragraph("Marketplace multi-vendeurs Cameroun", H_COVER_SUB))
story.append(Spacer(1, 0.5*cm))
story.append(Paragraph("Architecture Technique Complète<br/>Base de Données Haute Scalabilité", H_COVER_SUB))
story.append(Spacer(1, 2.5*cm))
# Badge
badge_tbl = Table([[Paragraph("Conçu pour <b>3 millions+</b> d'utilisateurs", s("bd","Normal",fontSize=12,textColor=white,alignment=TA_CENTER))]],
                  colWidths=[10*cm])
badge_tbl.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,-1), AMBER_DARK),
    ('TEXTCOLOR',(0,0),(-1,-1), white),
    ('ALIGN',(0,0),(-1,-1),'CENTER'),
    ('TOPPADDING',(0,0),(-1,-1),10),
    ('BOTTOMPADDING',(0,0),(-1,-1),10),
    ('BOX',(0,0),(-1,-1),0,AMBER_DARK),
    ('ROUNDEDCORNERS',[8,8,8,8]),
]))
story.append(badge_tbl)
story.append(Spacer(1, 3*cm))
story.append(Paragraph(f"Document généré le {datetime.now().strftime('%d %B %Y')}", H_COVER_META))
story.append(Paragraph("Version 1.0 — Définitif", H_COVER_META))
story.append(PageBreak())

# ========== TABLE DES MATIÈRES ==========
story.append(Paragraph("Table des matières", H1))
story.append(hr())

toc_items = [
    ("PARTIE 1 — STACK TECHNIQUE", None, True),
    ("1.1 Vue d'ensemble & monorepo", "4", False),
    ("1.2 Backend — NestJS + PostgreSQL", "5", False),
    ("1.3 Frontend Web — Next.js 15", "7", False),
    ("1.4 Mobile — Expo (React Native)", "9", False),
    ("1.5 Services externes (Cameroun)", "11", False),
    ("1.6 DevOps & Hébergement", "13", False),
    ("PARTIE 2 — BASE DE DONNÉES", None, True),
    ("2.1 Principes de conception", "15", False),
    ("2.2 Stratégie de scalabilité 3M+ users", "16", False),
    ("2.3 Schéma complet — 75 tables / 22 domaines", "18", False),
    ("2.4 Sécurité & Performance", "40", False),
    ("2.5 Checklist production-ready", "41", False),
    ("ANNEXES", None, True),
    ("A. Diagramme relations clés", "42", False),
    ("B. Seed admin initial", "43", False),
    ("C. Variables d'environnement", "44", False),
]
for label, page, is_sec in toc_items:
    if is_sec:
        story.append(Spacer(1,6))
        story.append(Paragraph(label, TOC_SEC))
    else:
        line = Table([[Paragraph(label, TOC_ITEM), Paragraph(page or "—", s("tp","Normal",fontSize=11,textColor=SLATE,alignment=2))]],
                     colWidths=[14*cm, 1.5*cm])
        line.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),12)]))
        story.append(line)
story.append(PageBreak())

# ========== PARTIE 1 — STACK ==========
story.append(Paragraph("PARTIE 1", H3))
story.append(Paragraph("Stack Technique Complète", H1))
story.append(hr())
story.append(para(
    "Cette première partie détaille l'ensemble des outils, librairies et services choisis pour construire "
    "la plateforme Bee. Chaque brique est accompagnée de son <b>rôle précis</b> dans l'architecture. "
    "L'approche retenue est un <b>monorepo Turborepo</b> qui maximise la réutilisation entre le web, "
    "le mobile et l'API, avec une séparation claire des responsabilités."
))
story.append(Spacer(1,8))

# 1.1 Vue d'ensemble
story.append(Paragraph("1.1 Vue d'ensemble & structure monorepo", H2))
story.append(para("Un seul dépôt Git contient tous les apps et packages partagés. Turborepo orchestre les builds et met en cache les artefacts pour accélérer la CI."))
story.append(sql_block("""bee/
├── apps/
│   ├── api/         → NestJS 10 (backend central, business logic)
│   ├── web/         → Next.js 15 (storefront + dashboards web)
│   └── mobile/      → Expo (React Native — iOS + Android)
├── packages/
│   ├── ui/          → Composants shadcn/ui + NativeWind partagés
│   ├── types/       → Types TypeScript partagés (DTOs, enums)
│   ├── validators/  → Schémas Zod partagés (double validation)
│   ├── sdk/         → Client API auto-généré depuis OpenAPI
│   ├── i18n/        → Traductions FR / EN centralisées
│   └── config/      → ESLint, TS, Tailwind, Prettier
└── infra/           → Terraform, Docker, pipelines CI"""))
story.append(Spacer(1,6))
story.append(para("<b>Bénéfices clés :</b>"))
story.append(bullets([
    "Un seul PR peut mettre à jour API + Web + Mobile de manière atomique",
    "Les types TypeScript se propagent automatiquement de l'API au client",
    "Cache de build partagé → CI 5 à 10× plus rapide",
    "Onboarding développeur : un seul <i>clone</i>, un seul <i>install</i>"
]))
story.append(PageBreak())

# 1.2 Backend
story.append(Paragraph("1.2 Backend — NestJS + PostgreSQL", H2))
story.append(para("Le backend est une API REST (avec OpenAPI auto-généré) bâtie sur NestJS. Sa structure modulaire permet à plusieurs équipes de travailler en parallèle sans conflits."))

backend_rows = [
    ("NestJS 10", "Framework backend modulaire (Modules/Controllers/Services/Repositories). Fournit l'injection de dépendances, les Guards, Interceptors, Pipes, ExceptionFilters. Squelette idéal pour une logique métier marketplace complexe (commandes, escrow, enchères, litiges)."),
    ("TypeScript 5", "Type-safety bout-en-bout, du schéma Prisma jusqu'au composant React Native mobile."),
    ("Prisma 5", "ORM type-safe. Génère un client fortement typé, gère les migrations, supporte les requêtes brutes pour les cas de performance critique."),
    ("PostgreSQL 16", "Base de données principale (OLTP). Gère 3M+ utilisateurs grâce aux partitions natives, JSONB, extensions PostGIS et Full-Text Search."),
    ("PgBouncer", "Pool de connexions en mode 'transaction'. Indispensable à forte charge : 3 000 connexions client → 50 connexions DB réelles."),
    ("Redis 7 (Upstash)", "Cache multi-niveaux (produits hot, settings, sessions), rate-limiting, pub/sub temps réel, verrous distribués."),
    ("BullMQ", "Files de jobs basées Redis : envois SMS/email, webhooks CinetPay, libération automatique d'escrow, anti-arnaque, ré-indexation Meilisearch, exports CSV admin."),
    ("Meilisearch", "Moteur de recherche plein-texte (FR/EN), typo-tolérant, facettes, filtres géographiques. Re-indexation temps réel via CDC (Change Data Capture) PostgreSQL."),
    ("Socket.io", "Temps réel via @nestjs/websockets : live shopping, chat litiges, tracking GPS livreur, notifications instantanées."),
    ("class-validator + class-transformer", "Validation des DTOs côté serveur. Double barrière avec Zod côté client."),
    ("Zod", "Validation runtime partagée web/mobile/api (via le package validators). Un seul schéma, trois plateformes."),
    ("@nestjs/jwt + jose", "Émission et validation des access tokens (15 min) + refresh tokens (30 jours)."),
    ("otplib", "Génération et vérification TOTP pour la 2FA admin (compatible Google Authenticator, Authy, 1Password)."),
    ("argon2", "Hashage des mots de passe. Plus sûr que bcrypt en 2026 (résistant aux GPU)."),
    ("helmet + @nestjs/throttler", "Headers de sécurité HTTP + rate limiting par IP et par utilisateur."),
    ("@nestjs/swagger", "Génère automatiquement la spécification OpenAPI 3.1 → alimente le SDK client auto-généré."),
    ("nestjs-cls", "Request context (utilisateur connecté, trace_id) propagé dans toute la stack asynchrone."),
    ("Pino", "Logger JSON ultra-rapide. Logs agrégés vers Better Stack."),
    ("OpenTelemetry", "Traces distribuées (API → PostgreSQL → Redis → APIs externes). Debug production simplifié."),
]
story.append(Spacer(1,6))
story.append(table_kv(backend_rows, header=["Outil", "Rôle précis dans l'architecture"]))
story.append(PageBreak())

# 1.3 Frontend Web
story.append(Paragraph("1.3 Frontend Web — Next.js 15", H2))
story.append(para("Le frontend web sert à la fois le storefront public (SEO crucial) et les dashboards authentifiés (vendeur, livreur, admin). Next.js 15 avec l'App Router combine Server Components pour la performance et Server Actions pour les mutations."))

web_rows = [
    ("Next.js 15 (App Router)", "Framework React avec React Server Components, Server Actions, streaming SSR, ISR. Storefront SEO-ready + dashboards SSR."),
    ("React 19", "Librairie UI de base. Concurrent features, use() hook, Actions natives."),
    ("Tailwind CSS 4", "Styling utility-first. Design system cohérent, tree-shaking automatique (CSS final <10 KB)."),
    ("shadcn/ui", "Composants copiés dans le repo (pas un package npm) basés sur Radix UI. 100% customisables, accessibilité intégrée."),
    ("Radix UI", "Primitives accessibles (Dialog, Dropdown, Popover, Select, Tooltip) sous-jacentes à shadcn/ui."),
    ("TanStack Query v5", "State serveur : fetch, cache, invalidation, optimistic updates, pagination infinie. La référence pour les données asynchrones."),
    ("Zustand", "State client léger (panier, filtres UI, modales). Sans boilerplate, 2 KB gzipped."),
    ("React Hook Form", "Gestion des formulaires performante (champs non-contrôlés). Pas de re-render au keystroke."),
    ("Zod resolver", "Validation des formulaires synchronisée avec les schémas backend."),
    ("next-intl", "Internationalisation (FR par défaut, EN). Routing localisé /fr/..., /en/..., format dates/prix FCFA."),
    ("TanStack Table v8", "Tables admin : tri, filtres, pagination serveur, virtualisation (affichage de 100 000 lignes sans lag)."),
    ("Recharts", "Graphiques dashboards (revenus, commandes, tendances)."),
    ("Tremor", "Composants dashboards pré-stylés (KPI cards, area charts, tables de métriques)."),
    ("Framer Motion", "Animations fluides : transitions de pages, stories, flash sales, micro-interactions."),
    ("React Email + Resend", "Templates d'emails écrits en JSX, preview en dev, envoi transactionnel via Resend."),
    ("next/font", "Chargement optimisé de Poppins (titres) + Inter (texte), auto-hébergé, zéro FOUT."),
    ("next/image + Cloudflare R2 loader", "Images responsives, formats AVIF/WebP automatiques, lazy loading natif."),
    ("Sonner", "Toasts élégants (succès, erreurs, actions)."),
    ("Lucide React", "Jeu d'icônes cohérent (1 400+ icônes tree-shakeable)."),
    ("date-fns", "Manipulation de dates (format FR, distances relatives)."),
    ("Playwright", "Tests E2E critiques : checkout complet, création produit, paiement, arbitrage litige."),
    ("Vitest", "Tests unitaires rapides (hooks, utils, composants)."),
]
story.append(Spacer(1,6))
story.append(table_kv(web_rows, header=["Outil", "Rôle précis dans l'architecture"]))
story.append(PageBreak())

# Web structure
story.append(Paragraph("Structure interne (web)", H3))
story.append(para("Organisation codée pour la réutilisabilité maximale — séparation stricte entre primitives, composés, features et layouts."))
story.append(sql_block("""apps/web/src/
├── app/
│   ├── (public)/        → Storefront SEO (accueil, catalogue, fiche, boutique)
│   ├── (auth)/          → Login, register, OTP, reset password
│   ├── (client)/        → Espace client (commandes, wallet, avis)
│   ├── (vendor)/        → Dashboard vendeur (produits, stats, coupons)
│   ├── (delivery)/      → Dashboard livreur (courses, GPS, wallet)
│   ├── (admin)/         → Panel admin complet (CMS, users, finance)
│   └── api/             → Routes API (webhooks CinetPay, uploads)
├── components/
│   ├── ui/              → Primitives shadcn (Button, Input, Card, Modal)
│   ├── composed/        → Composés (ProductCard, OrderRow, WalletBadge)
│   ├── features/        → Features complètes (CheckoutFlow, WalletPanel)
│   └── layouts/         → Layouts par rôle (ClientShell, VendorShell…)
├── hooks/               → useAuth, useCart, useWallet, useRealtime, useFlashSales
├── services/            → Wrappers SDK (api-client, storage, analytics)
├── contexts/            → AuthContext, ThemeContext, LocaleContext
├── lib/                 → utils (format, a11y, currency XAF)
└── messages/            → fr.json, en.json"""))
story.append(PageBreak())

# 1.4 Mobile
story.append(Paragraph("1.4 Mobile — Expo (React Native)", H2))
story.append(para("L'app mobile partage ~60% de code avec le web (hooks métier, validators, types, SDK). Expo permet un déploiement iOS + Android rapide avec OTA updates."))

mobile_rows = [
    ("Expo SDK 52", "Runtime managé React Native. Build iOS/Android via EAS, OTA updates (push correctifs sans re-soumettre au store)."),
    ("Expo Router v4", "Navigation file-based (identique à Next.js App Router)."),
    ("React Native 0.76", "Couche UI native (composants natifs iOS/Android)."),
    ("NativeWind v4", "Tailwind CSS sur React Native. Réutilise exactement les classes du web."),
    ("TanStack Query (partagé)", "State serveur partagé web/mobile (même packages, mêmes hooks)."),
    ("Zustand (partagé)", "State client partagé (panier persistant multi-device)."),
    ("MMKV", "Storage clé/valeur ultra-rapide (200× AsyncStorage). Cache offline, tokens, préférences."),
    ("@tanstack/query-persist-client", "Persiste le cache React Query → app pleinement utilisable hors-ligne."),
    ("react-native-maps", "Maps natives iOS (Apple Maps) / Android (Google Maps)."),
    ("expo-location", "GPS tracking livreur (foreground + background, économe en batterie)."),
    ("expo-notifications", "Push APNS (iOS) + FCM (Android) unifiés. Canaux personnalisés."),
    ("expo-camera + expo-image-picker", "Upload de photos produits, CNI, preuves de livraison, avis avec photos."),
    ("expo-document-picker", "Upload CV pour candidatures aux offres d'emploi."),
    ("expo-local-authentication", "Biométrie (FaceID / TouchID / empreinte Android) pour confirmer paiements."),
    ("expo-secure-store", "Stockage sécurisé des tokens (Keychain iOS, Keystore Android)."),
    ("react-native-reanimated 3", "Animations natives 60 fps (stories, transitions, pull-to-refresh)."),
    ("react-native-gesture-handler", "Gestes fluides : swipe stories, pinch-to-zoom produit, pull-to-refresh."),
    ("Expo Battery", "Détection batterie <20% → active le mode éco (désactive animations, baisse qualité images, sombre forcé)."),
    ("expo-av", "Lecture vidéo (live shopping, stories vidéo, replay VOD)."),
    ("Sentry React Native", "Crash reporting + monitoring de performances (sourcemaps automatiques)."),
]
story.append(Spacer(1,6))
story.append(table_kv(mobile_rows, header=["Outil", "Rôle précis dans l'architecture"]))
story.append(PageBreak())

# 1.5 Services externes
story.append(Paragraph("1.5 Services externes (adaptés au Cameroun)", H2))
story.append(para("Les services externes sont sélectionnés pour coller au contexte camerounais : Mobile Money d'abord (90% des paiements), SMS locaux moins chers, KYC adapté aux pièces d'identité africaines."))

svc_rows = [
    ("CinetPay", "Passerelle de paiement principale. Supporte Orange Money, MTN MoMo et cartes. Gère l'escrow, les payouts automatiques vers wallets vendeur/livreur."),
    ("NotchPay (fallback)", "Passerelle secondaire si CinetPay est indisponible. Mêmes APIs Mobile Money."),
    ("Smile Identity", "Vérification KYC/CNI camerounaise : OCR du document + vérification base officielle + liveness detection (selfie biométrique anti-deepfake). Leader africain."),
    ("Nexah", "Passerelle SMS locale Cameroun (OTP, alertes commandes). ~5× moins cher que Twilio."),
    ("Twilio (fallback)", "SMS international si Nexah indisponible."),
    ("Resend", "Emails transactionnels (confirmations, reçus, reset password). Excellent DX, templates React Email."),
    ("Cloudflare R2", "Object storage S3-compatible. Egress gratuit → économies massives pour un site très imagé. Stocke photos produits, vidéos, CNI (chiffrées)."),
    ("Cloudflare Images", "Resize et formats automatiques (AVIF, WebP, JPEG selon le device). Une seule URL, N variantes."),
    ("Cloudflare Stream", "Vidéos live shopping + VOD replay (HLS/DASH adaptatif, bitrate auto)."),
    ("Google Maps Platform", "Geocoding (adresse → lat/lng), Places Autocomplete, calcul d'itinéraires livreur."),
    ("OpenAI GPT-4o-mini / Claude Haiku 4.5", "Service client IA : FAQ, pré-tri des litiges (80% auto), recherche vocale, résumés d'avis."),
    ("Sentry", "Crash reporting backend + web + mobile (sourcemaps, breadcrumbs, alerting Slack/email)."),
    ("PostHog", "Analytics produit (funnels, cohortes, feature flags, session replay). Self-host possible."),
    ("Better Stack", "Logs centralisés + status page publique + uptime monitoring."),
    ("Infisical", "Gestion des secrets : rotation 90j, audit, injection CI, jamais dans Git."),
]
story.append(Spacer(1,6))
story.append(table_kv(svc_rows, header=["Service", "Rôle précis dans l'architecture"]))
story.append(PageBreak())

# 1.6 DevOps
story.append(Paragraph("1.6 DevOps & Hébergement", H2))
story.append(para("L'infrastructure est majoritairement serverless ou managée, afin de garder les coûts bas en phase de lancement et scaler automatiquement avec la croissance."))

devops_rows = [
    ("GitHub + GitHub Actions", "Dépôt Git + CI/CD (lint, type-check, tests, build, deploy sur merge main). Environnements preview par PR."),
    ("Turborepo Remote Cache", "Cache de build partagé entre développeurs et CI → builds 5 à 10× plus rapides."),
    ("Docker + docker-compose", "Environnement dev local (PostgreSQL, Redis, Meilisearch, Mailhog) identique à la prod."),
    ("Railway ou Fly.io (région jnb)", "Hébergement de l'API NestJS. Région Johannesburg → latence ~110 ms pour le Cameroun."),
    ("Vercel", "Hébergement de Next.js. Edge Network global, ISR, Image Optimization intégrée."),
    ("Neon (PostgreSQL)", "PostgreSQL serverless avec branches (un env preview par PR), autoscaling, read replicas automatiques."),
    ("Upstash (Redis)", "Redis serverless (pay-per-request), multi-region, compatible REST."),
    ("Meilisearch Cloud ou Hetzner self-hosted", "Hébergement du moteur de recherche."),
    ("Cloudflare", "CDN global + WAF + DDoS + Workers pour edge logic + Turnstile (anti-bot)."),
    ("Expo EAS Build + Submit", "Builds mobiles signés, soumission Play Store et App Store."),
    ("Terraform", "Infrastructure as Code (providers Cloudflare, Vercel, Neon, Upstash)."),
    ("Prometheus + Grafana (optionnel self-host)", "Métriques système avancées si besoin en phase 3M+ users."),
]
story.append(Spacer(1,6))
story.append(table_kv(devops_rows, header=["Brique", "Rôle précis dans l'architecture"]))
story.append(PageBreak())

# ========== PARTIE 2 — BASE DE DONNÉES ==========
story.append(Paragraph("PARTIE 2", H3))
story.append(Paragraph("Base de Données Haute Scalabilité", H1))
story.append(hr())
story.append(para(
    "Cette partie détaille la conception de la base PostgreSQL de Bee, prévue pour supporter "
    "<b>3 millions d'utilisateurs et au-delà</b>. Elle est organisée en <b>22 domaines métier</b> "
    "couvrant <b>75 tables</b>, avec une stratégie de partitionnement, d'indexation et de "
    "caching multi-niveaux conçue pour rester performante à très grande échelle."
))
story.append(Spacer(1,10))

# 2.1 Principes
story.append(Paragraph("2.1 Principes de conception fondamentaux", H2))
principes = [
    ("Clés primaires : UUID v7", "Time-sortable → sharding-ready, évite les hot-spots d'index B-tree propres aux UUID v4. Scale horizontal plus tard sans migration."),
    ("Nommage snake_case + pluriel", "Tables nommées au pluriel (users, orders). Colonnes en snake_case. Cohérent avec Prisma et Rails-like."),
    ("Soft delete universel", "Colonne deleted_at TIMESTAMPTZ. Aucune donnée n'est réellement supprimée → l'admin peut restaurer. Index partiels WHERE deleted_at IS NULL."),
    ("Timestamps automatiques", "created_at, updated_at (trigger auto) sur toutes les tables."),
    ("Enums PostgreSQL natifs", "Type CREATE TYPE order_status AS ENUM (...). Type-safe + stockage compact vs VARCHAR."),
    ("Monnaie en entiers (BIGINT)", "Unité : XAF entier, pas de centime. Zéro erreur d'arrondi, calculs déterministes."),
    ("JSONB pour payloads flexibles", "Metadata, raw responses providers, attributs de variants, config feature flags. Indexable via GIN."),
    ("PostGIS pour la géographie", "GEOGRAPHY(Point, 4326) + index GIST. ST_DWithin pour recherche 'voisins 5 km' en <5ms sur 10M points."),
    ("Full-Text Search natif", "Colonnes tsvector générées + GIN index. Fallback si Meilisearch down."),
    ("Contraintes CHECK", "amount >= 0, rating BETWEEN 1 AND 5, etc. Défense en profondeur au niveau base."),
    ("Foreign keys systématiques", "ON DELETE RESTRICT par défaut, CASCADE uniquement pour lignes enfants pures (cart_items, user_sessions)."),
    ("Audit trail centralisé", "Table audit_logs capture TOUTES les actions admin avec diff JSON."),
    ("Event sourcing light", "Tables *_events (order_status_events, wallet_transactions) pour rejouer l'historique."),
    ("Outbox pattern", "Table outbox_events garantit l'envoi fiable de webhooks/notifs même en cas de crash post-commit."),
    ("Idempotency keys", "Toutes les opérations financières (paiements, retraits) portent une clé idempotente unique."),
]
story.append(table_kv(principes, header=["Principe", "Justification & implémentation"]))
story.append(PageBreak())

# 2.2 Scalabilité
story.append(Paragraph("2.2 Stratégie de scalabilité pour 3M+ utilisateurs", H2))

story.append(Paragraph("A. Partitionnement natif PostgreSQL", H3))
story.append(para("Partitionnement <b>PARTITION BY RANGE (created_at)</b> mensuel sur les tables à fort volume. Permet <b>DROP PARTITION</b> instantané pour purger les données anciennes (vs <b>DELETE</b> qui bloque)."))

part_rows = [
    ("orders", "~1.5M / mois", "Requêtes admin filtrées par période"),
    ("order_items", "~4M / mois", "Suit orders (même cardinalité × 2.5)"),
    ("wallet_transactions", "~10M / mois", "Historique financier massif"),
    ("notifications", "~50M / mois", "Push + in-app (énorme volume)"),
    ("audit_logs", "~15M / mois", "Compliance & debug"),
    ("delivery_tracking_events", "~30M / mois", "GPS pings toutes les 30s"),
    ("messages", "~5M / mois", "Chats IA + support + litiges"),
    ("story_views", "~20M / mois", "TTL 24h → drop partition anciennes"),
    ("auction_bids", "~500k / mois", "Pic durant enchères live"),
    ("points_transactions", "~10M / mois", "Gamification"),
]
story.append(table_cols(part_rows, [5.5*cm, 3.5*cm, 7*cm], ["Table", "Volume estimé", "Raison du partitionnement"]))
story.append(Spacer(1,8))
story.append(para("<b>Bénéfices :</b>"))
story.append(bullets([
    "DROP PARTITION pour purger données anciennes = instantané (vs DELETE qui bloque)",
    "Queries avec filtre date ne scannent qu'1-2 partitions",
    "Index plus petits → cache mémoire plus efficace",
    "Archive vers S3 Glacier des partitions >24 mois"
]))

story.append(Paragraph("B. Read replicas", H3))
story.append(bullets([
    "<b>1 primary</b> pour les écritures",
    "<b>2 replicas</b> pour les lectures analytiques, dashboards admin, recherches complexes",
    "Routing automatique via Prisma Accelerate ou middleware custom (read ops → replica, writes → primary)"
]))

story.append(Paragraph("C. Pool de connexions", H3))
story.append(bullets([
    "<b>PgBouncer</b> en mode transaction",
    "3 000 connexions client → 50 connexions DB réelles",
    "Obligatoire pour serverless (Vercel, Edge functions) qui ouvrent une connexion par lambda"
]))

story.append(Paragraph("D. Caching multi-niveaux", H3))
cache_rows = [
    ("Edge", "Cloudflare CDN", "1 h", "Pages publiques, images, CSS/JS"),
    ("Next.js", "unstable_cache + revalidateTag", "5 min", "Catalogue, boutiques, fiches produit"),
    ("Redis hot", "Upstash", "60 s", "Settings, plans, catégories, session user"),
    ("Redis warm", "Upstash", "10 min", "Top 1 000 produits"),
    ("Postgres", "Materialized views", "Refresh 1 h", "Statistiques dashboards"),
    ("Navigateur", "TanStack Query", "Session", "Panier, profil utilisateur"),
]
story.append(table_cols(cache_rows, [2.8*cm, 4*cm, 2.5*cm, 6.7*cm], ["Niveau", "Outil", "Durée", "Contenu"]))

story.append(PageBreak())

story.append(Paragraph("E. Stratégie d'indexation", H3))
story.append(bullets([
    "<b>B-tree classiques</b> sur clés étrangères et colonnes triables",
    "<b>Index partiels</b> (WHERE deleted_at IS NULL) pour soft-delete",
    "<b>Index composites</b> ordre optimisé : égalité d'abord, puis tri/range",
    "<b>GIN</b> pour tsvector (Full-Text Search) et JSONB (requêtes sur clés)",
    "<b>GIST</b> pour PostGIS (recherche géo 'voisins 5 km')",
    "<b>BRIN</b> sur created_at des tables partitionnées (super léger, parfait pour append-only)",
    "<b>Covering indexes</b> (INCLUDE col) pour Index-Only Scan"
]))

story.append(Paragraph("F. Sharding roadmap (au-delà de 10M users)", H3))
story.append(bullets([
    "<b>Phase 1 (0-3M users) :</b> mono-instance + 2 replicas + partitions ✅",
    "<b>Phase 2 (3-10M users) :</b> déplacer notifications, audit_logs, tracking_events sur cluster séparé (logical sharding par domaine)",
    "<b>Phase 3 (10M+ users) :</b> Citus (PostgreSQL distribué) sur user_id pour données user-scoped ; tables globales restent mono-nœud"
]))

story.append(PageBreak())

# ========== 2.3 Schéma complet par domaine ==========
story.append(Paragraph("2.3 Schéma complet — 75 tables en 22 domaines", H2))
story.append(para("Conventions : toutes les tables possèdent implicitement <b>id UUID PK DEFAULT uuid_generate_v7()</b>, <b>created_at</b>, <b>updated_at</b>, <b>deleted_at</b>. Seules les colonnes métier sont listées ci-dessous."))
story.append(Spacer(1,8))

# Helper pour afficher un schéma de table
def tbl_schema(title, icon, rows, indexes=None, notes=None):
    els = []
    els.append(Paragraph(f"{icon} <b>{title}</b>", H4))
    data = rows
    t = Table(data, colWidths=[4.5*cm, 4.5*cm, 7.5*cm])
    t.setStyle(TableStyle([
        ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('LEFTPADDING',(0,0),(-1,-1),4),
        ('RIGHTPADDING',(0,0),(-1,-1),4),
        ('TOPPADDING',(0,0),(-1,-1),3),
        ('BOTTOMPADDING',(0,0),(-1,-1),3),
        ('GRID',(0,0),(-1,-1),0.3,LINE),
        ('BACKGROUND',(0,0),(-1,0), SLATE_LIGHT),
        ('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),
        ('FONTSIZE',(0,0),(-1,-1),8),
        ('TEXTCOLOR',(0,0),(-1,0),INK),
    ]))
    els.append(t)
    if indexes:
        els.append(Spacer(1,2))
        els.append(Paragraph("<i>Index :</i> " + " • ".join(indexes), BODY_SM))
    if notes:
        els.append(Paragraph(f"<i>{notes}</i>", BODY_SM))
    els.append(Spacer(1,8))
    return KeepTogether(els)

HDR = ["Colonne", "Type", "Rôle / Contrainte"]

# ========= DOMAINE 1 — AUTH =========
story.append(Paragraph("🔐 Domaine 1 — Identité & Authentification (7 tables)", H3))

story.append(tbl_schema("users", "👤", [HDR,
    ["email","CITEXT UNIQUE","insensible à la casse"],
    ["phone_e164","VARCHAR(16) UNIQUE","+237..."],
    ["password_hash","TEXT","argon2id"],
    ["role","ENUM","CLIENT / VENDOR / DELIVERY / ADMIN"],
    ["status","ENUM","ACTIVE / SUSPENDED / BANNED / PENDING_KYC"],
    ["email_verified_at","TIMESTAMPTZ",""],
    ["phone_verified_at","TIMESTAMPTZ",""],
    ["is_kyc_verified","BOOLEAN","default false"],
    ["locale","CHAR(2)","default 'fr'"],
    ["last_login_at","TIMESTAMPTZ",""],
    ["last_login_ip","INET",""],
    ["failed_login_count","INT","default 0 (brute-force lockout)"],
    ["locked_until","TIMESTAMPTZ","lockout temporaire"],
    ["referral_code","VARCHAR(12) UNIQUE","code parrainage auto-généré"],
    ["referred_by_id","UUID FK users","parrain"],
    ["marketing_consent","BOOLEAN","RGPD"],
], indexes=["(email) WHERE deleted_at IS NULL", "(phone_e164)", "(role, status)", "(referral_code)"]))

story.append(tbl_schema("user_profiles", "🪪", [HDR,
    ["user_id","UUID UNIQUE FK users",""],
    ["first_name","VARCHAR(80)",""],
    ["last_name","VARCHAR(80)",""],
    ["display_name","VARCHAR(120)",""],
    ["avatar_url","TEXT","R2"],
    ["date_of_birth","DATE",""],
    ["gender","ENUM","M / F / OTHER / PREFER_NOT_SAY"],
    ["bio","TEXT",""],
]))

story.append(tbl_schema("user_sessions", "🔑", [HDR,
    ["user_id","UUID FK users",""],
    ["refresh_token_hash","TEXT","sha256(token)"],
    ["device_id","VARCHAR(64)",""],
    ["device_name","VARCHAR(120)","ex: iPhone de Daniel"],
    ["platform","VARCHAR(20)","ios / android / web"],
    ["ip","INET",""],
    ["user_agent","TEXT",""],
    ["expires_at","TIMESTAMPTZ","30j"],
    ["revoked_at","TIMESTAMPTZ","logout explicite"],
], indexes=["(user_id, revoked_at)", "(refresh_token_hash)"]))

story.append(tbl_schema("two_factor_secrets", "🛡️", [HDR,
    ["user_id","UUID UNIQUE FK users",""],
    ["secret_encrypted","BYTEA","AES-256-GCM"],
    ["enabled_at","TIMESTAMPTZ",""],
    ["recovery_codes_hash","TEXT[]","10 codes à usage unique"],
    ["last_used_at","TIMESTAMPTZ",""],
], notes="Forcé pour role=ADMIN dès le premier login."))

story.append(tbl_schema("otp_codes", "📱", [HDR,
    ["user_id","UUID FK users",""],
    ["purpose","ENUM","LOGIN / VERIFY_PHONE / RESET_PASSWORD / PAYMENT_CONFIRM"],
    ["code_hash","TEXT","sha256(code)"],
    ["channel","ENUM","SMS / EMAIL / VOICE"],
    ["expires_at","TIMESTAMPTZ","5 min typique"],
    ["consumed_at","TIMESTAMPTZ",""],
    ["attempts","INT","anti-brute-force"],
]))

story.append(tbl_schema("password_resets", "🔓", [HDR,
    ["user_id","UUID FK users",""],
    ["token_hash","TEXT UNIQUE",""],
    ["expires_at","TIMESTAMPTZ","1h"],
    ["used_at","TIMESTAMPTZ",""],
    ["ip","INET","audit sécurité"],
]))

story.append(tbl_schema("oauth_accounts", "🌐", [HDR,
    ["user_id","UUID FK users",""],
    ["provider","ENUM","GOOGLE / APPLE"],
    ["provider_user_id","VARCHAR(255)",""],
    ["email","CITEXT",""],
    ["access_token_enc","BYTEA","chiffré"],
    ["refresh_token_enc","BYTEA","chiffré"],
], indexes=["UNIQUE (provider, provider_user_id)"]))

story.append(PageBreak())

# DOMAINE 2 KYC
story.append(Paragraph("🆔 Domaine 2 — KYC Vérification identité (2 tables)", H3))

story.append(tbl_schema("kyc_verifications", "📷", [HDR,
    ["user_id","UUID FK users",""],
    ["id_type","ENUM","CNI / PASSPORT / DRIVER_LICENSE"],
    ["id_number_encrypted","BYTEA","AES chiffré"],
    ["document_front_url","TEXT","R2 privé"],
    ["document_back_url","TEXT","R2 privé"],
    ["selfie_url","TEXT","R2 privé"],
    ["liveness_score","NUMERIC(5,4)","0.0000-1.0000"],
    ["match_score","NUMERIC(5,4)","selfie vs doc"],
    ["status","ENUM","PENDING / VERIFIED / REJECTED / MANUAL_REVIEW"],
    ["provider","VARCHAR(40)","smile_identity"],
    ["provider_ref","VARCHAR(120)",""],
    ["raw_response","JSONB",""],
    ["reviewed_by_id","UUID FK users","admin"],
    ["reviewed_at","TIMESTAMPTZ",""],
    ["rejection_reason","TEXT",""],
    ["expires_at","DATE","date expiration pièce"],
], indexes=["(user_id, status)", "(status) WHERE status IN ('PENDING','MANUAL_REVIEW')"]))

story.append(tbl_schema("kyc_audit_trail", "📋", [HDR,
    ["kyc_id","UUID FK kyc_verifications",""],
    ["action","VARCHAR(40)","submitted / verified / rejected / reviewed"],
    ["actor_id","UUID FK users",""],
    ["notes","TEXT",""],
]))

# DOMAINE 3 ADDRESSES
story.append(Paragraph("📍 Domaine 3 — Adresses (1 table)", H3))
story.append(tbl_schema("addresses", "🏠", [HDR,
    ["user_id","UUID FK users",""],
    ["label","VARCHAR(60)","Maison / Bureau"],
    ["recipient_name","VARCHAR(160)",""],
    ["phone_e164","VARCHAR(16)",""],
    ["country","CHAR(2)","default 'CM'"],
    ["region","VARCHAR(80)","Centre, Littoral..."],
    ["city","VARCHAR(80)","Yaoundé, Douala"],
    ["neighborhood","VARCHAR(120)","Bastos, Bonapriso"],
    ["street","VARCHAR(240)",""],
    ["landmark","TEXT","'face pharmacie'"],
    ["geom","GEOGRAPHY(Point,4326)","lat/lng - index GIST"],
    ["is_default","BOOLEAN",""],
    ["is_pickup","BOOLEAN","adresse récup vendeur"],
], indexes=["GIST (geom)", "(user_id, is_default)"]))

story.append(PageBreak())

# DOMAINE 4 VENDORS
story.append(Paragraph("🏪 Domaine 4 — Vendeurs (3 tables)", H3))

story.append(tbl_schema("shops", "🏬", [HDR,
    ["vendor_id","UUID UNIQUE FK users",""],
    ["slug","VARCHAR(80) UNIQUE","URL-friendly"],
    ["name","VARCHAR(160)",""],
    ["tagline","VARCHAR(240)","slogan court"],
    ["description","TEXT",""],
    ["logo_url","TEXT",""],
    ["cover_url","TEXT",""],
    ["pickup_address_id","UUID FK addresses",""],
    ["region","VARCHAR(80)","dénormalisé pour filtres"],
    ["status","ENUM","DRAFT / ACTIVE / SUSPENDED / CLOSED"],
    ["rating_avg","NUMERIC(3,2)","dénormalisé via trigger"],
    ["rating_count","INT",""],
    ["total_sales_xaf","BIGINT",""],
    ["total_orders","INT",""],
    ["commission_rate_bps","INT","500 = 5%, override admin"],
    ["badge","ENUM","NONE / FIABLE / TOP_VENDOR / ELITE"],
    ["followers_count","INT",""],
    ["search_vector","TSVECTOR","FTS fallback"],
], indexes=["(slug)", "(region, status)", "GIN (search_vector)"]))

story.append(tbl_schema("subscription_plans", "💳", [HDR,
    ["slug","VARCHAR(40) UNIQUE","vendor_start / vendor_pro / vendor_elite / delivery_freelance / delivery_premium"],
    ["role_target","ENUM","VENDOR / DELIVERY"],
    ["name","VARCHAR(80)",""],
    ["description","TEXT",""],
    ["price_monthly_xaf","BIGINT",""],
    ["price_yearly_xaf","BIGINT",""],
    ["trial_days","INT","30 pour Start, 0 autres"],
    ["features","JSONB","{max_products, photos_max, coupons_max, stories, live_shopping...}"],
    ["display_order","INT",""],
    ["is_active","BOOLEAN",""],
], notes="100% éditable par admin — prix, features, activation."))

story.append(tbl_schema("subscriptions", "📆", [HDR,
    ["user_id","UUID FK users",""],
    ["plan_id","UUID FK subscription_plans",""],
    ["period","ENUM","MONTHLY / YEARLY"],
    ["status","ENUM","TRIALING / ACTIVE / PAST_DUE / CANCELLED / EXPIRED"],
    ["amount_paid_xaf","BIGINT",""],
    ["started_at","TIMESTAMPTZ",""],
    ["current_period_end","TIMESTAMPTZ",""],
    ["trial_ends_at","TIMESTAMPTZ",""],
    ["cancelled_at","TIMESTAMPTZ",""],
    ["auto_renew","BOOLEAN",""],
    ["granted_by_admin","BOOLEAN","abonnement offert"],
    ["granted_by_id","UUID FK users",""],
    ["provider_ref","VARCHAR(120)","CinetPay ref"],
]))

story.append(PageBreak())

# DOMAINE 5 DELIVERY
story.append(Paragraph("🚚 Domaine 5 — Livreurs (2 tables)", H3))

story.append(tbl_schema("delivery_profiles", "🏍️", [HDR,
    ["user_id","UUID UNIQUE FK users",""],
    ["vehicle_type","ENUM","MOTO / CAR / BICYCLE / FOOT"],
    ["license_plate","VARCHAR(20)",""],
    ["id_card_verified","BOOLEAN",""],
    ["rating_avg","NUMERIC(3,2)",""],
    ["total_deliveries","INT",""],
    ["successful_deliveries","INT",""],
    ["cancelled_deliveries","INT",""],
    ["badge_fiable_earned_at","TIMESTAMPTZ","NULL tant que <50 clean"],
    ["is_available","BOOLEAN","en ligne"],
    ["current_location","GEOGRAPHY(Point,4326)",""],
    ["last_location_update_at","TIMESTAMPTZ",""],
    ["work_zone","GEOGRAPHY(Polygon,4326)","zone préférée"],
], indexes=["GIST (current_location) WHERE is_available", "(is_available, rating_avg DESC)"]))

story.append(tbl_schema("shop_delivery_affiliations", "🤝", [HDR,
    ["shop_id","UUID FK shops",""],
    ["delivery_id","UUID FK users",""],
    ["status","ENUM","INVITED / ACTIVE / LEFT"],
    ["invited_at","TIMESTAMPTZ",""],
    ["accepted_at","TIMESTAMPTZ",""],
    ["left_at","TIMESTAMPTZ",""],
    ["priority","INT","assignation préférentielle"],
], indexes=["UNIQUE (shop_id, delivery_id)"]))

# DOMAINE 6 CATALOG
story.append(Paragraph("📦 Domaine 6 — Catalogue (7 tables)", H3))

story.append(tbl_schema("categories", "📂", [HDR,
    ["parent_id","UUID FK categories","hiérarchie"],
    ["slug","VARCHAR(80) UNIQUE",""],
    ["name_fr","VARCHAR(120)",""],
    ["name_en","VARCHAR(120)",""],
    ["description","TEXT",""],
    ["icon_url","TEXT",""],
    ["image_url","TEXT",""],
    ["display_order","INT",""],
    ["is_active","BOOLEAN",""],
    ["path","LTREE","electronics.phones.smartphones"],
], indexes=["GIST (path)", "(parent_id, display_order)"]))

story.append(tbl_schema("brands", "🏷️", [HDR,
    ["slug","VARCHAR(80) UNIQUE",""],
    ["name","VARCHAR(120)",""],
    ["logo_url","TEXT",""],
    ["is_official","BOOLEAN",""],
    ["country","CHAR(2)",""],
]))

story.append(tbl_schema("official_products", "🎁", [HDR,
    ["category_id","UUID FK categories",""],
    ["brand_id","UUID FK brands",""],
    ["name","VARCHAR(240)",""],
    ["description","TEXT",""],
    ["default_images","JSONB","[{url, alt}]"],
    ["specs","JSONB","{ram, storage, color, ...}"],
    ["is_active","BOOLEAN",""],
    ["search_vector","TSVECTOR","GENERATED STORED"],
], indexes=["(category_id)", "GIN (search_vector)"], notes="Catalogue de référence géré par l'admin."))

story.append(PageBreak())

story.append(tbl_schema("products", "📱", [HDR,
    ["shop_id","UUID FK shops",""],
    ["official_product_id","UUID FK official_products","si basé sur catalogue officiel"],
    ["slug","VARCHAR(160)",""],
    ["name","VARCHAR(240)",""],
    ["description","TEXT",""],
    ["base_price_xaf","BIGINT","CHECK >= 0"],
    ["compare_at_price_xaf","BIGINT","prix barré"],
    ["currency","CHAR(3)","default 'XAF'"],
    ["has_variants","BOOLEAN",""],
    ["status","ENUM","DRAFT / ACTIVE / OUT_OF_STOCK / ARCHIVED"],
    ["visibility","ENUM","PUBLIC / PRIVATE / HIDDEN"],
    ["stock_tracking","BOOLEAN",""],
    ["total_stock","INT","dénormalisé somme variants"],
    ["negotiation_enabled","BOOLEAN",""],
    ["negotiation_min_xaf","BIGINT","marge secrète"],
    ["cost_price_xaf","BIGINT","pour calcul marge"],
    ["weight_grams","INT","pour livraison"],
    ["dimensions_cm","JSONB","{l, w, h}"],
    ["rating_avg","NUMERIC(3,2)",""],
    ["rating_count","INT",""],
    ["view_count","BIGINT",""],
    ["sale_count","INT",""],
    ["wishlist_count","INT",""],
    ["tags","TEXT[]",""],
    ["published_at","TIMESTAMPTZ",""],
    ["search_vector","TSVECTOR","GENERATED STORED"],
], indexes=["UNIQUE (shop_id, slug)", "(shop_id, status)", "(status, published_at DESC) WHERE visibility='PUBLIC'", "(rating_avg DESC, sale_count DESC)", "GIN (search_vector)", "GIN (tags)"]))

story.append(tbl_schema("product_variants", "🎨", [HDR,
    ["product_id","UUID FK products",""],
    ["sku","VARCHAR(64) UNIQUE",""],
    ["name","VARCHAR(160)","Rouge - XL"],
    ["price_xaf","BIGINT",""],
    ["compare_at_price_xaf","BIGINT",""],
    ["stock","INT","CHECK >= 0"],
    ["reserved_stock","INT","dans paniers actifs"],
    ["low_stock_threshold","INT","alerte"],
    ["barcode","VARCHAR(32)",""],
    ["attributes","JSONB","{color:'red', size:'XL'}"],
    ["images","TEXT[]",""],
    ["is_active","BOOLEAN",""],
]))

story.append(tbl_schema("product_images", "🖼️", [HDR,
    ["product_id","UUID FK products",""],
    ["variant_id","UUID FK product_variants","spécifique variant"],
    ["url","TEXT",""],
    ["alt_text","VARCHAR(240)","SEO + a11y"],
    ["display_order","INT",""],
    ["is_primary","BOOLEAN",""],
    ["type","ENUM","PERSONAL / OFFICIAL / AR_MODEL / VIDEO_360"],
    ["width","INT",""],
    ["height","INT",""],
]))

story.append(tbl_schema("product_categories (N-N)", "🔗", [HDR,
    ["product_id","UUID FK products","PK composite"],
    ["category_id","UUID FK categories","PK composite"],
]))

story.append(PageBreak())

# DOMAINE 7 CART / ORDERS
story.append(Paragraph("🛒 Domaine 7 — Panier & Commandes (8 tables, partitionnées)", H3))

story.append(tbl_schema("carts", "🛍️", [HDR,
    ["user_id","UUID FK users",""],
    ["session_id","VARCHAR(64)","invités"],
    ["expires_at","TIMESTAMPTZ","cleanup 30j"],
]))

story.append(tbl_schema("cart_items", "📥", [HDR,
    ["cart_id","UUID FK carts",""],
    ["variant_id","UUID FK product_variants",""],
    ["quantity","INT","CHECK > 0"],
    ["negotiated_price_xaf","BIGINT","si négociée"],
    ["negotiation_id","UUID FK price_negotiations",""],
], indexes=["UNIQUE (cart_id, variant_id)"]))

story.append(tbl_schema("orders [PARTITIONED monthly by created_at]", "🧾", [HDR,
    ["order_number","VARCHAR(20) UNIQUE","BEE-2026-000123"],
    ["client_id","UUID FK users",""],
    ["status","ENUM","PENDING / PAID / PREPARING / READY / PICKED_UP / IN_DELIVERY / DELIVERED / CANCELLED / REFUNDED / DISPUTED"],
    ["subtotal_xaf","BIGINT",""],
    ["discount_xaf","BIGINT",""],
    ["coupon_id","UUID FK coupons",""],
    ["cashback_used_xaf","BIGINT",""],
    ["points_used","INT",""],
    ["delivery_fee_xaf","BIGINT",""],
    ["total_xaf","BIGINT",""],
    ["cashback_earned_xaf","BIGINT",""],
    ["points_earned","INT",""],
    ["payment_method","ENUM","MOMO_MTN / MOMO_ORANGE / CARD / WALLET / SPLIT"],
    ["payment_status","ENUM","PENDING / AUTHORIZED / PAID / FAILED / REFUNDED"],
    ["is_installment","BOOLEAN","paiement échelonné"],
    ["installment_plan","INT","2 / 3 / 4"],
    ["delivery_method","ENUM","SELF_PICKUP / VENDOR_DELIVERY / PLATFORM"],
    ["delivery_address_id","UUID FK addresses",""],
    ["billing_address_id","UUID FK addresses",""],
    ["notes","TEXT",""],
    ["placed_at","TIMESTAMPTZ",""],
    ["confirmed_at","TIMESTAMPTZ",""],
    ["cancelled_at","TIMESTAMPTZ",""],
    ["cancel_reason","TEXT",""],
    ["delivered_at","TIMESTAMPTZ",""],
], indexes=["(client_id, created_at DESC)", "(status, created_at DESC)", "(order_number)"]))

story.append(PageBreak())

story.append(tbl_schema("order_items", "📋", [HDR,
    ["order_id","UUID FK orders",""],
    ["shop_id","UUID FK shops","filtre vendeur"],
    ["variant_id","UUID FK product_variants",""],
    ["product_snapshot","JSONB","nom, image, prix figés au moment cmd"],
    ["quantity","INT",""],
    ["unit_price_xaf","BIGINT",""],
    ["subtotal_xaf","BIGINT",""],
    ["commission_bps","INT","figée au moment cmd"],
    ["commission_xaf","BIGINT",""],
    ["item_status","ENUM","PENDING / ACCEPTED / REFUSED / READY / PICKED_UP / DELIVERED"],
    ["refused_reason","TEXT",""],
], indexes=["(order_id)", "(shop_id, created_at DESC)"]))

story.append(tbl_schema("order_status_events [PARTITIONED]", "📜", [HDR,
    ["order_id","UUID FK orders",""],
    ["from_status","ENUM",""],
    ["to_status","ENUM",""],
    ["actor_id","UUID FK users",""],
    ["actor_role","ENUM",""],
    ["reason","TEXT",""],
    ["metadata","JSONB",""],
], notes="Event sourcing light — permet de rejouer toute l'histoire."))

story.append(tbl_schema("order_payments", "💳", [HDR,
    ["order_id","UUID FK orders",""],
    ["provider","VARCHAR(40)","cinetpay / notchpay / wallet"],
    ["provider_ref","VARCHAR(120)",""],
    ["amount_xaf","BIGINT",""],
    ["method","ENUM",""],
    ["status","ENUM","PENDING / AUTHORIZED / PAID / FAILED / REFUNDED"],
    ["paid_at","TIMESTAMPTZ",""],
    ["failure_reason","TEXT",""],
    ["raw_response","JSONB",""],
    ["idempotency_key","VARCHAR(120) UNIQUE","évite double débit"],
    ["webhook_received","BOOLEAN",""],
], indexes=["(order_id)", "(provider_ref)", "(status) WHERE status='PENDING'"]))

story.append(tbl_schema("order_installments", "📅", [HDR,
    ["order_id","UUID FK orders",""],
    ["sequence","INT","1, 2, 3, 4"],
    ["amount_xaf","BIGINT",""],
    ["due_date","DATE",""],
    ["paid_at","TIMESTAMPTZ",""],
    ["status","ENUM","PENDING / PAID / OVERDUE / FAILED"],
    ["reminder_count","INT","relance SMS"],
    ["last_reminder_at","TIMESTAMPTZ",""],
], indexes=["(status, due_date) WHERE status IN ('PENDING','OVERDUE')"]))

story.append(tbl_schema("price_negotiations", "💬", [HDR,
    ["product_id","UUID FK products",""],
    ["variant_id","UUID FK product_variants",""],
    ["client_id","UUID FK users",""],
    ["shop_id","UUID FK shops",""],
    ["proposed_price_xaf","BIGINT",""],
    ["shop_min_price_xaf","BIGINT","snapshot marge secrète"],
    ["status","ENUM","PENDING / AUTO_ACCEPTED / AUTO_REJECTED / LOCKED / EXPIRED"],
    ["locked_until","TIMESTAMPTZ","persistance prix"],
    ["rejection_reason","TEXT",""],
], indexes=["(client_id, status)", "(locked_until) WHERE status='LOCKED'"]))

story.append(PageBreak())

# DOMAINE 8 DELIVERIES
story.append(Paragraph("🚛 Domaine 8 — Livraisons (2 tables)", H3))

story.append(tbl_schema("deliveries", "🛵", [HDR,
    ["order_id","UUID UNIQUE FK orders",""],
    ["delivery_id","UUID FK users","le livreur"],
    ["shop_id","UUID FK shops",""],
    ["type","ENUM","SELF / PLATFORM_ILLIMITED / PLATFORM_EXPRESS"],
    ["pickup_address_id","UUID FK addresses",""],
    ["dropoff_address_id","UUID FK addresses",""],
    ["distance_km","NUMERIC(6,2)",""],
    ["estimated_duration_min","INT",""],
    ["fee_xaf","BIGINT",""],
    ["delivery_earning_xaf","BIGINT","500 ou 600 selon badge"],
    ["status","ENUM","PENDING / ASSIGNED / ACCEPTED / EN_ROUTE_PICKUP / PICKED_UP / EN_ROUTE_DROPOFF / DELIVERED / FAILED / CANCELLED"],
    ["assigned_at","TIMESTAMPTZ",""],
    ["accepted_at","TIMESTAMPTZ",""],
    ["picked_up_at","TIMESTAMPTZ",""],
    ["delivered_at","TIMESTAMPTZ",""],
    ["failed_reason","TEXT",""],
    ["proof_photo_url","TEXT","R2"],
    ["signature_url","TEXT","optionnel"],
    ["client_rating","INT","CHECK 1-5"],
    ["client_comment","TEXT",""],
], indexes=["(delivery_id, status)", "(shop_id, created_at DESC)", "(status) WHERE status IN ('PENDING','ASSIGNED')"]))

story.append(tbl_schema("delivery_tracking_events [PARTITIONED]", "📡", [HDR,
    ["delivery_id","UUID FK deliveries",""],
    ["location","GEOGRAPHY(Point,4326)",""],
    ["speed_kmh","NUMERIC(5,2)",""],
    ["heading","NUMERIC(5,2)","cap 0-360"],
    ["battery_pct","INT",""],
    ["event_type","ENUM","PING / STATUS_CHANGE / PHOTO_PROOF"],
    ["metadata","JSONB",""],
    ["recorded_at","TIMESTAMPTZ",""],
], indexes=["(delivery_id, recorded_at DESC)", "GIST (location)"]))

# DOMAINE 9 WALLETS
story.append(Paragraph("💰 Domaine 9 — Wallet & Finance (4 tables)", H3))

story.append(tbl_schema("wallets", "🏦", [HDR,
    ["user_id","UUID UNIQUE FK users",""],
    ["type","ENUM","CLIENT / VENDOR / DELIVERY"],
    ["currency","CHAR(3)","default 'XAF'"],
    ["balance_available_xaf","BIGINT","CHECK >= 0"],
    ["balance_pending_xaf","BIGINT","CHECK >= 0"],
    ["balance_escrow_xaf","BIGINT","CHECK >= 0"],
    ["total_earned_xaf","BIGINT",""],
    ["total_withdrawn_xaf","BIGINT",""],
    ["is_frozen","BOOLEAN","suspension"],
    ["version","INT","optimistic locking"],
], notes="UPDATE WHERE version=? empêche les doubles crédits concurrents."))

story.append(PageBreak())

story.append(tbl_schema("wallet_transactions [PARTITIONED]", "💸", [HDR,
    ["wallet_id","UUID FK wallets",""],
    ["type","ENUM","SALE / COMMISSION / REFUND / CASHBACK / WITHDRAWAL / ESCROW_HOLD / ESCROW_RELEASE / SUBSCRIPTION / BONUS / ADJUSTMENT"],
    ["direction","ENUM","CREDIT / DEBIT"],
    ["amount_xaf","BIGINT","CHECK > 0"],
    ["balance_after_xaf","BIGINT","snapshot"],
    ["ref_type","VARCHAR(40)","order / withdrawal / subscription / ..."],
    ["ref_id","UUID",""],
    ["description","TEXT",""],
    ["metadata","JSONB",""],
    ["idempotency_key","VARCHAR(120) UNIQUE",""],
], indexes=["(wallet_id, created_at DESC)", "(ref_type, ref_id)"]))

story.append(tbl_schema("escrow_holds", "🔒", [HDR,
    ["order_id","UUID FK orders",""],
    ["vendor_wallet_id","UUID FK wallets",""],
    ["amount_xaf","BIGINT",""],
    ["status","ENUM","HELD / RELEASED / REFUNDED / DISPUTED"],
    ["held_at","TIMESTAMPTZ",""],
    ["release_scheduled_at","TIMESTAMPTZ","DELIVERED + 48h auto"],
    ["released_at","TIMESTAMPTZ",""],
    ["released_tx_id","UUID FK wallet_transactions",""],
], indexes=["(status, release_scheduled_at) WHERE status='HELD'", "(order_id)"]))

story.append(tbl_schema("withdrawal_requests", "🏧", [HDR,
    ["wallet_id","UUID FK wallets",""],
    ["amount_xaf","BIGINT","CHECK > 0"],
    ["fee_xaf","BIGINT",""],
    ["net_amount_xaf","BIGINT",""],
    ["method","ENUM","MTN_MOMO / ORANGE_MONEY / BANK_TRANSFER"],
    ["destination_phone","VARCHAR(16)",""],
    ["destination_account","VARCHAR(40)",""],
    ["status","ENUM","PENDING / APPROVED / PROCESSING / COMPLETED / FAILED / REJECTED"],
    ["requested_at","TIMESTAMPTZ",""],
    ["approved_by_id","UUID FK users","admin"],
    ["approved_at","TIMESTAMPTZ",""],
    ["processed_at","TIMESTAMPTZ",""],
    ["provider_ref","VARCHAR(120)",""],
    ["provider_response","JSONB",""],
    ["rejection_reason","TEXT",""],
], indexes=["(wallet_id, status)", "(status, requested_at) WHERE status IN ('PENDING','APPROVED')"]))

story.append(PageBreak())

# DOMAINE 10 PROMOTIONS
story.append(Paragraph("🎟️ Domaine 10 — Promotions (4 tables)", H3))

story.append(tbl_schema("coupons", "🎫", [HDR,
    ["shop_id","UUID FK shops","NULL = coupon plateforme"],
    ["code","VARCHAR(40) UNIQUE",""],
    ["type","ENUM","PERCENTAGE / FIXED_AMOUNT / FREE_DELIVERY"],
    ["value","INT","% ou XAF"],
    ["min_order_xaf","BIGINT",""],
    ["max_discount_xaf","BIGINT",""],
    ["usage_limit","INT","total"],
    ["usage_limit_per_user","INT","default 1"],
    ["usage_count","INT",""],
    ["applies_to","ENUM","ALL / CATEGORY / PRODUCT / FIRST_ORDER"],
    ["scope_ids","UUID[]","si restreint"],
    ["starts_at","TIMESTAMPTZ",""],
    ["ends_at","TIMESTAMPTZ",""],
    ["is_auto_generated","BOOLEAN","coupons auto par plan"],
    ["is_active","BOOLEAN",""],
], indexes=["(code) WHERE is_active", "(shop_id, is_active)"]))

story.append(tbl_schema("coupon_redemptions", "✅", [HDR,
    ["coupon_id","UUID FK coupons",""],
    ["order_id","UUID FK orders",""],
    ["user_id","UUID FK users",""],
    ["discount_applied_xaf","BIGINT",""],
], indexes=["UNIQUE (coupon_id, order_id)", "(user_id, coupon_id)"]))

story.append(tbl_schema("flash_sales", "⚡", [HDR,
    ["shop_id","UUID FK shops",""],
    ["name","VARCHAR(160)",""],
    ["discount_percentage","INT","CHECK 1-70"],
    ["starts_at","TIMESTAMPTZ",""],
    ["ends_at","TIMESTAMPTZ","ex: +30 min"],
    ["max_products","INT","default 5"],
    ["is_active","BOOLEAN",""],
    ["notification_sent","BOOLEAN","push envoyé"],
], indexes=["(shop_id, is_active)", "(ends_at) WHERE is_active"]))

story.append(tbl_schema("flash_sale_items", "🛒", [HDR,
    ["flash_sale_id","UUID FK flash_sales",""],
    ["product_id","UUID FK products",""],
    ["variant_id","UUID FK product_variants",""],
    ["original_price","BIGINT",""],
    ["flash_price","BIGINT",""],
    ["max_quantity","INT",""],
    ["sold_quantity","INT",""],
    ["max_per_user","INT","default 1"],
]))

story.append(PageBreak())

# DOMAINE 11 AUCTIONS
story.append(Paragraph("🔨 Domaine 11 — Enchères (2 tables)", H3))

story.append(tbl_schema("auctions", "🪙", [HDR,
    ["shop_id","UUID FK shops",""],
    ["product_id","UUID FK products",""],
    ["variant_id","UUID FK product_variants",""],
    ["type","ENUM","CLASSIC_ASCENDING / DECREASING_DUTCH"],
    ["starting_price_xaf","BIGINT",""],
    ["min_bid_increment_xaf","BIGINT","default 500"],
    ["reserve_price_xaf","BIGINT","prix minimum"],
    ["current_price_xaf","BIGINT","temps réel"],
    ["current_winner_id","UUID FK users",""],
    ["bid_count","INT",""],
    ["commission_bps","INT","default 1000 (10%)"],
    ["starts_at","TIMESTAMPTZ",""],
    ["ends_at","TIMESTAMPTZ",""],
    ["status","ENUM","SCHEDULED / LIVE / ENDED / CANCELLED"],
    ["winner_id","UUID FK users",""],
    ["winning_bid_xaf","BIGINT",""],
], indexes=["(status, ends_at)", "(shop_id, created_at DESC)"]))

story.append(tbl_schema("auction_bids [PARTITIONED]", "📈", [HDR,
    ["auction_id","UUID FK auctions",""],
    ["user_id","UUID FK users",""],
    ["amount_xaf","BIGINT",""],
    ["is_auto_bid","BOOLEAN","enchère automatique"],
    ["max_auto_xaf","BIGINT","plafond auto"],
    ["placed_at","TIMESTAMPTZ",""],
], indexes=["(auction_id, placed_at DESC)", "(user_id)"]))

# DOMAINE 12 LIVE / STORIES
story.append(Paragraph("🎥 Domaine 12 — Live Shopping & Stories (4 tables)", H3))

story.append(tbl_schema("live_sessions", "📹", [HDR,
    ["shop_id","UUID FK shops",""],
    ["title","VARCHAR(160)",""],
    ["description","TEXT",""],
    ["thumbnail_url","TEXT",""],
    ["stream_key","VARCHAR(64) UNIQUE","CF Stream"],
    ["playback_url","TEXT","HLS"],
    ["recording_url","TEXT","VOD replay"],
    ["status","ENUM","SCHEDULED / LIVE / ENDED"],
    ["scheduled_at","TIMESTAMPTZ",""],
    ["started_at","TIMESTAMPTZ",""],
    ["ended_at","TIMESTAMPTZ",""],
    ["peak_viewers","INT",""],
    ["total_views","INT",""],
    ["orders_count","INT","conversions"],
    ["revenue_xaf","BIGINT",""],
], indexes=["(shop_id, status)", "(status, scheduled_at) WHERE status='SCHEDULED'"]))

story.append(tbl_schema("live_session_products", "🛍️", [HDR,
    ["live_id","UUID FK live_sessions",""],
    ["product_id","UUID FK products",""],
    ["variant_id","UUID FK product_variants",""],
    ["flash_price","BIGINT","prix live exclusif"],
    ["featured_at","TIMESTAMPTZ","quand mis en avant"],
    ["sold_during","INT","ventes pendant live"],
]))

story.append(PageBreak())

story.append(tbl_schema("stories (TTL 24h)", "📸", [HDR,
    ["shop_id","UUID FK shops",""],
    ["media_url","TEXT","R2"],
    ["media_type","ENUM","IMAGE / VIDEO"],
    ["thumbnail_url","TEXT",""],
    ["caption","TEXT",""],
    ["link_product_id","UUID FK products","CTA achat"],
    ["link_url","TEXT","CTA libre"],
    ["views_count","INT",""],
    ["expires_at","TIMESTAMPTZ","+24h"],
], indexes=["(shop_id, expires_at) WHERE expires_at > NOW()", "(expires_at)"]))

story.append(tbl_schema("story_views [PARTITIONED]", "👁️", [HDR,
    ["story_id","UUID FK stories",""],
    ["user_id","UUID FK users",""],
    ["viewed_at","TIMESTAMPTZ",""],
], indexes=["UNIQUE (story_id, user_id)"]))

# DOMAINE 13 REVIEWS
story.append(Paragraph("⭐ Domaine 13 — Avis (1 table)", H3))
story.append(tbl_schema("reviews", "🌟", [HDR,
    ["order_item_id","UUID FK order_items","preuve achat"],
    ["author_id","UUID FK users",""],
    ["target_type","ENUM","PRODUCT / SHOP / DELIVERY"],
    ["target_id","UUID","polymorphique"],
    ["rating","INT","CHECK 1-5"],
    ["comment","TEXT","obligatoire si <3"],
    ["photos","JSONB","[{url}]"],
    ["is_verified","BOOLEAN","achat vérifié"],
    ["helpful_count","INT","votes utiles"],
    ["reply_body","TEXT","réponse vendeur"],
    ["reply_at","TIMESTAMPTZ",""],
    ["is_hidden","BOOLEAN","modération"],
], indexes=["UNIQUE (order_item_id, target_type)", "(target_type, target_id, created_at DESC)", "(author_id)"],
    notes="CHECK (rating >= 3 OR length(comment) > 10)"))

# DOMAINE 14 DISPUTES
story.append(Paragraph("⚖️ Domaine 14 — Litiges (2 tables)", H3))

story.append(tbl_schema("disputes", "⚠️", [HDR,
    ["order_id","UUID FK orders",""],
    ["opened_by_id","UUID FK users",""],
    ["against_user_id","UUID FK users",""],
    ["type","ENUM","NOT_RECEIVED / NOT_AS_DESCRIBED / DAMAGED / FAKE / OTHER"],
    ["reason","TEXT",""],
    ["status","ENUM","OPEN / IN_REVIEW / RESOLVED_CLIENT / RESOLVED_VENDOR / ESCALATED / CLOSED"],
    ["ai_suggestion","JSONB","{verdict, confidence, reasoning}"],
    ["ai_auto_resolved","BOOLEAN","80% résolus par IA"],
    ["resolved_by_id","UUID FK users",""],
    ["resolved_at","TIMESTAMPTZ",""],
    ["resolution_notes","TEXT",""],
    ["refund_amount_xaf","BIGINT",""],
    ["penalty_xaf","BIGINT","sanction vendeur"],
], indexes=["(order_id)", "(status, created_at)", "(against_user_id, created_at)"],
    notes="Anti-arnaque : 3 litiges/7 jours → suspension automatique."))

story.append(tbl_schema("dispute_messages", "💬", [HDR,
    ["dispute_id","UUID FK disputes",""],
    ["sender_id","UUID FK users",""],
    ["sender_role","ENUM",""],
    ["body","TEXT",""],
    ["attachments","JSONB","preuves"],
    ["is_internal","BOOLEAN","notes admin privées"],
], indexes=["(dispute_id, created_at)"]))

story.append(PageBreak())

# DOMAINE 15 REFERRALS
story.append(Paragraph("🎯 Domaine 15 — Parrainage & Affiliation (2 tables)", H3))

story.append(tbl_schema("referrals", "🤝", [HDR,
    ["referrer_id","UUID FK users","parrain"],
    ["referred_id","UUID UNIQUE FK users","filleul"],
    ["code","VARCHAR(20)",""],
    ["type","ENUM","CLIENT / VENDOR / DELIVERY"],
    ["status","ENUM","PENDING / QUALIFIED / REWARDED"],
    ["reward_type","ENUM","FREE_DELIVERY / DISCOUNT / BONUS_MONTH / VISIBILITY_BOOST"],
    ["reward_value","BIGINT",""],
    ["qualified_at","TIMESTAMPTZ","conditions remplies"],
    ["granted_at","TIMESTAMPTZ",""],
], indexes=["(referrer_id, status)"]))

story.append(tbl_schema("family_badge_invitations", "👨‍👩‍👧", [HDR,
    ["inviter_id","UUID FK users",""],
    ["invitee_id","UUID FK users",""],
    ["month","CHAR(7)","'2026-04'"],
    ["reward_claimed","BOOLEAN",""],
], indexes=["UNIQUE (inviter_id, invitee_id)", "(inviter_id, month)"],
    notes="Max 5 invitations/mois → 1 livraison gratuite chacun."))

# DOMAINE 16 GAMIFICATION
story.append(Paragraph("🏅 Domaine 16 — Gamification (4 tables)", H3))

story.append(tbl_schema("user_points", "🎮", [HDR,
    ["user_id","UUID UNIQUE FK users",""],
    ["balance","INT","CHECK >= 0"],
    ["lifetime_earned","INT",""],
    ["tier","ENUM","BRONZE / SILVER / GOLD / PLATINUM"],
    ["tier_progress","INT","% vers tier supérieur"],
]))

story.append(tbl_schema("points_transactions [PARTITIONED]", "🎲", [HDR,
    ["user_id","UUID FK users",""],
    ["amount","INT","+ ou -"],
    ["reason","ENUM","ORDER / REFERRAL / REVIEW / REDEMPTION / EXPIRY"],
    ["ref_type","VARCHAR(40)",""],
    ["ref_id","UUID",""],
], indexes=["(user_id, created_at DESC)"]))

story.append(tbl_schema("badges", "🎖️", [HDR,
    ["slug","VARCHAR(40) UNIQUE",""],
    ["name","VARCHAR(80)",""],
    ["description","TEXT",""],
    ["icon_url","TEXT",""],
    ["criteria","JSONB","{type:'deliveries', count:50, clean_ratio:0.98}"],
    ["target_role","ENUM",""],
    ["is_active","BOOLEAN",""],
]))

story.append(tbl_schema("user_badges", "🏆", [HDR,
    ["user_id","UUID FK users","PK composite"],
    ["badge_id","UUID FK badges","PK composite"],
    ["earned_at","TIMESTAMPTZ",""],
]))

story.append(PageBreak())

# DOMAINE 17 JOB
story.append(Paragraph("💼 Domaine 17 — Recrutement (2 tables)", H3))

story.append(tbl_schema("job_offers", "📢", [HDR,
    ["shop_id","UUID FK shops",""],
    ["title","VARCHAR(160)",""],
    ["description","TEXT",""],
    ["type","ENUM","INTERN / FULL_TIME / PART_TIME / INTERIM / FREELANCE"],
    ["location","VARCHAR(160)",""],
    ["is_remote","BOOLEAN",""],
    ["salary_min_xaf","BIGINT",""],
    ["salary_max_xaf","BIGINT",""],
    ["requirements","TEXT",""],
    ["benefits","TEXT",""],
    ["status","ENUM","DRAFT / PUBLISHED / CLOSED / EXPIRED"],
    ["published_at","TIMESTAMPTZ",""],
    ["expires_at","TIMESTAMPTZ",""],
    ["application_count","INT",""],
], indexes=["(shop_id, status)", "(status, published_at DESC) WHERE status='PUBLISHED'"]))

story.append(tbl_schema("job_applications", "📄", [HDR,
    ["job_offer_id","UUID FK job_offers",""],
    ["applicant_id","UUID FK users",""],
    ["cv_url","TEXT","R2"],
    ["cover_letter","TEXT",""],
    ["linkedin_url","TEXT",""],
    ["status","ENUM","SUBMITTED / REVIEWED / SHORTLISTED / REJECTED / HIRED"],
    ["vendor_notes","TEXT","privé vendeur"],
    ["applied_at","TIMESTAMPTZ",""],
], indexes=["UNIQUE (job_offer_id, applicant_id)", "(applicant_id, applied_at DESC)"]))

# DOMAINE 18 CMS
story.append(Paragraph("⚙️ Domaine 18 — Admin CMS (10 tables, tout éditable)", H3))
story.append(para("<b>Toutes ces tables sont pilotées par l'admin via le dashboard — aucun hardcode dans le frontend.</b> Les mises à jour invalident le cache Redis via revalidateTag."))

story.append(tbl_schema("site_settings", "🎛️", [HDR,
    ["key","VARCHAR(80) UNIQUE","'contact.email', 'theme.primary_color'"],
    ["value","JSONB","typé selon clé"],
    ["category","VARCHAR(40)","BRANDING / CONTACT / SEO / FEATURES"],
    ["description","TEXT",""],
    ["is_public","BOOLEAN","expose via /public/config"],
    ["updated_by_id","UUID FK users",""],
]))

story.append(tbl_schema("banners", "🖼️", [HDR,
    ["title","VARCHAR(160)",""],
    ["subtitle","VARCHAR(240)",""],
    ["image_url","TEXT",""],
    ["image_mobile_url","TEXT","responsive"],
    ["link_url","TEXT",""],
    ["cta_label","VARCHAR(60)",""],
    ["position","ENUM","HOME_HERO / HOME_MIDDLE / CATEGORY_TOP / CART"],
    ["target_audience","JSONB","{roles:[], regions:[], new_users_only}"],
    ["starts_at","TIMESTAMPTZ",""],
    ["ends_at","TIMESTAMPTZ",""],
    ["display_order","INT",""],
    ["is_active","BOOLEAN",""],
    ["click_count","INT",""],
    ["impression_count","INT",""],
], indexes=["(position, is_active, display_order)"]))

story.append(PageBreak())

story.append(tbl_schema("legal_documents", "📜", [HDR,
    ["slug","VARCHAR(40)","'terms' / 'privacy' / 'cookies' / 'shipping'"],
    ["language","CHAR(2)",""],
    ["title","VARCHAR(200)",""],
    ["content_md","TEXT","Markdown"],
    ["version","VARCHAR(20)","'v3.1'"],
    ["published_at","TIMESTAMPTZ",""],
    ["is_current","BOOLEAN",""],
    ["requires_acceptance","BOOLEAN","force user à ré-accepter"],
], indexes=["UNIQUE (slug, language, version)", "(slug, language, is_current) WHERE is_current"]))

story.append(tbl_schema("user_legal_acceptances", "✍️", [HDR,
    ["user_id","UUID FK users",""],
    ["legal_doc_id","UUID FK legal_documents",""],
    ["accepted_at","TIMESTAMPTZ",""],
    ["ip","INET","audit"],
    ["user_agent","TEXT",""],
], indexes=["UNIQUE (user_id, legal_doc_id)"]))

story.append(tbl_schema("footer_links", "🔗", [HDR,
    ["label_fr","VARCHAR(80)",""],
    ["label_en","VARCHAR(80)",""],
    ["url","TEXT",""],
    ["column_key","VARCHAR(40)","about / legal / help / social"],
    ["display_order","INT",""],
    ["is_external","BOOLEAN",""],
    ["icon","VARCHAR(40)","lucide icon name"],
    ["is_active","BOOLEAN",""],
    ["visible_to_role","ENUM","NULL = tous"],
], indexes=["(column_key, display_order) WHERE is_active"]))

story.append(tbl_schema("homepage_sections", "🏠", [HDR,
    ["type","ENUM","HERO_CAROUSEL / CATEGORIES / FEATURED_PRODUCTS / FLASH_SALES / TOP_VENDORS / BANNER / TESTIMONIALS"],
    ["title_fr","VARCHAR(160)",""],
    ["title_en","VARCHAR(160)",""],
    ["config","JSONB","selon type"],
    ["display_order","INT",""],
    ["is_active","BOOLEAN",""],
]))

story.append(tbl_schema("announcement_bars", "📣", [HDR,
    ["message_fr","TEXT",""],
    ["message_en","TEXT",""],
    ["type","ENUM","INFO / WARNING / PROMO / MAINTENANCE"],
    ["link_url","TEXT",""],
    ["bg_color","VARCHAR(20)",""],
    ["starts_at","TIMESTAMPTZ",""],
    ["ends_at","TIMESTAMPTZ",""],
    ["is_active","BOOLEAN",""],
    ["dismissible","BOOLEAN",""],
]))

story.append(tbl_schema("feature_flags", "🚩", [HDR,
    ["key","VARCHAR(60) UNIQUE","'live_shopping' / 'ar_products'"],
    ["is_enabled","BOOLEAN",""],
    ["rollout_pct","INT","canary 0-100"],
    ["audience","JSONB","{roles:[], regions:[], user_ids:[]}"],
    ["description","TEXT",""],
]))

story.append(PageBreak())

story.append(tbl_schema("email_templates", "📧", [HDR,
    ["slug","VARCHAR(60) UNIQUE","'order_confirmation'"],
    ["subject_fr","VARCHAR(240)",""],
    ["subject_en","VARCHAR(240)",""],
    ["body_mjml_fr","TEXT","MJML"],
    ["body_mjml_en","TEXT","MJML"],
    ["variables","JSONB","[{name, type, required}]"],
    ["is_active","BOOLEAN",""],
]))

story.append(tbl_schema("notification_templates", "🔔", [HDR,
    ["slug","VARCHAR(60)",""],
    ["channel","ENUM","PUSH / SMS / IN_APP"],
    ["title_fr","VARCHAR(120)",""],
    ["title_en","VARCHAR(120)",""],
    ["body_fr","TEXT",""],
    ["body_en","TEXT",""],
    ["variables","JSONB",""],
    ["action_url","TEXT","deep link"],
    ["is_active","BOOLEAN",""],
], indexes=["UNIQUE (slug, channel)"]))

# DOMAINE 19 NOTIFICATIONS
story.append(Paragraph("🔔 Domaine 19 — Notifications (2 tables)", H3))

story.append(tbl_schema("notifications [PARTITIONED]", "📬", [HDR,
    ["user_id","UUID FK users",""],
    ["type","ENUM","ORDER_UPDATE / PAYMENT / FLASH_SALE / STORY / LIVE / DISPUTE / SYSTEM"],
    ["title","VARCHAR(200)",""],
    ["body","TEXT",""],
    ["data","JSONB","deep link, refs"],
    ["icon_url","TEXT",""],
    ["read_at","TIMESTAMPTZ",""],
    ["action_taken","BOOLEAN",""],
], indexes=["(user_id, created_at DESC)", "(user_id) WHERE read_at IS NULL"]))

story.append(tbl_schema("push_tokens", "📲", [HDR,
    ["user_id","UUID FK users",""],
    ["token","TEXT UNIQUE",""],
    ["platform","ENUM","IOS / ANDROID / WEB"],
    ["device_id","VARCHAR(80)",""],
    ["app_version","VARCHAR(20)",""],
    ["is_active","BOOLEAN",""],
    ["last_used_at","TIMESTAMPTZ",""],
    ["failure_count","INT","invalide après N"],
], indexes=["(user_id) WHERE is_active"]))

# DOMAINE 20 MESSAGING
story.append(Paragraph("💬 Domaine 20 — Messaging (2 tables)", H3))

story.append(tbl_schema("conversations", "💭", [HDR,
    ["type","ENUM","AI_CHAT / SUPPORT / DISPUTE / VENDOR_CLIENT"],
    ["status","ENUM","OPEN / RESOLVED / CLOSED / ESCALATED"],
    ["subject","VARCHAR(240)",""],
    ["participant_ids","UUID[]","jusqu'à 4"],
    ["assigned_admin_id","UUID FK users",""],
    ["priority","ENUM","LOW / NORMAL / HIGH / URGENT"],
    ["last_message_at","TIMESTAMPTZ","tri liste"],
    ["metadata","JSONB",""],
], indexes=["(type, status)", "GIN (participant_ids)"]))

story.append(tbl_schema("messages [PARTITIONED]", "✉️", [HDR,
    ["conversation_id","UUID FK conversations",""],
    ["sender_type","ENUM","USER / AI / ADMIN / SYSTEM"],
    ["sender_id","UUID",""],
    ["body","TEXT",""],
    ["attachments","JSONB",""],
    ["read_by","UUID[]","IDs ayant lu"],
], indexes=["(conversation_id, created_at DESC)"]))

story.append(PageBreak())

# DOMAINE 21 SECURITY & OPS
story.append(Paragraph("🛡️ Domaine 21 — Sécurité & Ops (5 tables)", H3))

story.append(tbl_schema("audit_logs [PARTITIONED]", "📊", [HDR,
    ["actor_id","UUID FK users",""],
    ["actor_role","ENUM",""],
    ["action","VARCHAR(80)","user.suspend / product.delete / settings.update"],
    ["entity_type","VARCHAR(60)",""],
    ["entity_id","UUID",""],
    ["changes","JSONB","{before, after}"],
    ["ip","INET",""],
    ["user_agent","TEXT",""],
    ["request_id","UUID","trace"],
], indexes=["(actor_id, created_at DESC)", "(entity_type, entity_id, created_at DESC)", "(action, created_at DESC)"],
    notes="Capture TOUTES les actions admin avec diff complet."))

story.append(tbl_schema("outbox_events", "📤", [HDR,
    ["aggregate_type","VARCHAR(60)","order / payment / user"],
    ["aggregate_id","UUID",""],
    ["event_type","VARCHAR(80)","order.paid / user.kyc_verified"],
    ["payload","JSONB",""],
    ["processed_at","TIMESTAMPTZ","NULL = pending"],
    ["retry_count","INT",""],
    ["next_retry_at","TIMESTAMPTZ",""],
    ["last_error","TEXT",""],
], indexes=["(processed_at, next_retry_at) WHERE processed_at IS NULL"],
    notes="Outbox pattern → garantit livraison webhooks/notifs même en cas de crash."))

story.append(tbl_schema("idempotency_keys", "🔐", [HDR,
    ["key","VARCHAR(120) PK",""],
    ["user_id","UUID",""],
    ["endpoint","VARCHAR(120)",""],
    ["response","JSONB","réponse mise en cache"],
    ["status_code","INT",""],
    ["expires_at","TIMESTAMPTZ","24h typique"],
], indexes=["(expires_at)"]))

story.append(tbl_schema("webhook_deliveries", "📨", [HDR,
    ["provider","VARCHAR(40)","cinetpay / smile_identity"],
    ["event","VARCHAR(80)",""],
    ["external_id","VARCHAR(120)","leur ref"],
    ["payload","JSONB",""],
    ["signature_valid","BOOLEAN","HMAC vérifié"],
    ["status","ENUM","RECEIVED / PROCESSED / FAILED / IGNORED"],
    ["attempts","INT",""],
    ["last_error","TEXT",""],
    ["received_at","TIMESTAMPTZ",""],
    ["processed_at","TIMESTAMPTZ",""],
], indexes=["(provider, external_id)", "(status, received_at) WHERE status IN ('RECEIVED','FAILED')"]))

story.append(tbl_schema("rate_limit_buckets", "🚦", [HDR,
    ["key","VARCHAR(120) PK","user:id:login / ip:x:checkout"],
    ["count","INT",""],
    ["reset_at","TIMESTAMPTZ",""],
], notes="Souvent en Redis ; persistance PG pour fraud long-terme."))

story.append(PageBreak())

# DOMAINE 22 MV
story.append(Paragraph("📊 Domaine 22 — Vues matérialisées (dashboards rapides)", H3))
story.append(para("Rafraîchies toutes les heures via pg_cron. Elles pré-agrègent les données pour éviter des scans lourds sur des tables de millions de lignes à chaque chargement de dashboard."))

story.append(Paragraph("mv_shop_daily_revenue", H4))
story.append(sql_block("""CREATE MATERIALIZED VIEW mv_shop_daily_revenue AS
SELECT shop_id, DATE(created_at) AS day,
       SUM(subtotal_xaf)   AS gross_xaf,
       SUM(commission_xaf) AS commission_xaf,
       COUNT(DISTINCT order_id) AS orders
FROM order_items
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY shop_id, DATE(created_at);

CREATE UNIQUE INDEX ON mv_shop_daily_revenue (shop_id, day);"""))

story.append(Paragraph("mv_product_popularity", H4))
story.append(sql_block("""CREATE MATERIALIZED VIEW mv_product_popularity AS
SELECT p.id, p.shop_id, p.name, p.base_price_xaf,
       COALESCE(SUM(oi.quantity), 0) AS sold_30d,
       AVG(r.rating) AS rating,
       p.view_count
FROM products p
LEFT JOIN product_variants v ON v.product_id = p.id
LEFT JOIN order_items oi ON oi.variant_id = v.id
   AND oi.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN reviews r ON r.target_id = p.id AND r.target_type = 'PRODUCT'
WHERE p.status = 'ACTIVE'
GROUP BY p.id;"""))

story.append(Paragraph("mv_platform_kpi (KPI admin global)", H4))
story.append(sql_block("""CREATE MATERIALIZED VIEW mv_platform_kpi AS
SELECT DATE(o.created_at) AS day,
       COUNT(*)                           AS orders,
       SUM(o.total_xaf)                   AS gmv_xaf,
       SUM(oi.commission_xaf)             AS revenue_xaf,
       COUNT(DISTINCT o.client_id)        AS unique_buyers,
       COUNT(DISTINCT oi.shop_id)         AS active_sellers
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status NOT IN ('CANCELLED','REFUNDED')
  AND o.created_at > NOW() - INTERVAL '1 year'
GROUP BY DATE(o.created_at);"""))

story.append(PageBreak())

# 2.4 SÉCURITÉ
story.append(Paragraph("2.4 Sécurité & Performance — Règles d'or", H2))

sec_rows = [
    ("Row Level Security (RLS)", "Activé sur users, wallets, orders. Le vendeur ne voit QUE ses données, le client QUE les siennes. Enforced côté base, pas seulement applicatif."),
    ("Chiffrement at rest", "PostgreSQL TDE (Neon par défaut) + colonnes sensibles (CNI, secrets 2FA) chiffrées applicativement en AES-256-GCM."),
    ("Chiffrement in transit", "TLS 1.3 partout (Cloudflare → Vercel/Railway → Neon). Aucun trafic en clair."),
    ("Sauvegardes", "Point-in-Time Recovery 30j (Neon) + dump quotidien vers R2 chiffré (conservé 180 jours)."),
    ("Gestion des secrets", "Infisical. Rotation tous les 90 jours. Jamais dans Git. Injection via CI."),
    ("Monitoring performance", "pg_stat_statements actif. Better Stack alerte sur slow queries > 500ms."),
    ("Anti-hot-row", "SELECT ... FOR UPDATE SKIP LOCKED sur assignation livreurs, placement d'enchères (évite deadlocks et contention)."),
    ("Optimistic locking", "Colonne version sur wallets → UPDATE WHERE version = ? empêche doubles crédits concurrents."),
    ("Vacuum & analyze", "autovacuum configuré agressif sur tables hot. VACUUM FULL mensuel planifié."),
    ("Bloat control", "pg_repack automatique sur orders, wallet_transactions pour récupérer l'espace sans downtime."),
    ("Rate limiting", "@nestjs/throttler + Redis : 100 req/min user, 20 req/min IP non-auth, 5 req/min sur login."),
    ("Audit GDPR-like", "user_legal_acceptances enregistre chaque version acceptée. Droit à l'export : endpoint dédié."),
    ("Droit à l'oubli", "Soft delete + cron 30 jours → anonymisation (PII remplacées par valeurs neutres) sans casser intégrité référentielle."),
]
story.append(table_kv(sec_rows, header=["Règle", "Implémentation"]))

story.append(PageBreak())

# 2.5 CHECKLIST
story.append(Paragraph("2.5 Checklist production-ready", H2))

checklist = [
    "Partitionnement mensuel sur 10 tables volumineuses",
    "Read replicas (2×) pour dashboards & analytics",
    "PgBouncer en mode transaction",
    "Redis cache multi-niveaux (1min / 10min / 1h)",
    "Meilisearch re-indexé via CDC temps réel",
    "Backups PITR 30 jours + archives 180 jours",
    "Row Level Security sur données sensibles",
    "Soft delete + audit logs sur tout",
    "Idempotency keys + outbox pattern",
    "PostGIS + FTS natifs (en plus des outils externes)",
    "Materialized views refreshées automatiquement (pg_cron)",
    "Migration 0 : seed admin + 2FA forcé + plans + catégories",
    "Seeds idempotents (ne cassent pas en re-run)",
    "Contraintes CHECK au niveau DB (défense en profondeur)",
    "Monitoring + alerting (slow queries, bloat, replication lag)",
    "Tests de charge k6 avant lancement (500 req/s)",
    "Plan de disaster recovery (RPO 15min, RTO 1h)",
    "Documentation des runbooks d'incident",
    "CI/CD avec environnements preview par PR",
    "Documentation OpenAPI publiée et versionnée",
]
ch_rows = [[Paragraph(f"<font color='#059669'><b>✓</b></font>", s("ck","Normal",fontSize=10)), Paragraph(item, BODY)] for item in checklist]
t = Table(ch_rows, colWidths=[0.8*cm, 15.5*cm])
t.setStyle(TableStyle([
    ('VALIGN',(0,0),(-1,-1),'TOP'),
    ('TOPPADDING',(0,0),(-1,-1),4),
    ('BOTTOMPADDING',(0,0),(-1,-1),4),
    ('ROWBACKGROUNDS',(0,0),(-1,-1),[white, SLATE_LIGHT]),
]))
story.append(t)

story.append(PageBreak())

# ========== ANNEXES ==========
story.append(Paragraph("Annexes", H1))
story.append(hr())

# Annexe A
story.append(Paragraph("A. Relations clés (diagramme textuel)", H2))
story.append(para("Les relations principales entre entités cœur de Bee :"))
story.append(sql_block("""users (1) ──< shops (1) ──< products (1) ──< product_variants
users (1) ──< addresses
users (1) ──< orders ──< order_items >── product_variants
users (1) ──< wallets (1) ──< wallet_transactions
users (1) ──< kyc_verifications
users (1) ──< user_sessions
users (1) ──< subscriptions >── subscription_plans

shops (1) ──< flash_sales ──< flash_sale_items
shops (1) ──< auctions ──< auction_bids
shops (1) ──< live_sessions ──< live_session_products
shops (1) ──< stories ──< story_views
shops (1) ──< job_offers ──< job_applications
shops (M) <──> (M) users via shop_delivery_affiliations

orders (1) ──< deliveries ──< delivery_tracking_events
orders (1) ──< order_payments
orders (1) ──< order_installments
orders (1) ──< escrow_holds
orders (1) ──< disputes ──< dispute_messages

products (M) <──> categories
reviews polymorphique → target_type (PRODUCT/SHOP/DELIVERY) + target_id"""))

story.append(PageBreak())

# Annexe B — Seed admin
story.append(Paragraph("B. Seed admin initial (Prisma + argon2)", H2))
story.append(para("L'admin <b>n'est jamais créé via un formulaire</b>. Il est inséré par ce seed à chaque déploiement. La 2FA est forcée au premier login."))

story.append(sql_block("""// prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD!;

  const hash = await argon2.hash(adminPassword, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},  // ne touche pas si existe déjà
    create: {
      email: adminEmail,
      passwordHash: hash,
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      isKycVerified: true,
      profile: { create: { firstName: 'Admin', lastName: 'Bee' } },
    },
  });

  // 2FA sera configurée au premier login via TOTP.
  // L'endpoint /auth/register bloque role=ADMIN côté API.

  // Plans d'abonnement (éditables ensuite via dashboard admin)
  await prisma.subscriptionPlan.createMany({
    skipDuplicates: true,
    data: [
      { slug:'vendor_start',  roleTarget:'VENDOR',   name:'Start',
        priceMonthlyXaf: 5000n,  trialDays: 90,
        features: { max_products:10, photos_max:1, coupons_max:1 } },
      { slug:'vendor_pro',    roleTarget:'VENDOR',   name:'Pro',
        priceMonthlyXaf: 15000n, priceYearlyXaf: 144000n,
        features: { max_products:-1, photos_max:2, coupons_max:5,
                    auctions:true, live_shopping:true } },
      { slug:'vendor_elite',  roleTarget:'VENDOR',   name:'Elite',
        priceMonthlyXaf: 30000n, priceYearlyXaf: 252000n,
        features: { max_products:-1, photos_max:-1, stories:true,
                    ar:true, delivery_express:true, badge:'ELITE' } },
      { slug:'delivery_freelance', roleTarget:'DELIVERY', name:'Freelance',
        priceMonthlyXaf: 0n },
      { slug:'delivery_premium',   roleTarget:'DELIVERY', name:'Premium',
        priceMonthlyXaf: 10000n },
    ],
  });
}

main().finally(() => prisma.$disconnect());"""))

story.append(PageBreak())

# Annexe C — ENV
story.append(Paragraph("C. Variables d'environnement de référence", H2))
story.append(para("Voici les variables nécessaires pour faire tourner Bee en production. Toutes sont stockées dans <b>Infisical</b>, pas dans Git."))

story.append(sql_block("""# ──────── Base ────────
NODE_ENV=production
APP_URL=https://bee.cm
API_URL=https://api.bee.cm

# ──────── Database ────────
DATABASE_URL=postgres://user:pass@host/bee?schema=public&pgbouncer=true
DIRECT_URL=postgres://user:pass@host/bee?schema=public  # migrations

# ──────── Redis ────────
REDIS_URL=rediss://default:token@upstash.io:6379

# ──────── Auth ────────
JWT_ACCESS_SECRET=...              # 64 bytes random
JWT_REFRESH_SECRET=...
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
ENCRYPTION_KEY=...                 # 32 bytes pour AES-256-GCM

# ──────── Admin seed ────────
ADMIN_EMAIL=admin@bee.cm
ADMIN_INITIAL_PASSWORD=...         # changé au 1er login

# ──────── Paiement ────────
CINETPAY_API_KEY=...
CINETPAY_SITE_ID=...
CINETPAY_SECRET=...
NOTCHPAY_API_KEY=...               # fallback

# ──────── KYC ────────
SMILE_IDENTITY_PARTNER_ID=...
SMILE_IDENTITY_API_KEY=...

# ──────── SMS / Email ────────
NEXAH_API_KEY=...
TWILIO_SID=...
TWILIO_AUTH_TOKEN=...
RESEND_API_KEY=...

# ──────── Storage ────────
R2_ACCOUNT_ID=...
R2_ACCESS_KEY=...
R2_SECRET_KEY=...
R2_BUCKET_PRODUCTS=bee-products
R2_BUCKET_KYC=bee-kyc-private

# ──────── Maps ────────
GOOGLE_MAPS_API_KEY=...

# ──────── Search ────────
MEILISEARCH_HOST=https://search.bee.cm
MEILISEARCH_MASTER_KEY=...

# ──────── Monitoring ────────
SENTRY_DSN=...
POSTHOG_KEY=...
BETTER_STACK_SOURCE_TOKEN=..."""))

story.append(PageBreak())

# Closing page
story.append(Spacer(1, 3*cm))
story.append(Paragraph("🐝", s("ClosingE","Normal",fontSize=56,alignment=TA_CENTER,textColor=AMBER)))
story.append(Spacer(1, 1*cm))
story.append(Paragraph("Bee Marketplace", s("C1","Normal",fontSize=26,alignment=TA_CENTER,textColor=INK,fontName="Helvetica-Bold")))
story.append(Paragraph("Architecture prête pour la croissance", s("C2","Normal",fontSize=14,alignment=TA_CENTER,textColor=SLATE)))
story.append(Spacer(1, 2*cm))

stats = Table([
    [Paragraph("<b>75</b><br/><font size=9 color='#334155'>Tables</font>", s("sc","Normal",alignment=TA_CENTER,fontSize=28,textColor=AMBER_DARK)),
     Paragraph("<b>22</b><br/><font size=9 color='#334155'>Domaines</font>", s("sc","Normal",alignment=TA_CENTER,fontSize=28,textColor=AMBER_DARK)),
     Paragraph("<b>3M+</b><br/><font size=9 color='#334155'>Users cibles</font>", s("sc","Normal",alignment=TA_CENTER,fontSize=28,textColor=AMBER_DARK)),
     Paragraph("<b>60+</b><br/><font size=9 color='#334155'>Outils stack</font>", s("sc","Normal",alignment=TA_CENTER,fontSize=28,textColor=AMBER_DARK))],
], colWidths=[4*cm,4*cm,4*cm,4*cm])
stats.setStyle(TableStyle([
    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
    ('ALIGN',(0,0),(-1,-1),'CENTER'),
    ('TOPPADDING',(0,0),(-1,-1),12),
    ('BOTTOMPADDING',(0,0),(-1,-1),12),
    ('BACKGROUND',(0,0),(-1,-1), SLATE_LIGHT),
    ('BOX',(0,0),(-1,-1), 0, white),
]))
story.append(stats)
story.append(Spacer(1, 3*cm))
story.append(Paragraph("Document confidentiel — Usage interne Bee", s("cl","Normal",fontSize=9,alignment=TA_CENTER,textColor=SLATE)))
story.append(Paragraph(f"Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}", s("cl","Normal",fontSize=9,alignment=TA_CENTER,textColor=SLATE)))

# Build
doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
print(f"OK: {OUT}")
