// ============================================================
// useUpdateTransaction — Mutation Hook
// Phase 3 — Expense & Income Module
// ============================================================

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { transactionService } from "@/features/transactions/services/transaction.service";
import { transactionKeys } from "@/features/transactions/hooks/useTransactions";
import { useTransactionStore } from "@/features/transactions/stores/transaction.store";
import type {
  TransactionType,
  UpdateTransactionDto,
} from "@/features/transactions/types/transaction.types";

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const closeEditSheet = useTransactionStore((s) => s.closeEditSheet);

  return useMutation({
    mutationFn: ({
      type,
      id,
      dto,
    }: {
      type: TransactionType;
      id: string;
      dto: UpdateTransactionDto;
    }) => transactionService.update(type, id, dto),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      toast.success("Đã cập nhật giao dịch");
      closeEditSheet();
    },

    onError: (error: unknown) => {
      const status = (error as { status?: number })?.status;
      const message =
        status === 400
          ? "Danh mục không phù hợp với loại giao dịch"
          : status === 404
            ? "Giao dịch không tồn tại"
            : "Không thể cập nhật. Vui lòng thử lại.";
      toast.error(message);
    },
  });
}
