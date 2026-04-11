"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Upload, X, ImageIcon } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing/client"; // ← votre hook UploadThing

interface Category {
  id: string; name: string; slug: string; icon: string | null;
  color: string | null; image: string | null;
  order: number; isActive: boolean; isFeatured: boolean;
}

const EMPTY: Partial<Category> = {
  name: "", slug: "", icon: "Package", color: "#F6861A",
  image: null, order: 0, isActive: true, isFeatured: false,
};

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Composant upload image catégorie ─────────────────────────────────────────
function CategoryImageUpload({
                               value,
                               onChange,
                             }: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState<string | null>(value);

  const { startUpload } = useUploadThing("categoryImage", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.url ?? null;
      if (url) {
        setPreview(url);
        onChange(url);
      }
      setUploading(false);
    },
    onUploadError: (err) => {
      console.error("[upload category image]", err);
      setUploading(false);
    },
  });

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // Préview local immédiat
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    // Upload UploadThing
    await startUpload([file]);
    e.target.value = ""; // reset input
  }, [startUpload]);

  const remove = () => {
    setPreview(null);
    onChange(null);
  };

  return (
      <div>
        <label className="block text-xs font-bold font-poppins mb-1.5"
               style={{ color:"rgba(232,234,240,0.4)" }}>
          Image de la catégorie
        </label>

        {preview ? (
            <div className="relative w-full h-28 rounded-xl overflow-hidden group"
                 style={{ border:"1px solid var(--adm-border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-poppins text-white"
                       style={{ background:"rgba(155,127,255,0.7)" }}>
                  {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                  Changer
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
                </label>
                <button onClick={remove}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-poppins text-white"
                        style={{ background:"rgba(248,113,113,0.7)" }}>
                  <X size={11} /> Supprimer
                </button>
              </div>
              {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-white" />
                  </div>
              )}
            </div>
        ) : (
            <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl cursor-pointer transition-all hover:bg-white/3"
                   style={{ border:"2px dashed rgba(255,255,255,0.1)" }}>
              {uploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin mb-2" style={{ color:"rgba(232,234,240,0.4)" }} />
                    <span className="text-xs font-inter" style={{ color:"rgba(232,234,240,0.3)" }}>Upload en cours…</span>
                  </>
              ) : (
                  <>
                    <ImageIcon size={22} className="mb-2" style={{ color:"rgba(232,234,240,0.3)" }} />
                    <span className="text-xs font-inter" style={{ color:"rgba(232,234,240,0.4)" }}>
                Cliquez pour uploader
              </span>
                    <span className="text-[10px] font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.2)" }}>
                JPG, PNG, WEBP · max 2 MB
              </span>
                  </>
              )}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
            </label>
        )}
      </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function AdminCategoriesPage() {
  const [cats,    setCats]    = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [adding,  setAdding]  = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState<Partial<Category>>(EMPTY);

  const load = async () => {
    const res = await fetch("/api/admin/categories");
    if (res.ok) setCats(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (c: Category) => { setEditing(c); setForm(c); setAdding(false); };
  const openAdd  = () => { setEditing(null); setForm(EMPTY); setAdding(true); };
  const closeModal = () => { setEditing(null); setAdding(false); setForm(EMPTY); };

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      if (adding) {
        const res = await fetch("/api/admin/categories", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, slug: form.slug || slugify(form.name!) }),
        });
        if (res.ok) {
          const c = await res.json();
          setCats(p => [...p, c].sort((a, b) => a.order - b.order));
        }
      } else if (editing) {
        const res = await fetch(`/api/admin/categories/${editing.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setCats(p => p.map(c => c.id === editing.id ? { ...c, ...form } as Category : c));
        }
      }
      closeModal();
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setCats(p => p.filter(c => c.id !== id));
  };

  const toggleActive = async (c: Category) => {
    await fetch(`/api/admin/categories/${c.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    setCats(p => p.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
  };

  return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-poppins font-black text-2xl text-white">Catégories</h1>
            <p className="text-sm font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>
              {cats.length} catégorie{cats.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={openAdd}
                  className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold font-poppins text-white"
                  style={{ background:"linear-gradient(135deg,#7c5cfc,#9b7fff)", boxShadow:"0 0 16px rgba(124,92,252,0.3)" }}>
            <Plus size={15} /> Nouvelle catégorie
          </button>
        </div>

        {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-[#9b7fff]" />
            </div>
        ) : (
            /* ── Grid des catégories ── */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {cats.sort((a, b) => a.order - b.order).map(cat => (
                  <div key={cat.id}
                       className="rounded-2xl overflow-hidden group"
                       style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}>
                    {/* Image */}
                    <div className="relative h-28 overflow-hidden"
                         style={{ background: cat.color ? `${cat.color}20` : "rgba(255,255,255,0.04)" }}>
                      {cat.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cat.image} alt={cat.name}
                               className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={32} style={{ color: cat.color ?? "rgba(255,255,255,0.2)" }} />
                          </div>
                      )}
                      {/* Hover actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(cat)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background:"rgba(124,92,252,0.8)" }}>
                          <Pencil size={13} className="text-white" />
                        </button>
                        <button onClick={() => toggleActive(cat)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background:"rgba(34,211,165,0.8)" }}>
                          {cat.isActive ? <EyeOff size={13} className="text-white" /> : <Eye size={13} className="text-white" />}
                        </button>
                        <button onClick={() => remove(cat.id)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background:"rgba(248,113,113,0.8)" }}>
                          <Trash2 size={13} className="text-white" />
                        </button>
                      </div>
                      {/* Badge inactif */}
                      {!cat.isActive && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[9px] font-bold font-poppins"
                               style={{ background:"rgba(248,113,113,0.8)", color:"white" }}>
                            Inactif
                          </div>
                      )}
                      {cat.isFeatured && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[9px] font-bold font-poppins"
                               style={{ background:"rgba(251,191,36,0.8)", color:"#1a1a1a" }}>
                            Vedette
                          </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <p className="font-poppins font-bold text-sm text-white truncate">{cat.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] font-mono" style={{ color:"rgba(232,234,240,0.35)" }}>
                          {cat.slug}
                        </p>
                        <div className="w-3 h-3 rounded-full" style={{ background: cat.color ?? "#888" }} />
                      </div>
                    </div>
                  </div>
              ))}

              {/* Carte "Ajouter" */}
              <button onClick={openAdd}
                      className="rounded-2xl h-44 flex flex-col items-center justify-center gap-2 transition-all hover:bg-white/3"
                      style={{ border:"2px dashed rgba(124,92,252,0.3)" }}>
                <Plus size={22} style={{ color:"rgba(124,92,252,0.5)" }} />
                <span className="text-xs font-poppins font-bold" style={{ color:"rgba(124,92,252,0.5)" }}>
              Ajouter
            </span>
              </button>
            </div>
        )}

        {/* ── Modal ajout / édition ── */}
        {(adding || editing) && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
                   style={{ background:"var(--adm-surface2)", border:"1px solid var(--adm-border2)" }}>
                <h3 className="font-poppins font-bold text-lg text-white">
                  {adding ? "Nouvelle catégorie" : "Modifier la catégorie"}
                </h3>

                {/* Upload image */}
                <CategoryImageUpload
                    value={form.image ?? null}
                    onChange={url => setForm(f => ({ ...f, image: url }))}
                />

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key:"name",  label:"Nom",           placeholder:"Électronique" },
                    { key:"slug",  label:"Slug",          placeholder:"electronique" },
                    { key:"icon",  label:"Icône Lucide",  placeholder:"Laptop" },
                    { key:"color", label:"Couleur hex",   placeholder:"#3B82F6" },
                    { key:"order", label:"Ordre",         placeholder:"0", type:"number" },
                  ].map(({ key, label, placeholder, type }) => (
                      <div key={key}>
                        <label className="block text-xs font-bold font-poppins mb-1.5"
                               style={{ color:"rgba(232,234,240,0.4)" }}>{label}</label>
                        <input
                            type={type ?? "text"}
                            value={(form as any)[key] ?? ""}
                            onChange={e => setForm(p => ({
                              ...p,
                              [key]: type === "number" ? Number(e.target.value) : e.target.value,
                              ...(key === "name" && !editing ? { slug: slugify(e.target.value) } : {}),
                            }))}
                            placeholder={placeholder}
                            className="w-full h-9 px-3 rounded-xl text-sm font-inter text-white focus:outline-none"
                            style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)" }}
                        />
                      </div>
                  ))}
                </div>

                {/* Aperçu couleur */}
                {form.color && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg border border-white/10"
                           style={{ background: form.color }} />
                      <span className="text-xs font-mono" style={{ color:"rgba(232,234,240,0.5)" }}>
                  {form.color}
                </span>
                    </div>
                )}

                <div className="flex items-center gap-4">
                  {[
                    { key:"isActive",   label:"Active" },
                    { key:"isFeatured", label:"Vedette (accueil)" },
                  ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox"
                               checked={!!(form as any)[key]}
                               onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))}
                               className="w-4 h-4 rounded" />
                        <span className="text-xs font-inter text-white/70">{label}</span>
                      </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={closeModal}
                          className="flex-1 h-10 rounded-xl text-sm font-semibold font-poppins"
                          style={{ background:"var(--adm-surface)", border:"1px solid var(--adm-border)", color:"rgba(232,234,240,0.6)" }}>
                    Annuler
                  </button>
                  <button onClick={save} disabled={saving || !form.name}
                          className="flex-1 h-10 rounded-xl text-sm font-bold font-poppins text-white flex items-center justify-center gap-2 disabled:opacity-50"
                          style={{ background:"linear-gradient(135deg,#7c5cfc,#9b7fff)" }}>
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}