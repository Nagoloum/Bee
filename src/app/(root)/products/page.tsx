import React from "react";
import { getProducts, getFeaturedCategories } from "@/lib/actions/products";
import { ProductCard, ProductCardSkeleton } from "@/components/storefront/product-card";
import { ProductsFilters, SidebarFilters } from "@/components/storefront/products-filters";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export const revalidate = 30;

interface Props {
  searchParams: {
    category?: string; sort?: string; search?: string;
    page?: string; minPrice?: string; maxPrice?: string;
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const page     = Number(searchParams.page)     || 1;
  const minPrice = Number(searchParams.minPrice) || undefined;
  const maxPrice = Number(searchParams.maxPrice) || undefined;
  const sort     = (searchParams.sort as any)    || "popular";

  const [data, categories] = await Promise.all([
    getProducts({
      category: searchParams.category, search: searchParams.search,
      sort, page, pageSize: 12, minPrice, maxPrice,
    }),
    getFeaturedCategories(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="container-bee py-6">
          <h1 className="font-poppins font-black text-2xl text-foreground mb-0.5">
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
          {/* Sidebar */}
          <SidebarFilters
            categories={categories}
            currentCategory={searchParams.category}
            currentMinPrice={searchParams.minPrice}
            currentMaxPrice={searchParams.maxPrice}
            searchParams={searchParams as Record<string, string | undefined>}
          />

          {/* Main */}
          <div className="flex-1 min-w-0 space-y-5">
            <ProductsFilters
              categories={categories}
              currentCategory={searchParams.category}
              currentSort={sort}
              currentMinPrice={searchParams.minPrice}
              currentMaxPrice={searchParams.maxPrice}
              total={data.total}
              searchParams={searchParams as Record<string, string | undefined>}
            />

            {/* Grid */}
            {data.items.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {data.items.map(p => <ProductCard key={p.id} product={p as any} />)}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-poppins font-bold text-lg text-foreground mb-2">Aucun produit trouvé</h3>
                <p className="text-muted-foreground font-inter text-sm mb-5">Essayez d'autres filtres.</p>
                <Link href="/products" className="text-primary font-semibold font-poppins hover:underline text-sm">
                  Voir tous les produits
                </Link>
              </div>
            )}

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
                {data.hasPrev && (
                  <a href={`/products?page=${page - 1}`}
                    className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-semibold font-poppins transition-colors">
                    ← Précédent
                  </a>
                )}
                {Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => {
                  const p2 = i + 1;
                  return (
                    <a key={p2} href={`/products?page=${p2}`}
                      className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold font-poppins transition-colors",
                        p2 === page ? "bg-primary text-white" : "bg-muted hover:bg-muted/80 text-foreground")}>
                      {p2}
                    </a>
                  );
                })}
                {data.hasNext && (
                  <a href={`/products?page=${page + 1}`}
                    className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-semibold font-poppins transition-colors">
                    Suivant →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
