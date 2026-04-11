"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Pusher from "pusher-js";
import { cn } from "@/lib/utils/cn";

interface Notification {
  id:        string;
  type:      string;
  title:     string;
  message:   string;
  createdAt: number;
  read:      boolean;
}

interface Props {
  userId: string;
}

/**
 * Cloche de notification temps réel (Pusher).
 * À placer dans le topbar du dashboard vendeur.
 *
 * Usage dans src/components/vendor/vendor-shell.tsx :
 *   import { VendorNotificationBell } from "@/components/vendor/vendor-notification-bell";
 *   // Dans le topbar :
 *   <VendorNotificationBell userId={userId} />
 */
export function VendorNotificationBell({ userId }: Props) {
  const [notifs,  setNotifs]  = useState<Notification[]>([]);
  const [open,    setOpen]    = useState(false);

  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    const client  = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
    });
    const channel = client.subscribe(`user-${userId}`);

    channel.bind("new-order", (data: any) => {
      const notif: Notification = {
        id:        Math.random().toString(36).slice(2),
        type:      "new-order",
        title:     "Nouvelle commande !",
        message:   `${data.orderNumber} — ${data.total} FCFA`,
        createdAt: Date.now(),
        read:      false,
      };
      setNotifs(prev => [notif, ...prev].slice(0, 20));
      // Vibration mobile si disponible
      if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
    });

    channel.bind("withdrawal-update", (data: any) => {
      setNotifs(prev => [{
        id:        Math.random().toString(36).slice(2),
        type:      "withdrawal",
        title:     "Retrait mis à jour",
        message:   `Votre retrait est ${data.status === "PROCESSED" ? "traité" : "en cours"}`,
        createdAt: Date.now(),
        read:      false,
      }, ...prev].slice(0, 20));
    });

    return () => {
      channel.unbind_all();
      client.unsubscribe(`user-${userId}`);
      client.disconnect();
    };
  }, [userId]);

  const markAllRead = () => {
    setNotifs(p => p.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <Bell size={15} className="text-white/60" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 top-11 w-80 rounded-2xl z-40 overflow-hidden shadow-xl"
            style={{ background: "#16161d", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="font-poppins font-bold text-sm text-white">Notifications</p>
              {unread > 0 && (
                <button onClick={markAllRead}
                  className="text-[10px] font-inter text-[#22d3a5] hover:underline">
                  Tout marquer lu
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell size={24} className="text-white/15 mx-auto mb-2" />
                  <p className="text-xs font-inter text-white/30">Aucune notification</p>
                </div>
              ) : (
                notifs.map(n => (
                  <div key={n.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b transition-colors",
                      !n.read ? "bg-white/3" : ""
                    )}
                    style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 shrink-0",
                      !n.read ? "bg-[#22d3a5]" : "bg-transparent"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="font-poppins font-semibold text-xs text-white">{n.title}</p>
                      <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.5)" }}>
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
