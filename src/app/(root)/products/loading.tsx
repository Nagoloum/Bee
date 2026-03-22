import { ProductsGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-white animate-pulse">
        <div className="container-bee py-6 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="container-bee py-6">
        <div className="flex gap-6">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-56 shrink-0 space-y-4 animate-pulse">
            <Skeleton className="h-4 w-24" />
            {Array.from({length: 7}).map((_,i) => <Skeleton key={i} className="h-9 w-full" rounded="lg" />)}
            <div className="pt-4 space-y-2">
              <Skeleton className="h-4 w-16" />
              {Array.from({length: 4}).map((_,i) => <Skeleton key={i} className="h-9 w-full" rounded="lg" />)}
            </div>
          </div>
          <div className="flex-1 space-y-5">
            <div className="flex justify-between animate-pulse">
              <Skeleton className="h-4 w-28" />
              <div className="flex gap-2">
                {Array.from({length: 4}).map((_,i) => <Skeleton key={i} className="h-8 w-24" rounded="lg" />)}
              </div>
            </div>
            <ProductsGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </div>
  );
}
