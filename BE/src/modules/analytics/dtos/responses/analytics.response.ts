import z from 'zod';

// ─── Monthly Summary ──────────────────────────────────────────────────────────

export class MonthlySummaryResponseDto {
	month: number;
	year: number;
	totalIncome: string;
	totalExpense: string;
	netBalance: string;
	savingsRate: number;
	expenseCount: number;
	incomeCount: number;
	comparedToLastMonth?: {
		expenseDiff: number;
		incomeDiff: number;
	};

	constructor(data: Partial<MonthlySummaryResponseDto>) {
		Object.assign(this, data);
	}
}

export const monthlySummaryResponseSchema = z.object({
	month: z.number(),
	year: z.number(),
	totalIncome: z.string(),
	totalExpense: z.string(),
	netBalance: z.string(),
	savingsRate: z.number(),
	expenseCount: z.number(),
	incomeCount: z.number(),
	comparedToLastMonth: z
		.object({
			expenseDiff: z.number(),
			incomeDiff: z.number(),
		})
		.optional(),
});

// ─── Category Breakdown ───────────────────────────────────────────────────────

export class CategoryBreakdownResponseDto {
	category: {
		id: string;
		name: string;
		icon: string;
		color: string;
	};
	totalAmount: string;
	transactionCount: number;
	percentage: number;

	constructor(data: Partial<CategoryBreakdownResponseDto>) {
		Object.assign(this, data);
	}
}

export const categoryBreakdownResponseSchema = z.object({
	category: z.object({
		id: z.string(),
		name: z.string(),
		icon: z.string(),
		color: z.string(),
	}),
	totalAmount: z.string(),
	transactionCount: z.number(),
	percentage: z.number(),
});

// ─── Monthly Trend ────────────────────────────────────────────────────────────

export class MonthlyTrendResponseDto {
	month: number;
	totalIncome: string;
	totalExpense: string;
	netBalance: string;

	constructor(data: Partial<MonthlyTrendResponseDto>) {
		Object.assign(this, data);
	}
}

export const monthlyTrendResponseSchema = z.object({
	month: z.number(),
	totalIncome: z.string(),
	totalExpense: z.string(),
	netBalance: z.string(),
});

// ─── Daily Heatmap ────────────────────────────────────────────────────────────

export class DailyHeatmapResponseDto {
	date: string; // YYYY-MM-DD
	amount: string;

	constructor(data: Partial<DailyHeatmapResponseDto>) {
		Object.assign(this, data);
	}
}

export const dailyHeatmapResponseSchema = z.object({
	date: z.string(),
	amount: z.string(),
});

// ─── Top Expenses ─────────────────────────────────────────────────────────────

export class TopExpenseResponseDto {
	id: string;
	title: string;
	amount: string;
	date: Date;
	category: {
		id: string;
		name: string;
		icon: string;
		color: string;
	};

	constructor(data: Partial<TopExpenseResponseDto>) {
		Object.assign(this, data);
	}
}

export const topExpenseResponseSchema = z.object({
	id: z.string(),
	title: z.string(),
	amount: z.string(),
	date: z.date(),
	category: z.object({
		id: z.string(),
		name: z.string(),
		icon: z.string(),
		color: z.string(),
	}),
});
