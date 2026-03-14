"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, Eye, EyeOff, MapPin, Bike, Hash } from "lucide-react";
import { signUp } from "@/lib/auth/client";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AuthFormWrapper, AuthInput, AuthSelect, AuthSubmit,
} from "@/components/auth/auth-form";
import { OTPStep } from "@/components/auth/otp-step";

const REGIONS = [
  { value:"CM-CE", label:"Centre (Yaoundé)"  },
  { value:"CM-LT", label:"Littoral (Douala)" },
  { value:"CM-OU", label:"Ouest"             },
  { value:"CM-NO", label:"Nord"              },
  { value:"CM-EN", label:"Extrême-Nord"      },
  { value:"CM-NW", label:"Nord-Ouest"        },
  { value:"CM-SW", label:"Sud-Ouest"         },
  { value:"CM-AD", label:"Adamaoua"          },
  { value:"CM-ES", label:"Est"               },
  { value:"CM-SU", label:"Sud"               },
];

const VEHICLES = [
  { value:"moto",    label:"Moto",    icon:"🏍️" },
  { value:"velo",    label:"Vélo",    icon:"🚲" },
  { value:"voiture", label:"Voiture", icon:"🚗" },
  { value:"a_pied",  label:"À pied",  icon:"🚶" },
];

export default function DeliverySignUpPage() {
  const router = useRouter();
  const [step, setStep]       = useState<"form" | "otp">("form");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({
    name: "", email: "", phone: "", password: "", confirm: "",
    region: "", vehicleType: "", vehiclePlate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (form.password !== form.confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (!form.phone) { setError("Le téléphone est obligatoire pour les livreurs."); return; }
    setLoading(true);
    try {
      const res = await signUp.email({
        email: form.email, password: form.password, name: form.name,
        // @ts-ignore
        phone: form.phone, role: "DELIVERY", region: form.region,
      });
      if (res.error) { setError(res.error.message ?? "Erreur."); return; }
      await fetch("/api/delivery/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: res.data?.user?.id, region: form.region,
          vehicleType: form.vehicleType, vehiclePlate: form.vehiclePlate, phone: form.phone,
        }),
      });
      await fetch("/api/otp", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone: form.phone }) });
      setStep("otp");
    } catch { setError("Une erreur est survenue."); }
    finally { setLoading(false); }
  };

  if (step === "otp") return (
    <OTPStep phone={form.phone} required
      onSuccess={() => { router.push("/delivery"); router.refresh(); }}
      onBack={() => setStep("form")} />
  );

  const pwIcon = (
    <button type="button" onClick={() => setShowPw(!showPw)} className="p-1 hover:text-foreground transition-colors rounded-lg">
      {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
    </button>
  );

  return (
    <AuthFormWrapper label="Livrez avec BEE" title="Compte livreur" maxWidth="max-w-md"
      subtitle={
        <span className="flex items-center gap-2 flex-wrap">
          <Badge variant="default" size="xs">500 FCFA / livraison</Badge>
          <span className="text-muted-foreground">· <Link href="/sign-in" className="text-primary font-semibold hover:underline">Déjà livreur ?</Link></span>
        </span>
      }>

      {error && <Alert variant="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Identité */}
        <div className="grid grid-cols-2 gap-3">
          <AuthInput label="Nom complet" icon={<User size={16}/>}
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <AuthInput label="Téléphone" icon={<Phone size={16}/>}
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required hint="Requis — pour recevoir les commandes" />
        </div>

        <AuthInput label="Adresse email" icon={<Mail size={16}/>} type="email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          required autoComplete="email" />

        <div className="grid grid-cols-2 gap-3">
          <AuthInput label="Mot de passe" icon={<Lock size={16}/>}
            type={showPw ? "text" : "password"}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            required autoComplete="new-password" rightElement={pwIcon} />
          <AuthInput label="Confirmer" icon={<Lock size={16}/>}
            type={showPw ? "text" : "password"}
            value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required autoComplete="new-password" />
        </div>

        {/* Séparateur livraison */}
        <div className="flex items-center gap-3 pt-1 pb-1">
          <div className="flex-1 h-px bg-border"/>
          <span className="text-[10px] text-muted-foreground font-poppins font-bold uppercase tracking-widest">
            Mes infos livraison
          </span>
          <div className="flex-1 h-px bg-border"/>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <AuthSelect label="Région d'activité" icon={<MapPin size={16}/>} options={REGIONS}
            value={form.region} onChange={(v) => setForm({ ...form, region: v })} required />
          <AuthSelect label="Transport" icon={<Bike size={16}/>} options={VEHICLES} optional
            value={form.vehicleType} onChange={(v) => setForm({ ...form, vehicleType: v })} />
        </div>

        <AuthInput label="Plaque d'immatriculation" icon={<Hash size={16}/>} optional
          value={form.vehiclePlate} onChange={(e) => setForm({ ...form, vehiclePlate: e.target.value })}
          hint="Ex: LT 1234 A" />

        <div className="pt-1">
          <AuthSubmit label="Créer mon compte livreur" isLoading={loading} variant="secondary" />
        </div>
      </form>

      <div className="mt-4 pt-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground font-inter">
          Vous êtes acheteur ?{" "}
          <Link href="/sign-up" className="text-primary hover:underline font-semibold">Créer un compte client</Link>
        </p>
      </div>
    </AuthFormWrapper>
  );
}
