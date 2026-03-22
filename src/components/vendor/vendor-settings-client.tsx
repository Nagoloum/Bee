"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";
import { slugify } from "@/lib/utils/cn";

const REGIONS = [
  { value:"CM-CE",label:"Centre (Yaoundé)"  },{ value:"CM-LT",label:"Littoral (Douala)" },
  { value:"CM-OU",label:"Ouest"             },{ value:"CM-NO",label:"Nord"              },
  { value:"CM-EN",label:"Extrême-Nord"      },{ value:"CM-NW",label:"Nord-Ouest"        },
  { value:"CM-SW",label:"Sud-Ouest"         },{ value:"CM-AD",label:"Adamaoua"          },
  { value:"CM-ES",label:"Est"               },{ value:"CM-SU",label:"Sud"               },
];


// Delete old file from UploadThing via API
async function deleteOldFile(oldUrl: string): Promise<void> {
  await fetch("/api/uploadthing/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: oldUrl }),
  }).catch(console.warn);
}

interface Props {
  vendor: {
    id: string; shopName: string; slug: string; description?: string | null;
    region: string; phone?: string | null; email?: string | null;
    logo?: string | null; banner?: string | null; isVerified: boolean;
  };
}

export function VendorSettingsClient({ vendor }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [success,setSuccess]= useState("");

  const [form, setForm] = useState({
    shopName:    vendor.shopName,
    slug:        vendor.slug,
    description: vendor.description ?? "",
    region:      vendor.region,
    phone:       vendor.phone   ?? "",
    email:       vendor.email   ?? "",
    logo:        vendor.logo    ?? "",
    banner:      vendor.banner  ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess(""); setSaving(true);
    try {
      const res = await fetch(`/api/vendor/settings/${vendor.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur."); return; }
      setSuccess("Paramètres sauvegardés !");
      router.refresh();
    } catch { setError("Une erreur est survenue."); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error   && <Alert variant="error"   onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Logo + Banner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Visuels de la boutique
            {vendor.isVerified && <Badge variant="info" size="xs">✓ Vérifié</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ImageUpload
              endpoint="vendorLogo"
              value={form.logo}
              onChange={(url) => setForm(prev => ({ ...prev, logo: url as string }))}
              onDeleteOld={deleteOldFile}
              fileNameContext={{ shopName: form.shopName }}
              label="Logo de la boutique"
              hint="Format carré recommandé · Max 2 Mo"
              shape="square"
            />
            <ImageUpload
              endpoint="vendorBanner"
              value={form.banner}
              onChange={(url) => setForm(prev => ({ ...prev, banner: url as string }))}
              onDeleteOld={deleteOldFile}
              fileNameContext={{ shopName: form.shopName }}
              label="Bannière (image de couverture)"
              hint="Format 3:1 recommandé (ex: 1200×400) · Max 2 Mo"
              shape="banner"
            />
          </div>
        </CardContent>
      </Card>

      {/* Infos boutique */}
      <Card>
        <CardHeader><CardTitle>Informations de la boutique</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nom de la boutique" value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })} required />
            <Input label="URL (slug)" value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              hint={`bee.cm/shop/${form.slug}`} />
          </div>
          <Select label="Région" options={REGIONS} value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })} required />
          <Textarea label="Description" rows={3} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            hint="Présentez votre boutique aux acheteurs" />
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Téléphone / WhatsApp" placeholder="+237 6XX XXX XXX"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email de contact" type="email" placeholder="boutique@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" isLoading={saving} size="lg" fullWidth>
        Sauvegarder les paramètres
      </Button>
    </form>
  );
}
