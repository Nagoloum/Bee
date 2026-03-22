"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, HelpCircle, Briefcase } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const SUBJECTS = [
  { value:"support",      label:"Support client"          },
  { value:"vendor",       label:"Je suis vendeur"         },
  { value:"delivery",     label:"Je suis livreur"         },
  { value:"partnership",  label:"Partenariat / B2B"       },
  { value:"press",        label:"Presse / Médias"         },
  { value:"bug",          label:"Signaler un bug"         },
  { value:"other",        label:"Autre"                   },
];

export default function ContactPage() {
  const [form, setForm]       = useState({ name:"", email:"", subject:"", message:"" });
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSending(true);
    await new Promise(r => setTimeout(r, 1000)); // TODO: connect to email service
    setSent(true); setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-ink-900 py-14">
        <div className="container-bee max-w-2xl mx-auto text-center">
          <h1 className="font-poppins font-black text-4xl text-white mb-4">Contactez-nous</h1>
          <p className="text-white/50 font-inter">Notre équipe répond en moins de 24h ouvrées.</p>
        </div>
      </div>

      <div className="container-bee py-14">
        <div className="grid lg:grid-cols-3 gap-10 max-w-5xl mx-auto">

          {/* Contact infos */}
          <div className="space-y-5">
            <div>
              <p className="font-poppins font-bold text-sm text-foreground mb-4">Nous trouver</p>
              {[
                { icon:Mail,    label:"Email",      value:"contact@bee.cm",    href:"mailto:contact@bee.cm" },
                { icon:Phone,   label:"Téléphone",  value:"+33 6 25 83 90 07", href:"tel:+33625839007" },
                { icon:MapPin,  label:"Localisation",value:"Cameroun",          href:"#" },
              ].map(({ icon:Icon, label, value, href }) => (
                <a key={label} href={href}
                  className="flex items-start gap-3 py-3 border-b border-border last:border-0 hover:text-primary transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-inter">{label}</p>
                    <p className="text-sm font-semibold font-poppins text-foreground">{value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* FAQ links */}
            <div className="bg-cream-100 rounded-2xl p-5">
              <p className="font-poppins font-bold text-sm text-foreground mb-3">Questions fréquentes</p>
              <div className="space-y-2">
                {[
                  { icon:HelpCircle,    label:"Centre d'aide",     href:"#" },
                  { icon:Briefcase,     label:"Devenir vendeur",    href:"/sign-up/vendor" },
                  { icon:MessageSquare, label:"Chat en direct",     href:"#" },
                ].map(({ icon:Icon, label, href }) => (
                  <a key={label} href={href}
                    className="flex items-center gap-2.5 text-sm text-foreground-secondary hover:text-primary transition-colors font-inter">
                    <Icon size={14} className="text-muted-foreground" /> {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-border p-8">
              <h2 className="font-poppins font-bold text-xl text-foreground mb-6">Envoyer un message</h2>

              {sent ? (
                <Alert variant="success">
                  <p className="font-semibold font-poppins mb-1">Message envoyé !</p>
                  <p className="text-sm">Nous vous répondrons dans les 24h ouvrées. Merci de votre confiance.</p>
                </Alert>
              ) : (
                <>
                  {error && <Alert variant="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Nom complet" placeholder="Jean Dupont" value={form.name}
                        onChange={e => setForm({...form, name:e.target.value})} required />
                      <Input label="Email" type="email" placeholder="jean@email.com" value={form.email}
                        onChange={e => setForm({...form, email:e.target.value})} required />
                    </div>
                    <Select label="Sujet" placeholder="Choisir un sujet" options={SUBJECTS} value={form.subject}
                      onChange={e => setForm({...form, subject:e.target.value})} required />
                    <Textarea label="Message" placeholder="Décrivez votre demande en détail…" rows={5}
                      value={form.message} onChange={e => setForm({...form, message:e.target.value})} required />
                    <Button type="submit" isLoading={sending} leftIcon={<Send size={16}/>} size="lg">
                      Envoyer le message
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
