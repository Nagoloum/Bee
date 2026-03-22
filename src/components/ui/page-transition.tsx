"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";

// ─── Top Loading Bar ───────────────────────────────────────────────────────────

export function TopLoadingBar() {
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(65),  100);
    const t2 = setTimeout(() => setProgress(85),  300);
    const t3 = setTimeout(() => {
      setProgress(100);
      const t4 = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(t4);
    }, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, searchParams]);

  if (!loading && progress === 0) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 z-[9999] h-0.5 bg-primary transition-all duration-300 ease-out pointer-events-none",
        !loading && progress === 100 ? "opacity-0" : "opacity-100"
      )}
      style={{ width: `${progress}%` }}
    />
  );
}

// ─── Page Transition Wrapper ───────────────────────────────────────────────────

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="animate-fade-in"
      style={{
        animation: "fadeIn 0.18s ease-out",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
      {children}
    </div>
  );
}
