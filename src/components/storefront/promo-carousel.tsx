"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface BannerSlide {
  id:          string;
  title:       string;
  subtitle:    string;
  cta:         string;
  ctaHref:     string;
  bgColor:     string;
  accentColor: string;
  image?:      string;
  badge?:      string;
}

// Données figées — configurables via admin panel (Phase 8)
export const PROMO_BANNERS: BannerSlide[] = [
  {
    id:          "flash-summer",
    title:       "Ventes Flash d'été 🌞",
    subtitle:    "Jusqu'à -50% sur l'électronique · Stocks limités",
    cta:         "Profiter maintenant",
    ctaHref:     "/flash-sales",
    bgColor:     "from-orange-600 to-red-600",
    accentColor: "#FFD700",
    badge:       "⚡ FLASH",
  },
  {
    id:          "new-vendors",
    title:       "Ouvrez votre boutique BEE",
    subtitle:    "Rejoignez 500+ vendeurs actifs · Plan Start 100% gratuit",
    cta:         "Démarrer gratuitement",
    ctaHref:     "/sign-up/vendor",
    bgColor:     "from-ink-900 to-ink-700",
    accentColor: "#F6861A",
    badge:       "🏪 VENDEURS",
  },
  {
    id:          "mode-cm",
    title:       "Mode camerounaise 🇨🇲",
    subtitle:    "Wax, batik, kente — les plus belles tenues du pays",
    cta:         "Découvrir la collection",
    ctaHref:     "/products?category=mode",
    bgColor:     "from-green-800 to-green-600",
    accentColor: "#FFD700",
    badge:       "✨ NOUVEAU",
  },
  {
    id:          "livraison-rapide",
    title:       "Livraison en 24h 🛵",
    subtitle:    "Partout à Yaoundé et Douala · 500 FCFA seulement",
    cta:         "Commander maintenant",
    ctaHref:     "/products",
    bgColor:     "from-blue-700 to-blue-900",
    accentColor: "#FFD700",
    badge:       "🚀 EXPRESS",
  },
  {
    id:          "artisanat",
    title:       "Artisanat & Créations locales",
    subtitle:    "Sculptures, bijoux, paniers — soutenez les artisans camerounais",
    cta:         "Explorer l'artisanat",
    ctaHref:     "/products?category=artisanat",
    bgColor:     "from-amber-700 to-orange-700",
    accentColor: "#FFF",
    badge:       "🎨 LOCAL",
  },
];

interface Props {
  banners?: BannerSlide[];
  autoPlay?: boolean;
  interval?: number;
}

export function PromoBannerCarousel({
  banners = PROMO_BANNERS,
  autoPlay = true,
  interval = 5000,
}: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);

  const next = useCallback(() =>
    setCurrent((c) => (c + 1) % banners.length), [banners.length]);
  const prev = () =>
    setCurrent((c) => (c - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (!autoPlay || paused) return;
    const t = setTimeout(next, interval);
    return () => clearTimeout(t);
  }, [current, autoPlay, paused, interval, next]);

  const slide = banners[current];

  return (
    <section
      className="relative overflow-hidden w-full"
      style={{ aspectRatio: "21/7" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-in-out",
            i === current ? "opacity-100 translate-x-0" : i < current ? "opacity-0 -translate-x-full" : "opacity-0 translate-x-full"
          )}
        >
          {/* Background */}
          <div className={cn("absolute inset-0 bg-gradient-to-r", b.bgColor)} />
          <div className="absolute inset-0 bg-dots-pattern opacity-10" />
          {b.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          {/* Glow */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: b.accentColor }} />

          {/* Content */}
          <div className="relative h-full container-bee flex items-center">
            <div className="max-w-xl py-6 sm:py-8">
              {b.badge && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-poppins mb-3 border border-white/30"
                  style={{ color: b.accentColor, backgroundColor: "rgba(255,255,255,0.1)" }}>
                  {b.badge}
                </span>
              )}
              <h2 className="font-poppins font-black text-xl sm:text-2xl md:text-3xl text-white leading-tight mb-2">
                {b.title}
              </h2>
              <p className="text-white/70 font-inter text-sm sm:text-base mb-5 leading-relaxed">
                {b.subtitle}
              </p>
              <Link
                href={b.ctaHref}
                className="inline-flex items-center gap-2 h-10 sm:h-11 px-5 sm:px-7 rounded-2xl font-poppins font-bold text-sm transition-all hover:shadow-xl active:scale-[0.98]"
                style={{ backgroundColor: b.accentColor, color: "#1A1A2E" }}
              >
                {b.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10">
        <ChevronLeft size={18} />
      </button>
      <button onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10">
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {banners.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={cn(
              "transition-all duration-300 rounded-full",
              i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"
            )} />
        ))}
      </div>
    </section>
  );
}
