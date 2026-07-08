import z from 'zod';

import { ZodValidationSchema } from '@/common';

export const incomeIdParamsSchema = z.object({
	id: z.string().cuid('ID không hợp lệ'),
});

export const getIncomesQueryObjectSchema = z.object({
	month: z.coerce.number().int().min(1).max(12).optional(),
	year: z.coerce.number().int().min(2000).max(2100).optional(),
	categoryId: z.string().cuid().optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getIncomesQueryValidationSchema: ZodValidationSchema = {
	query: getIncomesQueryObjectSchema,
};

export const getIncomeByIdValidationSchema: ZodValidationSchema = {
	params: incomeIdParamsSchema,
};

export class CreateIncomeDto {
	categoryId: string;
	amount: number;
	title: string;
	note?: string;
	date: string;
}

export const createIncomeBodySchema = z.object({
	categoryId: z.string().cuid('categoryId không hợp lệ'),
	amount: z.number({ message: 'amount phải là số' }).positive('Số tiền phải lớn hơn 0'),
	title: z
		.string()
		.min(2, 'Tiêu đề phải có ít nhất 2 ký tự')
		.max(255, 'Tiêu đề không được vượt quá 255 ký tự'),
	note: z.string().max(1000, 'Ghi chú không được vượt quá 1000 ký tự').optional(),
	date: z.string().datetime({ message: 'Định dạng ngày không hợp lệ (ISO 8601)' }),
});

export const createIncomeValidationSchema: ZodValidationSchema = {
	body: createIncomeBodySchema,
};

export const createIncomeRequestSchema = {
	body: {
		description: 'Tạo khoản thu nhập mới',
		content: {
			'application/json': {
				schema: createIncomeBodySchema,
			},
		},
	},
};

export class UpdateIncomeDto {
	categoryId?: string;
	amount?: number;
	title?: string;
	note?: string;
	date?: string;
}

export const updateIncomeBodyObjectSchema = z.object({
	categoryId: z.string().cuid('categoryId không hợp lệ').optional(),
	amount: z.number().positive('Số tiền phải lớn hơn 0').optional(),
	title: z.string().min(2).max(255).optional(),
	note: z.string().max(1000).optional(),
	date: z
		.string()
		.datetime({ message: 'Định dạng ngày không hợp lệ (ISO 8601)' })
		.optional(),
});

export const updateIncomeBodySchema = updateIncomeBodyObjectSchema.refine(
	(data) => Object.values(data).some((v) => v !== undefined),
	{ message: 'Cần ít nhất một trường để cập nhật' },
);

export const updateIncomeValidationSchema: ZodValidationSchema = {
	params: incomeIdParamsSchema,
	body: updateIncomeBodySchema,
};

export const updateIncomeRequestSchema = {
	body: {
		description: 'Cập nhật khoản thu nhập',
		content: {
			'application/json': {
				schema: updateIncomeBodyObjectSchema,
			},
		},
	},
};

export const deleteIncomeValidationSchema: ZodValidationSchema = {
	params: incomeIdParamsSchema,
};
