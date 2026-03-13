"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone, Store, MapPin, FileText } from "lucide-react";
import { signUp } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { OTPStep } from "@/components/auth/otp-step";
import { slugify } from "@/lib/utils/cn";
import { db } from "@/lib/db";

const REGIONS = [
  { value: "CM-CE", label: "Centre (Yaoundé)"  },
  { value: "CM-LT", label: "Littoral (Douala)" },
  { value: "CM-OU", label: "Ouest"             },
  { value: "CM-NO", label: "Nord"              },
  { value: "CM-EN", label: "Extrême-Nord"      },
  { value: "CM-NW", label: "Nord-Ouest"        },
  { value: "CM-SW", label: "Sud-Ouest"         },
  { value: "CM-AD", label: "Adamaoua"          },
  { value: "CM-ES", label: "Est"               },
  { value: "CM-SU", label: "Sud"               },
];

type Step = "form" | "otp";

export default function VendorSignUpPage() {
  const router = useRouter();
  const [step, setStep]       = useState<Step>("form");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [form, setForm] = useState({
    name:        "",
    email:       "",
    phone:       "",
    password:    "",
    confirm:     "",
    shopName:    "",
    shopSlug:    "",
    region:      "",
    description: "",
  });

  // Auto-generate slug from shop name
  const handleShopNameChange = (value: string) => {
    setForm({
      ...form,
      shopName: value,
      shopSlug: slugify(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!form.shopName || !form.region) {
      setError("Veuillez renseigner le nom de boutique et la région.");
      return;
    }

    setLoading(true);
    try {
      const res = await signUp.email({
        email:    form.email,
        password: form.password,
        name:     form.name,
        // @ts-ignore
        phone:    form.phone,
        role:     "VENDOR",
        region:   form.region,
      });

      if (res.error) {
        setError(res.error.message ?? "Erreur lors de l'inscription.");
        return;
      }

      // Create vendor profile via server action
      await fetch("/api/vendors/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:      res.data?.user?.id,
          shopName:    form.shopName,
          slug:        form.shopSlug || slugify(form.shopName),
          region:      form.region,
          description: form.description,
          phone:       form.phone,
        }),
      });

      // OTP if phone provided
      if (form.phone) {
        await fetch("/api/otp", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ action: "send", phone: form.phone }),
        });
        setStep("otp");
      } else {
        router.push("/vendor");
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <OTPStep
        phone={form.phone}
        onSuccess={() => { router.push("/vendor"); router.refresh(); }}
        onBack={() => setStep("form")}
      />
    );
  }

  return (
    <div className="w-full max-w-lg animate-fade-up">
      <div className="bg-white rounded-3xl shadow-soft-xl border border-border p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-honey-gradient shadow-honey mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🏪</span>
          </div>
          <h1 className="font-poppins font-bold text-2xl text-foreground">Ouvrez votre boutique</h1>
          <p className="text-muted-foreground text-sm mt-1 font-inter">
            Commencez à vendre sur BEE dès aujourd'hui
          </p>
          <Badge variant="success" size="sm" className="mt-2">Plan Start — Gratuit</Badge>
        </div>

        {/* Role tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted rounded-2xl mb-6">
          {[
            { href: "/sign-up",          label: "Client",  emoji: "🛍️", active: false },
            { href: "/sign-up/vendor",   label: "Vendeur", emoji: "🏪", active: true  },
            { href: "/sign-up/delivery", label: "Livreur", emoji: "🛵", active: false },
          ].map((tab) => (
            tab.active ? (
              <button key={tab.label} className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl bg-white shadow-soft-sm text-foreground font-poppins font-semibold text-xs">
                <span>{tab.emoji}</span><span>{tab.label}</span>
              </button>
            ) : (
              <Link key={tab.label} href={tab.href} className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-muted-foreground hover:text-foreground transition-colors font-poppins font-semibold text-xs">
                <span>{tab.emoji}</span><span>{tab.label}</span>
              </Link>
            )
          ))}
        </div>

        {error && (
          <Alert variant="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account section */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-poppins mb-3">
              Informations personnelles
            </p>
            <div className="space-y-3">
              <Input label="Nom complet" placeholder="Jean Dupont" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                leftIcon={<User size={16} />} required />
              <Input label="Email" type="email" placeholder="votre@email.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                leftIcon={<Mail size={16} />} required />
              <Input label="Téléphone" placeholder="+237 6XX XXX XXX" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                leftIcon={<Phone size={16} />} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Mot de passe" type={showPw ? "text" : "password"} placeholder="Min. 8 caractères"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  leftIcon={<Lock size={16} />} required />
                <Input label="Confirmer" type={showPw ? "text" : "password"} placeholder="Répéter"
                  value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  leftIcon={<Lock size={16} />} required />
              </div>
            </div>
          </div>

          {/* Shop section */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-poppins mb-3 pt-2">
              Informations boutique
            </p>
            <div className="space-y-3">
              <Input label="Nom de la boutique" placeholder="Ma Super Boutique" value={form.shopName}
                onChange={(e) => handleShopNameChange(e.target.value)}
                leftIcon={<Store size={16} />} required />
              <Input label="URL de la boutique" placeholder="ma-super-boutique"
                value={form.shopSlug}
                onChange={(e) => setForm({ ...form, shopSlug: slugify(e.target.value) })}
                hint={`bee.cm/shop/${form.shopSlug || "ma-boutique"}`} />
              <Select label="Région" placeholder="Choisir votre région" value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                options={REGIONS} required />
              <Textarea label="Description (optionnel)" placeholder="Décrivez votre boutique, vos produits…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3} />
            </div>
          </div>

          <Button type="submit" fullWidth isLoading={loading} className="mt-2">
            Créer ma boutique
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground font-inter mt-5">
          Déjà un compte ?{" "}
          <Link href="/sign-in" className="text-primary font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
