import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="bg-honey-gradient py-20 animate-pulse">
        <div className="container-bee max-w-3xl mx-auto text-center space-y-4">
          <Skeleton className="h-14 w-14 mx-auto" rounded="full" />
          <Skeleton className="h-10 w-80 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
          <Skeleton className="h-12 w-44 mx-auto" rounded="lg" />
        </div>
      </div>
      <div className="container-bee section-bee">
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({length:3}).map((_,i) => (
            <div key={i} className="bg-white rounded-3xl border-2 border-border p-7 space-y-4 animate-pulse">
              <Skeleton className="w-12 h-12" rounded="lg" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <div className="space-y-2">
                {Array.from({length:4}).map((_,j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
