// ============================================================
// TRANSACTION TYPES
// Phase 3 — Expense & Income Module
// Foundation: tất cả files trong module import từ đây.
// ============================================================

import type { TransactionType } from "@/features/categories/types/category.types";

// Re-export để module tự đủ
export type { TransactionType };

// ---------------------------------------------------------------
// Category Snapshot (embedded trong Transaction response)
// BE include category info trực tiếp trong transaction row
// ---------------------------------------------------------------

export interface CategorySnapshot {
  id: string;
  name: string;
  icon: string;   // Lucide icon key, e.g. "utensils"
  color: string;  // Hex, e.g. "#4ECDC4"
  type: TransactionType;
}

// ---------------------------------------------------------------
// Core Transaction Entity
// Đồng bộ với BE Expense & Income model
// ---------------------------------------------------------------

export interface Transaction {
  id: string;
  /** "INCOME" | "EXPENSE" — xác định endpoint và display */
  type: TransactionType;
  title: string;
  amount: number;     // Decimal từ BE, parse thành number ở FE
  date: string;       // ISO 8601 string
  note?: string | null;
  imageUrl?: string | null;
  categoryId: string;
  category: CategorySnapshot;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// ---------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTransactionResponse {
  status: string;
  data: Transaction[];
  pagination: PaginationMeta;
}

export interface ApiTransactionResponse {
  status: string;
  data: Transaction;
}

// ---------------------------------------------------------------
// Request / DTO Types
// ---------------------------------------------------------------

export interface CreateTransactionDto {
  categoryId: string;
  amount: number;
  title: string;
  note?: string;
  date: string;       // ISO 8601
  imageUrl?: string;
}

export interface UpdateTransactionDto {
  categoryId?: string;
  amount?: number;
  title?: string;
  note?: string;
  date?: string;
  imageUrl?: string;
}

// ---------------------------------------------------------------
// Filter / Query Types
// ---------------------------------------------------------------

export type TransactionTabFilter = "ALL" | "INCOME" | "EXPENSE";

export interface TransactionFilters {
  month?: number;       // 1-12
  year?: number;        // YYYY
  categoryId?: string;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------
// UI State Types (Zustand)
// ---------------------------------------------------------------

export interface TransactionUIState {
  // Tab / type filter
  activeTab: TransactionTabFilter;

  // Date filter
  selectedMonth: number;  // 1-12
  selectedYear: number;   // YYYY

  // Category filter
  selectedCategoryId: string | null;

  // Create sheet
  isCreateSheetOpen: boolean;
  creatingType: TransactionType;   // Type mặc định khi mở create sheet

  // Edit sheet
  isEditSheetOpen: boolean;
  editingTransaction: Transaction | null;

  // Delete dialog
  isDeleteDialogOpen: boolean;
  deletingTransaction: Transaction | null;
}

export interface TransactionUIActions {
  // Tabs
  setActiveTab: (tab: TransactionTabFilter) => void;

  // Date
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;

  // Category filter
  setSelectedCategoryId: (id: string | null) => void;

  // Create sheet
  openCreateSheet: (type?: TransactionType) => void;
  closeCreateSheet: () => void;

  // Edit sheet
  openEditSheet: (transaction: Transaction) => void;
  closeEditSheet: () => void;

  // Delete dialog
  openDeleteDialog: (transaction: Transaction) => void;
  closeDeleteDialog: () => void;

  // Reset
  resetFilters: () => void;
}

// ---------------------------------------------------------------
// Summary (tính client-side từ fetched data)
// ---------------------------------------------------------------

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
