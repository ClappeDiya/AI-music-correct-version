import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function SliderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-1/6" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="flex items-start justify-between p-4">
      <div className="space-y-3 flex-1">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export function TrackCardSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4">
      <Skeleton className="h-16 w-16 rounded-md" /> {/* Album art */}
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" /> {/* Title */}
        <Skeleton className="h-3 w-1/4" /> {/* Artist */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-2 w-full max-w-[200px]" /> {/* Progress bar */}
          <Skeleton className="h-3 w-12" /> {/* Duration */}
        </div>
      </div>
      <div className="space-x-2 flex items-center">
        <Skeleton className="h-8 w-8 rounded-full" /> {/* Play button */}
        <Skeleton className="h-8 w-8 rounded-full" /> {/* Options button */}
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-3">
      <Skeleton className="h-4 w-[20%]" />
      <Skeleton className="h-4 w-[30%]" />
      <Skeleton className="h-4 w-[20%]" />
      <Skeleton className="h-4 w-[15%]" />
      <Skeleton className="h-4 w-[15%]" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

interface ListSkeletonProps {
  rows?: number;
  animated?: boolean;
  onLoadMore?: () => void;
}

export function ListSkeleton({
  rows = 5,
  animated = true,
  onLoadMore,
}: ListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "transition-opacity duration-200",
            animated && "animate-in fade-in-0",
            animated && `delay-${(i % 5) * 100}`,
          )}
        >
          <CardSkeleton />
        </div>
      ))}
      {onLoadMore && (
        <div className="py-4 text-center">
          <Skeleton className="h-8 w-32 mx-auto" />
        </div>
      )}
    </div>
  );
}
