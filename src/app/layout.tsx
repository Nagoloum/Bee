import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

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
  title: { default: "BEE — Le marché qui bourdonne", template: "%s | BEE" },
  description: "BEE est le premier marketplace multi-vendeurs du Cameroun.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${poppins.variable} ${inter.variable} font-inter antialiased bg-background text-foreground`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
