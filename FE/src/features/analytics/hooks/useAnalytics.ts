import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics.service";

export const analyticsKeys = {
  all: ["analytics"] as const,
  summary: (month: number, year: number) => [...analyticsKeys.all, "summary", month, year] as const,
  category: (month: number, year: number, type: string) => [...analyticsKeys.all, "category", month, year, type] as const,
  trend: (year: number) => [...analyticsKeys.all, "trend", year] as const,
  heatmap: (year: number) => [...analyticsKeys.all, "heatmap", year] as const,
  topExpenses: (month: number, year: number) => [...analyticsKeys.all, "top-expenses", month, year] as const,
} as const;

export function useAnalyticsSummary(month: number, year: number) {
  return useQuery({
    queryKey: analyticsKeys.summary(month, year),
    queryFn: () => analyticsService.getMonthlySummary(month, year),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnalyticsCategory(month: number, year: number, type: "EXPENSE" | "INCOME" = "EXPENSE") {
  return useQuery({
    queryKey: analyticsKeys.category(month, year, type),
    queryFn: () => analyticsService.getCategoryBreakdown(month, year, type),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnalyticsTrend(year: number) {
  return useQuery({
    queryKey: analyticsKeys.trend(year),
    queryFn: () => analyticsService.getMonthlyTrend(year),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnalyticsHeatmap(year: number) {
  return useQuery({
    queryKey: analyticsKeys.heatmap(year),
    queryFn: () => analyticsService.getDailyHeatmap(year),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnalyticsTopExpenses(month: number, year: number, limit: number = 5) {
  return useQuery({
    queryKey: analyticsKeys.topExpenses(month, year),
    queryFn: () => analyticsService.getTopExpenses(month, year, limit),
    staleTime: 5 * 60 * 1000,
  });
}
