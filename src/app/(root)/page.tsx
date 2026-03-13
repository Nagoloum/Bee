export default function HomePage() {
  return (
    <div className="container-bee section-bee">
      <div className="text-center py-24">
        <div className="text-6xl mb-6">🐝</div>
        <h1 className="font-poppins font-black text-4xl text-foreground mb-4">
          BEE Marketplace
        </h1>
        <p className="text-muted-foreground font-inter max-w-md mx-auto mb-8">
          Le marché qui bourdonne. Phase 1 complète — Storefront à venir en Phase 3.
        </p>
        <a
          href="/ui-kit"
          className="inline-flex h-11 px-6 rounded-xl bg-primary text-white font-poppins font-semibold text-sm hover:bg-primary-hover transition-colors shadow-honey"
        >
          Voir le UI Kit →
        </a>
      </div>
    </div>
  );
}
