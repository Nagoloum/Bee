"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock } from "lucide-react";
import { signUp, signIn } from "@/lib/auth/client";
import { Alert } from "@/components/ui/alert";
import {
  AuthFormWrapper, AuthDivider, GoogleButton,
  AuthInput, AuthSubmit,
} from "@/components/auth/auth-form";
import { OTPStep } from "@/components/auth/otp-step";

export default function SignUpClientPage() {
  const router = useRouter();
  const [step, setStep]       = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({
    firstName: "", lastName: "", email: "", password: "", confirm: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (form.password !== form.confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 8)       { setError("Minimum 8 caractères."); return; }
    setLoading(true);
    try {
      const res = await signUp.email({
        email:    form.email,
        password: form.password,
        name:     `${form.firstName} ${form.lastName}`.trim(),
        // @ts-ignore
        role: "CLIENT",
      });
      if (res.error) { setError(res.error.message ?? "Erreur d'inscription."); return; }
      router.push("/"); router.refresh();
    } catch { setError("Une erreur est survenue."); }
    finally { setLoading(false); }
  };

  if (step === "otp") return (
    <OTPStep phone="" onSuccess={() => { router.push("/"); router.refresh(); }} onBack={() => setStep("form")} />
  );

  return (
    <AuthFormWrapper label="Démarrer gratuitement" title="Créer un compte"
      subtitle={<span>Déjà membre ? <Link href="/sign-in" className="text-primary font-semibold hover:underline">Se connecter</Link></span>}>

      <GoogleButton onClick={() => signIn.social({ provider: "google", callbackURL: "/" })} label="Continuer avec Google" />
      <AuthDivider />

      {error && <Alert variant="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Prénom + Nom côte à côte */}
        <div className="grid grid-cols-2 gap-3">
          <AuthInput label="Prénom" icon={<User size={16}/>}
            value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required autoComplete="given-name" />
          <AuthInput label="Nom" icon={<User size={16}/>}
            value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            autoComplete="family-name" />
        </div>

        <AuthInput label="Adresse email" icon={<Mail size={16}/>} type="email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          required autoComplete="email" />

        {/* Les deux mots de passe côte à côte */}
        <div className="grid grid-cols-2 gap-3">
          <AuthInput label="Mot de passe" icon={<Lock size={16}/>}
            type="password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            required autoComplete="new-password"
            hint="8 caractères min." />
          <AuthInput label="Confirmer" icon={<Lock size={16}/>}
            type="password"
            value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required autoComplete="new-password" />
        </div>

        <div className="pt-1"><AuthSubmit label="Créer mon compte" isLoading={loading} /></div>
      </form>

      <p className="text-center text-xs text-muted-foreground font-inter mt-4 leading-relaxed">
        En créant un compte vous acceptez nos{" "}
        <Link href="/legal/cgu" className="underline hover:text-foreground">CGU</Link>{" "}et{" "}
        <Link href="/legal/privacy" className="underline hover:text-foreground">politique de confidentialité</Link>.
      </p>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-5 text-xs text-muted-foreground font-inter">
        <Link href="/sign-up/vendor" className="hover:text-primary transition-colors flex items-center gap-1.5">
          <span>🏪</span> Ouvrir une boutique
        </Link>
        <span className="w-px h-3 bg-border" />
        <Link href="/sign-up/delivery" className="hover:text-primary transition-colors flex items-center gap-1.5">
          <span>🛵</span> Devenir livreur
        </Link>
      </div>
    </AuthFormWrapper>
  );
}
