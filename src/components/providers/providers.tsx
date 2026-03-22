"use client";

import { Suspense } from "react";
import { TopLoadingBar } from "@/components/ui/page-transition";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <TopLoadingBar />
      </Suspense>
      {children}
    </>
  );
}
