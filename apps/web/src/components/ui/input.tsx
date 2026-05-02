'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  hasError?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, hasError, type = 'text', leftIcon, rightIcon, inputSize = 'md', ...props },
    ref,
  ) => {
    const [revealed, setRevealed] = React.useState(false);
    const isPassword = type === 'password';
    const effectiveType = isPassword && revealed ? 'text' : type;
    const heightClass = inputSize === 'sm' ? 'h-9 text-sm' : 'h-12 text-base';

    const baseInput = (
      <input
        ref={ref}
        type={effectiveType}
        className={cn(
          'flex w-full rounded-md border bg-surface text-text placeholder:text-text-muted',
          heightClass,
          'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          hasError
            ? 'border-error focus-visible:border-error focus-visible:ring-error/30'
            : 'border-border focus-visible:border-primary-500',
          leftIcon ? 'pl-11' : 'pl-4',
          isPassword || rightIcon ? 'pr-11' : 'pr-4',
          className,
        )}
        {...props}
      />
    );

    if (!leftIcon && !rightIcon && !isPassword) return baseInput;

    return (
      <div className="relative w-full">
        {leftIcon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted [&_svg]:size-4">
            {leftIcon}
          </span>
        )}
        {baseInput}
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            tabIndex={-1}
            aria-label={revealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded text-text-muted hover:text-text"
          >
            {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
        {!isPassword && rightIcon && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted [&_svg]:size-4">
            {rightIcon}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
