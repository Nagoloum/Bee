"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // better-auth handles this endpoint
      const res = await fetch("/api/auth/forget-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, redirectTo: "/reset-password" }),
      });

      if (!res.ok) {
        setError("Email introuvable. Vérifiez l'adresse saisie.");
        return;
      }

      setSent(true);
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm animate-fade-up">
      <div className="bg-white rounded-3xl shadow-soft-xl border border-border p-8 text-center">

        <div className="w-14 h-14 rounded-2xl bg-honey-50 border-2 border-honey-200 mx-auto mb-5 flex items-center justify-center">
          <span className="text-3xl">🔑</span>
        </div>

        {!sent ? (
          <>
            <h1 className="font-poppins font-bold text-xl text-foreground mb-2">
              Mot de passe oublié ?
            </h1>
            <p className="text-sm text-muted-foreground font-inter mb-6">
              Entrez votre email — on vous envoie un lien de réinitialisation.
            </p>

            {error && (
              <Alert variant="error" className="mb-4 text-left" onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <Input
                label="Adresse email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
                required
              />
              <Button type="submit" fullWidth isLoading={loading}>
                Envoyer le lien
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-success/10 mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="font-poppins font-bold text-xl text-foreground mb-2">
              Email envoyé !
            </h1>
            <p className="text-sm text-muted-foreground font-inter mb-6">
              Vérifiez votre boîte mail à{" "}
              <span className="font-semibold text-foreground">{email}</span>.
              Le lien est valide 1 heure.
            </p>
            <Alert variant="info" className="text-left mb-4">
              Vérifiez aussi vos spams si vous ne trouvez pas l'email.
            </Alert>
          </>
        )}

        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-inter mt-4"
        >
          <ArrowLeft size={14} />
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
