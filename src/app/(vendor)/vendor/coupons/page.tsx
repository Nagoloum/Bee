import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/helpers";
import { getVendorByUserId, getVendorSubscription } from "@/lib/actions/vendor";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/cn";
import { VendorCouponsClient } from "@/components/vendor/vendor-coupons-client";

export const revalidate = 0;

export default async function VendorCouponsPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const vendor = await getVendorByUserId((session.user as any).id);
  if (!vendor)  redirect("/sign-up/vendor");

  const subscription = await getVendorSubscription(vendor.id);

  // Limits by plan
  const maxCoupons = subscription?.maxCoupons ?? 0;
  const maxDiscount = subscription?.couponMaxDiscount ?? 15;

  const vendorCoupons = await db
    .select()
    .from(coupons)
    .where(eq(coupons.vendorId, vendor.id))
    .orderBy(desc(coupons.createdAt));

  return (
    <VendorCouponsClient
      vendorId={vendor.id}
      coupons={vendorCoupons}
      maxCoupons={maxCoupons}
      maxDiscount={maxDiscount}
      planName={subscription?.planName ?? "Start"}
    />
  );
}
