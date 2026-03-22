import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { getAdminVendors } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { AdminVendorActions } from "@/components/admin/admin-vendor-actions";
import { cn } from "@/lib/utils/cn";

export const revalidate = 0;

const STATUS_FILTER = ["ALL", "PENDING", "ACTIVE", "SUSPENDED"];

interface Props {
  searchParams: { search?: string; status?: string };
}

export default async function AdminVendorsPage({ searchParams }: Props) {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in");

  const vendors = await getAdminVendors(searchParams.search, searchParams.status);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h1 className="font-poppins font-black text-2xl text-white">Boutiques</h1>
        <p className="text-sm font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>{vendors.length} boutique{vendors.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <AdminSearchBar placeholder="Rechercher une boutique…" paramKey="search" />
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTER.map(s => (
            <a key={s} href={`/admin/vendors${s !== "ALL" ? `?status=${s}` : ""}`}
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
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:"1px solid var(--adm-border)" }}>
                {["Boutique", "Région", "Statut", "Ventes", "Note", "Vérifié", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold font-poppins uppercase tracking-wider" style={{ color:"rgba(232,234,240,0.3)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm font-inter" style={{ color:"rgba(232,234,240,0.25)" }}>
                    Aucune boutique trouvée
                  </td>
                </tr>
              ) : (
                vendors.map(vendor => (
                  <tr key={vendor.id} className="adm-tr-hover transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {vendor.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={vendor.logo} alt={vendor.shopName}
                            className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-honey-gradient flex items-center justify-center text-sm shrink-0">
                            🐝
                          </div>
                        )}
                        <div>
                          <Link href={`/shop/${vendor.slug}`} target="_blank"
                            className="font-poppins font-semibold text-sm text-white hover:text-primary transition-colors">
                            {vendor.shopName}
                          </Link>
                          <p className="text-xs text-white/30 font-inter">/shop/{vendor.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-white/50 font-inter">{vendor.region}</td>
                    <td className="px-5 py-3">
                      <Badge variant={
                        vendor.status === "ACTIVE" ? "success"
                          : vendor.status === "PENDING" ? "warning" : "error"
                      } size="xs">
                        {vendor.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-white/50 font-inter">{vendor.totalSales}</td>
                    <td className="px-5 py-3 text-xs text-white/50 font-inter">
                      {vendor.rating > 0 ? `★ ${vendor.rating.toFixed(1)}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-xs font-inter">
                      <span className={vendor.isVerified ? "text-blue-400" : "text-white/30"}>
                        {vendor.isVerified ? "✓ Oui" : "Non"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <AdminVendorActions vendorId={vendor.id} isVerified={vendor.isVerified} currentStatus={vendor.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
