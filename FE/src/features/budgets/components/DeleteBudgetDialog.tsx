// ============================================================
// DeleteBudgetDialog Component
// Phase 5 — Budget Module
// Confirmation dialog for deleting budgets
// ============================================================

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBudgetStore } from "@/features/budgets/stores/budget.store";
import { useDeleteBudget } from "@/features/budgets/hooks/useBudgets";
import { Loader2 } from "lucide-react";

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function DeleteBudgetDialog() {
  const { isDeleteDialogOpen, deletingBudget, closeDeleteDialog } =
    useBudgetStore();
  const { mutate: deleteBudget, isPending } = useDeleteBudget();

  const handleConfirm = () => {
    if (deletingBudget) {
      deleteBudget(deletingBudget.id, {
        onSuccess: () => closeDeleteDialog(),
      });
    }
  };

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
      <DialogContent className="bg-[#FFFEFC] border-[#E8E7E5]">
        <DialogHeader>
          <DialogTitle className="text-[#37352F]">
            Xóa ngân sách
          </DialogTitle>
          <DialogDescription className="text-[#9B9A97]">
            Bạn có chắc chắn muốn xóa ngân sách cho{" "}
            <span className="font-semibold text-[#37352F]">
              {deletingBudget?.category?.name}
            </span>
            ? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={closeDeleteDialog}
            className="border-[#E8E7E5] text-[#37352F]"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
