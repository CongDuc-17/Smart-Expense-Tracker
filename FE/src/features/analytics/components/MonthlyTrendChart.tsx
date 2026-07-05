import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MonthlyTrendItem } from "../types/analytics.types";
import { formatVND } from "./DashboardSummary";

interface MonthlyTrendChartProps {
  data?: MonthlyTrendItem[];
  isLoading: boolean;
}

export function MonthlyTrendChart({ data, isLoading }: MonthlyTrendChartProps) {
  if (isLoading) {
    return (
      <Card className="p-5 border-[#E8E7E5] shadow-sm h-[350px] flex flex-col justify-center items-center">
        <Skeleton className="w-full h-[250px] bg-[#E8E7E5] rounded-md" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-5 border-[#E8E7E5] shadow-sm h-[350px] flex flex-col justify-center items-center text-center">
        <span className="text-sm text-[#9B9A97]">Chưa có dữ liệu</span>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: `T${item.month}`,
    income: Number(item.totalIncome),
    expense: Number(item.totalExpense),
  }));

  return (
    <Card className="p-5 border-[#E8E7E5] shadow-sm h-[350px] flex flex-col">
      <h3 className="text-sm font-semibold text-[#37352F] mb-6">Xu hướng Thu & Chi</h3>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E7E5" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9B9A97" }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9B9A97" }}
              tickFormatter={(value) => {
                if (value === 0) return "0";
                return `${(value / 1000000).toFixed(0)}M`;
              }}
              width={45}
            />
            <Tooltip
              cursor={{ fill: "#F7F6F3" }}
              formatter={(value: number, name: string) => [
                formatVND(value),
                name === "income" ? "Tổng Thu" : "Tổng Chi",
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E8E7E5",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "12px",
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-[#37352F] font-medium mr-4">
                  {value === "income" ? "Tổng Thu" : "Tổng Chi"}
                </span>
              )}
            />
            <Bar dataKey="income" fill="#1DD1A1" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expense" fill="#FF6B6B" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
