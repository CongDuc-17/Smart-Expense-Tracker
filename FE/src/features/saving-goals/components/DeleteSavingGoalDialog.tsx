import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSavingGoalStore } from "@/features/saving-goals/stores/saving-goal.store";
import { useDeleteSavingGoal } from "@/features/saving-goals/hooks/useDeleteSavingGoal";

export function DeleteSavingGoalDialog() {
  const { isDeleteDialogOpen, deletingGoal, closeDeleteDialog } = useSavingGoalStore();
  const { mutate, isPending } = useDeleteSavingGoal();

  const handleDelete = () => {
    if (!deletingGoal) return;
    mutate(deletingGoal.id, {
      onSuccess: () => {
        closeDeleteDialog();
      },
    });
  };

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && closeDeleteDialog()}>
      <AlertDialogContent className="bg-white border-[#E8E7E5] rounded-xl max-w-md shadow-lg p-6">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-xl font-semibold text-[#37352F]">
            Xóa mục tiêu tiết kiệm
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-[#9B9A97] leading-relaxed">
            Bạn có chắc chắn muốn xóa mục tiêu{" "}
            <span className="font-semibold text-[#37352F]">"{deletingGoal?.title}"</span>? Hành động này không thể hoàn tác và sẽ xóa toàn bộ lịch sử nạp tiền của mục tiêu này.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              disabled={isPending}
              className="border-[#E8E7E5] text-[#37352F] hover:bg-[#F7F6F3] font-medium"
            >
              Hủy
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-[#FF6B6B] text-white hover:bg-[#FF5252] font-medium"
            >
              {isPending ? "Đang xóa..." : "Xóa mục tiêu"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
