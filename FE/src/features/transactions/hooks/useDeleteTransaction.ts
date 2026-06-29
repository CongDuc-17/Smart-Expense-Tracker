// ============================================================
// useDeleteTransaction — Mutation Hook
// Phase 3 — Expense & Income Module
//
// Soft delete — BE set deletedAt, record vẫn còn trong DB.
// Optimistic update: xóa khỏi cache ngay, rollback nếu lỗi.
// ============================================================

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { transactionService } from "@/features/transactions/services/transaction.service";
import { transactionKeys } from "@/features/transactions/hooks/useTransactions";
import { useTransactionStore } from "@/features/transactions/stores/transaction.store";
import type {
  TransactionType,
  PaginatedTransactionResponse,
} from "@/features/transactions/types/transaction.types";

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { closeDeleteDialog } = useTransactionStore();

  return useMutation({
    mutationFn: ({ type, id }: { type: TransactionType; id: string }) =>
      transactionService.delete(type, id),

    onMutate: async ({ id }) => {
      // Cancel in-flight queries để tránh race condition
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });

      // Snapshot tất cả cache liên quan để rollback
      const previousData = queryClient.getQueriesData({
        queryKey: transactionKeys.lists(),
      });

      // Optimistic: xóa transaction khỏi tất cả matching queries
      queryClient.setQueriesData(
        { queryKey: transactionKeys.lists() },
        (old: PaginatedTransactionResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((t) => t.id !== id),
            pagination: {
              ...old.pagination,
              total: Math.max(0, old.pagination.total - 1),
            },
          };
        }
      );

      closeDeleteDialog();
      return { previousData };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      toast.success("Đã xóa giao dịch");
    },

    onError: (_error, _vars, context) => {
      // Rollback về snapshot
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Không thể xóa giao dịch. Vui lòng thử lại.");
    },
  });
}
