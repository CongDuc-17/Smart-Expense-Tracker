import z from 'zod';

import { ZodValidationSchema } from '@/common';


export const expenseIdParamsSchema = z.object({
	id: z.string().cuid('ID không hợp lệ'),
});


export const getExpensesQueryObjectSchema = z.object({
	month: z.coerce.number().int().min(1).max(12).optional(),
	year: z.coerce.number().int().min(2000).max(2100).optional(),
	categoryId: z.string().cuid().optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getExpensesQueryValidationSchema: ZodValidationSchema = {
	query: getExpensesQueryObjectSchema,
};


export const getExpenseByIdValidationSchema: ZodValidationSchema = {
	params: expenseIdParamsSchema,
};


export class CreateExpenseDto {
	categoryId: string;
	amount: number;
	title: string;
	note?: string;
	date: string;
	imageUrl?: string;
	imagePublicId?: string;
}

export const createExpenseBodySchema = z.object({
	categoryId: z.string().cuid('categoryId không hợp lệ'),
	amount: z
		.number({ message: 'amount phải là số' })
		.positive('Số tiền phải lớn hơn 0'),
	title: z
		.string()
		.min(2, 'Tiêu đề phải có ít nhất 2 ký tự')
		.max(255, 'Tiêu đề không được vượt quá 255 ký tự'),
	note: z.string().max(1000, 'Ghi chú không được vượt quá 1000 ký tự').optional(),
	date: z.string().datetime({ message: 'Định dạng ngày không hợp lệ (ISO 8601)' }),
	imageUrl: z.string().url('imageUrl không hợp lệ').optional(),
	imagePublicId: z.string().optional(),
});

export const createExpenseValidationSchema: ZodValidationSchema = {
	body: createExpenseBodySchema,
};

export const createExpenseRequestSchema = {
	body: {
		description: 'Tạo khoản chi tiêu mới',
		content: {
			'application/json': {
				schema: createExpenseBodySchema,
			},
		},
	},
};


export class UpdateExpenseDto {
	categoryId?: string;
	amount?: number;
	title?: string;
	note?: string;
	date?: string;
	imageUrl?: string;
	imagePublicId?: string;
}

export const updateExpenseBodyObjectSchema = z.object({
	categoryId: z.string().cuid('categoryId không hợp lệ').optional(),
	amount: z.number().positive('Số tiền phải lớn hơn 0').optional(),
	title: z.string().min(2).max(255).optional(),
	note: z.string().max(1000).optional(),
	date: z.string().datetime({ message: 'Định dạng ngày không hợp lệ (ISO 8601)' }).optional(),
	imageUrl: z.string().url().optional(),
	imagePublicId: z.string().optional(),
});


export const updateExpenseBodySchema = updateExpenseBodyObjectSchema.refine(
	(data) => Object.values(data).some((v) => v !== undefined),
	{ message: 'Cần ít nhất một trường để cập nhật' },
);

export const updateExpenseValidationSchema: ZodValidationSchema = {
	params: expenseIdParamsSchema,
	body: updateExpenseBodySchema,
};

export const updateExpenseRequestSchema = {
	body: {
		description: 'Cập nhật khoản chi tiêu',
		content: {
			'application/json': {
				schema: updateExpenseBodyObjectSchema,
			},
		},
	},
};


export const deleteExpenseValidationSchema: ZodValidationSchema = {
	params: expenseIdParamsSchema,
};
