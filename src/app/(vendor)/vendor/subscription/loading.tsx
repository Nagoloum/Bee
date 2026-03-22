import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
      <div className="space-y-1">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {Array.from({length: 3}).map((_,i) => (
          <div key={i} className="rounded-3xl border-2 border-border bg-white p-7 space-y-4">
            <Skeleton className="h-10 w-10" rounded="lg" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-28" />
            <div className="space-y-2 pt-2">
              {Array.from({length: 7}).map((_,j) => <Skeleton key={j} className="h-4 w-full" />)}
            </div>
            <Skeleton className="h-11 w-full" rounded="lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
