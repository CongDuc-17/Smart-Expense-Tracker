// ============================================================
// TransactionSkeleton — Loading state
// Phase 3 — Expense & Income Module
// ============================================================

import { Skeleton } from "@/components/ui/skeleton";

function TransactionCardSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card">
      <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0 bg-muted" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3 bg-muted" />
        <Skeleton className="h-3 w-1/3 bg-muted" />
      </div>
      <div className="flex flex-col items-end gap-1">
        <Skeleton className="h-4 w-20 bg-muted" />
        <Skeleton className="h-3 w-10 bg-muted" />
      </div>
    </div>
  );
}

function GroupHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-2 px-1">
      <Skeleton className="h-3 w-16 bg-muted" />
      <Skeleton className="h-3 w-24 bg-muted" />
    </div>
  );
}

interface TransactionSkeletonProps {
  groups?: number;
  cardsPerGroup?: number;
}

export function TransactionSkeleton({
  groups = 3,
  cardsPerGroup = 3,
}: TransactionSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: groups }).map((_, gi) => (
        <div key={`group-${gi}`}>
          <GroupHeaderSkeleton />
          <div className="space-y-2">
            {Array.from({ length: cardsPerGroup }).map((_, ci) => (
              <TransactionCardSkeleton key={`card-${gi}-${ci}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
