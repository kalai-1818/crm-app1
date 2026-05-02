import React from 'react';

interface SkeletonProps {
  className?: string;
  key?: React.Key;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={`bg-stone-100 animate-pulse rounded-md ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="grid grid-cols-[repeat(var(--cols),1fr)] gap-4 p-6 border-b border-stone-50" style={{ '--cols': columns } as any}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === 0 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
