"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import { Eye, EyeOff, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ─── Google Icon ──────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ─── Wrapper ──────────────────────────────────────────────────────────────────

export function AuthFormWrapper({
  children, title, subtitle, label, maxWidth = "max-w-sm", className,
}: {
  children: React.ReactNode; title: string; subtitle?: React.ReactNode;
  label?: string; maxWidth?: string; className?: string;
}) {
  return (
    <div className={cn("w-full", maxWidth, className)}>
      {label && (
        <p className="text-[11px] font-bold font-poppins uppercase tracking-[0.15em] text-muted-foreground mb-3">
          {label}
        </p>
      )}
      <h1 className="font-poppins font-black text-[2rem] text-foreground leading-tight mb-1">
        {title}<span className="text-primary">.</span>
      </h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground font-inter mb-7 leading-relaxed">{subtitle}</p>
      )}
      <div className={subtitle ? "" : "mt-7"}>{children}</div>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function AuthDivider({ label = "ou" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-inter px-1">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Google Button ────────────────────────────────────────────────────────────

export function GoogleButton({
  onClick, label = "Continuer avec Google",
}: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "w-full flex items-center justify-center gap-3 h-12 rounded-2xl",
        "bg-white border-2 border-border",
        "font-poppins font-semibold text-sm text-foreground",
        "hover:border-honey-300 hover:bg-honey-50/60",
        "transition-all duration-200 active:scale-[0.98] shadow-soft-sm"
      )}>
      <GoogleIcon />
      {label}
    </button>
  );
}

// ─── Auth Input ───────────────────────────────────────────────────────────────
// Uses CSS peer + :not(:placeholder-shown) for floating label
// Handles autofill correctly without JS state
// Manages its own password visibility if type="password"

interface AuthInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  label:      string;
  icon:       React.ReactNode;
  error?:     string;
  optional?:  boolean;
  hint?:      string;
  // rightElement is kept for non-password use cases
  rightElement?: React.ReactNode;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon, error, optional, hint, id, className, type, rightElement, ...props }, ref) => {
    const uid = useId();
    const inputId = id ?? `auth-${label.toLowerCase().replace(/\s+/g, "-")}-${uid.replace(/[:]+/g, "")}`;
    const isPassword   = type === "password";
    const [showPw, setShowPw] = useState(false);
    const inputType    = isPassword ? (showPw ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1">
        <div className={cn(
          "relative flex items-center h-14 rounded-2xl bg-white border-2 transition-all duration-200",
          error ? "border-error/60" : "border-border hover:border-border-strong",
          // focus-within handled by CSS
          "focus-within:border-foreground focus-within:shadow-soft-sm"
        )}>
          {/* Icône — reste en bas au centre par défaut, monte quand actif */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none
            peer-focus:top-4 peer-focus:translate-y-0 transition-all duration-200">
            {/* On garde l'icône fixe, elle reste centrée verticalement */}
            <span className="w-4 h-4 flex items-center text-muted-foreground">{icon}</span>
          </div>

          {/* Input — peer pour déclencher le floating label via CSS */}
          <input
            id={inputId}
            ref={ref}
            type={inputType}
            placeholder=" " /* espace requis pour :not(:placeholder-shown) */
            className={cn(
              "peer w-full h-full bg-transparent",
              "pl-11 pb-2 pt-6 pr-4",
              "font-inter text-sm text-foreground",
              "focus:outline-none",
              // Override autofill webkit background
              "[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_white_inset]",
              "[&:-webkit-autofill]:[-webkit-text-fill-color:#1A1A2E]",
              "[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]",
              (isPassword || rightElement) && "pr-12",
              className
            )}
            {...props}
          />

          {/* Floating label — monte quand focus OU quand input a une valeur OU autofill */}
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-11 pointer-events-none font-inter select-none transition-all duration-200",
              // État repos : centré verticalement, taille normale
              "top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
              // État actif (focus ou valeur) via peer
              "peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:tracking-wider peer-focus:uppercase peer-focus:text-muted-foreground",
              "peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:tracking-wider peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:text-muted-foreground",
              // Autofill webkit
              "peer-autofill:top-2.5 peer-autofill:translate-y-0 peer-autofill:text-[10px] peer-autofill:font-semibold peer-autofill:tracking-wider peer-autofill:uppercase",
            )}>
            {label}
            {optional && (
              <span className={cn(
                "ml-1.5 text-[9px] font-normal normal-case tracking-normal",
                "bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md",
                "opacity-0 transition-opacity duration-200",
                "peer-focus:opacity-100 peer-[:not(:placeholder-shown)]:opacity-100",
              )}>
                optionnel
              </span>
            )}
          </label>

          {/* Bouton œil — uniquement pour les champs password, géré en interne */}
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1 z-10"
              aria-label={showPw ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}

          {/* rightElement pour les autres cas (ex: bouton externe) */}
          {!isPassword && rightElement && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-error font-inter px-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-error shrink-0 inline-block" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-muted-foreground font-inter px-1">{hint}</p>
        )}
      </div>
    );
  }
);
AuthInput.displayName = "AuthInput";

