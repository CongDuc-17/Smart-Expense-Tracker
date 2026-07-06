import { AnalyticsFilters } from "@/features/analytics/components/AnalyticsFilters";
import { DashboardSummary } from "@/features/analytics/components/DashboardSummary";
import { CategoryBreakdownChart } from "@/features/analytics/components/CategoryBreakdownChart";
import { MonthlyTrendChart } from "@/features/analytics/components/MonthlyTrendChart";
import { DailyHeatmap } from "@/features/analytics/components/DailyHeatmap";
import { TopExpensesList } from "@/features/analytics/components/TopExpensesList";
import { ExportReportButton } from "@/features/reports/components/ExportReportButton";

import { useAnalyticsStore } from "@/features/analytics/stores/analytics.store";
import {
  useAnalyticsSummary,
  useAnalyticsCategory,
  useAnalyticsTrend,
  useAnalyticsHeatmap,
  useAnalyticsTopExpenses,
} from "@/features/analytics/hooks/useAnalytics";

export function Dashboard() {
  const { selectedMonth, selectedYear } = useAnalyticsStore();

  const { data: summaryData, isLoading: isSummaryLoading } = useAnalyticsSummary(selectedMonth, selectedYear);
  const { data: categoryData, isLoading: isCategoryLoading } = useAnalyticsCategory(selectedMonth, selectedYear, "EXPENSE");
  const { data: trendData, isLoading: isTrendLoading } = useAnalyticsTrend(selectedYear);
  const { data: heatmapData, isLoading: isHeatmapLoading } = useAnalyticsHeatmap(selectedYear);
  const { data: topExpensesData, isLoading: isTopExpensesLoading } = useAnalyticsTopExpenses(selectedMonth, selectedYear, 5);

  return (
    <div className="flex flex-col min-h-full bg-background">
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground leading-8 tracking-tight">
              Tổng quan
            </h1>
            <p className="text-sm text-muted-foreground mt-1 leading-5">
              Phân tích và theo dõi tình hình tài chính của bạn
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AnalyticsFilters />
            <ExportReportButton />
          </div>
        </div>

        {/* 1. Summary Cards */}
        <DashboardSummary data={summaryData} isLoading={isSummaryLoading} />

        {/* 2. Charts Row (Category & Trend) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="min-w-0">
            <CategoryBreakdownChart data={categoryData} isLoading={isCategoryLoading} />
          </div>
          <div className="min-w-0">
            <MonthlyTrendChart data={trendData} isLoading={isTrendLoading} />
          </div>
        </div>

        {/* 3. Heatmap & Top Expenses Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          <div className="min-w-0">
            <DailyHeatmap data={heatmapData} isLoading={isHeatmapLoading} year={selectedYear} />
          </div>
          <div className="min-w-0">
            <TopExpensesList data={topExpensesData} isLoading={isTopExpensesLoading} />
          </div>
        </div>
        
      </div>
    </div>
  );
}

