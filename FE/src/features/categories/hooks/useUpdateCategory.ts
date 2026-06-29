// ============================================================
// useUpdateCategory — TanStack Query Mutation Hook
// Phase 2 — Category Module
// ============================================================

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryService } from "@/features/categories/services/category.service";
import { categoryKeys } from "@/features/categories/hooks/useCategories";
import { useCategoryStore } from "@/features/categories/stores/category.store";
import type { UpdateCategoryDto } from "@/features/categories/types/category.types";
import type { AxiosError } from "axios";

// ---------------------------------------------------------------
// Error response shape
// ---------------------------------------------------------------

interface ApiError {
  status: string;
  message: string;
  statusCode?: number;
}

// ---------------------------------------------------------------
// Mutation variables type
// ---------------------------------------------------------------

interface UpdateCategoryVariables {
  id: string;
  dto: UpdateCategoryDto;
}

// ---------------------------------------------------------------
// useUpdateCategory Hook
// ---------------------------------------------------------------

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const closeEditSheet = useCategoryStore((s) => s.closeEditSheet);

  return useMutation({
    mutationFn: ({ id, dto }: UpdateCategoryVariables) =>
      categoryService.updateCategory(id, dto),

    // ─── On Success ──────────────────────────────────────────
    onSuccess: (updatedCategory) => {
      // 1. Invalidate lists để refetch
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      });

      // 2. Đóng sheet
      closeEditSheet();

      // 3. Toast thành công
      toast.success(`Đã cập nhật danh mục "${updatedCategory.name}"`, {
        description: "Thay đổi đã được lưu thành công.",
      });
    },

    // ─── On Error ────────────────────────────────────────────
    onError: (error: AxiosError<ApiError>) => {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 403) {
        toast.error("Không có quyền chỉnh sửa", {
          description: "Bạn không thể chỉnh sửa danh mục hệ thống.",
        });
        return;
      }

      if (status === 404) {
        toast.error("Không tìm thấy danh mục", {
          description: "Danh mục này có thể đã bị xóa. Trang sẽ được làm mới.",
        });
        // Invalidate để xóa item cũ khỏi cache
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
        return;
      }

      if (status === 409) {
        toast.error("Tên danh mục đã tồn tại", {
          description: message ?? "Vui lòng chọn tên khác.",
        });
        return;
      }

      toast.error("Có lỗi xảy ra", {
        description: "Không thể cập nhật danh mục. Vui lòng thử lại.",
      });
    },
  });
}
