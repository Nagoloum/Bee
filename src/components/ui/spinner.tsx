import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

// ─── Spinner ──────────────────────────────────────────────────────────────────

const spinnerVariants = cva(
  "animate-spin rounded-full border-solid border-t-transparent",
  {
    variants: {
      size: {
        xs: "w-3  h-3  border-[1.5px]",
        sm: "w-4  h-4  border-2",
        md: "w-6  h-6  border-2",
        lg: "w-8  h-8  border-[3px]",
        xl: "w-12 h-12 border-4",
      },
      color: {
        primary: "border-primary",
        white:   "border-white",
        muted:   "border-muted-foreground",
        current: "border-current",
      },
    },
    defaultVariants: {
      size: "md",
      color: "primary",
    },
  }
);

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

function Spinner({ size, color, className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Chargement"
      className={cn(spinnerVariants({ size, color }), className)}
    />
  );
}

// ─── Full-page loading ────────────────────────────────────────────────────────

function LoadingPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-honey-50 flex items-center justify-center">
            <span className="text-3xl animate-buzz">🐝</span>
          </div>
          <div className="absolute inset-0 rounded-full animate-pulse-honey" />
        </div>
        <p className="text-sm text-muted-foreground font-inter animate-pulse">
          Chargement...
        </p>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  rounded?: "sm" | "md" | "lg" | "full" | "xl" | "2xl";
}

function Skeleton({
  className,
  width,
  height,
  rounded = "md",
  style,
  ...props
}: SkeletonProps) {
  const roundedMap = {
    sm:  "rounded-sm",
    md:  "rounded-md",
    lg:  "rounded-lg",
    xl:  "rounded-xl",
    "2xl":"rounded-2xl",
    full:"rounded-full",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        roundedMap[rounded],
        className
      )}
      style={{ width, height, ...style }}
      {...props}
    >
      <div
        className="absolute inset-0 bg-shimmer-gradient bg-[length:1000px_100%] animate-shimmer"
        aria-hidden
      />
    </div>
  );
}

// ─── Skeleton compositions ────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-border p-0 overflow-hidden">
      <Skeleton height={200} rounded="sm" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton height={14} width="60%" />
        <Skeleton height={20} width="80%" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton height={22} width={80} />
          <Skeleton height={36} width={36} rounded="xl" />
        </div>
      </div>
    </div>
  );
}

function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height={16} className="flex-1" />
      ))}
    </div>
  );
}

export { Spinner, LoadingPage, Skeleton, ProductCardSkeleton, TableRowSkeleton };
