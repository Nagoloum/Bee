"use client";

import Link from "next/link";
import { Bell, ExternalLink } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Props {
  user:   { name: string; image?: string | null; email: string };
  vendor: { shopName: string; slug: string } | null;
}

export function VendorTopBar({ user, vendor }: Props) {
  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="font-poppins font-semibold text-sm text-foreground hidden sm:block truncate">
          {vendor?.shopName ?? "Tableau de bord"}
        </h1>
        {vendor && (
          <Link
            href={`/shop/${vendor.slug}`}
            target="_blank"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-inter shrink-0"
          >
            <ExternalLink size={12} />
            <span className="hidden sm:inline">Voir ma boutique</span>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/notifications">
            <Bell size={18} />
          </Link>
        </Button>
        <div className="flex items-center gap-2 ml-1">
          <Avatar src={user.image} name={user.name} size="sm" color="random" />
          <span className="text-sm font-semibold font-poppins text-foreground hidden sm:block">
            {user.name.split(" ")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
