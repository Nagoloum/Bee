import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="bg-ink-900 py-20 animate-pulse">
        <div className="container-bee max-w-3xl mx-auto text-center space-y-4">
          <Skeleton className="h-16 w-16 mx-auto" rounded="lg" />
          <Skeleton className="h-10 w-80 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
          <Skeleton className="h-4 w-72 mx-auto" />
        </div>
      </div>
      <div className="container-bee section-bee">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4 animate-pulse">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="grid grid-cols-2 gap-4 animate-pulse">
            {Array.from({length:4}).map((_,i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-5 space-y-3">
                <Skeleton className="w-9 h-9" rounded="lg" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
