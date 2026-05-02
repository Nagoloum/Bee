import { cn } from '@/lib/utils';
import { formatXaf } from '@/lib/utils';

interface PriceProps {
  amountXaf: number | bigint;
  comparedAtXaf?: number | bigint;
  cashbackXaf?: number | bigint;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClass: Record<NonNullable<PriceProps['size']>, string> = {
  sm: 'text-base md:text-base',
  md: 'text-base md:text-lg',
  lg: 'text-2xl md:text-3xl',
};

export function Price({
  amountXaf,
  comparedAtXaf,
  cashbackXaf,
  size = 'md',
  className,
}: PriceProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'font-poppins font-semibold tracking-[-0.01em] text-primary-500',
            sizeClass[size],
          )}
        >
          {formatXaf(amountXaf)}
        </span>
        {comparedAtXaf && Number(comparedAtXaf) > Number(amountXaf) && (
          <span className="text-sm text-text-muted line-through">{formatXaf(comparedAtXaf)}</span>
        )}
      </div>
      {cashbackXaf && Number(cashbackXaf) > 0 && (
        <span className="text-caption font-medium text-secondary-500">
          + {formatXaf(cashbackXaf)} cashback
        </span>
      )}
    </div>
  );
}
