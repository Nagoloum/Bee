import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-hero-pattern bg-cream-100 flex flex-col">
      {/* Auth header */}
      <header className="py-5 border-b border-border bg-white/70 backdrop-blur-sm">
        <div className="container-bee flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-honey-gradient flex items-center justify-center shadow-honey">
              <span className="text-lg">🐝</span>
            </div>
            <span className="font-poppins font-black text-lg text-foreground">BEE</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-inter">
            ← Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground font-inter">
          © {new Date().getFullYear()} BEE · <Link href="/legal/cgu" className="hover:underline">CGU</Link> · <Link href="/legal/privacy" className="hover:underline">Confidentialité</Link>
        </p>
      </footer>
    </div>
  );
}
