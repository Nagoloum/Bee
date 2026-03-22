"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements, PaymentElement, useStripe, useElements,
} from "@stripe/react-stripe-js";
import { MapPin, Truck, CreditCard, ChevronRight, Lock } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/cn";
import { cn } from "@/lib/utils/cn";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const REGIONS = [
  { value:"CM-CE",label:"Centre (Yaoundé)"  },
  { value:"CM-LT",label:"Littoral (Douala)" },
  { value:"CM-OU",label:"Ouest"             },
  { value:"CM-NO",label:"Nord"              },
  { value:"CM-EN",label:"Extrême-Nord"      },
  { value:"CM-NW",label:"Nord-Ouest"        },
  { value:"CM-SW",label:"Sud-Ouest"         },
  { value:"CM-AD",label:"Adamaoua"          },
  { value:"CM-ES",label:"Est"               },
  { value:"CM-SU",label:"Sud"               },
];

const DELIVERY_FEE = 500;
const STEPS = ["Adresse", "Livraison", "Paiement"] as const;
type Step = 0 | 1 | 2;

// ─── Inner checkout form (needs Stripe Elements context) ─────────────────────

function CheckoutForm({
  clientSecret,
  orderData,
  onSuccess,
}: {
  clientSecret: string;
  orderData:    any;
  onSuccess:    (orderId: string) => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [paying,  setPaying]  = useState(false);
  const [error,   setError]   = useState("");
  const clearCart = useCartStore(s => s.clearCart);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true); setError("");

    // First create the order in DB
    const orderRes = await fetch("/api/orders", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...orderData, clientSecret }),
    });
    const orderJson = await orderRes.json();
    if (!orderRes.ok) { setError(orderJson.error ?? "Erreur commande."); setPaying(false); return; }

    // Then confirm payment
    const { error: stripeErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${orderJson.orderId}`,
      },
      redirect: "if_required",
    });

    if (stripeErr) {
      setError(stripeErr.message ?? "Paiement échoué.");
      setPaying(false);
      return;
    }

    clearCart();
    onSuccess(orderJson.orderId);
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <div className="bg-white rounded-2xl border border-border p-5">
        <PaymentElement />
      </div>
      {error && <Alert variant="error" onClose={() => setError("")}>{error}</Alert>}
      <Button type="submit" fullWidth size="lg" isLoading={paying}
        leftIcon={<Lock size={16} />}
        loadingText="Traitement du paiement…">
        Payer maintenant
      </Button>
      <p className="text-xs text-center text-muted-foreground font-inter flex items-center justify-center gap-1">
        <Lock size={11} /> Paiement chiffré SSL — sécurisé par Stripe
      </p>
    </form>
  );
}

// ─── Main checkout page ────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router  = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step,  setStep]  = useState<Step>(0);
  const [error, setError] = useState("");
  const [clientSecret,  setClientSecret]  = useState("");
  const [loadingSecret, setLoadingSecret] = useState(false);

  const items       = useCartStore(s => s.items);
  const getSubtotal = useCartStore(s => s.getSubtotal);
  const getTotal    = useCartStore(s => s.getTotal);
  const couponCode  = useCartStore(s => s.couponCode);
  const couponDiscount = useCartStore(s => s.couponDiscount);

  const [address, setAddress] = useState({
    fullName: "", phone: "", street: "", city: "", region: "", notes: "",
  });

  const [deliveryMode, setDeliveryMode] = useState<"PLATFORM" | "SELF">("PLATFORM");

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0) router.replace("/cart");
  }, [mounted, items.length, router]);

  if (!mounted || items.length === 0) return null;

  const subtotal    = getSubtotal();
  const total       = getTotal();
  const finalTotal  = total + (deliveryMode === "PLATFORM" ? DELIVERY_FEE : 0);

  const addressValid = address.fullName && address.phone && address.street && address.city && address.region;

  const goToPayment = async () => {
    setError(""); setLoadingSecret(true);
    try {
      const res = await fetch("/api/stripe/payment-intent", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ amount: finalTotal }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur Stripe."); return; }
      setClientSecret(data.clientSecret);
      setStep(2);
    } catch { setError("Erreur réseau."); }
    finally { setLoadingSecret(false); }
  };

  const orderData = {
    items:        items.map(i => ({
      productId:   i.productId,
      variantId:   i.variantId,
      name:        i.name,
      image:       i.image,
      variantLabel:i.variantLabel,
      quantity:    i.quantity,
      unitPrice:   i.price,
      vendorId:    i.vendorId,
    })),
    deliveryAddress: address,
    deliveryMode,
    deliveryFee:  deliveryMode === "PLATFORM" ? DELIVERY_FEE : 0,
    subtotal,
    discount:     couponDiscount,
    total:        finalTotal,
    couponCode:   couponCode ?? null,
    couponDiscount,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-bee py-8 max-w-5xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-poppins transition-colors",
                  i <= step ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={cn(
                  "text-sm font-poppins font-semibold hidden sm:block",
                  i <= step ? "text-foreground" : "text-muted-foreground"
                )}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("w-12 sm:w-20 h-px mx-3", i < step ? "bg-primary" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        {error && <Alert variant="error" className="mb-6" onClose={() => setError("")}>{error}</Alert>}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2">
            {/* Step 0 — Address */}
            {step === 0 && (
              <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-poppins font-bold text-lg text-foreground flex items-center gap-2">
                  <MapPin size={18} className="text-primary" /> Adresse de livraison
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Nom complet" value={address.fullName}
                    onChange={e => setAddress(p => ({...p, fullName: e.target.value}))} required />
                  <Input label="Téléphone" placeholder="+237 6XX XXX XXX" value={address.phone}
                    onChange={e => setAddress(p => ({...p, phone: e.target.value}))} required />
                </div>
                <Input label="Adresse / Quartier" placeholder="Ex: Bastos, Rue 1.234"
                  value={address.street} onChange={e => setAddress(p => ({...p, street: e.target.value}))} required />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Ville" placeholder="Yaoundé" value={address.city}
                    onChange={e => setAddress(p => ({...p, city: e.target.value}))} required />
                  <Select label="Région" options={REGIONS} value={address.region}
                    onChange={v => setAddress(p => ({...p, region: v}))} required />
                </div>
                <Input label="Instructions (optionnel)" placeholder="Couleur de la porte, code d'accès…"
                  value={address.notes} onChange={e => setAddress(p => ({...p, notes: e.target.value}))} />
                <Button fullWidth isLoading={false} disabled={!addressValid}
                  onClick={() => setStep(1)} rightIcon={<ChevronRight size={16}/>}>
                  Continuer vers la livraison
                </Button>
              </div>
            )}

            {/* Step 1 — Delivery */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-poppins font-bold text-lg text-foreground flex items-center gap-2">
                  <Truck size={18} className="text-primary" /> Mode de livraison
                </h2>
                {[
                  {
                    value:    "PLATFORM" as const,
                    label:    "Livraison BEE",
                    sub:      "Livreur BEE · 24h à Yaoundé & Douala",
                    price:    DELIVERY_FEE,
                    badge:    "Recommandé",
                  },
                  {
                    value:    "SELF" as const,
                    label:    "Livraison vendeur",
                    sub:      "Délai et tarif fixés par le vendeur",
                    price:    0,
                    badge:    null,
                  },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setDeliveryMode(opt.value)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all",
                      deliveryMode === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-border-strong"
                    )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                        deliveryMode === opt.value ? "border-primary" : "border-muted-foreground"
                      )}>
                        {deliveryMode === opt.value && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-poppins font-semibold text-sm text-foreground">{opt.label}</p>
                          {opt.badge && <Badge variant="success" size="xs">{opt.badge}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground font-inter">{opt.sub}</p>
                      </div>
                    </div>
                    <p className="font-poppins font-bold text-sm text-foreground shrink-0">
                      {opt.price === 0 ? "Inclus" : formatPrice(opt.price)}
                    </p>
                  </button>
                ))}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>Retour</Button>
                  <Button fullWidth isLoading={loadingSecret} onClick={goToPayment}
                    rightIcon={<CreditCard size={16}/>}>
                    Continuer vers le paiement
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 — Payment */}
            {step === 2 && clientSecret && (
              <div className="space-y-4">
                <h2 className="font-poppins font-bold text-lg text-foreground flex items-center gap-2">
                  <CreditCard size={18} className="text-primary" /> Paiement sécurisé
                </h2>
                <Elements stripe={stripePromise} options={{ clientSecret, locale: "fr" }}>
                  <CheckoutForm
                    clientSecret={clientSecret}
                    orderData={orderData}
                    onSuccess={(orderId) => router.push(`/checkout/success?orderId=${orderId}`)}
                  />
                </Elements>
                <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                  ← Modifier la livraison
                </Button>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border p-5 sticky top-24">
              <h3 className="font-poppins font-bold text-base text-foreground mb-4">
                Votre commande
              </h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto scrollbar-hide">
                {items.map(item => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                      {item.image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-sm opacity-20">📦</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold font-poppins text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-inter">×{item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold font-poppins shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 space-y-2 text-sm font-inter">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-success-dark">Coupon</span>
                    <span className="text-success-dark font-semibold">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="font-semibold">
                    {deliveryMode === "PLATFORM" ? formatPrice(DELIVERY_FEE) : "Incluse"}
                  </span>
                </div>
                <div className="flex justify-between font-poppins font-black pt-1 border-t border-border text-base">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
