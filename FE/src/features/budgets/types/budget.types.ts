// ============================================================
// BUDGET TYPES
// Phase 5 — Budget Module
//
// Định nghĩa các giao thức dữ liệu (Data Contract) với Backend API
// ============================================================

import type { Category } from "@/features/categories/types/category.types";

export type BudgetAlertStatus = "NORMAL" | "WARNING" | "EXCEEDED";

export interface Budget {
  id: string;
  category: Pick<Category, "id" | "name" | "icon" | "color">;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  alertStatus: BudgetAlertStatus;
  month: number;
  year: number;
}

// ---------------------------------------------------------------
// API DTOs (Data Transfer Objects)
// ---------------------------------------------------------------

export interface CreateBudgetDto {
  categoryId: string;
  limitAmount: number;
  month: number;
  year: number;
}

export interface UpdateBudgetDto {
  limitAmount: number;
}

// ---------------------------------------------------------------
// API Responses
// ---------------------------------------------------------------

export interface ApiBudgetListResponse {
  status: string;
  data: Budget[];
}

export interface ApiBudgetResponse {
  status: string;
  data: Budget;
}
