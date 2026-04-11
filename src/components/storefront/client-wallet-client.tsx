"use client";

import { useState } from "react";
import {
  Wallet, Star, TrendingUp, ArrowDownLeft, ArrowUpRight,
  Gift, ChevronDown, ChevronUp, Info,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils/cn";

const POINTS_TO_FCFA = 10;
const MIN_REDEEM     = 100;

const TX_LABELS: Record<string, string> = {
  SALE:            "Vente",
  CASHBACK:        "Cashback",
  REFERRAL_BONUS:  "Bonus parrainage",
  REFUND:          "Remboursement",
  WITHDRAWAL:      "Retrait",
  WALLET_USAGE:    "Paiement wallet",
  ADJUSTMENT:      "Ajustement",
  DELIVERY_FEE:    "Frais livraison",
  ESCROW_RELEASE:  "Libération escrow",
};

const PT_LABELS: Record<string, string> = {
  COMMANDE:  "Points gagnés",
  RACHAT:    "Points utilisés",
  BONUS:     "Bonus",
  AJUSTEMENT:"Ajustement",
};

interface Props {
  balance:         number;
  escrow:          number;
  pointsTotal:     number;
  pointsLifetime:  number;
  walletHistory:   any[];
  pointsHistory:   any[];
}

export function ClientWalletClient({
  balance, escrow, pointsTotal, pointsLifetime,
  walletHistory, pointsHistory,
}: Props) {
  const [tab, setTab] = useState<"wallet" | "points">("wallet");
  const [showCashbackInfo, setShowCashbackInfo] = useState(false);

  const pointsFcfa   = pointsTotal * POINTS_TO_FCFA;
  const canRedeem    = pointsTotal >= MIN_REDEEM;
  const progressPct  = Math.min(100, (pointsTotal / MIN_REDEEM) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="container-bee max-w-xl py-8 space-y-5">

        <h1 className="font-poppins font-black text-2xl text-foreground">Mon portefeuille</h1>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 rounded-2xl bg-cream-100 border border-border">
          {([
            { key:"wallet", label:"Wallet FCFA", icon:Wallet },
            { key:"points", label:"Mes Points",  icon:Star   },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-bold font-poppins transition-all",
                tab === key
                  ? "bg-white text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════ TAB WALLET ══════════════ */}
        {tab === "wallet" && (
          <div className="space-y-4">
            {/* Solde principal */}
            <div className="bg-white rounded-3xl border border-border p-6">
              <p className="text-xs font-poppins font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Solde disponible
              </p>
              <p className="font-poppins font-black text-4xl text-foreground">
                {formatPrice(balance)}
              </p>
              {escrow > 0 && (
                <p className="text-xs font-inter text-muted-foreground mt-2">
                  + {formatPrice(escrow)} en escrow (en attente de livraison)
                </p>
              )}
            </div>

            {/* Cashback info */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => setShowCashbackInfo(s => !s)}
                className="w-full flex items-center gap-3 px-5 py-4">
                <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                  <Gift size={16} className="text-success-dark" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-poppins font-bold text-sm text-foreground">Programme Cashback</p>
                  <p className="text-xs font-inter text-muted-foreground">5% reversé sur vos achats</p>
                </div>
                {showCashbackInfo
                  ? <ChevronUp size={16} className="text-muted-foreground" />
                  : <ChevronDown size={16} className="text-muted-foreground" />}
              </button>
              {showCashbackInfo && (
                <div className="px-5 pb-5 pt-1 border-t border-border space-y-3">
                  <div className="bg-success/5 rounded-xl p-3 space-y-1.5 text-sm font-inter text-foreground-secondary">
                    <p>✓ <span className="font-semibold">5% de cashback</span> sur toute commande supérieure à <span className="font-semibold">50 000 FCFA</span></p>
                    <p>✓ Crédité automatiquement après la livraison</p>
                    <p>✓ Utilisable sur votre prochaine commande</p>
                  </div>
                </div>
              )}
            </div>

            {/* Historique wallet */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <p className="font-poppins font-bold text-base text-foreground mb-4">Historique</p>
              {walletHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet size={28} className="text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm font-inter text-muted-foreground">Aucune transaction</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {walletHistory.map((tx: any) => (
                    <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                        tx.type === "CREDIT" ? "bg-success/10" : "bg-error/10"
                      )}>
                        {tx.type === "CREDIT"
                          ? <ArrowDownLeft size={14} className="text-success-dark" />
                          : <ArrowUpRight  size={14} className="text-error" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-poppins font-semibold text-sm text-foreground">
                          {TX_LABELS[tx.reason] ?? tx.reason}
                        </p>
                        <p className="text-xs font-inter text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString("fr-CM", {
                            day:"2-digit", month:"short", year:"numeric"
                          })}
                        </p>
                      </div>
                      <p className={cn(
                        "font-poppins font-bold text-sm shrink-0",
                        tx.type === "CREDIT" ? "text-success-dark" : "text-error"
                      )}>
                        {tx.type === "CREDIT" ? "+" : "-"}{formatPrice(tx.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ TAB POINTS ══════════════ */}
        {tab === "points" && (
          <div className="space-y-4">
            {/* Solde points */}
            <div className="bg-white rounded-3xl border border-border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-poppins font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Mes BEE Points
                  </p>
                  <p className="font-poppins font-black text-4xl text-foreground">
                    {pointsTotal.toLocaleString("fr-CM")}
                    <span className="text-base font-semibold text-muted-foreground ml-1">pts</span>
                  </p>
                  <p className="text-sm font-inter text-muted-foreground mt-1">
                    Valeur : <span className="font-semibold text-primary">{formatPrice(pointsFcfa)}</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-honey-50 flex items-center justify-center">
                  <Star size={22} className="text-honey-500" fill="currentColor" />
                </div>
              </div>

              {/* Progress vers rachat */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-inter text-muted-foreground">
                    {canRedeem
                      ? "Vous pouvez racheter vos points !"
                      : `${MIN_REDEEM - pointsTotal} points avant le 1er rachat`}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {pointsTotal}/{MIN_REDEEM}
                  </p>
                </div>
                <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progressPct}%`,
                      background: canRedeem
                        ? "linear-gradient(90deg,#1D9E75,#0ea572)"
                        : "linear-gradient(90deg,#F6861A,#E5750D)",
                    }}
                  />
                </div>
              </div>

              {canRedeem && (
                <div className="mt-3 px-3 py-2 rounded-xl bg-success/8 border border-success/20 text-xs font-inter text-success-dark">
                  Utilisez vos points au checkout pour obtenir une réduction de{" "}
                  <span className="font-bold">{formatPrice(pointsFcfa)}</span> !
                </div>
              )}
            </div>

            {/* Comment gagner des points */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <p className="font-poppins font-bold text-base text-foreground">Comment gagner des points ?</p>
              {[
                { icon:"🛒", title:"Acheter sur BEE",    desc:`1 point par 10 FCFA dépensés` },
                { icon:"⭐", title:"Laisser un avis",     desc:`Bientôt disponible` },
                { icon:"👥", title:"Parrainer un ami",   desc:`Voir la page /referral` },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-honey-50 flex items-center justify-center text-lg shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="font-poppins font-semibold text-sm text-foreground">{title}</p>
                    <p className="text-xs font-inter text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Historique points */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <p className="font-poppins font-bold text-base text-foreground mb-4">Historique des points</p>
              {pointsHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Star size={28} className="text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm font-inter text-muted-foreground">Aucun mouvement de points</p>
                  <p className="text-xs font-inter text-muted-foreground mt-1">
                    Faites votre première commande pour gagner des points !
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pointsHistory.map((tx: any) => (
                    <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                        tx.amount > 0 ? "bg-honey-50" : "bg-cream-200"
                      )}>
                        {tx.amount > 0
                          ? <Star size={14} className="text-honey-500" fill="currentColor" />
                          : <Gift size={14} className="text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-poppins font-semibold text-sm text-foreground">
                          {PT_LABELS[tx.reason] ?? tx.reason}
                        </p>
                        <p className="text-xs font-inter text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString("fr-CM", {
                            day:"2-digit", month:"short", year:"numeric"
                          })}
                        </p>
                      </div>
                      <p className={cn(
                        "font-poppins font-bold text-sm shrink-0",
                        tx.amount > 0 ? "text-honey-600" : "text-muted-foreground"
                      )}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString("fr-CM")} pts
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats totaux */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-border p-4">
                <p className="text-xs font-inter text-muted-foreground mb-1">Points à vie</p>
                <p className="font-poppins font-black text-xl text-foreground">
                  {pointsLifetime.toLocaleString("fr-CM")}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-border p-4">
                <p className="text-xs font-inter text-muted-foreground mb-1">Économies totales</p>
                <p className="font-poppins font-black text-xl text-primary">
                  {formatPrice(pointsLifetime * POINTS_TO_FCFA)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
