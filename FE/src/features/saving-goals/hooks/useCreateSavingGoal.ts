import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savingGoalService } from "@/features/saving-goals/services/saving-goal.service";
import { savingGoalKeys } from "./useSavingGoals";
import type { CreateSavingGoalPayload } from "@/features/saving-goals/types/saving-goal.types";
import { toast } from "sonner";

export function useCreateSavingGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSavingGoalPayload) => savingGoalService.create(payload),
    onMutate: async () => {
      // Opt-in UI optimistic updates if needed
    },
    onSuccess: () => {
      toast.success("Tạo mục tiêu thành công!");
      queryClient.invalidateQueries({ queryKey: savingGoalKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Lỗi khi tạo mục tiêu. Vui lòng thử lại.");
    },
  });
}
