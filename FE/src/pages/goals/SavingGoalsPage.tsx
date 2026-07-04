import { useState } from "react";
import { useGoals } from "../../features/goals/hooks/useGoals";
import { GoalCard } from "../../features/goals/components/GoalCard";
import { DepositDialog } from "../../features/goals/components/DepositDialog";
import { CreateGoalDialog } from "../../features/goals/components/CreateGoalDialog"; 
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SavingGoalsPage() {
  const { data, isLoading, error } = useGoals();
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const goals = Array.isArray(data) ? data : (data as any)?.data;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl text-black font-bold">Mục tiêu tiết kiệm</h1>
        {/* Nút bấm để mở dialog tạo mục tiêu */}
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm mục tiêu
        </Button>
      </div>

      {!goals || goals.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Chưa có mục tiêu nào. Hãy tạo mục tiêu đầu tiên nhé!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((goal: any) => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              onOpenDeposit={() => setSelectedGoal(goal)} 
            />
          ))}
        </div>
      )}

      {/* Dialog Nạp tiền */}
      {selectedGoal && (
        <DepositDialog 
          goal={selectedGoal} 
          open={!!selectedGoal} 
          onOpenChange={(open: boolean) => !open && setSelectedGoal(null)} 
        />
      )}

      {/* Dialog Tạo mới mục tiêu */}
      <CreateGoalDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}