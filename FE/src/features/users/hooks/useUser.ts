import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../services/users.service";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { toast } from "sonner";
import type { UpdateProfilePayload, ChangePasswordPayload } from "../types/user.types";

export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
};

export function useCurrentUser() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      const response = await usersService.getMe();
      if (response.data) {
        setAuth(response.data);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => usersService.updateMe(payload),
    onSuccess: (response) => {
      // Update local store immediately
      updateUser(response.data);
      // Invalidate to refetch if needed
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      toast.success("Hồ sơ đã được cập nhật thành công.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Cập nhật hồ sơ thất bại.");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => usersService.changePassword(payload),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại.");
    },
  });
}
