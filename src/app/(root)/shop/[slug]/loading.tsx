import { Skeleton, ProductsGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Banner skeleton */}
      <div className="h-40 md:h-52 bg-muted animate-pulse" />
      {/* Shop info */}
      <div className="container-bee pb-8 animate-pulse">
        <div className="-mt-10 flex items-end gap-4 mb-6">
          <Skeleton className="w-20 h-20 shrink-0 ring-4 ring-white" rounded="lg" />
          <div className="space-y-2 pb-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <ProductsGridSkeleton count={8} />
      </div>
    </div>
  );
}
