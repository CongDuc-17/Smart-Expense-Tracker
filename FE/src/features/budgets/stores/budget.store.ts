// ============================================================
// BUDGET STORE
// Phase 5 — Budget Module
// Zustand store for UI state management
// ============================================================

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  Budget,
  BudgetTabFilter,
  BudgetUIState,
  BudgetWithStatus,
  BudgetStatusType,
} from "@/features/budgets/types/budget.types";
import { BudgetStatus } from "@/features/budgets/types/budget.types";

// ---------------------------------------------------------------
// Store Type
// ---------------------------------------------------------------

interface BudgetStore extends BudgetUIState {
  // Sheet actions
  openCreateSheet: () => void;
  closeCreateSheet: () => void;
  openEditSheet: (budget: Budget) => void;
  closeEditSheet: () => void;

  // Dialog actions
  openDeleteDialog: (budget: Budget) => void;
  closeDeleteDialog: () => void;

  // Filter actions
  setActiveTab: (tab: BudgetTabFilter) => void;
  setSearchQuery: (query: string) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;

  // Sort actions
  setSortBy: (sortBy: "name" | "spent" | "limit" | "percentage") => void;
  setSortOrder: (order: "asc" | "desc") => void;

  // Reset
  resetFilters: () => void;
}

// ---------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------

const INITIAL_STATE: BudgetUIState = {
  isCreateSheetOpen: false,
  isEditSheetOpen: false,
  editingBudget: null,
  isDeleteDialogOpen: false,
  deletingBudget: null,
  activeTab: "ALL",
  searchQuery: "",
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  sortBy: "name",
  sortOrder: "asc",
};

// ---------------------------------------------------------------
// Store
// ---------------------------------------------------------------

export const useBudgetStore = create<BudgetStore>()(
  devtools(
    (set) => ({
      ...INITIAL_STATE,

      // Sheet actions
      openCreateSheet: () => set({ isCreateSheetOpen: true }),
      closeCreateSheet: () => set({ isCreateSheetOpen: false }),
      openEditSheet: (budget) =>
        set({ isEditSheetOpen: true, editingBudget: budget }),
      closeEditSheet: () =>
        set({ isEditSheetOpen: false, editingBudget: null }),

      // Dialog actions
      openDeleteDialog: (budget) =>
        set({ isDeleteDialogOpen: true, deletingBudget: budget }),
      closeDeleteDialog: () =>
        set({ isDeleteDialogOpen: false, deletingBudget: null }),

      // Filter actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedMonth: (month) => set({ selectedMonth: month }),
      setSelectedYear: (year) => set({ selectedYear: year }),

      // Sort actions
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (order) => set({ sortOrder: order }),

      // Reset
      resetFilters: () =>
        set({
          activeTab: "ALL",
          searchQuery: "",
          selectedMonth: new Date().getMonth() + 1,
          selectedYear: new Date().getFullYear(),
          sortBy: "name",
          sortOrder: "asc",
        }),
    }),
    { name: "BudgetStore" }
  )
);

// ---------------------------------------------------------------
// Selectors (memoized)
// ---------------------------------------------------------------

/**
 * Filter budgets based on UI state
 */
export const selectFilteredBudgets = (
  budgets: BudgetWithStatus[],
  filters: {
    activeTab: BudgetTabFilter;
    searchQuery: string;
    month: number;
    year: number;
    sortBy: "name" | "spent" | "limit" | "percentage";
    sortOrder: "asc" | "desc";
  }
): BudgetWithStatus[] => {
  let result = [...budgets];

  // Filter by status tab
  if (
    filters.activeTab !== "ALL" &&
    filters.activeTab !== "ACTIVE" &&
    (filters.activeTab === "HEALTHY" ||
      filters.activeTab === "WARNING" ||
      filters.activeTab === "CRITICAL")
  ) {
    result = result.filter((b) => b.status === filters.activeTab);
  }

  if (filters.activeTab === "ACTIVE") {
    result = result.filter((b) => b.isActive);
  }

  // Filter by search query (category name)
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    result = result.filter((b) =>
      b.category?.name.toLowerCase().includes(query)
    );
  }

  // Filter by month/year
  result = result.filter(
    (b) => b.month === filters.month && b.year === filters.year
  );

  // Sort
  result.sort((a, b) => {
    let compareVal = 0;

    switch (filters.sortBy) {
      case "name":
        compareVal = (a.category?.name || "").localeCompare(
          b.category?.name || ""
        );
        break;
      case "spent":
        compareVal = a.spentAmount - b.spentAmount;
        break;
      case "limit":
        compareVal = a.limitAmount - b.limitAmount;
        break;
      case "percentage":
        compareVal = a.percentage - b.percentage;
        break;
    }

    return filters.sortOrder === "asc" ? compareVal : -compareVal;
  });

  return result;
};

/**
 * Calculate budget status based on spent percentage
 */
export const calculateBudgetStatus = (
  spentAmount: number,
  limitAmount: number
): { status: BudgetStatusType; percentage: number } => {
  const percentage = Math.min((spentAmount / limitAmount) * 100, 100);

  let status: BudgetStatusType;
  if (percentage >= 90) {
    status = BudgetStatus.CRITICAL;
  } else if (percentage >= 70) {
    status = BudgetStatus.WARNING;
  } else {
    status = BudgetStatus.HEALTHY;
  }

  return { status, percentage };
};

/**
 * Format budget with status
 */
export const formatBudgetWithStatus = (budget: Budget): BudgetWithStatus => {
  const { status, percentage } = calculateBudgetStatus(
    budget.spentAmount,
    budget.limitAmount
  );

  return {
    ...budget,
    status,
    percentage,
  };
};
