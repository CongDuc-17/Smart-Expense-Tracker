// ============================================================
// BUDGET SERVICE
// Phase 5 — Budget Module
//
// Kết nối trực tiếp tới REST API của Backend.
// Mọi xử lý parse dữ liệu (string -> number cho decimal) nằm ở đây.
// ============================================================

import { apiClient } from "@/lib/apiClient";
import type {
  ApiBudgetListResponse,
  ApiBudgetResponse,
  CreateBudgetDto,
  UpdateBudgetDto,
  Budget,
} from "@/features/budgets/types/budget.types";

const BASE_PATH = "/budgets";

/**
 * Hàm hỗ trợ parse các trường số từ dạng chuỗi (Backend Decimal) sang Number (Frontend)
 */
const parseBudgetNumbers = (budget: any): Budget => ({
  ...budget,
  limitAmount: Number(budget.limitAmount),
  spentAmount: Number(budget.spentAmount),
  remainingAmount: Number(budget.remainingAmount),
  percentage: Number(budget.percentage),
});

export const budgetService = {
  /**
   * Lấy danh sách ngân sách theo tháng/năm
   */
  async getList(month: number, year: number): Promise<ApiBudgetListResponse> {
    const response = await apiClient.get<ApiBudgetListResponse>(BASE_PATH, {
      params: { month, year },
      withCredentials: true,
    });
    
    return {
      ...response,
      data: response.data.map(parseBudgetNumbers),
    };
  },

  /**
   * Tạo ngân sách mới
   */
  async create(dto: CreateBudgetDto): Promise<ApiBudgetResponse> {
    const response = await apiClient.post<ApiBudgetResponse>(
      BASE_PATH,
      dto,
      { withCredentials: true }
    );
    
    return {
      ...response,
      data: parseBudgetNumbers(response.data),
    };
  },

  /**
   * Cập nhật hạn mức ngân sách
   */
  async update(id: string, dto: UpdateBudgetDto): Promise<ApiBudgetResponse> {
    const response = await apiClient.patch<ApiBudgetResponse>(
      `${BASE_PATH}/${id}`,
      dto,
      { withCredentials: true }
    );
    
    return {
      ...response,
      data: parseBudgetNumbers(response.data),
    };
  },

  /**
   * Xóa ngân sách
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(`${BASE_PATH}/${id}`, {
      withCredentials: true,
    });
  },
};
