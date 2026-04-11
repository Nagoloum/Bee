"use client";

import { useState, useEffect } from "react";
import { Star, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils/cn";

interface Review {
  id: string; rating: number; comment: string | null;
  images: string[]; isVerified: boolean; createdAt: string;
}

interface Props {
  targetId:   string;
  targetType: "PRODUCT" | "VENDOR";
  orderId?:   string; // pass if client has a delivered order for this product
  isLoggedIn: boolean;
  avgRating:  number;
  totalReviews: number;
}

function Stars({ value, size = 16, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          className={cn(!onChange && "pointer-events-none")}>
          <Star size={size}
            className={cn(
              s <= (hover || value)
                ? "fill-honey-400 text-honey-400"
                : "text-muted-foreground/30"
            )}
            strokeWidth={0} fill="currentColor" />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ targetId, targetType, orderId, isLoggedIn, avgRating, totalReviews }: Props) {
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [form, setForm] = useState({ rating: 0, comment: "" });

  useEffect(() => {
    fetch(`/api/reviews?targetId=${targetId}&targetType=${targetType}`)
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [targetId, targetType]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.rating === 0) { setError("Choisissez une note."); return; }
    if (form.rating < 3 && !form.comment.trim()) {
      setError("Un commentaire est obligatoire pour une note inférieure à 3 étoiles.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/reviews", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ targetId, targetType, orderId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur."); return; }
      setReviews(prev => [data, ...prev]);
      setSuccess(true);
      setShowForm(false);
      setForm({ rating: 0, comment: "" });
    } catch { setError("Erreur réseau."); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-poppins font-bold text-xl text-foreground">Avis clients</h2>
          {totalReviews > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <Stars value={Math.round(avgRating)} />
              <span className="font-semibold text-sm font-inter">{avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm font-inter">({totalReviews} avis)</span>
            </div>
          )}
        </div>
        {isLoggedIn && orderId && !success && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(s => !s)}>
            {showForm ? "Annuler" : "Laisser un avis"}
          </Button>
        )}
      </div>

      {success && (
        <Alert variant="success" className="mb-4">Merci pour votre avis !</Alert>
      )}

      {/* Review form */}
      {showForm && (
        <form onSubmit={submit} className="bg-cream-100 rounded-2xl p-5 mb-6 space-y-4">
          <div>
            <p className="text-sm font-semibold font-poppins text-foreground mb-2">Votre note *</p>
            <Stars value={form.rating} size={28}
              onChange={v => setForm(f => ({ ...f, rating: v }))} />
          </div>
          <div>
            <label className="text-sm font-semibold font-poppins text-foreground mb-1.5 block">
              Commentaire {form.rating > 0 && form.rating < 3 ? " *" : " (optionnel)"}
            </label>
            <textarea
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Partagez votre expérience…"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
          {error && <Alert variant="error" onClose={() => setError("")}>{error}</Alert>}
          <Button type="submit" isLoading={saving}>Publier l'avis</Button>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground font-inter text-sm py-4">
          Aucun avis pour le moment. Soyez le premier à en laisser un !
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border-b border-border pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Stars value={review.rating} size={14} />
                  {review.isVerified && (
                    <span className="text-[10px] font-bold text-success-dark bg-success/10 px-2 py-0.5 rounded-full font-poppins">
                      ✓ Achat vérifié
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-inter">
                  {new Date(review.createdAt).toLocaleDateString("fr-CM")}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm font-inter text-foreground-secondary leading-relaxed">
                  {review.comment}
                </p>
              )}
              {(review.images as string[]).length > 0 && (
                <div className="flex gap-2 mt-2">
                  {(review.images as string[]).map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
