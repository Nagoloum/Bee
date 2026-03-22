import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-bee py-8 max-w-5xl mx-auto animate-pulse">
        <div className="flex justify-center gap-4 mb-8">
          {Array.from({length:3}).map((_,i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-8 h-8" rounded="full" />
              <Skeleton className="h-4 w-20 hidden sm:block" />
              {i < 2 && <Skeleton className="w-16 h-px ml-2" />}
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Skeleton className="h-11 w-full" rounded="lg" />
              <Skeleton className="h-11 w-full" rounded="lg" />
            </div>
            <Skeleton className="h-11 w-full" rounded="lg" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Skeleton className="h-11 w-full" rounded="lg" />
              <Skeleton className="h-11 w-full" rounded="lg" />
            </div>
            <Skeleton className="h-11 w-full" rounded="lg" />
          </div>
          <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
            <Skeleton className="h-5 w-36" />
            {Array.from({length:3}).map((_,i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-12 h-12 shrink-0" rounded="lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16 shrink-0" />
              </div>
            ))}
            <div className="border-t border-border pt-3 space-y-2">
              {Array.from({length:3}).map((_,i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
