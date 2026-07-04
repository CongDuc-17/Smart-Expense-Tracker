// ============================================================
// BudgetsPage — Feature Page
// Phase 5 — Budget Module
// Route: /budgets
//
// Orchestrator: kết nối data (TanStack Query) với UI (Zustand).
// Không chứa business logic — chỉ compose và coordinate.
// ============================================================

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BudgetFilters } from "@/features/budgets/components/BudgetFilters";
import { BudgetGrid } from "@/features/budgets/components/BudgetGrid";
import { BudgetSheet } from "@/features/budgets/components/BudgetSheet";
import { DeleteBudgetDialog } from "@/features/budgets/components/DeleteBudgetDialog";
import { useBudgets } from "@/features/budgets/hooks/useBudgets";
import { BudgetCreateForm } from "./BudgetCreateForm"
import {
  useBudgetStore,
  selectFilteredBudgets,
  formatBudgetWithStatus,
} from "@/features/budgets/stores/budget.store";
import type { BudgetWithStatus } from "@/features/budgets/types/budget.types";

// ---------------------------------------------------------------
// Loading Skeleton Component (inline)
// ---------------------------------------------------------------

function BudgetSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-64 bg-[#E8E7E5] rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------
// Error Banner component (inline)
// ---------------------------------------------------------------

function ErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="
        flex items-center justify-between px-4 py-3 mb-6
        rounded-lg border border-[#E8E7E5] bg-[#F7F6F3]
        text-sm text-[#37352F]
      "
      role="alert"
    >
      <span>Không thể tải ngân sách. Vui lòng thử lại.</span>
      <button
        onClick={onRetry}
        className="
          text-sm font-medium text-[#37352F] underline underline-offset-2
          hover:text-[#2D2B27] transition-colors duration-150 ml-4
        "
      >
        Thử lại
      </button>
    </div>
  );
}

// ---------------------------------------------------------------
// BudgetsPage
// ---------------------------------------------------------------

export function BudgetsPage() {
  // ─── Store ──────────────────────────────────────────────────
  const {
    activeTab,
    searchQuery,
    selectedMonth,
    selectedYear,
    sortBy,
    sortOrder,
    openCreateSheet,
    openEditSheet,
    openDeleteDialog,
  } = useBudgetStore();

  // ─── Server Data ─────────────────────────────────────────────
  const { data: budgets, isLoading, isError, refetch } = useBudgets({
    month: selectedMonth,
    year: selectedYear,
  });

  // ─── Format budgets with status ──────────────────────────────
  const budgetsWithStatus: BudgetWithStatus[] = useMemo(
    () => (budgets ?? []).map(formatBudgetWithStatus),
    [budgets]
  );

  // ─── Filtered List (client-side) ─────────────────────────────
  const filteredBudgets = useMemo(
    () =>
      selectFilteredBudgets(budgetsWithStatus, {
        activeTab,
        searchQuery,
        month: selectedMonth,
        year: selectedYear,
        sortBy,
        sortOrder,
      }),
    [budgetsWithStatus, activeTab, searchQuery, selectedMonth, selectedYear, sortBy, sortOrder]
  );

  // Check if any filter is active
  const isFiltered = activeTab !== "ALL" || searchQuery.trim().length > 0;

  // ─── Handlers ────────────────────────────────────────────────
  const handleEdit = (budget: BudgetWithStatus) => {
    openEditSheet(budget);
  };

  const handleDelete = (budget: BudgetWithStatus) => {
    openDeleteDialog(budget);
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full bg-[#FFFEFC]">
      {/* ── Page Container ────────────────────────────────────── */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">

        {/* ── Page Header ───────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#37352F] leading-8 tracking-tight">
              Quản lý ngân sách
            </h1>
            <p className="text-sm text-[#9B9A97] mt-1 leading-5">
              Thiết lập giới hạn chi tiêu và theo dõi tiến độ sử dụng
            </p>
          </div>

          {/* Create button */}
          <Button
            onClick={openCreateSheet}
            size="sm"
            className="
              bg-[#37352F] text-[#FFFEFC] text-sm font-medium
              hover:bg-[#2D2B27] active:bg-[#1F1D1A]
              transition-colors duration-150
              flex items-center gap-1.5 h-9
            "
          >
            <Plus className="w-4 h-4" />
            Tạo ngân sách
          </Button>
        </div>

 {/* ── Stats Summary ─────────────────────────────────── */}
        {!isLoading && budgetsWithStatus.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Total Budgets */}
            <div className="bg-[#F7F6F3] rounded-lg p-4 border border-[#E8E7E5]">
              <p className="text-xs text-[#9B9A97] font-medium mb-1">Tổng ngân sách</p>
              <p className="text-xl font-semibold text-[#37352F]">
                {budgetsWithStatus.length}
              </p>
            </div>

            {/* Total Limit - SỬA Ở ĐÂY */}
            <div className="bg-[#F7F6F3] rounded-lg p-4 border border-[#E8E7E5]">
              <p className="text-xs text-[#9B9A97] font-medium mb-1">Giới hạn tổng</p>
              <p className="text-xl font-semibold text-[#37352F]">
                {budgetsWithStatus
                  .reduce((sum, b) => sum + Number(b.limitAmount), 0)
                  .toLocaleString("vi-VN")}
              </p>
            </div>

            {/* Total Spent - SỬA Ở ĐÂY */}
            <div className="bg-[#F7F6F3] rounded-lg p-4 border border-[#E8E7E5]">
              <p className="text-xs text-[#9B9A97] font-medium mb-1">Đã chi tiêu</p>
              <p className="text-xl font-semibold text-[#37352F]">
                {budgetsWithStatus
                  .reduce((sum, b) => sum + Number(b.spentAmount), 0)
                  .toLocaleString("vi-VN")}
              </p>
            </div>

            {/* Remaining - SỬA Ở ĐÂY */}
            <div className="bg-[#F7F6F3] rounded-lg p-4 border border-[#E8E7E5]">
              <p className="text-xs text-[#9B9A97] font-medium mb-1">Còn lại</p>
              <p className="text-xl font-semibold text-emerald-600">
                {Math.max(
                  0,
                  budgetsWithStatus.reduce((sum, b) => sum + (Number(b.limitAmount) - Number(b.spentAmount)), 0)
                ).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        )}

        {/* ── Filter Bar ────────────────────────────────────── */}
        <div className="mb-6">
          <BudgetFilters />
        </div>

        {/* ── Error State ───────────────────────────────────── */}
        {isError && <ErrorBanner onRetry={() => refetch()} />}

        {/* ── Content ───────────────────────────────────────── */}
        {isLoading ? (
          <BudgetSkeleton />
        ) : (
          <BudgetGrid
            budgets={filteredBudgets}
            isFiltered={isFiltered}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreateClick={openCreateSheet}
          />
        )}
      </div>

      {/* ── Overlays (Sheet + Dialogs) ─────────────────────── */}
      <BudgetSheet />
      <DeleteBudgetDialog />
    </div>
  );
}