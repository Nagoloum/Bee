"use client";

import { useEffect, useState } from "react";
import { Star, TrendingUp, Gift, ShoppingBag, MessageSquare, Users, Loader2, CheckCircle2 } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils/cn";

interface PointsData {
  total:        number;
  lifetime:     number;
  fcfaValue:    number;
  minRedeem:    number;
  fcfaPerPoint: number;
  transactions: Array<{
    id:          string;
    amount:      number;
    reason:      string;
    createdAt:   string;
  }>;
}

const REASON_ICON: Record<string, { icon: any; color: string }> = {
  "Achat validé":         { icon: ShoppingBag, color: "text-primary" },
  "Avis laissé":          { icon: MessageSquare, color: "text-blue-500" },
  "Parrainage réussi":    { icon: Users, color: "text-success-dark" },
  "Échange contre réduction": { icon: Gift, color: "text-amber-500" },
};

const HOW_TO = [
  { icon: ShoppingBag, pts: 10,  label: "Par commande validée",  color: "#F6861A" },
  { icon: MessageSquare, pts: 5, label: "Par avis laissé",       color: "#3B82F6" },
  { icon: Users, pts: 50,       label: "Par parrainage réussi",  color: "#22d3a5" },
];

export default function PointsPage() {
  const [data,     setData]     = useState<PointsData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [redeeming,setRedeeming]= useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    fetch("/api/points")
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const redeem = async () => {
    if (!data || data.total < data.minRedeem) return;
    setRedeeming(true);
    setError("");
    try {
      const res = await fetch("/api/points", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "redeem" }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Erreur."); return; }
      setRedeemed(true);
      setData(prev => prev ? { ...prev, total: d.newTotal, fcfaValue: d.fcfaValue } : prev);
    } catch { setError("Erreur réseau."); }
    finally { setRedeeming(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 size={24} className="animate-spin text-primary" />
    </div>
  );

  const pct = data ? Math.min(100, (data.total / data.minRedeem) * 100) : 0;
  const canRedeem = (data?.total ?? 0) >= (data?.minRedeem ?? 100);

  return (
    <div className="container-bee py-8 max-w-xl space-y-5 pb-12">
      <div>
        <h1 className="font-poppins font-black text-2xl text-foreground">Programme de points</h1>
        <p className="text-sm text-muted-foreground font-inter mt-1">
          Gagnez des points à chaque interaction et échangez-les contre des réductions.
        </p>
      </div>

      {/* Solde principal */}
      <div className="relative overflow-hidden rounded-3xl p-6 text-white"
        style={{ background: "linear-gradient(135deg, #1A1A2E, #16213E)" }}>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{ background: "#F6861A", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
          style={{ background: "#9b7fff", transform: "translate(-30%, 30%)" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Star size={16} className="text-honey-400" fill="currentColor" />
            <p className="text-white/60 text-xs font-poppins uppercase tracking-wider">Vos points BEE</p>
          </div>
          <p className="font-poppins font-black text-5xl text-honey-400 mb-1">
            {data?.total ?? 0}
          </p>
          <p className="text-white/50 text-sm font-inter">
            Valeur : {formatPrice(data?.fcfaValue ?? 0)} · Total gagné : {data?.lifetime ?? 0} pts
          </p>

          {/* Barre progression vers rachat */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-inter text-white/50">
                {canRedeem ? "Vous pouvez échanger !" : `${data?.total ?? 0} / ${data?.minRedeem ?? 100} points`}
              </p>
              <p className="text-xs font-bold font-poppins text-honey-400">{Math.round(pct)}%</p>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #F6861A, #fbbf24)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bouton rédemption */}
      {redeemed ? (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-success/10 border border-success/20">
          <CheckCircle2 size={20} className="text-success-dark shrink-0" />
          <div>
            <p className="font-poppins font-bold text-sm text-success-dark">Points échangés !</p>
            <p className="text-xs font-inter text-muted-foreground mt-0.5">
              Votre réduction sera appliquée à votre prochaine commande.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Gift size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="font-poppins font-bold text-sm text-foreground">Échangez vos points</p>
              <p className="text-xs text-muted-foreground font-inter">
                1 point = {formatPrice(data?.fcfaPerPoint ?? 10)} · Minimum {data?.minRedeem ?? 100} pts
              </p>
            </div>
          </div>
          {error && <p className="text-xs text-red-600 font-inter">{error}</p>}
          <button
            onClick={redeem}
            disabled={!canRedeem || redeeming}
            className="w-full h-11 rounded-xl font-bold font-poppins text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            style={{ background: canRedeem ? "linear-gradient(135deg,#F6861A,#E5750D)" : undefined,
                     backgroundColor: !canRedeem ? "var(--color-background-tertiary)" : undefined }}>
            {redeeming
              ? <><Loader2 size={14} className="animate-spin" /> Échange en cours…</>
              : canRedeem
              ? <><Gift size={14} /> Échanger {data?.total} pts → {formatPrice(data?.fcfaValue ?? 0)}</>
              : `Il manque ${(data?.minRedeem ?? 100) - (data?.total ?? 0)} points`
            }
          </button>
        </div>
      )}

      {/* Comment gagner */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-primary" />
          <p className="font-poppins font-bold text-sm text-foreground">Comment gagner des points ?</p>
        </div>
        <div className="space-y-3">
          {HOW_TO.map(({ icon: Icon, pts, label, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}15` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <p className="text-sm font-inter text-foreground flex-1">{label}</p>
              <div className="flex items-center gap-1 shrink-0">
                <Star size={12} className="text-honey-400" fill="currentColor" />
                <span className="font-poppins font-bold text-sm text-foreground">+{pts}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historique */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <p className="font-poppins font-bold text-sm text-foreground mb-4">Historique</p>
        {(data?.transactions ?? []).length === 0 ? (
          <div className="text-center py-6">
            <Star size={28} className="text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-inter">Aucun point encore gagné</p>
            <p className="text-xs text-muted-foreground font-inter mt-1">
              Passez votre première commande !
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data!.transactions.map(tx => {
              const isPositive = tx.amount > 0;
              const meta = REASON_ICON[tx.reason] ?? { icon: Star, color: "text-muted-foreground" };
              const Icon = meta.icon;
              return (
                <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: isPositive ? "#E1F5EE" : "#FAEEDA" }}>
                    <Icon size={14} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-inter text-foreground">{tx.reason}</p>
                    <p className="text-xs text-muted-foreground font-inter">
                      {new Date(tx.createdAt).toLocaleDateString("fr-CM", { day:"2-digit", month:"short" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star size={11} className={isPositive ? "text-honey-400" : "text-amber-600"} fill="currentColor" />
                    <span className={cn(
                      "font-poppins font-bold text-sm",
                      isPositive ? "text-success-dark" : "text-amber-600"
                    )}>
                      {isPositive ? "+" : ""}{tx.amount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
