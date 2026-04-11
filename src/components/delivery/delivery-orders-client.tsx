"use client";

import { useState } from "react";
import { Package, MapPin, Phone, Copy, Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils/cn";
import { DeliveryProofUpload } from "@/components/delivery/delivery-proof-upload";

interface DeliveryOrder {
  deliveryId: string | null; orderId: string; orderNumber: string;
  orderTotal: number; status: string; deliveryStatus: string | null;
  deliveryCode: string | null; fee: number; assignedAt: string | null;
  vendorName: string | null; vendorAddress: string | null; vendorPhone: string | null;
  clientName: string | null; clientPhone: string | null;
  deliveryAddress: any; items: Array<{ name: string; quantity: number; unitPrice: number }>;
}
const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  READY:      { label:"Disponible", color:"text-[#22d3a5] bg-[#22d3a5]/12" },
  ASSIGNED:   { label:"Assignée",   color:"text-[#9b7fff] bg-[#9b7fff]/12" },
  PICKED_UP:  { label:"Récupéré",  color:"text-[#fbbf24] bg-[#fbbf24]/12" },
  IN_TRANSIT: { label:"En route",  color:"text-[#f97316] bg-[#f97316]/12" },
  DELIVERED:  { label:"Livrée",    color:"text-[#22d3a5] bg-[#22d3a5]/12" },
  FAILED:     { label:"Échouée",   color:"text-[#f87171] bg-[#f87171]/12" },
};
interface Props { available: DeliveryOrder[]; mine: DeliveryOrder[]; agentId: string; }

