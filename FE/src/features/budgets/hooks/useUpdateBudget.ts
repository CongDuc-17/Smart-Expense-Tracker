// ============================================================
// USE UPDATE BUDGET HOOK (TanStack Query)
// Phase 5 — Budget Module
// ============================================================

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { budgetService } from "@/features/budgets/services/budget.service";
import { budgetKeys } from "@/features/budgets/hooks/useBudgets";
import { useBudgetStore } from "@/features/budgets/stores/budget.store";
import type { UpdateBudgetDto } from "@/features/budgets/types/budget.types";

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  const closeEditSheet = useBudgetStore((s) => s.closeEditSheet);
  const editingBudget = useBudgetStore((s) => s.editingBudget);

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBudgetDto }) =>
      budgetService.update(id, dto),

    onSuccess: () => {
      // Vì chúng ta cần refetch list chứa budget này
      // Sử dụng selectedMonth/Year từ editingBudget để biết cần invalidate query nào
      if (editingBudget) {
        queryClient.invalidateQueries({
          queryKey: budgetKeys.list(editingBudget.month, editingBudget.year),
        });
      } else {
        // Fallback: invalidate tất cả budget
        queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      }

      closeEditSheet();
      toast.success("Cập nhật ngân sách thành công!");
    },

    onError: () => {
      toast.error("Không thể cập nhật ngân sách. Vui lòng thử lại sau.");
    },
  });
}
