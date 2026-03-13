"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, getInitials } from "@/lib/utils/cn";

const avatarVariants = cva(
    "relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden font-poppins font-bold",
    {
      variants: {
        size: {
          xs:   "w-6  h-6  text-[10px]",
          sm:   "w-8  h-8  text-xs",
          md:   "w-10 h-10 text-sm",
          lg:   "w-12 h-12 text-base",
          xl:   "w-16 h-16 text-lg",
          "2xl":"w-20 h-20 text-xl",
        },
        color: {
          honey:   "bg-honey-100 text-honey-700",
          ink:     "bg-ink-100 text-ink-700",
          success: "bg-success/10 text-success-dark",
          warning: "bg-warning/10 text-warning-dark",
          error:   "bg-error/10 text-error",
          info:    "bg-info/10 text-info-dark",
          random:  "",
        },
      },
      defaultVariants: {
        size: "md",
        color: "honey",
      },
    }
);

const AVATAR_COLORS = [
  "bg-honey-100 text-honey-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

function getColorFromName(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?:       string | null;
  name?:      string;
  alt?:       string;
  className?: string;
  ring?:      boolean;
  online?:    boolean;
}

function Avatar({ src, name, alt, size, color, className, ring, online }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const initials  = name ? getInitials(name) : "?";
  const autoColor = name ? getColorFromName(name) : "";

  return (
      <div className="relative inline-flex">
        <div
            className={cn(
                avatarVariants({ size, color: color === "random" ? "random" : color }),
                color === "random" && autoColor,
                ring && "ring-2 ring-white ring-offset-1",
                className
            )}
        >
          {src && !imgError ? (
              // Use plain <img> to avoid next/image hostname restrictions
              // eslint-disable-next-line @next/next/no-img-element
              <img
                  src={src}
                  alt={alt ?? name ?? "Avatar"}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
              />
          ) : (
              <span>{initials}</span>
          )}
        </div>

        {online !== undefined && (
            <span className={cn(
                "absolute bottom-0 right-0 rounded-full border-2 border-white",
                size === "xs" || size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5",
                online ? "bg-success" : "bg-muted-foreground"
            )} />
        )}
      </div>
  );
}

// ─── Avatar Group ─────────────────────────────────────────────────────────────

interface AvatarGroupProps {
  avatars:    { src?: string | null; name?: string }[];
  max?:       number;
  size?:      VariantProps<typeof avatarVariants>["size"];
  className?: string;
}

function AvatarGroup({ avatars, max = 4, size = "sm", className }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const extra   = avatars.length - max;

  return (
      <div className={cn("flex -space-x-2", className)}>
        {visible.map((avatar, i) => (
            <Avatar key={i} src={avatar.src} name={avatar.name} size={size} color="random" ring />
        ))}
        {extra > 0 && (
            <div className={cn(avatarVariants({ size }), "bg-muted text-muted-foreground ring-2 ring-white")}>
              +{extra}
            </div>
        )}
      </div>
  );
}

export { Avatar, AvatarGroup };