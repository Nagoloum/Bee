import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Zap, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { getFeaturedProducts, getNewArrivals, getFeaturedCategories, getTopVendors } from "@/lib/actions/products";
import { getActiveBanners } from "@/lib/actions/banners";
import { ProductCard } from "@/components/storefront/product-card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import * as LucideIcons from "lucide-react";
import { PromoBannerCarousel } from "@/components/storefront/promo-carousel";
// ✅ PATCH — capture le ?ref= dans sessionStorage pour le parrainage
import { RefCapture } from "@/components/storefront/ref-capture";

export const revalidate = 60;

function SectionHeader({ title, subtitle, href, badge }: { title: string; subtitle?: string; href?: string; badge?: string }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        {badge && <Badge variant="default" size="sm" className="mb-2">{badge}</Badge>}
        <h2 className="font-poppins font-black text-2xl md:text-3xl text-foreground">{title}</h2>
        {subtitle && <p className="text-muted-foreground text-sm font-inter mt-1">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all font-poppins whitespace-nowrap">
          Voir tout <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [featured, newArrivals, featuredCats, topVendors, dbBanners] = await Promise.all([
    getFeaturedProducts(8),
    getNewArrivals(8),
    getFeaturedCategories(),
    getTopVendors(6),
    getActiveBanners(),
  ]);

  return (
    <div className="min-h-screen">
      {/* ✅ PATCH — RefCapture (invisible, capture ?ref= pour le parrainage) */}
      <Suspense fallback={null}>
        <RefCapture />
      </Suspense>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0 bg-dots-pattern opacity-20" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-honey-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="container-bee relative py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-semibold font-poppins mb-6 animate-fade-down">
              <span className="animate-buzz">🐝</span>
              Le marché qui bourdonne au Cameroun
            </div>
            <h1 className="font-poppins font-black text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-6 animate-fade-up">
              Tout ce dont vous avez besoin,{" "}
              <span className="text-transparent bg-clip-text bg-honey-gradient">livré chez vous</span>
            </h1>
            <p className="text-white/70 text-lg font-inter leading-relaxed mb-8 max-w-xl animate-fade-up">
              Des milliers de produits auprès des meilleurs vendeurs du Cameroun. Paiement sécurisé, livraison rapide.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-up">
              <Link href="/products" className="inline-flex items-center gap-2 h-12 px-7 rounded-2xl bg-primary text-white font-poppins font-bold hover:bg-primary-hover transition-all shadow-honey hover:shadow-honey-lg">
                Explorer le catalogue <ArrowRight size={18} />
              </Link>
              <Link href="/sign-up/vendor" className="inline-flex items-center gap-2 h-12 px-7 rounded-2xl bg-white/10 text-white border border-white/20 font-poppins font-semibold hover:bg-white/20 transition-all">
                🏪 Vendre sur BEE
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 mt-10 animate-fade-up">
              {[{ value:"500+", label:"Vendeurs actifs" }, { value:"5 000+", label:"Produits" }, { value:"24h", label:"Livraison max" }].map(s => (
                <div key={s.label}>
                  <p className="font-poppins font-black text-2xl text-honey-400">{s.value}</p>
                  <p className="text-white/50 text-xs font-inter">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 50V25C240 0 480 50 720 25C960 0 1200 50 1440 25V50H0Z" fill="#FDFCF9"/>
          </svg>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────────────────────── */}
      <section className="bg-background border-b border-border">
        <div className="container-bee py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck,       text:"Livraison rapide",  sub:"Partout au Cameroun"   },
              { icon: ShieldCheck, text:"Paiement sécurisé", sub:"Stripe & Mobile Money" },
              { icon: RefreshCw,   text:"Retour facile",     sub:"Sous 7 jours"          },
              { icon: Zap,         text:"Ventes Flash",      sub:"Jusqu'à -50%"          },
            ].map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-xl bg-honey-50 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold font-poppins text-foreground">{text}</p>
                  <p className="text-xs text-muted-foreground font-inter">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMO CAROUSEL ────────────────────────────────────────────────────── */}
      <PromoBannerCarousel banners={dbBanners.length > 0 ? dbBanners : undefined} />

      {/* ── CATEGORIES ────────────────────────────────────────────────────────── */}
      <section className="container-bee section-bee">
        <SectionHeader title="Catégories populaires" subtitle="Explorez par univers" href="/categories" badge="🗂️ Voir tout" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {featuredCats.map((cat) => {
            const IconComp = (LucideIcons as any)[cat.icon ?? "Package"];
            const image = cat.image;
            return (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-border hover:border-honey-300 hover:shadow-honey transition-all duration-200 aspect-square flex flex-col justify-end">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}18` }}>
                    {IconComp ? <IconComp size={28} style={{ color: cat.color }} /> : <span className="text-2xl">📦</span>}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="relative px-2.5 pb-2.5">
                  <span className="block text-xs font-bold font-poppins text-white leading-tight text-center">
                    {cat.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-cream-100">
          <div className="container-bee section-bee">
            <SectionHeader title="Produits en vedette" subtitle="Sélection de nos meilleurs articles" href="/products?sort=popular" badge="⭐ Coups de cœur" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((p) => <ProductCard key={p.id} product={p as any} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── FLASH BANNER ──────────────────────────────────────────────────────── */}
      <section className="container-bee py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 to-orange-500 p-8 md:p-10">
          <div className="absolute inset-0 bg-dots-pattern opacity-20" />
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={20} className="fill-white" />
                <span className="font-poppins font-black text-sm uppercase tracking-widest opacity-90">Ventes Flash</span>
              </div>
              <h2 className="font-poppins font-black text-3xl md:text-4xl mb-2">Jusqu'à <span className="text-yellow-300">-50%</span></h2>
              <p className="font-inter opacity-80 text-sm">Offres limitées · Stocks limités · Chaque jour</p>
            </div>
            <Link href="/flash-sales" className="shrink-0 inline-flex items-center gap-2 h-12 px-8 rounded-2xl bg-white text-red-600 font-poppins font-bold transition-all shadow-xl">
              <Zap size={16} className="fill-current" /> Voir les offres flash
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ──────────────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="container-bee pb-12">
          <SectionHeader title="Nouveautés" subtitle="Les derniers arrivages sur BEE" href="/products?sort=newest" badge="🆕 Récents" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p as any} />)}
          </div>
        </section>
      )}

      {/* ── TOP VENDORS ───────────────────────────────────────────────────────── */}
      {topVendors.length > 0 && (
        <section className="bg-ink-900">
          <div className="container-bee section-bee">
            <div className="flex items-end justify-between mb-6">
              <div>
                <Badge variant="default" size="sm" className="mb-2 bg-primary/20 text-primary border-primary/30">🏆 Top vendeurs</Badge>
                <h2 className="font-poppins font-black text-2xl md:text-3xl text-white">Boutiques de confiance</h2>
                <p className="text-white/50 text-sm font-inter mt-1">Vendeurs vérifiés et notés par la communauté</p>
              </div>
              <Link href="/shops" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all font-poppins">
                Toutes <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {topVendors.map((v) => (
                <Link key={v.id} href={`/shop/${v.slug}`}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all text-center">
                  <Avatar name={v.shopName} size="lg" color="random" ring />
                  <div>
                    <p className="font-poppins font-semibold text-sm text-white line-clamp-1">{v.shopName}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-honey-400 text-xs">★</span>
                      <span className="text-xs text-white/60 font-inter">{v.rating.toFixed(1)}</span>
                      {v.isVerified && <span className="text-xs text-blue-400 ml-1">✓</span>}
                    </div>
                    <p className="text-xs text-white/40 font-inter mt-0.5">{v.totalSales} ventes</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BECOME VENDOR / DELIVERY ──────────────────────────────────────────── */}
      <section className="container-bee section-bee">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-3xl bg-honey-gradient p-8">
            <div className="absolute right-4 top-4 text-7xl opacity-20 pointer-events-none">🏪</div>
            <h3 className="font-poppins font-black text-2xl text-white mb-2">Vendez sur BEE</h3>
            <p className="text-white/80 font-inter text-sm mb-5">Ouvrez votre boutique gratuitement et touchez des milliers de clients.</p>
            <Link href="/sign-up/vendor" className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-white text-primary font-poppins font-bold text-sm hover:shadow-lg transition-all">
              Commencer gratuitement →
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-ink-gradient p-8">
            <div className="absolute right-4 top-4 text-7xl opacity-20 pointer-events-none">🛵</div>
            <h3 className="font-poppins font-black text-2xl text-white mb-2">Livrez avec BEE</h3>
            <p className="text-white/60 font-inter text-sm mb-5">Gagnez 500 FCFA par livraison à votre rythme. Décrochez le badge Fiable.</p>
            <Link href="/sign-up/delivery" className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-white font-poppins font-bold text-sm hover:bg-primary-hover transition-all shadow-honey">
              Devenir livreur →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
