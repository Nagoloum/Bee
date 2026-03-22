import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      <div className="hidden lg:block lg:w-[52%] bg-muted animate-pulse shrink-0" />
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-sm space-y-4 animate-pulse">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-12 w-full" rounded="lg" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-px flex-1" />
          </div>
          <Skeleton className="h-14 w-full" rounded="lg" />
          <Skeleton className="h-14 w-full" rounded="lg" />
          <Skeleton className="h-12 w-full" rounded="lg" />
        </div>
      </div>
    </div>
  );
}
