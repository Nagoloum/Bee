"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { cn, slugify } from "@/lib/utils/cn";

interface Category { id: string; name: string; slug: string }
interface Variant  { id: string; label: string; price: string; stock: string }

interface Props {
  vendorId:   string;
  categories: Category[];
  initial?:   any; // existing product for edit mode
}

const STATUS_OPTIONS = [
  { value: "DRAFT",     label: "Brouillon — non visible" },
  { value: "PUBLISHED", label: "Publié — visible à l'achat" },
];

export function ProductForm({ vendorId, categories, initial }: Props) {
  const router  = useRouter();
  const isEdit  = !!initial;
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name:         initial?.name         ?? "",
    slug:         initial?.slug         ?? "",
    description:  initial?.description  ?? "",
    shortDesc:    initial?.shortDesc    ?? "",
    categoryId:   initial?.categoryId   ?? "",
    basePrice:    initial?.basePrice    ?? "",
    comparePrice: initial?.comparePrice ?? "",
    stock:        initial?.stock        ?? "",
    sku:          initial?.sku          ?? "",
    status:       initial?.status       ?? "DRAFT",
  });

  const [images, setImages] = useState<string[]>(
    Array.isArray(initial?.images) ? initial.images : []
  );

  // Variants
  const [variants, setVariants] = useState<Variant[]>(() => {
    if (!initial?.hasVariants) return [];
    // We store variant combinations as a simple flat list for MVP
    return [];
  });
  const [showVariants, setShowVariants] = useState(!!initial?.hasVariants);

  const handleNameChange = (value: string) => {
    setForm(f => ({ ...f, name: value, ...(!isEdit && { slug: slugify(value) }) }));
  };

  const addVariant = () => {
    setVariants(v => [...v, {
      id:    `v-${Date.now()}`,
      label: "",
      price: form.basePrice.toString(),
      stock: "1",
    }]);
  };

  const removeVariant = (id: string) => setVariants(v => v.filter(v2 => v2.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!form.name || !form.basePrice || form.stock === "") {
      setError("Nom, prix et stock sont obligatoires.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        ...form,
        vendorId,
        images,
        hasVariants:  variants.length > 0,
        basePrice:    Number(form.basePrice),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
        stock:        Number(form.stock),
        // Pass simplified variants for API
        variants: variants.map(v => ({
          label: v.label,
          price: Number(v.price) || Number(form.basePrice),
          stock: Number(v.stock) || 0,
        })),
      };

      const endpoint = isEdit
        ? `/api/vendor/products/${initial.id}`
        : "/api/vendor/products";

      const res = await fetch(endpoint, {
        method:  isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur serveur."); return; }

      setSuccess(isEdit ? "Produit mis à jour !" : "Produit créé avec succès !");
      setTimeout(() => router.push("/vendor/products"), 900);
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error   && <Alert variant="error"   onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Informations générales */}
      <Card>
        <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Nom du produit" placeholder="Ex: Samsung Galaxy A54"
            value={form.name} onChange={e => handleNameChange(e.target.value)} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Slug (URL)" placeholder="samsung-galaxy-a54"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
              hint={`bee.cm/products/${form.slug || "slug"}`} />
            <Select label="Catégorie" options={catOptions} placeholder="Choisir une catégorie"
              value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} />
          </div>
          <Input label="Description courte" placeholder="Résumé en une phrase"
            value={form.shortDesc}
            onChange={e => setForm(f => ({ ...f, shortDesc: e.target.value }))} />
          <Textarea label="Description complète" rows={4}
            placeholder="Décrivez votre produit en détail…"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </CardContent>
      </Card>

      {/* Prix & Stock */}
      <Card>
        <CardHeader><CardTitle>Prix et stock</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Prix (FCFA)" type="number" min={0} placeholder="25000"
              value={form.basePrice}
              onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} required />
            <Input label="Prix barré (FCFA)" type="number" min={0} placeholder="30000"
              value={form.comparePrice}
              onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))}
              hint="Prix avant réduction" />
            <Input label="Stock" type="number" min={0} placeholder="10"
              value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
          </div>
          <Input label="SKU (référence interne)" placeholder="SKU-001"
            value={form.sku}
            onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
        </CardContent>
      </Card>

      {/* Variantes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Variantes</CardTitle>
            <button type="button"
              onClick={() => setShowVariants(s => !s)}
              className={cn(
                "text-xs font-semibold font-poppins px-3 py-1.5 rounded-lg transition-colors",
                showVariants
                  ? "bg-error/10 text-error hover:bg-error/15"
                  : "bg-primary/10 text-primary hover:bg-primary/15"
              )}>
              {showVariants ? "Désactiver les variantes" : "Activer les variantes"}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {!showVariants ? (
            <p className="text-sm text-muted-foreground font-inter">
              Activez les variantes si votre produit existe en plusieurs versions (taille, couleur, etc.)
            </p>
          ) : (
            <div className="space-y-3">
              {variants.length === 0 && (
                <p className="text-sm text-muted-foreground font-inter">
                  Aucune variante ajoutée. Cliquez sur "Ajouter une variante" ci-dessous.
                </p>
              )}
              {variants.map((v, i) => (
                <div key={v.id} className="flex items-end gap-3 p-3 bg-muted/40 rounded-xl">
                  <Input
                    label={`Variante ${i + 1}`}
                    placeholder="Ex: Rouge L, Taille M…"
                    value={v.label}
                    onChange={e => setVariants(vs => vs.map(v2 => v2.id === v.id ? { ...v2, label: e.target.value } : v2))}
                    containerClassName="flex-1"
                  />
                  <Input
                    label="Prix"
                    type="number"
                    min={0}
                    value={v.price}
                    onChange={e => setVariants(vs => vs.map(v2 => v2.id === v.id ? { ...v2, price: e.target.value } : v2))}
                    containerClassName="w-28"
                  />
                  <Input
                    label="Stock"
                    type="number"
                    min={0}
                    value={v.stock}
                    onChange={e => setVariants(vs => vs.map(v2 => v2.id === v.id ? { ...v2, stock: e.target.value } : v2))}
                    containerClassName="w-20"
                  />
                  <button type="button"
                    onClick={() => removeVariant(v.id)}
                    className="h-11 w-10 flex items-center justify-center rounded-xl bg-error/10 text-error hover:bg-error/20 transition-colors shrink-0 mb-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" leftIcon={<Plus size={14} />}
                onClick={addVariant}>
                Ajouter une variante
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader><CardTitle>Photos du produit</CardTitle></CardHeader>
        <CardContent>
          <ImageUpload
            endpoint="productImages"
            value={images}
            onChange={urls => setImages(urls as string[])}
            multiple
            maxFiles={5}
            hint="Max 5 photos · 2 Mo max par image — glissez-déposez ou cliquez"
          />
        </CardContent>
      </Card>

      {/* Statut */}
      <Card>
        <CardHeader><CardTitle>Statut de publication</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {STATUS_OPTIONS.map(opt => (
              <button key={opt.value} type="button"
                onClick={() => setForm(f => ({ ...f, status: opt.value }))}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all",
                  form.status === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border-strong"
                )}>
                <p className="font-poppins font-semibold text-sm text-foreground">
                  {opt.value === "DRAFT" ? "Brouillon" : "Publié"}
                </p>
                <p className="text-xs text-muted-foreground font-inter mt-0.5">
                  {opt.value === "DRAFT" ? "Non visible sur la boutique" : "Visible et disponible à l'achat"}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pb-6">
        <Button type="button" variant="outline" onClick={() => router.push("/vendor/products")}>
          Annuler
        </Button>
        <Button type="submit" isLoading={saving} loadingText="Sauvegarde…" className="flex-1">
          {isEdit ? "Mettre à jour le produit" : "Créer le produit"}
        </Button>
      </div>
    </form>
  );
}
