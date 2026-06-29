// ============================================================
// useCategories — TanStack Query Data Hook
// Phase 2 — Category Module
//
// Quản lý toàn bộ server state cho danh sách categories:
// fetching, caching, background refetch, error handling.
//
// QUAN TRỌNG: Hook này sẽ được tái sử dụng ở Phase 3 (Expense form dropdown)
// và Phase 5 (Budget form dropdown). Thiết kế để reusable.
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/features/categories/services/category.service";
import type { CategoryFilters, TransactionType } from "@/features/categories/types/category.types";

// ---------------------------------------------------------------
// Query Keys Factory
// Chuẩn hóa query keys để invalidate chính xác, tránh over-fetch.
// ---------------------------------------------------------------

export const categoryKeys = {
  /** Base key — invalidate ALL category queries */
  all: ["categories"] as const,

  /** List key — các query trả về danh sách */
  lists: () => [...categoryKeys.all, "list"] as const,

  /** Filtered list key */
  list: (filters: CategoryFilters) =>
    [...categoryKeys.lists(), filters] as const,

  /** Single category detail (dùng cho Phase sau nếu cần) */
  detail: (id: string) => [...categoryKeys.all, "detail", id] as const,
} as const;

// ---------------------------------------------------------------
// useCategories Hook
// ---------------------------------------------------------------

interface UseCategoriesOptions {
  /** Filter theo type. Nếu undefined → lấy tất cả (ALL). */
  type?: TransactionType;
  /** Có enable query không. Mặc định true. */
  enabled?: boolean;
}

export function useCategories(options: UseCategoriesOptions = {}) {
  const { type, enabled = true } = options;

  const filters: CategoryFilters = {};
  if (type) filters.type = type;

  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: () => categoryService.getCategories(filters),

    // ─── Cache Strategy ─────────────────────────────────────
    // Categories ít thay đổi → cache 5 phút, không refetch liên tục.
    staleTime: 5 * 60 * 1000,   // 5 phút
    gcTime: 10 * 60 * 1000,     // Giữ trong memory 10 phút sau unmount

    // ─── Retry Strategy ─────────────────────────────────────
    // Retry 1 lần nếu network error, không retry với 4xx
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number })?.status;
      if (status && status >= 400 && status < 500) return false;
      return failureCount < 1;
    },

    enabled,
  });
}
