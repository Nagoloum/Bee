"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { TopLoadingBar } from "@/components/ui/page-transition";
import { useThemeStore } from "@/store/theme.store";

// ✅ FIX: ThemeApplier applies the theme class to <html> without re-rendering children
function ThemeApplier() {
  const theme = useThemeStore(s => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <TopLoadingBar />
      </Suspense>
      {/* ✅ FIX: ThemeProvider was not wired in — now applied here */}
      <ThemeApplier />
      {children}
    </>
  );
}
