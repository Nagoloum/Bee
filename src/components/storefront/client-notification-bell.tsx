"use client";

import { useEffect, useState } from "react";
import { Bell, Package, X } from "lucide-react";
import Link from "next/link";
import Pusher from "pusher-js";
import { cn } from "@/lib/utils/cn";

interface Notif {
  id:          string;
  type:        "order-status" | "new-order" | "badge-awarded";
  title:       string;
  message:     string;
  href?:       string;
  createdAt:   number;
  read:        boolean;
}

const STATUS_FR: Record<string, string> = {
  CONFIRMED:  "Votre commande a été confirmée",
  PREPARING:  "Votre commande est en préparation",
  READY:      "Votre commande est prête",
  PICKED_UP:  "Le livreur a récupéré votre colis",
  IN_TRANSIT: "Votre commande est en route",
  DELIVERED:  "Votre commande a été livrée",
  CANCELLED:  "Votre commande a été annulée",
};

interface Props {
  userId: string;
}

/**
 * Cloche de notifications temps réel pour le client.
 * À placer dans le Navbar — remplace l'icône Bell statique.
 *
 * Usage dans src/components/storefront/navbar.tsx :
 *   import { ClientNotificationBell } from "@/components/storefront/client-notification-bell";
 *   <ClientNotificationBell userId={session.user.id} />
 */
export function ClientNotificationBell({ userId }: Props) {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open,   setOpen]   = useState(false);

  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    const client  = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
    });
    const channel = client.subscribe(`user-${userId}`);

    // Changement statut commande
    channel.bind("order-status", (data: any) => {
      const msg = STATUS_FR[data.status] ?? `Statut mis à jour : ${data.status}`;
      push({
        type:    "order-status",
        title:   `Commande ${data.orderNumber}`,
        message: msg,
        href:    `/orders/${data.orderId}`,
      });
    });

    // Badge obtenu
    channel.bind("badge-awarded", (data: any) => {
      push({
        type:    "badge-awarded",
        title:   "Nouveau badge débloqué ! 🎖️",
        message: `Vous avez obtenu le badge ${data.badgeLabel ?? data.type}`,
        href:    "/account/profile",
      });
    });

    return () => {
      channel.unbind_all();
      client.unsubscribe(`user-${userId}`);
      client.disconnect();
    };
  }, [userId]);

  function push(n: Omit<Notif, "id" | "createdAt" | "read">) {
    const notif: Notif = {
      ...n,
      id:        crypto.randomUUID(),
      createdAt: Date.now(),
      read:      false,
    };
    setNotifs(prev => [notif, ...prev].slice(0, 30));
    // Vibration mobile
    if ("vibrate" in navigator) navigator.vibrate([80]);
  }

  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const removeAll   = () => { setNotifs([]); setOpen(false); };

  const timeAgo = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60)   return "À l'instant";
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400)return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}j`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(o => !o); if (!open) markAllRead(); }}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center border border-border hover:bg-muted transition-colors">
        <Bell size={16} className="text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center font-poppins">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 w-80 z-40 rounded-2xl shadow-xl overflow-hidden bg-white border border-border">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="font-poppins font-bold text-sm text-foreground">
                Notifications
              </p>
              <div className="flex items-center gap-2">
                {notifs.length > 0 && (
                  <button onClick={removeAll}
                    className="text-[10px] font-inter text-muted-foreground hover:text-foreground">
                    Tout effacer
                  </button>
                )}
              </div>
            </div>

            {/* Liste */}
            <div className="max-h-80 overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <Bell size={24} className="text-muted-foreground/20 mx-auto" />
                  <p className="text-xs font-inter text-muted-foreground">
                    Aucune notification
                  </p>
                  <p className="text-[10px] font-inter text-muted-foreground/60">
                    Vous serez notifié des mises à jour de vos commandes ici
                  </p>
                </div>
              ) : (
                notifs.map(n => {
                  const inner = (
                    <div className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b border-border transition-colors hover:bg-cream-50",
                      !n.read && "bg-honey-50/50"
                    )}>
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        n.type === "order-status" ? "bg-primary/10" : "bg-honey-50"
                      )}>
                        {n.type === "order-status"
                          ? <Package size={14} className="text-primary" />
                          : <span className="text-sm">🎖️</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-poppins font-semibold text-xs text-foreground">
                          {n.title}
                        </p>
                        <p className="text-[11px] font-inter text-muted-foreground mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] font-inter text-muted-foreground/60 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>
                  );

                  return n.href ? (
                    <Link key={n.id} href={n.href} onClick={() => setOpen(false)}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={n.id}>{inner}</div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
