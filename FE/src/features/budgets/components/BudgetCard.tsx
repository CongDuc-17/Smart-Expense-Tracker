// ============================================================
// BUDGET CARD COMPONENT
// Phase 5 — Budget Module
//
// Hiển thị một thẻ ngân sách của một danh mục.
// Cho phép Hover để hiện nút Edit / Delete.
// ============================================================

import React from "react";
import { Pencil, Trash2, MoreHorizontal, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { formatVND } from "@/features/transactions/components/AmountDisplay";
import { getIconComponent } from "@/features/categories/constants/category-icons";
import { BudgetProgress } from "@/features/budgets/components/BudgetProgress";
import { cn } from "@/lib/utils";
import type { Budget } from "@/features/budgets/types/budget.types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

export const BudgetCard = React.memo(function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const Icon = getIconComponent(budget.category.icon);

  // Helper để lấy text hiển thị trạng thái
  const getStatusContent = () => {
    if (budget.alertStatus === "EXCEEDED") return { text: "Vượt hạn mức", icon: AlertCircle, color: "text-red-600 bg-red-50 border border-red-100" };
    if (budget.alertStatus === "WARNING") return { text: "Sắp vượt", icon: AlertTriangle, color: "text-amber-600 bg-amber-50 border border-amber-100" };
    return { text: "An toàn", icon: CheckCircle2, color: "text-emerald-700 bg-emerald-50 border border-emerald-100" };
  };

  const status = getStatusContent();
  const StatusIcon = status.icon;

  const daysInMonth = new Date(budget.year, budget.month, 0).getDate();
  const resetDateString = `${daysInMonth.toString().padStart(2, '0')}/${budget.month.toString().padStart(2, '0')}`;

  return (
    <div
      className="
        group relative flex flex-col p-5 rounded-xl bg-[#FFFFFF] border border-[#E8E7E5]
        shadow-sm hover:shadow-md hover:border-[#D0CECA] transition-all duration-150 ease-in-out cursor-pointer
      "
    >
      {/* ─── Header: Icon + Category Name + Status Badge ────────── */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full"
            style={{ backgroundColor: `${budget.category.color}20` }}
          >
            <Icon
              className="w-4 h-4"
              style={{ color: budget.category.color }}
            />
          </div>
          <span className="text-sm font-semibold text-[#37352F]">
            {budget.category.name}
          </span>
        </div>

        {/* Quick Actions Hover Popover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute top-4 right-4">
          <Popover>
            <PopoverTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-[#E8E7E5] text-[#9B9A97] hover:text-[#37352F] hover:bg-[#F7F6F3] shadow-sm transition-all"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-36 p-1 bg-white border border-[#E8E7E5] shadow-lg rounded-lg" align="end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(budget);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-[#37352F] hover:bg-[#F7F6F3] rounded-md transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-[#9B9A97]" /> Sửa
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(budget);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" /> Xóa
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ─── Body: % And Amounts ──────────────────────────────────────── */}
      <div className="mb-3 flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight text-[#37352F]">
          {budget.percentage}%
        </span>
        <span className="text-sm font-medium text-[#9B9A97] mb-1 pb-[2px]">
          đã dùng
        </span>
      </div>

      {/* ─── Progress Bar ───────────────────────────────────────── */}
      <BudgetProgress
        percentage={budget.percentage}
        alertStatus={budget.alertStatus}
      />

      <div className="mt-2.5 flex items-center justify-between">
        <div className="text-xs font-medium text-[#37352F]">
          {formatVND(budget.spentAmount)} <span className="text-[#9B9A97] font-normal">/ {formatVND(budget.limitAmount)}</span>
        </div>

        {budget.remainingAmount >= 0 ? (
          <span className="text-[11px] text-[#9B9A97] font-medium">
            Còn lại {formatVND(budget.remainingAmount)}
          </span>
        ) : (
          <span className="text-[11px] text-red-600 font-medium">
            Vượt {formatVND(Math.abs(budget.remainingAmount))}
          </span>
        )}
      </div>

      {/* ─── Footer: Metadata & Status ──────────────────────────── */}
      <div className="mt-4 pt-4 border-t border-[#E8E7E5] flex items-center justify-between">
        <span className="text-[11px] text-[#9B9A97]">
          Reset {resetDateString}
        </span>
        <span
          className={cn(
            "flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
            status.color
          )}
        >
          <StatusIcon className="w-3 h-3" />
          {status.text}
        </span>
      </div>
    </div>
  );
});
