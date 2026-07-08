import { TransactionTypeEnum } from '@prisma/client';

import { AnalyticsRepository } from './analytics.repository';
import {
	CategoryBreakdownResponseDto,
	DailyHeatmapResponseDto,
	MonthlySummaryResponseDto,
	MonthlyTrendResponseDto,
	TopExpenseResponseDto,
} from './dtos';

import { HttpResponseBodySuccessDto } from '@/common';

export class AnalyticsService {
	constructor(private readonly analyticsRepository = new AnalyticsRepository()) {}

	async getMonthlySummary({
		userId,
		month,
		year,
	}: {
		userId: string;
		month: number;
		year: number;
	}): Promise<HttpResponseBodySuccessDto<MonthlySummaryResponseDto>> {
		const current = await this.analyticsRepository.getMonthlySummaryRaw(
			userId,
			month,
			year,
		);

		let prevMonth = month - 1;
		let prevYear = year;
		if (prevMonth === 0) {
			prevMonth = 12;
			prevYear = year - 1;
		}

		const previous = await this.analyticsRepository.getMonthlySummaryRaw(
			userId,
			prevMonth,
			prevYear,
		);

		const netBalance = current.totalIncome - current.totalExpense;
		const savingsRate =
			current.totalIncome > 0 ? (netBalance / current.totalIncome) * 100 : 0;

		const calcDiff = (curr: number, prev: number) => {
			if (prev === 0) return curr > 0 ? 100 : 0; // if previous was 0, it's a 100% increase (or 0% if current is also 0)
			return ((curr - prev) / prev) * 100;
		};

		const result = new MonthlySummaryResponseDto({
			month,
			year,
			totalIncome: current.totalIncome.toString(),
			totalExpense: current.totalExpense.toString(),
			netBalance: netBalance.toString(),
			savingsRate: Number(savingsRate.toFixed(2)),
			expenseCount: current.expenseCount,
			incomeCount: current.incomeCount,
			comparedToLastMonth: {
				expenseDiff: Number(
					calcDiff(current.totalExpense, previous.totalExpense).toFixed(1),
				),
				incomeDiff: Number(
					calcDiff(current.totalIncome, previous.totalIncome).toFixed(1),
				),
			},
		});

		return {
			success: true,
			data: result,
		};
	}

	async getCategoryBreakdown({
		userId,
		month,
		year,
		type,
	}: {
		userId: string;
		month: number;
		year: number;
		type: TransactionTypeEnum;
	}): Promise<HttpResponseBodySuccessDto<CategoryBreakdownResponseDto[]>> {
		const grouped = await this.analyticsRepository.getCategoryBreakdown(
			userId,
			month,
			year,
			type,
		);

		const grandTotal = grouped.reduce((sum, item) => sum + item.totalAmount, 0);

		const data = grouped.map((item) => {
			const percentage = grandTotal > 0 ? (item.totalAmount / grandTotal) * 100 : 0;
			return new CategoryBreakdownResponseDto({
				category: item.category,
				totalAmount: item.totalAmount.toString(),
				transactionCount: item.transactionCount,
				percentage: Number(percentage.toFixed(2)),
			});
		});

		return {
			success: true,
			data,
		};
	}

	async getMonthlyTrend({
		userId,
		year,
	}: {
		userId: string;
		year: number;
	}): Promise<HttpResponseBodySuccessDto<MonthlyTrendResponseDto[]>> {
		const expenses = await this.analyticsRepository.getMonthlyExpenseTrendRaw(
			userId,
			year,
		);
		const incomes = await this.analyticsRepository.getMonthlyIncomeTrendRaw(
			userId,
			year,
		);

		// Transform from array to map for fast lookup
		const expenseMap = new Map(expenses.map((e) => [e.month, Number(e.total)]));
		const incomeMap = new Map(incomes.map((i) => [i.month, Number(i.total)]));

		const data: MonthlyTrendResponseDto[] = [];

		for (let m = 1; m <= 12; m++) {
			const exp = expenseMap.get(m) ?? 0;
			const inc = incomeMap.get(m) ?? 0;

			data.push(
				new MonthlyTrendResponseDto({
					month: m,
					totalExpense: exp.toString(),
					totalIncome: inc.toString(),
					netBalance: (inc - exp).toString(),
				}),
			);
		}

		return {
			success: true,
			data,
		};
	}

	async getDailyHeatmap({
		userId,
		year,
	}: {
		userId: string;
		year: number;
	}): Promise<HttpResponseBodySuccessDto<DailyHeatmapResponseDto[]>> {
		const heatmaps = await this.analyticsRepository.getDailyExpenseHeatmapRaw(
			userId,
			year,
		);

		// Note: The design says "return 365 days".
		// We'll generate all dates of the year and map the amounts.
		const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
		const daysInYear = isLeapYear ? 366 : 365;

		const heatMapDictionary = new Map(
			heatmaps.map((h) => [h.date_string, Number(h.total)]),
		);

		const data: DailyHeatmapResponseDto[] = [];
		const startDate = new Date(Date.UTC(year, 0, 1)); // Jan 1

		for (let i = 0; i < daysInYear; i++) {
			const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
			// format to YYYY-MM-DD
			const dateStr = currentDate.toISOString().split('T')[0];
			const amount = heatMapDictionary.get(dateStr) ?? 0;

			data.push(
				new DailyHeatmapResponseDto({
					date: dateStr,
					amount: amount.toString(),
				}),
			);
		}

		return {
			success: true,
			data,
		};
	}

	async getTopExpenses({
		userId,
		month,
		year,
		limit,
	}: {
		userId: string;
		month: number;
		year: number;
		limit: number;
	}): Promise<HttpResponseBodySuccessDto<TopExpenseResponseDto[]>> {
		const expenses = await this.analyticsRepository.getTopExpenses(
			userId,
			month,
			year,
			limit,
		);

		const data = expenses.map(
			(exp) =>
				new TopExpenseResponseDto({
					id: exp.id,
					title: exp.title,
					amount: exp.amount.toString(),
					date: exp.date,
					category: {
						id: exp.category.id,
						name: exp.category.name,
						icon: exp.category.icon,
						color: exp.category.color,
					},
				}),
		);

		return {
			success: true,
			data,
		};
	}
}
