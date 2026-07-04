// ============================================================
// BudgetGrid Component
// Phase 5 — Budget Module
// Display grid of budgets with empty state
// ============================================================

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BudgetCard } from '@/components/budgets/BudgetCard';
import type { BudgetWithStatus } from "@/features/budgets/types/budget.types";

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

interface BudgetGridProps {
  budgets: BudgetWithStatus[];
  isFiltered: boolean;
  onEdit: (budget: BudgetWithStatus) => void;
  onDelete: (budget: BudgetWithStatus) => void;
  onCreateClick: () => void;
}

export function BudgetGrid({
  budgets,
  isFiltered,
  onEdit,
  onDelete,
  onCreateClick,
}: BudgetGridProps) {
  // Empty state
  if (budgets.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-[#F0EEE8] mb-4">
          <svg
            className="w-8 h-8 text-[#9B9A97]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-base font-medium text-[#37352F] mb-2">
          {isFiltered ? "Không tìm thấy ngân sách" : "Chưa có ngân sách nào"}
        </h3>
        <p className="text-sm text-[#9B9A97] mb-6">
          {isFiltered
            ? "Thử thay đổi bộ lọc để xem các ngân sách khác"
            : "Tạo ngân sách đầu tiên để kiểm soát chi tiêu của bạn"}
        </p>
        {!isFiltered && (
          <Button
            onClick={onCreateClick}
            className="bg-[#37352F] text-[#FFFEFC] hover:bg-[#2D2B27] inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo ngân sách
          </Button>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{budgets.map((budget) => (
  <BudgetCard 
    key={budget.id}
    title={budget.category?.name || "Ngân sách"} 
    spent={budget.spentAmount}                  
    limit={budget.limitAmount}                  
  />
))}
    </div>
  );
}
