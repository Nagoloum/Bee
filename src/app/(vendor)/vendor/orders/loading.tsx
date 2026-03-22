import { Skeleton, OrdersListSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-5 max-w-5xl mx-auto p-6 animate-pulse">
      <div className="space-y-1">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex gap-2">
        {Array.from({length: 5}).map((_,i) => <Skeleton key={i} className="h-9 w-28" rounded="lg" />)}
      </div>
      <OrdersListSkeleton count={5} />
    </div>
  );
}
