import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

const inter = Inter({
  subsets:  ["latin"],
  variable: "--font-inter",
  display:  "swap",
});

const poppins = Poppins({
  subsets:  ["latin"],
  variable: "--font-poppins",
  weight:   ["400", "500", "600", "700", "800", "900"],
  display:  "swap",
});

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://bee.cm";

// ── Metadata globale (peut être surchargée par generateMetadata dans chaque page)
export const metadata: Metadata = {
  metadataBase: new URL(BASE),

  title: {
    default:  "BEE Marketplace — Le marché qui bourdonne au Cameroun",
    template: "%s — BEE Marketplace",
  },
  description:
    "Achetez et vendez en toute sécurité sur BEE Marketplace. Des milliers de produits auprès des meilleurs vendeurs du Cameroun. Livraison rapide, paiement sécurisé.",
  keywords: [
    "marketplace cameroun", "acheter en ligne cameroun", "vendre en ligne cameroun",
    "e-commerce cameroun", "douala", "yaoundé", "bee marketplace",
  ],
  authors:  [{ name: "BEE Marketplace", url: BASE }],
  creator:  "BEE Marketplace",
  publisher:"BEE Marketplace",

  // ── OpenGraph ──────────────────────────────────────────────────────────────
  openGraph: {
    type:        "website",
    locale:      "fr_CM",
    url:         BASE,
    siteName:    "BEE Marketplace",
    title:       "BEE Marketplace — Le marché qui bourdonne au Cameroun",
    description: "Des milliers de produits. Les meilleurs vendeurs du Cameroun. Livraison rapide et paiement sécurisé.",
    images: [
      {
        url:    `${BASE}/og-image.png`,  // 1200×630px à créer dans /public
        width:  1200,
        height: 630,
        alt:    "BEE Marketplace",
      },
    ],
  },

  // ── Twitter Card ───────────────────────────────────────────────────────────
  twitter: {
    card:        "summary_large_image",
    title:       "BEE Marketplace — Le marché du Cameroun",
    description: "Achetez et vendez en toute sécurité. Livraison partout au Cameroun.",
    images:      [`${BASE}/og-image.png`],
  },

  // ── Robots ─────────────────────────────────────────────────────────────────
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true },
  },

  // ── Icônes ─────────────────────────────────────────────────────────────────
  icons: {
    icon:    [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple:   "/apple-touch-icon.png",
    shortcut:"/favicon.ico",
  },

  // ── Manifest PWA ───────────────────────────────────────────────────────────
  manifest: "/manifest.json",

  // ── Canonical ──────────────────────────────────────────────────────────────
  alternates: { canonical: BASE },
};

export const viewport: Viewport = {
  width:          "device-width",
  initialScale:   1,
  themeColor:     "#F6861A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-inter antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
