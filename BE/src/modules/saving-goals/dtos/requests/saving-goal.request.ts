import z from 'zod';

import { ZodValidationSchema } from '@/common';

// ─── Shared param schema ──────────────────────────────────────────────────────

export const savingGoalIdParamsSchema = z.object({
	id: z.string().cuid('ID không hợp lệ'),
});

// ─── GET /saving-goals ────────────────────────────────────────────────────────

export const getSavingGoalsQueryObjectSchema = z.object({
	isCompleted: z
		.string()
		.optional()
		.transform((val) => {
			if (val === 'true') return true;
			if (val === 'false') return false;
			return undefined;
		}),
});

export const getSavingGoalsQueryValidationSchema: ZodValidationSchema = {
	query: getSavingGoalsQueryObjectSchema,
};

// ─── POST /saving-goals ───────────────────────────────────────────────────────

export class CreateSavingGoalDto {
	title: string;
	targetAmount: number;
	deadline?: Date | null;
	note?: string | null;
}

export const createSavingGoalBodySchema = z.object({
	title: z.string().min(2, 'Tiêu đề quá ngắn').max(100, 'Tiêu đề quá dài'),
	targetAmount: z
		.number({ message: 'targetAmount phải là số' })
		.positive('Số tiền mục tiêu phải lớn hơn 0')
		.max(10_000_000_000, 'Số tiền quá lớn'),
	deadline: z
		.string()
		.datetime({ message: 'Deadline phải là định dạng ISO 8601 hợp lệ' })
		.optional()
		.nullable(),
	note: z.string().max(500, 'Ghi chú quá dài').optional().nullable(),
});

export const createSavingGoalValidationSchema: ZodValidationSchema = {
	body: createSavingGoalBodySchema,
};

export const createSavingGoalRequestSchema = {
	body: {
		description: 'Tạo mục tiêu tiết kiệm',
		content: {
			'application/json': {
				schema: createSavingGoalBodySchema,
			},
		},
	},
};

// ─── PATCH /saving-goals/:id ──────────────────────────────────────────────────

export class UpdateSavingGoalDto {
	title?: string;
	targetAmount?: number;
	deadline?: Date | null;
	note?: string | null;
}

export const updateSavingGoalBodyObjectSchema = z.object({
	title: z.string().min(2).max(100).optional(),
	targetAmount: z
		.number({ message: 'targetAmount phải là số' })
		.positive('Số tiền mục tiêu phải lớn hơn 0')
		.max(10_000_000_000)
		.optional(),
	deadline: z
		.string()
		.datetime({ message: 'Deadline phải là định dạng ISO 8601 hợp lệ' })
		.optional()
		.nullable(),
	note: z.string().max(500).optional().nullable(),
});

export const updateSavingGoalBodySchema = updateSavingGoalBodyObjectSchema.refine(
	(data) => Object.keys(data).length > 0,
	{ message: 'Cần ít nhất một trường để cập nhật' },
);

export const updateSavingGoalValidationSchema: ZodValidationSchema = {
	params: savingGoalIdParamsSchema,
	body: updateSavingGoalBodySchema,
};

export const updateSavingGoalRequestSchema = {
	body: {
		description: 'Cập nhật mục tiêu tiết kiệm',
		content: {
			'application/json': {
				schema: updateSavingGoalBodyObjectSchema,
			},
		},
	},
};

// ─── DELETE /saving-goals/:id ─────────────────────────────────────────────────

export const deleteSavingGoalValidationSchema: ZodValidationSchema = {
	params: savingGoalIdParamsSchema,
};

// ─── PATCH /saving-goals/:id/deposit ──────────────────────────────────────────

export class DepositSavingGoalDto {
	amount: number;
	note?: string | null;
}

export const depositSavingGoalBodySchema = z.object({
	amount: z
		.number({ message: 'amount phải là số' })
		.positive('Số tiền nạp phải lớn hơn 0')
		.max(10_000_000_000),
	note: z.string().max(200, 'Ghi chú quá dài').optional().nullable(),
});

export const depositSavingGoalValidationSchema: ZodValidationSchema = {
	params: savingGoalIdParamsSchema,
	body: depositSavingGoalBodySchema,
};

export const depositSavingGoalRequestSchema = {
	body: {
		description: 'Nạp tiền vào mục tiêu tiết kiệm',
		content: {
			'application/json': {
				schema: depositSavingGoalBodySchema,
			},
		},
	},
};
