"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Composant client léger à ajouter dans la homepage ou le layout (root).
 * Il capture le paramètre ?ref= de l'URL et le stocke en sessionStorage
 * pour le traitement après signup.
 *
 * Usage dans src/app/(root)/page.tsx :
 *   import { RefCapture } from "@/components/storefront/ref-capture";
 *   // dans le JSX, ajouter avant </main> :
 *   <RefCapture />
 *
 * Ou dans src/app/(root)/layout.tsx pour capter sur toutes les pages :
 *   import { Suspense } from "react";
 *   import { RefCapture } from "@/components/storefront/ref-capture";
 *   // dans le JSX :
 *   <Suspense fallback={null}><RefCapture /></Suspense>
 */
export function RefCapture() {
  const params = useSearchParams();

  useEffect(() => {
    const ref = params.get("ref");
    if (ref && ref.length > 0) {
      try {
        sessionStorage.setItem("bee_ref_code", ref);
      } catch {}
    }
  }, [params]);

  return null; // composant invisible
}
