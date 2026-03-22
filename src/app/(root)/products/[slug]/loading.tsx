import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-bee py-8 animate-pulse">
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Images */}
          <div className="space-y-3">
            <Skeleton className="aspect-square w-full" rounded="lg" />
            <div className="flex gap-2">
              {Array.from({length:4}).map((_,i) => (
                <Skeleton key={i} className="w-16 h-16" rounded="lg" />
              ))}
            </div>
          </div>
          {/* Info */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-24" rounded="full" />
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-px w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <Skeleton className="h-12 w-full" rounded="lg" />
            <Skeleton className="h-12 w-full" rounded="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
