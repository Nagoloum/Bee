import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="bg-ink-900 py-14 animate-pulse">
        <div className="container-bee max-w-2xl mx-auto text-center space-y-3">
          <Skeleton className="h-9 w-52 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
      <div className="container-bee py-14">
        <div className="grid lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <div className="space-y-4 animate-pulse">
            {Array.from({length:3}).map((_,i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-border">
                <Skeleton className="w-9 h-9 shrink-0" rounded="lg" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 bg-white rounded-3xl border border-border p-8 space-y-5 animate-pulse">
            <Skeleton className="h-6 w-44" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Skeleton className="h-11 w-full" rounded="lg" />
              <Skeleton className="h-11 w-full" rounded="lg" />
            </div>
            <Skeleton className="h-11 w-full" rounded="lg" />
            <Skeleton className="h-32 w-full" rounded="lg" />
            <Skeleton className="h-12 w-48" rounded="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
