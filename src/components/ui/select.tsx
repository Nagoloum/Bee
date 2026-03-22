"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  icon?:  string;
}

export interface SelectProps {
  label?:       string;
  icon?:        React.ReactNode;
  options:      SelectOption[];
  value?:       string;
  onChange?:    ((e: React.ChangeEvent<HTMLSelectElement>) => void) | ((value: string) => void);
  error?:       string;
  hint?:        string;
  optional?:    boolean;
  required?:    boolean;
  placeholder?: string;
  disabled?:    boolean;
  className?:   string;
  containerClassName?: string;
  id?:          string;
  name?:        string;
}

export function Select({
  label, icon, options, value, onChange, error, hint,
  optional, required, placeholder, disabled, className, containerClassName, id, name,
}: SelectProps) {
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

  const handleSelect = (val: string) => {
    setOpen(false);
    if (!onChange) return;
    // Support both (value: string) => void and React.ChangeEvent handler
    if (onChange.length <= 1) {
      (onChange as (value: string) => void)(val);
    } else {
      const syntheticEvent = { target: { value: val } } as React.ChangeEvent<HTMLSelectElement>;
      (onChange as (e: React.ChangeEvent<HTMLSelectElement>) => void)(syntheticEvent);
    }
  };

  // With icon → floating label style (same as AuthSelect)
  // Without icon → simple label above + dropdown below

  return (
    <div className={cn("flex flex-col gap-1", containerClassName)}>
      {/* Label above (only when no icon) */}
      {label && !icon && (
        <label className="text-sm font-semibold font-poppins text-foreground" htmlFor={id}>
          {label}
          {required && <span className="text-error ml-1">*</span>}
          {optional && (
            <span className="ml-1.5 text-[10px] font-normal bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">
              optionnel
            </span>
          )}
        </label>
      )}

      <div ref={ref} className="relative">
        {/* Trigger button */}
        <button
          type="button"
          id={id}
          name={name}
          disabled={disabled}
          onClick={() => !disabled && setOpen(!open)}
          className={cn(
            "w-full relative flex items-center bg-white border-2 transition-all duration-200 text-left",
            icon ? "h-14 rounded-2xl" : "h-11 rounded-xl px-4",
            open
              ? "border-foreground shadow-soft-sm"
              : error
              ? "border-error/60"
              : "border-border hover:border-border-strong",
            disabled && "opacity-50 cursor-not-allowed bg-muted",
            className
          )}
        >
          {icon ? (
            /* ── Icon / floating-label style (AuthSelect identical) ── */
            <>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <span className="w-4 h-4 flex items-center">{icon}</span>
              </div>

              {/* Floating label */}
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

              {/* Selected value */}
              {selected && (
                <span className="absolute left-11 bottom-2.5 text-sm font-inter text-foreground font-medium flex items-center gap-1.5">
                  {selected.icon && <span className="text-base leading-none">{selected.icon}</span>}
                  {selected.label}
                </span>
              )}
            </>
          ) : (
            /* ── Simple style ── */
            <span className={cn("flex-1 text-sm font-inter truncate flex items-center gap-2",
              selected ? "text-foreground" : "text-muted-foreground/60")}>
              {selected ? (
                <>
                  {selected.icon && <span>{selected.icon}</span>}
                  {selected.label}
                </>
              ) : (placeholder ?? "Choisir…")}
            </span>
          )}

          {/* Chevron */}
          <ChevronDown size={15} className={cn(
            "text-muted-foreground transition-transform duration-200 shrink-0",
            icon ? "absolute right-4 top-1/2 -translate-y-1/2" : "ml-2",
            open && "rotate-180"
          )} />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 w-full mt-1.5 bg-white rounded-2xl border-2 border-border shadow-soft-lg overflow-hidden origin-top"
            style={{ animation: "scaleIn 0.12s ease-out" }}>
            <style>{`@keyframes scaleIn{from{opacity:0;transform:scaleY(0.95)}to{opacity:1;transform:scaleY(1)}}`}</style>
            <div className="max-h-52 overflow-y-auto py-1.5 scrollbar-hide">
              {placeholder && (
                <button type="button" onClick={() => handleSelect("")}
                  className="w-full flex items-center px-4 py-2.5 text-sm font-inter text-muted-foreground hover:bg-muted transition-colors text-left">
                  {placeholder}
                </button>
              )}
              {options.map((opt) => {
                const isSel = opt.value === value;
                return (
                  <button key={opt.value} type="button" onClick={() => handleSelect(opt.value)}
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
      {hint && !error && (
        <p className="text-xs text-muted-foreground font-inter px-1">{hint}</p>
      )}
    </div>
  );
}
