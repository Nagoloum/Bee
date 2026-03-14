import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface LegalLayoutProps {
  title:       string;
  lastUpdated: string;
  children:    React.ReactNode;
}

const LEGAL_LINKS = [
  { href: "/legal/cgu",      label: "CGU"                   },
  { href: "/legal/privacy",  label: "Confidentialité"       },
  { href: "/legal/mentions", label: "Mentions légales"      },
  { href: "/legal/cookies",  label: "Politique de cookies"  },
];

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="container-bee py-6">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-inter mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <ChevronRight size={12} />
            <span className="text-foreground font-medium">{title}</span>
          </nav>
          <h1 className="font-poppins font-black text-2xl text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground font-inter mt-1">
            Dernière mise à jour : {lastUpdated}
          </p>
        </div>
      </div>

      <div className="container-bee py-10">
        <div className="flex gap-10">
          {/* Sidebar nav */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-poppins mb-3 px-3">
                Documents légaux
              </p>
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 rounded-xl text-sm font-inter text-foreground-secondary hover:text-foreground hover:bg-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </aside>

          {/* Content */}
          <article className="flex-1 min-w-0 max-w-3xl prose-bee">
            {children}
          </article>
        </div>
      </div>
    </div>
  );
}

// ─── Prose components ─────────────────────────────────────────────────────────

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-poppins font-bold text-xl text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-foreground-secondary font-inter leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-foreground-secondary font-inter leading-relaxed">{children}</p>;
}

export function LegalUl({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-none space-y-2 pl-0">
      {children}
    </ul>
  );
}

export function LegalLi({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-foreground-secondary font-inter">
      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

export function LegalBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-honey-50 border border-honey-200 rounded-2xl p-5 text-sm text-foreground font-inter leading-relaxed">
      {children}
    </div>
  );
}
