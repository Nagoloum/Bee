"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart, Search, Bell, Menu, X,
  ChevronDown, Store, Truck, User, LogOut,
  Package, Wallet,
} from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { useAuth } from "@/hooks/use-auth";
import { useCartStore } from "@/store/cart.store";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import {ClientNotificationBell} from "@/components/storefront/client-notification-bell";

const navLinks = [
  { href: "/",            label: "Accueil"              },
  { href: "/products",    label: "Catalogue"            },
  { href: "/shops",        label: "Boutiques"            },
  { href: "/flash-sales", label: "⚡ Flash", highlight: true },
];

export function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, isLoading } = useAuth();
  const cartCount = useCartStore((s) => s.getCount());

  const [isScrolled,   setIsScrolled]   = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-user-menu]")) setDropdownOpen(false);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
    setDropdownOpen(false);
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-300",
      isScrolled
        ? "bg-white/95 backdrop-blur-md shadow-soft border-b border-border"
        : "bg-white border-b border-border"
    )}>
      <div className="container-bee">
        <div className="flex items-center h-16 gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-honey-gradient flex items-center justify-center shadow-honey">
              <span className="text-xl">🐝</span>
            </div>
            <span className="font-poppins font-black text-xl text-foreground tracking-tight hidden sm:block">BEE</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={cn(
                "px-3.5 py-2 rounded-xl text-sm font-semibold font-poppins transition-all duration-150",
                link.highlight ? "text-primary hover:bg-primary/10" : "text-foreground-secondary hover:text-foreground hover:bg-muted",
                pathname === link.href && !link.highlight && "bg-muted text-foreground",
                pathname === link.href && link.highlight && "bg-primary/10"
              )}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="flex-1 hidden md:block max-w-sm mx-auto">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="search" placeholder="Rechercher…" className="w-full h-9 pl-9 pr-4 rounded-xl bg-muted border border-transparent text-sm font-inter placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all" />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-0.5 ml-auto">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(!searchOpen)}>
              <Search size={20} />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart" aria-label="Panier">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Auth */}
            {isLoading ? (
              <div className="w-10 h-10 flex items-center justify-center">
                <Spinner size="sm" />
              </div>
            ) : user ? (
              <>

                {user && <ClientNotificationBell userId={user.id} />}

                {/* User dropdown */}
                <div className="relative ml-1" data-user-menu>
                  <button data-user-menu onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors">
                    <Avatar src={user.image} name={user.name} size="sm" color="random" />
                    <span className="hidden sm:block text-sm font-semibold font-poppins text-foreground max-w-[90px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown size={13} className={cn("text-muted-foreground hidden sm:block transition-transform duration-200", dropdownOpen && "rotate-180")} />
                  </button>

                  {dropdownOpen && (
                    <div data-user-menu className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-soft-lg border border-border py-1.5 animate-scale-in z-50">
                      {user.role === "VENDOR" && (
                        <Link href="/vendor" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                          <Store size={15} className="text-primary" /> Ma boutique
                        </Link>
                      )}
                      {user.role === "DELIVERY" && (
                        <Link href="/delivery" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                          <Truck size={15} className="text-primary" /> Mes livraisons
                        </Link>
                      )}
                      {user.role === "ADMIN" && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                          <span className="text-sm">👑</span> Admin Panel
                        </Link>
                      )}
                      <div className="h-px bg-border mx-3 my-1" />
                      <Link href="/account" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <User size={15} className="text-muted-foreground" /> Mon compte
                      </Link>
                      <Link href="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <Package size={15} className="text-muted-foreground" /> Mes commandes
                      </Link>
                      <Link href="/wallet" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <Wallet size={15} className="text-muted-foreground" /> Portefeuille
                      </Link>
                      <div className="h-px bg-border mx-3 my-1" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors">
                        <LogOut size={15} /> Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">Connexion</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/sign-up">S'inscrire</Link>
                </Button>
              </div>
            )}

            <Button variant="ghost" size="icon" className="lg:hidden ml-1" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="md:hidden pb-3 animate-fade-down">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input autoFocus type="search" placeholder="Rechercher…" className="w-full h-10 pl-9 pr-4 rounded-xl bg-muted border-transparent focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 text-sm font-inter outline-none transition-all" />
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-white animate-fade-down">
          <div className="container-bee py-3 flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className={cn("px-4 py-3 rounded-xl text-sm font-semibold font-poppins transition-colors",
                  link.highlight ? "text-primary" : "text-foreground",
                  pathname === link.href ? "bg-muted" : "hover:bg-muted")}>
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <div className="h-px bg-border my-1" />
                <div className="flex items-center gap-3 px-4 py-3">
                  <Avatar src={user.image} name={user.name} size="sm" color="random" />
                  <div>
                    <p className="text-sm font-semibold font-poppins">{user.name}</p>
                    <p className="text-xs text-muted-foreground font-inter">{user.email}</p>
                  </div>
                </div>
                {user.role === "VENDOR"   && <Link href="/vendor"   onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-poppins font-semibold hover:bg-muted"><Store size={15} className="text-primary"/>Ma boutique</Link>}
                {user.role === "DELIVERY" && <Link href="/delivery" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-poppins font-semibold hover:bg-muted"><Truck size={15} className="text-primary"/>Mes livraisons</Link>}
                <Link href="/account" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-poppins hover:bg-muted"><User size={15} className="text-muted-foreground"/>Mon compte</Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-poppins text-error hover:bg-error/5 w-full"><LogOut size={15}/>Se déconnecter</button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 mt-1 border-t border-border">
                <Button variant="outline" fullWidth asChild><Link href="/sign-in" onClick={() => setMobileOpen(false)}>Se connecter</Link></Button>
                <Button fullWidth asChild><Link href="/sign-up" onClick={() => setMobileOpen(false)}>Créer un compte</Link></Button>
              </div>
            )}
            <div className="flex gap-2 pt-2 mt-1 border-t border-border">
              <Button variant="ghost" size="sm" className="flex-1 text-xs" asChild>
                <Link href="/sign-up/vendor" onClick={() => setMobileOpen(false)}><Store size={13}/>Vendre</Link>
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-xs" asChild>
                <Link href="/sign-up/delivery" onClick={() => setMobileOpen(false)}><Truck size={13}/>Livrer</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
