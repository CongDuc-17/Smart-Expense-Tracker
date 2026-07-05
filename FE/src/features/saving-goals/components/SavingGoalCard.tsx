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
    if (isCompleted) return { text: "Hoàn thành", icon: CheckCircle2, style: "text-emerald-700 bg-emerald-50" };
    if (goal.deadline && daysLeft < 0) return { text: "Quá hạn", icon: Edit, style: "text-red-700 bg-red-50" }; // fallback icon
    if (goal.deadline && daysLeft < 30) return { text: "Sắp đến hạn", icon: Edit, style: "text-amber-700 bg-amber-50" };
    return { text: "Đang thực hiện", icon: TrendingUp, style: "text-[#37352F] bg-[#F7F6F3]" };
  };
  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="p-5 border border-[#E8E7E5] rounded-xl shadow-sm hover:shadow-md hover:border-[#D0CECA] transition-all duration-150 ease-in-out cursor-pointer bg-white flex flex-col h-full relative group">
      {/* Decorative top border for completed goals */}
      {isCompleted && (
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
      )}

      {/* 1. Header: Title and Menu */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-base font-bold text-[#37352F] truncate pr-2">
          {goal.title}
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 text-[#9B9A97] hover:text-[#37352F] hover:bg-[#F7F6F3] -mt-1 -mr-1 shrink-0 transition-opacity border border-[#E8E7E5] shadow-sm rounded-md bg-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border-[#E8E7E5] shadow-lg rounded-md">
            <DropdownMenuItem
              onClick={() => onDeposit(goal)}
              className="text-sm font-medium text-[#37352F] cursor-pointer py-2 focus:bg-[#F7F6F3]"
              disabled={isCompleted}
            >
              <PiggyBank className="w-4 h-4 mr-2 text-[#9B9A97]" />
              Nạp thêm
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#E8E7E5]" />
            <DropdownMenuItem
              onClick={() => onEdit(goal)}
              className="text-sm text-[#37352F] cursor-pointer focus:bg-[#F7F6F3]"
            >
              <Edit className="w-4 h-4 mr-2 text-[#9B9A97]" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(goal)}
              className="text-sm text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2 text-red-500" />
              Xóa mục tiêu
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2 & 3. Progress % and Bar */}
      <div className="mb-3">
        <div className="text-3xl font-bold tracking-tight text-[#37352F] mb-2">
          {goal.progressPercentage}%
        </div>
        <div
          className={cn(
            "h-1.5 w-full rounded-full overflow-hidden",
            isCompleted ? "bg-emerald-100" : "bg-[#E8E7E5]"
          )}
          role="progressbar"
          aria-valuenow={Math.min(goal.progressPercentage, 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className={cn(
              "h-full rounded-full",
              isCompleted ? "bg-emerald-500" : "bg-[#37352F]"
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
          <div className="text-[13px] font-semibold text-[#37352F]">
            {formatVND(goal.savedAmount)} <span className="text-[#9B9A97] font-normal">/ {formatVND(goal.targetAmount)}</span>
          </div>
        </div>
        {!isCompleted && Number(goal.remainingAmount) > 0 && (
          <div className="text-xs font-medium text-[#9B9A97]">
            Còn {formatVND(goal.remainingAmount)}
          </div>
        )}
      </div>

      {/* 6. Monthly saving needed & Motivation Text */}
      <div className="mb-4">
        {!isCompleted && monthlyNeeded > 0 && (
          <div className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mb-1">
            Cần ≈ {formatVND(monthlyNeeded)} / tháng
          </div>
        )}

        {isCompleted ? (
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <span className="text-sm"><PartyPopper /></span> Bạn đã đạt mục tiêu.
          </p>
        ) : goal.progressPercentage >= 80 ? (
          <p className="text-xs text-[#37352F] font-medium mt-1 flex items-center gap-1">
            <span className="text-sm"><Target /></span> Chỉ còn {formatVND(goal.remainingAmount)} nữa là hoàn thành.
          </p>
        ) : null}
      </div>

      {/* 7. Footer: Deadline and Status Badge */}
      <div className="mt-auto pt-4 border-t border-[#E8E7E5] flex justify-between items-end">
        <div>
          {goal.deadline ? (
            <div className={cn("text-xs font-medium", daysLeft < 30 && !isCompleted ? "text-amber-600" : "text-[#9B9A97]")}>
              {daysLeft > 0
                ? `Còn ${daysLeft} ngày`
                : daysLeft === 0
                  ? "Hạn chót hôm nay"
                  : `Quá hạn ${Math.abs(daysLeft)} ngày`}
            </div>
          ) : (
            <div className="text-xs text-[#9B9A97]">Không có thời hạn</div>
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
