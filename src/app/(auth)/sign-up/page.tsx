"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signUp, signIn } from "@/lib/auth/client";
import { Alert } from "@/components/ui/alert";
import { AuthFormWrapper, AuthDivider, GoogleButton, AuthInput, AuthSubmit } from "@/components/auth/auth-form";
import { OTPStep } from "@/components/auth/otp-step";

export default function SignUpClientPage() {
  const router = useRouter();
  const [step, setStep]       = useState<"form"|"otp">("form");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({ firstName:"", lastName:"", email:"", phone:"", password:"", confirm:"" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (form.password !== form.confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 8) { setError("Minimum 8 caractères."); return; }
    setLoading(true);
    try {
      const res = await signUp.email({
        email: form.email, password: form.password,
        name: `${form.firstName} ${form.lastName}`.trim(),
        // @ts-ignore
        phone: form.phone, role: "CLIENT",
      });
      if (res.error) { setError(res.error.message ?? "Erreur."); return; }
      if (form.phone) {
        await fetch("/api/otp", { method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ action:"send", phone:form.phone }) });
        setStep("otp");
      } else { router.push("/"); router.refresh(); }
    } catch { setError("Une erreur est survenue."); }
    finally { setLoading(false); }
  };

  if (step === "otp") return (
    <OTPStep phone={form.phone} onSuccess={() => { router.push("/"); router.refresh(); }} onBack={() => setStep("form")} />
  );

  return (
    <AuthFormWrapper
      label="Démarrer gratuitement"
      title="Créer un compte"
      subtitle={<span>Déjà membre ? <Link href="/sign-in" className="text-primary font-semibold hover:underline">Se connecter</Link></span>}
    >
      <GoogleButton onClick={() => signIn.social({ provider:"google", callbackURL:"/" })} label="Continuer avec Google" />
      <AuthDivider />
      {error && <Alert variant="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <AuthInput label="Prénom" placeholder="Jean"
            value={form.firstName} onChange={(e) => setForm({...form, firstName:e.target.value})} required />
          <AuthInput label="Nom" placeholder="Dupont"
            value={form.lastName} onChange={(e) => setForm({...form, lastName:e.target.value})} />
        </div>
        <AuthInput label="Email" type="email" placeholder="jean@email.com"
          value={form.email} onChange={(e) => setForm({...form, email:e.target.value})} required autoComplete="email" />
        <AuthInput label="Téléphone (optionnel)" placeholder="+237 6XX XXX XXX"
          value={form.phone} onChange={(e) => setForm({...form, phone:e.target.value})} />
        <AuthInput label="Mot de passe" type={showPw?"text":"password"} placeholder="Minimum 8 caractères"
          value={form.password} onChange={(e) => setForm({...form, password:e.target.value})} required
          rightElement={<button type="button" onClick={()=>setShowPw(!showPw)} className="p-1 hover:text-foreground transition-colors">{showPw?<EyeOff size={15}/>:<Eye size={15}/>}</button>} />
        <AuthInput label="Confirmer le mot de passe" type={showPw?"text":"password"} placeholder="Répéter"
          value={form.confirm} onChange={(e) => setForm({...form, confirm:e.target.value})} required />
        <div className="pt-1"><AuthSubmit label="Créer mon compte" isLoading={loading} /></div>
      </form>
      <p className="text-center text-xs text-muted-foreground font-inter mt-4 leading-relaxed">
        En créant un compte vous acceptez nos{" "}
        <Link href="/legal/cgu" className="underline hover:text-foreground">CGU</Link> et{" "}
        <Link href="/legal/privacy" className="underline hover:text-foreground">politique de confidentialité</Link>.
      </p>
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-5 text-xs text-muted-foreground font-inter">
        <Link href="/sign-up/vendor" className="hover:text-primary transition-colors">🏪 Ouvrir une boutique</Link>
        <span className="w-px h-3 bg-border" />
        <Link href="/sign-up/delivery" className="hover:text-primary transition-colors">🛵 Devenir livreur</Link>
      </div>
    </AuthFormWrapper>
  );
}
