'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/composed/theme-toggle';
import { PageTransition } from '@/components/composed/page-transition';

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-poppins text-2xl font-bold text-primary-500">
            🐝 Bee
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/products" className="text-text-secondary hover:text-primary-500">
              Catalogue
            </Link>
            <Link href="/shops" className="text-text-secondary hover:text-primary-500">
              Boutiques
            </Link>
            <Link href="/ui-kit" className="text-text-secondary hover:text-primary-500">
              UI Kit
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main>
        <PageTransition pathKey={pathname}>{children}</PageTransition>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-text-secondary">
          © {new Date().getFullYear()} Bee Marketplace — Cameroun
        </div>
      </footer>
    </div>
  );
}
