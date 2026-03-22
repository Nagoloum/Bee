import { Skeleton, OrdersListSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-white animate-pulse">
        <div className="container-bee py-6 space-y-1">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="container-bee py-8 max-w-3xl">
        <OrdersListSkeleton count={5} />
      </div>
    </div>
  );
}
