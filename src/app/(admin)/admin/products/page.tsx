import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { getAdminProducts } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { AdminProductActions } from "@/components/admin/admin-product-actions";
import { formatPrice, cn } from "@/lib/utils/cn";

export const revalidate = 0;

const STATUS_FILTER = ["ALL", "PUBLISHED", "DRAFT", "PENDING_REVIEW", "REJECTED", "ARCHIVED"];
const STATUS_BADGE: Record<string, any> = {
  PUBLISHED:      "success",
  DRAFT:          "muted",
  PENDING_REVIEW: "warning",
  REJECTED:       "error",
  ARCHIVED:       "muted",
};

interface Props {
  searchParams: { status?: string };
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in");

  const products = await getAdminProducts(searchParams.status);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h1 className="font-poppins font-black text-2xl text-white">Produits</h1>
        <p className="text-sm font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>{products.length} produit{products.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {STATUS_FILTER.map(s => (
          <a key={s} href={`/admin/products${s !== "ALL" ? `?status=${s}` : ""}`}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-semibold font-poppins transition-colors",
              (searchParams.status ?? "ALL") === s
                ? "bg-primary text-white"
                : "bg-white/8 text-white/50 hover:bg-white/12 hover:text-white"
            )}>
            {s}
          </a>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:"1px solid var(--adm-border)" }}>
                {["Produit", "Prix", "Stock", "Ventes", "Statut", "Ajouté le", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold font-poppins uppercase tracking-wider" style={{ color:"rgba(232,234,240,0.3)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm font-inter" style={{ color:"rgba(232,234,240,0.25)" }}>
                    Aucun produit
                  </td>
                </tr>
              ) : (
                products.map(product => {
                  const images = product.images as string[];
                  return (
                    <tr key={product.id} className="adm-tr-hover transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/8 shrink-0">
                            {images?.[0]
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-sm opacity-30">📦</div>
                            }
                          </div>
                          <div>
                            <Link href={`/products/${product.slug}`} target="_blank"
                              className="font-poppins font-semibold text-sm text-white hover:text-primary transition-colors line-clamp-1">
                              {product.name}
                            </Link>
                            <p className="text-xs text-white/30 font-inter">★ {product.rating.toFixed(1)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-white font-poppins">
                        {formatPrice(product.basePrice)}
                      </td>
                      <td className="px-5 py-3 text-xs text-white/50 font-inter">
                        {(product as any).stock ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-white/50 font-inter">{product.totalSales}</td>
                      <td className="px-5 py-3">
                        <Badge variant={STATUS_BADGE[product.status] ?? "muted"} size="xs">
                          {product.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-xs text-white/40 font-inter">
                        {new Date(product.createdAt).toLocaleDateString("fr-CM")}
                      </td>
                      <td className="px-5 py-3">
                        <AdminProductActions productId={product.id} currentStatus={product.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
