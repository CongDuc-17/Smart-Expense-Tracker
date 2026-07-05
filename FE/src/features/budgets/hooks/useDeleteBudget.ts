// ============================================================
// USE DELETE BUDGET HOOK (TanStack Query)
// Phase 5 — Budget Module
// ============================================================

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { budgetService } from "@/features/budgets/services/budget.service";
import { budgetKeys } from "@/features/budgets/hooks/useBudgets";
import { useBudgetStore } from "@/features/budgets/stores/budget.store";

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const closeDeleteDialog = useBudgetStore((s) => s.closeDeleteDialog);
  const deletingBudget = useBudgetStore((s) => s.deletingBudget);

  return useMutation({
    mutationFn: (id: string) => budgetService.delete(id),

    onSuccess: () => {
      if (deletingBudget) {
        queryClient.invalidateQueries({
          queryKey: budgetKeys.list(deletingBudget.month, deletingBudget.year),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      }

      closeDeleteDialog();
      toast.success("Đã xóa ngân sách!");
    },

    onError: () => {
      toast.error("Không thể xóa ngân sách. Vui lòng thử lại sau.");
    },
  });
}
