import { ProductsGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-bee section-bee">
      <div className="space-y-4">
        {/* Hero skeleton */}
        <div className="animate-pulse">
          <div className="w-full h-48 md:h-72 bg-muted rounded-2xl" />
        </div>
        <ProductsGridSkeleton count={8} />
      </div>
    </div>
  );
}
