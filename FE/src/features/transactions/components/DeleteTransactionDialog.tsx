// ============================================================
// DeleteTransactionDialog — Confirm Delete
// Phase 3 — Expense & Income Module
// ============================================================

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/features/transactions/stores/transaction.store";
import { useDeleteTransaction } from "@/features/transactions/hooks/useDeleteTransaction";
import { formatVND } from "@/features/transactions/components/AmountDisplay";

export function DeleteTransactionDialog() {
  const { isDeleteDialogOpen, deletingTransaction, closeDeleteDialog } =
    useTransactionStore();
  const { mutate: deleteTransaction, isPending } = useDeleteTransaction();

  if (!deletingTransaction) return null;

  const handleConfirm = () => {
    deleteTransaction({
      type: deletingTransaction.type,
      id: deletingTransaction.id,
    });
  };

  return (
    <Dialog
      open={isDeleteDialogOpen}
      onOpenChange={(open) => { if (!open && !isPending) closeDeleteDialog(); }}
    >
      <DialogContent className="max-w-sm bg-card border border-border shadow-[0_16px_48px_rgba(0,0,0,0.20)] rounded-lg p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-base font-semibold text-foreground leading-6">
            Xóa giao dịch?
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground leading-5">
            Bạn có chắc muốn xóa{" "}
            <span className="font-medium">"{deletingTransaction.title}"</span>{" "}
            ({formatVND(deletingTransaction.amount)})? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 justify-end mt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isPending}
            onClick={closeDeleteDialog}
            className="bg-muted text-foreground border border-border hover:bg-secondary text-sm font-medium transition-colors duration-150"
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={handleConfirm}
            className="bg-card border border-red-300 text-red-500 hover:bg-destructive/10 hover:text-destructive hover:border-red-400 text-sm font-medium transition-colors duration-150 disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-red-300 border-t-red-500 animate-spin" />
                Đang xóa...
              </span>
            ) : "Xóa giao dịch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
