import { z } from 'zod';

import { ZodValidationSchema } from '@/common';

export const verifyOcrSchema: ZodValidationSchema = {
	params: z.object({
		id: z.string().cuid('ID không hợp lệ'),
	}),
	body: z.object({
		merchantName: z.string().min(1).max(200).optional(),
		totalAmount: z.number().positive().optional(),
		transactionDate: z.string().datetime().optional(),
		applyToExpenseId: z.string().cuid('Expense ID không hợp lệ').optional(),
	}),
};

export const aiInsightsQuerySchema: ZodValidationSchema = {
	query: z.object({
		month: z.coerce
			.number()
			.int()
			.min(1, 'Tháng phải từ 1 đến 12')
			.max(12, 'Tháng phải từ 1 đến 12'),
		year: z.coerce
			.number()
			.int()
			.min(2020, 'Năm không hợp lệ')
			.max(2100, 'Năm không hợp lệ'),
	}),
};

export const previewClassificationSchema: ZodValidationSchema = {
	body: z.object({
		imageUrl: z.string().url('imageUrl không hợp lệ'),
	}),
};
