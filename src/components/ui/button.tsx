"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-poppins font-semibold",
    "rounded-xl",
    "transition-all duration-200 ease-smooth",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none whitespace-nowrap",
    "relative overflow-hidden",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-white",
          "hover:bg-primary-hover hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.98]",
          "shadow-honey hover:shadow-honey-lg",
          "focus-visible:ring-primary",
        ].join(" "),
        secondary: [
          "bg-secondary text-white",
          "hover:bg-secondary-hover hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.98]",
          "shadow-soft hover:shadow-soft-md",
          "focus-visible:ring-secondary",
        ].join(" "),
        outline: [
          "border-2 border-primary text-primary bg-transparent",
          "hover:bg-primary/5 hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.98]",
          "focus-visible:ring-primary",
        ].join(" "),
        "outline-ink": [
          "border-2 border-secondary text-secondary bg-transparent",
          "hover:bg-secondary/5 hover:-translate-y-0.5",
          "focus-visible:ring-secondary",
        ].join(" "),
        ghost: [
          "text-foreground bg-transparent",
          "hover:bg-muted hover:text-foreground",
          "focus-visible:ring-primary",
        ].join(" "),
        "ghost-primary": [
          "text-primary bg-transparent",
          "hover:bg-primary/10",
          "focus-visible:ring-primary",
        ].join(" "),
        destructive: [
          "bg-error text-white",
          "hover:bg-error/90 hover:-translate-y-0.5",
          "shadow-soft hover:shadow-soft-md",
          "focus-visible:ring-error",
        ].join(" "),
        success: [
          "bg-success text-white",
          "hover:bg-success/90 hover:-translate-y-0.5",
          "shadow-soft hover:shadow-soft-md",
          "focus-visible:ring-success",
        ].join(" "),
        link: [
          "text-primary underline-offset-4 hover:underline",
          "p-0 h-auto",
          "focus-visible:ring-primary",
        ].join(" "),
      },
      size: {
        xs:        "h-7  px-2.5 text-xs  rounded-lg",
        sm:        "h-9  px-4   text-sm  rounded-xl",
        md:        "h-11 px-5   text-sm  rounded-xl",
        lg:        "h-13 px-7   text-base rounded-2xl",
        xl:        "h-14 px-8   text-base rounded-2xl",
        icon:      "h-10 w-10   rounded-xl",
        "icon-sm": "h-8  w-8    rounded-lg",
        "icon-lg": "h-12 w-12   rounded-2xl",
      },
      fullWidth: { true: "w-full" },
      rounded:   { full: "!rounded-full" },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?:  boolean;
  loadingText?: string;
  leftIcon?:   React.ReactNode;
  rightIcon?:  React.ReactNode;
  asChild?:    boolean; // accepted but never forwarded to DOM
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      rounded,
      isLoading,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      asChild: _asChild, // destructured to prevent DOM leak
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, rounded }), className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            {loadingText ?? children}
          </>
        ) : (
          <>
            {leftIcon  && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
