"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { AuthFormWrapper, AuthInput, AuthSubmit } from "@/components/auth/auth-form";

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/forget-password", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email, redirectTo:"/reset-password" }),
      });
      if (!res.ok) { setError("Email introuvable."); return; }
      setSent(true);
    } catch { setError("Erreur réseau."); }
    finally { setLoading(false); }
  };

  if (sent) return (
    <AuthFormWrapper label="Email envoyé" title="Vérifiez vos mails"
      subtitle={`Un lien de réinitialisation a été envoyé à ${email}. Vérifiez vos spams.`}>
      <div className="flex flex-col gap-3">
        <Alert variant="info">Le lien est valide 1 heure.</Alert>
        <Link href="/sign-in"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-inter transition-colors mt-2">
          <ArrowLeft size={14}/> Retour à la connexion
        </Link>
      </div>
    </AuthFormWrapper>
  );

  return (
    <AuthFormWrapper label="Accès oublié" title="Réinitialiser"
      subtitle={<span>Entrez votre email et recevez un lien pour créer un nouveau mot de passe.</span>}>
      {error && <Alert variant="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthInput label="Adresse email" type="email" placeholder="votre@email.com"
          value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        <div className="pt-1"><AuthSubmit label="Envoyer le lien" isLoading={loading} /></div>
      </form>
      <Link href="/sign-in" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-inter transition-colors mt-5">
        <ArrowLeft size={14}/> Retour à la connexion
      </Link>
    </AuthFormWrapper>
  );
}
