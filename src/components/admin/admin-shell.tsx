"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Store, Package, ShoppingBag,
  CreditCard, Wallet, FileText, Settings, Shield,
  Image, Briefcase, MessageSquare,
  ChevronLeft, ChevronRight, Search, Bell, LogOut,
  Menu, X, ArrowDownCircle, Layers,
} from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";

const NAV_GROUPS = [
  {
    label: "PRINCIPAL",
    items: [
      { href: "/admin",               icon: LayoutDashboard, label: "Dashboard",       exact: true  },
      { href: "/admin/orders",        icon: ShoppingBag,     label: "Commandes",       badge: "pending" },
    ],
  },
  {
    label: "UTILISATEURS",
    items: [
      { href: "/admin/users",   icon: Users,  label: "Utilisateurs" },
      { href: "/admin/vendors", icon: Store,  label: "Boutiques"    },
    ],
  },
  {
    label: "CATALOGUE",
    items: [
      { href: "/admin/products",             icon: Package, label: "Produits"    },
      { href: "/admin/catalog/categories",   icon: Layers,  label: "Catégories"  },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { href: "/admin/wallets",              icon: Wallet,         label: "Portefeuilles" },
      { href: "/admin/finance/withdrawals",  icon: ArrowDownCircle,label: "Retraits"      },
      { href: "/admin/subscriptions",        icon: CreditCard,     label: "Abonnements"   },
    ],
  },
  {
    label: "CMS",
    items: [
      { href: "/admin/cms/banners",  icon: Image,        label: "Bannières"         },
      { href: "/admin/cms/careers",  icon: Briefcase,    label: "Carrières"         },
      { href: "/admin/cms/contact",  icon: MessageSquare,label: "Contact & Socials"  },
    ],
  },
  {
    label: "SYSTÈME",
    items: [
      { href: "/admin/security", icon: Shield,   label: "Sécurité & Logs" },
      { href: "/admin/settings", icon: Settings, label: "Paramètres"      },
    ],
  },
];

interface ShellProps {
  user:          { name: string; email: string; image?: string | null };
  pendingOrders: number;
  children:      React.ReactNode;
}

// ─── Inner shell — all hooks live here ───────────────────────────────────────

