"use client";

import { useState } from "react";
import {
  Truck, Wallet, Package, CheckCircle2, Clock,
  MapPin, ArrowDownLeft, Star, Award, Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { formatPrice, cn } from "@/lib/utils/cn";

interface Props {
  user:            { id: string; name: string; email: string };
  agent:           any;
  wallet:          { balance: number; escrow: number } | null;
  transactions:    any[];
  availableOrders: any[];
  myDeliveries:    any[];
}

const DELIVERY_STATUS: Record<string, { label: string; variant: any; emoji: string }> = {
  ASSIGNED:   { label: "Assignée",     variant: "info",    emoji: "📋" },
  PICKED_UP:  { label: "Récupérée",   variant: "warning", emoji: "🏃" },
  IN_TRANSIT: { label: "En route",    variant: "default", emoji: "🛵" },
  DELIVERED:  { label: "Livrée",      variant: "success", emoji: "✅" },
  FAILED:     { label: "Échec",       variant: "error",   emoji: "❌" },
};

type Tab = "available" | "mine" | "wallet";

export function DeliveryDashboardClient({ user, agent, wallet, transactions, availableOrders, myDeliveries }: Props) {
  const [tab,        setTab]        = useState<Tab>("available");
  const [loading,    setLoading]    = useState<string | null>(null);
  const [error,      setError]      = useState("");
  const [deliveries, setDeliveries] = useState(myDeliveries);
  const [available,  setAvailable]  = useState(availableOrders);

  const walletBalance = wallet?.balance ?? 0;
  const totalDeliveries = agent?.totalDeliveries ?? 0;
  const hasBadge        = agent?.hasBadge ?? false;

  const acceptOrder = async (orderId: string) => {
    if (!agent) return;
    setLoading(orderId); setError("");
    try {
      const res = await fetch("/api/delivery/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, deliveryAgentId: agent.id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur."); return; }
      // Remove from available, add to mine
      setAvailable(prev => prev.filter(o => o.id !== orderId));
      setDeliveries(prev => [data, ...prev]);
      setTab("mine");
    } catch { setError("Erreur réseau."); }
    finally { setLoading(null); }
  };

  const updateStatus = async (deliveryId: string, newStatus: string) => {
    setLoading(deliveryId); setError("");
    try {
      const res = await fetch(`/api/delivery/status/${deliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { setError("Erreur mise à jour statut."); return; }
      setDeliveries(prev => prev.map(d =>
        d.id === deliveryId ? { ...d, status: newStatus } : d
      ));
    } catch { setError("Erreur réseau."); }
    finally { setLoading(null); }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary text-white">
        <div className="container-bee py-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-poppins font-black text-2xl">
                  Bonjour {user.name.split(" ")[0]} 🛵
                </h1>
                {hasBadge && (
                  <Badge variant="premium" size="sm">🏅 Fiable</Badge>
                )}
              </div>
              <p className="text-white/60 font-inter text-sm">
                {totalDeliveries} livraison{totalDeliveries !== 1 ? "s" : ""} effectuée{totalDeliveries !== 1 ? "s" : ""}
                {" · "}Note : {agent?.rating?.toFixed(1) ?? "—"}/5
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl px-5 py-3 text-right">
              <p className="text-white/50 text-xs font-inter">Solde disponible</p>
              <p className="font-poppins font-black text-xl text-honey-400">
                {formatPrice(walletBalance)}
              </p>
            </div>
          </div>

          {/* Progress to badge */}
          {!hasBadge && totalDeliveries < 50 && (
            <div className="mt-4 bg-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-poppins font-semibold text-white flex items-center gap-2">
                  <Award size={16} className="text-honey-400" /> Badge Fiable
                </span>
                <span className="text-xs text-white/50 font-inter">
                  {totalDeliveries}/50 livraisons
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-honey-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalDeliveries / 50) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-white/40 font-inter mt-1">
                Encore {50 - totalDeliveries} livraisons pour obtenir le badge
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-white sticky top-16 z-10">
        <div className="container-bee flex">
          {([
            { key: "available" as Tab, label: "Disponibles", count: available.length },
            { key: "mine"      as Tab, label: "Mes livraisons", count: deliveries.filter(d => d.status !== "DELIVERED" && d.status !== "FAILED").length },
            { key: "wallet"    as Tab, label: "Portefeuille", count: null },
          ] as const).map(({ key, label, count: cnt }) => (
            <button key={key} onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-2 px-5 py-4 text-sm font-semibold font-poppins border-b-2 transition-colors",
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}>
              {label}
              {cnt !== null && cnt > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {cnt}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="container-bee py-6 max-w-3xl">
        {error && <Alert variant="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}

        {/* ── AVAILABLE ORDERS ── */}
        {tab === "available" && (
          <div className="space-y-3">
            {!agent && (
              <Alert variant="warning">
                Votre profil livreur est incomplet. Contactez le support.
              </Alert>
            )}
            {available.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🛵</div>
                <p className="font-poppins font-bold text-lg text-foreground mb-2">Aucune commande disponible</p>
                <p className="text-sm text-muted-foreground font-inter">
                  Les nouvelles commandes prêtes à être livrées apparaîtront ici.
                </p>
              </div>
            ) : available.map(order => {
              const addr = order.deliveryAddress as any;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-poppins font-bold text-sm text-foreground">
                          {order.orderNumber}
                        </p>
                        <Badge variant="success" size="xs">Prête</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-inter flex items-center gap-1 mb-2">
                        <MapPin size={11} /> {addr?.street}, {addr?.city}
                      </p>
                      <div className="flex items-center gap-1">
                        <Phone size={11} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-inter">{addr?.phone}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-poppins font-black text-lg text-primary mb-2">
                        +{formatPrice(500)}
                      </p>
                      <Button size="sm"
                        isLoading={loading === order.id}
                        loadingText="…"
                        onClick={() => acceptOrder(order.id)}
                        disabled={!agent}>
                        Accepter
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MY DELIVERIES ── */}
        {tab === "mine" && (
          <div className="space-y-3">
            {deliveries.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📋</div>
                <p className="font-poppins font-bold text-lg text-foreground mb-2">Aucune livraison en cours</p>
                <p className="text-sm text-muted-foreground font-inter">
                  Acceptez des commandes dans l'onglet "Disponibles".
                </p>
              </div>
            ) : deliveries.map(delivery => {
              const s    = DELIVERY_STATUS[delivery.status] ?? { label: delivery.status, variant: "muted", emoji: "📦" };
              const addr = delivery.deliveryAddress as any;
              const isActive = !["DELIVERED", "FAILED"].includes(delivery.status);

              return (
                <div key={delivery.id} className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-xl">{s.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-poppins font-semibold text-sm text-foreground">
                          {delivery.orderNumber}
                        </p>
                        <Badge variant={s.variant} size="xs">{s.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-inter flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {addr?.street}, {addr?.city}
                      </p>
                    </div>
                    <p className="font-poppins font-bold text-sm text-success-dark shrink-0">
                      +{formatPrice(delivery.fee ?? 500)}
                    </p>
                  </div>

                  {/* Status actions */}
                  {isActive && (
                    <div className="flex gap-2 flex-wrap">
                      {delivery.status === "ASSIGNED" && (
                        <Button size="xs" variant="outline"
                          isLoading={loading === delivery.id}
                          onClick={() => updateStatus(delivery.id, "PICKED_UP")}>
                          🏃 J'ai récupéré
                        </Button>
                      )}
                      {delivery.status === "PICKED_UP" && (
                        <Button size="xs" variant="outline"
                          isLoading={loading === delivery.id}
                          onClick={() => updateStatus(delivery.id, "IN_TRANSIT")}>
                          🛵 En route
                        </Button>
                      )}
                      {delivery.status === "IN_TRANSIT" && (
                        <>
                          <Button size="xs" variant="success"
                            isLoading={loading === delivery.id}
                            onClick={() => updateStatus(delivery.id, "DELIVERED")}>
                            ✅ Livré !
                          </Button>
                          <Button size="xs" variant="destructive"
                            onClick={() => updateStatus(delivery.id, "FAILED")}>
                            Échec
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── WALLET ── */}
        {tab === "wallet" && (
          <div className="space-y-4">
            {/* Balance card */}
            <div className="bg-secondary rounded-2xl p-6 text-white">
              <p className="text-white/50 text-xs font-poppins uppercase tracking-wider mb-2">Solde disponible</p>
              <p className="font-poppins font-black text-3xl text-honey-400 mb-4">
                {formatPrice(walletBalance)}
              </p>
              <div className="flex items-center gap-2 text-xs text-white/50 font-inter">
                <Truck size={12} />
                <span>500 FCFA par livraison réussie</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-border p-4 text-center">
                <p className="font-poppins font-black text-2xl text-foreground">{totalDeliveries}</p>
                <p className="text-xs text-muted-foreground font-inter">Livraisons totales</p>
              </div>
              <div className="bg-white rounded-2xl border border-border p-4 text-center">
                <p className="font-poppins font-black text-2xl text-foreground">
                  {agent?.rating?.toFixed(1) ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground font-inter flex items-center justify-center gap-1">
                  <Star size={10} className="text-honey-400 fill-honey-400" /> Note moyenne
                </p>
              </div>
            </div>

            {/* Withdrawal button */}
            {walletBalance >= 5000 && (
              <Button fullWidth leftIcon={<ArrowDownLeft size={16} />} variant="outline"
                onClick={() => {/* TODO: retrait */}}>
                Demander un retrait
              </Button>
            )}
            {walletBalance < 5000 && (
              <p className="text-xs text-center text-muted-foreground font-inter">
                Minimum 5 000 FCFA pour demander un retrait ({formatPrice(5000 - walletBalance)} restants)
              </p>
            )}

            {/* Transactions */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <p className="font-poppins font-semibold text-base text-foreground">Historique</p>
              </div>
              {transactions.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground font-inter">
                  Aucune transaction
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {transactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                        tx.type === "CREDIT" ? "bg-success/10" : "bg-error/10"
                      )}>
                        <ArrowDownLeft size={14} className={tx.type === "CREDIT" ? "text-success" : "text-error"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold font-poppins text-foreground">
                          {tx.reason === "DELIVERY_FEE" ? "Livraison" : tx.reason}
                        </p>
                        <p className="text-xs text-muted-foreground font-inter">
                          {new Date(tx.createdAt).toLocaleDateString("fr-CM", { day:"2-digit", month:"short" })}
                        </p>
                      </div>
                      <p className={cn("font-poppins font-bold text-sm shrink-0",
                        tx.type === "CREDIT" ? "text-success-dark" : "text-error")}>
                        {tx.type === "CREDIT" ? "+" : "-"}{formatPrice(tx.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
