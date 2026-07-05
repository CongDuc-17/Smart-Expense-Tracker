// ============================================================
// DELETE BUDGET DIALOG
// Phase 5 — Budget Module
//
// Xác nhận trước khi xóa ngân sách
// ============================================================

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useBudgetStore } from "@/features/budgets/stores/budget.store";
import { useDeleteBudget } from "@/features/budgets/hooks/useDeleteBudget";

export function DeleteBudgetDialog() {
  const deletingBudget = useBudgetStore((s) => s.deletingBudget);
  const closeDeleteDialog = useBudgetStore((s) => s.closeDeleteDialog);
  const { mutate: deleteBudget, isPending } = useDeleteBudget();

  const isOpen = !!deletingBudget;

  const handleDelete = () => {
    if (deletingBudget) {
      deleteBudget(deletingBudget.id);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isPending) closeDeleteDialog();
    }}>
      <AlertDialogContent className="bg-white border-[#E8E7E5] rounded-xl max-w-md p-6">
        <AlertDialogHeader className="space-y-3 text-left">
          <AlertDialogTitle className="text-xl font-semibold text-[#37352F]">
            Xóa ngân sách
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-[#9B9A97]">
            Bạn có chắc chắn muốn xóa ngân sách cho danh mục{" "}
            <strong className="text-[#37352F] font-medium">
              {deletingBudget?.category.name}
            </strong>
            ? Hành động này không thể hoàn tác. Các giao dịch chi tiêu vẫn được giữ lại.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex gap-3 sm:justify-end">
          <AlertDialogCancel
            disabled={isPending}
            className="mt-0 bg-transparent text-[#37352F] hover:bg-[#F7F6F3] border-none font-medium h-10 px-4 transition-colors"
          >
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-medium h-10 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Đang xóa...
              </span>
            ) : (
              "Xóa ngân sách"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
