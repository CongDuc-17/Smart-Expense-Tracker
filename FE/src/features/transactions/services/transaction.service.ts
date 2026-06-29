// ============================================================
// TRANSACTION SERVICE
// Phase 3 — Expense & Income Module
//
// Layer duy nhất gọi API. Không chứa state hay side effects.
// Dùng apiClient (axios instance với JWT interceptor từ Phase 2).
//
// Design: BE có 2 endpoints riêng /expenses và /incomes.
// Service abstraction này cho phép hooks gọi đúng endpoint
// dựa vào transaction type, không cần biết URL cụ thể.
// ============================================================

import { apiClient } from "@/lib/apiClient";
import type {
  TransactionType,
  TransactionFilters,
  CreateTransactionDto,
  UpdateTransactionDto,
  PaginatedTransactionResponse,
  ApiTransactionResponse,
} from "@/features/transactions/types/transaction.types";

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

/** Map transaction type → API base path */
function getPath(type: TransactionType): string {
  return type === "INCOME" ? "/incomes" : "/expenses";
}

/** Chuyển TransactionFilters thành URLSearchParams */
function buildParams(filters: TransactionFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.month !== undefined) params.month = String(filters.month);
  if (filters.year  !== undefined) params.year  = String(filters.year);
  if (filters.categoryId)          params.categoryId = filters.categoryId;
  if (filters.page  !== undefined) params.page  = String(filters.page);
  if (filters.limit !== undefined) params.limit = String(filters.limit);
  return params;
}

// ---------------------------------------------------------------
// Service Object
// ---------------------------------------------------------------

export const transactionService = {
  /**
   * Lấy danh sách giao dịch (có phân trang, filter)
   * @param type "INCOME" | "EXPENSE"
   */
  async getList(
    type: TransactionType,
    filters: TransactionFilters = {}
  ): Promise<PaginatedTransactionResponse> {
    const response = await apiClient.get<PaginatedTransactionResponse>(
      getPath(type),
      { params: buildParams(filters), withCredentials: true }
    );
    // Normalize: đảm bảo mỗi transaction có field 'type'
    return {
      ...response,
      data: response.data.map((t) => ({ ...t, type, amount: Number(t.amount) })),
    };
  },

  /**
   * Lấy chi tiết 1 giao dịch
   */
  async getById(type: TransactionType, id: string): Promise<ApiTransactionResponse> {
    const response = await apiClient.get<ApiTransactionResponse>(
      `${getPath(type)}/${id}`,
      { withCredentials: true }
    );
    return { ...response, data: { ...response.data, type, amount: Number(response.data.amount) } };
  },

  /**
   * Tạo giao dịch mới
   */
  async create(
    type: TransactionType,
    dto: CreateTransactionDto
  ): Promise<ApiTransactionResponse> {
    const response = await apiClient.post<ApiTransactionResponse>(
      getPath(type),
      dto,
      { withCredentials: true }
    );
    return { ...response, data: { ...response.data, type, amount: Number(response.data.amount) } };
  },

  /**
   * Cập nhật giao dịch (PATCH — partial update)
   */
  async update(
    type: TransactionType,
    id: string,
    dto: UpdateTransactionDto
  ): Promise<ApiTransactionResponse> {
    const response = await apiClient.patch<ApiTransactionResponse>(
      `${getPath(type)}/${id}`,
      dto,
      { withCredentials: true }
    );
    return { ...response, data: { ...response.data, type, amount: Number(response.data.amount) } };
  },

  /**
   * Xóa mềm giao dịch (BE set deletedAt, không xóa khỏi DB)
   */
  async delete(type: TransactionType, id: string): Promise<void> {
    await apiClient.delete<void>(
      `${getPath(type)}/${id}`,
      { withCredentials: true }
    );
  },
};
