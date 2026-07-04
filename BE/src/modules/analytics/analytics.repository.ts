import { Prisma, TransactionTypeEnum } from '@prisma/client';

import { PrismaService } from '../database';

export class AnalyticsRepository {
	constructor(private readonly prismaService = new PrismaService()) {}

	async getMonthlySummaryRaw(userId: string, month: number, year: number) {
		const startOfMonth = new Date(year, month - 1, 1);
		const endOfMonth = new Date(year, month, 1);

		const [expenseResult, incomeResult, expenseCount, incomeCount] =
			await this.prismaService.$transaction([
				this.prismaService.expense.aggregate({
					where: { userId, deletedAt: null, date: { gte: startOfMonth, lt: endOfMonth } },
					_sum: { amount: true },
				}),
				this.prismaService.income.aggregate({
					where: { userId, deletedAt: null, date: { gte: startOfMonth, lt: endOfMonth } },
					_sum: { amount: true },
				}),
				this.prismaService.expense.count({
					where: { userId, deletedAt: null, date: { gte: startOfMonth, lt: endOfMonth } },
				}),
				this.prismaService.income.count({
					where: { userId, deletedAt: null, date: { gte: startOfMonth, lt: endOfMonth } },
				}),
			]);

		return {
			totalExpense: Number(expenseResult._sum.amount ?? 0),
			totalIncome: Number(incomeResult._sum.amount ?? 0),
			expenseCount,
			incomeCount,
		};
	}

	async getCategoryBreakdown(
		userId: string,
		month: number,
		year: number,
		type: TransactionTypeEnum,
	) {
		const startOfMonth = new Date(year, month - 1, 1);
		const endOfMonth = new Date(year, month, 1);

		let grouped: any[] = [];

		if (type === TransactionTypeEnum.EXPENSE) {
			const expenseGrouped = await this.prismaService.expense.groupBy({
				by: ['categoryId'],
				where: { userId, deletedAt: null, date: { gte: startOfMonth, lt: endOfMonth } },
				_sum: { amount: true },
				_count: { id: true },
			});
			grouped = expenseGrouped;
		} else if (type === TransactionTypeEnum.INCOME) {
			const incomeGrouped = await this.prismaService.income.groupBy({
				by: ['categoryId'],
				where: { userId, deletedAt: null, date: { gte: startOfMonth, lt: endOfMonth } },
				_sum: { amount: true },
				_count: { id: true },
			});
			grouped = incomeGrouped;
		}

		// Sort descending by amount in JS to avoid Prisma TS strict type inference issues
		grouped.sort((a, b) => {
			const aAmt = Number(a._sum.amount ?? 0);
			const bAmt = Number(b._sum.amount ?? 0);
			return bAmt - aAmt;
		});

		if (grouped.length === 0) return [];

		// Load category details
		const categories = await this.prismaService.category.findMany({
			where: { id: { in: grouped.map((g) => g.categoryId) } },
			select: { id: true, name: true, icon: true, color: true },
		});

		return grouped.map((g) => ({
			category: categories.find((c) => c.id === g.categoryId)!,
			totalAmount: Number(g._sum.amount ?? 0),
			transactionCount: g._count.id,
		})).filter(g => g.category !== undefined); // Ensure category exists (handles edge cases like deleted category if not cascaded)
	}

	async getMonthlyExpenseTrendRaw(userId: string, year: number) {
		// Postgres EXTRACT(MONTH FROM date)
		return this.prismaService.$queryRaw<
			{ month: number; total: Prisma.Decimal }[]
		>`
			SELECT 
				EXTRACT(MONTH FROM date)::integer as month,
				SUM(amount) as total
			FROM expenses
			WHERE "userId" = ${userId}
				AND EXTRACT(YEAR FROM date) = ${year}
				AND deleted_at IS NULL
			GROUP BY EXTRACT(MONTH FROM date)
			ORDER BY month
		`;
	}

	async getMonthlyIncomeTrendRaw(userId: string, year: number) {
		return this.prismaService.$queryRaw<
			{ month: number; total: Prisma.Decimal }[]
		>`
			SELECT 
				EXTRACT(MONTH FROM date)::integer as month,
				SUM(amount) as total
			FROM incomes
			WHERE "userId" = ${userId}
				AND EXTRACT(YEAR FROM date) = ${year}
				AND deleted_at IS NULL
			GROUP BY EXTRACT(MONTH FROM date)
			ORDER BY month
		`;
	}

	async getDailyExpenseHeatmapRaw(userId: string, year: number) {
		// Using TO_CHAR to format as YYYY-MM-DD
		return this.prismaService.$queryRaw<
			{ date_string: string; total: Prisma.Decimal }[]
		>`
			SELECT 
				TO_CHAR(date, 'YYYY-MM-DD') as date_string,
				SUM(amount) as total
			FROM expenses
			WHERE "userId" = ${userId}
				AND EXTRACT(YEAR FROM date) = ${year}
				AND deleted_at IS NULL
			GROUP BY TO_CHAR(date, 'YYYY-MM-DD')
			ORDER BY date_string
		`;
	}

	async getTopExpenses(userId: string, month: number, year: number, limit: number) {
		const startOfMonth = new Date(year, month - 1, 1);
		const endOfMonth = new Date(year, month, 1);

		return this.prismaService.expense.findMany({
			where: {
				userId,
				deletedAt: null,
				date: { gte: startOfMonth, lt: endOfMonth },
			},
			orderBy: { amount: 'desc' },
			take: limit,
			include: { category: true },
		});
	}
}
