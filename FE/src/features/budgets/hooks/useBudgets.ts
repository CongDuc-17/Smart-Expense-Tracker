// ============================================================
// BUDGET HOOKS
// Phase 5 — Budget Module
// React hooks for data fetching and mutations
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type {
  CreateBudgetDto,
  UpdateBudgetDto,
  BudgetFilters,
  ApiBudgetListResponse,
  ApiBudgetResponse,
} from "@/features/budgets/types/budget.types";

// ---------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------

export const budgetKeys = {
  all: ["budgets"] as const,
  lists: () => [...budgetKeys.all, "list"] as const,
  list: (filters?: BudgetFilters) =>
    [...budgetKeys.lists(), { filters }] as const,
  detail: (id: string) => [...budgetKeys.all, "detail", id] as const,
};

// ---------------------------------------------------------------
// Fetch Hooks
// ---------------------------------------------------------------

/**
 * Get all budgets (optionally filtered)
 */
export const useBudgets = (filters?: BudgetFilters) => {
  return useQuery({
    queryKey: budgetKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.month) params.append("month", filters.month.toString());
      if (filters?.year) params.append("year", filters.year.toString());
      if (filters?.categoryId)
        params.append("categoryId", filters.categoryId);
      if (filters?.status) params.append("status", filters.status);

      const response = await apiClient.get<ApiBudgetListResponse>(
        `/budgets?${params.toString()}`
      );
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

/**
 * Get single budget by ID
 */
export const useBudget = (id: string) => {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiBudgetResponse>(`/budgets/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// ---------------------------------------------------------------
// Mutation Hooks
// ---------------------------------------------------------------

/**
 * Create new budget
 */
export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBudgetDto) => {
      const response = await apiClient.post<ApiBudgetResponse>(
        "/budgets",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all budget queries
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
};

/**
 * Update existing budget
 */
export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBudgetDto }) => {
      const response = await apiClient.patch<ApiBudgetResponse>(
        `/budgets/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: budgetKeys.detail(data.id) });
      }
    },
  });
};

/**
 * Delete budget
 */
export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/budgets/${id}`);
    },
    onSuccess: () => {
      // Invalidate all budget queries
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
};
