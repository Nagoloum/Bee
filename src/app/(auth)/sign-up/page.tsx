"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth/client";
// ✅ PATCH — parrainage
import { processReferralAfterSignup } from "@/components/storefront/signup-referral-patch";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Tous les champs sont requis.");
      return;
    }
    if (form.password.length < 8) {
      setError("Mot de passe : 8 caractères minimum.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const result = await authClient.signUp.email({
        name:     form.name,
        email:    form.email,
        password: form.password,
      });

      if (result.error) {
        setError(result.error.message ?? "Erreur lors de l'inscription.");
        return;
      }

      // ✅ PATCH — traiter le parrainage si code présent en sessionStorage
      if (result.data?.user?.id) {
        await processReferralAfterSignup(result.data.user.id);
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message ?? "Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-poppins font-black text-primary">🐝 BEE</Link>
          <h1 className="font-poppins font-black text-2xl text-foreground mt-4">Créer un compte</h1>
          <p className="text-muted-foreground font-inter text-sm mt-1">
            Rejoignez la communauté BEE
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-border p-8 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm font-inter text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold font-poppins text-foreground mb-1.5">
                Nom complet
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Jean Dupont"
                className="w-full h-11 px-4 rounded-2xl border border-border bg-cream-50 text-sm font-inter text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-poppins text-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="jean@exemple.cm"
                className="w-full h-11 px-4 rounded-2xl border border-border bg-cream-50 text-sm font-inter text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-poppins text-foreground mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="8 caractères minimum"
                  className="w-full h-11 px-4 pr-11 rounded-2xl border border-border bg-cream-50 text-sm font-inter text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-2xl text-sm font-bold font-poppins text-white flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              style={{ background: "linear-gradient(135deg,#F6861A,#E5750D)" }}>
              {loading && <Loader2 size={15} className="animate-spin" />}
              Créer mon compte
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm font-inter text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/sign-in" className="text-primary font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>

          <div className="mt-4 flex gap-3">
            <Link href="/sign-up/vendor"
              className="flex-1 h-10 rounded-2xl border border-border flex items-center justify-center text-xs font-semibold font-poppins text-muted-foreground hover:border-primary hover:text-primary transition-all">
              🏪 Devenir vendeur
            </Link>
            <Link href="/sign-up/delivery"
              className="flex-1 h-10 rounded-2xl border border-border flex items-center justify-center text-xs font-semibold font-poppins text-muted-foreground hover:border-primary hover:text-primary transition-all">
              🛵 Devenir livreur
            </Link>
          </div>
        </div>

        <p className="text-center text-xs font-inter text-muted-foreground mt-6">
          En vous inscrivant, vous acceptez nos{" "}
          <Link href="/legal/terms" className="underline hover:text-foreground">CGU</Link>
        </p>
      </div>
    </div>
  );
}
