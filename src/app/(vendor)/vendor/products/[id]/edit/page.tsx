import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "@/lib/auth/helpers";
import { getVendorByUserId, getAllCategories } from "@/lib/actions/vendor";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ProductForm } from "@/components/vendor/product-form";

export const revalidate = 0;

interface Props { params: { id: string } }

export default async function EditProductPage({ params }: Props) {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const vendor = await getVendorByUserId((session.user as any).id);
  if (!vendor)  redirect("/sign-up/vendor");

  // Load product — ensure it belongs to this vendor
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.id, params.id), eq(products.vendorId, vendor.id)))
    .limit(1);

  if (!rows[0]) notFound();

  const product    = rows[0];
  const categories = await getAllCategories();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/vendor/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-inter mb-4">
          <ArrowLeft size={14} /> Retour aux produits
        </Link>
        <h1 className="font-poppins font-black text-2xl text-foreground">Modifier le produit</h1>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">
          {product.name}
        </p>
      </div>
      <ProductForm
        vendorId={vendor.id}
        categories={categories}
        initial={product}
      />
    </div>
  );
}
