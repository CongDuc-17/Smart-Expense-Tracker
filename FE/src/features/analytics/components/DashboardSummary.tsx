import { Wallet, TrendingUp, TrendingDown, Target } from "lucide-react";
import type { MonthlySummary } from "../types/analytics.types";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSummaryProps {
  data?: MonthlySummary;
  isLoading: boolean;
}

export function formatVND(amount: string | number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount));
}

function SummaryCardSkeleton() {
  return (
    <div className="p-5 rounded-lg border border-[#E8E7E5] bg-white shadow-sm flex flex-col justify-between h-32">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24 bg-[#E8E7E5]" />
        <Skeleton className="h-8 w-8 rounded-md bg-[#E8E7E5]" />
      </div>
      <div>
        <Skeleton className="h-8 w-32 bg-[#E8E7E5] mb-2" />
        <Skeleton className="h-3 w-20 bg-[#E8E7E5]" />
      </div>
    </div>
  );
}

export function DashboardSummary({ data, isLoading }: DashboardSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const summaryItems = [
    {
      title: "Tổng Thu",
      amount: data.totalIncome,
      icon: TrendingUp,
      iconColor: "text-[#1DD1A1]",
      iconBg: "bg-[#1DD1A115]",
      diff: data.comparedToLastMonth?.incomeDiff,
    },
    {
      title: "Tổng Chi",
      amount: data.totalExpense,
      icon: TrendingDown,
      iconColor: "text-[#FF6B6B]",
      iconBg: "bg-[#FF6B6B15]",
      diff: data.comparedToLastMonth?.expenseDiff,
    },
    {
      title: "Số Dư",
      amount: data.netBalance,
      icon: Wallet,
      iconColor: "text-[#37352F]",
      iconBg: "bg-[#F7F6F3]",
      diff: undefined,
    },
    {
      title: "Tỉ Lệ Tiết Kiệm",
      amount: `${data.savingsRate}%`,
      icon: Target,
      iconColor: "text-[#37352F]",
      iconBg: "bg-[#F7F6F3]",
      diff: undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryItems.map((item, idx) => (
        <div
          key={idx}
          className="p-5 rounded-lg border border-[#E8E7E5] bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-[#9B9A97]">
              {item.title}
            </span>
            <div className={`p-2 rounded-md ${item.iconBg}`}>
              <item.icon className={`w-4 h-4 ${item.iconColor}`} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#37352F] tracking-tight truncate">
              {item.title === "Tỉ Lệ Tiết Kiệm" ? item.amount : formatVND(item.amount)}
            </div>
            {item.diff !== undefined && (
              <div
                className={`text-xs mt-1 font-medium ${
                  item.diff > 0
                    ? item.title === "Tổng Thu"
                      ? "text-[#1DD1A1]"
                      : "text-[#FF6B6B]"
                    : item.diff < 0
                    ? item.title === "Tổng Thu"
                      ? "text-[#FF6B6B]"
                      : "text-[#1DD1A1]"
                    : "text-[#9B9A97]"
                }`}
              >
                {item.diff > 0 ? "+" : ""}
                {item.diff}% so với tháng trước
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
