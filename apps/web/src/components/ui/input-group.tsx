'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'prefix'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  hasError?: boolean;
  disabled?: boolean;
  inputSize?: 'sm' | 'md';
  children: React.ReactNode;
}

/**
 * Wraps an <Input> with a non-editable prefix and/or suffix block.
 * Examples: "+237" prefix for phone, "FCFA" suffix for price.
 */
export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, prefix, suffix, hasError, disabled, inputSize = 'md', children, ...props }, ref) => {
    const heightClass = inputSize === 'sm' ? 'h-9 text-sm' : 'h-12 text-base';

    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full items-stretch overflow-hidden rounded-md border bg-surface',
          heightClass,
          hasError ? 'border-error' : 'border-border',
          disabled && 'opacity-50',
          'focus-within:ring-2 focus-within:ring-primary-500/30',
          hasError ? 'focus-within:border-error' : 'focus-within:border-primary-500',
          className,
        )}
        {...props}
      >
        {prefix && (
          <span className="flex select-none items-center border-r border-border bg-surface-muted px-3 text-text-secondary">
            {prefix}
          </span>
        )}
        <div className="flex flex-1 items-center [&>input]:!h-auto [&>input]:!border-0 [&>input]:!bg-transparent [&>input]:focus-visible:!ring-0 [&>input]:rounded-none">
          {children}
        </div>
        {suffix && (
          <span className="flex select-none items-center border-l border-border bg-surface-muted px-3 text-text-secondary">
            {suffix}
          </span>
        )}
      </div>
    );
  },
);
InputGroup.displayName = 'InputGroup';
