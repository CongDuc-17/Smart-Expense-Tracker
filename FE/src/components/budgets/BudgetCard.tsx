// FE/src/components/budgets/BudgetCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function BudgetCard({ title, spent, limit }: { title: string; spent: number; limit: number }) {
  const percentage = Math.min((spent / limit) * 100, 100);
  
  
  const getProgressColor = (val: number) => {
    if (val >= 90) return "bg-red-500"; 
    if (val >= 70) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <Card className="shadow-sm border-muted">
      <CardHeader className="pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-semibold mb-3">
          {spent.toLocaleString()} <span className="text-sm text-muted-foreground">/ {limit.toLocaleString()}</span>
        </div>
        <Progress value={percentage} className={`h-1.5 ${getProgressColor(percentage)}`} />
      </CardContent>
    </Card>
  );
}