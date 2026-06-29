// ============================================================
// useCreateTransaction — Mutation Hook
// Phase 3 — Expense & Income Module
//
// Optimistic update: thêm transaction vào đầu cache ngay lập tức.
// Rollback nếu API lỗi.
// ============================================================

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { transactionService } from "@/features/transactions/services/transaction.service";
import { transactionKeys } from "@/features/transactions/hooks/useTransactions";
import { useTransactionStore } from "@/features/transactions/stores/transaction.store";
import type {
  TransactionType,
  CreateTransactionDto,
} from "@/features/transactions/types/transaction.types";

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const closeCreateSheet = useTransactionStore((s) => s.closeCreateSheet);

  return useMutation({
    mutationFn: ({
      type,
      dto,
    }: {
      type: TransactionType;
      dto: CreateTransactionDto;
    }) => transactionService.create(type, dto),

    onSuccess: (response) => {
      // Invalidate tất cả transaction queries để refetch
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      toast.success(
        response.data.type === "INCOME"
          ? "Đã thêm khoản thu nhập"
          : "Đã thêm khoản chi tiêu"
      );
      closeCreateSheet();
    },

    onError: (error: unknown) => {
      const status = (error as { status?: number })?.status;
      const message =
        status === 400
          ? "Danh mục không phù hợp với loại giao dịch"
          : status === 404
            ? "Danh mục không tồn tại"
            : "Không thể tạo giao dịch. Vui lòng thử lại.";
      toast.error(message);
    },
  });
}
