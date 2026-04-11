"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Map, Package, History, Settings,
  LogOut, Menu, X, ChevronRight, Bell
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/delivery",           icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/delivery/map",       icon: Map,             label: "Carte live"      },
  { href: "/delivery/orders",    icon: Package,         label: "Courses"         },
  { href: "/delivery/history",   icon: History,         label: "Historique"      },
  { href: "/delivery/settings",  icon: Settings,        label: "Paramètres"      },
];

interface Props {
  userName:  string;
  userEmail: string;
  userId:    string;
  children:  React.ReactNode;
}

export function DeliveryShell({ userName, userEmail, userId, children }: Props) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [open,    setOpen]    = useState(false);
  const [signing, setSigning] = useState(false);

  const logout = async () => {
    setSigning(true);
    await authClient.signOut();
    router.push("/sign-in");
  };

  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#0f0f13] flex">

      {/* ── Sidebar desktop ───────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r"
        style={{ background:"#16161d", borderColor:"rgba(255,255,255,0.06)" }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b"
          style={{ borderColor:"rgba(255,255,255,0.06)" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
            style={{ background:"linear-gradient(135deg,#22d3a5,#0ea572)" }}>
            🛵
          </div>
          <div>
            <p className="font-poppins font-black text-sm text-white">BEE Livraison</p>
            <p className="text-[10px] font-inter" style={{ color:"rgba(232,234,240,0.4)" }}>Dashboard livreur</p>
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-5 py-4 mx-3 mt-3 rounded-xl"
          style={{ background:"rgba(34,211,165,0.08)", border:"1px solid rgba(34,211,165,0.15)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-poppins font-black text-sm text-white shrink-0"
            style={{ background:"linear-gradient(135deg,#22d3a5,#0ea572)" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-poppins font-semibold text-sm text-white truncate">{userName}</p>
            <p className="text-[10px] font-inter truncate" style={{ color:"rgba(34,211,165,0.7)" }}>En ligne</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/delivery" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold font-inter transition-all",
                  active
                    ? "text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                )}
                style={active ? {
                  background: "linear-gradient(135deg,rgba(34,211,165,0.15),rgba(34,211,165,0.08))",
                  color: "#22d3a5",
                } : {}}>
                <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button onClick={logout} disabled={signing}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold font-inter transition-all text-white/30 hover:text-red-400 hover:bg-red-500/10">
            <LogOut size={16} />
            {signing ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      </aside>

      {/* ── Mobile sidebar overlay ────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col border-r"
            style={{ background:"#16161d", borderColor:"rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor:"rgba(255,255,255,0.06)" }}>
              <p className="font-poppins font-black text-base text-white">🛵 BEE Livraison</p>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== "/delivery" && pathname.startsWith(href));
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold font-inter transition-all",
                      active ? "text-[#22d3a5]" : "text-white/40"
                    )}
                    style={active ? { background:"rgba(34,211,165,0.1)" } : {}}>
                    <Icon size={18} />
                    {label}
                    {active && <ChevronRight size={14} className="ml-auto" />}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 pb-6">
              <button onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 font-inter">
                <LogOut size={16} /> Se déconnecter
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 h-14 shrink-0 border-b"
          style={{ background:"#16161d", borderColor:"rgba(255,255,255,0.06)" }}>
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <p className="font-poppins font-bold text-sm text-white flex-1 lg:hidden">BEE Livraison</p>
          <div className="hidden lg:block flex-1">
            <p className="font-poppins font-bold text-sm text-white">
              {NAV.find(n => n.href === pathname || (n.href !== "/delivery" && pathname.startsWith(n.href)))?.label ?? "Dashboard"}
            </p>
          </div>
          <button className="relative w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:"rgba(255,255,255,0.06)" }}>
            <Bell size={15} className="text-white/60" />
          </button>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden border-t z-40"
        style={{ background:"#16161d", borderColor:"rgba(255,255,255,0.06)" }}>
        <div className="flex">
          {NAV.slice(0, 4).map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/delivery" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
                style={{ color: active ? "#22d3a5" : "rgba(232,234,240,0.35)" }}>
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[9px] font-bold font-poppins">{label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
