"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

// ─── Input ────────────────────────────────────────────────────────────────────

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  containerClassName?: string;
  labelClassName?: string;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      labelClassName,
      wrapperClassName,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? React.useId();

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-semibold text-foreground font-poppins",
              props.disabled && "opacity-50",
              labelClassName
            )}
          >
            {label}
            {props.required && (
              <span className="text-error ml-1" aria-hidden>*</span>
            )}
          </label>
        )}

        <div className={cn("relative", wrapperClassName)}>
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              // Base
              "w-full h-11 rounded-xl border bg-white font-inter text-sm text-foreground",
              "placeholder:text-muted-foreground/60",
              "transition-all duration-200",
              // Border & shadow
              "border-border shadow-soft-sm",
              // Focus
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              // Error state
              error && "border-error focus:ring-error/20 focus:border-error",
              // Disabled
              "disabled:bg-muted disabled:opacity-60 disabled:cursor-not-allowed",
              // Padding with icons
              leftIcon ? "pl-10" : "pl-4",
              rightIcon ? "pr-10" : "pr-4",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className={cn(
                "absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground",
                onRightIconClick
                  ? "hover:text-foreground cursor-pointer transition-colors"
                  : "pointer-events-none"
              )}
              tabIndex={-1}
            >
              {rightIcon}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-error font-inter font-medium flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-error shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-muted-foreground font-inter">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// ─── Textarea ────────────────────────────────────────────────────────────────

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, label, error, hint, id, ...props }, ref) => {
    const textareaId = id ?? React.useId();

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-semibold text-foreground font-poppins"
          >
            {label}
            {props.required && (
              <span className="text-error ml-1" aria-hidden>*</span>
            )}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "w-full min-h-[100px] rounded-xl border bg-white px-4 py-3",
            "font-inter text-sm text-foreground resize-y",
            "placeholder:text-muted-foreground/60",
            "transition-all duration-200",
            "border-border shadow-soft-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            error && "border-error focus:ring-error/20 focus:border-error",
            "disabled:bg-muted disabled:opacity-60 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />

        {error && (
          <p className="text-xs text-error font-inter font-medium flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-error shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-muted-foreground font-inter">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
