// ============================================================
// TRANSACTION STORE — Zustand UI State
// Phase 3 — Expense & Income Module
//
// Chỉ chứa CLIENT/UI state:
// - Tab active, date filter, category filter
// - Sheet/Dialog open states
//
// Server state (list, detail) do TanStack Query quản lý.
// ============================================================

import { create } from "zustand";
import type {
  TransactionTabFilter,
  TransactionType,
  Transaction,
  TransactionUIState,
  TransactionUIActions,
} from "@/features/transactions/types/transaction.types";

// ---------------------------------------------------------------
// Initial defaults
// ---------------------------------------------------------------

const now = new Date();

const initialState: TransactionUIState = {
  activeTab: "ALL",
  selectedMonth: now.getMonth() + 1,   // getMonth() trả về 0-indexed
  selectedYear: now.getFullYear(),
  selectedCategoryId: null,
  searchQuery: "",
  sortMode: "NEWEST",

  isCreateSheetOpen: false,
  creatingType: "EXPENSE",
  createPrefillData: null,

  isEditSheetOpen: false,
  editingTransaction: null,

  isDeleteDialogOpen: false,
  deletingTransaction: null,
};

// ---------------------------------------------------------------
// Store
// ---------------------------------------------------------------

export const useTransactionStore = create<TransactionUIState & TransactionUIActions>()(
  (set) => ({
    ...initialState,

    // ─── Tab ────────────────────────────────────────────────
    setActiveTab: (tab: TransactionTabFilter) =>
      set({ activeTab: tab, selectedCategoryId: null }), // reset category khi đổi tab

    // ─── Date ────────────────────────────────────────────────
    setSelectedMonth: (month: number) => set({ selectedMonth: month }),
    setSelectedYear:  (year: number)  => set({ selectedYear: year }),

    goToPrevMonth: () =>
      set((state) => {
        if (state.selectedMonth === 1) {
          return { selectedMonth: 12, selectedYear: state.selectedYear - 1 };
        }
        return { selectedMonth: state.selectedMonth - 1 };
      }),

    goToNextMonth: () =>
      set((state) => {
        const now = new Date();
        const isCurrentMonth =
          state.selectedMonth === now.getMonth() + 1 &&
          state.selectedYear === now.getFullYear();

        // Không cho phép navigate sang tương lai
        if (isCurrentMonth) return state;

        if (state.selectedMonth === 12) {
          return { selectedMonth: 1, selectedYear: state.selectedYear + 1 };
        }
        return { selectedMonth: state.selectedMonth + 1 };
      }),

    // ─── Category filter ─────────────────────────────────────
    setSelectedCategoryId: (id: string | null) => set({ selectedCategoryId: id }),

    // ─── Search & Sort ───────────────────────────────────────
    setSearchQuery: (query: string) => set({ searchQuery: query }),
    setSortMode: (mode: any) => set({ sortMode: mode }),

    // ─── Create sheet ─────────────────────────────────────────
    openCreateSheet: (type: TransactionType = "EXPENSE") =>
      set({ isCreateSheetOpen: true, creatingType: type, createPrefillData: null }),

    openCreateSheetWithPrefill: (data, type: TransactionType = "EXPENSE") =>
      set({ isCreateSheetOpen: true, creatingType: type, createPrefillData: data }),

    closeCreateSheet: () => set({ isCreateSheetOpen: false, createPrefillData: null }),

    // ─── Edit sheet ──────────────────────────────────────────
    openEditSheet: (transaction: Transaction) =>
      set({ isEditSheetOpen: true, editingTransaction: transaction }),

    closeEditSheet: () =>
      set({ isEditSheetOpen: false, editingTransaction: null }),

    // ─── Delete dialog ────────────────────────────────────────
    openDeleteDialog: (transaction: Transaction) =>
      set({ isDeleteDialogOpen: true, deletingTransaction: transaction }),

    closeDeleteDialog: () =>
      set({ isDeleteDialogOpen: false, deletingTransaction: null }),

    // ─── Reset ───────────────────────────────────────────────
    resetFilters: () =>
      set({
        activeTab: "ALL",
        selectedMonth: new Date().getMonth() + 1,
        selectedYear: new Date().getFullYear(),
        selectedCategoryId: null,
        searchQuery: "",
        sortMode: "NEWEST",
      }),
  })
);

// ---------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------

/**
 * Lấy TransactionFilters từ store để truyền vào query hook.
 * Chỉ include month/year khi cả 2 có giá trị.
 */
export function selectTransactionFilters(state: TransactionUIState) {
  return {
    month: state.selectedMonth,
    year: state.selectedYear,
    categoryId: state.selectedCategoryId ?? undefined,
    page: 1,
    limit: 50, // Load nhiều hơn, scroll thay vì phân trang page
  };
}
