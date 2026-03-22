import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { getServerSession } from "@/lib/auth/helpers";
import { getVendorByUserId, getVendorProducts } from "@/lib/actions/vendor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, cn } from "@/lib/utils/cn";

export const revalidate = 0;

const STATUS = {
  PUBLISHED:      { label: "Publié",    variant: "success" as const },
  DRAFT:          { label: "Brouillon", variant: "muted"   as const },
  ARCHIVED:       { label: "Archivé",   variant: "muted"   as const },
  PENDING_REVIEW: { label: "En révision",variant:"warning" as const },
  REJECTED:       { label: "Rejeté",    variant: "error"   as const },
};

export default async function VendorProductsPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");
  const vendor = await getVendorByUserId((session.user as any).id);
  if (!vendor)  redirect("/sign-up/vendor");

  const products = await getVendorProducts(vendor.id);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins font-black text-2xl text-foreground">Mes produits</h1>
          <p className="text-sm text-muted-foreground font-inter mt-0.5">{products.length} produit{products.length !== 1 ? "s" : ""} au total</p>
        </div>
        <Button asChild leftIcon={<Plus size={16} />}>
          <Link href="/vendor/products/new">Ajouter un produit</Link>
        </Button>
      </div>

      {/* Empty state */}
      {products.length === 0 ? (
        <Card padding="lg" className="text-center py-16">
          <CardContent>
            <div className="text-5xl mb-4">📦</div>
            <h3 className="font-poppins font-bold text-lg text-foreground mb-2">Aucun produit</h3>
            <p className="text-muted-foreground font-inter text-sm mb-6 max-w-sm mx-auto">
              Commencez à vendre en ajoutant votre premier produit à votre boutique.
            </p>
            <Button asChild leftIcon={<Plus size={16} />}>
              <Link href="/vendor/products/new">Ajouter un produit</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {products.map((product) => {
            const status = STATUS[product.status] ?? STATUS.DRAFT;
            const images = product.images as string[];
            return (
              <Card key={product.id} padding="none" hover="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                      {images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">📦</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-poppins font-semibold text-sm text-foreground truncate">{product.name}</p>
                        <Badge variant={status.variant} size="xs">{status.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-inter">
                        <span className="font-semibold text-foreground">{formatPrice(product.basePrice)}</span>
                        {product.comparePrice && (
                          <span className="line-through">{formatPrice(product.comparePrice)}</span>
                        )}
                        <span>Stock: {product.stock}</span>
                        <span>{product.totalSales} vente{product.totalSales !== 1 ? "s" : ""}</span>
                        <span>★ {product.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/products/${product.slug}`} target="_blank">
                          <Eye size={15} />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/vendor/products/${product.id}/edit`}>
                          <Edit size={15} />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
