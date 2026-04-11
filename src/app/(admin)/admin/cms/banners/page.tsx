"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react";
import type { PromoBanner } from "@/lib/db/schema";

export default function AdminBannersPage() {
  const [banners,  setBanners]  = useState<PromoBanner[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState<PromoBanner | null>(null);
  const [adding,   setAdding]   = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState<Partial<PromoBanner>>({});

  // ✅ FIX: load banners from DB
  const loadBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) setBanners(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadBanners(); }, []);

  const openEdit = (b: PromoBanner) => { setEditing(b); setForm(b); setAdding(false); };
  const openAdd  = () => {
    setEditing(null);
    setForm({ bgColor: "from-ink-900 to-ink-700", accentColor: "#F6861A" });
    setAdding(true);
  };

  // ✅ FIX: persist save to DB
  const save = async () => {
    if (!form.title || !form.cta || !form.ctaHref) return;
    setSaving(true);
    try {
      if (adding) {
        const res = await fetch("/api/admin/banners", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(form),
        });
        if (res.ok) {
          const newBanner = await res.json();
          setBanners(prev => [...prev, newBanner]);
        }
      } else if (editing) {
        const res = await fetch(`/api/admin/banners/${editing.id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(form),
        });
        if (res.ok) {
          setBanners(prev => prev.map(b => b.id === editing.id ? { ...b, ...form } as PromoBanner : b));
        }
      }
    } catch {}
    finally {
      setSaving(false);
      setEditing(null);
      setAdding(false);
      setForm({});
    }
  };

  // ✅ FIX: persist delete to DB
  const remove = async (id: string) => {
    try {
      await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-poppins font-black text-2xl text-white">Bannières publicitaires</h1>
          <p className="text-sm font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.4)" }}>
            Gérez les bannières du carousel de la page d'accueil
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold font-poppins text-white"
          style={{ background: "linear-gradient(135deg,#7c5cfc,#9b7fff)", boxShadow:"0 0 16px rgba(124,92,252,0.3)" }}>
          <Plus size={15} /> Nouvelle bannière
        </button>
      </div>

      {/* Banners list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#9b7fff]" />
        </div>
      ) : (
        <div className="space-y-3">
          {banners.length === 0 && (
            <div className="text-center py-12 rounded-2xl"
              style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}>
              <p className="text-sm font-inter" style={{ color: "rgba(232,234,240,0.3)" }}>Aucune bannière</p>
            </div>
          )}
          {banners.map(banner => (
            <div key={banner.id} className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}>
              <GripVertical size={16} style={{ color: "rgba(232,234,240,0.2)" }} className="cursor-grab shrink-0" />

              {/* Preview */}
              <div className={`w-24 h-14 rounded-xl bg-gradient-to-r ${banner.bgColor} flex items-center justify-center shrink-0 overflow-hidden`}>
                {banner.image
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={banner.image} alt="" className="w-full h-full object-cover opacity-50" />
                  : <span className="text-xs font-bold text-white/60 font-poppins text-center px-1">{banner.badge}</span>
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-poppins font-bold text-sm text-white truncate">{banner.title}</p>
                <p className="text-xs font-inter truncate mt-0.5" style={{ color: "rgba(232,234,240,0.4)" }}>
                  {banner.subtitle}
                </p>
                <p className="text-xs font-inter mt-1" style={{ color: "rgba(232,234,240,0.25)" }}>
                  CTA: <span className="text-[#9b7fff]">"{banner.cta}"</span> → {banner.ctaHref}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(banner)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(124,92,252,0.12)", color: "#9b7fff" }}>
                  <Pencil size={13} />
                </button>
                <button onClick={() => remove(banner.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(248,113,113,0.12)", color: "#f87171" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add modal */}
      {(editing || adding) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4"
            style={{ background: "var(--adm-surface2)", border: "1px solid var(--adm-border2)" }}>
            <h3 className="font-poppins font-bold text-lg text-white">
              {adding ? "Nouvelle bannière" : "Modifier la bannière"}
            </h3>

            {[
              { key:"title",       label:"Titre",           placeholder:"Ex: Ventes Flash d'été 🌞" },
              { key:"subtitle",    label:"Sous-titre",      placeholder:"Description courte" },
              { key:"cta",         label:"Texte du bouton", placeholder:"Profiter maintenant" },
              { key:"ctaHref",     label:"Lien du bouton",  placeholder:"/flash-sales" },
              { key:"badge",       label:"Badge",           placeholder:"⚡ FLASH" },
              { key:"image",       label:"Image URL",       placeholder:"https://..." },
              { key:"bgColor",     label:"Gradient Tailwind",placeholder:"from-orange-600 to-red-600" },
              { key:"accentColor", label:"Couleur accent",  placeholder:"#FFD700" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold font-poppins mb-1.5"
                  style={{ color: "rgba(232,234,240,0.5)" }}>
                  {label}
                </label>
                <input
                  value={(form as any)[key] ?? ""}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full h-10 px-3 rounded-xl text-sm font-inter text-white placeholder:text-white/20 focus:outline-none focus:border-[#7c5cfc] transition-colors"
                  style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}
                />
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button onClick={() => { setEditing(null); setAdding(false); setForm({}); }}
                className="flex-1 h-10 rounded-xl text-sm font-semibold font-poppins transition-colors"
                style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)", color: "rgba(232,234,240,0.6)" }}>
                Annuler
              </button>
              <button onClick={save} disabled={saving || !form.title || !form.cta || !form.ctaHref}
                className="flex-1 h-10 rounded-xl text-sm font-bold font-poppins text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#7c5cfc,#9b7fff)" }}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Sauvegarde…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
