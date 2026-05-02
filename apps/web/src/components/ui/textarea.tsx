'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[120px] w-full rounded-md border bg-surface px-4 py-3 text-base text-text placeholder:text-text-muted',
        'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'resize-y',
        hasError
          ? 'border-error focus-visible:border-error focus-visible:ring-error/30'
          : 'border-border focus-visible:border-primary-500',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
