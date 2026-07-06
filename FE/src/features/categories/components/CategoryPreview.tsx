// ============================================================
// CategoryPreview — Live Preview Component
// Phase 2 — Category Module
//
// Hiển thị preview trực tiếp của category card khi user
// đang điền form trong Sheet. Update realtime.
// ============================================================

import { Badge } from "@/components/ui/badge";
import { IconDisplay } from "@/features/categories/components/IconPicker";
import type { TransactionType } from "@/features/categories/types/category.types";

// ---------------------------------------------------------------
// Props
// ---------------------------------------------------------------

interface CategoryPreviewProps {
  name: string;
  type: TransactionType;
  iconKey: string;
  color: string;
}

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function CategoryPreview({
  name,
  type,
  iconKey,
  color,
}: CategoryPreviewProps) {
  const displayName = name.trim() || "Tên danh mục";
  const isIncome = type === "INCOME";

  return (
    <div
      className="
        flex items-center gap-3 p-4 rounded-lg border border-border
        bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08)]
      "
    >
      {/* Icon */}
      <IconDisplay
        iconKey={iconKey}
        color={color}
        size="md"
      />

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-500 text-foreground truncate leading-5"
          style={{ fontWeight: name.trim() ? 500 : 400 }}
        >
          {displayName}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-4">
          {isIncome ? "Thu nhập" : "Chi tiêu"}
        </p>
      </div>

      {/* Type Badge */}
      <Badge
        variant="secondary"
        className="
          text-xs font-medium shrink-0
          px-2 py-0.5 rounded-full
        "
        style={{
          backgroundColor: `${color}15`,
          color: color,
          border: `1px solid ${color}30`,
        }}
      >
        {isIncome ? "Thu" : "Chi"}
      </Badge>
    </div>
  );
}
