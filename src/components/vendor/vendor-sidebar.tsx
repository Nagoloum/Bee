"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3,
  Wallet, Tag, Zap, Store, CreditCard, Users, Settings,
  ChevronLeft, ChevronRight, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import { signOut } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/vendor",              icon: LayoutDashboard, label: "Dashboard",     exact: true  },
  { href: "/vendor/products",     icon: Package,         label: "Produits"                    },
  { href: "/vendor/orders",       icon: ShoppingBag,     label: "Commandes",    badge: "pending" },
  { href: "/vendor/wallet",       icon: Wallet,          label: "Portefeuille"                },
  { href: "/vendor/coupons",      icon: Tag,             label: "Coupons"                     },
  { href: "/vendor/flash-sales",  icon: Zap,             label: "Flash Sales"                 },
  { href: "/vendor/subscription", icon: CreditCard,      label: "Abonnement"                  },
  { href: "/vendor/settings",     icon: Settings,        label: "Paramètres"                  },
];

interface Props {
  vendor: { shopName: string; logo?: string | null; region: string; isVerified: boolean } | null;
  pendingOrders?: number;
}

export function VendorSidebar({ vendor, pendingOrders = 0 }: Props) {
  const pathname   = usePathname();
  const router      = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className={cn(
      "relative flex flex-col bg-secondary border-r border-white/10 transition-all duration-300 shrink-0",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-white/10",
        collapsed && "justify-center px-2"
      )}>
        <div className="w-8 h-8 rounded-xl bg-honey-gradient flex items-center justify-center shadow-honey shrink-0">
          <span className="text-lg">🐝</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-poppins font-black text-white text-sm truncate">
              {vendor?.shopName ?? "Ma Boutique"}
            </p>
            <p className="text-white/40 text-[10px] font-inter truncate">Tableau de bord</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map(({ href, icon: Icon, label, exact, badge }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative",
                active
                  ? "bg-primary text-white shadow-honey"
                  : "text-white/50 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && (
                <span className="font-poppins font-semibold text-sm truncate flex-1">{label}</span>
              )}
              {!collapsed && badge === "pending" && pendingOrders > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {pendingOrders > 9 ? "9+" : pendingOrders}
                </span>
              )}
              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-secondary border border-white/10 rounded-lg text-white text-xs font-poppins font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-soft-lg">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Vendor info */}
      {!collapsed && vendor && (
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <Avatar name={vendor.shopName} size="sm" color="random" ring />
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold font-poppins truncate">{vendor.shopName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {vendor.isVerified
                  ? <span className="text-[10px] text-blue-300 font-inter">✓ Vérifié</span>
                  : <span className="text-[10px] text-white/30 font-inter">Non vérifié</span>
                }
              </div>
            </div>
            <Link href="/" className="text-white/30 hover:text-white transition-colors shrink-0" title="Voir la boutique">
              <Store size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-2 pb-3">
        <button
          onClick={handleLogout}
          title={collapsed ? "Se déconnecter" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:bg-error/20 hover:text-error transition-all duration-150 group relative"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && (
            <span className="font-poppins font-semibold text-sm">Se déconnecter</span>
          )}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-secondary border border-white/10 rounded-lg text-white text-xs font-poppins font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-soft-lg">
              Se déconnecter
            </div>
          )}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-secondary border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:bg-primary transition-all shadow-soft z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
