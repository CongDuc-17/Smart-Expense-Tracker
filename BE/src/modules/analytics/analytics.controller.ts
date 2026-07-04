import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpResponseDto } from '@/common';
import { AnalyticsService } from './analytics.service';

export class AnalyticsController {
  private readonly analyticsService = new AnalyticsService();

  async getSummary(req: Request) {
    const { month, year } = req.query as { month: string; year: string };
    const { id: userId } = req.user as { id: string };

    const summary = await this.analyticsService.getSummary({
      userId,
      month: Number(month),
      year: Number(year),
    });

    return new HttpResponseDto().success({
      success: true,
      data: summary,
    });
  }

  // Sửa lại dùng HttpResponseDto cho đồng bộ
  async getMonthlyComparison(req: Request) {
    const data = await this.analyticsService.getMonthlyComparison(req.query);
    return new HttpResponseDto().success({
      success: true,
      data: data,
    });
  }

  // Sửa lại dùng HttpResponseDto cho đồng bộ
  async getHeatmap(req: Request) {
    const data = await this.analyticsService.getHeatmap(req.query);
    return new HttpResponseDto().success({
      success: true,
      data: data,
    });
  }

  async exportReport(req: Request, res: Response) {
    const { month, year } = req.query as { month: string; year: string };
    const { id: userId } = req.user as { id: string };
    const csv = await this.analyticsService.exportCsvReport({
      userId,
      month: Number(month),
      year: Number(year),
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expense-report.csv"');
    return res.send(csv);
  }
}