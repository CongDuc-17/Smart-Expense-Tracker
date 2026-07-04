import { TransactionTypeEnum } from '@prisma/client';
import { Request } from 'express';

import { HttpResponseDto } from '@/common';
import { UserInformationDto } from '@/modules/users/dtos';

import { AnalyticsService } from './analytics.service';

export class AnalyticsController {
	constructor(private readonly analyticsService = new AnalyticsService()) {}

	async getMonthlySummary(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const month = Number(req.query.month);
		const year = Number(req.query.year);

		const result = await this.analyticsService.getMonthlySummary({ userId, month, year });
		return new HttpResponseDto().success(result);
	}

	async getCategoryBreakdown(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const month = Number(req.query.month);
		const year = Number(req.query.year);
		const type = req.query.type as TransactionTypeEnum;

		const result = await this.analyticsService.getCategoryBreakdown({
			userId,
			month,
			year,
			type,
		});
		return new HttpResponseDto().success(result);
	}

	async getMonthlyTrend(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const year = Number(req.query.year);

		const result = await this.analyticsService.getMonthlyTrend({ userId, year });
		return new HttpResponseDto().success(result);
	}

	async getDailyHeatmap(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const year = Number(req.query.year);

		const result = await this.analyticsService.getDailyHeatmap({ userId, year });
		return new HttpResponseDto().success(result);
	}

	async getTopExpenses(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const month = Number(req.query.month);
		const year = Number(req.query.year);
		const limit = Number(req.query.limit);

		const result = await this.analyticsService.getTopExpenses({ userId, month, year, limit });
		return new HttpResponseDto().success(result);
	}
}
