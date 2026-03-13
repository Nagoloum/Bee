// Phase 8 — Admin Panel Layout
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <aside className="w-64 bg-ink-950 hidden lg:flex flex-col p-4">
          <div className="flex items-center gap-2 mb-8 p-2">
            <div className="w-8 h-8 rounded-xl bg-honey-gradient flex items-center justify-center">
              <span className="text-lg">🐝</span>
            </div>
            <span className="font-poppins font-black text-white">BEE Admin</span>
          </div>
          <nav className="flex-1">
            {["Dashboard", "Utilisateurs", "Vendeurs", "Livreurs", "Produits", "Commandes", "Litiges", "Abonnements", "Portefeuilles", "Logs"].map(item => (
              <a key={item} href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-colors mb-0.5 font-poppins">
                {item}
              </a>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
