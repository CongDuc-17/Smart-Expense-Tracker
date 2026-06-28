import { Category, Income } from '@prisma/client';
import z from 'zod';

type CategorySummary = Pick<Category, 'id' | 'name' | 'icon' | 'color' | 'type'>;

type IncomeWithCategory = Income & { category: CategorySummary };

export class IncomeResponseDto {
	id: string;
	userId: string;
	categoryId: string;
	category?: CategorySummary;
	amount: string;
	title: string;
	note: string | null;
	date: string;
	createdAt: string;
	updatedAt: string;

	constructor(income: Income | IncomeWithCategory) {
		this.id = income.id;
		this.userId = income.userId;
		this.categoryId = income.categoryId;
		this.amount = income.amount.toString();
		this.title = income.title;
		this.note = income.note ?? null;
		this.date = income.date.toISOString();
		this.createdAt = income.createdAt.toISOString();
		this.updatedAt = income.updatedAt.toISOString();

		if ('category' in income && income.category) {
			this.category = income.category;
		}
	}
}

export const categorySummarySchema = z.object({
	id: z.string(),
	name: z.string(),
	icon: z.string(),
	color: z.string(),
	type: z.string(),
});

export const incomeResponseDtoSchema = z.object({
	id: z.string(),
	userId: z.string(),
	categoryId: z.string(),
	category: categorySummarySchema.optional(),
	amount: z.string(),
	title: z.string(),
	note: z.string().nullable(),
	date: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
