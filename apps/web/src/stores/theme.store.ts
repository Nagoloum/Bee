import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const applyDomTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        applyDomTheme(theme);
        set({ theme });
      },
      toggle: () => {
        const next: Theme = get().theme === 'light' ? 'dark' : 'light';
        applyDomTheme(next);
        set({ theme: next });
      },
    }),
    {
      name: 'bee-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyDomTheme(state.theme);
      },
    },
  ),
);
