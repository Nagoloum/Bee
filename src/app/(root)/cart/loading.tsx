import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-bee py-8 animate-pulse">
        <Skeleton className="h-7 w-48 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {Array.from({length:3}).map((_,i) => (
              <div key={i} className="flex gap-4 bg-white rounded-2xl border border-border p-4">
                <Skeleton className="w-20 h-20 shrink-0" rounded="lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                  <div className="flex justify-between pt-1">
                    <Skeleton className="h-8 w-24" rounded="lg" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-11 w-full" rounded="lg" />
            </div>
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              {Array.from({length:4}).map((_,i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
              <Skeleton className="h-11 w-full" rounded="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
