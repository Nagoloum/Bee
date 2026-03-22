"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Search, Mail, Phone, Star, Zap, ShoppingCart, Heart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Spinner, Skeleton, ProductCardSkeleton } from "@/components/ui/spinner";
import { Modal, ConfirmModal, Drawer } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Rating } from "@/components/ui/rating";
import { cn } from "@/lib/utils/cn";

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <div className="mb-6">
        <h2 className="font-poppins font-bold text-2xl text-foreground">{title}</h2>
        {description && <p className="text-muted-foreground text-sm mt-1 font-inter">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 font-poppins">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

// ─── Main UI Kit page ────────────────────────────────────────────────────────

export default function UIKitPage() {
  const [showPw, setShowPw]       = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rating, setRating]       = useState(3);
  const [loading, setLoading]     = useState(false);

  const simulateLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-ink-gradient text-white">
        <div className="container-bee py-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-honey-gradient flex items-center justify-center shadow-honey-lg">
              <span className="text-2xl">🐝</span>
            </div>
            <div>
              <h1 className="font-poppins font-black text-3xl md:text-4xl">BEE UI Kit</h1>
              <p className="text-white/60 text-sm font-inter">Phase 1 — Composants de base</p>
            </div>
          </div>
          <p className="text-white/70 font-inter max-w-xl">
            Tous les composants réutilisables du design system BEE. Stack: Next.js 14, TypeScript, Tailwind CSS, Poppins + Inter.
          </p>

          <div className="flex flex-wrap gap-2 mt-6">
            {["Next.js 14", "TypeScript", "Tailwind CSS", "Drizzle ORM", "PostgreSQL"].map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold font-poppins border border-white/20">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container-bee py-12">

        {/* ─── Colors ──────────────────────────────────────────────────────────── */}
        <Section title="🎨 Palette de couleurs" description="Design tokens BEE — honey orange + deep ink">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { name: "Primary",  bg: "bg-primary",      text: "text-white",     hex: "#F6861A" },
              { name: "Honey 50", bg: "bg-honey-50",     text: "text-honey-700", hex: "#FFF8EC" },
              { name: "Honey 200",bg: "bg-honey-200",    text: "text-honey-800", hex: "#FFD98A" },
              { name: "Honey 400",bg: "bg-honey-400",    text: "text-honey-900", hex: "#FFBE4D" },
              { name: "Ink 900",  bg: "bg-ink-900",      text: "text-white",     hex: "#1A1A2E" },
              { name: "Ink 600",  bg: "bg-ink-600",      text: "text-white",     hex: "#434368" },
              { name: "Ink 200",  bg: "bg-ink-200",      text: "text-ink-800",   hex: "#C3C3D7" },
              { name: "Cream",    bg: "bg-cream-200",    text: "text-ink-700",   hex: "#F5F0E6" },
            ].map(color => (
              <div key={color.name} className="flex flex-col gap-2">
                <div className={cn("h-16 rounded-xl", color.bg, "shadow-soft-sm")} />
                <div>
                  <p className="text-xs font-semibold font-poppins text-foreground">{color.name}</p>
                  <p className="text-xs text-muted-foreground font-inter">{color.hex}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
            {[
              { name: "Success", bg: "bg-success",     hex: "#10B981" },
              { name: "Warning", bg: "bg-warning",     hex: "#F59E0B" },
              { name: "Error",   bg: "bg-error",       hex: "#EF4444" },
              { name: "Info",    bg: "bg-info",        hex: "#3B82F6" },
              { name: "Muted",   bg: "bg-muted-foreground", hex: "#74748A" },
            ].map(color => (
              <div key={color.name} className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl shrink-0", color.bg)} />
                <div>
                  <p className="text-xs font-semibold font-poppins text-foreground">{color.name}</p>
                  <p className="text-xs text-muted-foreground font-inter">{color.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Typography ──────────────────────────────────────────────────────── */}
        <Section title="✍️ Typographie" description="Poppins (titres) + Inter (texte courant)">
          <Card padding="lg">
            <div className="space-y-6">
              <div>
                <p className="text-xs text-muted-foreground font-inter mb-2">Poppins Black — Display</p>
                <p className="font-poppins font-black text-5xl text-foreground leading-tight">Le marché qui bourdonne</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-inter mb-2">Poppins Bold — H1</p>
                <h1 className="font-poppins font-bold text-3xl text-foreground">Bienvenue sur BEE Marketplace</h1>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-inter mb-2">Poppins SemiBold — H2</p>
                <h2 className="font-poppins font-semibold text-2xl text-foreground">Produits en vedette</h2>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-inter mb-2">Poppins Medium — H3</p>
                <h3 className="font-poppins font-medium text-xl text-foreground">Catégorie Électronique</h3>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-inter mb-2">Inter Regular — Body</p>
                <p className="font-inter text-base text-foreground-secondary leading-relaxed max-w-lg">
                  Des milliers de produits auprès des meilleurs vendeurs du Cameroun. Livraison rapide partout dans le pays, paiement sécurisé.
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-inter mb-2">Inter Small — Caption</p>
                <p className="font-inter text-sm text-muted-foreground">Commande confirmée · Il y a 5 minutes · #BEE-A3K7F</p>
              </div>
            </div>
          </Card>
        </Section>

        {/* ─── Buttons ─────────────────────────────────────────────────────────── */}
        <Section title="🔘 Boutons" description="Tous les variants et tailles">
          <Card padding="lg">
            <Row label="Variants">
              <Button variant="default">Primaire</Button>
              <Button variant="secondary">Secondaire</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="outline-ink">Outline Ink</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="ghost-primary">Ghost Primary</Button>
              <Button variant="destructive">Supprimer</Button>
              <Button variant="success">Confirmer</Button>
              <Button variant="link">Lien</Button>
            </Row>

            <Row label="Tailles">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </Row>

            <Row label="Avec icônes">
              <Button leftIcon={<ShoppingCart size={16} />}>Ajouter au panier</Button>
              <Button rightIcon={<Zap size={16} />} variant="outline">Vente Flash</Button>
              <Button leftIcon={<Heart size={16} />} variant="ghost-primary">Favori</Button>
              <Button size="icon" variant="outline"><Search size={18} /></Button>
              <Button size="icon"><ShoppingCart size={18} /></Button>
            </Row>

            <Row label="États">
              <Button isLoading>Chargement</Button>
              <Button isLoading loadingText="Traitement en cours…" variant="outline">Payer</Button>
              <Button disabled>Désactivé</Button>
              <Button rounded="full">Arrondi</Button>
              <Button fullWidth className="max-w-xs">Pleine largeur</Button>
            </Row>
          </Card>
        </Section>

        {/* ─── Inputs ──────────────────────────────────────────────────────────── */}
        <Section title="📝 Champs de saisie" description="Input, Textarea, Select avec états">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding="lg">
              <div className="space-y-4">
                <Input label="Email" placeholder="votre@email.com" type="email" leftIcon={<Mail size={16} />} />
                <Input label="Téléphone" placeholder="+237 6XX XXX XXX" leftIcon={<Phone size={16} />} hint="Format: +237 suivi de 9 chiffres" />
                <Input
                  label="Mot de passe"
                  type={showPw ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  rightIcon={showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  onRightIconClick={() => setShowPw(!showPw)}
                />
                <Input label="Recherche" placeholder="Rechercher un produit…" leftIcon={<Search size={16} />} />
              </div>
            </Card>

            <Card padding="lg">
              <div className="space-y-4">
                <Input
                  label="Champ avec erreur"
                  placeholder="Entrez votre email"
                  defaultValue="email-invalide"
                  error="Adresse email invalide"
                  leftIcon={<Mail size={16} />}
                />
                <Input label="Champ requis" placeholder="Nom complet" required />
                <Input label="Champ désactivé" placeholder="Non modifiable" disabled defaultValue="admin@bee.cm" />
                <Select
                  label="Région"
                  placeholder="Choisir une région"
                  options={[
                    { value: "CM-CE", label: "Centre (Yaoundé)" },
                    { value: "CM-LT", label: "Littoral (Douala)" },
                    { value: "CM-OU", label: "Ouest" },
                    { value: "CM-NO", label: "Nord" },
                    { value: "CM-EN", label: "Extrême-Nord" },
                  ]}
                />
              </div>
            </Card>

            <Card padding="lg" className="md:col-span-2">
              <Textarea
                label="Description de la boutique"
                placeholder="Décrivez votre boutique, vos produits, vos conditions de vente…"
                rows={4}
                hint="Maximum 500 caractères"
              />
            </Card>
          </div>
        </Section>

        {/* ─── Badges ──────────────────────────────────────────────────────────── */}
        <Section title="🏷️ Badges" description="Statuts, labels, indicateurs">
          <Card padding="lg">
            <Row label="Variants">
              <Badge variant="default">En stock</Badge>
              <Badge variant="secondary">Vendeur Pro</Badge>
              <Badge variant="success">Livré</Badge>
              <Badge variant="warning">En attente</Badge>
              <Badge variant="error">Rupture</Badge>
              <Badge variant="info">Nouveau</Badge>
              <Badge variant="muted">Archivé</Badge>
              <Badge variant="solid">Primaire</Badge>
              <Badge variant="premium">⭐ Elite</Badge>
            </Row>

            <Row label="Avec point de statut">
              <Badge variant="success" dot>En ligne</Badge>
              <Badge variant="error" dot>Hors ligne</Badge>
              <Badge variant="warning" dot>En livraison</Badge>
              <Badge variant="info" dot>En préparation</Badge>
            </Row>

            <Row label="Tailles">
              <Badge size="xs">XS</Badge>
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </Row>

            <Row label="Exemples contextuels">
              <Badge variant="premium" size="md">🐝 Fiable</Badge>
              <Badge variant="solid">Flash -30%</Badge>
              <Badge variant="success" dot size="md">CONFIRMÉE</Badge>
              <Badge variant="warning" size="md">PENDING</Badge>
              <Badge variant="info">Plan Start</Badge>
              <Badge variant="solid" className="bg-purple-500">Plan Pro</Badge>
              <Badge variant="premium">Plan Elite</Badge>
            </Row>
          </Card>
        </Section>

        {/* ─── Cards ───────────────────────────────────────────────────────────── */}
        <Section title="🃏 Cards" description="Containers et surfaces">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card variant="default" hover="lift" padding="md">
              <CardHeader>
                <CardTitle>Card Default</CardTitle>
                <CardDescription>Avec hover lift et ombre douce.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground-secondary font-inter">Contenu de la carte avec padding standard.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="honey" hover="border" padding="md">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
                  <Zap size={20} className="text-primary" />
                </div>
                <CardTitle>Card Honey</CardTitle>
                <CardDescription>Fond crème avec bordure miel.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground-secondary font-inter">Idéale pour les appels à l'action promotionnels.</p>
              </CardContent>
            </Card>

            <Card variant="ink" hover="glow" padding="md">
              <CardHeader>
                <CardTitle className="text-white">Card Dark</CardTitle>
                <CardDescription className="text-white/60">Fond ink navy profond.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70 font-inter">Pour les éléments premium et les panneaux de statistiques.</p>
              </CardContent>
              <CardFooter className="border-white/10">
                <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                  Voir plus
                </Button>
              </CardFooter>
            </Card>

            {/* Stat cards */}
            {[
              { label: "Ventes du mois", value: "1 234 500 FCFA", delta: "+12%",  color: "text-success" },
              { label: "Commandes",       value: "342",           delta: "+8%",   color: "text-info"    },
              { label: "Clients actifs",  value: "1 890",         delta: "+24%",  color: "text-primary" },
            ].map(stat => (
              <Card key={stat.label} variant="default" hover="lift" padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground font-poppins uppercase tracking-wider">{stat.label}</p>
                    <p className="font-poppins font-bold text-2xl text-foreground mt-2">{stat.value}</p>
                  </div>
                  <Badge variant="success" size="xs">{stat.delta}</Badge>
                </div>
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-3/4 transition-all" />
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* ─── Avatars ─────────────────────────────────────────────────────────── */}
        <Section title="👤 Avatars" description="Avec image, initiales et groupe">
          <Card padding="lg">
            <Row label="Tailles">
              <Avatar name="Amina Kolo" size="xs" color="random" />
              <Avatar name="Jean-Pierre Mvondo" size="sm" color="random" />
              <Avatar name="Fatima Al-Hassan" size="md" color="random" />
              <Avatar name="David Nkeng" size="lg" color="random" />
              <Avatar name="Sandrine Fouda" size="xl" color="random" />
              <Avatar name="Marcus Tamba" size="2xl" color="random" />
            </Row>

            <Row label="Avec indicateur en ligne">
              <Avatar name="Amina Kolo" size="md" color="random" online={true} />
              <Avatar name="Jean Mvondo" size="md" color="random" online={false} />
              <Avatar name="Fatima Al" size="lg" color="random" online={true} />
            </Row>

            <Row label="Groupe d'avatars">
              <AvatarGroup
                avatars={[
                  { name: "Amina K" },
                  { name: "Jean M" },
                  { name: "Fatima A" },
                  { name: "David N" },
                  { name: "Sandrine F" },
                  { name: "Marcus T" },
                ]}
                max={4}
              />
              <AvatarGroup
                avatars={[{ name: "A" }, { name: "B" }, { name: "C" }]}
                size="lg"
                max={3}
              />
            </Row>
          </Card>
        </Section>

        {/* ─── Alerts ──────────────────────────────────────────────────────────── */}
        <Section title="⚠️ Alertes" description="Messages contextuels">
          <div className="space-y-3">
            <Alert variant="success" title="Commande confirmée !">
              Votre commande #BEE-A3K7F a été confirmée par le vendeur. Livraison prévue demain.
            </Alert>
            <Alert variant="warning" title="Stock limité">
              Il reste seulement 3 articles en stock. Commandez vite !
            </Alert>
            <Alert variant="error" title="Paiement échoué" onClose={() => {}}>
              Le paiement n'a pas pu être traité. Vérifiez vos informations bancaires.
            </Alert>
            <Alert variant="info" title="Compte en cours de vérification">
              Votre boutique est en cours de validation par notre équipe (24-48h).
            </Alert>
            <Alert variant="default">
              Mettez à jour votre profil pour améliorer votre visibilité sur la plateforme.
            </Alert>
          </div>
        </Section>

        {/* ─── Rating ──────────────────────────────────────────────────────────── */}
        <Section title="⭐ Notation" description="Système d'étoiles interactif">
          <Card padding="lg">
            <Row label="Lecture seule">
              <Rating value={5} size="sm" showValue />
              <Rating value={4.3} size="md" showValue />
              <Rating value={3.7} size="lg" showValue />
              <Rating value={2.1} size="sm" showValue />
            </Row>
            <Row label="Interactif">
              <div className="flex items-center gap-4">
                <Rating value={rating} size="lg" readonly={false} onChange={setRating} showValue />
                <p className="text-sm text-muted-foreground font-inter">Cliquez pour noter</p>
              </div>
            </Row>
          </Card>
        </Section>

        {/* ─── Loading states ───────────────────────────────────────────────────── */}
        <Section title="⏳ États de chargement" description="Spinners et skeletons">
          <Card padding="lg">
            <Row label="Spinners">
              <Spinner size="xs" />
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <Spinner size="xl" />
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Spinner size="md" color="white" />
              </div>
            </Row>

            <div className="mt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 font-poppins">
                Skeleton Produits
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <ProductCardSkeleton key={i} />)}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 font-poppins">
                Skeleton Texte
              </p>
              <div className="space-y-3 max-w-md">
                <Skeleton height={24} width="60%" />
                <Skeleton height={16} />
                <Skeleton height={16} width="85%" />
                <Skeleton height={16} width="70%" />
                <div className="flex gap-3 pt-2">
                  <Skeleton height={40} width={120} rounded="xl" />
                  <Skeleton height={40} width={40} rounded="xl" />
                </div>
              </div>
            </div>
          </Card>
        </Section>

        {/* ─── Modals ──────────────────────────────────────────────────────────── */}
        <Section title="💬 Modals & Drawers" description="Overlays et panneaux">
          <Card padding="lg">
            <Row label="Ouvrir">
              <Button onClick={() => setModalOpen(true)}>
                Ouvrir Modal
              </Button>
              <Button variant="outline" onClick={() => setConfirmOpen(true)}>
                Modal Confirmation
              </Button>
              <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
                Ouvrir Drawer
              </Button>
            </Row>
          </Card>

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Ajouter un produit"
            description="Renseignez les informations de votre nouveau produit"
            size="md"
          >
            <div className="space-y-4">
              <Input label="Nom du produit" placeholder="Ex: iPhone 14 Pro" required />
              <Select
                label="Catégorie"
                placeholder="Choisir une catégorie"
                options={[
                  { value: "elec", label: "Électronique" },
                  { value: "mode", label: "Mode & Vêtements" },
                ]}
              />
              <Input label="Prix" placeholder="0 FCFA" type="number" />
              <div className="flex gap-3 pt-2">
                <Button variant="outline" fullWidth onClick={() => setModalOpen(false)}>
                  Annuler
                </Button>
                <Button fullWidth leftIcon={<Check size={16} />}>
                  Enregistrer
                </Button>
              </div>
            </div>
          </Modal>

          <ConfirmModal
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => { setConfirmOpen(false); }}
            title="Supprimer ce produit ?"
            description="Cette action est irréversible. Le produit sera définitivement supprimé de votre boutique."
            confirmLabel="Oui, supprimer"
            cancelLabel="Non, annuler"
            variant="destructive"
          />

          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="Filtres"
          >
            <div className="space-y-4">
              <Select
                label="Catégorie"
                placeholder="Toutes les catégories"
                options={[
                  { value: "elec", label: "Électronique" },
                  { value: "mode", label: "Mode" },
                ]}
              />
              <Input label="Prix maximum" placeholder="100 000 FCFA" type="number" />
              <Button fullWidth onClick={() => setDrawerOpen(false)}>
                Appliquer les filtres
              </Button>
            </div>
          </Drawer>
        </Section>

        {/* ─── Product card preview ────────────────────────────────────────────── */}
        <Section title="🛍️ Aperçu Carte Produit" description="Exemple d'utilisation combinée">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { name: "Samsung Galaxy A54",  price: 125000, original: 145000, rating: 4.5, sold: 128, badge: "Populaire", badgeVariant: "solid" as const },
              { name: "Sac à main en cuir",   price: 35000,  original: null,   rating: 4.8, sold: 67,  badge: "Nouveau",  badgeVariant: "info"  as const },
              { name: "Écouteurs Bluetooth",  price: 18500,  original: 25000,  rating: 4.2, sold: 234, badge: "Flash -26%",badgeVariant: "default" as const },
              { name: "Robe en wax Kente",    price: 22000,  original: null,   rating: 5.0, sold: 45,  badge: null,        badgeVariant: null },
            ].map((product) => (
              <Card key={product.name} variant="default" hover="lift" padding="none" className="overflow-hidden">
                {/* Image placeholder */}
                <div className="relative bg-cream-200 h-48 flex items-center justify-center">
                  <span className="text-5xl opacity-30">🛍️</span>
                  {product.badge && (
                    <div className="absolute top-3 left-3">
                      <Badge variant={product.badgeVariant ?? "default"} size="xs">
                        {product.badge}
                      </Badge>
                    </div>
                  )}
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center hover:bg-white transition-colors shadow-soft-sm">
                    <Heart size={14} className="text-muted-foreground" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="font-poppins font-semibold text-sm text-foreground line-clamp-2 leading-snug mb-2">
                    {product.name}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <Rating value={product.rating} size="sm" />
                    <span className="text-xs text-muted-foreground font-inter">{product.rating} ({product.sold})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-poppins font-bold text-base text-foreground">
                        {product.price.toLocaleString("fr-CM")} FCFA
                      </p>
                      {product.original && (
                        <p className="text-xs text-muted-foreground line-through font-inter">
                          {product.original.toLocaleString("fr-CM")} FCFA
                        </p>
                      )}
                    </div>
                    <Button size="icon-sm" className="shrink-0">
                      <ShoppingCart size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* ─── Shadows ─────────────────────────────────────────────────────────── */}
        <Section title="🌥️ Ombres" description="Système d'ombres BEE">
          <div className="flex flex-wrap gap-6">
            {[
              { label: "soft-sm", cls: "shadow-soft-sm" },
              { label: "soft",    cls: "shadow-soft" },
              { label: "soft-md", cls: "shadow-soft-md" },
              { label: "soft-lg", cls: "shadow-soft-lg" },
              { label: "honey",   cls: "shadow-honey" },
              { label: "honey-lg",cls: "shadow-honey-lg" },
              { label: "glow",    cls: "shadow-glow" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={cn("w-20 h-20 rounded-2xl bg-white mb-3", s.cls)} />
                <p className="text-xs font-inter text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer status */}
        <div className="mt-8 p-6 rounded-2xl bg-ink-gradient text-white text-center">
          <p className="font-poppins font-bold text-xl mb-1">✅ Phase 1 — Complète</p>
          <p className="text-white/60 font-inter text-sm">
            Fondations · DB Schema · i18n · Composants UI · Layout Storefront
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["DB connectée", "10 tables", "2 langues", "9 composants", "Design System"].map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold font-poppins">
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
