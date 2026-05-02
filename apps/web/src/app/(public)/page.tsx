import Link from 'next/link';
import { Truck, ShieldCheck, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MotionFade } from '@/components/composed/motion-fade';
import { Stagger, StaggerItem } from '@/components/composed/stagger';

const features = [
  {
    icon: Wallet,
    iconColor: 'text-primary-500',
    title: 'Mobile Money',
    desc: 'Orange Money + MTN MoMo, paiement instantané.',
  },
  {
    icon: Truck,
    iconColor: 'text-secondary-500',
    title: 'Livraison fiable',
    desc: 'Livreurs vérifiés, tracking GPS en temps réel.',
  },
  {
    icon: ShieldCheck,
    iconColor: 'text-success',
    title: 'Escrow automatique',
    desc: "Vos fonds protégés jusqu'à la livraison confirmée.",
  },
];

export default function Home() {
  return (
    <>
      <MotionFade y={24} duration={0.5} className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="font-poppins text-h1 md:text-h1-md text-text">
          La marketplace du <span className="text-primary-500">Cameroun</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
          Vendeurs locaux, paiement Mobile Money, livraison rapide, cashback et bien plus.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" variant="primary">
            <Link href="/products">Explorer les produits</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-up/vendor">Devenir vendeur</Link>
          </Button>
        </div>
      </MotionFade>

      <Stagger className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-3">
        {features.map((f) => (
          <StaggerItem key={f.title}>
            <Card>
              <CardHeader>
                <f.icon className={`size-8 ${f.iconColor}`} />
                <CardTitle>{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">{f.desc}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </>
  );
}
