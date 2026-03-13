"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { signUp, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { OTPStep } from "@/components/auth/otp-step";

type Step = "form" | "otp";

export default function SignUpPage() {
  const router    = useRouter();
  const [step, setStep]       = useState<Step>("form");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [form, setForm] = useState({
    name:     "",
    email:    "",
    phone:    "",
    password: "",
    confirm:  "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      const res = await signUp.email({
        email:    form.email,
        password: form.password,
        name:     form.name,
        // @ts-ignore - extra fields
        phone:    form.phone,
        role:     "CLIENT",
      });

      if (res.error) {
        setError(res.error.message ?? "Erreur lors de l'inscription.");
        return;
      }

      // If phone provided, go to OTP step
      if (form.phone) {
        // Send OTP
        await fetch("/api/otp", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ action: "send", phone: form.phone }),
        });
        setStep("otp");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    await signIn.social({ provider: "google", callbackURL: "/" });
  };

  const handleOTPSuccess = () => {
    router.push("/");
    router.refresh();
  };

  if (step === "otp") {
    return (
      <OTPStep
        phone={form.phone}
        onSuccess={handleOTPSuccess}
        onBack={() => setStep("form")}
      />
    );
  }

  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="bg-white rounded-3xl shadow-soft-xl border border-border p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-honey-gradient shadow-honey mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🐝</span>
          </div>
          <h1 className="font-poppins font-bold text-2xl text-foreground">Rejoindre BEE</h1>
          <p className="text-muted-foreground text-sm mt-1 font-inter">
            Créez votre compte en quelques secondes
          </p>
        </div>

        {/* Role tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted rounded-2xl mb-6">
          {[
            { href: "/sign-up",          label: "Client",  emoji: "🛍️", active: true  },
            { href: "/sign-up/vendor",   label: "Vendeur", emoji: "🏪", active: false },
            { href: "/sign-up/delivery", label: "Livreur", emoji: "🛵", active: false },
          ].map((tab) => (
            tab.active ? (
              <button
                key={tab.label}
                className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl bg-white shadow-soft-sm text-foreground font-poppins font-semibold text-xs"
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ) : (
              <Link
                key={tab.label}
                href={tab.href}
                className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-muted-foreground hover:text-foreground transition-colors font-poppins font-semibold text-xs"
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </Link>
            )
          ))}
        </div>

        {/* Google */}
        <Button
          variant="outline-ink"
          fullWidth
          className="mb-5"
          onClick={handleGoogleSignUp}
          leftIcon={
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          }
        >
          Continuer avec Google
        </Button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-inter">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {error && (
          <Alert variant="error" className="mb-4" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom complet"
            placeholder="Jean Dupont"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            leftIcon={<User size={16} />}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="votre@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            leftIcon={<Mail size={16} />}
            required
          />
          <Input
            label="Téléphone"
            placeholder="+237 6XX XXX XXX"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            leftIcon={<Phone size={16} />}
            hint="Optionnel — pour recevoir des notifications SMS"
          />
          <Input
            label="Mot de passe"
            type={showPw ? "text" : "password"}
            placeholder="Minimum 8 caractères"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            leftIcon={<Lock size={16} />}
            rightIcon={showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            onRightIconClick={() => setShowPw(!showPw)}
            required
          />
          <Input
            label="Confirmer le mot de passe"
            type={showPw ? "text" : "password"}
            placeholder="Répétez votre mot de passe"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            leftIcon={<Lock size={16} />}
            required
          />

          <Button type="submit" fullWidth isLoading={loading} className="mt-2">
            Créer mon compte
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground font-inter mt-5">
          Déjà un compte ?{" "}
          <Link href="/sign-in" className="text-primary font-semibold hover:underline">
            Se connecter
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground font-inter mt-3 leading-relaxed">
          En créant un compte vous acceptez nos{" "}
          <Link href="/legal/cgu" className="underline hover:text-foreground">CGU</Link>
          {" "}et notre{" "}
          <Link href="/legal/privacy" className="underline hover:text-foreground">politique de confidentialité</Link>.
        </p>
      </div>
    </div>
  );
}
