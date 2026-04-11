"use client";

import { useState } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { formatPrice, cn } from "@/lib/utils/cn";

const REASON_LABEL: Record<string, string> = {
  SALE:            "Vente",
  COMMISSION:      "Commission",
  ESCROW_RELEASE:  "Libération escrow",
  REFUND:          "Remboursement",
  WITHDRAWAL:      "Retrait",
  ADJUSTMENT:      "Ajustement admin",
};

interface Props {
  balance:      number;
  escrow:       number;
  transactions: any[];
}

export function VendorWalletClient({ balance: initBalance, escrow, transactions }: Props) {
  const [balance,      setBalance]      = useState(initBalance);
  const [showModal,    setShowModal]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [success,      setSuccess]      = useState("");
  const [error,        setError]        = useState("");
  const [form, setForm] = useState({
    amount: "", method: "mobile_money", accountDetails: "", accountName: "",
  });

  const MIN_WITHDRAWAL = 5000;

  const requestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const amount = Number(form.amount);
    if (amount < MIN_WITHDRAWAL) { setError(`Minimum ${formatPrice(MIN_WITHDRAWAL)}.`); return; }
    if (amount > balance)        { setError("Solde insuffisant."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/vendor/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur."); return; }
      setSuccess("Demande envoyée ! L'équipe BEE traitera votre retrait sous 48h.");
      setShowModal(false);
      setForm({ amount: "", method: "mobile_money", accountDetails: "", accountName: "" });
    } catch { setError("Erreur réseau."); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-poppins font-black text-2xl text-foreground">Portefeuille</h1>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">Vos revenus et transactions</p>
      </div>

      {success && <Alert variant="success" onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Balance cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card variant="ink" padding="md">
          <CardContent>
            <p className="text-white/50 text-xs font-poppins uppercase tracking-wider mb-2">Solde disponible</p>
            <p className="font-poppins font-black text-2xl text-white">{formatPrice(balance)}</p>
            <Button size="sm" className="mt-4 w-full" variant="default"
              disabled={balance < MIN_WITHDRAWAL}
              onClick={() => setShowModal(true)}>
              {balance < MIN_WITHDRAWAL
                ? `Min. ${formatPrice(MIN_WITHDRAWAL)}`
                : "Demander un retrait"}
            </Button>
            {balance < MIN_WITHDRAWAL && (
              <p className="text-white/40 text-xs font-inter mt-2 text-center">
                Il manque {formatPrice(MIN_WITHDRAWAL - balance)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card variant="honey" padding="md">
          <CardContent>
            <p className="text-honey-700 text-xs font-poppins uppercase tracking-wider mb-2">En escrow</p>
            <p className="font-poppins font-black text-2xl text-honey-800">{formatPrice(escrow)}</p>
            <p className="text-xs text-honey-600 font-inter mt-2">Libéré après confirmation de livraison</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader><CardTitle>Historique des transactions</CardTitle></CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-10">
              <TrendingUp size={32} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-inter">Aucune transaction pour le moment</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                    tx.type === "CREDIT" ? "bg-success/10" : "bg-error/10"
                  )}>
                    {tx.type === "CREDIT"
                      ? <ArrowDownLeft size={16} className="text-success" />
                      : <ArrowUpRight  size={16} className="text-error"   />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold font-poppins text-foreground">
                      {REASON_LABEL[tx.reason] ?? tx.reason}
                    </p>
                    <p className="text-xs text-muted-foreground font-inter">
                      {new Date(tx.createdAt).toLocaleDateString("fr-CM", {
                        day:"2-digit", month:"short", year:"numeric",
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
        </CardContent>
      </Card>

      {/* Withdrawal modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="font-poppins font-bold text-xl text-foreground">Demande de retrait</h2>
            {error && <Alert variant="error" onClose={() => setError("")}>{error}</Alert>}
            <form onSubmit={requestWithdrawal} className="space-y-4">
              <Input label="Montant (FCFA)" type="number" min={MIN_WITHDRAWAL} max={balance}
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                hint={`Disponible : ${formatPrice(balance)} · Min : ${formatPrice(MIN_WITHDRAWAL)}`}
                required />
              <div>
                <label className="text-sm font-semibold font-poppins text-foreground mb-1.5 block">
                  Méthode
                </label>
                <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-white text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="mobile_money">MTN MoMo / Orange Money</option>
                  <option value="bank">Virement bancaire</option>
                </select>
              </div>
              <Input label="Numéro de compte / téléphone" placeholder="6XX XXX XXX"
                value={form.accountDetails}
                onChange={e => setForm(f => ({ ...f, accountDetails: e.target.value }))}
                required />
              <Input label="Nom du bénéficiaire" placeholder="Jean Dupont"
                value={form.accountName}
                onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))}
                required />
              <p className="text-xs text-muted-foreground font-inter">
                Les retraits sont traités sous 48h ouvrables par l'équipe BEE.
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); setError(""); }}>
                  Annuler
                </Button>
                <Button type="submit" isLoading={saving} loadingText="Envoi…" className="flex-1">
                  Envoyer la demande
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
