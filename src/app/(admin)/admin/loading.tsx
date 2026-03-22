import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="space-y-1">
        <Skeleton className="h-7 w-48 bg-white/8" />
        <Skeleton className="h-4 w-36 bg-white/5" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({length:6}).map((_,i) => (
          <div key={i} className="rounded-2xl border border-white/8 p-5 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-28 bg-white/8" />
              <Skeleton className="w-8 h-8 bg-white/8 rounded-xl" />
            </div>
            <Skeleton className="h-7 w-24 bg-white/12" />
            <Skeleton className="h-3 w-32 bg-white/5" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {Array.from({length:2}).map((_,i) => (
          <div key={i} className="rounded-2xl border border-white/8 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8 flex justify-between">
              <Skeleton className="h-4 w-36 bg-white/8" />
              <Skeleton className="h-4 w-16 bg-white/5" />
            </div>
            {Array.from({length:4}).map((_,j) => (
              <div key={j} className="flex items-center gap-3 px-5 py-3 border-b border-white/5">
                <Skeleton className="w-8 h-8 rounded-full bg-white/8 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-40 bg-white/8" />
                  <Skeleton className="h-3 w-28 bg-white/5" />
                </div>
                <Skeleton className="h-5 w-20 bg-white/8 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
