"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect } from "react";

interface ThemeState {
  theme: "light" | "dark";
  toggle: () => void;
  set: (theme: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      toggle: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      set: (theme) => set({ theme }),
    }),
    { name: "bee-theme" }
  )
);

// Hook to apply theme class to <html>
export function useTheme() {
  const { theme, toggle } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return { theme, toggle, isDark: theme === "dark" };
}
