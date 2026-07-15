import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "../stores/auth.store";
import { toast } from "sonner";
import type { LoginFormData, RegisterFormData } from "../schemas/auth.schema";
import type { UserResponse } from "@/features/users/types/user.types";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Note: Backend sets HttpOnly cookie for both access and refresh tokens.
export const authService = {
  login: async (data: LoginFormData) => {
    return await apiClient.post("/auth/login", data);
  },
  register: async (data: RegisterFormData) => {
    return await apiClient.post("/auth/register", data);
  },
  logout: async () => {
    return await apiClient.post("/auth/logout");
  },
  getMe: async (): Promise<UserResponse> => {
    return await apiClient.get<UserResponse>("/users/me");
  }
};

export function useAuth() {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async () => {
      try {
        const userData = await authService.getMe();
        if (userData.data) {
          setAuth(userData.data);
          toast.success("Đăng nhập thành công");
          
          if (userData.data.role === "ADMIN") {
            navigate("/admin/stats");
          } else {
            navigate("/dashboard");
          }
        }
      } catch (error) {
        toast.error("Lỗi khi tải thông tin người dùng");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Tài khoản hoặc mật khẩu không đúng");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      queryClient.clear();
      clearAuth();
      navigate("/login");
      toast.info("Đã đăng xuất");
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

export function useInitializeAuth() {
  const { setAuth, clearAuth, setInitializing } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const response = await authService.getMe();
        if (mounted && response.data) {
          setAuth(response.data);
        }
      } catch (error) {
        if (mounted) {
          clearAuth();
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [setAuth, clearAuth, setInitializing]);
}
