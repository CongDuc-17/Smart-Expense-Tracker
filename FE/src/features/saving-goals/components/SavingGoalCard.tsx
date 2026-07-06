import React from "react";
import { differenceInDays, differenceInMonths } from "date-fns";
import { MoreHorizontal, CheckCircle2, TrendingUp, Edit, Trash2, PiggyBank, PartyPopper, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SavingGoal } from "@/features/saving-goals/types/saving-goal.types";

interface SavingGoalCardProps {
  goal: SavingGoal;
  onEdit: (goal: SavingGoal) => void;
  onDeposit: (goal: SavingGoal) => void;
  onDelete: (goal: SavingGoal) => void;
}

export function formatVND(amount: number | string): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount));
}

export const SavingGoalCard = React.memo(function SavingGoalCard({ goal, onEdit, onDeposit, onDelete }: SavingGoalCardProps) {
  const isCompleted = goal.isCompleted;

  // Calculate days left
  let daysLeft = 0;
  let monthsLeft = 0;
  if (goal.deadline) {
    const deadlineDate = new Date(goal.deadline);
    const today = new Date();
    daysLeft = differenceInDays(deadlineDate, today);
    monthsLeft = differenceInMonths(deadlineDate, today);
  }

  // Calculate monthly needed
  let monthlyNeeded = 0;
  if (!isCompleted && daysLeft > 0) {
    const effectiveMonths = Math.max(1, monthsLeft);
    monthlyNeeded = Number(goal.remainingAmount) / effectiveMonths;
  }

  // Determine status and style
  const getStatus = () => {
    if (isCompleted) return { text: "Hoàn thành", icon: CheckCircle2, style: "text-emerald-700 bg-emerald-500/10 text-emerald-500" };
    if (goal.deadline && daysLeft < 0) return { text: "Quá hạn", icon: Edit, style: "text-red-700 bg-destructive/10 text-destructive" }; // fallback icon
    if (goal.deadline && daysLeft < 30) return { text: "Sắp đến hạn", icon: Edit, style: "text-amber-700 bg-amber-500/10 text-amber-500" };
    return { text: "Đang thực hiện", icon: TrendingUp, style: "text-foreground bg-muted" };
  };
  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="p-5 border border-border rounded-xl shadow-sm hover:shadow-md hover:border-border transition-all duration-150 ease-in-out cursor-pointer bg-card flex flex-col h-full relative group">
      {/* Decorative top border for completed goals */}
      {isCompleted && (
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/10 text-emerald-5000" />
      )}

      {/* 1. Header: Title and Menu */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-base font-bold text-foreground truncate pr-2">
          {goal.title}
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-muted -mt-1 -mr-1 shrink-0 transition-opacity border border-border shadow-sm rounded-md bg-card"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-lg rounded-md">
            <DropdownMenuItem
              onClick={() => onDeposit(goal)}
              className="text-sm font-medium text-foreground cursor-pointer py-2 focus:bg-muted"
              disabled={isCompleted}
            >
              <PiggyBank className="w-4 h-4 mr-2 text-muted-foreground" />
              Nạp thêm
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-muted" />
            <DropdownMenuItem
              onClick={() => onEdit(goal)}
              className="text-sm text-foreground cursor-pointer focus:bg-muted"
            >
              <Edit className="w-4 h-4 mr-2 text-muted-foreground" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(goal)}
              className="text-sm text-red-600 cursor-pointer focus:bg-destructive/10 text-destructive focus:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2 text-red-500" />
              Xóa mục tiêu
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2 & 3. Progress % and Bar */}
      <div className="mb-3">
        <div className="text-3xl font-bold tracking-tight text-foreground mb-2">
          {goal.progressPercentage}%
        </div>
        <div
          className={cn(
            "h-1.5 w-full rounded-full overflow-hidden",
            isCompleted ? "bg-emerald-100" : "bg-muted"
          )}
          role="progressbar"
          aria-valuenow={Math.min(goal.progressPercentage, 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className={cn(
              "h-full rounded-full",
              isCompleted ? "bg-emerald-500/10 text-emerald-5000" : "bg-primary"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* 4. Saved / Target & 5. Remaining */}
      <div className="flex justify-between items-end mb-3">
        <div>
          <div className="text-[13px] font-semibold text-foreground">
            {formatVND(goal.savedAmount)} <span className="text-muted-foreground font-normal">/ {formatVND(goal.targetAmount)}</span>
          </div>
        </div>
        {!isCompleted && Number(goal.remainingAmount) > 0 && (
          <div className="text-xs font-medium text-muted-foreground">
            Còn {formatVND(goal.remainingAmount)}
          </div>
        )}
      </div>

      {/* 6. Monthly saving needed & Motivation Text */}
      <div className="mb-4">
        {!isCompleted && monthlyNeeded > 0 && (
          <div className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-100 mb-1">
            Cần ≈ {formatVND(monthlyNeeded)} / tháng
          </div>
        )}

        {isCompleted ? (
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <span className="text-sm"><PartyPopper /></span> Bạn đã đạt mục tiêu.
          </p>
        ) : goal.progressPercentage >= 80 ? (
          <p className="text-xs text-foreground font-medium mt-1 flex items-center gap-1">
            <span className="text-sm"><Target /></span> Chỉ còn {formatVND(goal.remainingAmount)} nữa là hoàn thành.
          </p>
        ) : null}
      </div>

      {/* 7. Footer: Deadline and Status Badge */}
      <div className="mt-auto pt-4 border-t border-border flex justify-between items-end">
        <div>
          {goal.deadline ? (
            <div className={cn("text-xs font-medium", daysLeft < 30 && !isCompleted ? "text-amber-600" : "text-muted-foreground")}>
              {daysLeft > 0
                ? `Còn ${daysLeft} ngày`
                : daysLeft === 0
                  ? "Hạn chót hôm nay"
                  : `Quá hạn ${Math.abs(daysLeft)} ngày`}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Không có thời hạn</div>
          )}
        </div>

        <div>
          <Badge className={cn("border-none px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1", status.style)}>
            <StatusIcon className="w-3 h-3" />
            {status.text}
          </Badge>
        </div>
      </div>
    </Card>
  );
});
