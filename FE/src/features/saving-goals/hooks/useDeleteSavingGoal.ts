import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savingGoalService } from "@/features/saving-goals/services/saving-goal.service";
import { savingGoalKeys } from "./useSavingGoals";
import { toast } from "sonner";

export function useDeleteSavingGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => savingGoalService.delete(id),
    onSuccess: () => {
      toast.success("Xóa mục tiêu thành công!");
      queryClient.invalidateQueries({ queryKey: savingGoalKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Lỗi khi xóa mục tiêu. Vui lòng thử lại.");
    },
  });
}
