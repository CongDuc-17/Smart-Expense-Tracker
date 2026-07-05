import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TopExpenseItem } from "../types/analytics.types";
import { formatVND } from "./DashboardSummary";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface TopExpensesListProps {
  data?: TopExpenseItem[];
  isLoading: boolean;
}

export function TopExpensesList({ data, isLoading }: TopExpensesListProps) {
  if (isLoading) {
    return (
      <Card className="p-5 border-[#E8E7E5] shadow-sm flex flex-col h-full">
        <h3 className="text-sm font-semibold text-[#37352F] mb-4">Chi tiêu lớn nhất</h3>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full bg-[#E8E7E5]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-[#E8E7E5]" />
                <Skeleton className="h-3 w-1/2 bg-[#E8E7E5]" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-5 border-[#E8E7E5] shadow-sm flex flex-col justify-center items-center h-full text-center min-h-[300px]">
        <span className="text-sm text-[#9B9A97]">Chưa có dữ liệu giao dịch</span>
      </Card>
    );
  }

  return (
    <Card className="p-5 border-[#E8E7E5] shadow-sm flex flex-col h-full">
      <h3 className="text-sm font-semibold text-[#37352F] mb-6">Chi tiêu lớn nhất</h3>
      
      <div className="flex flex-col gap-4">
        {data.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between group p-2 -mx-2 rounded-md hover:bg-[#F7F6F3] transition-colors">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: expense.category.color }}
              >
                {/* Fallback icon initials if real icon parsing isn't implemented */}
                <span className="text-xs font-bold uppercase">
                  {expense.category.name.substring(0, 2)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#37352F] truncate max-w-[150px] sm:max-w-[200px]">
                  {expense.title}
                </span>
                <span className="text-xs text-[#9B9A97]">
                  {format(new Date(expense.date), "dd/MM/yyyy", { locale: vi })} • {expense.category.name}
                </span>
              </div>
            </div>
            
            <div className="text-sm font-semibold text-[#37352F]">
              -{formatVND(expense.amount)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
