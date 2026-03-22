import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const cardVariants = cva(
  "rounded-2xl transition-all duration-200",
  {
    variants: {
      variant: {
        default:  "bg-white border border-border shadow-soft",
        flat:     "bg-white border border-border",
        elevated: "bg-white shadow-soft-md",
        ghost:    "bg-muted/50",
        honey:    "bg-honey-50 border border-honey-200",
        ink:      "bg-secondary text-white",
        gradient: "bg-card-gradient border border-border shadow-soft",
      },
      hover: {
        default: "",
        lift:    "hover:shadow-soft-md cursor-pointer",
        scale:   "cursor-pointer",
        border:  "hover:border-primary cursor-pointer",
        glow:    "hover:shadow-glow cursor-pointer",
      },
      padding: {
        none: "p-0",
        sm:   "p-4",
        md:   "p-6",
        lg:   "p-8",
        xl:   "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "default",
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hover, padding }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5 pb-4", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-poppins font-bold text-lg text-foreground leading-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground font-inter leading-relaxed", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-4 mt-4 border-t border-border", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