export function AdminShell({ user, pendingOrders, children }: ShellProps) {
  const pathname     = usePathname();
  const router       = useRouter();
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search,     setSearch]     = useState("");
  const [searching,  setSearching]  = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);

  const initials = user.name.slice(0, 2).toUpperCase();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    await signOut();
    router.push("/sign-in");
  };

  /* ── Sidebar nav (shared desktop + mobile) ── */
  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5",
        (!collapsed || mobile) ? "" : "justify-center px-2"
      )} style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "#7c5cfc", boxShadow: "0 0 12px rgba(124,92,252,0.5)" }}>
          <span className="text-sm font-black text-white font-poppins">B</span>
        </div>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2">
            <span className="font-poppins font-black text-lg text-white tracking-tight">BEE</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md font-poppins tracking-wider"
              style={{ background: "rgba(124,92,252,0.2)", color: "#9b7fff" }}>
              ADMIN
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-2">
            {(!collapsed || mobile) && (
              <p className="px-4 py-1.5 text-[10px] font-bold tracking-[0.15em] font-poppins"
                style={{ color: "rgba(232,234,240,0.25)" }}>
                {group.label}
              </p>
            )}
            {collapsed && !mobile && (
              <div className="my-2 mx-3 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            )}
            {group.items.map(({ href, icon: Icon, label, exact, badge }) => {
              const active = isActive(href, exact);
              return (
                <Link key={href} href={href}
                  title={collapsed && !mobile ? label : undefined}
                  className={cn(
                    "relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl transition-colors duration-150 group",
                    (collapsed && !mobile) && "justify-center px-2"
                  )}
                  style={{
                    background: active ? "rgba(124,92,252,0.15)" : "transparent",
                    color:      active ? "#9b7fff" : "rgba(232,234,240,0.45)",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                      style={{ background: "#7c5cfc" }} />
                  )}
                  <Icon size={17} className="shrink-0" />
                  {(!collapsed || mobile) && (
                    <>
                      <span className="font-poppins font-semibold text-sm flex-1 truncate">{label}</span>
                      {badge === "pending" && pendingOrders > 0 && (
                        <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                          style={{ background: "#7c5cfc" }}>
                          {pendingOrders > 9 ? "9+" : pendingOrders}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && !mobile && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-white text-xs font-poppins font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl"
                      style={{ background: "#1a1d2c", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl"
            style={{ background: "rgba(34,211,165,0.1)", border: "1px solid rgba(34,211,165,0.2)" }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#22d3a5" }} />
            <span className="text-[11px] font-bold font-poppins" style={{ color: "#22d3a5" }}>
              2FA Activé
            </span>
          </div>
        )}
        <button onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
            (collapsed && !mobile) && "justify-center"
          )}
          style={{ color: "rgba(232,234,240,0.4)" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(232,234,240,0.4)"; e.currentTarget.style.background = "transparent"; }}>
          <LogOut size={16} className="shrink-0" />
          {(!collapsed || mobile) && (
            <span className="font-poppins font-semibold text-sm">Sign Out</span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0b0d14" }}>

      {/* Desktop sidebar */}
      <aside className="relative hidden lg:flex flex-col shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? 64 : 256,
          background: "#13151f",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}>
        <NavContent />
        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-lg z-10"
          style={{ background: "#1a1d2c", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(232,234,240,0.4)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#7c5cfc"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#1a1d2c"; e.currentTarget.style.color = "rgba(232,234,240,0.4)"; }}>
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-64 z-50 lg:hidden flex flex-col"
            style={{ background: "#13151f", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
            <NavContent mobile />
          </aside>
        </>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 shrink-0"
          style={{ background: "#13151f", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>

          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMobileOpen(true)}
              style={{ color: "rgba(232,234,240,0.5)" }}>
              <Menu size={20} />
            </button>

            {/* Search */}
            <div className="hidden sm:flex items-center">
              {searching ? (
                <div className="flex items-center gap-2 h-9 w-64 px-3 rounded-xl"
                  style={{ background: "#1a1d2c", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <Search size={14} style={{ color: "rgba(232,234,240,0.4)" }} />
                  <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search products, orders..."
                    className="flex-1 bg-transparent text-sm font-inter text-white placeholder:text-white/20 focus:outline-none" />
                  <button onClick={() => { setSearching(false); setSearch(""); }}>
                    <X size={13} style={{ color: "rgba(232,234,240,0.4)" }} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setSearching(true)}
                  className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-inter transition-colors"
                  style={{ background: "#1a1d2c", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(232,234,240,0.4)" }}>
                  <Search size={14} />
                  Search products, orders...
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 2FA badge */}
            <div className="hidden sm:flex items-center gap-1.5 h-7 px-2.5 rounded-lg"
              style={{ background: "rgba(34,211,165,0.1)", border: "1px solid rgba(34,211,165,0.2)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22d3a5" }} />
              <span className="text-[10px] font-bold font-poppins" style={{ color: "#22d3a5" }}>2FA</span>
            </div>

            {/* Bell */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: "#1a1d2c", color: "rgba(232,234,240,0.5)" }}>
                <Bell size={17} />
                {pendingOrders > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                    style={{ background: "#7c5cfc" }}>
                    {pendingOrders > 9 ? "9+" : pendingOrders}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 w-64 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  style={{ background: "#1a1d2c", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="font-poppins font-bold text-sm text-white">Notifications</p>
                  </div>
                  <div className="px-4 py-5 text-sm text-center font-inter"
                    style={{ color: "rgba(232,234,240,0.5)" }}>
                    {pendingOrders > 0
                      ? <span style={{ color: "#fbbf24" }}>⚡ {pendingOrders} commande{pendingOrders > 1 ? "s" : ""} en attente</span>
                      : "Aucune notification"}
                  </div>
                </div>
              )}
            </div>

            {/* User avatar */}
            <div className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-xl"
              style={{ background: "#1a1d2c", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white font-poppins"
                style={{ background: "#7c5cfc" }}>
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white font-poppins leading-none">
                  {user.email.split("@")[0]}
                </p>
                <p className="text-[10px] font-poppins leading-none mt-0.5" style={{ color: "#9b7fff" }}>
                  ADMIN
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="h-9 flex items-center justify-between px-6 shrink-0 text-[10px] font-inter"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: "rgba(232,234,240,0.2)" }}>
          <span>Back-office v2.0.0</span>
          <span>© 2026 BEE — Admin Panel</span>
          <div className="hidden sm:flex gap-4">
            <span>Contact IT</span>
            <span>Legal Notice</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
