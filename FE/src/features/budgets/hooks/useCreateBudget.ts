// ============================================================
// USE CREATE BUDGET HOOK (TanStack Query)
// Phase 5 — Budget Module
// ============================================================

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { budgetService } from "@/features/budgets/services/budget.service";
import { budgetKeys } from "@/features/budgets/hooks/useBudgets";
import { useBudgetStore } from "@/features/budgets/stores/budget.store";
import type { CreateBudgetDto } from "@/features/budgets/types/budget.types";

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const closeCreateSheet = useBudgetStore((s) => s.closeCreateSheet);

  return useMutation({
    mutationFn: (dto: CreateBudgetDto) => budgetService.create(dto),

    onSuccess: (_, variables) => {
      // Invalidate list budgets của tháng/năm đó để refetch
      queryClient.invalidateQueries({
        queryKey: budgetKeys.list(variables.month, variables.year),
      });

      closeCreateSheet();
      toast.success("Tạo ngân sách thành công!");
    },

    onError: (error: any) => {
      // Bắt lỗi trùng lặp từ server (409 Conflict)
      if (error.response?.status === 409) {
        toast.error("Danh mục này đã có ngân sách trong tháng này.");
      } else {
        toast.error("Không thể tạo ngân sách. Vui lòng thử lại sau.");
      }
    },
  });
}
