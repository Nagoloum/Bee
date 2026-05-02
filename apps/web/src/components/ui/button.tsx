'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium leading-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm',
        secondary:
          'bg-transparent border border-border text-text hover:bg-surface-muted',
        outline:
          'bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30',
        ghost:
          'bg-transparent text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30',
        danger: 'bg-error text-white hover:opacity-90',
        link: 'bg-transparent text-primary-500 underline-offset-4 hover:underline px-0',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-12 px-5 text-base',
        lg: 'h-14 px-8 text-base',
        icon: 'h-12 w-12',
        'icon-sm': 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    const content = (
      <>
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 animate-spin" />
          </span>
        )}
        <span
          className={cn('inline-flex items-center gap-2', loading && 'opacity-0')}
        >
          {leftIcon}
          {children}
          {rightIcon}
        </span>
      </>
    );

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (children as React.ReactElement) : content}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export const ButtonGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      className={cn(
        'inline-flex isolate [&>*]:rounded-none',
        '[&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md',
        '[&>*+*]:-ml-px [&>*:focus-visible]:z-10',
        className,
      )}
      {...props}
    />
  ),
);
ButtonGroup.displayName = 'ButtonGroup';

export { buttonVariants };