// ─── Auth Select (100% custom) ────────────────────────────────────────────────

interface SelectOption { value: string; label: string; icon?: string }

interface AuthSelectProps {
  label:     string;
  icon:      React.ReactNode;
  options:   SelectOption[];
  value?:    string;
  onChange?: (value: string) => void;
  error?:    string;
  optional?: boolean;
  required?: boolean;
}

export function AuthSelect({
  label, icon, options, value, onChange, error, optional, required,
}: AuthSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  const isActive = !!selected || open;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full relative flex items-center h-14 rounded-2xl bg-white border-2 transition-all duration-200 text-left",
            open
              ? "border-foreground shadow-soft-sm"
              : error
              ? "border-error/60"
              : "border-border hover:border-border-strong"
          )}>

          {/* Icône fixe à gauche */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <span className="w-4 h-4 flex items-center">{icon}</span>
          </div>

          {/* Label flottant */}
          <span className={cn(
            "absolute left-11 pointer-events-none font-inter transition-all duration-200 select-none",
            isActive
              ? "top-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
              : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
          )}>
            {label}
            {optional && isActive && (
              <span className="ml-1.5 text-[9px] font-normal normal-case tracking-normal bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">
                optionnel
              </span>
            )}
          </span>

          {/* Valeur sélectionnée */}
          {selected && (
            <span className="absolute left-11 bottom-2.5 text-sm font-inter text-foreground font-medium flex items-center gap-1.5">
              {selected.icon && <span className="text-base leading-none">{selected.icon}</span>}
              {selected.label}
            </span>
          )}

          {/* Chevron */}
          <ChevronDown
            size={16}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 w-full mt-1.5 bg-white rounded-2xl border-2 border-border shadow-soft-lg overflow-hidden animate-scale-in origin-top">
            <div className="max-h-52 overflow-y-auto py-1.5 scrollbar-hide">
              {options.map((opt) => {
                const isSel = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange?.(opt.value); setOpen(false); }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2.5 text-sm font-inter transition-colors text-left",
                      isSel
                        ? "bg-primary/8 text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    )}>
                    <span className="flex items-center gap-2.5">
                      {opt.icon && <span className="text-base leading-none">{opt.icon}</span>}
                      {opt.label}
                    </span>
                    {isSel && <Check size={14} className="text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-error font-inter px-1 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-error shrink-0 inline-block" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Submit Button ────────────────────────────────────────────────────────────

export function AuthSubmit({
  label, isLoading, variant = "primary",
}: { label: string; isLoading?: boolean; variant?: "primary" | "secondary" }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={cn(
        "w-full h-12 rounded-2xl font-poppins font-bold text-sm",
        "transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none",
        "hover:-translate-y-0.5 active:scale-[0.99]",
        variant === "primary"
          ? "bg-primary text-white shadow-honey hover:bg-primary-hover hover:shadow-honey-lg"
          : "bg-secondary text-white hover:bg-secondary-hover shadow-soft"
      )}>
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          Traitement…
        </span>
      ) : label}
    </button>
  );
}
