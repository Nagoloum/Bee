import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promoBanners } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// Seed data — synced with promo-carousel.tsx PROMO_BANNERS
const INITIAL_BANNERS = [
  {
    title:       "Ventes Flash d'été 🌞",
    subtitle:    "Jusqu'à -50% sur l'électronique · Stocks limités",
    cta:         "Profiter maintenant",
    ctaHref:     "/flash-sales",
    bgColor:     "from-orange-600 to-red-600",
    accentColor: "#FFD700",
    badge:       "⚡ FLASH",
    sortOrder:   0,
  },
  {
    title:       "Ouvrez votre boutique BEE",
    subtitle:    "Rejoignez 500+ vendeurs actifs · Plan Start 100% gratuit",
    cta:         "Démarrer gratuitement",
    ctaHref:     "/sign-up/vendor",
    bgColor:     "from-ink-900 to-ink-700",
    accentColor: "#F6861A",
    badge:       "🏪 VENDEURS",
    sortOrder:   1,
  },
  {
    title:       "Mode camerounaise 🇨🇲",
    subtitle:    "Wax, batik, kente — les plus belles tenues du pays",
    cta:         "Découvrir la collection",
    ctaHref:     "/products?category=mode",
    bgColor:     "from-green-800 to-green-600",
    accentColor: "#FFD700",
    badge:       "✨ NOUVEAU",
    sortOrder:   2,
  },
  {
    title:       "Livraison en 24h 🛵",
    subtitle:    "Partout à Yaoundé et Douala · 500 FCFA seulement",
    cta:         "Commander maintenant",
    ctaHref:     "/products",
    bgColor:     "from-blue-700 to-blue-900",
    accentColor: "#FFD700",
    badge:       "🚀 EXPRESS",
    sortOrder:   3,
  },
  {
    title:       "Artisanat & Créations locales",
    subtitle:    "Sculptures, bijoux, paniers — soutenez les artisans camerounais",
    cta:         "Explorer l'artisanat",
    ctaHref:     "/products?category=artisanat",
    bgColor:     "from-amber-700 to-orange-700",
    accentColor: "#FFF",
    badge:       "🎨 LOCAL",
    sortOrder:   4,
  },
];

// GET — list all banners (seeds if empty)
export async function GET() {
  try {
    let banners = await db.select().from(promoBanners).orderBy(asc(promoBanners.sortOrder));

    // Auto-seed from PROMO_BANNERS if DB is empty
    if (banners.length === 0) {
      await db.insert(promoBanners).values(
        INITIAL_BANNERS.map(b => ({ id: createId(), ...b, isActive: true }))
      );
      banners = await db.select().from(promoBanners).orderBy(asc(promoBanners.sortOrder));
    }

    return NextResponse.json(banners);
  } catch (err) {
    console.error("[admin/banners GET]", err);
    return NextResponse.json([], { status: 500 });
  }
}

// POST — create new banner
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();

    if (!body.title || !body.cta || !body.ctaHref) {
      return NextResponse.json({ error: "Titre, CTA et lien sont requis." }, { status: 400 });
    }

    // Get max sortOrder
    const existing = await db.select().from(promoBanners).orderBy(asc(promoBanners.sortOrder));
    const maxOrder  = existing.length > 0 ? Math.max(...existing.map(b => b.sortOrder)) + 1 : 0;

    const [banner] = await db.insert(promoBanners).values({
      id:          createId(),
      title:       body.title,
      subtitle:    body.subtitle ?? "",
      cta:         body.cta,
      ctaHref:     body.ctaHref,
      bgColor:     body.bgColor     ?? "from-ink-900 to-ink-700",
      accentColor: body.accentColor ?? "#F6861A",
      image:       body.image       ?? null,
      badge:       body.badge       ?? null,
      sortOrder:   maxOrder,
      isActive:    true,
    }).returning();

    return NextResponse.json(banner);
  } catch (err) {
    console.error("[admin/banners POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
