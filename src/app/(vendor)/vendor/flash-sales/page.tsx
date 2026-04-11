import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/helpers";
import { getVendorByUserId, getVendorProducts, getVendorSubscription } from "@/lib/actions/vendor";
import { db } from "@/lib/db";
import { flashSales, products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { VendorFlashSalesClient } from "@/components/vendor/vendor-flash-sales-client";

export const revalidate = 0;

export default async function VendorFlashSalesPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const vendor = await getVendorByUserId((session.user as any).id);
  if (!vendor)  redirect("/sign-up/vendor");

  const subscription = await getVendorSubscription(vendor.id);
  const maxPerDay    = subscription?.flashPerDay ?? 0;

  const vendorProducts = await getVendorProducts(vendor.id);
  const publishedProducts = vendorProducts.filter(p => p.status === "PUBLISHED" && p.stock > 0);

  const sales = await db
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
      isActive:        flashSales.isActive,
      productName:     products.name,
    })
    .from(flashSales)
    .leftJoin(products, eq(flashSales.productId, products.id))
    .where(eq(flashSales.vendorId, vendor.id))
    .orderBy(desc(flashSales.createdAt))
    .limit(20);

  return (
    <VendorFlashSalesClient
      vendorId={vendor.id}
      sales={sales as any}
      products={publishedProducts as any}
      maxPerDay={maxPerDay}
      planName={subscription?.planName ?? "Start"}
    />
  );
}
