'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/stores/theme.store';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const theme = useTheme((s) => s.theme);
  const toggle = useTheme((s) => s.toggle);

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}