export function DeliveryOrdersClient({ available: initAvail, mine: initMine, agentId }: Props) {
  const [tab,       setTab]       = useState<"available"|"mine">("available");
  const [available, setAvailable] = useState(initAvail);
  const [mine,      setMine]      = useState(initMine);
  const [expanded,  setExpanded]  = useState<string|null>(null);
  const [loading,   setLoading]   = useState<string|null>(null);
  const [showProof, setShowProof] = useState<string|null>(null);

  const orders = tab === "available" ? available : mine;

  const accept = async (order: DeliveryOrder) => {
    setLoading(order.orderId);
    try {
      const res = await fetch("/api/delivery/accept", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ orderId: order.orderId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAvailable(p => p.filter(o => o.orderId !== order.orderId));
        setMine(p => [{ ...order, deliveryId: data.id, deliveryStatus:"ASSIGNED",
          deliveryCode: data.id?.slice(-6).toUpperCase() ?? null, assignedAt: new Date().toISOString() }, ...p]);
        setTab("mine");
      }
    } finally { setLoading(null); }
  };

  const updateStatus = async (order: DeliveryOrder, status: string) => {
    if (status === "DELIVERED") { setShowProof(order.orderId); return; }
    setLoading(order.orderId);
    try {
      await fetch(`/api/delivery/status/${order.orderId}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ status }),
      });
      if (status === "FAILED") setMine(p => p.filter(o => o.orderId !== order.orderId));
      else setMine(p => p.map(o => o.orderId === order.orderId ? {...o, deliveryStatus: status} : o));
    } finally { setLoading(null); }
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-4">
      {showProof && (
        <DeliveryProofUpload orderId={showProof}
          onSuccess={() => { setMine(p => p.filter(o => o.orderId !== showProof)); setShowProof(null); }}
          onCancel={() => setShowProof(null)} />
      )}
      <div className="flex gap-1 p-1 rounded-xl"
        style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
        {(["available","mine"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("flex-1 px-4 py-2 rounded-lg text-xs font-bold font-poppins transition-all", tab===t?"text-white":"text-white/40")}
            style={tab===t?{background:"linear-gradient(135deg,#22d3a5,#0ea572)"}:{}}>
            {t==="available" ? `Disponibles (${available.length})` : `Mes courses (${mine.length})`}
          </button>
        ))}
      </div>
      {orders.length === 0 && (
        <div className="rounded-2xl p-10 text-center"
          style={{background:"rgba(255,255,255,0.03)",border:"1px dashed rgba(255,255,255,0.08)"}}>
          <div className="text-3xl mb-3">{tab==="available"?"📭":"✅"}</div>
          <p className="text-sm font-inter" style={{color:"rgba(232,234,240,0.4)"}}>
            {tab==="available"?"Aucune course disponible":"Aucune course en cours"}
          </p>
        </div>
      )}
      <div className="space-y-3">
        {orders.map(order => {
          const isExpanded = expanded === order.orderId;
          const isLoading  = loading === order.orderId;
          const dStatus    = order.deliveryStatus ?? "READY";
          const s          = STATUS_LABEL[dStatus] ?? STATUS_LABEL.READY;
          const addr       = order.deliveryAddress ?? {};
          return (
            <div key={order.orderId} className="rounded-2xl overflow-hidden"
              style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <button className="w-full flex items-center gap-4 px-4 py-3.5 text-left"
                onClick={() => setExpanded(isExpanded ? null : order.orderId)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-poppins font-bold text-sm text-white">{order.orderNumber}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-poppins ${s.color}`}>{s.label}</span>
                    {order.deliveryCode && <CodeBadge code={order.deliveryCode} />}
                  </div>
                  <p className="text-xs font-inter mt-0.5" style={{color:"rgba(232,234,240,0.4)"}}>
                    {order.vendorName} → {addr.city ?? "Destination"} · {formatPrice(order.fee)}
                  </p>
                </div>
                {isExpanded ? <ChevronUp size={14} className="text-white/30 shrink-0"/> : <ChevronDown size={14} className="text-white/30 shrink-0"/>}
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t" style={{borderColor:"rgba(255,255,255,0.06)"}}>
                  <div className="space-y-2 pt-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#22d3a5]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#22d3a5]"/>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold font-poppins uppercase text-[#22d3a5]/70 mb-0.5">Récupération — {order.vendorName}</p>
                        <p className="text-xs font-inter text-white/70">{order.vendorAddress ?? "Adresse non renseignée"}</p>
                        {order.vendorPhone && <a href={`tel:${order.vendorPhone}`} className="flex items-center gap-1 mt-1 text-xs text-[#22d3a5]"><Phone size={10}/> {order.vendorPhone}</a>}
                      </div>
                    </div>
                    <div className="ml-2.5 h-4 w-px" style={{background:"rgba(255,255,255,0.1)"}}/>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#f97316]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin size={10} className="text-[#f97316]"/>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold font-poppins uppercase text-[#f97316]/70 mb-0.5">Livraison — {addr.fullName ?? order.clientName}</p>
                        <p className="text-xs font-inter text-white/70">{[addr.street, addr.city].filter(Boolean).join(", ")}</p>
                        {(order.clientPhone ?? addr.phone) && <a href={`tel:${order.clientPhone ?? addr.phone}`} className="flex items-center gap-1 mt-1 text-xs text-[#22d3a5]"><Phone size={10}/> {order.clientPhone ?? addr.phone}</a>}
                      </div>
                    </div>
                  </div>
                  {tab==="available" && (
                    <button onClick={() => accept(order)} disabled={isLoading}
                      className="w-full h-10 rounded-xl text-sm font-bold font-poppins text-white flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{background:"linear-gradient(135deg,#22d3a5,#0ea572)"}}>
                      {isLoading ? <Loader2 size={14} className="animate-spin"/> : <Package size={14}/>}
                      Accepter — {formatPrice(order.fee)}
                    </button>
                  )}
                  {tab==="mine" && (
                    <div className="flex gap-2 flex-wrap">
                      {dStatus==="ASSIGNED" && (
                        <button onClick={() => updateStatus(order,"PICKED_UP")} disabled={isLoading}
                          className="flex-1 h-9 rounded-xl text-xs font-bold font-poppins flex items-center justify-center gap-1.5 disabled:opacity-50"
                          style={{background:"rgba(251,191,36,0.2)",border:"1px solid rgba(251,191,36,0.3)",color:"#fbbf24"}}>
                          {isLoading?<Loader2 size={11} className="animate-spin"/>:"📦"} Colis récupéré
                        </button>
                      )}
                      {dStatus==="PICKED_UP" && (
                        <button onClick={() => updateStatus(order,"IN_TRANSIT")} disabled={isLoading}
                          className="flex-1 h-9 rounded-xl text-xs font-bold font-poppins flex items-center justify-center gap-1.5 disabled:opacity-50"
                          style={{background:"rgba(249,115,22,0.2)",border:"1px solid rgba(249,115,22,0.3)",color:"#f97316"}}>
                          {isLoading?<Loader2 size={11} className="animate-spin"/>:"🛵"} En route
                        </button>
                      )}
                      {dStatus==="IN_TRANSIT" && (
                        <>
                          <button onClick={() => updateStatus(order,"DELIVERED")} disabled={isLoading}
                            className="flex-1 h-9 rounded-xl text-xs font-bold font-poppins text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
                            style={{background:"linear-gradient(135deg,#22d3a5,#0ea572)"}}>
                            {isLoading?<Loader2 size={11} className="animate-spin"/>:"📸"} Confirmer livraison
                          </button>
                          <button onClick={() => updateStatus(order,"FAILED")} disabled={isLoading}
                            className="h-9 px-3 rounded-xl text-xs font-bold font-poppins disabled:opacity-50"
                            style={{background:"rgba(248,113,113,0.12)",color:"#f87171",border:"1px solid rgba(248,113,113,0.2)"}}>
                            Échec
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CodeBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false),1500); }}
      className="flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-black"
      style={{background:"rgba(251,191,36,0.12)",color:"#fbbf24",border:"1px solid rgba(251,191,36,0.2)"}}>
      {code} {copied?<Check size={9}/>:<Copy size={9}/>}
    </button>
  );
}
