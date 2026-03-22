import { cn } from "@/lib/utils/cn";

// ─── Base Skeleton ─────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  rounded?:   "sm" | "md" | "lg" | "full";
}

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  const r = { sm: "rounded-lg", md: "rounded-xl", lg: "rounded-2xl", full: "rounded-full" }[rounded];
  return (
    <div className={cn("animate-pulse bg-muted", r, className)} />
  );
}

// ─── Product Card Skeleton ─────────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <Skeleton className="w-full aspect-square" rounded="sm" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-16" rounded="lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Products Grid Skeleton ────────────────────────────────────────────────────

export function ProductsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Stat Card Skeleton ────────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="w-8 h-8" rounded="lg" />
      </div>
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// ─── Table Row Skeleton ────────────────────────────────────────────────────────

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border last:border-0">
      <Skeleton className="w-10 h-10 shrink-0" rounded="lg" />
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" style={{ maxWidth: `${80 - i * 15}%` } as any} />
      ))}
    </div>
  );
}

// ─── Dashboard Skeleton ────────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-11 w-40" rounded="lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-5 space-y-4">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)}
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-16 w-full" rounded="lg" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product Form Skeleton ─────────────────────────────────────────────────────

export function ProductFormSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-11 w-full" rounded="lg" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-11 w-full" rounded="lg" />
            <Skeleton className="h-11 w-full" rounded="lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Orders List Skeleton ─────────────────────────────────────────────────────

export function OrdersListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-border p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 shrink-0" rounded="lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="space-y-1 text-right">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20" rounded="full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page Header Skeleton ─────────────────────────────────────────────────────

export function PageHeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-muted h-40 md:h-52 w-full" />
      <div className="container-bee py-5 space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

// ─── Settings Skeleton ────────────────────────────────────────────────────────

export function SettingsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-pulse">
      {Array.from({ length: 3 }).map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <Skeleton className="h-5 w-44" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-14 w-full" rounded="lg" />
            <Skeleton className="h-14 w-full" rounded="lg" />
          </div>
          <Skeleton className="h-20 w-full" rounded="lg" />
        </div>
      ))}
      <Skeleton className="h-12 w-full" rounded="lg" />
    </div>
  );
}
