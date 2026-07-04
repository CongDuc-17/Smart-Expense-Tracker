// ============================================================
// BUDGET TYPES
// Phase 5 — Budget Module
// Foundation: Types for budget management with alerts at 70%, 90%+
// ============================================================

import type { Category } from "@/features/categories/types/category.types";

// ---------------------------------------------------------------
// Budget Status enum
// ---------------------------------------------------------------

export const BudgetStatus = {
  HEALTHY: "healthy",
  WARNING: "warning",
  CRITICAL: "critical",
} as const;

export type BudgetStatusType = (typeof BudgetStatus)[keyof typeof BudgetStatus];

// ---------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------

/**
 * Budget object from API
 * Includes spent amount tracking and alert thresholds
 */
export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  limitAmount: number;
  spentAmount: number;
  month: number; // 1-12
  year: number;
  alertThreshold: number; // Default: 80
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Extended Budget with calculated status
 */
export interface BudgetWithStatus extends Budget {
  status: BudgetStatusType;
  percentage: number;
}

/**
 * Response wrapper from API
 */
export interface ApiBudgetListResponse {
  success: boolean;
  data: Budget[];
}

export interface ApiBudgetResponse {
  success: boolean;
  data: Budget;
}

// ---------------------------------------------------------------
// Request/DTO Types
// ---------------------------------------------------------------

/**
 * Body for POST /api/budgets
 */
export interface CreateBudgetDto {
  categoryId: string;
  limitAmount: number;
  month: number;
  year: number;
  alertThreshold?: number;
}

/**
 * Body for PATCH /api/budgets/:id
 */
export interface UpdateBudgetDto {
  limitAmount?: number;
  alertThreshold?: number;
  isActive?: boolean;
}

// ---------------------------------------------------------------
// Filter / Query Types
// ---------------------------------------------------------------

/**
 * Query params for GET /api/budgets
 */
export interface BudgetFilters {
  month?: number;
  year?: number;
  categoryId?: string;
  status?: BudgetStatusType;
}

/**
 * Tab filter for UI
 */
export type BudgetTabFilter = "ALL" | "HEALTHY" | "WARNING" | "CRITICAL" | "ACTIVE";

// ---------------------------------------------------------------
// UI State Types (for Zustand store)
// ---------------------------------------------------------------

export interface BudgetUIState {
  // Sheet states
  isCreateSheetOpen: boolean;
  isEditSheetOpen: boolean;
  editingBudget: Budget | null;

  // Dialog states
  isDeleteDialogOpen: boolean;
  deletingBudget: Budget | null;

  // Filter state
  activeTab: BudgetTabFilter;
  searchQuery: string;
  selectedMonth: number;
  selectedYear: number;

  // Sorting
  sortBy: "name" | "spent" | "limit" | "percentage";
  sortOrder: "asc" | "desc";
}
