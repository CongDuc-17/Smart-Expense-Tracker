import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savingGoalService } from "@/features/saving-goals/services/saving-goal.service";
import { savingGoalKeys } from "./useSavingGoals";
import type { DepositSavingGoalPayload } from "@/features/saving-goals/types/saving-goal.types";
import { toast } from "sonner";

export function useDepositSavingGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DepositSavingGoalPayload }) => savingGoalService.deposit(id, payload),
    onSuccess: (response) => {
      if (response.data.savingGoal.isCompleted) {
        toast.success("Chúc mừng! Bạn đã đạt được mục tiêu này!");
      } else {
        toast.success("Nạp tiền vào mục tiêu thành công!");
      }
      queryClient.invalidateQueries({ queryKey: savingGoalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savingGoalKeys.detail(response.data.savingGoal.id) });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Lỗi khi nạp tiền. Vui lòng thử lại.");
    },
  });
}
