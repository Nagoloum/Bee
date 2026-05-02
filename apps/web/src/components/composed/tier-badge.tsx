import { cn } from '@/lib/utils';

export type ShopTier = 'start' | 'pro' | 'elite';
export type CourierTier = 'freelance' | 'premium' | 'fiable';

const baseClass =
  'inline-flex items-center justify-center rounded-sm px-2.5 py-1 text-[12px] font-semibold leading-none tracking-[0.02em]';

const shopTierStyles: Record<ShopTier, string> = {
  start: 'bg-surface-muted text-text-secondary',
  pro: 'bg-primary-500 text-white',
  elite: 'bg-secondary-500 text-white',
};

const courierTierStyles: Record<CourierTier, string> = {
  freelance: 'bg-surface-muted text-text-secondary',
  premium: 'bg-secondary-500 text-white',
  fiable: 'bg-success text-white',
};

const shopLabels: Record<ShopTier, string> = {
  start: 'Start',
  pro: 'Pro',
  elite: 'Elite',
};

const courierLabels: Record<CourierTier, string> = {
  freelance: 'Freelance',
  premium: 'Premium',
  fiable: 'Fiable',
};

export function ShopTierBadge({ tier, className }: { tier: ShopTier; className?: string }) {
  return <span className={cn(baseClass, shopTierStyles[tier], className)}>{shopLabels[tier]}</span>;
}

export function CourierTierBadge({
  tier,
  className,
}: {
  tier: CourierTier;
  className?: string;
}) {
  return (
    <span className={cn(baseClass, courierTierStyles[tier], className)}>
      {courierLabels[tier]}
    </span>
  );
}
