import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const alertVariants = cva(
  "relative w-full rounded-2xl border p-4 flex gap-3 font-inter text-sm",
  {
    variants: {
      variant: {
        success: "bg-success/5 border-success/20 text-success-dark",
        error:   "bg-error/5   border-error/20   text-error",
        warning: "bg-warning/5 border-warning/20 text-warning-dark",
        info:    "bg-info/5    border-info/20    text-info-dark",
        default: "bg-muted     border-border     text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconMap = {
  success: CheckCircle2,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
  default: Info,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  onClose?: () => void;
}

function Alert({ className, variant = "default", title, children, onClose, ...props }: AlertProps) {
  const Icon = iconMap[variant ?? "default"];

  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold font-poppins mb-0.5">{title}</p>
        )}
        <div className="leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export { Alert };
