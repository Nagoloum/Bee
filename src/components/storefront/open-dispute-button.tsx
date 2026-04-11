"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const REASONS = [
  "Produit non reçu",
  "Produit endommagé",
  "Produit non conforme à la description",
  "Produit incomplet",
  "Erreur de livraison",
  "Remboursement non reçu",
  "Autre",
];

interface Props {
  orderId:     string;
  orderStatus: string;
}

export function OpenDisputeButton({ orderId, orderStatus }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");
  const [form, setForm] = useState({ reason: "", description: "" });

  const canOpenDispute = ["DELIVERED", "IN_TRANSIT", "CONFIRMED", "PREPARING"].includes(orderStatus);
  if (!canOpenDispute) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reason) { setError("Choisissez un motif."); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/disputes", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur."); return; }
      setSuccess(true);
      setShowModal(false);
    } catch { setError("Erreur réseau."); }
    finally { setSubmitting(false); }
  };

  if (success) return (
    <Alert variant="success">
      <p className="font-semibold font-poppins">Litige ouvert ✓</p>
      <p className="text-sm mt-0.5">
        Notre équipe va examiner votre demande sous 24–48h.
      </p>
    </Alert>
  );

  return (
    <>
      <button onClick={() => setShowModal(true)}
        className="text-sm text-error hover:underline font-inter flex items-center gap-1.5">
        <AlertTriangle size={13} /> Ouvrir un litige
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-poppins font-bold text-xl text-foreground">Ouvrir un litige</h2>
              <button onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <Alert variant="warning">
              L'équipe BEE vous contactera sous 24–48h pour résoudre votre problème.
            </Alert>
            {error && <Alert variant="error" onClose={() => setError("")}>{error}</Alert>}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold font-poppins text-foreground mb-1.5 block">
                  Motif *
                </label>
                <select value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-white text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required>
                  <option value="">Choisir un motif…</option>
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold font-poppins text-foreground mb-1.5 block">
                  Description (optionnel)
                </label>
                <textarea value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Décrivez votre problème en détail…"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="destructive" isLoading={submitting} className="flex-1">
                  Ouvrir le litige
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
