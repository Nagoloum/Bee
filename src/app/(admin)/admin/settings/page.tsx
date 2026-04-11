"use client";

import { useState, useEffect } from "react";
import { Save, Settings } from "lucide-react";

const DEFAULTS = {
  deliveryFeeBase:    500,
  deliveryFeeExpress: 1000,
  commissionRate:     10,
  planProPrice:       5000,
  planElitePrice:     15000,
  planDeliveryPrem:   3000,
  contactEmail:       "contact@bee.cm",
  supportPhone:       "+33 6 25 83 90 07",
  address:            "Cameroun",
  instagram:          "https://instagram.com/beecm",
  facebook:           "https://facebook.com/beecm",
  twitter:            "https://twitter.com/beecm",
  whatsapp:           "+237699000000",
};

export default function AdminSettingsPage() {
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [config,  setConfig]  = useState(DEFAULTS);

  // ✅ FIX: load from DB on mount
  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        setConfig({
          deliveryFeeBase:    data.deliveryFeeBase    ?? DEFAULTS.deliveryFeeBase,
          deliveryFeeExpress: data.deliveryFeeExpress ?? DEFAULTS.deliveryFeeExpress,
          commissionRate:     data.commissionRate     ?? DEFAULTS.commissionRate,
          planProPrice:       data.planProPrice       ?? DEFAULTS.planProPrice,
          planElitePrice:     data.planElitePrice     ?? DEFAULTS.planElitePrice,
          planDeliveryPrem:   data.planDeliveryPrem   ?? DEFAULTS.planDeliveryPrem,
          contactEmail:       data.contactEmail       ?? DEFAULTS.contactEmail,
          supportPhone:       data.supportPhone       ?? DEFAULTS.supportPhone,
          address:            data.address            ?? DEFAULTS.address,
          instagram:          data.instagram          ?? DEFAULTS.instagram,
          facebook:           data.facebook           ?? DEFAULTS.facebook,
          twitter:            data.twitter            ?? DEFAULTS.twitter,
          whatsapp:           data.whatsapp           ?? DEFAULTS.whatsapp,
        });
      })
      .catch(() => {/* keep defaults */})
      .finally(() => setLoading(false));
  }, []);

  // ✅ FIX: save to DB via API
  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(config),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {}
    finally { setSaving(false); }
  };

  type Section = {
    title: string;
    fields: { key: keyof typeof config; label: string; type?: string; min?: number; max?: number; suffix?: string }[];
  };

  const SECTIONS: Section[] = [
    {
      title: "Tarifs & Commissions",
      fields: [
        { key:"deliveryFeeBase",    label:"Frais livraison standard (FCFA)", type:"number", min:0, suffix:"FCFA" },
        { key:"deliveryFeeExpress", label:"Frais livraison express (FCFA)",  type:"number", min:0, suffix:"FCFA" },
        { key:"commissionRate",     label:"Commission plateforme (%)",       type:"number", min:1, max:30, suffix:"%" },
      ],
    },
    {
      title: "Prix des abonnements (FCFA/mois)",
      fields: [
        { key:"planProPrice",     label:"Plan Vendeur Pro",      type:"number", min:0 },
        { key:"planElitePrice",   label:"Plan Vendeur Elite",    type:"number", min:0 },
        { key:"planDeliveryPrem", label:"Plan Livreur Premium",  type:"number", min:0 },
      ],
    },
    {
      title: "Contact & Support",
      fields: [
        { key:"contactEmail", label:"Email de contact"   },
        { key:"supportPhone", label:"Téléphone support"  },
        { key:"address",      label:"Adresse du siège"   },
      ],
    },
    {
      title: "Réseaux sociaux",
      fields: [
        { key:"instagram", label:"Instagram URL"   },
        { key:"facebook",  label:"Facebook URL"    },
        { key:"twitter",   label:"Twitter / X URL" },
        { key:"whatsapp",  label:"WhatsApp Business"},
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-poppins font-black text-2xl text-white flex items-center gap-2">
            <Settings size={22} className="text-[#9b7fff]" /> Paramètres système
          </h1>
          <p className="text-sm font-inter mt-0.5" style={{ color: "rgba(232,234,240,0.4)" }}>
            Configuration globale de la plateforme BEE
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving || loading}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold font-poppins text-white transition-all disabled:opacity-50"
          style={{
            background: saved ? "rgba(34,211,165,0.8)" : "linear-gradient(135deg,#7c5cfc,#9b7fff)",
            boxShadow:  "0 0 16px rgba(124,92,252,0.3)",
          }}>
          <Save size={14} />
          {saving ? "Sauvegarde…" : saved ? "Sauvegardé ✓" : "Enregistrer"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-[#9b7fff] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-inter mt-3" style={{ color: "rgba(232,234,240,0.4)" }}>Chargement…</p>
        </div>
      ) : (
        SECTIONS.map(section => (
          <div key={section.title} className="rounded-2xl p-5 space-y-4"
            style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}>
            <h2 className="font-poppins font-bold text-sm text-white border-b pb-3"
              style={{ borderColor: "var(--adm-border)" }}>
              {section.title}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {section.fields.map(({ key, label, type, min, max, suffix }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold font-poppins mb-1.5"
                    style={{ color: "rgba(232,234,240,0.5)" }}>
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type={type ?? "text"}
                      min={min}
                      max={max}
                      value={config[key]}
                      onChange={e => setConfig(p => ({
                        ...p,
                        [key]: type === "number" ? Number(e.target.value) : e.target.value,
                      }))}
                      className="w-full h-10 px-3 rounded-xl text-sm font-inter text-white focus:outline-none transition-colors"
                      style={{
                        background: "var(--adm-surface2)",
                        border:     "1px solid var(--adm-border)",
                      }}
                    />
                    {suffix && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-inter"
                        style={{ color: "rgba(232,234,240,0.3)" }}>
                        {suffix}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
