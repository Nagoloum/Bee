import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-bee section-bee max-w-2xl space-y-5 animate-pulse">
      <Skeleton className="h-7 w-40" />
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-start gap-5">
          <Skeleton className="w-20 h-20 shrink-0" rounded="full" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>
      {/* Info card */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({length:4}).map((_,i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <Skeleton className="w-4 h-4 shrink-0" />
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
      {/* Referral skeleton */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-16 w-full" rounded="lg" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-20 w-full" rounded="lg" />)}
        </div>
        <Skeleton className="h-11 w-full" rounded="lg" />
      </div>
    </div>
  );
}
