"use client";

import { useState, useEffect } from "react";
import { Plus, Briefcase, Users, Loader2, Eye, EyeOff, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const TYPES = ["STAGE","CDI","CDD","INTERIM","FREELANCE"];
const EMPTY = { title:"", description:"", type:"CDI", location:"", salary:"", deadline:"" };

interface Listing { id:string; title:string; type:string; location:string|null; salary:string|null; deadline:string|null; isActive:boolean; createdAt:string; applicationsCount:number; }

export function VendorJobsClient() {
  const [listings,  setListings]  = useState<Listing[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [expanded,  setExpanded]  = useState<string|null>(null);

  const load = () => fetch("/api/vendor/jobs").then(r=>r.json()).then(data => { setListings(Array.isArray(data)?data:[]); setLoading(false); });
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/vendor/jobs", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    if (res.ok) { const d = await res.json(); setListings(p => [{ ...d, applicationsCount:0 }, ...p]); setShowForm(false); setForm(EMPTY); }
    setSaving(false);
  };

  const toggle = async (id: string, isActive: boolean) => {
    await fetch(`/api/vendor/jobs/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ isActive: !isActive }) });
    setListings(p => p.map(l => l.id===id ? {...l, isActive:!l.isActive} : l));
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette offre ?")) return;
    await fetch(`/api/vendor/jobs/${id}`, { method:"DELETE" });
    setListings(p => p.filter(l => l.id!==id));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-poppins font-black text-2xl text-foreground">Offres d'emploi</h1>
          <p className="text-sm text-muted-foreground font-inter mt-0.5">{listings.length} offre{listings.length!==1?"s":""}</p>
        </div>
        <button onClick={() => setShowForm(s=>!s)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold font-poppins text-white"
          style={{ background:"linear-gradient(135deg,#F6861A,#E5750D)" }}>
          <Plus size={15}/> Nouvelle offre
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-cream-50 rounded-2xl border border-border p-5 space-y-4">
          <h3 className="font-poppins font-bold text-base text-foreground">Créer une offre</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold font-poppins text-muted-foreground mb-1">Titre *</label>
              <input required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Assistant commercial" className="w-full h-10 px-3 rounded-xl border border-border bg-white text-sm font-inter text-foreground focus:outline-none"/>
            </div>
            <div>
              <label className="block text-xs font-semibold font-poppins text-muted-foreground mb-1">Type *</label>
              <select required value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="w-full h-10 px-3 rounded-xl border border-border bg-white text-sm font-inter text-foreground focus:outline-none">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold font-poppins text-muted-foreground mb-1">Localisation</label>
              <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="Douala, Akwa" className="w-full h-10 px-3 rounded-xl border border-border bg-white text-sm font-inter text-foreground focus:outline-none"/>
            </div>
            <div>
              <label className="block text-xs font-semibold font-poppins text-muted-foreground mb-1">Salaire</label>
              <input value={form.salary} onChange={e=>setForm(f=>({...f,salary:e.target.value}))} placeholder="80 000 - 120 000 FCFA" className="w-full h-10 px-3 rounded-xl border border-border bg-white text-sm font-inter text-foreground focus:outline-none"/>
            </div>
            <div>
              <label className="block text-xs font-semibold font-poppins text-muted-foreground mb-1">Date limite</label>
              <input type="date" value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))} className="w-full h-10 px-3 rounded-xl border border-border bg-white text-sm font-inter text-foreground focus:outline-none"/>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold font-poppins text-muted-foreground mb-1">Description *</label>
              <textarea required value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={4} placeholder="Décrivez le poste, les missions, le profil recherché…" className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm font-inter text-foreground focus:outline-none resize-none"/>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-10 rounded-xl text-sm font-semibold font-poppins border border-border text-muted-foreground">Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 h-10 rounded-xl text-sm font-bold font-poppins text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{background:"linear-gradient(135deg,#F6861A,#E5750D)"}}>
              {saving ? <Loader2 size={13} className="animate-spin"/> : <Plus size={13}/>} Publier
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10"><Loader2 size={22} className="animate-spin text-primary"/></div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-border">
          <Briefcase size={32} className="text-muted-foreground/30 mx-auto mb-3"/>
          <p className="font-poppins font-bold text-foreground">Aucune offre publiée</p>
          <p className="text-sm text-muted-foreground font-inter mt-1">Créez votre première offre d'emploi pour recruter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(l => (
            <div key={l.id} className="bg-white rounded-2xl border border-border overflow-hidden">
              <button className="w-full flex items-center gap-3 px-5 py-4 text-left" onClick={() => setExpanded(expanded===l.id ? null : l.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-poppins font-bold text-sm text-foreground">{l.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-poppins ${l.isActive ? "bg-green-50 text-green-700" : "bg-cream-200 text-muted-foreground"}`}>
                      {l.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-inter mt-0.5">
                    {l.type} {l.location ? `· ${l.location}` : ""} · <span className="font-semibold text-primary">{l.applicationsCount} candidature{l.applicationsCount!==1?"s":""}</span>
                  </p>
                </div>
                {expanded===l.id ? <ChevronUp size={14} className="text-muted-foreground shrink-0"/> : <ChevronDown size={14} className="text-muted-foreground shrink-0"/>}
              </button>
              {expanded===l.id && (
                <div className="px-5 pb-4 border-t border-border pt-3 flex gap-2">
                  <button onClick={() => toggle(l.id, l.isActive)} className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold font-poppins border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    {l.isActive ? <EyeOff size={12}/> : <Eye size={12}/>} {l.isActive ? "Désactiver" : "Activer"}
                  </button>
                  <button onClick={() => remove(l.id)} className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold font-poppins border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={12}/> Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
