// ============================================================
// USE BUDGETS HOOK (TanStack Query)
// Phase 5 — Budget Module
//
// Lấy danh sách ngân sách. Sử dụng cache tự động của React Query.
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { budgetService } from "@/features/budgets/services/budget.service";

export const budgetKeys = {
  all: ["budgets"] as const,
  lists: () => [...budgetKeys.all, "list"] as const,
  list: (month: number, year: number) =>
    [...budgetKeys.lists(), { month, year }] as const,
};

interface UseBudgetsProps {
  month: number;
  year: number;
}

export function useBudgets({ month, year }: UseBudgetsProps) {
  const query = useQuery({
    queryKey: budgetKeys.list(month, year),
    queryFn: () => budgetService.getList(month, year),
    staleTime: 60 * 1000, // 1 phút cache (không tự động gọi lại ngay)
  });

  return {
    budgets: query.data?.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
