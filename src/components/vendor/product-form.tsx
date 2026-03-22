"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { cn, slugify } from "@/lib/utils/cn";

interface Category { id: string; name: string; slug: string }

interface Props {
  vendorId:   string;
  categories: Category[];
  initial?:   any;
}

export function ProductForm({ vendorId, categories, initial }: Props) {
  const router  = useRouter();
  const isEdit  = !!initial;
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [success,setSuccess]= useState("");

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

  const handleNameChange = (value: string) => {
    setForm((f) => ({ ...f, name: value, ...(!isEdit && { slug: slugify(value) }) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!form.name || !form.basePrice || form.stock === "") {
      setError("Nom, prix et stock sont obligatoires.");
      return;
    }

    setSaving(true);
    try {
      const endpoint = isEdit ? `/api/vendor/products/${initial.id}` : "/api/vendor/products";
      const res = await fetch(endpoint, {
        method:  isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          vendorId,
          images,
          basePrice:    Number(form.basePrice),
          comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
          stock:        Number(form.stock),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur serveur."); return; }
      setSuccess(isEdit ? "Produit mis à jour !" : "Produit créé !");
      setTimeout(() => router.push("/vendor/products"), 900);
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  const catOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error   && <Alert variant="error"   onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Informations générales */}
      <Card>
        <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Nom du produit" placeholder="Ex: Samsung Galaxy A54"
            value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Slug (URL)" placeholder="samsung-galaxy-a54"
              value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              hint={`bee.cm/products/${form.slug || "slug"}`} />
            <Select label="Catégorie" options={catOptions} placeholder="Choisir une catégorie"
              value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} />
          </div>
          <Input label="Description courte" placeholder="Résumé en une phrase"
            value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} />
          <Textarea label="Description complète" placeholder="Décrivez votre produit en détail…"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
        </CardContent>
      </Card>

      {/* Prix & stock */}
      <Card>
        <CardHeader><CardTitle>Prix et stock</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Prix (FCFA)" type="number" placeholder="25000"
              value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
              required min={0} />
            <Input label="Prix barré (FCFA)" type="number" placeholder="30000"
              value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
              hint="Prix avant réduction" />
            <Input label="Stock" type="number" placeholder="10"
              value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required min={0} />
          </div>
          <Input label="SKU (référence)" placeholder="SKU-001"
            value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </CardContent>
      </Card>

      {/* Photos produit */}
      <Card>
        <CardHeader><CardTitle>Photos du produit</CardTitle></CardHeader>
        <CardContent>
          <ImageUpload
            endpoint="productImages"
            value={images}
            onChange={(urls) => setImages(urls as string[])}
            multiple
            maxFiles={5}
            hint="Glissez-déposez, prenez en photo ou importez depuis votre galerie. Max 2 Mo / image, 5 photos max."
          />
        </CardContent>
      </Card>

      {/* Statut */}
      <Card>
        <CardHeader><CardTitle>Statut de publication</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "DRAFT",     label: "Brouillon",  desc: "Non visible sur la boutique"  },
              { value: "PUBLISHED", label: "Publié",     desc: "Visible et disponible à l'achat" },
            ].map((opt) => (
              <button key={opt.value} type="button"
                onClick={() => setForm({ ...form, status: opt.value })}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all",
                  form.status === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border-strong"
                )}>
                <p className="font-poppins font-semibold text-sm text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground font-inter mt-0.5">{opt.desc}</p>
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
        <Button type="submit" isLoading={saving} className="flex-1">
          {isEdit ? "Mettre à jour" : "Créer le produit"}
        </Button>
      </div>
    </form>
  );
}
