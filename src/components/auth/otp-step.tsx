"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils/cn";

interface OTPStepProps {
  phone:      string;
  onSuccess:  () => void;
  onBack?:    () => void;
  required?:  boolean; // If true, can't skip
}

export function OTPStep({ phone, onSuccess, onBack, required = false }: OTPStepProps) {
  const [code, setCode]         = useState(["", "", "", "", "", ""]);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only

    const newCode = [...code];
    newCode[index] = value.slice(-1); // take last char
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newCode.every((d) => d !== "") && newCode.join("").length === 6) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const finalCode = otpCode ?? code.join("");
    if (finalCode.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "verify", phone, code: finalCode }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Code incorrect.");
        setCode(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
        return;
      }

      setSuccess("Numéro vérifié avec succès !");
      setTimeout(onSuccess, 800);
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");

    try {
      await fetch("/api/otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "send", phone }),
      });
      setCountdown(60);
      setCanResend(false);
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch {
      setError("Impossible de renvoyer le code.");
    } finally {
      setResending(false);
    }
  };

  const maskedPhone = phone.replace(/(\+237)(\d{3})(\d{3})(\d{3})/, "$1 $2 *** ***");

  return (
    <div className="w-full max-w-sm animate-fade-up">
      <div className="bg-white rounded-3xl shadow-soft-xl border border-border p-8 text-center">

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-honey-50 border-2 border-honey-200 mx-auto mb-5 flex items-center justify-center">
          <span className="text-3xl">📱</span>
        </div>

        <h2 className="font-poppins font-bold text-xl text-foreground mb-2">
          Vérification du téléphone
        </h2>
        <p className="text-sm text-muted-foreground font-inter mb-6">
          Entrez le code à 6 chiffres envoyé au{" "}
          <span className="font-semibold text-foreground">{maskedPhone}</span>
        </p>

        {error && (
          <Alert variant="error" className="mb-4 text-left" onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-4 text-left">
            {success}
          </Alert>
        )}

        {/* OTP inputs */}
        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={cn(
                "w-11 h-13 text-center text-xl font-bold font-poppins",
                "rounded-xl border-2 bg-white",
                "transition-all duration-150",
                "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                digit ? "border-primary bg-honey-50" : "border-border",
                error && "border-error/50",
                success && "border-success bg-success/5"
              )}
              style={{ height: "52px" }}
              disabled={loading || !!success}
            />
          ))}
        </div>

        {/* Verify button */}
        <Button
          fullWidth
          isLoading={loading}
          onClick={() => handleVerify()}
          disabled={code.some((d) => !d) || !!success}
          className="mb-4"
        >
          {success ? "✓ Vérifié !" : "Vérifier le code"}
        </Button>

        {/* Resend */}
        <div className="flex items-center justify-center gap-2">
          {canResend ? (
            <Button
              variant="ghost-primary"
              size="sm"
              isLoading={resending}
              onClick={handleResend}
              leftIcon={<RefreshCw size={14} />}
            >
              Renvoyer le code
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground font-inter">
              Renvoyer dans{" "}
              <span className="font-semibold text-foreground tabular-nums">
                0:{countdown.toString().padStart(2, "0")}
              </span>
            </p>
          )}
        </div>

        {/* Skip / back */}
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeft size={14} />}
            >
              Retour
            </Button>
          )}
          {!required && (
            <Button variant="link" size="sm" onClick={onSuccess}>
              Passer cette étape →
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground font-inter mt-3">
          Vérifiez vos SMS et votre messagerie WhatsApp
        </p>
      </div>
    </div>
  );
}
