import { Budget, BudgetAlertStatusEnum, Category } from '@prisma/client';
import z from 'zod';

// ─── Category summary (embed trong Budget response) ─────────────────────────

type CategorySummary = Pick<Category, 'id' | 'name' | 'icon' | 'color' | 'type'>;

type BudgetWithCategory = Budget & { category: CategorySummary };

// ─── Response DTO class ───────────────────────────────────────────────────────

export class BudgetResponseDto {
	id: string;
	categoryId: string;
	category?: CategorySummary;
	limitAmount: string; // Decimal → string
	spentAmount: string; // Decimal → string
	remainingAmount: string; // Computed
	percentage: number; // Computed
	alertStatus: BudgetAlertStatusEnum;
	month: number;
	year: number;

	constructor(budget: Budget | BudgetWithCategory) {
		this.id = budget.id;
		this.categoryId = budget.categoryId;
		this.month = budget.month;
		this.year = budget.year;
		this.alertStatus = budget.alertStatus;

		// Handle Decimals
		const limit = Number(budget.limitAmount);
		const spent = Number(budget.spentAmount);

		this.limitAmount = budget.limitAmount.toString();
		this.spentAmount = budget.spentAmount.toString();

		// Compute fields
		this.remainingAmount = (limit - spent).toString();
		this.percentage = limit > 0 ? Number(((spent / limit) * 100).toFixed(2)) : 0;

		if ('category' in budget && budget.category) {
			this.category = budget.category;
		}
	}
}

// ─── Zod schema (cho Swagger) ─────────────────────────────────────────────────

export const categorySummarySchema = z.object({
	id: z.string(),
	name: z.string(),
	icon: z.string(),
	color: z.string(),
	type: z.string(),
});

export const budgetResponseDtoSchema = z.object({
	id: z.string(),
	categoryId: z.string(),
	category: categorySummarySchema.optional(),
	limitAmount: z.string(),
	spentAmount: z.string(),
	remainingAmount: z.string(),
	percentage: z.number(),
	alertStatus: z.enum(['NORMAL', 'WARNING', 'EXCEEDED']),
	month: z.number(),
	year: z.number(),
});
