// ============================================================
// CATEGORY TYPES
// Phase 2 — Category Module
// Foundation: Tất cả file trong module này đều import từ đây.
// ============================================================

// Enum: Loại giao dịch — đồng bộ với Backend TransactionTypeEnum
export type TransactionType = "INCOME" | "EXPENSE";

// ---------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------

/**
 * Đối tượng Category trả về từ API.
 * isDefault = true: Danh mục hệ thống (không thể sửa/xóa).
 * isDefault = false: Danh mục do user tạo.
 */
export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string; // Lucide icon name, e.g. "Utensils", "Car"
  color: string; // Hex color, e.g. "#FF6B6B"
  isDefault: boolean;
  userId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Response bọc ngoài từ BE: { status: "success", data: [...] }
 */
export interface ApiCategoryListResponse {
  status: string;
  data: Category[];
}

export interface ApiCategoryResponse {
  status: string;
  data: Category;
}

// ---------------------------------------------------------------
// Request/DTO Types (gửi lên API)
// ---------------------------------------------------------------

/**
 * Body cho POST /api/categories
 */
export interface CreateCategoryDto {
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

/**
 * Body cho PATCH /api/categories/:id
 * Tất cả fields là optional (partial update)
 */
export interface UpdateCategoryDto {
  name?: string;
  icon?: string;
  color?: string;
}

// ---------------------------------------------------------------
// Filter / Query Types
// ---------------------------------------------------------------

/**
 * Query params cho GET /api/categories
 */
export interface CategoryFilters {
  type?: TransactionType;
}

/**
 * Tab state trong UI — thêm 'ALL' để hiển thị tất cả
 */
export type CategoryTabFilter = "ALL" | TransactionType;

// ---------------------------------------------------------------
// UI State Types (dùng trong Zustand store)
// ---------------------------------------------------------------

export interface CategoryUIState {
  // Sheet states
  isCreateSheetOpen: boolean;
  isEditSheetOpen: boolean;
  editingCategory: Category | null;

  // Dialog states
  isDeleteDialogOpen: boolean;
  deletingCategory: Category | null;
  isConflictDialogOpen: boolean;

  // Filter state (client-side only)
  activeTab: CategoryTabFilter;
  searchQuery: string;
}

export interface CategoryUIActions {
  // Create sheet
  openCreateSheet: () => void;
  closeCreateSheet: () => void;

  // Edit sheet
  openEditSheet: (category: Category) => void;
  closeEditSheet: () => void;

  // Delete dialog
  openDeleteDialog: (category: Category) => void;
  closeDeleteDialog: () => void;

  // Conflict dialog
  openConflictDialog: () => void;
  closeConflictDialog: () => void;

  // Filters
  setActiveTab: (tab: CategoryTabFilter) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

// ---------------------------------------------------------------
// Form Types (dùng với React Hook Form)
// ---------------------------------------------------------------

/**
 * Giá trị của form tạo/sửa category (phản ánh CategorySheet fields)
 */
export interface CategoryFormValues {
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}
