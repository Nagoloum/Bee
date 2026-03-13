"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Chrome } from "lucide-react";
import { signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import type { UserRole } from "@/types";

function getRoleRedirect(role: string): string {
  switch (role) {
    case "VENDOR":   return "/vendor";
    case "DELIVERY": return "/delivery";
    case "ADMIN":    return "/admin";
    default:         return "/";
  }
}

export default function SignInPage() {
  const router = useRouter();
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn.email({
        email:    form.email,
        password: form.password,
      });

      if (res.error) {
        setError("Email ou mot de passe incorrect.");
        return;
      }

      const role = (res.data?.user as any)?.role ?? "CLIENT";
      router.push(getRoleRedirect(role));
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await signIn.social({ provider: "google", callbackURL: "/" });
  };

  return (
    <div className="w-full max-w-md animate-fade-up">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-soft-xl border border-border p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-honey-gradient shadow-honey mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🐝</span>
          </div>
          <h1 className="font-poppins font-bold text-2xl text-foreground">Bon retour !</h1>
          <p className="text-muted-foreground text-sm mt-1 font-inter">
            Connectez-vous à votre compte BEE
          </p>
        </div>

        {/* Google */}
        <Button
          variant="outline-ink"
          fullWidth
          className="mb-6"
          onClick={handleGoogle}
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

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-inter">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Error */}
        {error && (
          <Alert variant="error" className="mb-5" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="votre@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            leftIcon={<Mail size={16} />}
            required
            autoComplete="email"
          />

          <div>
            <Input
              label="Mot de passe"
              type={showPw ? "text" : "password"}
              placeholder="Votre mot de passe"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              leftIcon={<Lock size={16} />}
              rightIcon={showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              onRightIconClick={() => setShowPw(!showPw)}
              required
              autoComplete="current-password"
            />
            <div className="flex justify-end mt-1.5">
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-inter"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <Button type="submit" fullWidth isLoading={loading} className="mt-2">
            Se connecter
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground font-inter mt-6">
          Pas encore de compte ?{" "}
          <Link href="/sign-up" className="text-primary font-semibold hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>

      {/* Become vendor/delivery links */}
      <div className="flex items-center justify-center gap-6 mt-5">
        <Link href="/sign-up/vendor" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-inter flex items-center gap-1.5">
          <span>🏪</span> Vendre sur BEE
        </Link>
        <div className="w-px h-3 bg-border" />
        <Link href="/sign-up/delivery" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-inter flex items-center gap-1.5">
          <span>🛵</span> Livrer avec BEE
        </Link>
      </div>
    </div>
  );
}
