import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import type { UserResponse } from "@/features/users/types/user.types";

export interface AdminUsersQuery {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  role?: string;
}

export interface AdminUserResponse extends UserResponse {
  _count: {
    expenses: number;
    incomes: number;
    budgets: number;
  };
}

export interface SystemStatsResponse {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  newUsersToday: number;
  totalExpenses: number;
  totalIncomes: number;
  totalTransactions: number;
  totalExpenseAmount: string;
}

export const adminService = {
  getUsers: async (params: AdminUsersQuery) => {
    return await apiClient.get<{ data: AdminUserResponse[]; pagination: any }>("/admin/users", { params });
  },
  getUserById: async (id: string) => {
    return await apiClient.get<{ data: AdminUserResponse }>(`/admin/users/${id}`);
  },
  updateUserStatus: async (id: string, status: string) => {
    return await apiClient.patch<{ data: { id: string; status: string } }>(`/admin/users/${id}/status`, { status });
  },
  getSystemStats: async () => {
    return await apiClient.get<{ data: SystemStatsResponse }>("/admin/stats");
  },
};

export function useAdminUsers(params: AdminUsersQuery) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminService.getUsers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminUserDetail(id: string) {
  return useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => adminService.getUserById(id),
    enabled: !!id,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminService.getSystemStats(),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminService.updateUserStatus(id, status),
    onSuccess: (_res, variables) => {
      toast.success(variables.status === "LOCKED" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Cập nhật trạng thái thất bại");
    },
  });
}
