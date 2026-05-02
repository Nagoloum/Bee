'use client';

import { useState } from 'react';
import {
  Heart,
  ShoppingCart,
  Star,
  Mail,
  Lock,
  Search,
  Inbox,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

import { Button, ButtonGroup } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputGroup } from '@/components/ui/input-group';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Field } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Toggle, ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Progress } from '@/components/ui/progress';
import { Empty } from '@/components/ui/empty';
import { toast } from '@/components/ui/toast';

import { ShopTierBadge, CourierTierBadge } from '@/components/composed/tier-badge';
import { OrderStatusBadge } from '@/components/composed/order-status-badge';
import { Price } from '@/components/composed/price';
import { FlashSaleBanner } from '@/components/composed/flash-sale-banner';
import { MotionFade } from '@/components/composed/motion-fade';
import { ProductCard } from '@/components/composed/product-card';
import { ConfirmDialog } from '@/components/composed/confirm-dialog';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <MotionFade y={20}>
      <section className="space-y-4">
        <header>
          <h2 className="font-poppins text-h2 md:text-h2-md text-text">{title}</h2>
          {description && <p className="mt-1 text-text-secondary">{description}</p>}
        </header>
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">{children}</div>
      </section>
    </MotionFade>
  );
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="h-16 w-full rounded-md border border-border" style={{ backgroundColor: hex }} />
      <div className="text-xs">
        <p className="font-medium text-text">{name}</p>
        <p className="text-text-muted">{hex}</p>
      </div>
    </div>
  );
}

const primaryShades = [
  { n: 50, hex: '#FFF7ED' }, { n: 100, hex: '#FFEDD5' }, { n: 200, hex: '#FED7AA' },
  { n: 300, hex: '#FDBA74' }, { n: 400, hex: '#FB923C' }, { n: 500, hex: '#F97316' },
  { n: 600, hex: '#EA580C' }, { n: 700, hex: '#C2410C' }, { n: 800, hex: '#9A3412' },
  { n: 900, hex: '#7C2D12' },
];
const secondaryShades = [
  { n: 50, hex: '#F0FDFA' }, { n: 100, hex: '#CCFBF1' }, { n: 200, hex: '#99F6E4' },
  { n: 300, hex: '#5EEAD4' }, { n: 400, hex: '#2DD4BF' }, { n: 500, hex: '#14B8A6' },
  { n: 600, hex: '#0D9488' }, { n: 700, hex: '#0F766E' }, { n: 800, hex: '#115E59' },
  { n: 900, hex: '#134E4A' },
];
const semantic = [
  { name: 'success', hex: '#10B981' }, { name: 'error', hex: '#EF4444' },
  { name: 'warning', hex: '#F59E0B' }, { name: 'info', hex: '#3B82F6' },
];

const demoProducts = [
  {
    slug: 'tecno-camon-30',
    name: 'Tecno Camon 30 Premier — 256 GB',
    imageUrl: 'https://picsum.photos/seed/tecno/600/600',
    priceXaf: 285_000,
    comparedAtXaf: 320_000,
    cashbackXaf: 3500,
    shopName: 'Mboa Mobile',
    shopTier: 'elite' as const,
    rating: 4.7,
    reviewsCount: 84,
    badge: { label: '-12%', tone: 'primary' as const },
    inStock: true,
  },
  {
    slug: 'casque-jbl',
    name: 'Casque JBL Tune 720BT — Sans fil',
    imageUrl: 'https://picsum.photos/seed/jbl/600/600',
    priceXaf: 42_000,
    cashbackXaf: 600,
    shopName: 'Audio Yaoundé',
    shopTier: 'pro' as const,
    rating: 4.5,
    reviewsCount: 21,
    inStock: true,
  },
  {
    slug: 'cafe-arabica',
    name: 'Café Arabica de l\'Ouest — 500g',
    imageUrl: 'https://picsum.photos/seed/coffee/600/600',
    priceXaf: 4500,
    shopName: 'Plateau Café',
    shopTier: 'start' as const,
    rating: 4.9,
    reviewsCount: 312,
    inStock: false,
  },
  {
    slug: 'pagne-bafia',
    name: 'Pagne Bafia traditionnel 6 yards',
    imageUrl: 'https://picsum.photos/seed/pagne/600/600',
    priceXaf: 18_500,
    shopName: 'Boutique Lélé',
    shopTier: 'pro' as const,
    rating: 4.3,
    reviewsCount: 47,
    badge: { label: 'Nouveau', tone: 'secondary' as const },
    inStock: true,
  },
];

