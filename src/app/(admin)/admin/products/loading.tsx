import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-5 max-w-6xl mx-auto animate-pulse">
      <div className="space-y-1">
        <Skeleton className="h-7 w-44 bg-white/8" />
        <Skeleton className="h-4 w-28 bg-white/5" />
      </div>
      <div className="flex gap-2">
        {Array.from({length:4}).map((_,i) => (
          <Skeleton key={i} className="h-9 w-20 bg-white/8 rounded-xl" />
        ))}
      </div>
      <div className="rounded-2xl border border-white/8 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/8 flex gap-5">
          {Array.from({length:5}).map((_,i) => (
            <Skeleton key={i} className="h-3 w-20 bg-white/8" />
          ))}
        </div>
        {Array.from({length:6}).map((_,i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/5">
            <Skeleton className="w-9 h-9 rounded-xl bg-white/8 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-48 bg-white/8" />
              <Skeleton className="h-3 w-32 bg-white/5" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full bg-white/8 shrink-0" />
            <Skeleton className="h-7 w-20 rounded-lg bg-white/8 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
