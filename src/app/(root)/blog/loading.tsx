import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="bg-ink-900 py-14 animate-pulse">
        <div className="container-bee max-w-2xl mx-auto text-center space-y-3">
          <Skeleton className="h-4 w-20 mx-auto" />
          <Skeleton className="h-9 w-80 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>
      </div>
      <div className="container-bee py-12 space-y-10">
        {/* Featured article skeleton */}
        <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden border border-border animate-pulse">
          <Skeleton className="aspect-[4/3] md:aspect-auto rounded-none" />
          <div className="p-8 space-y-4">
            <Skeleton className="h-6 w-28" rounded="full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        {/* Grid skeleton */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({length:5}).map((_,i) => (
            <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden">
              <Skeleton className="aspect-video rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-24" rounded="full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