export default function UiKitPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [tab, setTab] = useState('description');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectValue, setSelectValue] = useState<string | undefined>();
  const [progress, setProgress] = useState(35);
  const [otp, setOtp] = useState('');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loadingBtn, setLoadingBtn] = useState(false);

  const toggleFavorite = (slug: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const flashEnd = new Date(Date.now() + 3 * 3600 * 1000);

  const handleConfirm = async () => {
    setConfirmLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setConfirmLoading(false);
    setConfirmOpen(false);
    toast.success('Produit supprimé', 'L\'article a été retiré de votre catalogue.');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-12">
      <header>
        <Badge variant="soft" className="mb-3">Phase 0 — Étendu</Badge>
        <h1 className="font-poppins text-h1 md:text-h1-md font-bold text-text">
          Bee Design System
        </h1>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Référence vivante des tokens et composants. Source de vérité :{' '}
          <code className="rounded bg-surface-muted px-1.5 py-0.5 text-sm">bee-design-system.md</code>{' '}
          à la racine du projet.
        </p>
      </header>

      {/* TYPO + COULEURS */}
      <Section title="Couleurs primaires (Orange)" description="CTA, prix, logo, états critiques.">
        <div className="grid grid-cols-5 gap-3 md:grid-cols-10">
          {primaryShades.map((s) => <Swatch key={s.n} name={`primary-${s.n}`} hex={s.hex} />)}
        </div>
      </Section>

      <Section title="Couleurs secondaires (Teal)">
        <div className="grid grid-cols-5 gap-3 md:grid-cols-10">
          {secondaryShades.map((s) => <Swatch key={s.n} name={`secondary-${s.n}`} hex={s.hex} />)}
        </div>
      </Section>

      <Section title="Couleurs sémantiques">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {semantic.map((s) => <Swatch key={s.name} name={s.name} hex={s.hex} />)}
        </div>
      </Section>

      <Section title="Typographie" description="Poppins / Inter selon la hiérarchie.">
        <div className="space-y-4">
          <div>
            <h1 className="font-poppins text-h1 md:text-h1-md font-bold text-text">H1 — Marketplace du Cameroun</h1>
            <p className="text-xs text-text-muted">Poppins 700 · 28/40 px</p>
          </div>
          <div>
            <h2 className="font-poppins text-h2 md:text-h2-md text-text">H2 — Sections principales</h2>
            <p className="text-xs text-text-muted">Poppins 600 · 24/30 px</p>
          </div>
          <div>
            <h3 className="font-poppins text-h3 md:text-h3-md text-text">H3 — Sous-sections</h3>
            <p className="text-xs text-text-muted">Poppins 600 · 20/24 px</p>
          </div>
          <div>
            <h4 className="font-poppins text-h4 md:text-h4-md text-text">H4 — Cartes, modales</h4>
            <p className="text-xs text-text-muted">Poppins 600 · 18/20 px</p>
          </div>
          <p className="text-base text-text">Body — texte courant, descriptions, paragraphes.</p>
          <p className="text-sm text-text-secondary">Small — labels, métadonnées.</p>
          <p className="text-caption uppercase text-text-secondary">Caption — badges, tags</p>
        </div>
      </Section>

      {/* BUTTONS */}
      <Section title="Boutons" description="Variants, tailles, états (loading, disabled), ButtonGroup.">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Acheter</Button>
            <Button variant="secondary">Détails</Button>
            <Button variant="outline">En savoir plus</Button>
            <Button variant="ghost">Ignorer</Button>
            <Button variant="danger">Supprimer</Button>
            <Button variant="link">Lien</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Favori"><Heart /></Button>
            <Button size="icon-sm" aria-label="Recherche"><Search /></Button>
            <Button disabled>Désactivé</Button>
            <Button
              loading={loadingBtn}
              onClick={async () => {
                setLoadingBtn(true);
                await new Promise((r) => setTimeout(r, 1500));
                setLoadingBtn(false);
                toast.success('Action terminée');
              }}
            >
              Cliquer (loading)
            </Button>
          </div>
          <div>
            <p className="mb-2 text-sm text-text-secondary">ButtonGroup :</p>
            <ButtonGroup>
              <Button variant="secondary">Précédent</Button>
              <Button variant="secondary">1</Button>
              <Button variant="primary">2</Button>
              <Button variant="secondary">3</Button>
              <Button variant="secondary">Suivant</Button>
            </ButtonGroup>
          </div>
          <div>
            <p className="mb-2 text-sm text-text-secondary">Avec icônes :</p>
            <div className="flex flex-wrap gap-3">
              <Button leftIcon={<ShoppingCart />}>Ajouter au panier</Button>
              <Button variant="secondary" rightIcon={<Heart />}>Favori</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* FORM INPUTS */}
      <Section title="Formulaires" description="Field, Input, InputGroup, OTP, Textarea, Select.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Email" htmlFor="email" required hint="On ne partage jamais ton email.">
            <Input id="email" type="email" placeholder="vous@exemple.cm" leftIcon={<Mail />} />
          </Field>

          <Field label="Mot de passe" htmlFor="pwd">
            <Input id="pwd" type="password" placeholder="••••••••" leftIcon={<Lock />} />
          </Field>

          <Field label="Téléphone" htmlFor="tel" error="Numéro invalide">
            <InputGroup prefix="+237" hasError>
              <Input id="tel" type="tel" placeholder="6 99 12 34 56" defaultValue="abc" hasError />
            </InputGroup>
          </Field>

          <Field label="Prix de vente" htmlFor="price">
            <InputGroup suffix="FCFA">
              <Input id="price" type="number" placeholder="15000" />
            </InputGroup>
          </Field>

          <Field label="Catégorie" htmlFor="cat">
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger id="cat">
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electro">Électronique</SelectItem>
                <SelectItem value="mode">Mode & Beauté</SelectItem>
                <SelectItem value="maison">Maison & Jardin</SelectItem>
                <SelectItem value="alim">Alimentation</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Description du produit" htmlFor="desc" hint="200 caractères minimum.">
            <Textarea id="desc" placeholder="Décrivez votre produit…" />
          </Field>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <p className="text-sm font-medium text-text">Code OTP (6 chiffres)</p>
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-xs text-text-muted">Saisi : {otp || '—'}</p>
        </div>
      </Section>

      {/* CONTROLS */}
      <Section title="Contrôles" description="Checkbox, Radio Group, Switch, Slider, Toggle.">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-medium text-text">Checkboxes</p>
            <div className="flex items-center gap-2">
              <Checkbox id="newsletter" defaultChecked />
              <Label htmlFor="newsletter">Recevoir la newsletter Bee</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="cgu" />
              <Label htmlFor="cgu">J'accepte les CGU</Label>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-text">Mode de paiement (Radio Group)</p>
            <RadioGroup defaultValue="momo">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="r-momo" value="momo" />
                <Label htmlFor="r-momo">MTN Mobile Money</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="r-orange" value="orange" />
                <Label htmlFor="r-orange">Orange Money</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="r-cash" value="cash" />
                <Label htmlFor="r-cash">Cash à la livraison</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-text">Switches</p>
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="sw-notif">Notifications push</Label>
              <Switch id="sw-notif" defaultChecked />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="sw-eco">Mode éco batterie</Label>
              <Switch id="sw-eco" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-text">Filtre prix (Slider)</p>
            <Slider defaultValue={[5000, 80000]} max={200000} step={1000} />
            <p className="text-xs text-text-muted">5 000 FCFA — 80 000 FCFA</p>
          </div>

          <div className="space-y-3 md:col-span-2">
            <p className="text-sm font-medium text-text">Toggle group (alignement texte)</p>
            <ToggleGroup
              type="single"
              variant="outline"
              value={textAlign}
              onValueChange={(v) => v && setTextAlign(v as typeof textAlign)}
            >
              <ToggleGroupItem value="left" aria-label="Gauche"><AlignLeft /></ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Centre"><AlignCenter /></ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Droite"><AlignRight /></ToggleGroupItem>
            </ToggleGroup>

            <p className="mt-3 text-sm font-medium text-text">View toggle</p>
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && setView(v as typeof view)}
            >
              <ToggleGroupItem value="grid">Grille</ToggleGroupItem>
              <ToggleGroupItem value="list">Liste</ToggleGroupItem>
            </ToggleGroup>

            <Toggle aria-label="Favori" className="mt-3">
              <Heart /> Favori
            </Toggle>
          </div>
        </div>
      </Section>

      {/* CARDS + PRODUCT */}
      <Section title="Cards" description="Card flat / hover, ProductCard avec image.">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Boutique du jour</CardTitle>
              <CardDescription>Mama Foods — Yaoundé</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary">Cuisine traditionnelle, livraison sous 2h.</p>
            </CardContent>
            <CardFooter>
              <ShopTierBadge tier="elite" />
              <span className="ml-auto text-sm text-text-secondary">★ 4.8 (132)</span>
            </CardFooter>
          </Card>

          <Card flat>
            <CardHeader>
              <CardTitle>Stats vendeur (flat)</CardTitle>
              <CardDescription>30 derniers jours</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-poppins text-h2 md:text-h2-md text-text">42 ventes</p>
              <p className="mt-1 text-sm text-success">+18% vs mois dernier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Onboarding livreur</CardTitle>
              <CardDescription>3 étapes restantes</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} tone="primary" />
              <p className="mt-2 text-xs text-text-muted">{progress}% complété</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="secondary" onClick={() => setProgress((p) => Math.min(100, p + 15))}>
                Étape suivante
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      <Section title="Product Card" description="Card produit complète avec image, badges, prix, action panier.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {demoProducts.map((p) => (
            <ProductCard
              key={p.slug}
              product={p}
              isFavorite={favorites.has(p.slug)}
              onToggleFavorite={(prod) => {
                toggleFavorite(prod.slug);
                toast.info(
                  favorites.has(prod.slug) ? 'Retiré des favoris' : 'Ajouté aux favoris',
                  prod.name,
                );
              }}
              onAddToCart={(prod) => toast.success('Ajouté au panier', prod.name)}
            />
          ))}
        </div>
      </Section>

      {/* BADGES + STATUS */}
      <Section title="Badges génériques">
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">Neutre</Badge>
          <Badge variant="primary">Promo</Badge>
          <Badge variant="secondary">Cashback</Badge>
          <Badge variant="success">En stock</Badge>
          <Badge variant="warning">Faible stock</Badge>
          <Badge variant="error">Rupture</Badge>
          <Badge variant="info">Nouveau</Badge>
          <Badge variant="soft">Vendu par Bee</Badge>
        </div>
      </Section>

      <Section title="Tier badges Bee">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-text-secondary">Vendeurs :</span>
            <ShopTierBadge tier="start" /><ShopTierBadge tier="pro" /><ShopTierBadge tier="elite" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-text-secondary">Livreurs :</span>
            <CourierTierBadge tier="freelance" />
            <CourierTierBadge tier="premium" />
            <CourierTierBadge tier="fiable" />
          </div>
        </div>
      </Section>

      <Section title="Statuts de commande / livraison">
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status="pending" />
          <OrderStatusBadge status="accepted" />
          <OrderStatusBadge status="preparing" />
          <OrderStatusBadge status="shipping" />
          <OrderStatusBadge status="delivered" />
          <OrderStatusBadge status="dispute" />
        </div>
      </Section>

      {/* FEEDBACK */}
      <Section title="Alerts (info, validation, warning, erreur)">
        <div className="space-y-3">
          <Alert variant="info">
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>Vos préférences ont été sauvegardées.</AlertDescription>
          </Alert>
          <Alert variant="success">
            <AlertTitle>Paiement confirmé</AlertTitle>
            <AlertDescription>Votre commande #BEE-1024 est en préparation.</AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertTitle>Stock limité</AlertTitle>
            <AlertDescription>Plus que 3 articles disponibles.</AlertDescription>
          </Alert>
          <Alert variant="error">
            <AlertTitle>Paiement refusé</AlertTitle>
            <AlertDescription>Votre Mobile Money n'a pas été débité.</AlertDescription>
          </Alert>
        </div>
      </Section>

      <Section title="Toast notifications (Sonner)" description="Wrapper sémantique : success, error, warning, info, loading, promise.">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => toast.success('Commande validée', 'Livraison sous 24h')}>
            Success
          </Button>
          <Button variant="secondary" onClick={() => toast.error('Paiement échoué', 'Solde Mobile Money insuffisant')}>
            Error
          </Button>
          <Button variant="secondary" onClick={() => toast.warning('Stock faible', 'Plus que 2 unités disponibles')}>
            Warning
          </Button>
          <Button variant="secondary" onClick={() => toast.info('Info', 'Frais de livraison mis à jour')}>
            Info
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const id = toast.loading('Traitement du paiement…');
              setTimeout(() => {
                toast.dismiss(id);
                toast.success('Paiement reçu');
              }, 1500);
            }}
          >
            Loading → Success
          </Button>
        </div>
      </Section>

      <Section title="Skeletons (chargement)">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <Skeleton className="h-48 w-full rounded-none" />
            <CardContent className="space-y-3 pt-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-center pt-6">
              <Spinner size="lg" />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Spinners">
        <div className="flex items-center gap-6">
          <Spinner size="xs" />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="xl" />
          <Spinner tone="muted" />
        </div>
      </Section>

      <Section title="Progress">
        <div className="space-y-3">
          <Progress value={20} tone="primary" />
          <Progress value={60} tone="primary" />
          <Progress value={75} tone="success" />
          <Progress value={45} tone="warning" />
          <Progress value={90} tone="error" />
        </div>
      </Section>

      <Section title="Empty state">
        <Empty
          icon={<Inbox />}
          title="Aucune commande pour le moment"
          description="Dès qu'un client validera son panier, sa commande apparaîtra ici."
          action={<Button variant="primary">Partager ma boutique</Button>}
        />
      </Section>

      {/* OVERLAYS */}
      <Section title="Dialog, Alert Dialog, Confirm Dialog">
        <div className="flex flex-wrap items-center gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="primary">Dialog standard</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer l'achat</DialogTitle>
                <DialogDescription>Vous êtes sur le point de payer 185 000 FCFA via Mobile Money.</DialogDescription>
              </DialogHeader>
              <p className="text-sm text-text-secondary">
                <Star className="mr-1 inline size-4 text-warning" />
                Vous gagnez 2 500 FCFA de cashback.
              </p>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button variant="primary">Confirmer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="danger">Alert Dialog (destructive)</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer le produit ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le produit sera retiré de votre catalogue
                  et toutes les enchères en cours seront annulées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction>Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            ConfirmDialog (avec loading)
          </Button>
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Confirmer la suppression ?"
            description="Le produit sera retiré définitivement de votre catalogue."
            confirmLabel="Supprimer"
            tone="danger"
            loading={confirmLoading}
            onConfirm={handleConfirm}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">Dropdown</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Commandes</DropdownMenuItem>
              <DropdownMenuItem>Cashback</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-error focus:text-error">Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Section>

      <Section title="Popover, Tooltip">
        <div className="flex flex-wrap items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">Popover</Button>
            </PopoverTrigger>
            <PopoverContent>
              <h4 className="font-medium">Filtres rapides</h4>
              <p className="mt-1 text-sm text-text-secondary">
                Affinez votre recherche par marque, prix ou disponibilité.
              </p>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Aide">
                <Star />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cliquer pour ajouter aux favoris</TooltipContent>
          </Tooltip>
        </div>
      </Section>

      <Section title="Drawer (bottom sheet mobile) + Sheet (panneau latéral)">
        <div className="flex flex-wrap items-center gap-3">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="primary">Ouvrir Drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-md">
                <DrawerHeader>
                  <DrawerTitle>Filtres</DrawerTitle>
                  <DrawerDescription>Trier et filtrer le catalogue</DrawerDescription>
                </DrawerHeader>
                <div className="space-y-4 px-4 pb-4">
                  <div className="flex items-center justify-between">
                    <Label>Prix max</Label>
                    <span className="text-sm text-text-secondary">80 000 FCFA</span>
                  </div>
                  <Slider defaultValue={[80000]} max={200000} step={1000} />
                  <div className="flex items-center gap-2">
                    <Checkbox id="d-stock" defaultChecked />
                    <Label htmlFor="d-stock">En stock uniquement</Label>
                  </div>
                </div>
                <DrawerFooter>
                  <Button>Appliquer</Button>
                  <DrawerClose asChild><Button variant="secondary">Annuler</Button></DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">Ouvrir Sheet (droite)</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Mon panier</SheetTitle>
                <SheetDescription>3 articles · 92 500 FCFA</SheetDescription>
              </SheetHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-md border border-border p-3">
                  <Skeleton className="size-12" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-text">Casque JBL Tune</p>
                    <p className="text-text-secondary">Qty 1 · 42 000 FCFA</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-md border border-border p-3">
                  <Skeleton className="size-12" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-text">Pagne Bafia</p>
                    <p className="text-text-secondary">Qty 1 · 18 500 FCFA</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Section>

      {/* NAV */}
      <Section title="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/">Accueil</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="/products">Catalogue</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="/products?cat=electro">Électronique</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Tecno Camon 30</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Section>

      <Section title="Tabs">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Caractéristiques</TabsTrigger>
            <TabsTrigger value="reviews">Avis (84)</TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            <p className="text-sm text-text-secondary">
              Smartphone haut de gamme avec écran AMOLED 6.78", 256 GB de stockage et batterie 5000 mAh…
            </p>
          </TabsContent>
          <TabsContent value="specs">
            <ul className="list-disc space-y-1 pl-6 text-sm text-text-secondary">
              <li>Écran : 6.78" AMOLED 144Hz</li>
              <li>RAM : 12 GB · Stockage : 256 GB</li>
              <li>Batterie : 5000 mAh, charge 70W</li>
            </ul>
          </TabsContent>
          <TabsContent value="reviews">
            <p className="text-sm text-text-secondary">★ 4.7 sur 84 avis vérifiés.</p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Pagination">
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
            <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
            <PaginationItem><PaginationEllipsis /></PaginationItem>
            <PaginationItem><PaginationLink href="#">12</PaginationLink></PaginationItem>
            <PaginationItem><PaginationNext href="#" /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </Section>

      <Section title="Accordion (FAQ)">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="q1">
            <AccordionTrigger>Comment fonctionne le paiement Mobile Money ?</AccordionTrigger>
            <AccordionContent>
              Vous saisissez votre numéro Orange Money ou MTN MoMo, vous validez avec votre code PIN
              sur le mobile, et la transaction est confirmée en quelques secondes.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger>Que se passe-t-il si le vendeur n'envoie pas le produit ?</AccordionTrigger>
            <AccordionContent>
              Vos fonds restent bloqués sur l'escrow Bee tant que vous n'avez pas confirmé la
              réception. En cas de litige, notre équipe arbitre sous 48h.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger>Comment devenir vendeur Pro ou Elite ?</AccordionTrigger>
            <AccordionContent>
              Les tiers sont attribués automatiquement selon le volume de ventes, la note moyenne et
              le taux de litiges. Voir conditions complètes dans votre espace vendeur.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      {/* DISPLAY */}
      <Section title="Avatar">
        <div className="flex items-center gap-3">
          <Avatar size="xs"><AvatarFallback>AM</AvatarFallback></Avatar>
          <Avatar size="sm"><AvatarFallback>AM</AvatarFallback></Avatar>
          <Avatar size="md">
            <AvatarImage src="https://picsum.photos/seed/adam/100" alt="Adam" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <Avatar size="lg"><AvatarFallback>JD</AvatarFallback></Avatar>
          <Avatar size="xl">
            <AvatarImage src="https://picsum.photos/seed/seller/200" alt="Vendeur" />
            <AvatarFallback>SE</AvatarFallback>
          </Avatar>
        </div>
      </Section>

      <Section title="Carousel (galerie produit)">
        <Carousel className="mx-auto max-w-2xl">
          <CarouselContent>
            {[1, 2, 3, 4, 5].map((i) => (
              <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                <div className="relative aspect-square overflow-hidden rounded-md bg-surface-muted">
                  <img
                    alt={`Slide ${i}`}
                    src={`https://picsum.photos/seed/carousel-${i}/600/600`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </Section>

      <Section title="Scroll Area">
        <ScrollArea className="h-48 w-full rounded-md border border-border p-4">
          <ul className="space-y-2 text-sm">
            {Array.from({ length: 20 }).map((_, i) => (
              <li key={i} className="flex items-center justify-between">
                <span>Commande #BEE-{1000 + i}</span>
                <OrderStatusBadge status={(['pending', 'preparing', 'shipping', 'delivered'] as const)[i % 4]} />
              </li>
            ))}
          </ul>
        </ScrollArea>
      </Section>

      <Section title="Table (admin / dashboard vendeur)">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { id: 'BEE-1024', client: 'Aïcha N.', total: '42 000 FCFA', status: 'preparing' as const },
              { id: 'BEE-1025', client: 'Paul T.', total: '185 000 FCFA', status: 'shipping' as const },
              { id: 'BEE-1026', client: 'Mireille K.', total: '8 500 FCFA', status: 'delivered' as const },
              { id: 'BEE-1027', client: 'Yvan B.', total: '24 000 FCFA', status: 'dispute' as const },
            ].map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.id}</TableCell>
                <TableCell>{o.client}</TableCell>
                <TableCell>{o.total}</TableCell>
                <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost">Détails</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      {/* SPECIFIQUES BEE */}
      <Section title="Flash sale banner">
        <FlashSaleBanner
          title="Vente flash — 50% sur l'électroménager"
          subtitle="Sélection limitée, fin ce soir à minuit"
          endsAt={flashEnd}
        />
      </Section>

      <Section title="Prix">
        <div className="grid gap-4 md:grid-cols-3">
          <Price amountXaf={45_000} size="md" />
          <Price amountXaf={185_000} comparedAtXaf={220_000} size="md" />
          <Price amountXaf={185_000} comparedAtXaf={220_000} cashbackXaf={2_500} size="lg" />
        </div>
      </Section>

      <Section title="Border radius">
        <div className="flex flex-wrap gap-3">
          {[
            { c: 'rounded-sm', l: 'sm' },
            { c: 'rounded-md', l: 'md' },
            { c: 'rounded-lg', l: 'lg' },
            { c: 'rounded-xl', l: 'xl' },
            { c: 'rounded-2xl', l: '2xl' },
            { c: 'rounded-full', l: 'full' },
          ].map((r) => (
            <div
              key={r.l}
              className={`flex h-20 w-20 items-center justify-center bg-primary-500 text-xs font-medium text-white ${r.c}`}
            >
              {r.l}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
