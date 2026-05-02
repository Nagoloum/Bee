'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
}

/**
 * Form field wrapper that pairs a Label, control, optional hint and error message.
 * Use as: <Field label="Email" htmlFor="email" hint="…" error="…"><Input id="email" /></Field>
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, label, htmlFor, hint, error, required, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1.5', className)} {...props}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-error">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  ),
);
Field.displayName = 'Field';
