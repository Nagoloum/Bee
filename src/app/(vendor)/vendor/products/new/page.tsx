import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/helpers";
import { getVendorByUserId, getAllCategories } from "@/lib/actions/vendor";
import { ProductForm } from "@/components/vendor/product-form";

export default async function NewProductPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");
  const vendor     = await getVendorByUserId((session.user as any).id);
  if (!vendor)     redirect("/sign-up/vendor");
  const categories = await getAllCategories();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-poppins font-black text-2xl text-foreground">Nouveau produit</h1>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">Renseignez les informations de votre produit</p>
      </div>
      <ProductForm vendorId={vendor.id} categories={categories} />
    </div>
  );
}
