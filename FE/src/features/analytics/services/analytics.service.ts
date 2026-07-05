import { apiClient } from "@/lib/apiClient";
import type {
  MonthlySummary,
  CategoryBreakdownItem,
  MonthlyTrendItem,
  DailyHeatmapItem,
  TopExpenseItem,
} from "../types/analytics.types";

class AnalyticsService {
  async getMonthlySummary(month: number, year: number) {
    const res = await apiClient.get<{ data: MonthlySummary }>(
      "/analytics/summary",
      { params: { month, year } }
    );
    return res.data;
  }

  async getCategoryBreakdown(month: number, year: number, type: "EXPENSE" | "INCOME" = "EXPENSE") {
    const res = await apiClient.get<{ data: CategoryBreakdownItem[] }>(
      "/analytics/by-category",
      { params: { month, year, type } }
    );
    return res.data;
  }

  async getMonthlyTrend(year: number) {
    const res = await apiClient.get<{ data: MonthlyTrendItem[] }>(
      "/analytics/monthly-trend",
      { params: { year } }
    );
    return res.data;
  }

  async getDailyHeatmap(year: number) {
    const res = await apiClient.get<{ data: DailyHeatmapItem[] }>(
      "/analytics/heatmap",
      { params: { year } }
    );
    return res.data;
  }

  async getTopExpenses(month: number, year: number, limit: number = 5) {
    const res = await apiClient.get<{ data: TopExpenseItem[] }>(
      "/analytics/top-expenses",
      { params: { month, year, limit } }
    );
    return res.data;
  }
}

export const analyticsService = new AnalyticsService();
