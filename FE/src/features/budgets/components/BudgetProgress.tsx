// ============================================================
// BUDGET PROGRESS COMPONENT
// Phase 5 — Budget Module
//
// Hiển thị thanh tiến độ phần trăm sử dụng ngân sách.
// Màu sắc thay đổi theo alertStatus (NORMAL, WARNING, EXCEEDED).
// Sử dụng Framer Motion để chạy animation lúc mới render.
// ============================================================

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BudgetAlertStatus } from "@/features/budgets/types/budget.types";

interface BudgetProgressProps {
  percentage: number;
  alertStatus: BudgetAlertStatus;
  className?: string;
}

export function BudgetProgress({
  percentage,
  alertStatus,
  className,
}: BudgetProgressProps) {
  // Giới hạn max 100% để thanh bar không bị tràn khỏi khung
  const displayPercentage = Math.min(percentage, 100);

  // Xác định màu sắc dựa trên trạng thái
  // Theo chuẩn Notion: không quá chói
  const getProgressColor = (status: BudgetAlertStatus) => {
    switch (status) {
      case "WARNING":
        return "bg-amber-500/10 text-amber-5000"; // Cam
      case "EXCEEDED":
        return "bg-destructive/10 text-destructive0"; // Đỏ
      case "NORMAL":
      default:
        return "bg-primary"; // Đen (Primary của Notion)
    }
  };

  return (
    <div
      className={cn(
        "h-1.5 w-full bg-muted rounded-full overflow-hidden",
        className
      )}
      role="progressbar"
      aria-valuenow={displayPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn("h-full rounded-full", getProgressColor(alertStatus))}
        initial={{ width: 0 }}
        animate={{ width: `${displayPercentage}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
}
