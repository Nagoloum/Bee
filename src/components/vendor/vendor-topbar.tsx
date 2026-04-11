"use client";

import { Bell, Menu } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { VendorNotificationBell } from "@/components/vendor/vendor-notification-bell";
import { useRouter } from "next/navigation";

interface Props {
  user: {
    id:    string;
    name:  string;
    email: string;
    image: string | null;
  };
  onMenuClick?: () => void;
}

export function VendorTopbar({ user, onMenuClick }: Props) {
  return (
    <header className="sticky top-0 z-30 w-full h-14 flex items-center justify-between px-4 border-b border-border bg-background/95 backdrop-blur-sm">

      {/* Menu burger mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
        <Menu size={18} className="text-foreground" />
      </button>

      {/* Logo / titre — desktop */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="font-poppins font-black text-lg text-primary">🐝 BEE</span>
        <span className="text-xs font-inter text-muted-foreground">Espace Vendeur</span>
      </div>

      <div className="flex items-center gap-2">
        {/* ✅ PATCH — userId corrigé : user.id au lieu de userId */}
        <VendorNotificationBell userId={user.id} />

        <div className="flex items-center gap-2 ml-1">
          <Avatar src={user.image} name={user.name} size="sm" color="random" />
          <span className="text-sm font-semibold font-poppins text-foreground hidden sm:block">
            {user.name}
          </span>
        </div>
      </div>
    </header>
  );
}
