"use client";

import { useState } from "react";
import { Plus, Zap, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils/cn";

interface Sale {
  id: string; productId: string; productName: string | null;
  discountPercent: number; originalPrice: number; flashPrice: number;
  stock: number; sold: number; startAt: string; endAt: string; isActive: boolean;
}
interface Product { id: string; name: string; basePrice: number; stock: number; }

interface Props {
  vendorId:   string;
  sales:      Sale[];
  products:   Product[];
  maxPerDay:  number;
  planName:   string;
}

const EMPTY = {
  productId: "", discountPercent: "30",
  stock: "5", durationHours: "24",
};

export function VendorFlashSalesClient({ vendorId, sales: initial, products, maxPerDay, planName }: Props) {
  const [sales,    setSales]    = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [form,     setForm]     = useState(EMPTY);

  const canCreate = maxPerDay > 0;

  // Count active sales today
  const today      = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.startAt).toDateString() === today);
  const limitReached = maxPerDay > 0 && todaySales.length >= maxPerDay;

  const selectedProduct = products.find(p => p.id === form.productId);
  const flashPrice = selectedProduct
    ? Math.round(selectedProduct.basePrice * (1 - Number(form.discountPercent) / 100))
    : 0;

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.productId) { setError("Sélectionnez un produit."); return; }
    if (!selectedProduct) return;
    setSaving(true);
    try {
      const startAt = new Date();
      const endAt   = new Date(startAt.getTime() + Number(form.durationHours) * 3600 * 1000);

      const res = await fetch("/api/vendor/flash-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          productId:       form.productId,
          discountPercent: Number(form.discountPercent),
          originalPrice:   selectedProduct.basePrice,
          flashPrice,
          stock:           Number(form.stock),
          startAt:         startAt.toISOString(),
          endAt:           endAt.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur."); return; }
      setSales(prev => [{ ...data, productName: selectedProduct.name }, ...prev]);
      setShowForm(false);
      setForm(EMPTY);
    } catch { setError("Erreur réseau."); }
    finally { setSaving(false); }
  };

  const deleteSale = async (id: string) => {
    try {
      await fetch(`/api/vendor/flash-sales/${id}`, { method: "DELETE" });
      setSales(prev => prev.filter(s => s.id !== id));
    } catch {}
  };

  const getSaleStatus = (sale: Sale) => {
    const now  = new Date();
    const end  = new Date(sale.endAt);
    const start= new Date(sale.startAt);
    if (!sale.isActive || now > end) return "ended";
    if (now < start) return "scheduled";
    return "active";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-poppins font-black text-2xl text-foreground flex items-center gap-2">
            <Zap size={22} className="text-primary" /> Ventes Flash
          </h1>
          <p className="text-sm text-muted-foreground font-inter mt-0.5">
            {canCreate
              ? `${todaySales.length}/${maxPerDay} flash aujourd'hui`
              : `Plan ${planName} — flash sales non disponibles`}
          </p>
        </div>
        {canCreate && !limitReached ? (
          <Button leftIcon={<Plus size={15} />} onClick={() => setShowForm(s => !s)}>
            Nouvelle flash sale
          </Button>
        ) : canCreate && limitReached ? (
          <Badge variant="warning">Limite journalière atteinte</Badge>
        ) : (
          <Badge variant="muted">Upgrade requis</Badge>
        )}
      </div>

      {!canCreate && (
        <Alert variant="warning">
          Les ventes flash nécessitent un plan <strong>Pro</strong> ou <strong>Elite</strong>.{" "}
          <a href="/vendor/subscription" className="underline font-semibold">Voir les plans →</a>
        </Alert>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-primary p-6">
          <h2 className="font-poppins font-bold text-lg text-foreground mb-4">Créer une vente flash</h2>
          {error && <Alert variant="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}
          <form onSubmit={create} className="space-y-4">
            <div>
              <label className="text-sm font-semibold font-poppins text-foreground mb-1.5 block">
                Produit *
              </label>
              <select
                value={form.productId}
                onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl border border-border bg-white text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required>
                <option value="">Choisir un produit publié…</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatPrice(p.basePrice)} (stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="Réduction (%)" type="number" min={5} max={70}
                value={form.discountPercent}
                onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
                hint={selectedProduct ? `Prix flash : ${formatPrice(flashPrice)}` : ""} />
              <Input label="Stock flash" type="number" min={1}
                max={selectedProduct?.stock ?? 9999}
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                hint="Articles max pour cette vente" />
              <div>
                <label className="text-sm font-semibold font-poppins text-foreground mb-1.5 block">
                  Durée
                </label>
                <select
                  value={form.durationHours}
                  onChange={e => setForm(f => ({ ...f, durationHours: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-white text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="1">1 heure</option>
                  <option value="2">2 heures</option>
                  <option value="6">6 heures</option>
                  <option value="12">12 heures</option>
                  <option value="24">24 heures</option>
                  <option value="48">48 heures</option>
                </select>
              </div>
            </div>

            {selectedProduct && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-poppins font-semibold text-sm text-foreground">{selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground font-inter">
                    Prix normal : {formatPrice(selectedProduct.basePrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-poppins font-black text-xl text-primary">{formatPrice(flashPrice)}</p>
                  <Badge variant="solid" size="xs">-{form.discountPercent}%</Badge>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setForm(EMPTY); }}>
                Annuler
              </Button>
              <Button type="submit" isLoading={saving} leftIcon={<Zap size={15} />}>
                Lancer la flash sale
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Sales list */}
      {sales.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border">
          <div className="text-4xl mb-3">⚡</div>
          <p className="font-poppins font-bold text-lg text-foreground mb-2">Aucune vente flash</p>
          <p className="text-sm text-muted-foreground font-inter mb-4">
            Créez des ventes flash pour attirer rapidement des acheteurs.
          </p>
          {canCreate && !limitReached && (
            <Button leftIcon={<Zap size={15} />} onClick={() => setShowForm(true)}>
              Créer une vente flash
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map(sale => {
            const status = getSaleStatus(sale);
            const endDate= new Date(sale.endAt);
            const remaining = Math.max(0, endDate.getTime() - Date.now());
            const hours     = Math.floor(remaining / 3600000);
            const minutes   = Math.floor((remaining % 3600000) / 60000);

            return (
              <div key={sale.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  status === "active"    ? "bg-red-500/10"    :
                  status === "scheduled" ? "bg-primary/10"    : "bg-muted"
                )}>
                  <Zap size={18} className={
                    status === "active"    ? "text-red-500"  :
                    status === "scheduled" ? "text-primary"  : "text-muted-foreground"
                  } />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-poppins font-semibold text-sm text-foreground truncate">
                      {sale.productName}
                    </p>
                    <Badge
                      variant={status === "active" ? "error" : status === "scheduled" ? "default" : "muted"}
                      size="xs" dot={status === "active"}>
                      {status === "active" ? "En cours" : status === "scheduled" ? "Programmée" : "Terminée"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-inter mt-0.5 flex-wrap">
                    <span className="text-primary font-semibold">-{sale.discountPercent}% → {formatPrice(sale.flashPrice)}</span>
                    <span>{sale.sold}/{sale.stock} vendus</span>
                    {status === "active" && <span className="flex items-center gap-1"><Clock size={10} /> {hours}h {minutes}min restantes</span>}
                    {status !== "active" && <span>Fin : {endDate.toLocaleDateString("fr-CM", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}</span>}
                  </div>
                </div>

                {status === "ended" && (
                  <button onClick={() => deleteSale(sale.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-error/10 text-error hover:bg-error/20 transition-colors shrink-0">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
