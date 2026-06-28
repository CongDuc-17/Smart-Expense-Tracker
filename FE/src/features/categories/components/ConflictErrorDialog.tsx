// ============================================================
// ConflictErrorDialog — 409 Conflict Error Dialog
// Phase 2 — Category Module
//
// Hiển thị khi DELETE trả về 409 (category đang có giao dịch).
// Giải thích lý do rõ ràng và hướng dẫn user làm gì tiếp theo.
// ============================================================

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCategoryStore } from "@/features/categories/stores/category.store";

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function ConflictErrorDialog() {
  const { isConflictDialogOpen, deletingCategory, closeConflictDialog } =
    useCategoryStore();

  return (
    <Dialog open={isConflictDialogOpen} onOpenChange={closeConflictDialog}>
      <DialogContent
        className="
          max-w-sm bg-white border border-[#E8E7E5]
          shadow-[0_16px_48px_rgba(0,0,0,0.20)]
          rounded-lg p-6
        "
      >
        <DialogHeader className="space-y-3">
          {/* Warning icon */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <DialogTitle className="text-base font-semibold text-[#37352F] leading-6">
              Không thể xóa danh mục này
            </DialogTitle>
          </div>

          <DialogDescription asChild>
            <div className="space-y-3 text-sm text-[#37352F] leading-5">
              {deletingCategory && (
                <p>
                  Danh mục{" "}
                  <span className="font-medium">"{deletingCategory.name}"</span>{" "}
                  đang được sử dụng bởi các giao dịch của bạn.
                </p>
              )}

              <p className="text-[#9B9A97]">
                Để xóa danh mục này, hãy chuyển tất cả giao dịch liên quan sang
                danh mục khác trước.
              </p>

              {/* Phase 3 note — sẽ có link đến transactions */}
              <div className="p-3 rounded-md bg-[#F7F6F3] border border-[#E8E7E5]">
                <p className="text-xs text-[#9B9A97] leading-4">
                  💡 Tính năng chuyển giao dịch hàng loạt sẽ có trong phiên bản
                  tiếp theo.
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-5">
          <Button
            type="button"
            size="sm"
            onClick={closeConflictDialog}
            className="
              w-full bg-[#37352F] text-[#FFFEFC]
              hover:bg-[#2D2B27] active:bg-[#1F1D1A]
              text-sm font-medium transition-colors duration-150
            "
          >
            Đã hiểu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
