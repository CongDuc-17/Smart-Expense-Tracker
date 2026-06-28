// ============================================================
// CATEGORY SERVICE — API Layer
// Phase 2 — Category Module
// Pure functions gọi API. Không chứa business logic hay UI logic.
// Tất cả TanStack Query hooks sẽ import từ đây.
// ============================================================

import { apiClient } from "@/lib/apiClient";
import type {
  ApiCategoryListResponse,
  ApiCategoryResponse,
  CategoryFilters,
  CreateCategoryDto,
  UpdateCategoryDto,
  Category,
} from "@/features/categories/types/category.types";

// ---------------------------------------------------------------
// GET /api/categories
// Trả về cả default categories + categories của user hiện tại.
// Optional: filter theo type (INCOME | EXPENSE).
// ---------------------------------------------------------------

export async function getCategories(filters?: CategoryFilters): Promise<Category[]> {
  const params: Record<string, string> = {};

  if (filters?.type) {
    params.type = filters.type;
  }

  const response: ApiCategoryListResponse = await apiClient.get(
    "/categories",
    { params }
  );

  return response.data;
}

// ---------------------------------------------------------------
// POST /api/categories
// Tạo category mới. isDefault = false được gán tự động ở BE.
// ---------------------------------------------------------------

export async function createCategory(dto: CreateCategoryDto): Promise<Category> {
  const response: ApiCategoryResponse = await apiClient.post(
    "/categories",
    dto
  );

  return response.data;
}

// ---------------------------------------------------------------
// PATCH /api/categories/:id
// Partial update — chỉ gửi fields cần update.
// BE tự kiểm tra ownership và isDefault.
// ---------------------------------------------------------------

export async function updateCategory(
  id: string,
  dto: UpdateCategoryDto
): Promise<Category> {
  const response: ApiCategoryResponse = await apiClient.patch(
    `/categories/${id}`,
    dto
  );

  return response.data;
}

// ---------------------------------------------------------------
// DELETE /api/categories/:id
// BE sẽ throw 409 nếu category đang có giao dịch liên kết.
// ---------------------------------------------------------------

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

// ---------------------------------------------------------------
// Export object (optional — giúp mock dễ hơn trong tests)
// ---------------------------------------------------------------

export const categoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
