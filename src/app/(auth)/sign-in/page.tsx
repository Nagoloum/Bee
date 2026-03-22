"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { signIn } from "@/lib/auth/client";
import { Alert } from "@/components/ui/alert";
import {
  AuthFormWrapper, AuthDivider, GoogleButton,
  AuthInput, AuthSubmit,
} from "@/components/auth/auth-form";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await signIn.email({ email: form.email, password: form.password });
      if (res.error) { setError("Email ou mot de passe incorrect."); return; }
      const role = (res.data?.user as any)?.role ?? "CLIENT";
      router.push(role === "VENDOR" ? "/vendor" : role === "DELIVERY" ? "/delivery" : role === "ADMIN" ? "/admin" : "/");
      router.refresh();
    } catch { setError("Une erreur est survenue."); }
    finally { setLoading(false); }
  };

  return (
    <AuthFormWrapper
      label="Bon retour"
      title="Connexion"
      subtitle={
        <span>
          Pas encore de compte ?{" "}
          <Link href="/sign-up" className="text-primary font-semibold hover:underline">
            S'inscrire gratuitement
          </Link>
        </span>
      }
    >
      <GoogleButton onClick={() => signIn.social({ provider: "google", callbackURL: "/" })} />
      <AuthDivider />

      {error && (
        <Alert variant="error" className="mb-4" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthInput
          label="Adresse email"
          icon={<Mail size={16} />}
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          autoComplete="email"
        />

        <AuthInput
          label="Mot de passe"
          icon={<Lock size={16} />}
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          autoComplete="current-password"
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-primary transition-colors font-inter"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <div className="pt-1">
          <AuthSubmit label="Se connecter" isLoading={loading} />
        </div>
      </form>

      <div className="mt-6 pt-5 border-t border-border flex items-center justify-center gap-5 text-xs text-muted-foreground font-inter">
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
