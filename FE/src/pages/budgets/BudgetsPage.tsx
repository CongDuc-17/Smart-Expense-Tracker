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
    <div className="flex items-center gap-1 bg-muted border border-border rounded-lg p-0.5">
      <button
        onClick={goToPrevMonth}
        className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="text-sm font-medium text-foreground min-w-[110px] text-center select-none">
        {MONTH_NAMES[month - 1]}, {year}
      </span>

      <button
        onClick={goToNextMonth}
        disabled={isCurrentMonth}
        className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
          <h1 className="text-2xl font-bold text-foreground mb-1">Ngân sách</h1>
          <p className="text-sm text-muted-foreground">Kiểm soát chi tiêu theo danh mục</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <BudgetMonthPicker />
          <Button
            onClick={openCreateSheet}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 text-sm font-medium shadow-sm transition-all duration-200"
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
