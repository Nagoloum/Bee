import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
