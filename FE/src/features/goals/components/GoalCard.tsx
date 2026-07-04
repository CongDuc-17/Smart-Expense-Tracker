import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export function GoalCard({ goal, onOpenDeposit }: any) {
  const progress = Math.min((Number(goal.savedAmount) / Number(goal.targetAmount)) * 100, 100);

  return (
    <div className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        {/* Tăng độ đậm của tên mục tiêu */}
        <h3 className="font-bold text-lg text-slate-900">{goal.title}</h3>
        
        <span className={`text-xs px-2 py-1 rounded font-medium ${
          goal.isCompleted ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
        }`}>
          {goal.isCompleted ? "Hoàn thành" : "Đang tiết kiệm"}
        </span>
      </div>

      <Progress value={progress} className="h-2" />
      
      {/* Tăng độ đậm của số tiền để dễ đọc */}
      <div className="text-sm font-semibold text-slate-700">
        {Number(goal.savedAmount).toLocaleString()} / {Number(goal.targetAmount).toLocaleString()} đ
      </div>
      
<Button 
  variant="default" 
  className="w-full font-bold text-white bg-blue-600 hover:bg-blue-700" 
  onClick={() => onOpenDeposit(goal)}
>
  Nạp tiền
</Button>
    </div>
  );
}