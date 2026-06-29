// ============================================================
// useCreateCategory — TanStack Query Mutation Hook
// Phase 2 — Category Module
// ============================================================

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryService } from "@/features/categories/services/category.service";
import { categoryKeys } from "@/features/categories/hooks/useCategories";
import { useCategoryStore } from "@/features/categories/stores/category.store";
import type { CreateCategoryDto } from "@/features/categories/types/category.types";
import type { AxiosError } from "axios";

// ---------------------------------------------------------------
// Error response shape từ BE
// ---------------------------------------------------------------

interface ApiError {
  status: string;
  message: string;
  statusCode?: number;
}

// ---------------------------------------------------------------
// useCreateCategory Hook
// ---------------------------------------------------------------

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const closeCreateSheet = useCategoryStore((s) => s.closeCreateSheet);

  return useMutation({
    mutationFn: (dto: CreateCategoryDto) => categoryService.createCategory(dto),

    // ─── On Success ──────────────────────────────────────────
    onSuccess: (newCategory) => {
      // 1. Invalidate toàn bộ category lists để refetch fresh data
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      });

      // 2. Đóng sheet
      closeCreateSheet();

      // 3. Toast thành công
      toast.success(`Đã tạo danh mục "${newCategory.name}"`, {
        description: "Danh mục mới sẵn sàng sử dụng.",
      });
    },

    // ─── On Error ────────────────────────────────────────────
    onError: (error: AxiosError<ApiError>) => {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 409) {
        // Trùng tên category
        toast.error("Tên danh mục đã tồn tại", {
          description: `Danh mục "${message ?? "này"}" đã có trong danh sách. Vui lòng chọn tên khác.`,
        });
        return;
      }

      if (status === 400) {
        toast.error("Dữ liệu không hợp lệ", {
          description: message ?? "Vui lòng kiểm tra lại thông tin.",
        });
        return;
      }

      // Lỗi chung
      toast.error("Có lỗi xảy ra", {
        description: "Không thể tạo danh mục. Vui lòng thử lại.",
      });
    },
  });
}
