"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Tag, Trash2, ToggleLeft, ToggleRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/cn";

interface Coupon {
  id: string; code: string; type: string; value: number;
  minOrderAmount: number | null; maxDiscount: number | null;
  usageLimit: number | null; usedCount: number;
  isActive: boolean; expiresAt: Date | string | null;
  createdAt: Date | string;
}

interface Props {
  vendorId:   string;
  coupons:    Coupon[];
  maxCoupons: number;
  maxDiscount:number;
  planName:   string;
}

const EMPTY_FORM = {
  code: "", type: "PERCENT" as "PERCENT" | "FIXED",
  value: "", minOrderAmount: "", usageLimit: "", expiresAt: "",
};

export function VendorCouponsClient({ vendorId, coupons: initial, maxCoupons, maxDiscount, planName }: Props) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [copied,   setCopied]   = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const activeCoupons = coupons.filter(c => c.isActive);
  const canCreate     = maxCoupons === 0 ? false : coupons.length < maxCoupons;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.code || !form.value) { setError("Code et valeur sont requis."); return; }
    if (form.type === "PERCENT" && Number(form.value) > maxDiscount) {
      setError(`Votre plan ${planName} limite les coupons à ${maxDiscount}% max.`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          code:            form.code.toUpperCase().replace(/\s/g, ""),
          type:            form.type,
          value:           Number(form.value),
          minOrderAmount:  form.minOrderAmount ? Number(form.minOrderAmount) : null,
          maxDiscount:     form.type === "PERCENT" ? Number(form.value) * 1000 : null,
          usageLimit:      form.usageLimit ? Number(form.usageLimit) : null,
          expiresAt:       form.expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur."); return; }
      setCoupons(prev => [data, ...prev]);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch { setError("Erreur réseau."); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/vendor/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !current } : c));
    } catch {}
  };

  const deleteCoupon = async (id: string) => {
    try {
      await fetch(`/api/vendor/coupons/${id}`, { method: "DELETE" });
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-poppins font-black text-2xl text-foreground">Mes coupons</h1>
          <p className="text-sm text-muted-foreground font-inter mt-0.5">
            {coupons.length} / {maxCoupons === 0 ? "∞" : maxCoupons} coupon{coupons.length !== 1 ? "s" : ""}
            {" · "}Réduction max : {maxDiscount}%
          </p>
        </div>
        {canCreate ? (
          <Button leftIcon={<Plus size={15} />} onClick={() => setShowForm(s => !s)}>
            Nouveau coupon
          </Button>
        ) : (
          <div className="text-right">
            <Badge variant="warning" size="sm">Limite plan {planName}</Badge>
            <p className="text-xs text-muted-foreground font-inter mt-1">
              Upgradez pour plus de coupons
            </p>
          </div>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-primary p-6">
          <h2 className="font-poppins font-bold text-lg text-foreground mb-4 flex items-center gap-2">
            <Tag size={18} className="text-primary" /> Créer un coupon
          </h2>
          {error && <Alert variant="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}
          <form onSubmit={createCoupon} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Code promo" placeholder="SUMMER20"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                required hint="Sera affiché en majuscules" />
              <div>
                <label className="text-sm font-semibold font-poppins text-foreground mb-1.5 block">
                  Type de réduction
                </label>
                <div className="flex rounded-xl overflow-hidden border border-border">
                  {["PERCENT", "FIXED"].map(t => (
                    <button key={t} type="button"
                      onClick={() => setForm(f => ({ ...f, type: t as any }))}
                      className={`flex-1 py-2.5 text-sm font-semibold font-poppins transition-colors ${
                        form.type === t
                          ? "bg-primary text-white"
                          : "bg-white text-muted-foreground hover:bg-muted"
                      }`}>
                      {t === "PERCENT" ? "% Pourcentage" : "FCFA Fixe"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label={form.type === "PERCENT" ? `Valeur (max ${maxDiscount}%)` : "Montant (FCFA)"}
                type="number" min={1} max={form.type === "PERCENT" ? maxDiscount : undefined}
                placeholder={form.type === "PERCENT" ? "15" : "2000"}
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                required />
              <Input label="Montant min. commande (FCFA)" type="number" min={0}
                placeholder="0 = aucun minimum"
                value={form.minOrderAmount}
                onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} />
              <Input label="Limite d'utilisation" type="number" min={1}
                placeholder="Vide = illimité"
                value={form.usageLimit}
                onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} />
            </div>
            <Input label="Date d'expiration" type="datetime-local"
              value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>
                Annuler
              </Button>
              <Button type="submit" isLoading={saving} loadingText="Création…">
                Créer le coupon
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons list */}
      {coupons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border">
          <div className="text-4xl mb-3">🏷️</div>
          <p className="font-poppins font-bold text-lg text-foreground mb-2">Aucun coupon</p>
          <p className="text-sm text-muted-foreground font-inter mb-4">
            Créez des codes promo pour attirer plus de clients.
          </p>
          {canCreate && (
            <Button leftIcon={<Plus size={15} />} onClick={() => setShowForm(true)}>
              Créer mon premier coupon
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map(coupon => {
            const expired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
            return (
              <div key={coupon.id}
                className="bg-white rounded-2xl border border-border p-4 flex items-center gap-4">
                {/* Code */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className="inline-flex items-center gap-1.5 font-mono font-bold text-sm bg-muted px-3 py-1 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                      {coupon.code}
                      {copied === coupon.code
                        ? <Check size={12} className="text-success" />
                        : <Copy size={12} />
                      }
                    </button>
                    <Badge variant={!coupon.isActive || expired ? "muted" : "success"} size="xs">
                      {expired ? "Expiré" : coupon.isActive ? "Actif" : "Inactif"}
                    </Badge>
                    <Badge variant="default" size="xs">
                      {coupon.type === "PERCENT"
                        ? `-${coupon.value}%`
                        : `-${formatPrice(coupon.value)}`}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground font-inter flex-wrap">
                    <span>{coupon.usedCount} utilisation{coupon.usedCount !== 1 ? "s" : ""}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</span>
                    {coupon.minOrderAmount && coupon.minOrderAmount > 0 && (
                      <span>Min. {formatPrice(coupon.minOrderAmount)}</span>
                    )}
                    {coupon.expiresAt && (
                      <span>Expire le {new Date(coupon.expiresAt).toLocaleDateString("fr-CM")}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(coupon.id, coupon.isActive)}
                    className="text-muted-foreground hover:text-primary transition-colors">
                    {coupon.isActive
                      ? <ToggleRight size={22} className="text-success" />
                      : <ToggleLeft size={22} />}
                  </button>
                  <button onClick={() => deleteCoupon(coupon.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-error/10 text-error hover:bg-error/20 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
