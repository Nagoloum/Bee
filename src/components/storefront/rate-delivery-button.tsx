"use client";

import { useState } from "react";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Props {
  orderId:     string;
  orderStatus: string;
  alreadyRated?: boolean;
}

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          className={cn(!onChange && "pointer-events-none", "transition-transform hover:scale-110")}>
          <Star
            size={28}
            strokeWidth={0}
            fill="currentColor"
            className={cn(
              s <= (hover || value)
                ? "text-honey-400"
                : "text-muted-foreground/20"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function RateDeliveryButton({ orderId, orderStatus, alreadyRated }: Props) {
  const [open,      setOpen]      = useState(false);
  const [rating,    setRating]    = useState(0);
  const [comment,   setComment]   = useState("");
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState(alreadyRated ?? false);
  const [error,     setError]     = useState("");

  // N'afficher que si la commande est livrée et pas encore notée
  if (orderStatus !== "DELIVERED") return null;
  if (success) {
    return (
      <div className="flex items-center gap-2 text-sm font-inter text-success-dark">
        <CheckCircle2 size={15} />
        Merci pour votre évaluation du livreur !
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError("Choisissez une note."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/delivery/rate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur."); return; }
      setSuccess(true);
      setOpen(false);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-semibold font-poppins text-primary hover:underline">
        <Star size={14} className="text-honey-400" fill="currentColor" />
        Noter votre livreur
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div>
              <h3 className="font-poppins font-bold text-lg text-foreground">
                Évaluez votre livreur
              </h3>
              <p className="text-sm text-muted-foreground font-inter mt-0.5">
                Votre avis aide les livreurs à s'améliorer.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="flex justify-center py-2">
                <Stars value={rating} onChange={setRating} />
              </div>

              {rating > 0 && (
                <p className="text-center text-sm font-poppins font-semibold"
                  style={{ color: rating >= 4 ? "#1D9E75" : rating >= 3 ? "#BA7517" : "#E24B4A" }}>
                  {rating === 5 ? "Excellent ! 🎉"
                    : rating === 4 ? "Très bien 👍"
                    : rating === 3 ? "Correct"
                    : rating === 2 ? "Peut mieux faire"
                    : "Mauvaise expérience"}
                </p>
              )}

              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Commentaire optionnel…"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-cream-50 text-sm font-inter text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />

              {error && (
                <p className="text-xs text-red-600 font-inter">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setError(""); }}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold font-poppins border border-border text-muted-foreground hover:bg-muted transition-colors">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || !rating}
                  className="flex-1 h-10 rounded-xl text-sm font-bold font-poppins text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  style={{ background:"linear-gradient(135deg,#F6861A,#E5750D)" }}>
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} fill="white" strokeWidth={0} />}
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
