import z from 'zod';

import { ZodValidationSchema } from '@/common';

// ─── Shared param schema ──────────────────────────────────────────────────────

export const budgetIdParamsSchema = z.object({
	id: z.string().cuid('ID không hợp lệ'),
});

// ─── GET /budgets ─────────────────────────────────────────────────────────────

export const getBudgetsQueryObjectSchema = z.object({
	month: z.coerce.number().int().min(1).max(12),
	year: z.coerce.number().int().min(2020).max(2100),
});

export const getBudgetsQueryValidationSchema: ZodValidationSchema = {
	query: getBudgetsQueryObjectSchema,
};

// ─── POST /budgets ────────────────────────────────────────────────────────────

export class CreateBudgetDto {
	categoryId: string;
	limitAmount: number;
	month: number;
	year: number;
}

export const createBudgetBodySchema = z.object({
	categoryId: z.string().cuid('categoryId không hợp lệ'),
	limitAmount: z
		.number({ message: 'limitAmount phải là số' })
		.positive('Hạn mức phải lớn hơn 0')
		.max(999_999_999, 'Hạn mức vượt quá giới hạn'),
	month: z.number().int().min(1).max(12),
	year: z.number().int().min(2020).max(2100),
});

export const createBudgetValidationSchema: ZodValidationSchema = {
	body: createBudgetBodySchema,
};

export const createBudgetRequestSchema = {
	body: {
		description: 'Tạo hạn mức chi tiêu (Budget)',
		content: {
			'application/json': {
				schema: createBudgetBodySchema,
			},
		},
	},
};

// ─── PATCH /budgets/:id ───────────────────────────────────────────────────────

export class UpdateBudgetDto {
	limitAmount?: number;
}

export const updateBudgetBodyObjectSchema = z.object({
	limitAmount: z
		.number({ message: 'limitAmount phải là số' })
		.positive('Hạn mức phải lớn hơn 0')
		.max(999_999_999)
		.optional(),
});

export const updateBudgetBodySchema = updateBudgetBodyObjectSchema.refine(
	(data) => Object.values(data).some((v) => v !== undefined),
	{ message: 'Cần ít nhất một trường để cập nhật' },
);

export const updateBudgetValidationSchema: ZodValidationSchema = {
	params: budgetIdParamsSchema,
	body: updateBudgetBodySchema,
};

export const updateBudgetRequestSchema = {
	body: {
		description: 'Cập nhật hạn mức chi tiêu',
		content: {
			'application/json': {
				schema: updateBudgetBodyObjectSchema,
			},
		},
	},
};

// ─── DELETE /budgets/:id ──────────────────────────────────────────────────────

export const deleteBudgetValidationSchema: ZodValidationSchema = {
	params: budgetIdParamsSchema,
};
