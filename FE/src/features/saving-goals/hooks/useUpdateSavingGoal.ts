import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savingGoalService } from "@/features/saving-goals/services/saving-goal.service";
import { savingGoalKeys } from "./useSavingGoals";
import type { UpdateSavingGoalPayload } from "@/features/saving-goals/types/saving-goal.types";
import { toast } from "sonner";

export function useUpdateSavingGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSavingGoalPayload }) => savingGoalService.update(id, payload),
    onSuccess: () => {
      toast.success("Cập nhật mục tiêu thành công!");
      queryClient.invalidateQueries({ queryKey: savingGoalKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Lỗi khi cập nhật mục tiêu. Vui lòng thử lại.");
    },
  });
}
