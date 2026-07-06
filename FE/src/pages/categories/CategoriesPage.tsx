// ============================================================
// CategoriesPage — Feature Page
// Phase 2 — Category Module
// Route: /categories
//
// Là orchestrator: kết nối data (TanStack Query) với UI (Zustand).
// Không chứa business logic — chỉ compose và coordinate.
// ============================================================

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryFilters } from "@/features/categories/components/CategoryFilters";
import { CategoryGrid } from "@/features/categories/components/CategoryGrid";
import { CategorySkeleton } from "@/features/categories/components/CategorySkeleton";
import { CategorySheet } from "@/features/categories/components/CategorySheet";
import { DeleteCategoryDialog } from "@/features/categories/components/DeleteCategoryDialog";
import { ConflictErrorDialog } from "@/features/categories/components/ConflictErrorDialog";
import { useCategories } from "@/features/categories/hooks/useCategories";
import {
  useCategoryStore,
  selectFilteredCategories,
} from "@/features/categories/stores/category.store";
import type { Category } from "@/features/categories/types/category.types";

// ---------------------------------------------------------------
// Error Banner component (inline)
// ---------------------------------------------------------------

function ErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="
        flex items-center justify-between px-4 py-3 mb-6
        rounded-lg border border-border bg-muted
        text-sm text-foreground
      "
      role="alert"
    >
      <span>Không thể tải danh mục. Vui lòng thử lại.</span>
      <button
        onClick={onRetry}
        className="
          text-sm font-medium text-foreground underline underline-offset-2
          hover:text-foreground/80 transition-colors duration-150 ml-4
        "
      >
        Thử lại
      </button>
    </div>
  );
}

// ---------------------------------------------------------------
// CategoriesPage
// ---------------------------------------------------------------

export function CategoriesPage() {
  // ─── Store ──────────────────────────────────────────────────
  const {
    activeTab,
    searchQuery,
    openCreateSheet,
    openEditSheet,
    openDeleteDialog,
  } = useCategoryStore();

  // ─── Server Data ─────────────────────────────────────────────
  // Luôn fetch ALL categories — filter client-side để tránh
  // multiple requests khi user đổi tab.
  const { data: categories, isLoading, isError, refetch } = useCategories();

  // ─── Filtered List (client-side) ─────────────────────────────
  const filteredCategories = useMemo(
    () =>
      selectFilteredCategories(categories ?? [], {
        activeTab,
        searchQuery,
      }),
    [categories, activeTab, searchQuery]
  );

  // Có đang filter/search không (để hiển thị đúng empty state)
  const isFiltered = activeTab !== "ALL" || searchQuery.trim().length > 0;

  // ─── Handlers ────────────────────────────────────────────────
  const handleEdit = (category: Category) => {
    openEditSheet(category);
  };

  const handleDelete = (category: Category) => {
    openDeleteDialog(category);
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* ── Page Container ────────────────────────────────────── */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">

        {/* ── Page Header ───────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground leading-8 tracking-tight">
              Danh mục
            </h1>
            <p className="text-sm text-muted-foreground mt-1 leading-5">
              Quản lý danh mục thu chi của bạn
            </p>
          </div>

          {/* Create button */}
          <Button
            onClick={openCreateSheet}
            size="sm"
            className="
              bg-primary text-primary-foreground text-sm font-medium
              hover:bg-primary/90 active:scale-95
              transition-colors duration-150
              flex items-center gap-1.5 h-9
            "
          >
            <Plus className="w-4 h-4" />
            Tạo danh mục
          </Button>
        </div>

        {/* ── Filter Bar ────────────────────────────────────── */}
        <div className="mb-6">
          <CategoryFilters />
        </div>

        {/* ── Error State ───────────────────────────────────── */}
        {isError && <ErrorBanner onRetry={() => refetch()} />}

        {/* ── Content ───────────────────────────────────────── */}
        {isLoading ? (
          <CategorySkeleton defaultCount={6} userCount={3} />
        ) : (
          <CategoryGrid
            categories={filteredCategories}
            isFiltered={isFiltered}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreateClick={openCreateSheet}
          />
        )}
      </div>

      {/* ── Overlays (Sheet + Dialogs) ─────────────────────── */}
      {/* Render ở cuối để không ảnh hưởng layout flow */}
      <CategorySheet />
      <DeleteCategoryDialog />
      <ConflictErrorDialog />
    </div>
  );
}
