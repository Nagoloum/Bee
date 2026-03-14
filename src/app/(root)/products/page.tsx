import React from "react";
import { getProducts, getFeaturedCategories } from "@/lib/actions/products";
import { ProductCard, ProductCardSkeleton } from "@/components/storefront/product-card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const revalidate = 30;

const SORT_OPTIONS = [
  { value:"popular",    label:"Populaires"   },
  { value:"newest",     label:"Récents"      },
  { value:"price_asc",  label:"Prix croissant"},
  { value:"price_desc", label:"Prix décroissant"},
  { value:"rating",     label:"Mieux notés"  },
];

interface Props {
  searchParams: {
    category?: string;
    sort?:     string;
    search?:   string;
    page?:     string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const page     = Number(searchParams.page)     || 1;
  const minPrice = Number(searchParams.minPrice) || undefined;
  const maxPrice = Number(searchParams.maxPrice) || undefined;
  const sort     = (searchParams.sort as any)    || "popular";

  const [data, categories] = await Promise.all([
    getProducts({
      category: searchParams.category,
      search:   searchParams.search,
      sort,
      page,
      pageSize: 12,
      minPrice,
      maxPrice,
    }),
    getFeaturedCategories(),
  ]);

  const currentSort = SORT_OPTIONS.find(s => s.value === sort) ?? SORT_OPTIONS[0];

  // Build search params helper
  function buildUrl(params: Record<string, string | undefined>) {
    const base = new URLSearchParams();
    const merged = { ...searchParams, ...params };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) base.set(k, v);
    });
    return `/products?${base.toString()}`;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="container-bee py-6">
          <h1 className="font-poppins font-black text-2xl text-foreground mb-1">
            {searchParams.category
              ? categories.find(c => c.slug === searchParams.category)?.name ?? "Catalogue"
              : searchParams.search
              ? `Résultats pour "${searchParams.search}"`
              : "Tous les produits"}
          </h1>
          <p className="text-sm text-muted-foreground font-inter">
            {data.total} produit{data.total !== 1 ? "s" : ""} trouvé{data.total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="container-bee py-6">
        <div className="flex gap-6">

          {/* ── SIDEBAR FILTERS ───────────────────────────────────────────────── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20 space-y-6">

              {/* Categories */}
              <div>
                <p className="font-poppins font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                  <SlidersHorizontal size={14} /> Catégories
                </p>
                <div className="space-y-1">
                  <Link href="/products"
                    className={cn("block px-3 py-2 rounded-xl text-sm font-inter transition-colors",
                      !searchParams.category
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground-secondary hover:bg-muted hover:text-foreground")}>
                    Tout voir
                  </Link>
                  {categories.map(cat => (
                    <Link key={cat.id} href={buildUrl({ category: cat.slug, page: "1" })}
                      className={cn("block px-3 py-2 rounded-xl text-sm font-inter transition-colors",
                        searchParams.category === cat.slug
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground-secondary hover:bg-muted hover:text-foreground")}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <p className="font-poppins font-semibold text-sm text-foreground mb-3">Prix (FCFA)</p>
                <div className="space-y-2">
                  {[
                    { label:"Moins de 10 000",   min:undefined, max:"10000"  },
                    { label:"10 000 – 50 000",   min:"10000",   max:"50000"  },
                    { label:"50 000 – 100 000",  min:"50000",   max:"100000" },
                    { label:"Plus de 100 000",   min:"100000",  max:undefined },
                  ].map(range => {
                    const active = searchParams.minPrice === range.min && searchParams.maxPrice === range.max;
                    return (
                      <Link key={range.label}
                        href={active
                          ? buildUrl({ minPrice:undefined, maxPrice:undefined })
                          : buildUrl({ minPrice:range.min, maxPrice:range.max, page:"1" })}
                        className={cn("block px-3 py-2 rounded-xl text-sm font-inter transition-colors",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground-secondary hover:bg-muted hover:text-foreground")}>
                        {range.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Mobile category pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 lg:hidden scrollbar-hide">
              <Link href="/products"
                className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold font-poppins transition-colors",
                  !searchParams.category ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80")}>
                Tout
              </Link>
              {categories.map(cat => (
                <Link key={cat.id} href={buildUrl({ category: cat.slug, page:"1" })}
                  className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold font-poppins transition-colors",
                    searchParams.category === cat.slug
                      ? "bg-primary text-white"
                      : "bg-muted text-foreground hover:bg-muted/80")}>
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Sort bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground font-inter">
                <span className="font-semibold text-foreground">{data.total}</span> résultats
              </p>
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-muted-foreground" />
                <div className="flex gap-1">
                  {SORT_OPTIONS.map(opt => (
                    <Link key={opt.value} href={buildUrl({ sort: opt.value, page:"1" })}
                      className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold font-poppins transition-colors hidden sm:block",
                        sort === opt.value
                          ? "bg-secondary text-white"
                          : "bg-muted text-foreground hover:bg-muted/80")}>
                      {opt.label}
                    </Link>
                  ))}
                  {/* Mobile: select */}
                  <select
                    className="sm:hidden h-8 px-2 rounded-xl bg-muted border-0 text-xs font-inter focus:outline-none"
                    value={sort}
                    onChange={(e) => { window.location.href = buildUrl({ sort: e.target.value, page:"1" }); }}
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products grid */}
            {data.items.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {data.items.map((p) => (
                  <ProductCard key={p.id} product={p as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-poppins font-bold text-lg text-foreground mb-2">Aucun produit trouvé</h3>
                <p className="text-muted-foreground font-inter text-sm mb-6">Essayez d'autres filtres ou une autre recherche.</p>
                <Link href="/products" className="text-primary font-semibold font-poppins hover:underline text-sm">
                  Voir tous les produits
                </Link>
              </div>
            )}

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {data.hasPrev && (
                  <Link href={buildUrl({ page: String(page - 1) })}
                    className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-semibold font-poppins transition-colors">
                    ← Précédent
                  </Link>
                )}
                {Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => {
                  const p2 = i + 1;
                  return (
                    <Link key={p2} href={buildUrl({ page: String(p2) })}
                      className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold font-poppins transition-colors",
                        p2 === page ? "bg-primary text-white" : "bg-muted hover:bg-muted/80 text-foreground")}>
                      {p2}
                    </Link>
                  );
                })}
                {data.hasNext && (
                  <Link href={buildUrl({ page: String(page + 1) })}
                    className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-semibold font-poppins transition-colors">
                    Suivant →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
