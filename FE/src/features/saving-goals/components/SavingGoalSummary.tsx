import { Target, CheckCircle2, PiggyBank, TrendingUp } from "lucide-react";
import type { SavingGoal } from "@/features/saving-goals/types/saving-goal.types";
import { formatVND } from "./SavingGoalCard";

interface SavingGoalSummaryProps {
  goals: SavingGoal[];
}

export function SavingGoalSummary({ goals }: SavingGoalSummaryProps) {
  if (goals.length === 0) return null;

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.isCompleted).length;
  
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.savedAmount), 0);
  
  const averageProgress = totalGoals > 0 
    ? goals.reduce((sum, g) => sum + g.progressPercentage, 0) / totalGoals
    : 0;

  const inProgressGoals = totalGoals - completedGoals;
  
  // Define "sắp hoàn thành" as > 80% but not completed
  const almostDoneGoals = goals.filter(g => !g.isCompleted && g.progressPercentage >= 80).length;

  return (
    <div className="mb-6 flex flex-col">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-muted border border-border rounded-lg p-4 flex flex-col justify-between hover:bg-muted/80 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <Target className="w-4 h-4" />
          <span className="text-xs font-medium">Tổng mục tiêu</span>
        </div>
        <div className="text-xl font-semibold text-foreground">{totalGoals}</div>
      </div>

      <div className="bg-muted border border-border rounded-lg p-4 flex flex-col justify-between hover:bg-muted/80 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <PiggyBank className="w-4 h-4" />
          <span className="text-xs font-medium">Đã tiết kiệm</span>
        </div>
        <div className="text-xl font-semibold text-foreground truncate">
          {formatVND(totalSaved)}
        </div>
      </div>

      <div className="bg-muted border border-border rounded-lg p-4 flex flex-col justify-between hover:bg-muted/80 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-medium">Hoàn thành</span>
        </div>
        <div className="text-xl font-semibold text-foreground">{completedGoals}</div>
      </div>

      <div className="bg-muted border border-border rounded-lg p-4 flex flex-col justify-between hover:bg-muted/80 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-medium">Tiến độ trung bình</span>
        </div>
        <div className="text-xl font-semibold text-foreground">{Math.round(averageProgress)}%</div>
      </div>
      </div>

      {/* Dòng Metadata Notion-like */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-1 mt-4">
        <span>{totalGoals} mục tiêu</span>
        <span>•</span>
        <span>{completedGoals} hoàn thành</span>
        <span>•</span>
        <span>{inProgressGoals} đang thực hiện</span>
        <span>•</span>
        <span>{almostDoneGoals} sắp hoàn thành</span>
      </div>
    </div>
  );
}
