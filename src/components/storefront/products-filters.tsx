"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const SORT_OPTIONS = [
  { value: "popular",    label: "Populaires"        },
  { value: "newest",     label: "Récents"           },
  { value: "price_asc",  label: "Prix croissant"    },
  { value: "price_desc", label: "Prix décroissant"  },
  { value: "rating",     label: "Mieux notés"       },
];

interface Category { id: string; name: string; slug: string }

interface ProductsFiltersProps {
  categories:      Category[];
  currentCategory: string | undefined;
  currentSort:     string;
  currentMinPrice: string | undefined;
  currentMaxPrice: string | undefined;
  total:           number;
  searchParams:    Record<string, string | undefined>;
}

export function ProductsFilters({
  categories, currentCategory, currentSort,
  currentMinPrice, currentMaxPrice, total, searchParams,
}: ProductsFiltersProps) {
  const router = useRouter();

  function buildUrl(params: Record<string, string | undefined>) {
    const base = new URLSearchParams();
    const merged = { ...searchParams, ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v) base.set(k, v); });
    return `/products?${base.toString()}`;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden scrollbar-hide">
        <Link href="/products"
          className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold font-poppins transition-colors",
            !currentCategory ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80")}>
          Tout
        </Link>
        {categories.map(cat => (
          <Link key={cat.id} href={buildUrl({ category: cat.slug, page: "1" })}
            className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold font-poppins transition-colors",
              currentCategory === cat.slug ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80")}>
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Sort bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground font-inter">
          <span className="font-semibold text-foreground">{total}</span> résultats
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <ArrowUpDown size={14} className="text-muted-foreground" />
          <div className="hidden sm:flex gap-1 flex-wrap">
            {SORT_OPTIONS.map(opt => (
              <Link key={opt.value} href={buildUrl({ sort: opt.value, page: "1" })}
                className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold font-poppins transition-colors",
                  currentSort === opt.value ? "bg-secondary text-white" : "bg-muted text-foreground hover:bg-muted/80")}>
                {opt.label}
              </Link>
            ))}
          </div>
          {/* Mobile sort select */}
          <select
            className="sm:hidden h-8 px-2 rounded-xl bg-muted border-0 text-xs font-inter focus:outline-none cursor-pointer"
            value={currentSort}
            onChange={(e) => router.push(buildUrl({ sort: e.target.value, page: "1" }))}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar filters (also needs to be client for price range links) ──────────

interface SidebarFiltersProps {
  categories:      Category[];
  currentCategory: string | undefined;
  currentMinPrice: string | undefined;
  currentMaxPrice: string | undefined;
  searchParams:    Record<string, string | undefined>;
}

export function SidebarFilters({
  categories, currentCategory, currentMinPrice, currentMaxPrice, searchParams,
}: SidebarFiltersProps) {
  function buildUrl(params: Record<string, string | undefined>) {
    const base = new URLSearchParams();
    const merged = { ...searchParams, ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v) base.set(k, v); });
    return `/products?${base.toString()}`;
  }

  const PRICE_RANGES = [
    { label: "Moins de 10 000",  min: undefined,  max: "10000"  },
    { label: "10 000 – 50 000",  min: "10000",    max: "50000"  },
    { label: "50 000 – 100 000", min: "50000",    max: "100000" },
    { label: "Plus de 100 000",  min: "100000",   max: undefined },
  ];

  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Categories */}
        <div>
          <p className="font-poppins font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <SlidersHorizontal size={14} /> Catégories
          </p>
          <div className="space-y-1">
            <Link href="/products"
              className={cn("block px-3 py-2 rounded-xl text-sm font-inter transition-colors",
                !currentCategory ? "bg-primary/10 text-primary font-semibold" : "text-foreground-secondary hover:bg-muted hover:text-foreground")}>
              Tout voir
            </Link>
            {categories.map(cat => (
              <Link key={cat.id} href={buildUrl({ category: cat.slug, page: "1" })}
                className={cn("block px-3 py-2 rounded-xl text-sm font-inter transition-colors",
                  currentCategory === cat.slug ? "bg-primary/10 text-primary font-semibold" : "text-foreground-secondary hover:bg-muted hover:text-foreground")}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div>
          <p className="font-poppins font-semibold text-sm text-foreground mb-3">Prix (FCFA)</p>
          <div className="space-y-1">
            {PRICE_RANGES.map(range => {
              const active = currentMinPrice === range.min && currentMaxPrice === range.max;
              return (
                <Link key={range.label}
                  href={active
                    ? buildUrl({ minPrice: undefined, maxPrice: undefined })
                    : buildUrl({ minPrice: range.min, maxPrice: range.max, page: "1" })}
                  className={cn("block px-3 py-2 rounded-xl text-sm font-inter transition-colors",
                    active ? "bg-primary/10 text-primary font-semibold" : "text-foreground-secondary hover:bg-muted hover:text-foreground")}>
                  {range.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
