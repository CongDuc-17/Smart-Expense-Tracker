import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DailyHeatmapItem } from "../types/analytics.types";
import { formatVND } from "./DashboardSummary";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DailyHeatmapProps {
  data?: DailyHeatmapItem[];
  isLoading: boolean;
  year: number;
}

export function DailyHeatmap({ data, isLoading, year }: DailyHeatmapProps) {
  // Memoize all complex calculations to prevent re-renders on hover
  const { maxAmount, emptyDaysOffset, monthLabels } = useMemo(() => {
    if (!data || data.length === 0) {
      return { maxAmount: 0, emptyDaysOffset: [], monthLabels: [] };
    }

    const max = Math.max(...data.map((d) => Number(d.amount)));

    // January 1st day of week to create offset
    // 0 is Sunday, 1 is Monday.
    const firstDay = new Date(year, 0, 1).getDay();
    const offsets = Array.from({ length: firstDay }, (_, i) => i);

    // Calculate month labels position
    const labels: { month: string; col: number }[] = [];
    const monthNames = ["Thg 1", "Thg 2", "Thg 3", "Thg 4", "Thg 5", "Thg 6", "Thg 7", "Thg 8", "Thg 9", "Thg 10", "Thg 11", "Thg 12"];
    
    for (let m = 0; m < 12; m++) {
      const firstDayOfMonth = new Date(year, m, 1);
      // diff in time to get day of year
      const diff = firstDayOfMonth.getTime() - new Date(year, 0, 1).getTime();
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      const totalIndex = dayOfYear + firstDay;
      const colIndex = Math.floor(totalIndex / 7);
      labels.push({ month: monthNames[m], col: colIndex });
    }

    return { maxAmount: max, emptyDaysOffset: offsets, monthLabels: labels };
  }, [data, year]);

  if (isLoading) {
    return (
      <Card className="p-5 border-border shadow-sm flex flex-col justify-center items-center overflow-hidden">
        <Skeleton className="w-full h-[140px] bg-muted rounded-md" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-5 border-border shadow-sm flex flex-col justify-center items-center text-center min-h-[140px]">
        <span className="text-sm text-muted-foreground">Chưa có dữ liệu</span>
      </Card>
    );
  }

  const getColor = (amount: number) => {
    if (amount === 0) return "bg-muted";
    const ratio = amount / maxAmount;
    if (ratio <= 0.25) return "bg-[#FF6B6B40]";
    if (ratio <= 0.5) return "bg-[#FF6B6B70]";
    if (ratio <= 0.75) return "bg-[#FF6B6B90]";
    return "bg-[#FF6B6B]";
  };

  return (
    <Card className="p-4 sm:p-5 border-border shadow-sm flex flex-col overflow-x-auto custom-scrollbar">
      <h3 className="text-sm font-semibold text-foreground mb-4">Tần suất chi tiêu {year}</h3>
      
      <div className="min-w-max">
        
        {/* Month Labels */}
        <div className="relative h-5 w-full text-[10px] text-muted-foreground ml-6">
          {monthLabels.map((label, idx) => (
            <span 
              key={idx} 
              className="absolute top-0 font-medium"
              // w-3 (0.75rem) + gap-1 (0.25rem) = 1rem
              style={{ left: `calc(${label.col} * 1rem)` }}
            >
              {label.month}
            </span>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Days of week labels (T2, T4, T6 only for clarity) */}
          <div 
            className="grid grid-flow-col gap-1 text-[10px] text-muted-foreground font-medium pr-1"
            style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
          >
            <span className="h-3 w-5" />
            <span className="h-3 w-5 leading-3 flex items-center">T2</span>
            <span className="h-3 w-5" />
            <span className="h-3 w-5 leading-3 flex items-center">T4</span>
            <span className="h-3 w-5" />
            <span className="h-3 w-5 leading-3 flex items-center">T6</span>
            <span className="h-3 w-5" />
          </div>

          {/* Grid Container */}
          <div 
            className="grid grid-flow-col gap-1"
            style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
          >
            {emptyDaysOffset.map((_, idx) => (
              <div key={`empty-${idx}`} className="w-3 h-3 bg-transparent rounded-sm" />
            ))}
            
            <TooltipProvider delayDuration={100}>
              {data.map((day) => {
                const amount = Number(day.amount);
                return (
                  <Tooltip key={day.date}>
                    <TooltipTrigger asChild>
                      <div 
                        className={`w-3 h-3 rounded-[2px] transition-colors hover:ring-1 hover:ring-ring hover:ring-offset-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${getColor(amount)}`}
                        tabIndex={0}
                        aria-label={`Chi tiêu ngày ${day.date}: ${amount > 0 ? formatVND(amount) : "0đ"}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-primary text-primary-foreground border-none shadow-md text-xs px-2.5 py-1.5">
                      <p className="font-medium">{day.date}</p>
                      <p>{amount > 0 ? formatVND(amount) : "Không có chi tiêu"}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-muted-foreground font-medium mr-1">
          <span>Ít</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-[2px] bg-muted" />
            <div className="w-3 h-3 rounded-[2px] bg-[#FF6B6B40]" />
            <div className="w-3 h-3 rounded-[2px] bg-[#FF6B6B70]" />
            <div className="w-3 h-3 rounded-[2px] bg-[#FF6B6B90]" />
            <div className="w-3 h-3 rounded-[2px] bg-[#FF6B6B]" />
          </div>
          <span>Nhiều</span>
        </div>
      </div>
    </Card>
  );
}
