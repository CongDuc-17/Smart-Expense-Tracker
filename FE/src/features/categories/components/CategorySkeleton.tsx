// ============================================================
// CategorySkeleton — Loading State Component
// Phase 2 — Category Module
// ============================================================

import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------
// Single card skeleton
// ---------------------------------------------------------------

function CategoryCardSkeleton() {
  return (
    <div
      className="
        flex items-center gap-3 p-4 rounded-lg border border-[#E8E7E5]
        bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]
      "
    >
      {/* Icon skeleton */}
      <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0 bg-[#E8E7E5]" />

      {/* Text skeletons */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-[#E8E7E5]" />
        <Skeleton className="h-3 w-1/2 bg-[#E8E7E5]" />
      </div>

      {/* Badge skeleton */}
      <Skeleton className="h-5 w-8 rounded-full bg-[#E8E7E5]" />
    </div>
  );
}

// ---------------------------------------------------------------
// Section header skeleton
// ---------------------------------------------------------------

function SectionHeaderSkeleton() {
  return (
    <div className="flex items-center gap-3 mb-3">
      <Skeleton className="h-4 w-28 bg-[#E8E7E5]" />
      <Skeleton className="h-5 w-16 rounded-full bg-[#E8E7E5]" />
    </div>
  );
}

// ---------------------------------------------------------------
// Full grid skeleton (exported)
// Render 2 sections: default (6 cards) + user (3 cards)
// ---------------------------------------------------------------

interface CategorySkeletonProps {
  /** Số card hiển thị cho default section */
  defaultCount?: number;
  /** Số card hiển thị cho user section */
  userCount?: number;
}

export function CategorySkeleton({
  defaultCount = 6,
  userCount = 3,
}: CategorySkeletonProps) {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Default section skeleton */}
      <div>
        <SectionHeaderSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: defaultCount }).map((_, i) => (
            <CategoryCardSkeleton key={`default-skeleton-${i}`} />
          ))}
        </div>
      </div>

      {/* User section skeleton */}
      <div>
        <SectionHeaderSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: userCount }).map((_, i) => (
            <CategoryCardSkeleton key={`user-skeleton-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
