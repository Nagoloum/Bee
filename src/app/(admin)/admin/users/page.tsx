import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { getAdminUsers } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { AdminUserActions } from "@/components/admin/admin-user-actions";
import { cn } from "@/lib/utils/cn";

export const revalidate = 0;

const ROLE_FILTER = ["ALL", "CLIENT", "VENDOR", "DELIVERY", "ADMIN"];
const ROLE_BADGE: Record<string, any> = {
  CLIENT:   "muted",
  VENDOR:   "default",
  DELIVERY: "secondary",
  ADMIN:    "premium",
};

interface Props {
  searchParams: { search?: string; role?: string };
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in");

  const users = await getAdminUsers(searchParams.search, searchParams.role);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h1 className="font-poppins font-black text-2xl text-white">Utilisateurs</h1>
        <p className="text-sm font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>{users.length} résultat{users.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <AdminSearchBar placeholder="Rechercher par nom ou email…" paramKey="search" />
        <div className="flex gap-1.5 flex-wrap">
          {ROLE_FILTER.map(r => (
            <a key={r} href={`/admin/users${r !== "ALL" ? `?role=${r}` : ""}`}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-semibold font-poppins transition-colors",
                (searchParams.role ?? "ALL") === r
                  ? "bg-primary text-white"
                  : "bg-white/8 text-white/50 hover:bg-white/12 hover:text-white"
              )}>
              {r}
            </a>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:"1px solid var(--adm-border)" }}>
                {["Utilisateur", "Rôle", "Statut", "Email vérifié", "Inscription", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold font-poppins uppercase tracking-wider" style={{ color:"rgba(232,234,240,0.3)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm font-inter" style={{ color:"rgba(232,234,240,0.25)" }}>
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="adm-tr-hover transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-honey-gradient flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-poppins font-semibold text-sm text-white">{user.name}</p>
                          <p className="text-xs text-white/30 font-inter">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={ROLE_BADGE[user.role] ?? "muted"} size="xs">{user.role}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={user.status === "ACTIVE" ? "success" : "error"} size="xs">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-white/50 font-inter">
                      {user.emailVerified ? "✓ Oui" : "✗ Non"}
                    </td>
                    <td className="px-5 py-3 text-xs text-white/40 font-inter">
                      {new Date(user.createdAt).toLocaleDateString("fr-CM")}
                    </td>
                    <td className="px-5 py-3">
                      <AdminUserActions userId={user.id} currentStatus={user.status ?? "ACTIVE"} />
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
