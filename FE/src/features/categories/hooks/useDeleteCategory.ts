// ============================================================
// useDeleteCategory — TanStack Query Mutation Hook
// Phase 2 — Category Module
//
// Phức tạp nhất trong 4 mutation hooks:
// - Optimistic update: xóa item khỏi UI ngay lập tức
// - Rollback: khôi phục nếu API lỗi
// - 409 handling: mở ConflictErrorDialog thay vì toast
// ============================================================

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryService } from "@/features/categories/services/category.service";
import { categoryKeys } from "@/features/categories/hooks/useCategories";
import { useCategoryStore } from "@/features/categories/stores/category.store";
import type { Category } from "@/features/categories/types/category.types";
import type { AxiosError } from "axios";

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------

interface ApiError {
  status: string;
  message: string;
  statusCode?: number;
}

// Context trả về từ onMutate để dùng trong onError rollback
interface MutationContext {
  previousData: Map<string, Category[] | undefined>;
}

// ---------------------------------------------------------------
// useDeleteCategory Hook
// ---------------------------------------------------------------

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { closeDeleteDialog, openConflictDialog } = useCategoryStore();

  return useMutation({
    mutationFn: (categoryId: string) =>
      categoryService.deleteCategory(categoryId),

    // ─── Optimistic Update ────────────────────────────────────
    // Xóa item khỏi TẤT CẢ cached list queries ngay lập tức
    // trước khi API trả về kết quả.
    onMutate: async (categoryId: string): Promise<MutationContext> => {
      // Cancel bất kỳ refetch nào đang chạy để tránh race condition
      await queryClient.cancelQueries({
        queryKey: categoryKeys.lists(),
      });

      // Snapshot tất cả list queries đang có trong cache
      const queryCache = queryClient.getQueriesData<Category[]>({
        queryKey: categoryKeys.lists(),
      });

      const previousData = new Map<string, Category[] | undefined>();

      // Optimistically xóa khỏi tất cả cached lists
      queryCache.forEach(([queryKey, data]) => {
        const key = JSON.stringify(queryKey);
        previousData.set(key, data);

        if (data) {
          queryClient.setQueryData<Category[]>(
            queryKey,
            data.filter((cat) => cat.id !== categoryId)
          );
        }
      });

      // Đóng delete dialog ngay
      closeDeleteDialog();

      return { previousData };
    },

    // ─── On Error: Rollback ───────────────────────────────────
    onError: (
      error: AxiosError<ApiError>,
      _categoryId: string,
      context?: MutationContext
    ) => {
      const status = error.response?.status;

      // Rollback optimistic update
      if (context?.previousData) {
        context.previousData.forEach((data, keyStr) => {
          const queryKey = JSON.parse(keyStr);
          queryClient.setQueryData(queryKey, data);
        });
      }

      // 409: Category đang có giao dịch liên kết
      if (status === 409) {
        openConflictDialog();
        return;
      }

      // 403: Default category hoặc không phải owner
      if (status === 403) {
        toast.error("Không thể xóa danh mục này", {
          description: "Bạn không có quyền xóa danh mục hệ thống.",
        });
        return;
      }

      // 404: Đã bị xóa rồi (ít xảy ra với optimistic UI)
      if (status === 404) {
        toast.error("Danh mục không tồn tại", {
          description: "Danh mục này đã bị xóa trước đó.",
        });
        return;
      }

      // Lỗi chung
      toast.error("Có lỗi xảy ra", {
        description: "Không thể xóa danh mục. Vui lòng thử lại.",
      });
    },

    // ─── On Success ──────────────────────────────────────────
    onSuccess: () => {
      toast.success("Đã xóa danh mục", {
        description: "Danh mục đã được xóa thành công.",
      });
    },

    // ─── On Settled: Always refetch ───────────────────────────
    // Đảm bảo data luôn sync với server, dù success hay error.
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      });
    },
  });
}
