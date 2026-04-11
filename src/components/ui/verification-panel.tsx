"use client";

import { useState } from "react";
import { ShieldCheck, Mail, Phone, CheckCircle2, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { BadgeChip } from "@/components/ui/badge-chip";
import { cn } from "@/lib/utils/cn";

interface Props {
  userId:        string;
  emailVerified: boolean;
  phoneVerified: boolean;
  userEmail:     string;
  userPhone?:    string;
}

type Step = "idle" | "sending" | "verifying" | "done";

interface ChannelState {
  step:     Step;
  code:     string;
  error:    string;
  verified: boolean;
}

const INIT: ChannelState = { step: "idle", code: "", error: "", verified: false };

export function VerificationPanel({ userId, emailVerified, phoneVerified, userEmail, userPhone }: Props) {
  const [email, setEmail] = useState({ ...INIT, verified: emailVerified });
  const [phone, setPhone] = useState({ ...INIT, verified: phoneVerified });
  const [emailTarget, setEmailTarget] = useState(userEmail);
  const [phoneTarget, setPhoneTarget] = useState(userPhone ?? "");

  const isCertified = email.verified && phone.verified;

  const sendOTP = async (channel: "EMAIL" | "PHONE") => {
    const target = channel === "EMAIL" ? emailTarget : phoneTarget;
    const setter = channel === "EMAIL" ? setEmail : setPhone;

    if (!target) { setter(s => ({ ...s, error: "Champ requis." })); return; }

    setter(s => ({ ...s, step: "sending", error: "" }));
    const res  = await fetch("/api/verify/send-otp", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ channel, target }),
    });
    const data = await res.json();

    if (!res.ok) {
      setter(s => ({ ...s, step: "idle", error: data.error ?? "Erreur." }));
    } else {
      setter(s => ({ ...s, step: "verifying" }));
    }
  };

  const confirmOTP = async (channel: "EMAIL" | "PHONE") => {
    const target = channel === "EMAIL" ? emailTarget : phoneTarget;
    const state  = channel === "EMAIL" ? email : phone;
    const setter = channel === "EMAIL" ? setEmail : setPhone;

    if (!state.code || state.code.length !== 6) {
      setter(s => ({ ...s, error: "Code à 6 chiffres requis." }));
      return;
    }

    setter(s => ({ ...s, step: "sending", error: "" }));
    const res  = await fetch("/api/verify/confirm-otp", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ channel, target, code: state.code }),
    });
    const data = await res.json();

    if (!res.ok) {
      setter(s => ({ ...s, step: "verifying", error: data.error ?? "Erreur." }));
    } else {
      setter(s => ({ ...s, step: "done", verified: true }));
      if (data.certified) {
        setEmail(s => ({ ...s, verified: true }));
        setPhone(s => ({ ...s, verified: true }));
      }
    }
  };

  return (
    <div className="space-y-5 max-w-lg">
      {/* Badge certifié */}
      {isCertified && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-200">
          <ShieldCheck size={24} className="text-blue-600 shrink-0" />
          <div>
            <p className="font-poppins font-bold text-sm text-blue-800">Compte Certifié ✅</p>
            <p className="text-xs text-blue-600 font-inter mt-0.5">
              Votre identité est vérifiée. Le badge Certifié s'affiche sur votre profil.
            </p>
          </div>
          <BadgeChip type="CERTIFIED" size="sm" className="ml-auto shrink-0" />
        </div>
      )}

      {!isCertified && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <p className="font-poppins font-bold text-sm text-amber-800">Certifiez votre compte</p>
          <p className="text-xs text-amber-700 font-inter mt-1">
            Vérifiez votre email <strong>et</strong> votre téléphone pour obtenir le badge Certifié et inspirer confiance aux acheteurs.
          </p>
        </div>
      )}

      {/* Email verification */}
      <VerifyCard
        channel="EMAIL"
        label="Adresse email"
        icon={Mail}
        placeholder="votre@email.com"
        target={emailTarget}
        onTargetChange={setEmailTarget}
        state={email}
        onSend={() => sendOTP("EMAIL")}
        onConfirm={() => confirmOTP("EMAIL")}
        onCodeChange={v => setEmail(s => ({ ...s, code: v }))}
        onResend={() => sendOTP("EMAIL")}
        lockedTarget={true}
      />

      {/* Phone verification */}
      <VerifyCard
        channel="PHONE"
        label="Numéro de téléphone"
        icon={Phone}
        placeholder="+237 6XX XXX XXX"
        target={phoneTarget}
        onTargetChange={setPhoneTarget}
        state={phone}
        onSend={() => sendOTP("PHONE")}
        onConfirm={() => confirmOTP("PHONE")}
        onCodeChange={v => setPhone(s => ({ ...s, code: v }))}
        onResend={() => sendOTP("PHONE")}
        lockedTarget={false}
      />
    </div>
  );
}

