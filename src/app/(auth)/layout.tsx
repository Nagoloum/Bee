import { Navbar } from "@/components/storefront/navbar";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Navbar toujours visible */}
      <Navbar />

      {/* Split — remplit la hauteur restante */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* GAUCHE — Visual (caché mobile) */}
        <div className="hidden lg:block lg:w-[52%] xl:w-[55%] relative overflow-hidden shrink-0">
          <AuthVisualPanel />
        </div>

        {/* DROITE — Formulaire */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
