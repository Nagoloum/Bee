// Phase 4 — Vendor Dashboard Layout
export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar — Phase 4 */}
        <aside className="w-64 bg-secondary hidden lg:flex flex-col p-4">
          <div className="flex items-center gap-2 mb-8 p-2">
            <div className="w-8 h-8 rounded-xl bg-honey-gradient flex items-center justify-center">
              <span className="text-lg">🐝</span>
            </div>
            <span className="font-poppins font-black text-white">BEE Vendor</span>
          </div>
          <nav className="flex-1">
            <p className="text-white/30 text-xs font-poppins uppercase tracking-wider px-2 mb-2">Navigation</p>
            {["Dashboard", "Produits", "Commandes", "Statistiques", "Portefeuille", "Coupons", "Flash Sales"].map(item => (
              <a key={item} href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-colors mb-0.5 font-poppins">
                {item}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
