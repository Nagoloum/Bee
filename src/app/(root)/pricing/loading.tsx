import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="bg-ink-900 py-16 animate-pulse">
        <div className="container-bee max-w-2xl mx-auto text-center space-y-3">
          <Skeleton className="h-10 w-36 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
      <div className="container-bee section-bee space-y-10">
        <div className="text-center space-y-2 animate-pulse">
          <Skeleton className="h-4 w-28 mx-auto" />
          <Skeleton className="h-8 w-56 mx-auto" />
        </div>
        <div className="grid md:grid-cols-3 gap-5 animate-pulse">
          {Array.from({length:3}).map((_,i) => (
            <div key={i} className="rounded-3xl border-2 border-border bg-white p-7 space-y-4">
              <Skeleton className="h-10 w-10" rounded="lg" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-4 w-full" />
              <div className="space-y-2">
                {Array.from({length:7}).map((_,j) => <Skeleton key={j} className="h-4 w-full" />)}
              </div>
              <Skeleton className="h-11 w-full" rounded="lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
