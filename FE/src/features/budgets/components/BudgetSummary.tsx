// ============================================================
// BUDGET SUMMARY COMPONENT
// Phase 5 — Budget Module
//
// Tính toán tổng hạn mức, tổng đã tiêu, tổng còn lại.
// Nhận data trực tiếp từ parent thay vì gọi API.
// ============================================================

import { useMemo } from "react";
import { formatVND } from "@/features/transactions/components/AmountDisplay";
import type { Budget } from "@/features/budgets/types/budget.types";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface BudgetSummaryProps {
  budgets: Budget[];
}

export function BudgetSummary({ budgets }: BudgetSummaryProps) {
  // Tính tổng
  const summary = useMemo(() => {
    return budgets.reduce(
      (acc, curr) => ({
        totalLimit: acc.totalLimit + curr.limitAmount,
        totalSpent: acc.totalSpent + curr.spentAmount,
        totalRemaining: acc.totalRemaining + curr.remainingAmount,
      }),
      { totalLimit: 0, totalSpent: 0, totalRemaining: 0 }
    );
  }, [budgets]);

  // Thống kê trạng thái các ngân sách
  const stats = useMemo(() => {
    let safeCount = 0;
    let warningCount = 0;
    let exceededCount = 0;
    
    budgets.forEach(b => {
      if (b.alertStatus === "EXCEEDED") exceededCount++;
      else if (b.alertStatus === "WARNING") warningCount++;
      else safeCount++;
    });
    
    return { safeCount, warningCount, exceededCount, totalCount: budgets.length };
  }, [budgets]);

  const percentageUsed = summary.totalLimit > 0 
    ? Math.round((summary.totalSpent / summary.totalLimit) * 100) 
    : 0;

  if (budgets.length === 0) return null;

  return (
    <div className="mb-8 flex flex-col gap-3">
      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Tổng hạn mức */}
        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E8E7E5] shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-[#9B9A97] mb-1">Tổng hạn mức</p>
          <p className="text-2xl font-bold text-[#37352F]">{formatVND(summary.totalLimit)}</p>
          <p className="text-xs text-[#9B9A97] mt-2 font-medium">{stats.totalCount} ngân sách</p>
        </div>

        {/* Card 2: Đã chi tiêu */}
        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E8E7E5] shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-[#9B9A97] mb-1">Đã chi tiêu</p>
          <p className={`text-2xl font-bold ${summary.totalSpent > summary.totalLimit ? "text-red-600" : "text-amber-600"}`}>
            {formatVND(summary.totalSpent)}
          </p>
          <p className="text-xs text-[#9B9A97] mt-2 font-medium">{percentageUsed}% đã dùng</p>
        </div>

        {/* Card 3: Thâm hụt / Còn lại */}
        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E8E7E5] shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-[#9B9A97] mb-1">
            {summary.totalRemaining >= 0 ? "Còn lại" : "Thâm hụt"}
          </p>
          <p className={`text-2xl font-bold ${summary.totalRemaining >= 0 ? "text-[#37352F]" : "text-red-600"}`}>
            {formatVND(summary.totalRemaining)}
          </p>
          <div className="mt-2">
            {summary.totalRemaining >= 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Trong giới hạn
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                Đã vượt ngân sách
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dòng Metadata Notion-like */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#9B9A97] px-1">
        <span>{stats.totalCount} ngân sách</span>
        <span>•</span>
        <span>{stats.safeCount} an toàn</span>
        <span>•</span>
        <span>{stats.warningCount} sắp vượt</span>
        <span>•</span>
        <span>{stats.exceededCount} vượt hạn mức</span>
      </div>
    </div>
  );
}
