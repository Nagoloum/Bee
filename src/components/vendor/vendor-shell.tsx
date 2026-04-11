"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, Tag,
  Zap, Wallet, BarChart2, Settings, LogOut,
  ChevronLeft, ChevronRight, Briefcase,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { VendorTopbar } from "@/components/vendor/vendor-topbar";

const NAV = [
  { href: "/vendor",              icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/vendor/products",     icon: Package,         label: "Produits"        },
  { href: "/vendor/orders",       icon: ShoppingBag,     label: "Commandes"       },
  { href: "/vendor/coupons",      icon: Tag,             label: "Coupons"         },
  { href: "/vendor/flash-sales",  icon: Zap,             label: "Flash sales"     },
  { href: "/vendor/wallet",       icon: Wallet,          label: "Wallet"          },
  { href: "/vendor/analytics",    icon: BarChart2,       label: "Statistiques"    },
  // ✅ PATCH — Offres d'emploi
  { href: "/vendor/jobs",         icon: Briefcase,       label: "Offres d'emploi" },
  { href: "/vendor/settings",     icon: Settings,        label: "Paramètres"      },
];

interface Props {
  user: { id: string; name: string; email: string; image: string | null };
  children: React.ReactNode;
}

export function VendorShell({ user, children }: Props) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [open,    setOpen]    = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const logout = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Sidebar desktop ──────────────────────────────────────────────── */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r border-border bg-background transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          {!collapsed && (
            <Link href="/" className="font-poppins font-black text-lg text-primary">
              🐝 BEE
            </Link>
          )}
          <button onClick={() => setCollapsed(c => !c)}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors ml-auto">
            {collapsed
              ? <ChevronRight size={14} className="text-muted-foreground" />
              : <ChevronLeft  size={14} className="text-muted-foreground" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {NAV.map(({ href, icon: Icon, label }) => {
            const isActive = href === "/vendor"
              ? pathname === "/vendor"
              : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center gap-3 h-9 px-3 rounded-xl text-sm font-poppins font-semibold transition-all",
                  isActive
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}>
                <Icon size={16} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-2 pb-4 space-y-1 border-t border-border pt-3">
          {!collapsed && (
            <div className="px-3 py-2 rounded-xl bg-cream-50">
              <p className="text-xs font-poppins font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[10px] font-inter text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <button onClick={logout}
            className="flex items-center gap-3 h-9 px-3 rounded-xl w-full text-sm font-poppins font-semibold text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all">
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border bg-background transition-transform duration-200 lg:hidden",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          <Link href="/" className="font-poppins font-black text-lg text-primary">🐝 BEE</Link>
          <button onClick={() => setOpen(false)} className="text-muted-foreground">✕</button>
        </div>
        <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const isActive = href === "/vendor" ? pathname === "/vendor" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 h-9 px-3 rounded-xl text-sm font-poppins font-semibold transition-all",
                  isActive ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}>
                <Icon size={16} /><span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-2 pb-4 border-t border-border pt-3">
          <button onClick={logout}
            className="flex items-center gap-3 h-9 px-3 rounded-xl w-full text-sm font-poppins font-semibold text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all">
            <LogOut size={16} /><span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <VendorTopbar user={user} onMenuClick={() => setOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
