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
      <Card className="p-5 border-border shadow-sm flex flex-col h-full">
        <h3 className="text-sm font-semibold text-foreground mb-4">Chi tiêu lớn nhất</h3>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-3 w-1/2 bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-5 border-border shadow-sm flex flex-col justify-center items-center h-full text-center min-h-[300px]">
        <span className="text-sm text-muted-foreground">Chưa có dữ liệu giao dịch</span>
      </Card>
    );
  }

  return (
    <Card className="p-5 border-border shadow-sm flex flex-col h-full">
      <h3 className="text-sm font-semibold text-foreground mb-6">Chi tiêu lớn nhất</h3>
      
      <div className="flex flex-col gap-4">
        {data.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between group p-2 -mx-2 rounded-md hover:bg-muted transition-colors">
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
                <span className="text-sm font-medium text-foreground truncate max-w-[150px] sm:max-w-[200px]">
                  {expense.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(expense.date), "dd/MM/yyyy", { locale: vi })} • {expense.category.name}
                </span>
              </div>
            </div>
            
            <div className="text-sm font-semibold text-foreground">
              -{formatVND(expense.amount)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
