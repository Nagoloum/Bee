"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase, MapPin, Clock, Search, Loader2,
  ChevronRight, X, Send, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TYPE_LABELS: Record<string, string> = {
  STAGE:     "Stage",
  CDI:       "CDI",
  CDD:       "CDD",
  INTERIM:   "Intérim",
  FREELANCE: "Freelance",
};

const TYPE_COLORS: Record<string, string> = {
  STAGE:     "bg-blue-50 text-blue-700",
  CDI:       "bg-green-50 text-green-700",
  CDD:       "bg-orange-50 text-orange-700",
  INTERIM:   "bg-purple-50 text-purple-700",
  FREELANCE: "bg-pink-50 text-pink-700",
};

interface Job {
  id: string; title: string; description: string; type: string;
  location: string | null; salary: string | null; deadline: string | null;
  createdAt: string; shopName: string | null; shopLogo: string | null;
  shopSlug: string | null; region: string | null;
}

function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [message, setMessage]   = useState("");
  const [saving,  setSaving]    = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error,   setError]     = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/jobs", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ jobId: job.id, message }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Erreur."); setSaving(false); return; }
    setSuccess(true);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-poppins font-bold text-lg text-foreground">Postuler</h3>
            <p className="text-sm text-muted-foreground font-inter mt-0.5">{job.title} · {job.shopName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground mt-1">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl">✅</div>
            <p className="font-poppins font-bold text-foreground">Candidature envoyée !</p>
            <p className="text-sm text-muted-foreground font-inter">
              {job.shopName} recevra votre candidature et vous contactera.
            </p>
            <button onClick={onClose}
              className="mt-2 text-primary font-semibold text-sm font-poppins hover:underline">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && <p className="text-xs text-red-600 font-inter">{error}</p>}
            <div>
              <label className="block text-sm font-semibold font-poppins text-foreground mb-1.5">
                Message de motivation
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Présentez-vous et expliquez pourquoi vous êtes le bon candidat…"
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-border bg-cream-50 text-sm font-inter text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="flex-1 h-10 rounded-xl text-sm font-semibold font-poppins border border-border text-muted-foreground">
                Annuler
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 h-10 rounded-xl text-sm font-bold font-poppins text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background:"linear-gradient(135deg,#F6861A,#E5750D)" }}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Envoyer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [jobs,      setJobs]      = useState<Job[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [typeFilter,setTypeFilter]= useState("all");
  const [applying,  setApplying]  = useState<Job | null>(null);

  useEffect(() => {
    fetch("/api/jobs")
      .then(r => r.json())
      .then(data => setJobs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    const matchSearch = !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.shopName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || j.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-background">
      {applying && <ApplyModal job={applying} onClose={() => setApplying(null)} />}

      {/* Hero */}
      <div className="bg-ink-900 py-12">
        <div className="container-bee text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-semibold font-poppins mb-4">
            💼 Offres d'emploi BEE
          </div>
          <h1 className="font-poppins font-black text-3xl md:text-4xl text-white mb-3">
            Rejoignez les boutiques BEE
          </h1>
          <p className="text-white/60 font-inter text-base max-w-xl mx-auto">
            Les meilleurs vendeurs du Cameroun recrutent. Trouvez votre prochain emploi.
          </p>

          {/* Searchbar */}
          <div className="mt-6 flex gap-3 max-w-lg mx-auto">
            <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl px-4 h-12 border border-border">
              <Search size={16} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Poste, boutique…"
                className="flex-1 text-sm font-inter text-foreground focus:outline-none bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-bee py-8 space-y-6">
        {/* Filtres type */}
        <div className="flex gap-2 flex-wrap">
          {[{ key:"all", label:"Tout" }, ...Object.entries(TYPE_LABELS).map(([k,v]) => ({ key:k, label:v }))].map(({ key, label }) => (
            <button key={key} onClick={() => setTypeFilter(key)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold font-poppins border transition-all",
                typeFilter === key
                  ? "bg-primary text-white border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary bg-white"
              )}>
              {label}
            </button>
          ))}
        </div>

        {/* Compteur */}
        <p className="text-sm font-inter text-muted-foreground">
          {filtered.length} offre{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Liste */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💼</div>
            <h3 className="font-poppins font-bold text-lg text-foreground mb-2">Aucune offre</h3>
            <p className="text-muted-foreground font-inter text-sm">
              {search ? "Essayez un autre mot-clé." : "Aucune offre disponible pour le moment."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(job => (
              <div key={job.id}
                className="bg-white rounded-2xl border border-border p-5 hover:shadow-soft-md transition-all flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {job.shopLogo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={job.shopLogo} alt={job.shopName ?? ""} className="w-full h-full object-cover" />
                      : <Briefcase size={18} className="text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-poppins font-bold text-base text-foreground line-clamp-1">
                      {job.title}
                    </h3>
                    <Link href={`/shops/${job.shopSlug}`}
                      className="text-xs font-inter text-primary hover:underline">
                      {job.shopName}
                    </Link>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg font-poppins shrink-0 ${TYPE_COLORS[job.type] ?? "bg-cream-100 text-foreground"}`}>
                    {TYPE_LABELS[job.type] ?? job.type}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm font-inter text-muted-foreground line-clamp-2">
                  {job.description}
                </p>

                {/* Méta */}
                <div className="flex flex-wrap gap-3 text-xs font-inter text-muted-foreground">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      💰 {job.salary}
                    </span>
                  )}
                  {job.deadline && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(job.deadline) < new Date()
                        ? <span className="text-red-500">Expiré</span>
                        : `Jusqu'au ${new Date(job.deadline).toLocaleDateString("fr-CM")}`}
                    </span>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={() => setApplying(job)}
                  disabled={!!job.deadline && new Date(job.deadline) < new Date()}
                  className="w-full h-10 rounded-xl text-sm font-bold font-poppins flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background:"linear-gradient(135deg,#F6861A,#E5750D)", color:"white" }}>
                  <Send size={13} /> Postuler maintenant
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
