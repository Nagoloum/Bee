import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-poppins font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-primary/10 text-primary border border-primary/20",
        secondary:   "bg-secondary/10 text-secondary border border-secondary/20",
        success:     "bg-success/10 text-success-dark border border-success/20",
        warning:     "bg-warning/10 text-warning-dark border border-warning/20",
        error:       "bg-error/10 text-error border border-error/20",
        info:        "bg-info/10 text-info-dark border border-info/20",
        muted:       "bg-muted text-muted-foreground border border-border",
        solid:       "bg-primary text-white",
        "solid-ink": "bg-secondary text-white",
        outline:     "bg-transparent text-primary border-2 border-primary",
        premium:     "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-honey",
      },
      size: {
        xs: "text-[10px] px-1.5 py-0.5 rounded-md",
        sm: "text-xs    px-2   py-0.5 rounded-lg",
        md: "text-sm    px-2.5 py-1   rounded-xl",
        lg: "text-sm    px-3   py-1.5 rounded-xl",
      },
      dot: {
        true: "pl-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

function Badge({ className, variant, size, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, dot }), className)} {...props}>
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor ?? "bg-current")}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
