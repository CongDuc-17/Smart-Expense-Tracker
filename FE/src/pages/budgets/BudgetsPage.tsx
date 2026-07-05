// ============================================================
// BUDGETS PAGE
// Phase 5 — Budget Module
// Route: /budgets
//
// Ghép nối các component lại với nhau.
// ============================================================

import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BudgetSummary } from "@/features/budgets/components/BudgetSummary";
import { BudgetGrid } from "@/features/budgets/components/BudgetGrid";
import { CreateBudgetSheet } from "@/features/budgets/components/CreateBudgetSheet";
import { EditBudgetSheet } from "@/features/budgets/components/EditBudgetSheet";
import { DeleteBudgetDialog } from "@/features/budgets/components/DeleteBudgetDialog";
import { useBudgets } from "@/features/budgets/hooks/useBudgets";
import { useBudgetStore, selectBudgetFilters } from "@/features/budgets/stores/budget.store";
import { useShallow } from "zustand/react/shallow";

// ---------------------------------------------------------------
// MonthYearPicker riêng cho Budget
// ---------------------------------------------------------------
const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function BudgetMonthPicker() {
  const { month, year } = useBudgetStore(useShallow(selectBudgetFilters));
  const goToPrevMonth = useBudgetStore((s) => s.goToPrevMonth);
  const goToNextMonth = useBudgetStore((s) => s.goToNextMonth);

  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="flex items-center gap-1 bg-[#F7F6F3] border border-[#E8E7E5] rounded-lg p-0.5">
      <button
        onClick={goToPrevMonth}
        className="w-8 h-8 rounded-md flex items-center justify-center text-[#9B9A97] hover:text-[#37352F] hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#37352F]"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="text-sm font-medium text-[#37352F] min-w-[110px] text-center select-none">
        {MONTH_NAMES[month - 1]}, {year}
      </span>

      <button
        onClick={goToNextMonth}
        disabled={isCurrentMonth}
        className="w-8 h-8 rounded-md flex items-center justify-center text-[#9B9A97] hover:text-[#37352F] hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#37352F] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------
export default function BudgetsPage() {
  const { month, year } = useBudgetStore(useShallow(selectBudgetFilters));
  const openCreateSheet = useBudgetStore((s) => s.openCreateSheet);

  const { budgets, isLoading } = useBudgets({ month, year });

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#37352F] mb-1">Ngân sách</h1>
          <p className="text-sm text-[#9B9A97]">Kiểm soát chi tiêu theo danh mục</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <BudgetMonthPicker />
          <Button
            onClick={openCreateSheet}
            className="bg-[#37352F] text-[#FFFEFC] hover:bg-[#2D2B27] h-9 px-4 text-sm font-medium shadow-sm transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo mới
          </Button>
        </div>
      </div>

      {/* ── Summary ────────────────────────────────────── */}
      <BudgetSummary budgets={budgets} />

      {/* ── Grid ───────────────────────────────────────── */}
      <BudgetGrid budgets={budgets} isLoading={isLoading} />

      {/* ── Overlays ───────────────────────────────────── */}
      <CreateBudgetSheet />
      <EditBudgetSheet />
      <DeleteBudgetDialog />
    </div>
  );
}
