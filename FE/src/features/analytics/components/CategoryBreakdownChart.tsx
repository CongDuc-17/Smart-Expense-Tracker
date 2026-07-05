import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CategoryBreakdownItem } from "../types/analytics.types";
import { formatVND } from "./DashboardSummary";

interface CategoryBreakdownChartProps {
  data?: CategoryBreakdownItem[];
  isLoading: boolean;
}

export function CategoryBreakdownChart({ data, isLoading }: CategoryBreakdownChartProps) {
  if (isLoading) {
    return (
      <Card className="p-5 border-[#E8E7E5] shadow-sm h-full flex flex-col justify-center items-center">
        <Skeleton className="w-[200px] h-[200px] rounded-full bg-[#E8E7E5]" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-5 border-[#E8E7E5] shadow-sm h-full flex flex-col justify-center items-center text-center">
        <div className="w-[200px] h-[200px] rounded-full bg-[#F7F6F3] flex items-center justify-center mb-4">
          <span className="text-sm text-[#9B9A97]">Chưa có dữ liệu</span>
        </div>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category.name,
    value: Number(item.totalAmount),
    color: item.category.color,
    percentage: item.percentage,
  }));

  return (
    <Card className="p-5 border-[#E8E7E5] shadow-sm h-full flex flex-col">
      <h3 className="text-sm font-semibold text-[#37352F] mb-6">Chi tiêu theo danh mục</h3>
      
      <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
        <div className="w-[200px] h-[200px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => formatVND(value)}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E8E7E5",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 w-full space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-[#37352F] font-medium truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-[#37352F]">
                  {formatVND(item.value)}
                </div>
                <div className="text-xs text-[#9B9A97]">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