// ── Sub-component VerifyCard ───────────────────────────────────────────────

interface VerifyCardProps {
  channel:        "EMAIL" | "PHONE";
  label:          string;
  icon:           React.ElementType;
  placeholder:    string;
  target:         string;
  onTargetChange: (v: string) => void;
  state:          ChannelState;
  onSend:         () => void;
  onConfirm:      () => void;
  onCodeChange:   (v: string) => void;
  onResend:       () => void;
  lockedTarget:   boolean;
}

function VerifyCard({
  label, icon: Icon, placeholder, target, onTargetChange,
  state, onSend, onConfirm, onCodeChange, onResend, lockedTarget,
}: VerifyCardProps) {
  const loading = state.step === "sending";

  return (
    <div className={cn(
      "rounded-2xl border p-5 transition-all",
      state.verified
        ? "bg-emerald-50 border-emerald-200"
        : "bg-white border-border"
    )}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center",
          state.verified ? "bg-emerald-100" : "bg-primary/10"
        )}>
          {state.verified
            ? <CheckCircle2 size={18} className="text-emerald-600" />
            : <Icon size={18} className="text-primary" />
          }
        </div>
        <div>
          <p className="font-poppins font-bold text-sm text-foreground">{label}</p>
          <p className="text-xs font-inter text-muted-foreground">
            {state.verified ? "✓ Vérifié" : "Non vérifié"}
          </p>
        </div>
      </div>

      {!state.verified && (
        <div className="space-y-3">
          {/* Target input */}
          <div className="flex gap-2">
            <input
              type={label.includes("email") ? "email" : "tel"}
              value={target}
              onChange={e => onTargetChange(e.target.value)}
              placeholder={placeholder}
              disabled={lockedTarget || state.step === "verifying"}
              className="flex-1 h-10 px-3 rounded-xl border border-border bg-white text-sm font-inter text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60 disabled:bg-muted"
            />
            {state.step === "idle" && (
              <button
                onClick={onSend}
                disabled={!target || loading}
                className="h-10 px-4 rounded-xl text-sm font-bold font-poppins text-white flex items-center gap-1.5 disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(135deg,#F6861A,#E5750D)" }}>
                {loading ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                Envoyer
              </button>
            )}
          </div>

          {/* OTP input */}
          {state.step === "verifying" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-inter">
                Code envoyé — entrez les 6 chiffres reçus
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={state.code}
                  onChange={e => onCodeChange(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="flex-1 h-10 px-3 rounded-xl border border-border bg-white text-center text-lg font-mono font-bold text-foreground tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  onClick={onConfirm}
                  disabled={state.code.length !== 6 || loading}
                  className="h-10 px-4 rounded-xl text-sm font-bold font-poppins text-white flex items-center gap-1.5 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#22a07a,#1a8065)" }}>
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  Vérifier
                </button>
              </div>
              <button onClick={onResend}
                className="text-xs text-primary hover:underline font-inter flex items-center gap-1">
                <RefreshCw size={10} /> Renvoyer le code
              </button>
            </div>
          )}

          {state.error && (
            <p className="text-xs text-red-600 font-inter">{state.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
