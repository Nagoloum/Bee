"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

const sizeMap = {
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-2xl",
  full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
};

function Modal({
  open,
  onClose,
  children,
  title,
  description,
  size = "md",
  showClose = true,
  closeOnBackdrop = true,
  className,
}: ModalProps) {
  // Lock scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on ESC
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={cn(
          "relative z-10 w-full bg-white rounded-3xl shadow-soft-xl",
          "animate-scale-in",
          "flex flex-col",
          sizeMap[size],
          className
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-0">
            <div className="flex-1">
              {title && (
                <h2 className="font-poppins font-bold text-xl text-foreground leading-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted-foreground font-inter">
                  {description}
                </p>
              )}
            </div>

            {showClose && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="ml-4 shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Fermer"
              >
                <X size={18} />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn("overflow-y-auto", title ? "px-6 pt-4 pb-6" : "p-6")}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "default",
  isLoading,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      {description && (
        <p className="text-sm text-muted-foreground font-inter mb-6 -mt-2">
          {description}
        </p>
      )}
      <div className="flex gap-3">
        <Button variant="outline" fullWidth onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === "destructive" ? "destructive" : "default"}
          fullWidth
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

// ─── Drawer (bottom sheet on mobile) ─────────────────────────────────────────

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

function Drawer({ open, onClose, children, title, className }: DrawerProps) {
  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 w-full sm:max-w-md",
          "bg-white rounded-t-3xl sm:rounded-3xl",
          "animate-fade-up",
          "shadow-soft-xl",
          className
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <h3 className="font-poppins font-bold text-lg text-foreground">{title}</h3>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
        )}

        <div className="px-6 pt-2 pb-8">{children}</div>
      </div>
    </div>
  );
}

export { Modal, ConfirmModal, Drawer };
