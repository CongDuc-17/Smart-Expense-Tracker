import z from 'zod';

export const categoryChartItemSchema = z.object({
	categoryId: z.string(),
	name: z.string(),
	icon: z.string(),
	color: z.string(),
	amount: z.string(),
});

export const monthlyTrendItemSchema = z.object({
	label: z.string(),
	income: z.string(),
	expense: z.string(),
});

export const analyticsSummaryResponseDtoSchema = z.object({
	totalIncome: z.string(),
	totalExpense: z.string(),
	budgetLimit: z.string(),
	budgetSpent: z.string(),
	budgetAlertCount: z.number(),
	totalGoalTarget: z.string(),
	totalGoalSaved: z.string(),
	savingsCompleted: z.number(),
	expenseByCategory: z.array(categoryChartItemSchema),
	monthlyTrend: z.array(monthlyTrendItemSchema),
});
