"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/store/theme.store";
import { cn } from "@/lib/utils/cn";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className={cn(
        "relative flex items-center rounded-full border transition-all duration-300",
        "bg-muted border-border hover:border-border-strong",
        "dark:bg-ink-800 dark:border-ink-600",
        size === "sm" ? "w-12 h-6 px-0.5" : "w-14 h-7 px-0.5",
        className
      )}
    >
      {/* Track */}
      <span className={cn(
        "absolute inset-0.5 rounded-full transition-all duration-300",
        isDark ? "bg-ink-700" : "bg-honey-100"
      )} />

      {/* Icons */}
      <span className={cn(
        "absolute transition-all duration-300",
        size === "sm" ? "left-1" : "left-1.5"
      )}>
        <Sun size={size === "sm" ? 10 : 12}
          className={cn("transition-all duration-300",
            isDark ? "text-white/20" : "text-honey-500"
          )} />
      </span>
      <span className={cn(
        "absolute transition-all duration-300",
        size === "sm" ? "right-1" : "right-1.5"
      )}>
        <Moon size={size === "sm" ? 10 : 12}
          className={cn("transition-all duration-300",
            isDark ? "text-blue-300" : "text-ink-300"
          )} />
      </span>

      {/* Thumb */}
      <span className={cn(
        "relative z-10 rounded-full bg-white shadow-soft-sm transition-all duration-300",
        size === "sm" ? "w-4 h-4" : "w-5 h-5",
        isDark
          ? size === "sm" ? "translate-x-6" : "translate-x-7"
          : "translate-x-0"
      )} />
    </button>
  );
}
