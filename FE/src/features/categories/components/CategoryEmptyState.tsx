// ============================================================
// CategoryEmptyState — Empty State Component
// Phase 2 — Category Module
// ============================================================

import { FolderOpen, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------
// Props
// ---------------------------------------------------------------

type EmptyStateVariant = "empty" | "filtered";

interface CategoryEmptyStateProps {
  variant: EmptyStateVariant;
  /** Chỉ cần khi variant = "empty" */
  onCreateClick?: () => void;
}

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function CategoryEmptyState({
  variant,
  onCreateClick,
}: CategoryEmptyStateProps) {
  if (variant === "filtered") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#F7F6F3] flex items-center justify-center mb-4">
          <SearchX className="w-6 h-6 text-[#9B9A97]" />
        </div>

        {/* Text */}
        <h3 className="text-sm font-medium text-[#37352F] mb-1">
          Không tìm thấy danh mục
        </h3>
        <p className="text-sm text-[#9B9A97] max-w-xs leading-5">
          Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc khác.
        </p>
      </div>
    );
  }

  // variant === "empty"
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {/* Icon */}
      <div className="w-12 h-12 rounded-2xl bg-[#F7F6F3] flex items-center justify-center mb-4">
        <FolderOpen className="w-6 h-6 text-[#9B9A97]" />
      </div>

      {/* Text */}
      <h3 className="text-sm font-medium text-[#37352F] mb-1">
        Chưa có danh mục cá nhân
      </h3>
      <p className="text-sm text-[#9B9A97] max-w-xs leading-5 mb-5">
        Tạo danh mục đầu tiên để bắt đầu phân loại giao dịch theo cách của bạn.
      </p>

      {/* CTA */}
      {onCreateClick && (
        <Button
          onClick={onCreateClick}
          size="sm"
          className="
            bg-[#37352F] text-[#FFFEFC] text-sm font-medium
            hover:bg-[#2D2B27] active:bg-[#1F1D1A]
            transition-colors duration-200
          "
        >
          Tạo danh mục đầu tiên
        </Button>
      )}
    </div>
  );
}
