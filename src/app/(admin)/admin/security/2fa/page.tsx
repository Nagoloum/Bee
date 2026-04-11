"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck, ShieldOff, Loader2, Smartphone,
  Copy, Check, RefreshCw, Eye, EyeOff,
} from "lucide-react";

type Step = "idle" | "setup" | "verify" | "done";

export default function Admin2FAPage() {
  const [step,      setStep]      = useState<Step>("idle");
  const [enabled,   setEnabled]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [working,   setWorking]   = useState(false);
  const [qrCode,    setQrCode]    = useState("");
  const [secret,    setSecret]    = useState("");
  const [showSecret,setShowSecret]= useState(false);
  const [code,      setCode]      = useState("");
  const [error,     setError]     = useState("");
  const [copied,    setCopied]    = useState(false);

  useEffect(() => {
    // Vérifier si 2FA déjà activé
    fetch("/api/auth/get-session")
      .then(r => r.json())
      .then(data => {
        setEnabled(!!(data?.user as any)?.twoFactorEnabled);
        setLoading(false);
      });
  }, []);

  const startSetup = async () => {
    setWorking(true);
    setError("");
    const res  = await fetch("/api/admin/2fa");
    const data = await res.json();
    setQrCode(data.qrCode);
    setSecret(data.secret);
    setStep("setup");
    setWorking(false);
  };

  const verify = async (action: "enable" | "disable") => {
    if (code.length !== 6) { setError("Code à 6 chiffres requis."); return; }
    setWorking(true);
    setError("");
    const res  = await fetch("/api/admin/2fa", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ code, action }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Code invalide."); setWorking(false); return; }
    setEnabled(data.enabled);
    setStep("done");
    setCode("");
    setWorking(false);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={24} className="animate-spin text-[#9b7fff]" />
    </div>
  );

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck size={22} className="text-[#9b7fff]" />
        <h1 className="font-poppins font-black text-2xl text-white">
          Double authentification (2FA)
        </h1>
      </div>

      {/* Statut */}
      <div className="flex items-center gap-4 p-4 rounded-2xl"
        style={{
          background: enabled ? "rgba(34,211,165,0.08)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${enabled ? "rgba(34,211,165,0.25)" : "rgba(255,255,255,0.1)"}`,
        }}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${enabled ? "bg-[#22d3a5]/15" : "bg-white/5"}`}>
          {enabled ? <ShieldCheck size={22} className="text-[#22d3a5]" /> : <ShieldOff size={22} className="text-white/40" />}
        </div>
        <div>
          <p className="font-poppins font-bold text-base text-white">
            {enabled ? "2FA activé" : "2FA désactivé"}
          </p>
          <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.4)" }}>
            {enabled
              ? "Votre compte admin est protégé par TOTP"
              : "Protégez votre compte avec une application d'authentification"}
          </p>
        </div>
      </div>

      {/* ── IDLE ── */}
      {step === "idle" && (
        <div className="space-y-3">
          {!enabled ? (
            <button onClick={startSetup} disabled={working}
              className="w-full h-12 rounded-2xl text-sm font-bold font-poppins text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#7c5cfc,#9b7fff)" }}>
              {working ? <Loader2 size={15} className="animate-spin" /> : <Smartphone size={15} />}
              Activer le 2FA
            </button>
          ) : (
            <button onClick={() => setStep("verify")}
              className="w-full h-12 rounded-2xl text-sm font-bold font-poppins flex items-center justify-center gap-2"
              style={{ background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}>
              <ShieldOff size={15} /> Désactiver le 2FA
            </button>
          )}

          <div className="rounded-xl p-4 space-y-2 text-xs font-inter"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="font-bold text-white/60 mb-2">Applications recommandées :</p>
            <p style={{ color: "rgba(232,234,240,0.5)" }}>• Google Authenticator (iOS / Android)</p>
            <p style={{ color: "rgba(232,234,240,0.5)" }}>• Authy (iOS / Android / Desktop)</p>
            <p style={{ color: "rgba(232,234,240,0.5)" }}>• Microsoft Authenticator</p>
          </div>
        </div>
      )}

      {/* ── SETUP ── */}
      {step === "setup" && (
        <div className="space-y-5">
          <div className="rounded-2xl p-5 space-y-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="font-poppins font-bold text-sm text-white">
              Étape 1 — Scannez le QR code
            </p>
            <p className="text-xs font-inter" style={{ color: "rgba(232,234,240,0.5)" }}>
              Ouvrez votre application d'authentification et scannez ce code.
            </p>
            {qrCode && (
              <div className="flex justify-center bg-white rounded-2xl p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="QR Code 2FA" className="w-48 h-48" />
              </div>
            )}

            <div>
              <p className="text-xs font-inter mb-2" style={{ color: "rgba(232,234,240,0.4)" }}>
                Ou saisissez ce code manuellement :
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-9 px-3 rounded-xl font-mono text-xs flex items-center"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: showSecret ? "white" : "transparent", textShadow: showSecret ? "none" : "0 0 8px rgba(255,255,255,0.8)" }}>
                  {secret}
                </div>
                <button onClick={() => setShowSecret(s => !s)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  {showSecret ? <EyeOff size={14} className="text-white/50" /> : <Eye size={14} className="text-white/50" />}
                </button>
                <button onClick={copySecret}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(155,127,255,0.15)" }}>
                  {copied ? <Check size={14} className="text-[#22d3a5]" /> : <Copy size={14} className="text-[#9b7fff]" />}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5 space-y-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="font-poppins font-bold text-sm text-white">
              Étape 2 — Vérifiez le code
            </p>
            <p className="text-xs font-inter" style={{ color: "rgba(232,234,240,0.5)" }}>
              Entrez le code à 6 chiffres affiché dans votre application.
            </p>

            {error && (
              <p className="text-xs text-[#f87171] font-inter">{error}</p>
            )}

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full h-12 px-4 rounded-xl text-center text-xl font-mono font-bold text-white tracking-widest focus:outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", letterSpacing: "0.3em" }}
              autoComplete="one-time-code"
            />

            <div className="flex gap-3">
              <button onClick={() => { setStep("idle"); setCode(""); setError(""); }}
                className="flex-1 h-10 rounded-xl text-sm font-semibold font-poppins"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(232,234,240,0.5)" }}>
                Annuler
              </button>
              <button onClick={() => verify("enable")} disabled={working || code.length !== 6}
                className="flex-1 h-10 rounded-xl text-sm font-bold font-poppins text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#22d3a5,#0ea572)" }}>
                {working ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                Activer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VERIFY pour désactiver ── */}
      {step === "verify" && (
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="font-poppins font-bold text-sm text-white">Désactiver le 2FA</p>
          <p className="text-xs font-inter" style={{ color: "rgba(232,234,240,0.5)" }}>
            Entrez le code de votre application pour confirmer.
          </p>

          {error && <p className="text-xs text-[#f87171] font-inter">{error}</p>}

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full h-12 px-4 rounded-xl text-center text-xl font-mono font-bold text-white tracking-widest focus:outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", letterSpacing: "0.3em" }}
          />

          <div className="flex gap-3">
            <button onClick={() => { setStep("idle"); setCode(""); setError(""); }}
              className="flex-1 h-10 rounded-xl text-sm font-semibold font-poppins"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(232,234,240,0.5)" }}>
              Annuler
            </button>
            <button onClick={() => verify("disable")} disabled={working || code.length !== 6}
              className="flex-1 h-10 rounded-xl text-sm font-bold font-poppins flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "rgba(248,113,113,0.2)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}>
              {working ? <Loader2 size={13} className="animate-spin" /> : <ShieldOff size={13} />}
              Désactiver
            </button>
          </div>
        </div>
      )}

      {/* ── DONE ── */}
      {step === "done" && (
        <div className="rounded-2xl p-6 text-center space-y-3"
          style={{ background: enabled ? "rgba(34,211,165,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${enabled ? "rgba(34,211,165,0.25)" : "rgba(255,255,255,0.1)"}` }}>
          <div className="text-4xl mb-2">{enabled ? "🔐" : "🔓"}</div>
          <p className="font-poppins font-bold text-base text-white">
            {enabled ? "2FA activé avec succès !" : "2FA désactivé"}
          </p>
          <p className="text-xs font-inter" style={{ color: "rgba(232,234,240,0.5)" }}>
            {enabled
              ? "Votre compte admin est maintenant protégé par TOTP."
              : "La double authentification a été désactivée."}
          </p>
          <button onClick={() => setStep("idle")}
            className="mt-2 text-xs font-inter text-[#9b7fff] hover:underline">
            Retour
          </button>
        </div>
      )}
    </div>
  );
}
