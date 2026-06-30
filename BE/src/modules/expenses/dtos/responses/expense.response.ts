import { Category, Expense } from '@prisma/client';
import z from 'zod';


type CategorySummary = Pick<Category, 'id' | 'name' | 'icon' | 'color' | 'type'>;

type ExpenseWithCategory = Expense & { category: CategorySummary };


export class ExpenseResponseDto {
	id: string;
	userId: string;
	categoryId: string;
	category?: CategorySummary;
	amount: string;
	title: string;
	note: string | null;
	imageUrl: string | null;
	imagePublicId: string | null;
	date: string;
	createdAt: string;
	updatedAt: string;

	constructor(expense: Expense | ExpenseWithCategory) {
		this.id = expense.id;
		this.userId = expense.userId;
		this.categoryId = expense.categoryId;
		this.amount = expense.amount.toString();
		this.title = expense.title;
		this.note = expense.note ?? null;
		this.imageUrl = (expense as Expense & { imageUrl?: string | null }).imageUrl ?? null;
		this.imagePublicId = (expense as Expense & { imagePublicId?: string | null }).imagePublicId ?? null;
		this.date = expense.date.toISOString();
		this.createdAt = expense.createdAt.toISOString();
		this.updatedAt = expense.updatedAt.toISOString();

		if ('category' in expense && expense.category) {
			this.category = expense.category;
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

export const expenseResponseDtoSchema = z.object({
	id: z.string(),
	userId: z.string(),
	categoryId: z.string(),
	category: categorySummarySchema.optional(),
	amount: z.string(),
	title: z.string(),
	note: z.string().nullable(),
	imageUrl: z.string().nullable(),
	imagePublicId: z.string().nullable(),
	date: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
