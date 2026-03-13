"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, ShieldCheck, LogOut, Store, Truck } from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import type { UserRole } from "@/types";

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

const ROLE_LABELS: Record<UserRole, { label: string; variant: any; emoji: string }> = {
  CLIENT:   { label: "Client",   variant: "info",    emoji: "🛍️" },
  VENDOR:   { label: "Vendeur",  variant: "default", emoji: "🏪" },
  DELIVERY: { label: "Livreur",  variant: "secondary",emoji: "🛵" },
  ADMIN:    { label: "Admin",    variant: "premium", emoji: "👑" },
};

interface AccountClientProps {
  user: {
    id:            string;
    name:          string;
    email:         string;
    image?:        string | null;
    role:          UserRole;
    phone?:        string;
    phoneVerified: boolean;
    emailVerified: boolean;
    region?:       string;
  };
}

export function AccountClient({ user }: AccountClientProps) {
  const router    = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");

  const [form, setForm] = useState({
    name:   user.name,
    phone:  user.phone  ?? "",
    region: user.region ?? "",
  });

  const roleInfo = ROLE_LABELS[user.role] ?? ROLE_LABELS.CLIENT;

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Server action / API call will be added in Phase 4+
      await new Promise((r) => setTimeout(r, 800)); // simulate
      setSuccess("Profil mis à jour avec succès !");
      setEditing(false);
    } catch {
      setError("Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-bee section-bee max-w-2xl">
      <h1 className="font-poppins font-bold text-2xl text-foreground mb-6">Mon compte</h1>

      {success && <Alert variant="success" className="mb-4" onClose={() => setSuccess("")}>{success}</Alert>}
      {error   && <Alert variant="error"   className="mb-4" onClose={() => setError("")}>{error}</Alert>}

      {/* Profile card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar src={user.image} name={user.name} size="xl" color="random" ring />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-poppins font-bold text-xl text-foreground">{user.name}</h2>
                <Badge variant={roleInfo.variant} size="sm">
                  {roleInfo.emoji} {roleInfo.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-inter mt-0.5">{user.email}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-success font-inter">
                    <ShieldCheck size={12} /> Email vérifié
                  </span>
                ) : (
                  <span className="text-xs text-warning font-inter">Email non vérifié</span>
                )}
                {user.phoneVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-success font-inter">
                    <ShieldCheck size={12} /> Téléphone vérifié
                  </span>
                ) : (
                  user.phone && <span className="text-xs text-warning font-inter">Téléphone non vérifié</span>
                )}
              </div>
            </div>
            <Button
              variant={editing ? "outline" : "outline-ink"}
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              {editing ? "Annuler" : "Modifier"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      {editing ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Modifier le profil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="Nom complet" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                leftIcon={<User size={16} />} required />
              <Input label="Téléphone" placeholder="+237 6XX XXX XXX" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                leftIcon={<Phone size={16} />} />
              <Select label="Région" value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                options={REGIONS} placeholder="Choisir votre région" />
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditing(false)}>Annuler</Button>
                <Button type="submit" isLoading={saving}>Enregistrer</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* Info display */
        <Card className="mb-6">
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: User,    label: "Nom",       value: user.name          },
                { icon: Mail,    label: "Email",      value: user.email         },
                { icon: Phone,   label: "Téléphone",  value: user.phone || "—"  },
                { icon: MapPin,  label: "Région",     value: user.region
                  ? REGIONS.find(r => r.value === user.region)?.label ?? user.region
                  : "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <Icon size={16} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground font-inter w-24 shrink-0">{label}</span>
                  <span className="text-sm font-medium text-foreground font-inter">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard links based on role */}
      {user.role === "VENDOR" && (
        <Card variant="honey" className="mb-6" hover="border">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Store size={20} className="text-primary" />
                <div>
                  <p className="font-poppins font-semibold text-sm text-foreground">Ma boutique vendeur</p>
                  <p className="text-xs text-muted-foreground font-inter">Gérer produits, commandes, stats</p>
                </div>
              </div>
              <Button size="sm" onClick={() => router.push("/vendor")}>
                Accéder →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {user.role === "DELIVERY" && (
        <Card variant="honey" className="mb-6" hover="border">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck size={20} className="text-primary" />
                <div>
                  <p className="font-poppins font-semibold text-sm text-foreground">Mon espace livreur</p>
                  <p className="text-xs text-muted-foreground font-inter">Commandes disponibles, wallet</p>
                </div>
              </div>
              <Button size="sm" onClick={() => router.push("/delivery")}>
                Accéder →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logout */}
      <Button
        variant="ghost"
        className="text-error hover:bg-error/5 w-full"
        onClick={handleLogout}
        leftIcon={<LogOut size={16} />}
      >
        Se déconnecter
      </Button>
    </div>
  );
}
