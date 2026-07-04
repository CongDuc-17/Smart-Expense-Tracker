import z from 'zod';

import { ZodValidationSchema } from '@/common';

export const savingGoalIdParamsSchema = z.object({
	id: z.string().cuid('ID không hợp lệ'),
});

export const getSavingGoalsQueryObjectSchema = z.object({});
export const getSavingGoalsQueryValidationSchema: ZodValidationSchema = {
	query: getSavingGoalsQueryObjectSchema,
};

export class CreateSavingGoalDto {
	title!: string;
	targetAmount!: number;
	deadline?: Date;
	note?: string;
}

export const createSavingGoalBodySchema = z.object({
	title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự'),
	targetAmount: z
		.number({ message: 'targetAmount phải là số' })
		.positive('Số tiền mục tiêu phải lớn hơn 0')
		.max(999_999_999, 'Số tiền mục tiêu quá lớn'),
	deadline: z.coerce.date().optional(),
	note: z.string().max(500).optional(),
});

export const createSavingGoalValidationSchema: ZodValidationSchema = {
	body: createSavingGoalBodySchema,
};

export const createSavingGoalRequestSchema = {
	body: {
		description: 'Tạo mục tiêu tiết kiệm mới',
		content: {
			'application/json': {
				schema: createSavingGoalBodySchema,
			},
		},
	},
};

export class UpdateSavingGoalDto {
	title?: string;
	targetAmount?: number;
	deadline?: Date;
	note?: string;
}

export const updateSavingGoalBodySchema = z
	.object({
		title: z.string().min(3).optional(),
		targetAmount: z
			.number({ message: 'targetAmount phải là số' })
			.positive('Số tiền mục tiêu phải lớn hơn 0')
			.max(999_999_999)
			.optional(),
		deadline: z.coerce.date().optional(),
		note: z.string().max(500).optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'Cần ít nhất một trường để cập nhật',
	});

export const updateSavingGoalValidationSchema: ZodValidationSchema = {
	params: savingGoalIdParamsSchema,
	body: updateSavingGoalBodySchema,
};

export const updateSavingGoalRequestSchema = {
	body: {
		description: 'Cập nhật mục tiêu tiết kiệm',
		content: {
			'application/json': {
				schema: updateSavingGoalBodySchema,
			},
		},
	},
};

export class CreateSavingDepositDto {
	amount!: number;
	note?: string;
}

export const createSavingDepositBodySchema = z.object({
	amount: z
		.number({ message: 'amount phải là số' })
		.positive('Số tiền nạp vào phải lớn hơn 0')
		.max(999_999_999, 'Số tiền nạp quá lớn'),
	note: z.string().max(500).optional(),
});

export const createSavingDepositValidationSchema: ZodValidationSchema = {
	params: savingGoalIdParamsSchema,
	body: createSavingDepositBodySchema,
};

export const createSavingDepositRequestSchema = {
	body: {
		description: 'Nạp tiền vào mục tiêu tiết kiệm',
		content: {
			'application/json': {
				schema: createSavingDepositBodySchema,
			},
		},
	},
};
