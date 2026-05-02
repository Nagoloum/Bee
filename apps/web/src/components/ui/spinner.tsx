import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      xs: 'size-3',
      sm: 'size-4',
      md: 'size-6',
      lg: 'size-8',
      xl: 'size-10',
    },
    tone: {
      primary: 'text-primary-500',
      muted: 'text-text-muted',
      inherit: 'text-current',
    },
  },
  defaultVariants: { size: 'md', tone: 'primary' },
});

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

export function Spinner({ className, size, tone, label = 'Chargement…', ...props }: SpinnerProps) {
  return (
    <span role="status" aria-live="polite" {...props} className={cn('inline-flex', className)}>
      <Loader2 className={spinnerVariants({ size, tone })} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
