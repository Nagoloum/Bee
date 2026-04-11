"use client";

import { useState, useCallback } from "react";
import { Camera, Upload, CheckCircle2, X, Loader2, AlertTriangle } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils/cn";

interface Props {
  orderId:  string;
  onSuccess: () => void;
  onCancel:  () => void;
}

export function DeliveryProofUpload({ orderId, onSuccess, onCancel }: Props) {
  const [preview,   setPreview]   = useState<string | null>(null);
  const [proofUrl,  setProofUrl]  = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");

  const { startUpload } = useUploadThing("productImage", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.url ?? null;
      if (url) {
        setProofUrl(url);
        setPreview(url);
      }
      setUploading(false);
    },
    onUploadError: () => {
      setError("Échec de l'upload. Réessayez.");
      setUploading(false);
    },
  });

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    await startUpload([file]);
    e.target.value = "";
  }, [startUpload]);

  const confirm = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/delivery/status/${orderId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          status:     "DELIVERED",
          proofImage: proofUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur.");
        return;
      }
      onSuccess();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background:"#16161d", border:"1px solid rgba(255,255,255,0.1)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor:"rgba(255,255,255,0.08)" }}>
          <div>
            <p className="font-poppins font-bold text-base text-white">Confirmer la livraison</p>
            <p className="text-xs font-inter mt-0.5" style={{ color:"rgba(232,234,240,0.4)" }}>
              Prenez une photo comme preuve (optionnel)
            </p>
          </div>
          <button onClick={onCancel}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:"rgba(255,255,255,0.06)" }}>
            <X size={14} className="text-white/50" />
          </button>
        </div>

        {/* Photo zone */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-inter text-[#f87171]"
              style={{ background:"rgba(248,113,113,0.1)" }}>
              <AlertTriangle size={12} /> {error}
            </div>
          )}

          {preview ? (
            <div className="relative rounded-2xl overflow-hidden" style={{ height: 200 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preuve livraison"
                className="w-full h-full object-cover" />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-white" />
                </div>
              )}
              {!uploading && (
                <button
                  onClick={() => { setPreview(null); setProofUrl(null); }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-xl flex items-center justify-center bg-black/60 text-white">
                  <X size={14} />
                </button>
              )}
            </div>
          ) : (
            <label
              className="flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all hover:bg-white/3"
              style={{ height:160, border:"2px dashed rgba(34,211,165,0.3)" }}>
              {uploading ? (
                <>
                  <Loader2 size={24} className="animate-spin text-[#22d3a5] mb-2" />
                  <span className="text-xs font-inter" style={{ color:"rgba(232,234,240,0.4)" }}>
                    Upload en cours…
                  </span>
                </>
              ) : (
                <>
                  <Camera size={28} className="text-[#22d3a5] mb-2" />
                  <span className="text-sm font-poppins font-semibold text-white">
                    Prendre une photo
                  </span>
                  <span className="text-xs font-inter mt-1" style={{ color:"rgba(232,234,240,0.4)" }}>
                    ou choisir depuis la galerie
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFile}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}

          <p className="text-xs font-inter text-center" style={{ color:"rgba(232,234,240,0.3)" }}>
            La photo est optionnelle mais recommandée en cas de litige.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 h-11 rounded-xl text-sm font-semibold font-poppins"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(232,234,240,0.6)" }}>
              Annuler
            </button>
            <button
              onClick={confirm}
              disabled={saving || uploading}
              className="flex-1 h-11 rounded-xl text-sm font-bold font-poppins text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background:"linear-gradient(135deg,#22d3a5,#0ea572)" }}>
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Confirmation…</>
                : <><CheckCircle2 size={14} /> Livraison confirmée</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
