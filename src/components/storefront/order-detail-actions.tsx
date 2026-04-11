"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { OpenDisputeButton } from "@/components/storefront/open-dispute-button";
import Pusher from "pusher-js";

interface Props {
  orderId:        string;
  orderStatus:    string;
  deliveryAgentId?: string | null; // pour s'abonner au canal Pusher
}

interface AgentPosition {
  lat:       number;
  lng:       number;
  heading?:  number;
  timestamp: number;
}

// ── Mini carte live (Google Maps embed simple) ─────────────────────────────
function LiveTrackingMap({ position }: { position: AgentPosition }) {
  return (
    <div className="mt-4 rounded-2xl overflow-hidden border border-border"
      style={{ height: 220 }}>
      <iframe
        title="Position livreur"
        width="100%"
        height="220"
        loading="lazy"
        className="border-0"
        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&q=${position.lat},${position.lng}&zoom=15`}
      />
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────
export function OrderDetailActions({ orderId, orderStatus, deliveryAgentId }: Props) {
  const [agentPos, setAgentPos] = useState<AgentPosition | null>(null);
  const [liveActive, setLiveActive] = useState(false);

  const isInTransit = orderStatus === "IN_TRANSIT" || orderStatus === "PICKED_UP";

  // Abonnement Pusher si commande en transit
  useEffect(() => {
    if (!isInTransit || !deliveryAgentId) return;
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    const client = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
    });

    const channel = client.subscribe(`delivery-agent-${deliveryAgentId}`);
    channel.bind("location-update", (data: AgentPosition) => {
      setAgentPos(data);
      setLiveActive(true);
    });

    return () => {
      channel.unbind_all();
      client.unsubscribe(`delivery-agent-${deliveryAgentId}`);
      client.disconnect();
    };
  }, [isInTransit, deliveryAgentId]);

  return (
    <div className="space-y-4">
      {/* ── Tracking live ─────────────────────────────────────────────── */}
      {isInTransit && (
        <div className="rounded-2xl p-4 border border-border bg-cream-50">
          <div className="flex items-center gap-2 mb-2">
            <Navigation size={15} className="text-primary" />
            <p className="font-poppins font-bold text-sm text-foreground">
              Suivi en temps réel
            </p>
            {liveActive && (
              <span className="ml-auto flex items-center gap-1.5 text-xs font-inter text-success-dark">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                En direct
              </span>
            )}
          </div>

          {agentPos ? (
            <>
              <p className="text-xs font-inter text-muted-foreground mb-2">
                Votre livreur est en route. Position mise à jour il y a{" "}
                {Math.round((Date.now() - agentPos.timestamp) / 1000)}s.
              </p>
              <LiveTrackingMap position={agentPos} />
            </>
          ) : (
            <div className="flex items-center gap-3 py-3">
              <MapPin size={16} className="text-muted-foreground shrink-0" />
              <p className="text-sm font-inter text-muted-foreground">
                En attente de la position du livreur…
              </p>
              <div className="flex gap-0.5 ml-auto">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Bouton litige ─────────────────────────────────────────────── */}
      <OpenDisputeButton orderId={orderId} orderStatus={orderStatus} />
    </div>
  );
}
