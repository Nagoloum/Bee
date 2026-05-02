import { cn } from '@/lib/utils';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'shipping'
  | 'delivered'
  | 'dispute';

const styles: Record<OrderStatus, string> = {
  pending: 'bg-warning text-white',
  accepted: 'bg-info text-white',
  preparing: 'bg-primary-500 text-white',
  shipping: 'bg-secondary-500 text-white',
  delivered: 'bg-success text-white',
  dispute: 'bg-error text-white',
};

const labels: Record<OrderStatus, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  preparing: 'En préparation',
  shipping: 'En route',
  delivered: 'Livrée',
  dispute: 'Litige',
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-sm px-2.5 py-1 text-[12px] font-semibold leading-none tracking-[0.02em]',
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
