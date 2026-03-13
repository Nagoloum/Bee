"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone, Bike, MapPin } from "lucide-react";
import { signUp } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { OTPStep } from "@/components/auth/otp-step";

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

const VEHICLES = [
  { value: "moto",     label: "🏍️ Moto"       },
  { value: "velo",     label: "🚲 Vélo"        },
  { value: "voiture",  label: "🚗 Voiture"     },
  { value: "a_pied",   label: "🚶 À pied"      },
];

type Step = "form" | "otp";

export default function DeliverySignUpPage() {
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
    region:      "",
    vehicleType: "",
    vehiclePlate:"",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!form.phone) {
      setError("Le numéro de téléphone est obligatoire pour les livreurs.");
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
        role:     "DELIVERY",
        region:   form.region,
      });

      if (res.error) {
        setError(res.error.message ?? "Erreur lors de l'inscription.");
        return;
      }

      // Create delivery agent profile
      await fetch("/api/delivery/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:       res.data?.user?.id,
          region:       form.region,
          vehicleType:  form.vehicleType,
          vehiclePlate: form.vehiclePlate,
          phone:        form.phone,
        }),
      });

      // Send OTP (required for delivery agents)
      await fetch("/api/otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "send", phone: form.phone }),
      });
      setStep("otp");
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
        onSuccess={() => { router.push("/delivery"); router.refresh(); }}
        onBack={() => setStep("form")}
        required
      />
    );
  }

  return (
    <div className="w-full max-w-lg animate-fade-up">
      <div className="bg-white rounded-3xl shadow-soft-xl border border-border p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-ink-gradient shadow-soft-md mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🛵</span>
          </div>
          <h1 className="font-poppins font-bold text-2xl text-foreground">Livrez avec BEE</h1>
          <p className="text-muted-foreground text-sm mt-1 font-inter">
            Gagnez 500 FCFA par livraison, à votre rythme
          </p>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant="success" size="sm">500 FCFA/livraison</Badge>
            <Badge variant="info" size="sm">Badge Fiable</Badge>
          </div>
        </div>

        {/* Role tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted rounded-2xl mb-6">
          {[
            { href: "/sign-up",          label: "Client",  emoji: "🛍️", active: false },
            { href: "/sign-up/vendor",   label: "Vendeur", emoji: "🏪", active: false },
            { href: "/sign-up/delivery", label: "Livreur", emoji: "🛵", active: true  },
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
                leftIcon={<Phone size={16} />} required
                hint="Requis — pour recevoir les commandes" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Mot de passe" type={showPw ? "text" : "password"} placeholder="Min. 8 car."
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  leftIcon={<Lock size={16} />} required />
                <Input label="Confirmer" type={showPw ? "text" : "password"} placeholder="Répéter"
                  value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  leftIcon={<Lock size={16} />} required />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-poppins mb-3 pt-2">
              Informations livraison
            </p>
            <div className="space-y-3">
              <Select label="Région d'activité" placeholder="Choisir votre région" value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                options={REGIONS} required />
              <Select label="Moyen de transport" placeholder="Choisir" value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                options={VEHICLES} />
              <Input label="Plaque d'immatriculation" placeholder="LT 1234 A (optionnel)"
                value={form.vehiclePlate}
                onChange={(e) => setForm({ ...form, vehiclePlate: e.target.value })} />
            </div>
          </div>

          <Button type="submit" fullWidth isLoading={loading} variant="secondary" className="mt-2">
            Créer mon compte livreur
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
