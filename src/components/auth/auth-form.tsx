import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface AuthFormWrapperProps {
  children:    React.ReactNode;
  title:       string;
  subtitle?:   string;
  label?:      string;          // e.g. "DÉMARRER GRATUITEMENT"
  footer?:     React.ReactNode;
  className?:  string;
  maxWidth?:   string;
}

export function AuthFormWrapper({
  children, title, subtitle, label, footer, className, maxWidth = "max-w-sm",
}: AuthFormWrapperProps) {
  return (
    <div className={cn("w-full", maxWidth, className)}>

      {/* Label (like "START FOR FREE") */}
      {label && (
        <p className="text-xs font-semibold font-poppins uppercase tracking-widest text-muted-foreground mb-3">
          {label}
        </p>
      )}

      {/* Title */}
      <h1 className="font-poppins font-black text-3xl text-foreground mb-1 leading-tight">
        {title}
        <span className="text-primary">.</span>
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-sm text-muted-foreground font-inter mb-7">{subtitle}</p>
      )}

      {/* Form content */}
      <div className={subtitle ? "" : "mt-7"}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-6">
          {footer}
        </div>
      )}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function AuthDivider({ label = "ou" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-inter">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Google Button ────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface GoogleButtonProps {
  onClick:  () => void;
  label?:   string;
  className?: string;
}

export function GoogleButton({ onClick, label = "Continuer avec Google", className }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-center gap-3 h-11 rounded-2xl",
        "border-2 border-border bg-white",
        "font-poppins font-semibold text-sm text-foreground",
        "hover:border-honey-300 hover:bg-honey-50/50 hover:-translate-y-0.5",
        "transition-all duration-150 active:scale-[0.98]",
        "dark:bg-ink-800 dark:border-ink-600 dark:text-white dark:hover:border-honey-400",
        className
      )}
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

// ─── Role selector tabs ───────────────────────────────────────────────────────

interface RoleTabsProps {
  current: "client" | "vendor" | "delivery";
}

const TABS = [
  { key: "client",   label: "Client",  emoji: "🛍️", href: "/sign-up"          },
  { key: "vendor",   label: "Vendeur", emoji: "🏪", href: "/sign-up/vendor"   },
  { key: "delivery", label: "Livreur", emoji: "🛵", href: "/sign-up/delivery" },
] as const;

export function RoleTabs({ current }: RoleTabsProps) {
  return (
    <div className="flex gap-1 mb-7">
      {TABS.map((tab) => {
        const isActive = tab.key === current;
        return isActive ? (
          <button
            key={tab.key}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold font-poppins cursor-default"
          >
            <span>{tab.emoji}</span> {tab.label}
          </button>
        ) : (
          <a
            key={tab.key}
            href={tab.href}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 text-xs font-semibold font-poppins transition-colors"
          >
            <span>{tab.emoji}</span> {tab.label}
          </a>
        );
      })}
    </div>
  );
}

// ─── Auth input (clean borderless style) ─────────────────────────────────────

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label:        string;
  error?:       string;
  rightElement?: React.ReactNode;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, rightElement, className, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        <div className={cn(
          "relative flex items-center h-12 rounded-2xl border-2 bg-white transition-all duration-150",
          "dark:bg-ink-800",
          error
            ? "border-error/50 focus-within:border-error"
            : "border-border focus-within:border-foreground hover:border-border-strong",
          className
        )}>
          <div className="absolute left-0 px-4 pt-0 bottom-6 pointer-events-none">
            <label htmlFor={inputId} className="text-[10px] font-semibold text-muted-foreground font-poppins uppercase tracking-wider">
              {label}
            </label>
          </div>
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full h-full pt-4 pb-1 px-4 bg-transparent",
              "font-inter text-sm text-foreground dark:text-white",
              "placeholder:text-transparent",
              "focus:outline-none",
              rightElement && "pr-12"
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-error font-inter px-1">{error}</p>
        )}
      </div>
    );
  }
);
AuthInput.displayName = "AuthInput";

// ─── Auth select ──────────────────────────────────────────────────────────────

interface AuthSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label:   string;
  options: { value: string; label: string }[];
  error?:  string;
}

export function AuthSelect({ label, options, error, id, className, ...props }: AuthSelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      <div className={cn(
        "relative h-12 rounded-2xl border-2 bg-white dark:bg-ink-800 transition-all",
        error ? "border-error/50" : "border-border hover:border-border-strong focus-within:border-foreground",
        className
      )}>
        <div className="absolute left-0 top-0 px-4 pt-1.5 pointer-events-none z-10">
          <label htmlFor={selectId} className="text-[10px] font-semibold text-muted-foreground font-poppins uppercase tracking-wider">
            {label}
          </label>
        </div>
        <select
          id={selectId}
          className="w-full h-full pt-4 pb-1 px-4 bg-transparent font-inter text-sm text-foreground dark:text-white focus:outline-none appearance-none cursor-pointer"
          {...props}
        >
          <option value=""></option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-error font-inter px-1">{error}</p>}
    </div>
  );
}

// ─── Submit button ────────────────────────────────────────────────────────────

interface AuthSubmitProps {
  label:      string;
  isLoading?: boolean;
  variant?:   "primary" | "secondary";
}

export function AuthSubmit({ label, isLoading, variant = "primary" }: AuthSubmitProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={cn(
        "w-full h-12 rounded-2xl font-poppins font-bold text-sm transition-all duration-150",
        "disabled:opacity-60 disabled:pointer-events-none",
        "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
        variant === "primary"
          ? "bg-primary text-white shadow-honey hover:bg-primary-hover hover:shadow-honey-lg"
          : "bg-secondary text-white hover:bg-secondary-hover"
      )}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          Traitement…
        </span>
      ) : label}
    </button>
  );
}
