"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Package, ShoppingBag,
  AlertTriangle, ArrowUpRight, LayoutGrid, Award,
  Download, Settings, Megaphone, LogOut, Menu,
  ShieldCheck, Gift, Briefcase, TrendingUp,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { href: "/admin",          icon: LayoutDashboard, label: "Dashboard",   exact: true },
      { href: "/admin/users",    icon: Users,           label: "Utilisateurs" },
      { href: "/admin/products", icon: Package,         label: "Produits"     },
      { href: "/admin/orders",   icon: ShoppingBag,     label: "Commandes"    },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/catalog/categories", icon: LayoutGrid,    label: "Catégories"   },
      { href: "/admin/disputes",           icon: AlertTriangle, label: "Litiges"       },
      { href: "/admin/badges",             icon: Award,         label: "Badges"        },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/finance/withdrawals", icon: ArrowUpRight, label: "Retraits"          },
      // ✅ PATCH — Règles cashback
      { href: "/admin/finance/cashback",    icon: Gift,         label: "Règles cashback"   },
    ],
  },
  {
    label: "Vendeurs",
    items: [
      // ✅ PATCH — Abonnements gratuits
      { href: "/admin/vendors/subscriptions", icon: Gift,      label: "Abonnements gratuits" },
    ],
  },
  {
    label: "CMS & Config",
    items: [
      { href: "/admin/cms/banners", icon: Megaphone,  label: "Bannières"  },
      { href: "/admin/settings",    icon: Settings,   label: "Paramètres" },
      { href: "/admin/export",      icon: Download,   label: "Export CSV" },
    ],
  },
  {
    label: "Sécurité",
    items: [
      // ✅ PATCH — 2FA admin
      { href: "/admin/security/2fa", icon: ShieldCheck, label: "2FA" },
    ],
  },
];

interface Props {
  user: { id: string; name: string; email: string; image: string | null };
  children: React.ReactNode;
}

export function AdminShell({ user, children }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const [open,   setOpen] = useState(false);

  const logout = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex flex-col h-full", mobile ? "w-64" : "w-56")}>
      {/* Logo */}
      <div className="flex items-center h-14 px-5 border-b shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <Link href="/" className="font-poppins font-black text-lg" style={{ color: "#F6861A" }}>
          🐝 BEE
        </Link>
        <span className="ml-2 text-[10px] font-inter px-2 py-0.5 rounded-md font-bold"
          style={{ background: "rgba(246,134,26,0.15)", color: "#F6861A" }}>
          ADMIN
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-[9px] font-bold font-poppins uppercase tracking-wider px-3 mb-1.5"
              style={{ color: "rgba(232,234,240,0.3)" }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, icon: Icon, label, exact }) => (
                <Link key={href} href={href}
                  onClick={() => mobile && setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 h-8 px-3 rounded-xl text-xs font-poppins font-semibold transition-all",
                    isActive(href, exact)
                      ? "text-white"
                      : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  )}
                  style={isActive(href, exact)
                    ? { background: "linear-gradient(135deg,rgba(124,92,252,0.3),rgba(155,127,255,0.2))", border: "1px solid rgba(155,127,255,0.25)" }
                    : {}}>
                  <Icon size={14} className="shrink-0" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-4 border-t shrink-0 pt-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="px-3 py-2 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.04)" }}>
          <p className="text-xs font-poppins font-semibold text-white truncate">{user.name}</p>
          <p className="text-[10px] font-inter truncate" style={{ color: "rgba(232,234,240,0.35)" }}>
            {user.email}
          </p>
        </div>
        <button onClick={logout}
          className="flex items-center gap-3 h-8 px-3 rounded-xl w-full text-xs font-poppins font-semibold transition-all"
          style={{ color: "rgba(248,113,113,0.7)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,113,113,0.1)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <LogOut size={14} /><span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "#0e0e14" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex border-r flex-col shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "#13131a", width: 224 }}>
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r lg:hidden transition-transform duration-200",
        open ? "translate-x-0" : "-translate-x-full"
      )} style={{ borderColor: "rgba(255,255,255,0.08)", background: "#13131a" }}>
        <div className="flex items-center justify-between px-4 h-14 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <span className="font-poppins font-black text-lg" style={{ color: "#F6861A" }}>🐝 BEE</span>
          <button onClick={() => setOpen(false)} className="text-white/40">✕</button>
        </div>
        <Sidebar mobile />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 border-b shrink-0"
          style={{ background: "#13131a", borderColor: "rgba(255,255,255,0.08)" }}>
          <button onClick={() => setOpen(true)} className="lg:hidden text-white/50">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <p className="text-xs font-poppins font-semibold text-white">{user.name}</p>
              <p className="text-[10px] font-inter" style={{ color: "rgba(232,234,240,0.35)" }}>
                Administrateur
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 overflow-auto">
          <div style={{ "--adm-surface":"rgba(255,255,255,0.04)", "--adm-surface2":"rgba(255,255,255,0.06)", "--adm-border":"rgba(255,255,255,0.08)", "--adm-border2":"rgba(255,255,255,0.12)" } as any}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
