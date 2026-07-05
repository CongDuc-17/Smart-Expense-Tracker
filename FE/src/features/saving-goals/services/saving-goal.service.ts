// ============================================================
// SAVING GOAL SERVICE
// Phase 6 — Saving Goals Module
// ============================================================

import { apiClient } from "@/lib/apiClient";
import type {
  SavingGoal,
  SavingGoalFilters,
  CreateSavingGoalPayload,
  UpdateSavingGoalPayload,
  DepositSavingGoalPayload,
  SavingDeposit
} from "@/features/saving-goals/types/saving-goal.types";

export const savingGoalService = {
  /**
   * Lấy danh sách saving goals
   */
  getList: async (filters: SavingGoalFilters = {}): Promise<{ data: SavingGoal[] }> => {
    const params = new URLSearchParams();
    if (filters.isCompleted !== undefined) {
      params.append("isCompleted", String(filters.isCompleted));
    }
    const response = await apiClient.get<{ data: SavingGoal[] }>(`/saving-goals?${params.toString()}`);
    return response;
  },

  /**
   * Lấy chi tiết saving goal
   */
  getById: async (id: string): Promise<{ data: SavingGoal }> => {
    const response = await apiClient.get<{ data: SavingGoal }>(`/saving-goals/${id}`);
    return response;
  },

  /**
   * Tạo saving goal
   */
  create: async (payload: CreateSavingGoalPayload): Promise<{ data: SavingGoal }> => {
    const response = await apiClient.post<{ data: SavingGoal }>("/saving-goals", payload);
    return response;
  },

  /**
   * Cập nhật saving goal
   */
  update: async (id: string, payload: UpdateSavingGoalPayload): Promise<{ data: SavingGoal }> => {
    const response = await apiClient.patch<{ data: SavingGoal }>(`/saving-goals/${id}`, payload);
    return response;
  },

  /**
   * Xóa saving goal
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/saving-goals/${id}`);
  },

  /**
   * Nạp tiền vào saving goal
   */
  deposit: async (id: string, payload: DepositSavingGoalPayload): Promise<{ data: { savingGoal: SavingGoal, deposit: SavingDeposit } }> => {
    const response = await apiClient.patch<{ data: { savingGoal: SavingGoal, deposit: SavingDeposit } }>(`/saving-goals/${id}/deposit`, payload);
    return response;
  }
};
