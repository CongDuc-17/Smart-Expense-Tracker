// ============================================================
// DeleteCategoryDialog — Confirm Delete Dialog
// Phase 2 — Category Module
//
// Controlled bởi Zustand store (isDeleteDialogOpen, deletingCategory).
// Gọi useDeleteCategory mutation khi confirm.
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
import { useCategoryStore } from "@/features/categories/stores/category.store";
import { useDeleteCategory } from "@/features/categories/hooks/useDeleteCategory";

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function DeleteCategoryDialog() {
  const { isDeleteDialogOpen, deletingCategory, closeDeleteDialog } =
    useCategoryStore();

  const { mutate: deleteCategory, isPending } = useDeleteCategory();

  // Guard: nếu không có category đang được xóa
  if (!deletingCategory) return null;

  const handleConfirm = () => {
    deleteCategory(deletingCategory.id);
    // closeDeleteDialog sẽ được gọi trong onMutate của hook (optimistic)
  };

  return (
    <Dialog
      open={isDeleteDialogOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) closeDeleteDialog();
      }}
    >
      <DialogContent
        className="
          max-w-sm bg-card border border-border
          shadow-[0_16px_48px_rgba(0,0,0,0.20)]
          rounded-lg p-6
        "
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-base font-semibold text-foreground leading-6">
            Xóa danh mục?
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground leading-5">
            Bạn có chắc muốn xóa danh mục{" "}
            <span className="font-medium">"{deletingCategory.name}"</span>?{" "}
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 justify-end mt-4">
          {/* Cancel button */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isPending}
            onClick={closeDeleteDialog}
            className="
              bg-muted text-foreground border border-border
              hover:bg-secondary hover:border-border
              text-sm font-medium transition-colors duration-150
            "
          >
            Hủy
          </Button>

          {/* Delete button — destructive nhưng không full red */}
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={handleConfirm}
            className="
              bg-card border border-red-300 text-red-500
              hover:bg-destructive/10 hover:text-destructive hover:border-red-400
              active:bg-red-100
              text-sm font-medium transition-colors duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isPending ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-red-300 border-t-red-500 animate-spin" />
                Đang xóa...
              </span>
            ) : (
              "Xóa danh mục"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
