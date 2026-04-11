import Link from "next/link";
import { Zap, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { flashSales, products, vendors } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { FlashSalesClient } from "@/components/storefront/flash-sales-client";
import { formatPrice } from "@/lib/utils/cn";

export const revalidate = 30;
export const metadata = { title: "Ventes Flash ⚡ — BEE" };

export default async function FlashSalesPage() {
  const now = new Date();

  const activeSales = await db
    .select({
      id:              flashSales.id,
      productId:       flashSales.productId,
      discountPercent: flashSales.discountPercent,
      originalPrice:   flashSales.originalPrice,
      flashPrice:      flashSales.flashPrice,
      stock:           flashSales.stock,
      sold:            flashSales.sold,
      startAt:         flashSales.startAt,
      endAt:           flashSales.endAt,
      // Product
      productName:     products.name,
      productSlug:     products.slug,
      productImages:   products.images,
      // Vendor
      vendorName:      vendors.shopName,
      vendorSlug:      vendors.slug,
    })
    .from(flashSales)
    .leftJoin(products, eq(flashSales.productId, products.id))
    .leftJoin(vendors,  eq(flashSales.vendorId,  vendors.id))
    .where(and(
      eq(flashSales.isActive, true),
      lte(flashSales.startAt, now),
      gte(flashSales.endAt,   now),
    ))
    .orderBy(desc(flashSales.discountPercent));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-orange-500 py-14">
        <div className="absolute inset-0 bg-dots-pattern opacity-20" />
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="container-bee relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white text-sm font-semibold font-poppins mb-4">
            <Zap size={16} className="fill-white" />
            Offres limitées · Stocks limités
          </div>
          <h1 className="font-poppins font-black text-4xl md:text-5xl text-white mb-3">
            ⚡ Ventes Flash
          </h1>
          <p className="text-white/80 font-inter text-lg">
            {activeSales.length} offre{activeSales.length !== 1 ? "s" : ""} en cours · Profitez-en avant qu'il ne soit trop tard
          </p>
        </div>
      </div>

      <div className="container-bee py-10">
        {activeSales.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="font-poppins font-bold text-2xl text-foreground mb-3">
              Aucune vente flash en ce moment
            </h2>
            <p className="text-muted-foreground font-inter mb-6">
              Les ventes flash sont limitées dans le temps. Revenez bientôt ou explorez notre catalogue.
            </p>
            <Link href="/products"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl bg-primary text-white font-poppins font-bold">
              Voir tous les produits
            </Link>
          </div>
        ) : (
          <FlashSalesClient sales={activeSales as any} />
        )}
      </div>
    </div>
  );
}
