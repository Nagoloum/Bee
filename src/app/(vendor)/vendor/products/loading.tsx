import { Skeleton, OrdersListSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-5 max-w-6xl mx-auto p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-11 w-44" rounded="lg" />
      </div>
      <OrdersListSkeleton count={6} />
    </div>
  );
}
