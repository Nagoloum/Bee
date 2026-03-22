"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Store, Package, ShoppingBag,
  CreditCard, Wallet, FileText, LogOut, ChevronLeft, ChevronRight,
  Settings, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { signOut } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href:"/admin",               icon:LayoutDashboard, label:"Dashboard",       exact:true  },
  { href:"/admin/users",         icon:Users,           label:"Utilisateurs"                },
  { href:"/admin/vendors",       icon:Store,           label:"Vendeurs"                    },
  { href:"/admin/products",      icon:Package,         label:"Produits"                    },
  { href:"/admin/orders",        icon:ShoppingBag,     label:"Commandes"                   },
  { href:"/admin/subscriptions", icon:CreditCard,      label:"Abonnements"                 },
  { href:"/admin/wallets",       icon:Wallet,          label:"Portefeuilles"               },
  { href:"/admin/logs",          icon:FileText,        label:"Logs"                        },
];

interface Props { pendingOrders?: number; adminName?: string }

export function AdminSidebar({ pendingOrders = 0, adminName = "Admin" }: Props) {
  const pathname   = usePathname();
  const router     = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <aside className={cn(
      "relative flex flex-col bg-ink-950 border-r border-white/8 transition-all duration-300 shrink-0",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-white/8",
        collapsed && "justify-center px-2"
      )}>
        <div className="w-8 h-8 rounded-xl bg-honey-gradient flex items-center justify-center shadow-honey shrink-0">
          <span className="text-base">🐝</span>
        </div>
        {!collapsed && (
          <div>
            <p className="font-poppins font-black text-white text-sm">BEE Admin</p>
            <p className="text-white/30 text-[10px] font-inter">Super Admin</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-hide">
        {NAV.map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group relative",
                active
                  ? "bg-primary text-white"
                  : "text-white/50 hover:bg-white/8 hover:text-white"
              )}>
              <Icon size={17} className="shrink-0" />
              {!collapsed && (
                <span className="font-poppins font-semibold text-sm truncate flex-1">{label}</span>
              )}
              {!collapsed && label === "Commandes" && pendingOrders > 0 && (
                <span className="w-5 h-5 rounded-full bg-warning text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {pendingOrders > 9 ? "9+" : pendingOrders}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-ink-800 border border-white/10 rounded-lg text-white text-xs font-poppins whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-soft-lg">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-white/8 space-y-2">
          <p className="text-white/30 text-[10px] font-inter truncate">{adminName}</p>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-white/40 hover:text-error text-xs font-inter w-full transition-colors">
            <LogOut size={13} /> Se déconnecter
          </button>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-ink-900 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:bg-primary transition-all shadow-soft z-10">
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
