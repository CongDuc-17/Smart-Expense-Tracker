// ============================================================
// MonthYearPicker — Điều hướng tháng/năm
// Phase 3 — Expense & Income Module
//
// Kết nối Zustand store. Prev/Next arrows, không cho phép
// navigate sang tháng tương lai.
// ============================================================

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTransactionStore } from "@/features/transactions/stores/transaction.store";

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function MonthYearPicker() {
  const {
    selectedMonth,
    selectedYear,
    goToPrevMonth,
    goToNextMonth,
    setSelectedMonth,
    setSelectedYear,
  } = useTransactionStore();

  const now = new Date();
  const isCurrentMonth =
    selectedMonth === now.getMonth() + 1 &&
    selectedYear === now.getFullYear();

  const handleGoToToday = () => {
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  };

  return (
    <div className="flex items-center gap-1">
      {/* Today */}
      <button
        type="button"
        onClick={handleGoToToday}
        disabled={isCurrentMonth}
        className="
          px-2.5 h-7 rounded-md text-xs font-medium mr-1
          text-muted-foreground hover:text-foreground
          hover:bg-accent
          transition-colors duration-150
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent
        "
      >
        Hôm nay
      </button>

      {/* Prev */}
      <button
        type="button"
        onClick={goToPrevMonth}
        aria-label="Tháng trước"
        className="
          w-7 h-7 rounded-md flex items-center justify-center
          text-muted-foreground hover:text-foreground
          hover:bg-accent
          transition-colors duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
        "
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Label */}
      <span className="text-sm font-medium text-foreground min-w-[110px] text-center select-none">
        {MONTH_NAMES[selectedMonth - 1]}, {selectedYear}
      </span>

      {/* Next — disabled khi là tháng hiện tại */}
      <button
        type="button"
        onClick={goToNextMonth}
        disabled={isCurrentMonth}
        aria-label="Tháng sau"
        aria-disabled={isCurrentMonth}
        className="
          w-7 h-7 rounded-md flex items-center justify-center
          text-muted-foreground hover:text-foreground
          hover:bg-accent
          transition-colors duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent
        "
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
