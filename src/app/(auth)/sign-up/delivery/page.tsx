"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signUp } from "@/lib/auth/client";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AuthFormWrapper, AuthInput, AuthSelect, AuthSubmit } from "@/components/auth/auth-form";
import { OTPStep } from "@/components/auth/otp-step";

const REGIONS = [
  {value:"CM-CE",label:"Centre (Yaoundé)"},{value:"CM-LT",label:"Littoral (Douala)"},
  {value:"CM-OU",label:"Ouest"},{value:"CM-NO",label:"Nord"},{value:"CM-EN",label:"Extrême-Nord"},
  {value:"CM-NW",label:"Nord-Ouest"},{value:"CM-SW",label:"Sud-Ouest"},
  {value:"CM-AD",label:"Adamaoua"},{value:"CM-ES",label:"Est"},{value:"CM-SU",label:"Sud"},
];
const VEHICLES = [
  {value:"moto",label:"🏍️ Moto"},{value:"velo",label:"🚲 Vélo"},
  {value:"voiture",label:"🚗 Voiture"},{value:"a_pied",label:"🚶 À pied"},
];

export default function DeliverySignUpPage() {
  const router = useRouter();
  const [step, setStep]       = useState<"form"|"otp">("form");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({
    name:"", email:"", phone:"", password:"", confirm:"",
    region:"", vehicleType:"", vehiclePlate:"",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (form.password !== form.confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (!form.phone) { setError("Le téléphone est obligatoire pour les livreurs."); return; }
    setLoading(true);
    try {
      const res = await signUp.email({
        email:form.email, password:form.password, name:form.name,
        // @ts-ignore
        phone:form.phone, role:"DELIVERY", region:form.region,
      });
      if (res.error) { setError(res.error.message ?? "Erreur."); return; }
      await fetch("/api/delivery/create", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ userId:res.data?.user?.id, region:form.region,
          vehicleType:form.vehicleType, vehiclePlate:form.vehiclePlate, phone:form.phone }),
      });
      await fetch("/api/otp", { method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ action:"send", phone:form.phone }) });
      setStep("otp");
    } catch { setError("Une erreur est survenue."); }
    finally { setLoading(false); }
  };

  if (step === "otp") return (
    <OTPStep phone={form.phone} required onSuccess={() => { router.push("/delivery"); router.refresh(); }} onBack={() => setStep("form")} />
  );

  return (
    <AuthFormWrapper label="Livrez avec BEE" title="Compte livreur" maxWidth="max-w-md"
      subtitle={
        <span className="flex items-center gap-2">
          <Badge variant="default" size="xs">500 FCFA / livraison</Badge>
          <span>· <Link href="/sign-in" className="text-primary font-semibold hover:underline">Déjà livreur ?</Link></span>
        </span>
      }>
      {error && <Alert variant="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <AuthInput label="Nom complet" placeholder="Jean Dupont"
            value={form.name} onChange={(e) => setForm({...form, name:e.target.value})} required />
          <AuthInput label="Téléphone *" placeholder="+237 6XX XXX XXX"
            value={form.phone} onChange={(e) => setForm({...form, phone:e.target.value})} required />
        </div>
        <AuthInput label="Email" type="email" placeholder="votre@email.com"
          value={form.email} onChange={(e) => setForm({...form, email:e.target.value})} required />
        <div className="grid grid-cols-2 gap-3">
          <AuthInput label="Mot de passe" type={showPw?"text":"password"} placeholder="Min. 8 car."
            value={form.password} onChange={(e) => setForm({...form, password:e.target.value})} required
            rightElement={<button type="button" onClick={()=>setShowPw(!showPw)} className="p-1">{showPw?<EyeOff size={14}/>:<Eye size={14}/>}</button>} />
          <AuthInput label="Confirmer" type={showPw?"text":"password"} placeholder="Répéter"
            value={form.confirm} onChange={(e) => setForm({...form, confirm:e.target.value})} required />
        </div>

        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-border"/>
          <span className="text-xs text-muted-foreground font-poppins font-semibold">Mes infos livraison</span>
          <div className="flex-1 h-px bg-border"/>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <AuthSelect label="Région d'activité" value={form.region} options={REGIONS}
            onChange={(e) => setForm({...form, region:e.target.value})} required />
          <AuthSelect label="Moyen de transport" value={form.vehicleType} options={VEHICLES}
            onChange={(e) => setForm({...form, vehicleType:e.target.value})} />
        </div>
        <AuthInput label="Plaque (optionnel)" placeholder="LT 1234 A"
          value={form.vehiclePlate} onChange={(e) => setForm({...form, vehiclePlate:e.target.value})} />

        <div className="pt-1"><AuthSubmit label="Créer mon compte livreur" isLoading={loading} variant="secondary" /></div>
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
