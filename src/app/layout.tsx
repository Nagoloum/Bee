import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BEE — Le marché qui bourdonne",
    template: "%s | BEE",
  },
  description:
    "BEE est le premier marketplace multi-vendeurs du Cameroun. Achetez et vendez des milliers de produits avec livraison partout au pays.",
  keywords: ["marketplace", "cameroun", "achat en ligne", "vente", "livraison"],
  authors: [{ name: "BEE" }],
  creator: "BEE",
  openGraph: {
    type: "website",
    locale: "fr_CM",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "BEE",
    title: "BEE — Le marché qui bourdonne",
    description: "Achetez et vendez des milliers de produits sur BEE.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BEE — Le marché qui bourdonne",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${inter.variable} font-inter antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
