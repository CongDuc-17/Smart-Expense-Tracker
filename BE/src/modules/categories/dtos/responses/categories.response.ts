import { TransactionTypeEnum } from '@prisma/client';
import z from 'zod';

export class CategoryResponseDto {
	id: string;
	name: string;
	type: TransactionTypeEnum;
	icon: string;
	color: string;
	isDefault: boolean;
	_count: {
		expenses: number;
		incomes: number;
		budgets: number;
	};

	constructor(category: any) {
		this.id = category.id;
		this.name = category.name;
		this.type = category.type;
		this.icon = category.icon;
		this.color = category.color;
		this.isDefault = category.isDefault;
		this._count = category._count;
	}
}

export const categoryResponseDtoSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.nativeEnum(TransactionTypeEnum),
	icon: z.string(),
	color: z.string(),
	isDefault: z.boolean(),
	_count: z.object({
		expenses: z.number(),
		incomes: z.number(),
		budgets: z.number(),
	}),
});
