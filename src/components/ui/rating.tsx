"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  onChange?: (value: number) => void;
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 12,
  md: 16,
  lg: 20,
};

function Rating({ value, max = 5, size = "md", readonly = true, onChange, showValue, className }: RatingProps) {
  const [hovered, setHovered] = React.useState(0);
  const iconSize = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const starValue = i + 1;
          const filled = readonly
            ? starValue <= Math.round(value)
            : starValue <= (hovered || value);
          const partial = !readonly && starValue === Math.ceil(value) && value % 1 > 0;

          return (
            <button
              key={i}
              type="button"
              onClick={() => !readonly && onChange?.(starValue)}
              onMouseEnter={() => !readonly && setHovered(starValue)}
              onMouseLeave={() => !readonly && setHovered(0)}
              className={cn(
                "transition-transform duration-100",
                !readonly && "hover:scale-125 cursor-pointer",
                readonly && "cursor-default pointer-events-none"
              )}
              aria-label={`${starValue} étoile${starValue > 1 ? "s" : ""}`}
            >
              <Star
                size={iconSize}
                className={cn(
                  "transition-colors duration-150",
                  filled
                    ? "fill-honey-400 text-honey-400"
                    : "fill-transparent text-muted-foreground/30"
                )}
                strokeWidth={filled ? 0 : 1.5}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-semibold text-foreground font-inter ml-1">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export { Rating };
