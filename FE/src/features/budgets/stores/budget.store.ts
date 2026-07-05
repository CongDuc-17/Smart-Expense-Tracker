// ============================================================
// BUDGET STORE (ZUSTAND)
// Phase 5 — Budget Module
//
// Quản lý UI/Client state: tháng năm đang chọn, trạng thái mở các Form Sheet/Dialog.
// KHÔNG chứa business logic liên quan tới data server (TanStack Query lo phần đó).
// ============================================================

import { create } from "zustand";
import type { Budget } from "@/features/budgets/types/budget.types";

interface BudgetUIState {
  // ─── Filters ────────────────────────────────────────────────
  selectedMonth: number;
  selectedYear: number;

  // ─── Dialogs & Sheets State ─────────────────────────────────
  isCreateSheetOpen: boolean;
  editingBudget: Budget | null;
  deletingBudget: Budget | null;

  // ─── Actions ────────────────────────────────────────────────
  setMonthYear: (month: number, year: number) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;

  openCreateSheet: () => void;
  closeCreateSheet: () => void;
  openEditSheet: (budget: Budget) => void;
  closeEditSheet: () => void;
  openDeleteDialog: (budget: Budget) => void;
  closeDeleteDialog: () => void;
}

export const useBudgetStore = create<BudgetUIState>((set) => ({
  // Default: tháng hiện tại
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),

  isCreateSheetOpen: false,
  editingBudget: null,
  deletingBudget: null,

  setMonthYear: (month, year) => set({ selectedMonth: month, selectedYear: year }),

  goToPrevMonth: () =>
    set((state) => {
      let m = state.selectedMonth - 1;
      let y = state.selectedYear;
      if (m < 1) {
        m = 12;
        y -= 1;
      }
      return { selectedMonth: m, selectedYear: y };
    }),

  goToNextMonth: () =>
    set((state) => {
      let m = state.selectedMonth + 1;
      let y = state.selectedYear;
      if (m > 12) {
        m = 1;
        y += 1;
      }
      return { selectedMonth: m, selectedYear: y };
    }),

  openCreateSheet: () => set({ isCreateSheetOpen: true }),
  closeCreateSheet: () => set({ isCreateSheetOpen: false }),

  openEditSheet: (budget) => set({ editingBudget: budget }),
  closeEditSheet: () => set({ editingBudget: null }),

  openDeleteDialog: (budget) => set({ deletingBudget: budget }),
  closeDeleteDialog: () => set({ deletingBudget: null }),
}));

// Selectors for useShallow
export const selectBudgetFilters = (state: BudgetUIState) => ({
  month: state.selectedMonth,
  year: state.selectedYear,
});
