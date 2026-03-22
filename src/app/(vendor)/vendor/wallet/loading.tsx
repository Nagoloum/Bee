import { Skeleton, TableRowSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 animate-pulse">
      <div className="space-y-1">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-36 w-full" rounded="lg" />
        <Skeleton className="h-36 w-full" rounded="lg" />
      </div>
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <Skeleton className="h-5 w-40" />
        </div>
        {Array.from({length: 5}).map((_,i) => <TableRowSkeleton key={i} cols={3} />)}
      </div>
    </div>
  );
}
