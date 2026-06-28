// ============================================================
// CATEGORY ZUSTAND STORE — UI State Only
// Phase 2 — Category Module
//
// QUY TẮC QUAN TRỌNG:
// - Store này KHÔNG lưu server data (categories list, loading state).
// - Server data = TanStack Query responsibility.
// - Store này chỉ quản lý: sheet open/close, dialog open/close, filters.
// - Không persist (UI state không cần lưu qua session).
// ============================================================

import { create } from "zustand";
import type {
  Category,
  CategoryTabFilter,
  CategoryUIState,
  CategoryUIActions,
} from "@/features/categories/types/category.types";

// ---------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------

const initialState: CategoryUIState = {
  // Sheet states
  isCreateSheetOpen: false,
  isEditSheetOpen: false,
  editingCategory: null,

  // Dialog states
  isDeleteDialogOpen: false,
  deletingCategory: null,
  isConflictDialogOpen: false,

  // Filter state
  activeTab: "ALL",
  searchQuery: "",
};

// ---------------------------------------------------------------
// Store Definition
// ---------------------------------------------------------------

type CategoryStore = CategoryUIState & CategoryUIActions;

export const useCategoryStore = create<CategoryStore>()((set) => ({
  ...initialState,

  // ─── Create Sheet ───────────────────────────────────────────
  openCreateSheet: () =>
    set({
      isCreateSheetOpen: true,
      // Đóng các sheet/dialog khác nếu đang mở
      isEditSheetOpen: false,
      editingCategory: null,
    }),

  closeCreateSheet: () =>
    set({ isCreateSheetOpen: false }),

  // ─── Edit Sheet ─────────────────────────────────────────────
  openEditSheet: (category: Category) =>
    set({
      isEditSheetOpen: true,
      editingCategory: category,
      // Đóng create sheet nếu đang mở
      isCreateSheetOpen: false,
    }),

  closeEditSheet: () =>
    set({
      isEditSheetOpen: false,
      editingCategory: null,
    }),

  // ─── Delete Dialog ───────────────────────────────────────────
  openDeleteDialog: (category: Category) =>
    set({
      isDeleteDialogOpen: true,
      deletingCategory: category,
    }),

  closeDeleteDialog: () =>
    set({
      isDeleteDialogOpen: false,
      deletingCategory: null,
    }),

  // ─── Conflict Dialog (409 error) ─────────────────────────────
  openConflictDialog: () =>
    set({ isConflictDialogOpen: true }),

  closeConflictDialog: () =>
    set({ isConflictDialogOpen: false }),

  // ─── Filters ─────────────────────────────────────────────────
  setActiveTab: (tab: CategoryTabFilter) =>
    set({ activeTab: tab }),

  setSearchQuery: (query: string) =>
    set({ searchQuery: query }),

  resetFilters: () =>
    set({
      activeTab: "ALL",
      searchQuery: "",
    }),
}));

// ---------------------------------------------------------------
// Selectors
// Dùng để tính toán derived state — tránh tính trong component.
// ---------------------------------------------------------------

/**
 * Lọc danh sách category theo activeTab và searchQuery từ store.
 * Gọi trong component: const filtered = selectFilteredCategories(categories, store)
 */
export function selectFilteredCategories(
  categories: Category[],
  { activeTab, searchQuery }: Pick<CategoryUIState, "activeTab" | "searchQuery">
): Category[] {
  return categories
    .filter((cat) => activeTab === "ALL" || cat.type === activeTab)
    .filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
}

/**
 * Tách categories thành default và user-defined.
 */
export function selectCategoriesByOwnership(categories: Category[]): {
  defaultCategories: Category[];
  userCategories: Category[];
} {
  return {
    defaultCategories: categories.filter((c) => c.isDefault),
    userCategories: categories.filter((c) => !c.isDefault),
  };
}
