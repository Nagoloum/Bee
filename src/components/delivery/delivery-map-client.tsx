"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Loader2, Navigation, MapPin, Phone,
  Package, Clock, Zap, X, ChevronUp,
} from "lucide-react";
import { BEE_MAP_STYLE } from "@/lib/maps/bee-map-style";
import { formatPrice } from "@/lib/utils/cn";
import Pusher from "pusher-js";

declare global {
  interface Window {
    google: any;
    initBeeMap: () => void;
  }
}

interface OrderPin {
  orderId:      string;
  orderNumber:  string;
  type:         "pickup" | "delivery";
  lat:          number;
  lng:          number;
  label:        string;
  address:      string;
  clientPhone?: string | null;
  deliveryCode?:string | null;
  status?:      string;
  fee?:         number;
}

interface Props {
  orders:          OrderPin[];
  agentId:         string;
  activeOrderId?:  string | null; // commande en cours = tracking activé auto
}

const CAMEROON = { lat: 3.848, lng: 11.502 };

// ── Icônes SVG encodées pour les marqueurs ────────────────────────────────
function makeIcon(color: string, emoji: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 48 56">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="${color}" flood-opacity="0.4"/>
        </filter>
      </defs>
      <path d="M24 2C13.5 2 5 10.5 5 21c0 14 19 33 19 33s19-19 19-33C43 10.5 34.5 2 24 2z"
        fill="${color}" filter="url(#shadow)"/>
      <circle cx="24" cy="21" r="11" fill="rgba(0,0,0,0.3)"/>
      <text x="24" y="26" text-anchor="middle" font-size="14">${emoji}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function makeAgentIcon(heading: number = 0) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Pulse ring -->
      <circle cx="24" cy="24" r="22" fill="rgba(34,211,165,0.15)" stroke="rgba(34,211,165,0.4)" stroke-width="1.5"/>
      <!-- Direction arrow -->
      <g transform="rotate(${heading}, 24, 24)" filter="url(#glow)">
        <circle cx="24" cy="24" r="12" fill="#22d3a5"/>
        <polygon points="24,10 20,22 24,20 28,22" fill="white"/>
      </g>
      <!-- Center dot -->
      <circle cx="24" cy="24" r="4" fill="white"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function DeliveryMapClient({ orders, agentId, activeOrderId }: Props) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInst     = useRef<any>(null);
  const markersRef  = useRef<any[]>([]);
  const agentMarker = useRef<any>(null);
  const polyline    = useRef<any>(null);
  const watchId     = useRef<number | null>(null);
  const pusherRef   = useRef<any>(null);

  const [loaded,    setLoaded]    = useState(false);
  const [tracking,  setTracking]  = useState(false);
  const [myPos,     setMyPos]     = useState<{ lat: number; lng: number } | null>(null);
  const [heading,   setHeading]   = useState(0);
  const [selected,  setSelected]  = useState<OrderPin | null>(null);
  const [speed,     setSpeed]     = useState<number | null>(null);
  const [distance,  setDistance]  = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // ── Load Google Maps ────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.google?.maps) { setLoaded(true); return; }

    window.initBeeMap = () => setLoaded(true);
    const s   = document.createElement("script");
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
    s.src     = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initBeeMap`;
    s.async   = true;
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch {} };
  }, []);

  // ── Init map ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded || !mapRef.current || mapInst.current) return;

    mapInst.current = new window.google.maps.Map(mapRef.current, {
      center:            CAMEROON,
      zoom:              14,
      styles:            BEE_MAP_STYLE,
      disableDefaultUI:  true,
      zoomControl:       false,
      gestureHandling:   "greedy",
      // Cacher les POI et labels inutiles
      clickableIcons:    false,
    });

    // Custom controls vides pour garder le copyright Google
    mapInst.current.controls[window.google.maps.ControlPosition.BOTTOM_LEFT].push(
      document.createElement("div")
    );

    plotMarkers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // ── Plot order markers ──────────────────────────────────────────────────
  const plotMarkers = useCallback(() => {
    if (!mapInst.current || !window.google) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    orders.forEach(order => {
      const isPickup = order.type === "pickup";
      const icon = {
        url:        makeIcon(isPickup ? "#22d3a5" : "#f97316", isPickup ? "🏪" : "📦"),
        scaledSize: new window.google.maps.Size(40, 48),
        anchor:     new window.google.maps.Point(20, 48),
      };

      const marker = new window.google.maps.Marker({
        position: { lat: order.lat, lng: order.lng },
        map:      mapInst.current,
        icon,
        title:    order.label,
        zIndex:   10,
      });

      marker.addListener("click", () => {
        setSelected(order);
        setPanelOpen(true);
        mapInst.current.panTo({ lat: order.lat, lng: order.lng });
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: order.lat, lng: order.lng });
      hasPoints = true;
    });

    if (hasPoints) {
      mapInst.current.fitBounds(bounds, { padding: 80 });
    }
  }, [orders]);

  useEffect(() => { if (loaded) plotMarkers(); }, [loaded, plotMarkers]);

  // ── GPS tracking ────────────────────────────────────────────────────────
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    setTracking(true);

    const pathCoords: any[] = [];

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, speed: spd, heading: hdg } = pos.coords;
        const coords = { lat, lng };
        setMyPos(coords);
        if (spd !== null) setSpeed(Math.round(spd * 3.6)); // m/s → km/h
        if (hdg !== null) setHeading(hdg);

        // Update agent marker
        if (mapInst.current && window.google) {
          const icon = {
            url:        makeAgentIcon(hdg ?? 0),
            scaledSize: new window.google.maps.Size(48, 48),
            anchor:     new window.google.maps.Point(24, 24),
          };

          if (!agentMarker.current) {
            agentMarker.current = new window.google.maps.Marker({
              position: coords,
              map:      mapInst.current,
              icon,
              zIndex:   100,
              title:    "Ma position",
            });
          } else {
            agentMarker.current.setPosition(coords);
            agentMarker.current.setIcon(icon);
          }

          // Draw path
          pathCoords.push(coords);
          if (polyline.current) {
            polyline.current.setPath(pathCoords);
          } else {
            polyline.current = new window.google.maps.Polyline({
              path:          pathCoords,
              geodesic:      true,
              strokeColor:   "#9b7fff",
              strokeOpacity: 0.8,
              strokeWeight:  4,
              map:           mapInst.current,
              icons: [{
                icon:   { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3, fillColor: "#9b7fff", fillOpacity: 1 },
                offset: "100%",
                repeat: "80px",
              }],
            });
          }

          mapInst.current.panTo(coords);
        }

        // Broadcast to Pusher
        fetch("/api/delivery/location", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ lat, lng, heading: hdg, agentId }),
        }).catch(() => {});
      },
      (err) => { console.error("GPS:", err); setTracking(false); },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 8000 }
    );
  }, [agentId]);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setTracking(false);
    setSpeed(null);
  }, []);

  // Auto-start tracking if active order
  useEffect(() => {
    if (activeOrderId && loaded) startTracking();
    return () => stopTracking();
  }, [activeOrderId, loaded, startTracking, stopTracking]);

  // ── Pusher: receive other agent positions (optionnel pour admin) ─────────
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;
    const client = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
    });
    pusherRef.current = client;
    return () => { client.disconnect(); };
  }, []);

  const centerOnMe = () => {
    if (myPos && mapInst.current) {
      mapInst.current.panTo(myPos);
      mapInst.current.setZoom(16);
    }
  };

  const zoomIn  = () => mapInst.current?.setZoom((mapInst.current.getZoom() ?? 14) + 1);
  const zoomOut = () => mapInst.current?.setZoom((mapInst.current.getZoom() ?? 14) - 1);

  return (
    <div className="flex flex-col gap-0 h-[calc(100vh-3.5rem-4rem)] lg:h-[calc(100vh-3.5rem)] relative overflow-hidden rounded-2xl"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}>

      {/* ── Loading overlay ─────────────────────────────────────────────── */}
      {!loaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
          style={{ background: "#0f0f13" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: "linear-gradient(135deg,#22d3a5,#0ea572)" }}>
            🗺️
          </div>
          <Loader2 size={20} className="animate-spin text-[#22d3a5]" />
          <p className="text-xs font-poppins text-white/40">Chargement de la carte…</p>
        </div>
      )}

      {/* ── Map container ───────────────────────────────────────────────── */}
      <div ref={mapRef} className="flex-1 w-full" />

      {/* ── Top HUD ─────────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-start gap-3 pointer-events-none">

        {/* Legend */}
        <div className="flex items-center gap-2 p-2.5 rounded-2xl pointer-events-auto"
          style={{ background: "rgba(15,15,19,0.90)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="flex items-center gap-1.5 text-[10px] font-bold font-poppins text-[#22d3a5]">
            <span className="text-sm">🏪</span> {orders.filter(o => o.type === "pickup").length}
          </span>
          <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.1)" }} />
          <span className="flex items-center gap-1.5 text-[10px] font-bold font-poppins text-[#f97316]">
            <span className="text-sm">📦</span> {orders.filter(o => o.type === "delivery").length}
          </span>
        </div>

        {/* Speed indicator (visible si tracking) */}
        {tracking && speed !== null && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl pointer-events-auto"
            style={{ background: "rgba(15,15,19,0.90)", backdropFilter: "blur(12px)", border: "1px solid rgba(34,211,165,0.3)" }}>
            <Zap size={12} className="text-[#22d3a5]" />
            <span className="font-poppins font-black text-sm text-white">{speed}</span>
            <span className="text-[10px] font-inter" style={{ color: "rgba(232,234,240,0.4)" }}>km/h</span>
          </div>
        )}

        {/* Tracking indicator */}
        {tracking && (
          <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-2xl pointer-events-auto"
            style={{ background: "rgba(34,211,165,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(34,211,165,0.3)" }}>
            <div className="w-2 h-2 rounded-full bg-[#22d3a5] animate-pulse" />
            <span className="text-[10px] font-bold font-poppins text-[#22d3a5]">GPS LIVE</span>
          </div>
        )}
      </div>

      {/* ── Right controls ───────────────────────────────────────────────── */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
        {/* Zoom + */}
        <button onClick={zoomIn}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg transition-all active:scale-95"
          style={{ background: "rgba(15,15,19,0.90)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}>
          +
        </button>
        {/* Zoom - */}
        <button onClick={zoomOut}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg transition-all active:scale-95"
          style={{ background: "rgba(15,15,19,0.90)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}>
          −
        </button>
        {/* Center on me */}
        <button onClick={centerOnMe} disabled={!myPos}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
          style={{
            background: myPos ? "rgba(155,127,255,0.2)" : "rgba(15,15,19,0.90)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${myPos ? "rgba(155,127,255,0.4)" : "rgba(255,255,255,0.1)"}`,
          }}>
          <Navigation size={16} className={myPos ? "text-[#9b7fff]" : "text-white/30"} />
        </button>
      </div>

      {/* ── Bottom: tracking button + order panel ────────────────────────── */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-3">

        {/* Tracking toggle */}
        <div className="flex justify-center">
          <button
            onClick={tracking ? stopTracking : startTracking}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold font-poppins text-sm transition-all active:scale-95 shadow-xl"
            style={tracking ? {
              background: "rgba(248,113,113,0.15)",
              border:     "1px solid rgba(248,113,113,0.35)",
              color:      "#f87171",
              backdropFilter: "blur(12px)",
            } : {
              background: "linear-gradient(135deg,#22d3a5,#0ea572)",
              color:      "white",
              boxShadow:  "0 0 24px rgba(34,211,165,0.4)",
            }}>
            <div className={`w-2.5 h-2.5 rounded-full ${tracking ? "bg-[#f87171] animate-pulse" : "bg-white/70"}`} />
            {tracking ? "Arrêter le suivi GPS" : "▶ Démarrer le suivi GPS"}
          </button>
        </div>

        {/* Selected order panel (bottom sheet) */}
        {selected && panelOpen && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(15,15,19,0.95)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.1)" }}>

            {/* Handle */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selected.type === "pickup" ? "🏪" : "📦"}</span>
                <div>
                  <p className="font-poppins font-bold text-sm text-white">{selected.label}</p>
                  <p className="text-[10px] font-poppins font-bold uppercase tracking-wider"
                    style={{ color: selected.type === "pickup" ? "#22d3a5" : "#f97316" }}>
                    {selected.type === "pickup" ? "Point de récupération" : "Point de livraison"}
                  </p>
                </div>
              </div>
              <button onClick={() => setPanelOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                <X size={13} className="text-white/50" />
              </button>
            </div>

            <div className="px-4 pb-4 space-y-3">
              {/* Address */}
              <div className="flex items-start gap-2 p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <MapPin size={13} className="text-white/30 mt-0.5 shrink-0" />
                <p className="text-xs font-inter text-white/70">{selected.address || "Adresse non renseignée"}</p>
              </div>

              {/* Code livraison */}
              {selected.deliveryCode && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <div className="flex items-center gap-2">
                    <Package size={12} className="text-[#fbbf24]" />
                    <span className="text-[10px] font-poppins font-bold text-[#fbbf24] uppercase tracking-wider">Code livraison</span>
                  </div>
                  <span className="font-mono font-black text-sm text-[#fbbf24] tracking-widest">
                    {selected.deliveryCode}
                  </span>
                </div>
              )}

              {/* Phone */}
              {selected.clientPhone && (
                <a href={`tel:${selected.clientPhone}`}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl font-bold font-poppins text-xs text-[#22d3a5]"
                  style={{ background: "rgba(34,211,165,0.08)", border: "1px solid rgba(34,211,165,0.2)" }}>
                  <Phone size={13} /> Appeler — {selected.clientPhone}
                </a>
              )}

              {/* Navigate */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-10 rounded-xl font-bold font-poppins text-sm text-white"
                style={{ background: "linear-gradient(135deg,#9b7fff,#7c5cfc)" }}>
                <Navigation size={14} /> Ouvrir dans Google Maps
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
